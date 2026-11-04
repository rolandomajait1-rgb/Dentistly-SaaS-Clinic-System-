<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== FACEBOOK / META CONFIGURATION AUDIT ===" . PHP_EOL;
echo "APP_URL: " . config('app.url') . PHP_EOL;
echo "config('services.facebook.app_id'): " . (config('services.facebook.app_id') ?: '(empty)') . PHP_EOL;
echo "config('services.facebook.app_secret'): " . (config('services.facebook.app_secret') ? 'SET' : '(empty)') . PHP_EOL;
echo "config('services.facebook.webhook_verify_token'): " . (config('services.facebook.webhook_verify_token') ?: '(empty)') . PHP_EOL;
echo "config('services.facebook.page_access_token'): " . (config('services.facebook.page_access_token') ? 'SET' : '(empty)') . PHP_EOL;
echo "config('dental.facebook.webhook_verify_token'): " . (config('dental.facebook.webhook_verify_token') ?: '(empty)') . PHP_EOL;
echo "config('dental.facebook.page_access_token'): " . (config('dental.facebook.page_access_token') ? 'SET' : '(empty)') . PHP_EOL;
echo "env('MESSENGER_VERIFY_TOKEN'): " . (env('MESSENGER_VERIFY_TOKEN') ?: '(empty)') . PHP_EOL;
echo "env('FB_PAGE_ID'): " . (env('FB_PAGE_ID') ?: '(empty)') . PHP_EOL;

echo PHP_EOL . "=== DATABASE FB INTEGRATIONS ===" . PHP_EOL;
$integrations = \App\Models\FbPageIntegration::all();
echo "Found " . $integrations->count() . " integrations in database:" . PHP_EOL;
foreach ($integrations as $int) {
    echo " - ID: {$int->id}, Clinic ID: {$int->clinic_id}, Page ID: {$int->fb_page_id}, Name: {$int->fb_page_name}, Active: " . ($int->is_active ? 'YES' : 'NO') . ", VerifyToken: {$int->webhook_verify_token}" . PHP_EOL;
}

echo PHP_EOL . "=== TESTING META GRAPH API WITH CURRENT TOKEN ===" . PHP_EOL;
$token = env('MESSENGER_PAGE_ACCESS_TOKEN');
$pageId = env('FB_PAGE_ID');

if (!$token) {
    echo "No MESSENGER_PAGE_ACCESS_TOKEN configured in .env!" . PHP_EOL;
    exit;
}

$ch = curl_init("https://graph.facebook.com/v21.0/me?access_token={$token}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "GET /v21.0/me [HTTP {$httpCode}]:" . PHP_EOL;
echo $response . PHP_EOL;

if ($pageId) {
    $ch2 = curl_init("https://graph.facebook.com/v21.0/{$pageId}/subscribed_apps?access_token={$token}");
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
    $response2 = curl_exec($ch2);
    $httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    curl_close($ch2);

    echo PHP_EOL . "GET /v21.0/{$pageId}/subscribed_apps [HTTP {$httpCode2}]:" . PHP_EOL;
    echo $response2 . PHP_EOL;
}
