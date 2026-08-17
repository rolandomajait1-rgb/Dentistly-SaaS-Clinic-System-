<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WitAiService
{
    protected string $token;
    protected string $version = '20231001'; // Fixed version date para sa API stability

    public function __construct()
    {
        $this->token = env('WIT_AI_TOKEN', '');
    }

    /**
     * Ipapasa ang message ng user kay Wit.ai para i-analyze
     */
    public function analyze(string $message): ?array
    {
        if (empty($this->token)) {
            Log::warning('Wit.ai token is missing. Please check your .env file.');
            return null;
        }

        try {
            $response = Http::withToken($this->token)
                ->get("https://api.wit.ai/message", [
                    'v' => $this->version,
                    'q' => $message,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Wit.ai API Error: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Wit.ai Connection Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Kukunin ang pinaka-siguradong "Intent" (gustong mangyari) ng user
     */
    public function getTopIntent(?array $witResponse): ?string
    {
        if (!$witResponse || empty($witResponse['intents'])) {
            return null;
        }

        $topIntent = null;
        $highestConfidence = 0;

        foreach ($witResponse['intents'] as $intent) {
            if ($intent['confidence'] > $highestConfidence) {
                $highestConfidence = $intent['confidence'];
                $topIntent = $intent['name'];
            }
        }

        // Kung 70% pataas ang tiwala ni Wit.ai, tanggapin natin ito
        if ($highestConfidence > 0.70) {
            return $topIntent;
        }

        return null;
    }

    /**
     * Extract dental service name from Wit.ai entities
     */
    public function extractServiceName(?array $witResponse): ?string
    {
        if (!$witResponse || empty($witResponse['entities'])) {
            return null;
        }

        // Check for dental_service entity
        if (isset($witResponse['entities']['dental_service:dental_service'])) {
            $services = $witResponse['entities']['dental_service:dental_service'];
            if (!empty($services) && isset($services[0]['value'])) {
                return $services[0]['value'];
            }
        }

        // Fallback: check for wit$search_query
        if (isset($witResponse['entities']['wit$search_query:search_query'])) {
            $queries = $witResponse['entities']['wit$search_query:search_query'];
            if (!empty($queries) && isset($queries[0]['value'])) {
                return $queries[0]['value'];
            }
        }

        return null;
    }

    /**
     * Get all entities from Wit.ai response
     */
    public function getEntities(?array $witResponse): array
    {
        if (!$witResponse || empty($witResponse['entities'])) {
            return [];
        }

        return $witResponse['entities'];
    }
}