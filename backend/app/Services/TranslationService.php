<?php

namespace App\Services;

class TranslationService
{
    protected array $translations = [
        // Welcome Messages
        'welcome.greeting' => [
            'en' => "👋 Hi! Welcome to {clinic}!",
            'tl' => "👋 Kumusta! Maligayang pagdating sa {clinic}!",
        ],
        'welcome.intro' => [
            'en' => "I'm your dental appointment assistant. I'm here to help you book appointments, check your schedule, and answer your questions.",
            'tl' => "Ako ang iyong dental appointment assistant. Nandito ako para tulungan ka sa pag-book ng appointment, tingnan ang iyong schedule, at sagutin ang iyong mga tanong.",
        ],
        'welcome.lets_start' => [
            'en' => "Let's get started! 😊",
            'tl' => "Magsimula na tayo! 😊",
        ],

        // Main Menu
        'menu.title' => [
            'en' => "📋 MAIN MENU",
            'tl' => "📋 PANGUNAHING MENU",
        ],
        'menu.what_to_do' => [
            'en' => "What would you like to do?",
            'tl' => "Ano ang gusto mong gawin?",
        ],
        'menu.book_appointment' => [
            'en' => "📅 Book Appointment",
            'tl' => "📅 Mag-book ng Appointment",
        ],
        'menu.my_appointments' => [
            'en' => "📋 My Appointments",
            'tl' => "📋 Aking mga Appointment",
        ],
        'menu.view_history' => [
            'en' => "📜 View History",
            'tl' => "📜 Tingnan ang Kasaysayan",
        ],
        'menu.cancel_reschedule' => [
            'en' => "🔄 Cancel/Reschedule",
            'tl' => "🔄 Kanselahin/I-reschedule",
        ],
        'menu.contact_us' => [
            'en' => "📞 Contact Us",
            'tl' => "📞 Makipag-ugnayan",
        ],
        'menu.faqs' => [
            'en' => "💡 FAQs",
            'tl' => "💡 Mga Tanong",
        ],
        'menu.or_choose' => [
            'en' => "Or choose from these options:",
            'tl' => "O pumili mula sa mga opsyon:",
        ],
        'menu.returning' => [
            'en' => "🔄 Returning to main menu...",
            'tl' => "🔄 Bumabalik sa pangunahing menu...",
        ],
        'menu.end_conversation' => [
            'en' => "👋 End Conversation",
            'tl' => "👋 Tapusin ang Usapan",
        ],
        'menu.goodbye' => [
            'en' => "👋 Thank you for reaching out! Have a great day! 😊\n\nIf you need help again in the future, just type 'hi' or 'hello' to restart the conversation.",
            'tl' => "👋 Maraming salamat po sa inyong pakikipag-ugnayan! Magandang araw! 😊\n\nKung kailangan ninyo uling tulong sa susunod, mag-type lang ng 'hi' o 'hello' para simulan muli ang usapan.",
        ],


        // Booking
        'booking.categories_title' => [
            'en' => "🦷 SERVICE CATEGORIES",
            'tl' => "🦷 MGA KATEGORYA NG SERBISYO",
        ],
        'booking.select_category' => [
            'en' => "Please select a category:",
            'tl' => "Pumili ng kategorya:",
        ],
        'booking.reply_number' => [
            'en' => "Reply with the number of your preferred category.",
            'tl' => "Tumugon gamit ang numero ng iyong gustong kategorya.",
        ],
        'booking.services_count' => [
            'en' => "{count} services",
            'tl' => "{count} serbisyo",
        ],
        'booking.select_service' => [
            'en' => "Please select a service:",
            'tl' => "Pumili ng serbisyo:",
        ],
        'booking.reply_or_back' => [
            'en' => "Reply with the number or type 'back' to choose another category.",
            'tl' => "Tumugon gamit ang numero o i-type ang 'back' para pumili ng ibang kategorya.",
        ],
        'booking.selected' => [
            'en' => "✅ Selected: {service}",
            'tl' => "✅ Napili: {service}",
        ],
        'booking.price' => [
            'en' => "💰 Price: ₱{price}",
            'tl' => "💰 Presyo: ₱{price}",
        ],
        'booking.awesome' => [
            'en' => "Awesome! Tap the button below to pick your preferred date and time from our interactive calendar.",
            'tl' => "Ayos! I-tap ang button sa ibaba para pumili ng iyong gustong petsa at oras mula sa aming interactive calendar.",
        ],
        'booking.select_date_time' => [
            'en' => "📅 Select Date & Time",
            'tl' => "📅 Pumili ng Petsa at Oras",
        ],
        'booking.click_button' => [
            'en' => "Please click the '📅 Select Date & Time' button above to choose your schedule, or type 'cancel' to exit.",
            'tl' => "Paki-click ang '📅 Pumili ng Petsa at Oras' button sa itaas para pumili ng iyong schedule, o i-type ang 'cancel' para lumabas.",
        ],
        'booking.selected_date' => [
            'en' => "✅ Selected date: {date}",
            'tl' => "✅ Napiling petsa: {date}",
        ],
        'booking.selected_time' => [
            'en' => "✅ Selected time: {time}",
            'tl' => "✅ Napiling oras: {time}",
        ],
        'booking.welcome_back' => [
            'en' => "👋 Welcome back, {name}!",
            'tl' => "👋 Maligayang pagbabalik, {name}!",
        ],
        'booking.reason_visit' => [
            'en' => "Finally, what's the reason for your visit today? 🦷",
            'tl' => "Sa wakas, ano ang dahilan ng iyong pagbisita ngayon? 🦷",
        ],

        // DPA Consent
        'dpa.title' => [
            'en' => "🔒 DATA PRIVACY NOTICE",
            'tl' => "🔒 PAUNAWA SA PRIVACY NG DATA",
        ],
        'dpa.message' => [
            'en' => "To proceed with booking an appointment at {clinic}, we need to collect and process your personal and health information (Name, Contact Number, Address, Age, Medical History, and Reason for Visit).\n\nThis data will be kept secure and private. You can read our Privacy Policy here: {url}\n\nDo you agree to proceed? 📄",
            'tl' => "Upang magpatuloy sa pag-book ng appointment sa {clinic}, kailangan naming kolektahin at iproseso ang iyong personal at health information (Pangalan, Contact Number, Address, Edad, Medical History, at Dahilan ng Pagbisita).\n\nAng data na ito ay papanatilihing secure at private. Maaari mong basahin ang aming Privacy Policy dito: {url}\n\nSumasang-ayon ka ba na magpatuloy? 📄",
        ],
        'dpa.agree' => [
            'en' => "👍 I Agree",
            'tl' => "👍 Sumasang-ayon",
        ],
        'dpa.decline' => [
            'en' => "👎 I Decline",
            'tl' => "👎 Hindi Sumasang-ayon",
        ],
        'dpa.cannot_proceed' => [
            'en' => "❌ Booking cannot proceed without your consent. Returning to main menu...",
            'tl' => "❌ Hindi makakapag-proceed ang booking kung walang iyong pahintulot. Bumabalik sa main menu...",
        ],

        // Patient Information Form
        'form.title' => [
            'en' => "📋 PATIENT INFORMATION",
            'tl' => "📋 IMPORMASYON NG PASYENTE",
        ],
        'form.provide_info' => [
            'en' => "Please provide your information so we can process your appointment.",
            'tl' => "Pakibigay ang iyong impormasyon para maproseso namin ang iyong appointment.",
        ],
        'form.full_name' => [
            'en' => "Could you please provide your full name? 😊",
            'tl' => "Maaari mo bang ibigay ang iyong buong pangalan? 😊",
        ],
        'form.contact_number' => [
            'en' => "Great! Now, what's your contact number? 📱",
            'tl' => "Ayos! Ngayon, ano ang iyong contact number? 📱",
        ],
        'form.address' => [
            'en' => "Perfect! What's your complete address? 🏠",
            'tl' => "Perpekto! Ano ang iyong kumpletong address? 🏠",
        ],
        'form.age' => [
            'en' => "Thanks! How old are you? 🎂",
            'tl' => "Salamat! Ilang taon ka na? 🎂",
        ],
        'form.medical_history' => [
            'en' => "Do you have any medical conditions or allergies we should know about? (Type 'none' if none) 💊",
            'tl' => "Mayroon ka bang medical condition o allergy na dapat naming malaman? (I-type ang 'wala' kung wala) 💊",
        ],

        // Booking Confirmation
        'confirm.title' => [
            'en' => "📋 BOOKING SUMMARY",
            'tl' => "📋 BUOD NG BOOKING",
        ],
        'confirm.name' => [
            'en' => "👤 Name: {name}",
            'tl' => "👤 Pangalan: {name}",
        ],
        'confirm.contact' => [
            'en' => "📞 Contact: {contact}",
            'tl' => "📞 Contact: {contact}",
        ],
        'confirm.address' => [
            'en' => "📍 Address: {address}",
            'tl' => "📍 Address: {address}",
        ],
        'confirm.age' => [
            'en' => "🎂 Age: {age}",
            'tl' => "🎂 Edad: {age}",
        ],
        'confirm.service' => [
            'en' => "🦷 Service: {service}",
            'tl' => "🦷 Serbisyo: {service}",
        ],
        'confirm.date' => [
            'en' => "📅 Date: {date}",
            'tl' => "📅 Petsa: {date}",
        ],
        'confirm.time' => [
            'en' => "⏰ Time: {time}",
            'tl' => "⏰ Oras: {time}",
        ],
        'confirm.price' => [
            'en' => "💰 Price: ₱{price}",
            'tl' => "💰 Presyo: ₱{price}",
        ],
        'confirm.reason' => [
            'en' => "📝 Reason: {reason}",
            'tl' => "📝 Dahilan: {reason}",
        ],
        'confirm.is_correct' => [
            'en' => "Is this information correct?",
            'tl' => "Tama ba ang impormasyong ito?",
        ],
        'confirm.please_confirm' => [
            'en' => "Please confirm:",
            'tl' => "Pakikumpirma:",
        ],
        'confirm.yes_submit' => [
            'en' => "✅ Yes, Submit",
            'tl' => "✅ Oo, Isumite",
        ],
        'confirm.cancel' => [
            'en' => "❌ Cancel",
            'tl' => "❌ Kanselahin",
        ],

        // Booking Success
        'success.title' => [
            'en' => "✅ BOOKING RECEIVED!",
            'tl' => "✅ NATANGGAP ANG BOOKING!",
        ],
        'success.date' => [
            'en' => "📅 Date: {date}",
            'tl' => "📅 Petsa: {date}",
        ],
        'success.time' => [
            'en' => "⏰ Time: {time}",
            'tl' => "⏰ Oras: {time}",
        ],
        'success.queue' => [
            'en' => "🎫 Queue Number: #{number}",
            'tl' => "🎫 Queue Number: #{number}",
        ],
        'success.reference' => [
            'en' => "Reference: {ref}",
            'tl' => "Reference: {ref}",
        ],
        'success.status' => [
            'en' => "Status: ⏳ Pending Approval",
            'tl' => "Status: ⏳ Naghihintay ng Approval",
        ],
        'success.message' => [
            'en' => "Your appointment is being reviewed by our staff. Please arrive at the clinic around your scheduled time ({time}) to avoid overcrowding.\n\nYou'll receive a notification once approved. Thank you for choosing us! 😊",
            'tl' => "Ang iyong appointment ay sinusuri ng aming staff. Mangyaring dumating sa clinic bandang iyong naka-schedule na oras ({time}) upang maiwasan ang pagsiksik.\n\nMakakatanggap ka ng notification kapag naaprubahan na. Salamat sa pagpili sa amin! 😊",
        ],

        // Errors
        'error.invalid_selection' => [
            'en' => "Invalid selection. Please enter the number of your preferred {item}.",
            'tl' => "Hindi wastong pagpili. Pakipasok ang numero ng iyong gustong {item}.",
        ],
        'error.no_services' => [
            'en' => "Sorry, no services are available at the moment. Please contact us directly.",
            'tl' => "Paumanhin, walang available na serbisyo sa ngayon. Mangyaring makipag-ugnayan sa amin nang direkta.",
        ],
        'error.not_understood' => [
            'en' => "I didn't understand that. Please choose from the menu options.",
            'tl' => "Hindi ko naintindihan iyan. Mangyaring pumili mula sa mga opsyon sa menu.",
        ],

        'booking.no_services_in_category' => [
            'en' => 'Sorry, no services available in this category.',
            'tl' => 'Paumanhin, walang available na serbisyo sa kategoryang ito.',
        ],
        'error.invalid_name' => [
            'en' => 'Please enter a valid name.',
            'tl' => 'Mangyaring maglagay ng wastong pangalan.',
        ],
        'error.invalid_contact' => [
            'en' => 'Please enter a valid Philippine mobile number (e.g., 09123456789).',
            'tl' => 'Mangyaring maglagay ng wastong Philippine mobile number (hal., 09123456789).',
        ],
        'error.invalid_age' => [
            'en' => 'Please enter a valid age.',
            'tl' => 'Mangyaring maglagay ng wastong edad.',
        ],
        'error.no_time_slots' => [
            'en' => 'Sorry, no available time slots for this date. Please choose another date.',
            'tl' => 'Paumanhin, walang available na time slot para sa petsang ito. Mangyaring pumili ng ibang petsa.',
        ],
        'error.slot_taken_webview' => [
            'en' => 'This slot is no longer available. Please choose another time.',
            'tl' => 'Ang slot na ito ay hindi na available. Mangyaring pumili ng ibang oras.',
        ],
        'error.slot_taken_chat' => [
            'en' => '⚠️ Sorry, that time slot was just booked by someone else! Please choose a new date and time.',
            'tl' => '⚠️ Paumanhin, ang time slot na iyon ay na-book na ng iba! Mangyaring pumili ng bagong petsa at oras.',
        ],
        'error.something_went_wrong' => [
            'en' => 'Sorry, something went wrong. Please try again or contact us directly.',
            'tl' => 'Paumanhin, may nagkamali. Mangyaring subukan muli o makipag-ugnayan sa amin nang direkta.',
        ],
        'booking.cancelled' => [
            'en' => 'Booking cancelled. No worries! You can start a new booking anytime.',
            'tl' => 'Kanselado ang booking. Huwag mag-alala! Maaari kang magsimula ng bagong booking anumang oras.',
        ],
        'error.no_appointments_to_cancel' => [
            'en' => "You don't have any upcoming appointments to cancel.",
            'tl' => "Wala kang darating na appointment na maaaring kanselahin.",
        ],
        'booking.select_appointment_to_cancel' => [
            'en' => 'Please select an appointment to cancel:',
            'tl' => 'Mangyaring pumili ng appointment na ikakansela:',
        ],
        'booking.cancel_button_label' => [
            'en' => 'Cancel {date} {time}',
            'tl' => 'Kanselahin ang {date} {time}',
        ],
        'booking.cancel_success' => [
            'en' => '✅ Your appointment has been successfully cancelled. The time slot is now open.',
            'tl' => '✅ Matagumpay na nakansela ang iyong appointment. Bukas na muli ang time slot.',
        ],
        'error.cannot_cancel' => [
            'en' => 'Sorry, this appointment cannot be cancelled or no longer exists.',
            'tl' => 'Paumanhin, ang appointment na ito ay hindi maaaring kanselahin o hindi na umiiral.',
        ],
        'error.no_appointments_yet' => [
            'en' => "You don't have any appointments yet. Would you like to book one?",
            'tl' => "Wala ka pang appointment. Gusto mo bang mag-book ng isa?",
        ],
        'error.no_active_appointments' => [
            'en' => "You don't have any active appointments. Would you like to book one?",
            'tl' => "Wala kang aktibong appointment. Gusto mo bang mag-book ng isa?",
        ],
        'error.no_history_yet' => [
            'en' => '📋 No history found yet. Complete an appointment first!',
            'tl' => '📋 Wala pang nahanap na history. Kumpletuhin muna ang isang appointment!',
        ],
        'booking.price_search_title' => [
            'en' => '💰 PRICING INFORMATION',
            'tl' => '💰 IMPORMASYON SA PRESYO',
        ],
        'booking.price_search_results' => [
            'en' => "Here are the services matching '{searchTerm}':",
            'tl' => "Narito ang mga serbisyong tumutugma sa '{searchTerm}':",
        ],
        'booking.price_search_limit' => [
            'en' => 'Showing first 10 results. Be more specific for better results.',
            'tl' => 'Ipinapakita ang unang 10 resulta. Maging mas tiyak para sa mas magandang resulta.',
        ],
        'booking.price_search_prompt' => [
            'en' => 'Would you like to book any of these services?',
            'tl' => 'Gusto mo bang i-book ang alinman sa mga serbisyong ito?',
        ],
        'booking.price_search_not_found' => [
            'en' => "Sorry, I couldn't find pricing information for '{searchTerm}'. Please try asking about a specific service or type 'menu' to see all options.",
            'tl' => "Paumanhin, hindi ko nahanap ang impormasyon sa presyo para sa '{searchTerm}'. Subukang magtanong tungkol sa partikular na serbisyo o i-type ang 'menu' para makita ang lahat ng opsyon.",
        ],

        'error.faq_not_understood' => [
            'en' => "Sorry, I didn't quite understand your question. You can choose from the categories below:",
            'tl' => "Sorry, hindi ko masyadong naintindihan ang inyong tanong. Maaari po kayong pumili sa mga kategorya sa ibaba:",
        ],
        'error.faq_not_found' => [
            'en' => "I couldn't find matching information in our FAQs. Let me show you the menu.",
            'tl' => "Hindi ko nahanap ang tugmang impormasyon sa aming FAQs. Hayaan mong ipakita ko ang menu.",
        ],
        'booking.website_visit' => [
            'en' => "Please visit our website for more details:\n\n",
            'tl' => "Mangyaring bisitahin ang aming website para sa karagdagang detalye:\n\n",
        ],
        'booking.faq_answer' => [
            'en' => "💡 *FAQ ANSWER:*\n\n❓ *{question}*\n👉 {answer}",
            'tl' => "💡 *KASAGUTAN SA FAQ:*\n\n❓ *{question}*\n👉 {answer}",
        ],
        'booking.faq_answer_nlp' => [
            'en' => "💡 *FAQ ANSWER (via NLP):*\n\n❓ *{question}*\n👉 {answer}",
            'tl' => "💡 *KASAGUTAN SA FAQ (via NLP):*\n\n❓ *{question}*\n👉 {answer}",
        ],
        'booking.faq_pricing_info' => [
            'en' => "💡 *PRICING INFO:*\n\n❓ *{question}*\n👉 {answer}",
            'tl' => "💡 *IMPORMASYON SA PRESYO:*\n\n❓ *{question}*\n👉 {answer}",
        ],

        // Common
        'common.minutes' => [
            'en' => "{count} minutes",
            'tl' => "{count} minuto",
        ],
        'common.per_session' => [
            'en' => "per session",
            'tl' => "bawat session",
        ],
        'common.per_tooth' => [
            'en' => "per tooth",
            'tl' => "bawat ngipin",
        ],
        'common.per_unit' => [
            'en' => "per unit",
            'tl' => "bawat unit",
        ],
    ];

