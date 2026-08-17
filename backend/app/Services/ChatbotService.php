<?php

namespace App\Services;

use App\Models\{Clinic, ChatSession, Patient, Appointment, DentalService, CalendarSlot, Notification, PatientHistory, ClinicFaq};
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ChatbotService
{
    public function __construct(
        protected MessengerService $messenger,
        protected WitAiService $witAi,
        protected TranslationService $translator
    ) {}

    /**
     * Handle incoming message
     */
    public function handleMessage(Clinic $clinic, string $senderId, string $message): void
    {
        $integration = $clinic->fbPageIntegration;
        
        // Mark as seen and show typing
        $this->messenger->markSeen($senderId, $integration);
        $this->messenger->sendTypingOn($senderId, $integration);

        $notifSettings = $clinic->notification_settings ?? [];
        $chatbotEnabled = $notifSettings['chatbot_enabled'] ?? true;
        if (!$chatbotEnabled) {
            $offlineMessage = "👋 Hello! Our automated chat assistant is currently offline / hindi aktibo.\n\n"
                . "Please contact the clinic directly / Mangyaring makipag-ugnayan sa amin sa:\n"
                . "📞 Phone: " . ($clinic->contact_number ?? 'N/A') . "\n"
                . "📍 Address: " . ($clinic->address ?? 'N/A') . "\n\n"
                . "Thank you for your understanding! / Maraming salamat po!";
            
            $this->messenger->sendTextMessage($senderId, $offlineMessage, $integration);
            return;
        }

        // Get or create chat session
        $session = $this->getOrCreateSession($clinic, $senderId);

        // Handle message based on current step
        $this->processMessage($session, $message, $integration);
    }

    /**
     * Handle postback (button clicks)
     */
    public function handlePostback(Clinic $clinic, string $senderId, string $payload): void
    {
        $integration = $clinic->fbPageIntegration;
        
        $this->messenger->markSeen($senderId, $integration);
        $this->messenger->sendTypingOn($senderId, $integration);

        $notifSettings = $clinic->notification_settings ?? [];
        $chatbotEnabled = $notifSettings['chatbot_enabled'] ?? true;
        if (!$chatbotEnabled) {
            $offlineMessage = "👋 Hello! Our automated chat assistant is currently offline / hindi aktibo.\n\n"
                . "Please contact the clinic directly / Mangyaring makipag-ugnayan sa amin sa:\n"
                . "📞 Phone: " . ($clinic->contact_number ?? 'N/A') . "\n"
                . "📍 Address: " . ($clinic->address ?? 'N/A') . "\n\n"
                . "Thank you for your understanding! / Maraming salamat po!";
            
            $this->messenger->sendTextMessage($senderId, $offlineMessage, $integration);
            return;
        }

        $session = $this->getOrCreateSession($clinic, $senderId);
        
        $this->processPostback($session, $payload, $integration);
    }

    /**
     * Get or create chat session
     */
    protected function getOrCreateSession(Clinic $clinic, string $senderId): ChatSession
    {
        $session = ChatSession::where('clinic_id', $clinic->id)
            ->where('fb_messenger_id', $senderId)
            ->first();

        if (!$session || $session->isExpired()) {
            // Remove the old expired session to prevent stale row accumulation
            if ($session) {
                $session->delete();
            }

            // Get patient if exists
            $patient = Patient::where('clinic_id', $clinic->id)
                ->where('fb_messenger_id', $senderId)
                ->first();

            $session = ChatSession::create([
                'clinic_id' => $clinic->id,
                'patient_id' => $patient?->id,
                'fb_messenger_id' => $senderId,
                'session_id' => Str::uuid(),
                'current_step' => 'welcome',
                'context_data' => [],
                'last_interaction_at' => now(),
            ]);
        }

        return $session;
    }

    /**
     * Process message based on current step
     */
    protected function processMessage(ChatSession $session, string $message, $integration): void
    {
        $message = trim($message);
        $lower = strtolower($message);
        
        // Store last message for language detection
        $session->setContext('last_message', $message);
        
        // Detect and set language
        $detectedLang = $this->translator->detectLanguage($message);
        $currentLang = $session->getContext('language', 'en');
        
        // Update language if detected differently
        if ($detectedLang !== $currentLang) {
            $session->setContext('language', $detectedLang);
        }
        
        $this->translator->setLanguage($session->getContext('language', 'en'));
        
        // ⭐ GLOBAL COMMANDS - Work from any state
        // Greetings always restart the flow cleanly
        $greetings = ['hi', 'hello', 'hey', 'start', 'get started', 'kumusta', 'kamusta'];
        if (in_array($lower, $greetings) && $session->current_step !== 'welcome') {
            $session->clearContext();
            $this->sendStandardWelcome($session, $integration);
            return;
        }

        // Reset commands — always go back to main menu
        if (in_array($lower, ['menu', 'restart', 'cancel', 'stop', 'back', 'home', 'balik'])) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('menu.returning'),
                $integration
            );

            $session->clearContext();
            $session->updateStep('main_menu');

            $this->showMainMenu($session, $integration);
            return;
        }

        // End conversation commands — politely goodbye and reset session
        if (in_array($lower, ['end', 'end conversation', 'exit', 'bye', 'goodbye', 'paalam', 'tapos', 'tapusin', 'thank you', 'thanks', 'salamat', 'tapusin ang usapan'])) {
            $this->endConversation($session, $integration);
            return;
        }
        
        match ($session->current_step) {
            'welcome' => $this->handleWelcome($session, $message, $integration),
            'main_menu' => $this->handleMainMenu($session, $message, $integration),
            'faq_menu' => $this->handleFaqMenu($session, $message, $integration),
            'booking_category_selection' => $this->handleCategorySelection($session, $message, $integration),
            'booking_service_selection' => $this->handleServiceSelection($session, $message, $integration),
            'booking_date_selection' => $this->handleDateSelection($session, $message, $integration),
            'booking_time_selection' => $this->handleTimeSelection($session, $message, $integration),
            'booking_webview' => $this->handleWebviewWait($session, $integration),
            'booking_dpa_consent' => $this->handleDpaConsent($session, $message, $integration),
            'booking_form_name' => $this->handleFormName($session, $message, $integration),
            'booking_form_contact' => $this->handleFormContact($session, $message, $integration),
            'booking_form_address' => $this->handleFormAddress($session, $message, $integration),
            'booking_form_age' => $this->handleFormAge($session, $message, $integration),
            'booking_form_medical_history' => $this->handleFormMedicalHistory($session, $message, $integration),
            'booking_form_reason' => $this->handleFormReason($session, $message, $integration),
            'booking_confirmation' => $this->handleBookingConfirmation($session, $message, $integration),
            default => $this->handleWelcome($session, $message, $integration),
        };
    }

    /**
     * Process postback (button clicks)
     */
    protected function processPostback(ChatSession $session, string $payload, $integration): void
    {
        // Parse payload
        $parts = explode(':', $payload);
        $action = $parts[0];
        $data = $parts[1] ?? null;

        match ($action) {
            'MAIN_MENU' => $this->showMainMenu($session, $integration),
            'BOOK_APPOINTMENT' => $this->startBooking($session, $integration),
            'VIEW_APPOINTMENTS' => $this->showAppointments($session, $integration),
            'VIEW_HISTORY' => $this->showHistory($session, $integration),
            'CANCEL_RESCHEDULE' => $this->showCancelReschedule($session, $integration),
            'CONTACT_US' => $this->showContactInfo($session, $integration),
            'VIEW_FAQS' => $this->showFaqCategories($session, $integration),
            'END_CONVERSATION' => $this->endConversation($session, $integration),
            'SHOW_FAQ_CAT' => $this->showFaqCategoryDetails($session, $data, $integration),
            'SELECT_SERVICE' => $this->selectService($session, $data, $integration),
            'SELECT_DATE' => $this->selectDate($session, $data, $integration),
            'SELECT_TIME' => $this->selectTime($session, $data, $integration),
            'CONFIRM_BOOKING' => $this->confirmBooking($session, $integration),
            'CANCEL_BOOKING' => $this->cancelCurrentBooking($session, $integration),
            'CANCEL_APPT' => $this->processCancellation($session, $data, $integration),
            'VIEW_WEBSITE' => $this->showWebsiteLink($session, $integration),
            default => $this->showMainMenu($session, $integration),
        };
    }

    /**
     * Handle welcome message
     */
    protected function handleWelcome(ChatSession $session, string $message, $integration): void
    {
        $lower = strtolower(trim($message));
        $commonGreetings = ['hi', 'hello', 'hey', 'get started', 'start', ''];
        
        // If it's not a generic greeting, try Wit.ai/Keywords immediately
        if (!in_array($lower, $commonGreetings) && strlen($lower) > 2) {
            // 1. Analyze with Wit.ai first to prioritize structured intents
            $witResponse = $this->witAi->analyze($message);
            $intent = $this->witAi->getTopIntent($witResponse);

            if ($intent) {
                // Found an intent right away, skip the greeting and process it
                $session->updateStep('main_menu');
                match ($intent) {
                    'book_appointment' => $this->startBooking($session, $integration),
                    'check_appointments' => $this->showAppointments($session, $integration),
                    'check_history' => $this->showHistory($session, $integration),
                    'reschedule_appointment' => $this->showCancelReschedule($session, $integration),
                    'contact_info' => $this->showContactInfo($session, $integration),
                    'ask_location' => $this->showFaqFromIntent($session, 'location', $integration),
                    'ask_hmo' => $this->showFaqFromIntent($session, 'hmo', $integration),
                    'ask_price' => $this->showFaqFromIntent($session, 'pricing', $integration),
                    'ask_walkin' => $this->showFaqFromIntent($session, 'policy', $integration),
                    default => $this->sendStandardWelcome($session, $integration),
                };
                return;
            }

            // 2. If no structured intent, fall back to direct keyword match
            $faqs = ClinicFaq::where('clinic_id', $session->clinic_id)
                ->where('is_active', true)
                ->get();

            foreach ($faqs as $faq) {
                $keywords = is_array($faq->keywords) ? $faq->keywords : json_decode($faq->keywords ?? '[]', true);
                if (is_array($keywords)) {
                    foreach ($keywords as $kw) {
                        if (!empty($kw) && str_contains($lower, strtolower($kw))) {
                            $this->messenger->sendTextMessage(
                                $session->fb_messenger_id,
                                $this->translator->trans('booking.faq_answer', ['question' => $faq->question, 'answer' => $faq->answer]),
                                $integration
                            );
                            $this->showMainMenu($session, $integration);
                            return;
                        }
                    }
                }
            }
        }
        
        // If it's a greeting or Wit.ai didn't understand, send standard welcome
        $this->sendStandardWelcome($session, $integration);
    }

    /**
     * Send standard welcome message
     */
    protected function sendStandardWelcome(ChatSession $session, $integration): void
    {
        $clinic = $session->clinic;
        
        // Detect language from last message if available
        $lastMessage = $session->getContext('last_message', '');
        if ($lastMessage) {
            $detectedLang = $this->translator->detectLanguage($lastMessage);
            $this->translator->setLanguage($detectedLang);
            $session->setContext('language', $detectedLang);
        }

        $lang = $session->getContext('language', 'en');
        $this->translator->setLanguage($lang);
        
        $notifSettings = $clinic->notification_settings ?? [];
        $customTemplate = $notifSettings['chatbot_welcome_template'] ?? null;

        if (!empty($customTemplate)) {
            $welcomeMessage = $this->parseTemplate($customTemplate, $clinic, $session);
        } else {
            $welcomeMessage = $this->translator->trans('welcome.greeting', ['clinic' => $clinic->clinic_name]) . "\n\n";
            $welcomeMessage .= $this->translator->trans('welcome.intro') . "\n\n";
            $welcomeMessage .= $this->translator->trans('welcome.lets_start');
        }

        $customInstructions = $notifSettings['chatbot_instructions'] ?? null;
        if (!empty($customInstructions)) {
            $welcomeMessage .= "\n\n📢 ANNOUNCEMENT:\n" . $this->parseTemplate($customInstructions, $clinic, $session);
        }

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $welcomeMessage,
            $integration
        );

        $this->showMainMenu($session, $integration);
    }

    /**
     * Show main menu
     */
    protected function showMainMenu(ChatSession $session, $integration): void
    {
        $session->updateStep('main_menu');

        $lang = $session->getContext('language', 'en');
        $this->translator->setLanguage($lang);

        $menuText = "━━━━━━━━━━━━━━\n";
        $menuText .= $this->translator->trans('menu.title') . "\n";
        $menuText .= "━━━━━━━━━━━━━━\n\n";
        $menuText .= $this->translator->trans('menu.what_to_do');

        $buttons = [
            ['title' => $this->translator->trans('menu.book_appointment'), 'payload' => 'BOOK_APPOINTMENT'],
            ['title' => $this->translator->trans('menu.my_appointments'), 'payload' => 'VIEW_APPOINTMENTS'],
            ['title' => $this->translator->trans('menu.view_history'), 'payload' => 'VIEW_HISTORY'],
        ];

        $this->messenger->sendButtonMessage(
            $session->fb_messenger_id,
            $menuText,
            $buttons,
            $integration
        );

        // Send additional quick replies
        $quickReplies = [
            ['title' => $this->translator->trans('menu.cancel_reschedule'), 'payload' => 'CANCEL_RESCHEDULE'],
            ['title' => $this->translator->trans('menu.contact_us'), 'payload' => 'CONTACT_US'],
            ['title' => $this->translator->trans('menu.faqs'), 'payload' => 'VIEW_FAQS'],
            ['title' => $this->translator->trans('menu.end_conversation'), 'payload' => 'END_CONVERSATION'],
        ];

        $this->messenger->sendQuickReplies(
            $session->fb_messenger_id,
            $this->translator->trans('menu.or_choose'),
            $quickReplies,
            $integration
        );
    }

    /**
     * End conversation politely and clear session context
     */
    protected function endConversation(ChatSession $session, $integration): void
    {
        $lang = $session->getContext('language', 'en');
        $this->translator->setLanguage($lang);

        $goodbyeMessage = $this->translator->trans('menu.goodbye');

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $goodbyeMessage,
            $integration
        );

        $session->clearContext();
        $session->updateStep('welcome');
    }

    /**
     * Handle main menu selection
     */
    protected function handleMainMenu(ChatSession $session, string $message, $integration): void
    {
        $messageLower = strtolower($message);

        if ($messageLower === '1' || str_contains($messageLower, 'book')) {
            $this->startBooking($session, $integration);
            return;
        } elseif ($messageLower === '2' || str_contains($messageLower, 'appointment')) {
            $this->showAppointments($session, $integration);
            return;
        } elseif ($messageLower === '3' || str_contains($messageLower, 'history')) {
            $this->showHistory($session, $integration);
            return;
        } elseif ($messageLower === '4' || str_contains($messageLower, 'cancel') || str_contains($messageLower, 'reschedule')) {
            $this->showCancelReschedule($session, $integration);
            return;
        } elseif ($messageLower === '5' || str_contains($messageLower, 'contact')) {
            $this->showContactInfo($session, $integration);
            return;
        } elseif ($messageLower === '6' || str_contains($messageLower, 'faq') || str_contains($messageLower, 'tanong')) {
            $this->showFaqCategories($session, $integration);
            return;
        }

        // 1. Try Wit.ai NLP for natural language understanding first
        $witResponse = $this->witAi->analyze($message);
        $intent = $this->witAi->getTopIntent($witResponse);

        if ($intent) {
            match ($intent) {
                'book_appointment' => $this->startBooking($session, $integration),
                'check_appointments' => $this->showAppointments($session, $integration),
                'check_history' => $this->showHistory($session, $integration),
                'reschedule_appointment' => $this->showCancelReschedule($session, $integration),
                'contact_info' => $this->showContactInfo($session, $integration),
                'ask_location' => $this->showFaqFromIntent($session, 'location', $integration),
                'ask_hmo' => $this->showFaqFromIntent($session, 'hmo', $integration),
                'ask_price' => $this->handlePriceQuery($session, $message, $witResponse, $integration),
                'ask_walkin' => $this->showFaqFromIntent($session, 'policy', $integration),
                default => $this->handleUnknownIntent($session, $integration),
            };
            return;
        }

        // 2. If no high-confidence intent, fall back to direct keyword match
        $faqs = ClinicFaq::where('clinic_id', $session->clinic_id)
            ->where('is_active', true)
            ->get();

        foreach ($faqs as $faq) {
            $keywords = is_array($faq->keywords) ? $faq->keywords : json_decode($faq->keywords ?? '[]', true);
            if (is_array($keywords)) {
                foreach ($keywords as $kw) {
                    if (!empty($kw) && str_contains($messageLower, strtolower($kw))) {
                        $this->messenger->sendTextMessage(
                            $session->fb_messenger_id,
                            $this->translator->trans('booking.faq_answer', ['question' => $faq->question, 'answer' => $faq->answer]),
                            $integration
                        );
                        $this->showMainMenu($session, $integration);
                        return;
                    }
                }
            }
        }

        // Fallback
        $this->handleUnknownIntent($session, $integration);
    }

    /**
     * Handle unknown intent/message
     */
    protected function handleUnknownIntent(ChatSession $session, $integration): void
    {
        $clinic = $session->clinic;
        $notifSettings = $clinic->notification_settings ?? [];
        $customInstructions = $notifSettings['chatbot_instructions'] ?? null;

        $msg = $this->translator->trans('error.not_understood');

        if (!empty($customInstructions)) {
            $msg .= "\n\n💡 Note:\n" . $this->parseTemplate($customInstructions, $clinic, $session);
        }

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $msg,
            $integration
        );
        $this->showMainMenu($session, $integration);
    }

    /**
     * Start booking process
     */
    protected function startBooking(ChatSession $session, $integration): void
    {
        $session->updateStep('booking_category_selection', ['booking' => []]);

        // Get unique categories
        $categories = DentalService::where('clinic_id', $session->clinic_id)
            ->active()
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        if ($categories->isEmpty()) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.no_services'),
                $integration
            );
            $this->showMainMenu($session, $integration);
            return;
        }

        $message = "━━━━━━━━━━━━━━\n";
        $message .= $this->translator->trans('booking.categories_title') . "\n";
        $message .= "━━━━━━━━━━━━━━\n\n";
        $message .= $this->translator->trans('booking.select_category') . "\n\n";

        foreach ($categories as $index => $category) {
            $count = DentalService::where('clinic_id', $session->clinic_id)
                ->where('category', $category)
                ->active()
                ->count();
            $message .= ($index + 1) . ". {$category} (" . $this->translator->trans('booking.services_count', ['count' => $count]) . ")\n";
        }

        $message .= "\n" . $this->translator->trans('booking.reply_number');

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $message,
            $integration
        );

        // Store categories in session for reference
        $session->setContext('booking.categories', $categories->toArray());
    }

    /**
     * Handle category selection
     */
    protected function handleCategorySelection(ChatSession $session, string $message, $integration): void
    {
        $categories = $session->getContext('booking.categories', []);

        if (empty($categories)) {
            $this->startBooking($session, $integration);
            return;
        }

        $selectedCategory = null;

        if (is_numeric($message)) {
            $index = (int)$message - 1;
            $selectedCategory = $categories[$index] ?? null;
        } else {
            // Try to match by name
            foreach ($categories as $category) {
                if (str_contains(strtolower($category), strtolower($message))) {
                    $selectedCategory = $category;
                    break;
                }
            }
        }

        if (!$selectedCategory) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.invalid_selection', ['item' => 'category']),
                $integration
            );
            return;
        }

        $this->showServicesInCategory($session, $selectedCategory, $integration);
    }

    /**
     * Show services in selected category
     */
    protected function showServicesInCategory(ChatSession $session, string $category, $integration): void
    {
        $session->updateStep('booking_service_selection');
        $session->setContext('booking.selected_category', $category);

        $services = DentalService::where('clinic_id', $session->clinic_id)
            ->where('category', $category)
            ->active()
            ->orderBy('service_name')
            ->get();

        if ($services->isEmpty()) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('booking.no_services_in_category'),
                $integration
            );
            $this->startBooking($session, $integration);
            return;
        }

        $message = "━━━━━━━━━━━━━━\n";
        $message .= "🦷 {$category}\n";
        $message .= "━━━━━━━━━━━━━━\n\n";
        $message .= $this->translator->trans('booking.select_service') . "\n\n";

        foreach ($services as $index => $service) {
            $message .= ($index + 1) . ". {$service->service_name}\n";
            $message .= "   💰 ₱" . number_format($service->price, 2) . "\n";
            $message .= "   ⏱️ " . $this->translator->trans('common.minutes', ['count' => $service->duration_minutes]) . "\n";
            if ($service->description) {
                $message .= "   📝 {$service->description}\n";
            }
            $message .= "\n";
        }

        $message .= $this->translator->trans('booking.reply_or_back');

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $message,
            $integration
        );

        // Store services in context for selection
        $session->setContext('booking.category_services', $services->pluck('id')->toArray());
    }

    /**
     * Handle service selection
     */
    protected function handleServiceSelection(ChatSession $session, string $message, $integration): void
    {
        // Check if user wants to go back
        if (in_array(strtolower(trim($message)), ['back', 'cancel'])) {
            $this->startBooking($session, $integration);
            return;
        }

        $category = $session->getContext('booking.selected_category');
        $services = DentalService::where('clinic_id', $session->clinic_id)
            ->where('category', $category)
            ->active()
            ->orderBy('service_name')
            ->get();

        // Try to match by number or name
        $selectedService = null;
        
        if (is_numeric($message)) {
            $index = (int)$message - 1;
            $selectedService = $services->get($index);
        } else {
            $selectedService = $services->first(function ($service) use ($message) {
                return str_contains(strtolower($service->service_name), strtolower($message));
            });
        }

        if (!$selectedService) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.invalid_selection', ['item' => 'service']),
                $integration
            );
            return;
        }

        $this->selectService($session, $selectedService->id, $integration);
    }

    /**
     * Select service
     */
    protected function selectService(ChatSession $session, $serviceId, $integration): void
    {
        $service = DentalService::find($serviceId);
        
        if (!$service) {
            $this->showMainMenu($session, $integration);
            return;
        }

        $session->setContext('booking.service_id', $service->id);
        $session->setContext('booking.service_name', $service->service_name);
        $session->setContext('booking.service_price', $service->price);
        $session->updateStep('booking_date_selection');

        $confirmMessage = $this->translator->trans('booking.selected', ['service' => $service->service_name]) . "\n";
        $confirmMessage .= $this->translator->trans('booking.price', ['price' => number_format($service->price, 2)]) . "\n\n";

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $confirmMessage,
            $integration
        );

        $this->showAvailableDates($session, $integration);
    }

    /**
     * Show available dates via Webview
     */
    protected function showAvailableDates(ChatSession $session, $integration): void
    {
        $message = $this->translator->trans('booking.awesome');

        $buttons = [
            [
                'title' => $this->translator->trans('booking.select_date_time'),
                'url' => url('/webview/calendar/' . $session->session_id),
            ]
        ];

        $this->messenger->sendButtonMessage(
            $session->fb_messenger_id,
            $message,
            $buttons,
            $integration
        );

        $session->updateStep('booking_webview');
    }

    /**
     * Handle user texting during webview wait
     */
    protected function handleWebviewWait(ChatSession $session, $integration): void
    {
        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $this->translator->trans('booking.click_button'),
            $integration
        );
    }

    /**
     * Handle date selection
     */
    protected function handleDateSelection(ChatSession $session, string $message, $integration): void
    {
        $availableDates = $session->getContext('booking.available_dates', []);

        if (empty($availableDates)) {
            $this->showAvailableDates($session, $integration);
            return;
        }

        $selectedDate = null;

        if (is_numeric($message)) {
            $index = (int)$message - 1;
            $selectedDate = $availableDates[$index] ?? null;
        }

        if (!$selectedDate) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.invalid_selection', ['item' => 'date']),
                $integration
            );
            return;
        }

        $this->selectDate($session, $selectedDate, $integration);
    }

    /**
     * Select date
     */
    protected function selectDate(ChatSession $session, $date, $integration): void
    {
        $session->setContext('booking.date', $date);
        $session->updateStep('booking_time_selection');

        $formattedDate = Carbon::parse($date)->format('F d, Y (l)');
        
        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $this->translator->trans('booking.selected_date', ['date' => $formattedDate]),
            $integration
        );

        $this->showAvailableTimeSlots($session, $integration);
    }

    /**
     * Show available time slots
     */
    protected function showAvailableTimeSlots(ChatSession $session, $integration): void
    {
        $date = $session->getContext('booking.date');

        $timeSlots = CalendarSlot::where('clinic_id', $session->clinic_id)
            ->whereDate('slot_date', $date)
            ->where('status', 'available')
            ->orderBy('slot_time')
            ->get();

        if ($timeSlots->isEmpty()) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.no_time_slots'),
                $integration
            );
            $this->showAvailableDates($session, $integration);
            return;
        }

        $message = "━━━━━━━━━━━━━━\n";
        $message .= "⏰ AVAILABLE TIME SLOTS / MGA ORAS\n";
        $message .= "━━━━━━━━━━━━━━\n\n";

        foreach ($timeSlots as $index => $slot) {
            $time = Carbon::parse($slot->slot_time)->format('g:i A');
            $message .= ($index + 1) . ". 🟢 {$time}\n";
        }

        $message .= "\n" . $this->translator->trans('error.invalid_selection', ['item' => 'time']);

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $message,
            $integration
        );

        // Store available times in context
        $session->setContext('booking.available_times', $timeSlots->pluck('slot_time')->toArray());
    }

    /**
     * Handle time selection
     */
    protected function handleTimeSelection(ChatSession $session, string $message, $integration): void
    {
        $availableTimes = $session->getContext('booking.available_times', []);

        if (empty($availableTimes)) {
            $this->showAvailableTimeSlots($session, $integration);
            return;
        }

        $selectedTime = null;

        if (is_numeric($message)) {
            $index = (int)$message - 1;
            $selectedTime = $availableTimes[$index] ?? null;
        }

        if (!$selectedTime) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.invalid_selection', ['item' => 'time']),
                $integration
            );
            return;
        }

        $this->selectTime($session, $selectedTime, $integration);
    }

    /**
     * Select time slot from Webview calendar
     */
    public function selectTimeFromWebview(ChatSession $session, string $time, $integration): void
    {
        $this->selectTime($session, $time, $integration);
    }

    /**
     * Select time
     */
    protected function selectTime(ChatSession $session, $time, $integration): void
    {
        $session->setContext('booking.time', $time);

        $formattedTime = Carbon::parse($time)->format('g:i A');

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $this->translator->trans('booking.selected_time', ['time' => $formattedTime]),
            $integration
        );

        // ✅ If patient is already registered, skip info collection and go straight to confirmation
        $existingPatient = Patient::where('clinic_id', $session->clinic_id)
            ->where('fb_messenger_id', $session->fb_messenger_id)
            ->first();

        if ($existingPatient) {
            $session->setContext('booking.patient_name',           $existingPatient->full_name);
            $session->setContext('booking.patient_contact',        $existingPatient->contact_number);
            $session->setContext('booking.patient_address',        $existingPatient->address ?? 'N/A');
            $session->setContext('booking.patient_age',            $existingPatient->age ?? 0);
            $session->setContext('booking.patient_medical_history',$existingPatient->medical_history ?? 'None');
            $session->updateStep('booking_form_reason');

            $welcomeBackMsg = $this->translator->trans('booking.welcome_back', ['name' => $existingPatient->full_name]) . "\n\n";
            $welcomeBackMsg .= $this->translator->trans('booking.reason_visit');

            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $welcomeBackMsg,
                $integration
            );
            return;
        }

        // New patient — show DPA consent first
        $session->updateStep('booking_dpa_consent');
        $this->sendDpaNotice($session, $integration);
    }

    /**
     * Send DPA Notice with quick replies
     */
    protected function sendDpaNotice(ChatSession $session, $integration): void
    {
        $clinic = $session->clinic;
        $privacyUrl = url('/privacy-policy');

        $message = "🔒 " . $this->translator->trans('dpa.title') . "\n";
        $message .= "━━━━━━━━━━━━━━\n\n";
        $message .= $this->translator->trans('dpa.message', ['clinic' => $clinic->clinic_name, 'url' => $privacyUrl]);

        $quickReplies = [
            ['title' => $this->translator->trans('dpa.agree'), 'payload' => 'DPA_AGREE'],
            ['title' => $this->translator->trans('dpa.decline'), 'payload' => 'DPA_DECLINE'],
        ];

        $this->messenger->sendQuickReplies(
            $session->fb_messenger_id,
            $message,
            $quickReplies,
            $integration
        );
    }

    /**
     * Handle DPA Consent response
     */
    protected function handleDpaConsent(ChatSession $session, string $message, $integration): void
    {
        $lower = strtolower(trim($message));
        
        $agreed = str_contains($lower, 'agree') || 
                  str_contains($lower, 'yes') || 
                  str_contains($lower, 'oo') || 
                  str_contains($lower, 'payag') || 
                  str_contains($lower, 'accept');
                  
        $declined = str_contains($lower, 'decline') || 
                    str_contains($lower, 'no') || 
                    str_contains($lower, 'hindi') || 
                    str_contains($lower, 'ayaw');

        if ($agreed) {
            $session->updateStep('booking_form_name');
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                "━━━━━━━━━━━━━━\n" . $this->translator->trans('form.title') . "\n━━━━━━━━━━━━━━\n\n" . $this->translator->trans('form.provide_info'),
                $integration
            );

            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('form.full_name'),
                $integration
            );
        } elseif ($declined) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('dpa.cannot_proceed'),
                $integration
            );
            
            $session->clearContext();
            $session->updateStep('main_menu');
            
            $this->showMainMenu($session, $integration);
        } else {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                "⚠️ Invalid response / Hindi wastong tugon. Please choose 'I Agree' or 'I Decline' from the options below:",
                $integration
            );
            $this->sendDpaNotice($session, $integration);
        }
    }

    /**
     * Handle form: name
     */
    protected function handleFormName(ChatSession $session, string $message, $integration): void
    {
        if (strlen($message) < 2) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.invalid_name'),
                $integration
            );
            return;
        }

        $session->setContext('booking.patient_name', $message);
        $session->updateStep('booking_form_contact');

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $this->translator->trans('form.contact_number'),
            $integration
        );
    }

    /**
     * Handle form: contact
     */
    protected function handleFormContact(ChatSession $session, string $message, $integration): void
    {
        // Validation for Philippine mobile numbers (09... or +639...)
        $cleaned = preg_replace('/[^0-9+]/', '', $message);
        
        if (!preg_match('/^(09|\+639)\d{9}$/', $cleaned)) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.invalid_contact'),
                $integration
            );
            return;
        }

        $session->setContext('booking.patient_contact', $cleaned);
        $session->updateStep('booking_form_address');

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $this->translator->trans('form.address'),
            $integration
        );
    }

    /**
     * Handle form: address
     */
    protected function handleFormAddress(ChatSession $session, string $message, $integration): void
    {
        $session->setContext('booking.patient_address', $message);
        $session->updateStep('booking_form_age');

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $this->translator->trans('form.age'),
            $integration
        );
    }

    /**
     * Handle form: age
     */
    protected function handleFormAge(ChatSession $session, string $message, $integration): void
    {
        preg_match('/\d+/', $message, $matches);
        $age = isset($matches[0]) ? (int)$matches[0] : null;

        if (!$age || $age < 1 || $age > 120) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.invalid_age'),
                $integration
            );
            return;
        }

        $session->setContext('booking.patient_age', $age);
        $session->updateStep('booking_form_medical_history');

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $this->translator->trans('form.medical_history'),
            $integration
        );
    }

    /**
     * Handle form: medical history
     */
    protected function handleFormMedicalHistory(ChatSession $session, string $message, $integration): void
    {
        $session->setContext('booking.patient_medical_history', $message);
        $session->updateStep('booking_form_reason');

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $this->translator->trans('booking.reason_visit'),
            $integration
        );
    }

    /**
     * Handle form: reason
     */
    protected function handleFormReason(ChatSession $session, string $message, $integration): void
    {
        $session->setContext('booking.reason', $message);
        $session->updateStep('booking_confirmation');

        $this->showBookingSummary($session, $integration);
    }

    /**
     * Show booking summary
     */
    protected function showBookingSummary(ChatSession $session, $integration): void
    {
        $booking = $session->getContext('booking');
        
        $date = Carbon::parse($booking['date'])->format('F d, Y (l)');
        $time = Carbon::parse($booking['time'])->format('g:i A');
        $price = number_format($booking['service_price'], 2);

        $summary = "━━━━━━━━━━━━━━\n";
        $summary .= "📋 " . $this->translator->trans('confirm.title') . "\n";
        $summary .= "━━━━━━━━━━━━━━\n\n";
        $summary .= $this->translator->trans('confirm.name', ['name' => $booking['patient_name']]) . "\n";
        $summary .= $this->translator->trans('confirm.contact', ['contact' => $booking['patient_contact']]) . "\n";
        $summary .= $this->translator->trans('confirm.address', ['address' => $booking['patient_address']]) . "\n";
        $summary .= $this->translator->trans('confirm.age', ['age' => $booking['patient_age']]) . "\n";
        $summary .= $this->translator->trans('confirm.service', ['service' => $booking['service_name']]) . "\n";
        $summary .= $this->translator->trans('confirm.date', ['date' => $date]) . "\n";
        $summary .= $this->translator->trans('confirm.time', ['time' => $time]) . "\n";
        $summary .= $this->translator->trans('confirm.price', ['price' => $price]) . "\n";
        $summary .= $this->translator->trans('confirm.reason', ['reason' => $booking['reason']]) . "\n";
        $summary .= "━━━━━━━━━━━━━━\n\n";
        $summary .= $this->translator->trans('confirm.is_correct');

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $summary,
            $integration
        );

        $buttons = [
            ['title' => $this->translator->trans('confirm.yes_submit'), 'payload' => 'CONFIRM_BOOKING'],
            ['title' => $this->translator->trans('confirm.cancel'), 'payload' => 'CANCEL_BOOKING'],
        ];

        $this->messenger->sendButtonMessage(
            $session->fb_messenger_id,
            $this->translator->trans('confirm.please_confirm'),
            $buttons,
            $integration
        );
    }

    /**
     * Handle booking confirmation
     */
    protected function handleBookingConfirmation(ChatSession $session, string $message, $integration): void
    {
        $message = strtolower(trim($message));

        if (in_array($message, ['yes', 'y', 'confirm', 'submit', 'ok'])) {
            $this->confirmBooking($session, $integration);
        } elseif (in_array($message, ['no', 'n', 'cancel'])) {
            $this->cancelCurrentBooking($session, $integration);
        } else {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                "Please reply 'Yes' / 'Oo' to confirm or 'No' / 'Hindi' to cancel.",
                $integration
            );
        }
    }

    /**
     * Confirm and submit booking
     */
    protected function confirmBooking(ChatSession $session, $integration): void
    {
        $booking = $session->getContext('booking');
        $patient = null;
        $appointment = null;

        try {
            DB::transaction(function () use ($session, $booking, &$patient, &$appointment) {
                // Create or update patient
                $patient = Patient::updateOrCreate(
                    [
                        'clinic_id' => $session->clinic_id,
                        'fb_messenger_id' => $session->fb_messenger_id,
                    ],
                    [
                        'full_name' => $booking['patient_name'],
                        'contact_number' => $booking['patient_contact'],
                        'address' => $booking['patient_address'],
                        'age' => $booking['patient_age'],
                        'medical_history' => $booking['patient_medical_history'],
                    ]
                );

                // Update session with patient
                $session->update(['patient_id' => $patient->id]);

                // Calculate Queue Number for the day
                $maxQueue = Appointment::where('clinic_id', $session->clinic_id)
                    ->where('appointment_date', $booking['date'])
                    ->max('queue_number');

                $queueNumber = $maxQueue ? $maxQueue + 1 : 1;

                // Create appointment
                $appointment = Appointment::create([
                    'clinic_id' => $session->clinic_id,
                    'patient_id' => $patient->id,
                    'dental_service_id' => $booking['service_id'],
                    'appointment_date' => $booking['date'],
                    'appointment_time' => $booking['time'],
                    'status' => 'pending',
                    'queue_number' => $queueNumber,
                    'reason_for_visit' => $booking['reason'],
                ]);

                $updated = CalendarSlot::where('clinic_id', $session->clinic_id)
                    ->whereDate('slot_date', $booking['date'])
                    ->where('slot_time', $booking['time'])
                    ->where('status', 'available')
                    ->update([
                        'status' => 'booked',
                        'appointment_id' => $appointment->id,
                    ]);

                if ($updated === 0) {
                    // Slot was taken concurrently — throw to roll back the transaction
                    throw new \RuntimeException('slot_taken');
                }

                // Create notification for patient
                Notification::create([
                    'clinic_id' => $session->clinic_id,
                    'patient_id' => $patient->id,
                    'appointment_id' => $appointment->id,
                    'notification_type' => 'booking_confirmation',
                    'message' => 'Your appointment booking has been received and is pending approval.',
                    'channel' => 'messenger',
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
            });

            if (!$appointment) {
                return;
            }

            $formattedDate = Carbon::parse($booking['date'])->format('M d, Y');
            $formattedTime = Carbon::parse($booking['time'])->format('g:i A');

            // Send success message
            $successMessage = "✅ " . $this->translator->trans('success.title') . "\n";
            $successMessage .= "━━━━━━━━━━━━━━\n\n";
            $successMessage .= $this->translator->trans('success.date', ['date' => $formattedDate]) . "\n";
            $successMessage .= $this->translator->trans('success.time', ['time' => $formattedTime]) . "\n";
            $successMessage .= $this->translator->trans('success.queue', ['number' => $appointment->queue_number]) . "\n";
            $successMessage .= $this->translator->trans('success.reference', ['ref' => $appointment->reference_number]) . "\n";
            $successMessage .= $this->translator->trans('success.status') . "\n\n";
            $successMessage .= "━━━━━━━━━━━━━━\n\n";
            $successMessage .= $this->translator->trans('success.message', ['time' => $formattedTime]);

            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $successMessage,
                $integration
            );

            // Trigger SMS & Email booking workflow notifications
            try {
                $workflowService = resolve(\App\Services\WorkflowAutomationService::class);
                $workflowService->triggerWorkflow($session->clinic, $patient, $appointment, 'booking_created');
            } catch (\Exception $e) {
                Log::error('Chatbot booking workflow dispatch error: ' . $e->getMessage());
            }

            // Clear booking context and set to welcome state (no auto menu, no hints)
            $session->clearContext();
            $session->updateStep('welcome');

        } catch (\RuntimeException $e) {
            // Slot conflict — transaction was rolled back automatically
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.slot_taken_chat'),
                $integration
            );
            $this->showAvailableDates($session, $integration);
        } catch (\Exception $e) {
            Log::error('Booking creation failed', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.something_went_wrong'),
                $integration
            );

            $this->showMainMenu($session, $integration);
        }
    }

    /**
     * Cancel current booking
     */
    protected function cancelCurrentBooking(ChatSession $session, $integration): void
    {
        $session->clearContext();

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $this->translator->trans('booking.cancelled'),
            $integration
        );

        $this->showMainMenu($session, $integration);
    }

    /**
     * Show patient's appointments
     */
    protected function showAppointments(ChatSession $session, $integration): void
    {
        if (!$session->patient_id) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.no_appointments_yet'),
                $integration
            );
            $this->showMainMenu($session, $integration);
            return;
        }

        $appointments = Appointment::where('patient_id', $session->patient_id)
            ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->with(['service', 'queue'])
            ->get();

        if ($appointments->isEmpty()) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.no_active_appointments'),
                $integration
            );
            $this->showMainMenu($session, $integration);
            return;
        }

        $message = "━━━━━━━━━━━━━━\n";
        $message .= "📋 YOUR APPOINTMENTS / AKING MGA APPOINTMENT\n";
        $message .= "━━━━━━━━━━━━━━\n\n";

        foreach ($appointments as $index => $appointment) {
            $statusEmoji = match($appointment->status) {
                'pending' => '⏳',
                'confirmed' => '✅',
                'checked_in' => '👥',
                default => '📝',
            };

            $date = Carbon::parse($appointment->appointment_date)->format('M d, Y');
            $time = Carbon::parse($appointment->appointment_time)->format('g:i A');

            $message .= ($index + 1) . ". {$statusEmoji} " . strtoupper($appointment->status) . "\n";
            $message .= "   Ref: {$appointment->reference_number}\n";
            $message .= "   Service: {$appointment->service->service_name}\n";
            $message .= "   Date: {$date}, {$time}\n";

            if ($appointment->queue_number) {
                $message .= "   Queue: #{$appointment->queue_number}\n";
            }

            $message .= "\n";
        }

        $message .= "━━━━━━━━━━━━━━";

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $message,
            $integration
        );

        $session->updateStep('welcome');
    }

    /**
     * Show patient history
     */
    protected function showHistory(ChatSession $session, $integration): void
    {
        if (!$session->patient_id) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.no_history_yet'),
                $integration
            );
            $this->showMainMenu($session, $integration);
            return;
        }

        $historyCount = PatientHistory::where('patient_id', $session->patient_id)->count();

        if ($historyCount === 0) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.no_history_yet'),
                $integration
            );
            $this->showMainMenu($session, $integration);
            return;
        }

        $patient = Patient::find($session->patient_id);
        $patientName = $patient ? $patient->full_name : 'Patient';

        // Send portal link as button message
        $message = "👋 " . $this->translator->trans('booking.welcome_back', ['name' => $patientName]) . "!\n\n"
            . "To view your complete dental record timeline, active prescriptions, and interactive tooth chart, tap the button below to open your secure Patient Portal:\n";

        $buttons = [
            [
                'title' => '🌐 Open Patient Portal',
                'url' => url('/webview/patient/portal/' . $session->session_id),
            ]
        ];

        $this->messenger->sendButtonMessage(
            $session->fb_messenger_id,
            $message,
            $buttons,
            $integration
        );

        $session->updateStep('welcome');
    }

    /**
     * Show website link
     */
    protected function showWebsiteLink(ChatSession $session, $integration): void
    {
        $clinic = $session->clinic;

        $message = $this->translator->trans('booking.website_visit');
        // Assuming a generic domain format if not stored in DB, or use a placeholder
        $message .= "🌐 https://" . strtolower(str_replace(' ', '', $clinic->clinic_name)) . ".dentalportal.com";

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $message,
            $integration
        );

        $session->updateStep('welcome');
    }

    /**
     * Show cancel/reschedule options
     */
    protected function showCancelReschedule(ChatSession $session, $integration): void
    {
        if (!$session->patient_id) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.no_appointments_to_cancel'),
                $integration
            );
            $this->showMainMenu($session, $integration);
            return;
        }

        $appointments = Appointment::where('patient_id', $session->patient_id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('appointment_date', '>=', now()->toDateString())
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();

        if ($appointments->isEmpty()) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.no_appointments_to_cancel'),
                $integration
            );
            $this->showMainMenu($session, $integration);
            return;
        }

        $message = $this->translator->trans('booking.select_appointment_to_cancel') . "\n\n";

        // Create buttons for up to 3 appointments (Messenger max buttons is 3)
        $buttons = [];
        foreach ($appointments->take(3) as $appt) {
            $date = Carbon::parse($appt->appointment_date)->format('M d');
            $time = Carbon::parse($appt->appointment_time)->format('g:i A');
            $buttons[] = [
                'title' => $this->translator->trans('booking.cancel_button_label', ['date' => $date, 'time' => $time]),
                'payload' => "CANCEL_APPT:{$appt->id}",
            ];
        }

        $this->messenger->sendButtonMessage(
            $session->fb_messenger_id,
            $message,
            $buttons,
            $integration
        );
    }

    /**
     * Process appointment cancellation
     */
    protected function processCancellation(ChatSession $session, $appointmentId, $integration): void
    {
        $appointment = Appointment::where('id', $appointmentId)
            ->where('patient_id', $session->patient_id)
            ->first();

        if (!$appointment || !in_array($appointment->status, ['pending', 'confirmed'])) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.cannot_cancel'),
                $integration
            );
            $this->showMainMenu($session, $integration);
            return;
        }

        DB::transaction(function () use ($appointment) {
            // Update appointment status
            $appointment->update([
                'status' => 'cancelled',
                'cancellation_reason' => 'Cancelled by patient via Messenger chatbot',
            ]);

            // Free up the calendar slot
            CalendarSlot::where('appointment_id', $appointment->id)
                ->update([
                    'status' => 'available',
                    'appointment_id' => null,
                ]);
        });

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $this->translator->trans('booking.cancel_success'),
            $integration
        );

        $session->updateStep('welcome');
    }

    /**
     * Show contact information
     */
    protected function showContactInfo(ChatSession $session, $integration): void
    {
        $clinic = $session->clinic;

        $message = "━━━━━━━━━━━━━━\n";
        $message .= "📞 CONTACT US\n";
        $message .= "━━━━━━━━━━━━━━\n\n";
        $message .= "📱 Phone: " . ($clinic->contact_number ?? 'N/A') . "\n";
        $message .= "📧 Email: " . ($clinic->email ?? 'N/A') . "\n";
        $message .= "📍 Address: " . ($clinic->address ?? 'N/A') . "\n\n";

        $notifSettings = $clinic->notification_settings ?? [];
        if (!empty($notifSettings['chatbot_operating_hours'])) {
            $message .= "⏰ Operating Hours:\n   " . $notifSettings['chatbot_operating_hours'] . "\n";
        } else {
            // ✅ Null-safe: operating_hours may be null or a plain string
            $hours = $clinic->operating_hours;
            if (!empty($hours)) {
                $hoursArray = is_array($hours) ? $hours : json_decode($hours, true);
                if (is_array($hoursArray)) {
                    $message .= "⏰ Operating Hours:\n";
                    foreach ($hoursArray as $day => $time) {
                        $message .= "   {$day}: {$time}\n";
                    }
                }
            }
        }

        $message .= "\n━━━━━━━━━━━━━━";

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $message,
            $integration
        );

        $session->updateStep('welcome');
    }

    /**
     * Show FAQ categories
     */
    protected function showFaqCategories(ChatSession $session, $integration): void
    {
        $session->updateStep('faq_menu');

        $message = "━━━━━━━━━━━━━━\n";
        $message .= "💡 FREQUENTLY ASKED QUESTIONS\n";
        $message .= "━━━━━━━━━━━━━━\n\n";
        $message .= "Tap on a category below to find quick answers to common questions, or simply type your question in natural language (Taglish or English) and I will try to answer it! 😊";

        $quickReplies = [
            ['title' => '💰 Pricing & Rates', 'payload' => 'SHOW_FAQ_CAT:pricing'],
            ['title' => '🏥 HMO Partners', 'payload' => 'SHOW_FAQ_CAT:hmo'],
            ['title' => '📍 Location & Map', 'payload' => 'SHOW_FAQ_CAT:location'],
            ['title' => '⏰ Clinic Rules', 'payload' => 'SHOW_FAQ_CAT:policy'],
            ['title' => '🔙 Main Menu', 'payload' => 'MAIN_MENU'],
        ];

        $this->messenger->sendQuickReplies(
            $session->fb_messenger_id,
            $message,
            $quickReplies,
            $integration
        );
    }

    /**
     * Show FAQ category details
     */
    protected function showFaqCategoryDetails(ChatSession $session, string $category, $integration): void
    {
        $faqs = ClinicFaq::where('clinic_id', $session->clinic_id)
            ->where('category', $category)
            ->where('is_active', true)
            ->get();

        if ($faqs->isEmpty()) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                "Sorry, no FAQs are currently configured for this category.",
                $integration
            );
            $this->showFaqCategories($session, $integration);
            return;
        }

        $categoryNames = [
            'pricing' => '💰 PRICING & RATES',
            'hmo' => '🏥 HMO & INSURANCE PARTNERS',
            'location' => '📍 LOCATION & PARKING',
            'policy' => '⏰ CLINIC RULES & POLICIES',
        ];

        $title = $categoryNames[$category] ?? strtoupper($category);

        $message = "━━━━━━━━━━━━━━\n";
        $message .= "{$title}\n";
        $message .= "━━━━━━━━━━━━━━\n\n";

        foreach ($faqs as $faq) {
            $message .= "❓ *{$faq->question}*\n";
            $message .= "👉 {$faq->answer}\n\n";
        }

        $message .= "━━━━━━━━━━━━━━";

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $message,
            $integration
        );

        // Show remaining categories as quick replies so they can navigate
        $quickReplies = [];
        $allCategories = [
            'pricing' => ['title' => '💰 Pricing & Rates', 'payload' => 'SHOW_FAQ_CAT:pricing'],
            'hmo' => ['title' => '🏥 HMO Partners', 'payload' => 'SHOW_FAQ_CAT:hmo'],
            'location' => ['title' => '📍 Location & Map', 'payload' => 'SHOW_FAQ_CAT:location'],
            'policy' => ['title' => '⏰ Clinic Rules', 'payload' => 'SHOW_FAQ_CAT:policy'],
        ];

        foreach ($allCategories as $catKey => $reply) {
            if ($catKey !== $category) {
                $quickReplies[] = $reply;
            }
        }

        $quickReplies[] = ['title' => '🔙 Main Menu', 'payload' => 'MAIN_MENU'];

        $this->messenger->sendQuickReplies(
            $session->fb_messenger_id,
            "Would you like to check other categories?",
            $quickReplies,
            $integration
        );
    }

    /**
     * Handle user message in FAQ menu state
     */
    protected function handleFaqMenu(ChatSession $session, string $message, $integration): void
    {
        $lower = strtolower(trim($message));

        // Let's see if the user typed category name/numbers
        if ($lower === '1' || str_contains($lower, 'price') || str_contains($lower, 'rate') || str_contains($lower, 'singil') || str_contains($lower, 'bayad') || str_contains($lower, 'magkano')) {
            $this->showFaqCategoryDetails($session, 'pricing', $integration);
            return;
        } elseif ($lower === '2' || str_contains($lower, 'hmo') || str_contains($lower, 'card') || str_contains($lower, 'maxicare') || str_contains($lower, 'medicard') || str_contains($lower, 'healthcard')) {
            $this->showFaqCategoryDetails($session, 'hmo', $integration);
            return;
        } elseif ($lower === '3' || str_contains($lower, 'location') || str_contains($lower, 'address') || str_contains($lower, 'saan') || str_contains($lower, 'parking') || str_contains($lower, 'landmark') || str_contains($lower, 'direksyon')) {
            $this->showFaqCategoryDetails($session, 'location', $integration);
            return;
        } elseif ($lower === '4' || str_contains($lower, 'rule') || str_contains($lower, 'policy') || str_contains($lower, 'walk-in') || str_contains($lower, 'walkin') || str_contains($lower, 'appointment')) {
            $this->showFaqCategoryDetails($session, 'policy', $integration);
            return;
        }

        // Otherwise, process as a hybrid natural language query!
        $this->handleFaqFallback($session, $message, $integration);
    }

    /**
     * Handle hybrid natural language FAQ fallback using direct keywords and Wit.ai NLP
     */
    protected function handleFaqFallback(ChatSession $session, string $message, $integration): void
    {
        $lower = strtolower(trim($message));

        // 1. Direct Keyword Search in Database
        $faqs = ClinicFaq::where('clinic_id', $session->clinic_id)
            ->where('is_active', true)
            ->get();

        $matchedFaq = null;
        foreach ($faqs as $faq) {
            $keywords = is_array($faq->keywords) ? $faq->keywords : json_decode($faq->keywords ?? '[]', true);
            if (!is_array($keywords)) continue;
            foreach ($keywords as $kw) {
                if ($kw !== '' && str_contains($lower, strtolower($kw))) {
                    $matchedFaq = $faq;
                    break 2;
                }
            }
        }

        if ($matchedFaq) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('booking.faq_answer', ['question' => $matchedFaq->question, 'answer' => $matchedFaq->answer]),
                $integration
            );
            
            $session->updateStep('welcome');
            return;
        }

        // 2. Wit.ai NLP Fallback Analysis
        $witResponse = $this->witAi->analyze($message);
        $intent = $this->witAi->getTopIntent($witResponse);

        if ($intent) {
            $categoryMap = [
                'ask_location' => 'location',
                'ask_hmo' => 'hmo',
                'ask_price' => 'pricing',
                'ask_walkin' => 'policy',
            ];

            if (isset($categoryMap[$intent])) {
                $category = $categoryMap[$intent];
                $faq = ClinicFaq::where('clinic_id', $session->clinic_id)
                    ->where('category', $category)
                    ->where('is_active', true)
                    ->first();

                if ($faq) {
                    $this->messenger->sendTextMessage(
                        $session->fb_messenger_id,
                        $this->translator->trans('booking.faq_answer_nlp', ['question' => $faq->question, 'answer' => $faq->answer]),
                        $integration
                    );
                    
                    $session->updateStep('welcome');
                    return;
                }
            }
        }

        // 3. Absolute Fallback: standard welcome / menu helper
        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $this->translator->trans('error.faq_not_understood'),
            $integration
        );
        $this->showFaqCategories($session, $integration);
    }

    /**
     * Show single FAQ details from NLP intent routing
     */
    protected function showFaqFromIntent(ChatSession $session, string $category, $integration): void
    {
        $faq = ClinicFaq::where('clinic_id', $session->clinic_id)
            ->where('category', $category)
            ->where('is_active', true)
            ->first();

        if ($faq) {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('booking.faq_answer_nlp', ['question' => $faq->question, 'answer' => $faq->answer]),
                $integration
            );
            
            $session->updateStep('welcome');
        } else {
            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('error.faq_not_found'),
                $integration
            );
            $this->showMainMenu($session, $integration);
        }
    }

    /**
     * Handle price query with service name extraction
     */
    protected function handlePriceQuery(ChatSession $session, string $message, ?array $witResponse, $integration): void
    {
        $lower = strtolower($message);
        
        // Try to extract service name from Wit.ai
        $serviceName = $this->witAi->extractServiceName($witResponse);
        
        // If no service name from Wit.ai, try keyword extraction from message
        if (!$serviceName) {
            // Common service keywords
            $serviceKeywords = [
                'braces' => ['braces', 'bracket', 'ortho', 'orthodontics'],
                'cleaning' => ['cleaning', 'linis', 'prophylaxis', 'clean'],
                'extraction' => ['extraction', 'bunot', 'tanggal', 'extract'],
                'root canal' => ['root canal', 'rct', 'endodontics'],
                'whitening' => ['whitening', 'bleaching', 'puti', 'paputi', 'whiten'],
                'pasta' => ['pasta', 'filling', 'restoration', 'butas'],
                'denture' => ['denture', 'pustiso', 'false teeth'],
                'crown' => ['crown', 'korona', 'bridge'],
                'veneer' => ['veneer', 'veneers'],
                'consultation' => ['consultation', 'checkup', 'check-up', 'xray', 'x-ray'],
            ];

            foreach ($serviceKeywords as $service => $keywords) {
                foreach ($keywords as $keyword) {
                    if (str_contains($lower, $keyword)) {
                        $serviceName = $service;
                        break 2;
                    }
                }
            }
        }

        // If we found a service name, search for it
        if ($serviceName) {
            $this->searchAndShowServicePrice($session, $serviceName, $integration);
        } else {
            // Fallback to general pricing FAQ
            $this->showFaqFromIntent($session, 'pricing', $integration);
        }
    }

    /**
     * Search for service and show price
     */
    protected function searchAndShowServicePrice(ChatSession $session, string $searchTerm, $integration): void
    {
        $services = DentalService::where('clinic_id', $session->clinic_id)
            ->where(function ($query) use ($searchTerm) {
                $query->where('service_name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('category', 'LIKE', "%{$searchTerm}%");
            })
            ->active()
            ->orderBy('price')
            ->limit(10)
            ->get();

        if ($services->isEmpty()) {
            // Try FAQ fallback
            $faqs = ClinicFaq::where('clinic_id', $session->clinic_id)
                ->where('category', 'pricing')
                ->where('is_active', true)
                ->get();

            foreach ($faqs as $faq) {
                $keywords = is_array($faq->keywords) ? $faq->keywords : json_decode($faq->keywords ?? '[]', true);
                if (is_array($keywords)) {
                    foreach ($keywords as $kw) {
                        if (!empty($kw) && str_contains(strtolower($searchTerm), strtolower($kw))) {
                            $this->messenger->sendTextMessage(
                                $session->fb_messenger_id,
                                "💡 *PRICING INFO:*\n\n❓ *{$faq->question}*\n👉 {$faq->answer}",
                                $integration
                            );
                            $session->updateStep('welcome');
                            return;
                        }
                    }
                }
            }

            $this->messenger->sendTextMessage(
                $session->fb_messenger_id,
                $this->translator->trans('booking.price_search_not_found', ['searchTerm' => $searchTerm]),
                $integration
            );
            $session->updateStep('welcome');
            return;
        }

        // Show found services
        $message = $this->translator->trans('booking.price_search_title') . "\n";
        $message .= "━━━━━━━━━━━━━━\n\n";
        $message .= $this->translator->trans('booking.price_search_results', ['searchTerm' => $searchTerm]) . "\n\n";

        foreach ($services as $index => $service) {
            $message .= ($index + 1) . ". {$service->service_name}\n";
            $message .= "   💰 ₱" . number_format($service->price, 2) . "\n";
            $message .= "   ⏱️ " . $this->translator->trans('common.minutes', ['count' => $service->duration_minutes]) . "\n";
            if ($service->category) {
                $message .= "   📂 Category: {$service->category}\n";
            }
            if ($service->description) {
                $message .= "   📝 {$service->description}\n";
            }
            $message .= "\n";
        }

        if ($services->count() >= 10) {
            $message .= $this->translator->trans('booking.price_search_limit') . "\n\n";
        }

        $message .= $this->translator->trans('booking.price_search_prompt');

        $this->messenger->sendTextMessage(
            $session->fb_messenger_id,
            $message,
            $integration
        );

        $session->updateStep('welcome');
    }

    /**
     * Parse and substitute placeholder tags in templates.
     */
    protected function parseTemplate(string $template, Clinic $clinic, ChatSession $session): string
    {
        $patientName = 'Valued Patient';
        if ($session->patient) {
            $patientName = $session->patient->full_name;
        } elseif ($session->getContext('booking.patient_name')) {
            $patientName = $session->getContext('booking.patient_name');
        }

        $replacements = [
            '{clinic_name}' => $clinic->clinic_name ?? 'Our Clinic',
            '{patient_name}' => $patientName,
            '{owner_name}' => $clinic->owner_name ?? 'Doctor',
            '{clinic_phone}' => $clinic->contact_number ?? '',
            '{clinic_address}' => $clinic->address ?? '',
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }
}

