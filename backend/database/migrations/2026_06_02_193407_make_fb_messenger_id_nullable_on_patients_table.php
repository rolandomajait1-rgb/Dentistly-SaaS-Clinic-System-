<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Make fb_messenger_id nullable
            $table->string('fb_messenger_id')->nullable()->change();
            
            // Drop the old composite unique index
            $table->dropUnique(['clinic_id', 'fb_messenger_id']);
            
            // Add a new unique constraint on clinic_id and contact_number to avoid duplicates per clinic
            $table->unique(['clinic_id', 'contact_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropUnique(['clinic_id', 'contact_number']);
            $table->string('fb_messenger_id')->nullable(false)->change();
            $table->unique(['clinic_id', 'fb_messenger_id']);
        });
    }
};