    protected string $defaultLanguage = 'en';
    protected string $currentLanguage = 'en';

    /**
     * Set current language
     */
    public function setLanguage(string $lang): void
    {
        if (in_array($lang, ['en', 'tl'])) {
            $this->currentLanguage = $lang;
        }
    }

    /**
     * Get current language
     */
    public function getLanguage(): string
    {
        return $this->currentLanguage;
    }

    /**
     * Translate a key
     */
    public function trans(string $key, array $replacements = [], ?string $lang = null): string
    {
        $lang = $lang ?? $this->currentLanguage;

        if (!isset($this->translations[$key])) {
            return $key;
        }

        $translation = $this->translations[$key][$lang] ?? $this->translations[$key][$this->defaultLanguage] ?? $key;

        // Replace placeholders
        foreach ($replacements as $placeholder => $value) {
            $translation = str_replace('{' . $placeholder . '}', $value, $translation);
        }

        return $translation;
    }

    /**
     * Get translation in both languages
     */
    public function transBoth(string $key, array $replacements = []): array
    {
        return [
            'en' => $this->trans($key, $replacements, 'en'),
            'tl' => $this->trans($key, $replacements, 'tl'),
        ];
    }

    /**
     * Detect language from message
     */
    public function detectLanguage(string $message): string
    {
        $lower = strtolower($message);

        // Tagalog indicators
        $tagalogWords = [
            'kumusta', 'magkano', 'ano', 'paano', 'saan', 'kailan', 'bakit',
            'gusto', 'kailangan', 'mayroon', 'wala', 'oo', 'hindi',
            'salamat', 'paki', 'mangyaring', 'po', 'nga', 'lang',
            'ngipin', 'linis', 'bunot', 'pasta', 'pustiso',
        ];

        foreach ($tagalogWords as $word) {
            if (str_contains($lower, $word)) {
                return 'tl';
            }
        }

        return 'en';
    }

    /**
     * Format bilingual message
     */
    public function bilingual(string $key, array $replacements = []): string
    {
        $en = $this->trans($key, $replacements, 'en');
        $tl = $this->trans($key, $replacements, 'tl');

        if ($en === $tl) {
            return $en;
        }

        return "{$en}\n\n{$tl}";
    }
}
