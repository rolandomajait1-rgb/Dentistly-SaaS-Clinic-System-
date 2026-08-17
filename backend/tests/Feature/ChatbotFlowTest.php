<?php

namespace Tests\Feature;

use App\Models\FbPageIntegration;
use App\Models\ChatSession;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\DentalService;
use App\Models\CalendarSlot;
use App\Services\MessengerService;
use App\Services\WitAiService;
use Database\Seeders\DentalSystemSeeder;
use Mockery;
use Tests\TestCase;

class ChatbotFlowTest extends TestCase
{
    protected $messengerMock;
    protected $witAiMock;
    protected $pageId = '1095281290326467';
    protected $senderId = 'user_messenger_123';

    protected function setUp(): void
    {
        parent::setUp();

        // Seed database
        $this->seed(DentalSystemSeeder::class);

        // Update the FB integration to be active and have the expected page ID
        FbPageIntegration::query()->update([
            'is_active' => true,
            'fb_page_id' => $this->pageId,
        ]);

        // Mock MessengerService using Laravel's mock helper
        $this->messengerMock = $this->mock(MessengerService::class);
        $this->messengerMock->shouldReceive('markSeen')->andReturn(true);
        $this->messengerMock->shouldReceive('sendTypingOn')->andReturn(true);
        $this->messengerMock->shouldReceive('sendTextMessage')->andReturn(true);
        $this->messengerMock->shouldReceive('sendButtonMessage')->andReturn(true);
        $this->messengerMock->shouldReceive('sendQuickReplies')->andReturn(true);

        // Mock WitAiService using Laravel's mock helper
        $this->witAiMock = $this->mock(WitAiService::class);
    }

    public function test_webhook_verification(): void
    {
        // Resolve verify token from config
        $verifyToken = config('services.facebook.webhook_verify_token', 'dental_appointment_webhook_token');

        // Test GET verify webhook route
        $response = $this->get(route('webhook.verify', [
            'hub_mode' => 'subscribe',
            'hub_verify_token' => $verifyToken,
            'hub_challenge' => 'challenge_code_123',
        ]));

        $response->assertStatus(200);
        $response->assertSee('challenge_code_123');
    }

    public function test_complete_chatbot_booking_flow(): void
    {
        // 1. Initial State: No session exists.
        // User sends greeting "hi". It should create a session and show the main menu.
        $this->witAiMock->shouldReceive('analyze')->never(); // shouldn't analyze generic greeting

        // POST the webhook event
        $payload = [
            'object' => 'page',
            'entry' => [
                [
                    'id' => $this->pageId,
                    'time' => time(),
                    'messaging' => [
                        [
                            'sender' => ['id' => $this->senderId],
                            'recipient' => ['id' => $this->pageId],
                            'timestamp' => time(),
                            'message' => ['text' => 'hi'],
                        ]
                    ]
                ]
            ]
        ];

        // Send request (without signature verification middleware in testing, or by bypassing it)
        $response = $this->post(route('webhook.handle'), $payload);
        $response->assertStatus(200);

        // Assert session is created and current step is 'main_menu'
        $session = ChatSession::where('fb_messenger_id', $this->senderId)->first();
        $this->assertNotNull($session);
        $this->assertEquals('main_menu', $session->current_step);

        // 2. Click "Book Appointment" button (Postback: BOOK_APPOINTMENT)
        $payload = [
            'object' => 'page',
            'entry' => [
                [
                    'id' => $this->pageId,
                    'messaging' => [
                        [
                            'sender' => ['id' => $this->senderId],
                            'postback' => ['payload' => 'BOOK_APPOINTMENT'],
                        ]
                    ]
                ]
            ]
        ];
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);
        
        $session->refresh();
        $this->assertEquals('booking_category_selection', $session->current_step);

