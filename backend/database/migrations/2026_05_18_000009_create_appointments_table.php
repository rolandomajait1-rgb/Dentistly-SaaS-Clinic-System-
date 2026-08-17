<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('dental_service_id')->constrained()->onDelete('cascade');
            $table->string('reference_number')->unique();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->enum('status', [
                'pending',      // Waiting for staff approval
                'confirmed',    // Approved by staff
                'checked_in',   // Patient arrived
                'in_progress',  // Service being provided
                'completed',    // Service finished
                'cancelled',    // Cancelled by patient or staff
                'no_show'       // Patient didn't show up
            ])->default('pending');
            $table->integer('queue_number')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('clinic_staff');
            $table->timestamp('approved_at')->nullable();
            $table->text('reason_for_visit')->nullable();
            $table->text('staff_notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index(['clinic_id', 'appointment_date']);
            $table->index(['clinic_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
