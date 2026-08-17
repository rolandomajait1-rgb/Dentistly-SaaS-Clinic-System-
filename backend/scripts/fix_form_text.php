<?php
$file = 'app/Services/ChatbotService.php';
$content = file_get_contents($file);

$replacements = [
    "What's your full name?" => "Could you please provide your full name? 😊",
    "What's your contact number?" => "Got it! What's your contact number? 📱",
    "What's your complete address?" => "Thanks! What's your complete address? 📍",
    "How old are you?" => "Noted! How old are you? 🎂",
    "Do you have any medical conditions or allergies we should know about? (Type 'none' if none)" => "Almost done! Do you have any medical conditions or allergies we should know about? (Just type 'none' if you don't have any) 🏥",
    "What's the reason for your visit?" => "Finally, what's the reason for your visit today? 🦷"
];

foreach ($replacements as $old => $new) {
    $content = str_replace($old, $new, $content);
}

file_put_contents($file, $content);
echo "Form text polished!";
