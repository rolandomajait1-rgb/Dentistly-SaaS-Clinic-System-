<?php

namespace App\Http\Controllers;

use App\Models\{CalendarSlot, ChatSession, Patient, PatientHistory, Prescription, ToothChart};
use App\Services\{ChatbotService, MessengerService, TranslationService};
use Carbon\Carbon;
use Illuminate\Http\Request;

class WebviewController extends Controller
{
    public function __construct(
        protected MessengerService $messenger,
        protected ChatbotService   $chatbot
    ) {}

    /**
     * Show the calendar webview
     */
    public function showCalendar(Request $request, string $sessionId)
    {
        $session = ChatSession::where('session_id', $sessionId)->firstOrFail();
        $clinic  = $session->clinic;

        // Fetch available slots for the next 14 days
        $startDate = Carbon::today()->addDay();
        $endDate   = Carbon::today()->addDays(14);

        $slots = CalendarSlot::where('clinic_id', $clinic->id)
            ->whereBetween('slot_date', [$startDate, $endDate])
            ->where('status', 'available')
            ->orderBy('slot_date')
            ->orderBy('slot_time')
            ->get();

        // Group slots by date for the frontend
        $availableDates = [];
        foreach ($slots as $slot) {
            $dateStr = $slot->slot_date instanceof Carbon
                ? $slot->slot_date->toDateString()
                : (string) $slot->slot_date;

            if (!isset($availableDates[$dateStr])) {
                $availableDates[$dateStr] = [];
            }
            $availableDates[$dateStr][] = Carbon::parse($slot->slot_time)->format('H:i');
        }

        return view('webview.calendar', [
            'session'        => $session,
            'clinic'         => $clinic,
            'availableDates' => $availableDates,
            'fbPageId'       => $clinic->fbPageIntegration->fb_page_id ?? '',
        ]);
    }

    /**
     * Handle calendar submission via API.
     *
     * Delegates to ChatbotService::selectTimeFromWebview() so that:
     *   - Returning patients skip the full info form (DPA + fields)
     *   - New patients properly go through DPA consent first
     *   - No duplicate messages are sent
     */
    public function submitCalendar(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'date'       => 'required|date_format:Y-m-d',
            'time'       => 'required|date_format:H:i',
        ]);

        $session     = ChatSession::where('session_id', $request->session_id)->firstOrFail();
        $clinic      = $session->clinic;
        $integration = $clinic->fbPageIntegration;

        $formattedTime = Carbon::parse($request->time)->format('H:i:s');

        // Guard: verify the slot is still available before proceeding
        $slot = CalendarSlot::where('clinic_id', $clinic->id)
            ->whereDate('slot_date', $request->date)
            ->where('slot_time', $formattedTime)
            ->where('status', 'available')
            ->first();

        if (!$slot) {
            $translator = app(TranslationService::class);
            $translator->setLanguage($session->getContext('language', 'en'));
            return response()->json([
                'error' => $translator->trans('error.slot_taken_webview'),
            ], 400);
        }

        // Store date into session context, then delegate time selection to ChatbotService
        $session->setContext('booking.date', $request->date);
        $this->chatbot->selectTimeFromWebview($session, $formattedTime, $integration);

        return response()->json(['success' => true]);
    }

    /**
     * Show the secure patient record portal
     */
    public function showPatientPortal(string $sessionId)
    {
        $session = ChatSession::where('session_id', $sessionId)->firstOrFail();
        $clinic  = $session->clinic;

        if (!$session->patient_id) {
            // Friendly fallback page for sessions with no recorded patient profile yet
            return view('webview.patient_portal', [
                'clinic'   => $clinic,
                'session'  => $session,
                'patient'  => null,
                'history'  => collect(),
                'prescriptions' => collect(),
                'toothCharts'   => collect(),
            ]);
        }

        // Fetch patient and all health history details
        $patient = Patient::where('id', $session->patient_id)
            ->where('clinic_id', $clinic->id)
            ->firstOrFail();

        $history = PatientHistory::where('patient_id', $patient->id)
            ->where('clinic_id', $clinic->id)
            ->orderBy('service_date', 'desc')
            ->with(['service', 'performedBy'])
            ->get();

        $prescriptions = Prescription::where('patient_id', $patient->id)
            ->where('clinic_id', $clinic->id)
            ->orderBy('prescription_date', 'desc')
            ->get();

        $toothCharts = ToothChart::where('patient_id', $patient->id)
            ->where('clinic_id', $clinic->id)
            ->orderBy('tooth_number')
            ->get();

        return view('webview.patient_portal', [
            'clinic'        => $clinic,
            'session'       => $session,
            'patient'       => $patient,
            'history'       => $history,
            'prescriptions' => $prescriptions,
            'toothCharts'   => $toothCharts,
        ]);
    }
}

