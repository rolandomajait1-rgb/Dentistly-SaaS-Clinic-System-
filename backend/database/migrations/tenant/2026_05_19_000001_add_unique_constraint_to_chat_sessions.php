<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add unique constraint to prevent duplicate chat sessions
     * for the same user on the same clinic under concurrent load.
     */
    public function up(): void
    {
        // First remove any existing duplicates (keep only the latest per user/clinic)
        \Illuminate\Support\Facades\DB::statement("
            DELETE FROM chat_sessions
            WHERE id NOT IN (
                SELECT MAX(id) FROM chat_sessions GROUP BY clinic_id, fb_messenger_id
            )
        ");

        Schema::table('chat_sessions', function (Blueprint $table) {
            $table->unique(['clinic_id', 'fb_messenger_id'], 'chat_sessions_clinic_user_unique');
        });
    }

    public function down(): void
    {
        Schema::table('chat_sessions', function (Blueprint $table) {
            $table->dropUnique('chat_sessions_clinic_user_unique');
        });
    }
};
