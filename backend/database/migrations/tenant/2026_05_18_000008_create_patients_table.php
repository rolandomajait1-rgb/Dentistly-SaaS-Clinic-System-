<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->onDelete('cascade');
            $table->string('fb_messenger_id')->index();
            $table->string('full_name');
            $table->string('contact_number');
            $table->text('address')->nullable();
            $table->integer('age')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('medical_history')->nullable();
            $table->text('allergies')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Composite unique index for clinic_id and fb_messenger_id
            $table->unique(['clinic_id', 'fb_messenger_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
