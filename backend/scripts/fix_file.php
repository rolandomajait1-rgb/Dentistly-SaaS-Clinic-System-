<?php

$file = 'app/Services/ChatbotService.php';
$content = file_get_contents($file);

$startPos = strpos($content, 'protected function handleWelcome(ChatSession $session, string $message, $integration): void');
$endPos = strpos($content, 'protected function handleMainMenu(ChatSession $session, string $message, $integration): void');

$replacement = "protected function handleWelcome(ChatSession \$session, string \$message, \$integration): void\n" .
    "    {\n" .
    "        \$lower = strtolower(trim(\$message));\n" .
    "        \$commonGreetings = ['hi', 'hello', 'hey', 'get started', 'start', ''];\n" .
    "        \n" .
    "        // If it's not a generic greeting, try Wit.ai immediately\n" .
    "        if (!in_array(\$lower, \$commonGreetings) && strlen(\$lower) > 2) {\n" .
    "            \$witResponse = \$this->witAi->analyze(\$message);\n" .
    "            \$intent = \$this->witAi->getTopIntent(\$witResponse);\n" .
    "\n" .
    "            if (\$intent) {\n" .
    "                // Found an intent right away, skip the greeting and process it\n" .
    "                \$session->updateStep('main_menu');\n" .
    "                match (\$intent) {\n" .
    "                    'book_appointment' => \$this->startBooking(\$session, \$integration),\n" .
    "                    'check_appointments' => \$this->showAppointments(\$session, \$integration),\n" .
    "                    'check_history' => \$this->showHistory(\$session, \$integration),\n" .
    "                    'reschedule_appointment' => \$this->showCancelReschedule(\$session, \$integration),\n" .
    "                    'contact_info' => \$this->showContactInfo(\$session, \$integration),\n" .
    "                    default => \$this->sendStandardWelcome(\$session, \$integration),\n" .
    "                };\n" .
    "                return;\n" .
    "            }\n" .
    "        }\n" .
    "        \n" .
    "        // If it's a greeting or Wit.ai didn't understand, send standard welcome\n" .
    "        \$this->sendStandardWelcome(\$session, \$integration);\n" .
    "    }\n" .
    "\n" .
    "    /**\n" .
    "     * Send standard welcome message\n" .
    "     */\n" .
    "    protected function sendStandardWelcome(ChatSession \$session, \$integration): void\n" .
    "    {\n" .
    "        \$clinic = \$session->clinic;\n" .
    "        \n" .
    "        \$welcomeMessage = \"👋 Hi! Welcome to {\$clinic->clinic_name}!\\n\\n\";\n" .
    "        \$welcomeMessage .= \"I'm your dental appointment assistant. I'm here to help you book appointments, check your schedule, and answer your questions.\\n\\n\";\n" .
    "        \$welcomeMessage .= \"Let's get started! 😊\";\n" .
    "\n" .
    "        \$this->messenger->sendTextMessage(\n" .
    "            \$session->fb_messenger_id,\n" .
    "            \$welcomeMessage,\n" .
    "            \$integration\n" .
    "        );\n" .
    "\n" .
    "        \$this->messenger->sendTypingOn(\$session->fb_messenger_id, \$integration);\n" .
    "        sleep(1);\n" .
    "        \$this->showMainMenu(\$session, \$integration);\n" .
    "    }\n" .
    "\n" .
    "    /**\n" .
    "     * Show main menu\n" .
    "     */\n" .
    "    protected function showMainMenu(ChatSession \$session, \$integration): void\n" .
    "    {\n" .
    "        \$session->updateStep('main_menu');\n" .
    "\n" .
    "        \$menuText = \"━━━━━━━━━━━━━━\\n\";\n" .
    "        \$menuText .= \"📋 MAIN MENU\\n\";\n" .
    "        \$menuText .= \"━━━━━━━━━━━━━━\\n\\n\";\n" .
    "        \$menuText .= \"What would you like to do?\";\n" .
    "\n" .
    "        \$buttons = [\n" .
    "            ['title' => '📅 Book Appointment', 'payload' => 'BOOK_APPOINTMENT'],\n" .
    "            ['title' => '📋 My Appointments', 'payload' => 'VIEW_APPOINTMENTS'],\n" .
    "            ['title' => '📜 View History', 'payload' => 'VIEW_HISTORY'],\n" .
    "        ];\n" .
    "\n" .
    "        \$this->messenger->sendButtonMessage(\n" .
    "            \$session->fb_messenger_id,\n" .
    "            \$menuText,\n" .
    "            \$buttons,\n" .
    "            \$integration\n" .
    "        );\n" .
    "\n" .
    "        // Send additional quick replies\n" .
    "        \$this->messenger->sendTypingOn(\$session->fb_messenger_id, \$integration);\n" .
    "        sleep(1);\n" .
    "        \$quickReplies = [\n" .
    "            ['title' => '🔄 Cancel/Reschedule', 'payload' => 'CANCEL_RESCHEDULE'],\n" .
    "            ['title' => '📞 Contact Us', 'payload' => 'CONTACT_US'],\n" .
    "        ];\n" .
    "\n" .
    "        \$this->messenger->sendQuickReplies(\n" .
    "            \$session->fb_messenger_id,\n" .
    "            \"Or choose from these options:\",\n" .
    "            \$quickReplies,\n" .
    "            \$integration\n" .
    "        );\n" .
    "    }\n" .
    "\n" .
    "    /**\n" .
    "     * Handle main menu selection\n" .
    "     */\n" .
    "    ";

$newContent = substr($content, 0, $startPos) . $replacement . substr($content, $endPos);

$unknownStart = "protected function handleUnknownIntent(ChatSession \$session, \$integration): void\n    {\n        \$this->messenger->sendTextMessage(\n            \$session->fb_messenger_id,\n            \"I didn't understand that. Please choose from the menu options.\",\n            \$integration\n        );";
$unknownEnd = "protected function handleUnknownIntent(ChatSession \$session, \$integration): void\n    {\n        \$this->messenger->sendTextMessage(\n            \$session->fb_messenger_id,\n            \"Hmm, I didn't quite catch that. 🤔 I'm still learning, but you can always use the menu below to navigate! 👇\",\n            \$integration\n        );";
$newContent = str_replace($unknownStart, $unknownEnd, $newContent);

file_put_contents($file, $newContent);
echo "Fixed!";
