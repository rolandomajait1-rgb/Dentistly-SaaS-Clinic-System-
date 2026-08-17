<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\{Clinic, CalendarSlot};
use Carbon\Carbon;

class GenerateCalendarSlots extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'slots:generate {clinic_id? : The ID of the clinic}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate available calendar slots for the next 30 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $clinicId = $this->argument('clinic_id');

        if ($clinicId) {
            $clinics = Clinic::where('id', $clinicId)->get();
        } else {
            $clinics = Clinic::all();
        }

        if ($clinics->isEmpty()) {
            $this->error('No clinics found.');
            return 1;
        }

        foreach ($clinics as $clinic) {
            $this->info("Generating slots for clinic: {$clinic->clinic_name} (ID: {$clinic->id})");
            
            $startDate = Carbon::today()->addDay();
            $endDate = Carbon::today()->addDays(30);
            $slotsCreated = 0;

            for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
                // Skip Sundays
                if ($date->isSunday()) {
                    continue;
                }

                // Standard operating hours: 9 AM to 6 PM (skip 12-1 PM lunch)
                $times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
                
                // Saturdays only until 3 PM
                if ($date->isSaturday()) {
                    $times = ['09:00', '10:00', '11:00', '13:00', '14:00'];
                }

                foreach ($times as $time) {
                    // Check if slot already exists to prevent duplicate entries
                    $exists = CalendarSlot::where('clinic_id', $clinic->id)
                        ->whereDate('slot_date', $date)
                        ->whereTime('slot_time', $time . ':00')
                        ->exists();

                    if (!$exists) {
                        CalendarSlot::create([
                            'clinic_id' => $clinic->id,
                            'slot_date' => $date->format('Y-m-d'),
                            'slot_time' => $time . ':00',
                            'status' => 'available',
                        ]);
                        $slotsCreated++;
                    }
                }
            }

            $this->info("Successfully created {$slotsCreated} slots for {$clinic->clinic_name}.");
        }

        return 0;
    }
}