        // 2.5. Choose Category (e.g. sending "General Dentistry")
        $payload = $this->textMessagePayload('General Dentistry');
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);

        $session->refresh();
        $this->assertEquals('booking_service_selection', $session->current_step);

        // 3. Choose service: Teeth Cleaning (Postback: SELECT_SERVICE:{id})
        $service = DentalService::where('service_name', 'Teeth Cleaning')->first();
        $this->assertNotNull($service);

        $payload = [
            'object' => 'page',
            'entry' => [
                [
                    'id' => $this->pageId,
                    'messaging' => [
                        [
                            'sender' => ['id' => $this->senderId],
                            'postback' => ['payload' => "SELECT_SERVICE:{$service->id}"],
                        ]
                    ]
                ]
            ]
        ];
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);

        $session->refresh();
        $this->assertEquals('booking_webview', $session->current_step);
        $this->assertEquals($service->id, $session->getContext('booking.service_id'));

        // 4. Submit Date & Time from Webview Calendar (POST /webview/calendar/submit)
        // Ensure calendar slots exist for tomorrow
        $slotDate = now()->addDay()->format('Y-m-d');
        $slotTime = '10:00:00';
        CalendarSlot::whereDate('slot_date', $slotDate)->where('slot_time', $slotTime)->update(['status' => 'available']);

        $webviewPayload = [
            'session_id' => $session->session_id,
            'date' => $slotDate,
            'time' => '10:00',
        ];
        $this->postJson('/api/webview/calendar/submit', $webviewPayload)->assertStatus(200);

        $session->refresh();
        $this->assertEquals('booking_dpa_consent', $session->current_step);
        $this->assertEquals($slotDate, $session->getContext('booking.date'));
        $this->assertEquals('10:00:00', $session->getContext('booking.time'));

        // Agree to DPA Consent
        $payload = $this->textMessagePayload('I Agree');
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);

        $session->refresh();
        $this->assertEquals('booking_form_name', $session->current_step);

        // 5. Fill Patient Information
        
        // A. Full Name
        $payload = $this->textMessagePayload('John Doe');
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);
        $session->refresh();
        $this->assertEquals('booking_form_contact', $session->current_step);
        $this->assertEquals('John Doe', $session->getContext('booking.patient_name'));

        // B. Contact Number (invalid first)
        $payload = $this->textMessagePayload('12345');
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);
        $session->refresh();
        $this->assertEquals('booking_form_contact', $session->current_step);

        // B. Contact Number (valid)
        $payload = $this->textMessagePayload('09123456789');
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);
        $session->refresh();
        $this->assertEquals('booking_form_address', $session->current_step);
        $this->assertEquals('09123456789', $session->getContext('booking.patient_contact'));

        // C. Address
        $payload = $this->textMessagePayload('123 Quezon Ave, QC');
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);
        $session->refresh();
        $this->assertEquals('booking_form_age', $session->current_step);
        $this->assertEquals('123 Quezon Ave, QC', $session->getContext('booking.patient_address'));

        // D. Age (invalid first)
        $payload = $this->textMessagePayload('abc');
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);
        $session->refresh();
        $this->assertEquals('booking_form_age', $session->current_step);

        // D. Age (valid)
        $payload = $this->textMessagePayload('25');
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);
        $session->refresh();
        $this->assertEquals('booking_form_medical_history', $session->current_step);
        $this->assertEquals(25, $session->getContext('booking.patient_age'));

        // E. Medical History
        $payload = $this->textMessagePayload('None');
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);
        $session->refresh();
        $this->assertEquals('booking_form_reason', $session->current_step);
        $this->assertEquals('None', $session->getContext('booking.patient_medical_history'));

        // F. Reason for Visit (should show summary and confirmation buttons)
        $payload = $this->textMessagePayload('Routine cleaning checkup');
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);
        $session->refresh();
        $this->assertEquals('booking_confirmation', $session->current_step);
        $this->assertEquals('Routine cleaning checkup', $session->getContext('booking.reason'));

        // 6. Confirm Booking (Postback: CONFIRM_BOOKING)
        $payload = [
            'object' => 'page',
            'entry' => [
                [
                    'id' => $this->pageId,
                    'messaging' => [
                        [
                            'sender' => ['id' => $this->senderId],
                            'postback' => ['payload' => 'CONFIRM_BOOKING'],
                        ]
                    ]
                ]
            ]
        ];
        $this->post(route('webhook.handle'), $payload)->assertStatus(200);

        // Verify patient created
        $patient = Patient::where('fb_messenger_id', $this->senderId)->first();
        $this->assertNotNull($patient);
        $this->assertEquals('John Doe', $patient->full_name);

        // Verify appointment created
        $appointment = Appointment::where('patient_id', $patient->id)->first();
        $this->assertNotNull($appointment);
        $this->assertEquals('Pending', $appointment->status);
        $this->assertEquals($service->id, $appointment->dental_service_id);
        $this->assertEquals($slotDate, $appointment->appointment_date->format('Y-m-d'));
        $this->assertEquals('10:00:00', $appointment->appointment_time);

        // Verify slot status updated to booked
        $slot = CalendarSlot::whereDate('slot_date', $slotDate)->where('slot_time', $slotTime)->first();
        $this->assertEquals('booked', $slot->status);
        $this->assertEquals($appointment->id, $slot->appointment_id);

        // Verify booking context cleared
        $session->refresh();
        $this->assertEquals('welcome', $session->current_step);
        $this->assertEmpty($session->getContext('booking'));
    }

    public function test_chatbot_disabled_offline_message(): void
    {
        // 1. Get the clinic and disable chatbot
        $integration = FbPageIntegration::where('fb_page_id', $this->pageId)->first();
        $clinic = $integration->clinic;
        $clinic->update([
            'notification_settings' => array_merge($clinic->notification_settings ?? [], [
                'chatbot_enabled' => false,
            ])
        ]);

        // 2. Mock messenger freshly to capture sent messages
        $sentMessages = [];
        $mock = $this->mock(MessengerService::class);
        $mock->shouldReceive('markSeen')->andReturn(true);
        $mock->shouldReceive('sendTypingOn')->andReturn(true);
        $mock->shouldReceive('sendTextMessage')
            ->andReturnUsing(function ($senderId, $message, $integration) use (&$sentMessages) {
                $sentMessages[] = $message;
                return true;
            });

        // 3. POST the greeting message
        $payload = $this->textMessagePayload('hi');
        $response = $this->post(route('webhook.handle'), $payload);
        $response->assertStatus(200);

        // 4. Assert offline message was sent
        $this->assertCount(1, $sentMessages);
        $this->assertStringContainsString('offline', $sentMessages[0]);
        $this->assertStringContainsString($clinic->contact_number, $sentMessages[0]);

        // Session should NOT be created
        $session = ChatSession::where('fb_messenger_id', $this->senderId)->first();
        $this->assertNull($session);
    }

    public function test_chatbot_custom_welcome_template_and_instructions(): void
    {
        // 1. Get the clinic and configure custom welcome template & instructions
        $integration = FbPageIntegration::where('fb_page_id', $this->pageId)->first();
        $clinic = $integration->clinic;
        $clinic->update([
            'notification_settings' => array_merge($clinic->notification_settings ?? [], [
                'chatbot_enabled' => true,
                'chatbot_welcome_template' => 'Kamusta! Welcome to {clinic_name}, {patient_name}.',
                'chatbot_instructions' => 'We accept GCash at {clinic_phone}.',
            ])
        ]);

        // 2. Mock messenger freshly to capture sent messages
        $sentMessages = [];
        $mock = $this->mock(MessengerService::class);
        $mock->shouldReceive('markSeen')->andReturn(true);
        $mock->shouldReceive('sendTypingOn')->andReturn(true);
        $mock->shouldReceive('sendButtonMessage')->andReturn(true);
        $mock->shouldReceive('sendQuickReplies')->andReturn(true);
        $mock->shouldReceive('sendTextMessage')
            ->andReturnUsing(function ($senderId, $message, $integration) use (&$sentMessages) {
                $sentMessages[] = $message;
                return true;
            });

        // 3. POST the greeting message
        $payload = $this->textMessagePayload('hi');
        $response = $this->post(route('webhook.handle'), $payload);
        $response->assertStatus(200);

        // 4. Assert welcome greeting and announcement were sent
        $this->assertCount(1, $sentMessages);
        $expectedGreeting = "Kamusta! Welcome to {$clinic->clinic_name}, Valued Patient.";
        $expectedInstructions = "We accept GCash at {$clinic->contact_number}.";
        $this->assertStringContainsString($expectedGreeting, $sentMessages[0]);
        $this->assertStringContainsString($expectedInstructions, $sentMessages[0]);
        $this->assertStringContainsString('ANNOUNCEMENT:', $sentMessages[0]);

        // Session should be created
        $session = ChatSession::where('fb_messenger_id', $this->senderId)->first();
        $this->assertNotNull($session);
        $this->assertEquals('main_menu', $session->current_step);
    }

    public function test_chatbot_unknown_intent_shows_instructions(): void
    {
        // 1. Get the clinic and configure chatbot instructions
        $integration = FbPageIntegration::where('fb_page_id', $this->pageId)->first();
        $clinic = $integration->clinic;
        $clinic->update([
            'notification_settings' => array_merge($clinic->notification_settings ?? [], [
                'chatbot_enabled' => true,
                'chatbot_instructions' => 'Special promo: 10% off cleanings!',
            ])
        ]);

        // 2. We need a session already in main_menu
        $session = ChatSession::create([
            'clinic_id' => $clinic->id,
            'fb_messenger_id' => $this->senderId,
            'session_id' => \Illuminate\Support\Str::uuid(),
            'current_step' => 'main_menu',
            'context_data' => [],
            'last_interaction_at' => now(),
        ]);

        // Mock WitAi
        $this->witAiMock->shouldReceive('analyze')->andReturn(['intents' => []]);
        $this->witAiMock->shouldReceive('getTopIntent')->andReturn(null);

        // Mock messenger freshly to capture sent messages
        $sentMessages = [];
        $mock = $this->mock(MessengerService::class);
        $mock->shouldReceive('markSeen')->andReturn(true);
        $mock->shouldReceive('sendTypingOn')->andReturn(true);
        $mock->shouldReceive('sendButtonMessage')->andReturn(true);
        $mock->shouldReceive('sendQuickReplies')->andReturn(true);
        $mock->shouldReceive('sendTextMessage')
            ->andReturnUsing(function ($senderId, $message, $integration) use (&$sentMessages) {
                $sentMessages[] = $message;
                return true;
            });

        // 3. POST an unrecognized message
        $payload = $this->textMessagePayload('what is the meaning of life');
        $response = $this->post(route('webhook.handle'), $payload);
        $response->assertStatus(200);

        // 4. Assert instructions and fallback warning were sent
        $this->assertNotEmpty($sentMessages);
        $this->assertStringContainsString('Special promo: 10% off cleanings!', $sentMessages[0]);
        $this->assertStringContainsString('Note:', $sentMessages[0]);
    }

    public function test_chatbot_end_conversation(): void
    {
        $integration = FbPageIntegration::where('fb_page_id', $this->pageId)->first();
        $clinic = $integration->clinic;

        // 1. Test Text Command "thank you"
        // Create an active session that is in main_menu with some context data
        $session = ChatSession::create([
            'clinic_id' => $clinic->id,
            'fb_messenger_id' => $this->senderId,
            'session_id' => \Illuminate\Support\Str::uuid(),
            'current_step' => 'main_menu',
            'context_data' => ['some_booking_key' => 'some_val'],
            'last_interaction_at' => now(),
        ]);

        $payload = $this->textMessagePayload('thank you');
        $response = $this->post(route('webhook.handle'), $payload);
        $response->assertStatus(200);

        // Assert step is reset to welcome and context is cleared
        $session->refresh();
        $this->assertEquals('welcome', $session->current_step);
        $this->assertEmpty($session->context_data);

        // 2. Test Quick Reply/Postback payload "END_CONVERSATION"
        // Reset step to main_menu and add context again
        $session->updateStep('main_menu', ['another_key' => 'another_val']);
        $this->assertEquals('main_menu', $session->current_step);

        $postbackPayload = [
            'object' => 'page',
            'entry' => [
                [
                    'id' => $this->pageId,
                    'messaging' => [
                        [
                            'sender' => ['id' => $this->senderId],
                            'recipient' => ['id' => $this->pageId],
                            'postback' => ['payload' => 'END_CONVERSATION']
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->post(route('webhook.handle'), $postbackPayload);
        $response->assertStatus(200);

        // Assert step is reset to welcome and context is cleared
        $session->refresh();
        $this->assertEquals('welcome', $session->current_step);
        $this->assertEmpty($session->context_data);
    }

    protected function textMessagePayload(string $text): array
    {
        return [
            'object' => 'page',
            'entry' => [
                [
                    'id' => $this->pageId,
                    'messaging' => [
                        [
                            'sender' => ['id' => $this->senderId],
                            'recipient' => ['id' => $this->pageId],
                            'message' => ['text' => $text],
                        ]
                    ]
                ]
            ]
        ];
    }
}
