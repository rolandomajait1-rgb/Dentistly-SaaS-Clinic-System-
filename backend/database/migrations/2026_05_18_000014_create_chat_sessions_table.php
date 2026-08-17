<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('fb_messenger_id');
            $table->string('session_id')->unique();
            // Using string instead of enum so new steps can be added without migrations
            $table->string('current_step')->default('welcome');
            $table->json('context_data')->nullable(); // Store temporary booking data
            $table->timestamp('last_interaction_at');
            $table->timestamps();
            
            $table->index(['clinic_id', 'fb_messenger_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_sessions');
    }
};
