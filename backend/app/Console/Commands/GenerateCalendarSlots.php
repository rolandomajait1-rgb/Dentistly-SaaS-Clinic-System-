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

            $startDate = Carbon::today();
            $endDate = Carbon::today()->addDays(30);

            $existingSlots = CalendarSlot::where('clinic_id', $clinic->id)
                ->whereDate('slot_date', '>=', $startDate)
                ->whereDate('slot_date', '<=', $endDate)
                ->get()
                ->keyBy(function ($slot) {
                    $d = $slot->slot_date instanceof Carbon ? $slot->slot_date->toDateString() : Carbon::parse($slot->slot_date)->toDateString();
                    $t = Carbon::parse($slot->slot_time)->format('H:i');
                    return $d . '_' . $t;
                });

            $activeAppointments = \App\Models\Appointment::where('clinic_id', $clinic->id)
                ->whereDate('appointment_date', '>=', $startDate)
                ->whereDate('appointment_date', '<=', $endDate)
                ->whereNotIn('status', ['cancelled', 'rejected', 'no_show'])
                ->get()
                ->groupBy(function ($appt) {
                    $d = Carbon::parse($appt->appointment_date)->toDateString();
                    $t = Carbon::parse($appt->appointment_time)->format('H:i');
                    return $d . '_' . $t;
                });

            $slotsCreated = 0;
            $now = now();
            $newSlots = [];

            for ($currDate = $startDate->copy(); $currDate <= $endDate; $currDate->addDay()) {
                $schedule = $this->getDaySchedule($clinic, $currDate);
                if (!$schedule) {
                    continue;
                }

                $openTime = Carbon::parse($currDate->toDateString() . ' ' . $schedule['open']);
                $closeTime = Carbon::parse($currDate->toDateString() . ' ' . $schedule['close']);
                $dateStr = $currDate->toDateString();

                for ($t = $openTime->copy(); $t->lt($closeTime); $t->addMinutes(30)) {
                    $timeStr = $t->format('H:i');
                    $key = $dateStr . '_' . $timeStr;

                    if ($timeStr === '12:00' || $timeStr === '12:30') {
                        continue;
                    }

                    $hasActiveAppt = $activeAppointments->has($key);
                    $apptId = $hasActiveAppt ? $activeAppointments->get($key)->first()->id : null;

                    if ($existingSlots->has($key)) {
                        $slot = $existingSlots->get($key);
                        if ($hasActiveAppt && $slot->status === 'available') {
                            $slot->update(['status' => 'booked', 'appointment_id' => $apptId]);
                        }
                    } else {
                        $newSlots[] = [
                            'clinic_id' => $clinic->id,
                            'slot_date' => $dateStr,
                            'slot_time' => $timeStr . ':00',
                            'status' => $hasActiveAppt ? 'booked' : 'available',
                            'appointment_id' => $apptId,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                        $slotsCreated++;
                    }
                }
            }

            if (!empty($newSlots)) {
                foreach (array_chunk($newSlots, 100) as $chunk) {
                    CalendarSlot::insertOrIgnore($chunk);
                }
            }

            $this->info("Successfully created/synced slots for {$clinic->clinic_name} (New: {$slotsCreated}).");
        }

        return 0;
    }

    protected function getDaySchedule(Clinic $clinic, Carbon $date): ?array
    {
        $rawHours = $clinic->operating_hours;
        if (is_string($rawHours)) {
            $rawHours = json_decode($rawHours, true);
        }

        $dayName = strtolower($date->format('l'));

        if (!is_array($rawHours) || empty($rawHours)) {
            if ($date->isSunday()) {
                return null;
            }
            return [
                'open' => '08:00',
                'close' => $date->isSaturday() ? '15:00' : '17:00',
            ];
        }

        $dayConfig = null;
        foreach ($rawHours as $k => $v) {
            if (strtolower(trim($k)) === $dayName) {
                $dayConfig = $v;
                break;
            }
        }

        if ($dayConfig === null) {
            return $date->isSunday() ? null : ['open' => '08:00', 'close' => '17:00'];
        }

        if (is_array($dayConfig)) {
            if (empty($dayConfig['enabled'])) {
                return null;
            }
            $open = !empty($dayConfig['open']) ? Carbon::parse($dayConfig['open'])->format('H:i') : '08:00';
            $close = !empty($dayConfig['close']) ? Carbon::parse($dayConfig['close'])->format('H:i') : '17:00';
            return ['open' => $open, 'close' => $close];
        }

        if (is_string($dayConfig)) {
            $val = strtolower(trim($dayConfig));
            if ($val === 'closed' || empty($val)) {
                return null;
            }
            if (str_contains($val, '-')) {
                $parts = explode('-', $val);
                $open = Carbon::parse(trim($parts[0]))->format('H:i');
                $close = Carbon::parse(trim($parts[1]))->format('H:i');
                return ['open' => $open, 'close' => $close];
            }
            return ['open' => '08:00', 'close' => '17:00'];
        }

        return null;
    }
}
