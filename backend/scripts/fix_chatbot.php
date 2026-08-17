<?php
$file = 'app/Services/ChatbotService.php';
$content = file_get_contents($file);

// Add typing indicator before sleep(1) and sleep(2)
// but ensure we don't double-add if it's already there
$content = preg_replace(
    '/(?<!sendTypingOn\(\$session->fb_messenger_id, \$integration\); \n        )(sleep\([12]\);)/',
    "\$this->messenger->sendTypingOn(\$session->fb_messenger_id, \$integration);\n        $1",
    $content
);

file_put_contents($file, $content);
echo "Typing indicators added!";
