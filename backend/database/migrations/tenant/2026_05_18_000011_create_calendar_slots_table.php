<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->onDelete('cascade');
            $table->date('slot_date');
            $table->time('slot_time');
            $table->enum('status', ['available', 'booked', 'blocked', 'holiday'])->default('available');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('blocked_by')->nullable()->constrained('clinic_staff');
            $table->string('block_reason')->nullable();
            $table->timestamps();
            
            // Unique constraint: one slot per clinic per date/time
            $table->unique(['clinic_id', 'slot_date', 'slot_time']);
            $table->index(['clinic_id', 'slot_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_slots');
    }
};
