<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient_history', function (Blueprint $table) {
            $table->text('soap_subjective')->nullable()->after('doctor_notes');
            $table->text('soap_objective')->nullable()->after('soap_subjective');
            $table->text('soap_assessment')->nullable()->after('soap_objective');
            $table->text('soap_plan')->nullable()->after('soap_assessment');
            $table->json('vital_signs')->nullable()->after('soap_plan');
        });
    }

    public function down(): void
    {
        Schema::table('patient_history', function (Blueprint $table) {
            $table->dropColumn([
                'soap_subjective',
                'soap_objective',
                'soap_assessment',
                'soap_plan',
                'vital_signs',
            ]);
        });
    }
};
