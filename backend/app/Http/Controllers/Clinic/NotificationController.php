<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\{Appointment, Clinic};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class NotificationController extends Controller
{
    /**
     * Get clinic dashboard notifications
     */
    public function getNotifications(Request $request)
    {
        $staff = $request->user();
        $clinicId = $staff->clinic_id;
        $clinic = Clinic::with('fbPageIntegration')->find($clinicId);

        $clearedAt = Cache::get("clinic_notifs_cleared_at_{$staff->id}");
        $readIds = Cache::get("clinic_notifs_read_{$staff->id}", []);
        if (!is_array($readIds)) {
            $readIds = [];
        }

        $notifications = [];

        // 1. Pending appointment requests requiring staff action
        $pendingQuery = Appointment::where('clinic_id', $clinicId)
            ->whereIn('status', ['pending', 'Pending'])
            ->with(['patient', 'service'])
            ->orderByDesc('created_at');

        if ($clearedAt) {
            $pendingQuery->where('created_at', '>', $clearedAt);
        }

        $pendingAppointments = $pendingQuery->get();

        foreach ($pendingAppointments as $appt) {
            $patientName = $appt->patient?->full_name ?? 'Online Patient';
            $serviceName = $appt->service?->service_name ?? 'Dental Service';
            $dateFormatted = Carbon::parse($appt->appointment_date)->format('M j, Y');
            $timeFormatted = Carbon::parse($appt->appointment_time)->format('g:i A');
            $isFb = !empty($appt->patient?->fb_messenger_id) && !str_starts_with($appt->patient->fb_messenger_id, 'walkin_');

            $title = $isFb ? 'New Facebook Booking Request' : 'New Appointment Request';
            $description = "{$patientName} requested {$serviceName} for {$dateFormatted} at {$timeFormatted}.";

            $notifId = "appt_pending_{$appt->id}";

            $notifications[] = [
                'id' => $notifId,
                'title' => $title,
                'description' => $description,
                'time' => $appt->created_at ? $appt->created_at->toISOString() : now()->toISOString(),
                'type' => 'appointment_pending',
                'read' => in_array($notifId, $readIds, true),
                'icon' => $isFb ? 'facebook' : 'chat',
                'actionTab' => 'schedule',
                'appointmentId' => $appt->id,
            ];
        }

        // 2. Recent cancellations (last 7 days)
        $cancelledQuery = Appointment::where('clinic_id', $clinicId)
            ->whereIn('status', ['cancelled', 'Cancelled'])
            ->where('updated_at', '>=', now()->subDays(7))
            ->with(['patient', 'service'])
            ->orderByDesc('updated_at')
            ->take(10);

        if ($clearedAt) {
            $cancelledQuery->where('updated_at', '>', $clearedAt);
        }

        $cancelledAppointments = $cancelledQuery->get();

        foreach ($cancelledAppointments as $appt) {
            $patientName = $appt->patient?->full_name ?? 'Patient';
            $serviceName = $appt->service?->service_name ?? 'Dental Service';
            $reason = !empty($appt->cancellation_reason) ? ": \"{$appt->cancellation_reason}\"" : '.';

            $notifId = "appt_cancelled_{$appt->id}";

            $notifications[] = [
                'id' => $notifId,
                'title' => 'Appointment Cancelled',
                'description' => "Appointment for {$patientName} ({$serviceName}) was cancelled{$reason}",
                'time' => $appt->updated_at ? $appt->updated_at->toISOString() : now()->toISOString(),
                'type' => 'appointment_cancelled',
                'read' => in_array($notifId, $readIds, true),
                'icon' => 'cancel',
                'actionTab' => 'schedule',
                'appointmentId' => $appt->id,
            ];
        }

        // 3. Recent confirmed/approved appointments (last 7 days)
        $approvedQuery = Appointment::where('clinic_id', $clinicId)
            ->whereIn('status', ['approved', 'Approved'])
            ->where('updated_at', '>=', now()->subDays(7))
            ->with(['patient', 'service'])
            ->orderByDesc('updated_at')
            ->take(10);

        if ($clearedAt) {
            $approvedQuery->where('updated_at', '>', $clearedAt);
        }

        $approvedAppointments = $approvedQuery->get();

        foreach ($approvedAppointments as $appt) {
            $patientName = $appt->patient?->full_name ?? 'Patient';
            $serviceName = $appt->service?->service_name ?? 'Dental Service';
            $dateFormatted = Carbon::parse($appt->appointment_date)->format('M j, Y');
            $timeFormatted = Carbon::parse($appt->appointment_time)->format('g:i A');

            $notifId = "appt_approved_{$appt->id}";

            $notifications[] = [
                'id' => $notifId,
                'title' => 'Appointment Confirmed',
                'description' => "{$patientName}'s appointment for {$serviceName} is confirmed for {$dateFormatted} at {$timeFormatted} (Queue #{$appt->queue_number}).",
                'time' => $appt->updated_at ? $appt->updated_at->toISOString() : now()->toISOString(),
                'type' => 'appointment_approved',
                'read' => in_array($notifId, $readIds, true),
                'icon' => 'check_circle',
                'actionTab' => 'schedule',
                'appointmentId' => $appt->id,
            ];
        }

        // 4. System status notification
        $sysId = "sys_clinic_live_{$clinicId}";
        if (!$clearedAt || Carbon::parse($clearedAt)->lt(now()->subDays(1))) {
            $hasFb = $clinic && $clinic->fbPageIntegration && $clinic->fbPageIntegration->is_active;
            $pageName = !empty($clinic?->fbPageIntegration?->page_name) ? "'{$clinic->fbPageIntegration->page_name}'" : 'Facebook Page';
            $notifications[] = [
                'id' => $sysId,
                'title' => $hasFb ? 'Facebook Chatbot Connected' : 'Online Booking Portal Active',
                'description' => $hasFb
                    ? "Clinic {$pageName} is connected and listening for booking webhooks."
                    : "Public booking portal is live and accepting patient appointments at /book/{$clinic->slug}.",
                'time' => $clinic ? $clinic->updated_at?->toISOString() ?? now()->subHours(2)->toISOString() : now()->subHours(2)->toISOString(),
                'type' => 'system',
                'read' => in_array($sysId, $readIds, true),
                'icon' => $hasFb ? 'facebook' : 'sync',
                'actionTab' => 'settings',
                'appointmentId' => null,
            ];
        }

        // Sort descending by time
        usort($notifications, function ($a, $b) {
            return strtotime($b['time']) <=> strtotime($a['time']);
        });

        $unreadCount = count(array_filter($notifications, fn($n) => !$n['read']));

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark single notification as read
     */
    public function markAsRead(Request $request, string $id)
    {
        $staff = $request->user();
        $readIds = Cache::get("clinic_notifs_read_{$staff->id}", []);
        if (!is_array($readIds)) {
            $readIds = [];
        }

        if (!in_array($id, $readIds, true)) {
            $readIds[] = $id;
            Cache::put("clinic_notifs_read_{$staff->id}", $readIds, now()->addDays(30));
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
            'read_ids' => $readIds,
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $staff = $request->user();
        $current = $this->getNotifications($request)->getData(true);
        $notifications = $current['notifications'] ?? [];

        $allIds = array_column($notifications, 'id');
        Cache::put("clinic_notifs_read_{$staff->id}", $allIds, now()->addDays(30));

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * Clear all notifications history
     */
    public function clearAll(Request $request)
    {
        $staff = $request->user();
        Cache::put("clinic_notifs_cleared_at_{$staff->id}", now()->toISOString(), now()->addDays(30));
        Cache::forget("clinic_notifs_read_{$staff->id}");

        return response()->json([
            'success' => true,
            'message' => 'Notification history cleared.',
        ]);
    }
}
