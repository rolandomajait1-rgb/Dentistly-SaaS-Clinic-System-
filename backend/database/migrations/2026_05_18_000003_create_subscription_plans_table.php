<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('plan_name');
            $table->string('plan_code')->unique();
            $table->decimal('monthly_price', 10, 2);
            $table->integer('appointment_limit')->nullable(); // null = unlimited
            $table->integer('staff_limit')->nullable(); // null = unlimited
            $table->integer('branch_limit')->default(1);
            $table->json('features'); // ['analytics', 'custom_branding', 'api_access', etc.]
            $table->boolean('is_active')->default(true);
            $table->integer('trial_days')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
