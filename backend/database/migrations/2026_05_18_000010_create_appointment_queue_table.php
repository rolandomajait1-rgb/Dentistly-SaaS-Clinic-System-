<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->onDelete('cascade');
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->integer('queue_number');
            $table->enum('status', ['waiting', 'called', 'serving', 'completed', 'skipped'])->default('waiting');
            $table->timestamp('check_in_time')->nullable();
            $table->timestamp('called_time')->nullable();
            $table->timestamp('service_start_time')->nullable();
            $table->timestamp('service_end_time')->nullable();
            $table->integer('estimated_wait_minutes')->nullable();
            $table->timestamps();
            
            // Unique constraint for queue number per clinic per day
            $table->index(['clinic_id', 'queue_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_queue');
    }
};
