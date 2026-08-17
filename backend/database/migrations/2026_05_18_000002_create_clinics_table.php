<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('clinic_name');
            $table->string('owner_name');
            $table->string('email')->unique();
            $table->string('contact_number');
            $table->text('address');
            $table->string('business_permit')->nullable();
            $table->string('prc_license')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('timezone')->default('Asia/Manila');
            $table->json('branding_settings')->nullable();
            $table->json('notification_settings')->nullable();
            $table->json('operating_hours')->nullable();
            $table->enum('status', ['active', 'suspended', 'trial', 'expired'])->default('trial');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinics');
    }
};
