<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\{User, Clinic, Tenant, Appointment, Patient, SubscriptionPlan, Subscription};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, DB, Log};

class SuperadminController extends Controller
{
    /**
     * Authenticate superadmin
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)
            ->where('is_superadmin', true)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid admin credentials.'
            ], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('superadmin-access')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'superadmin',
                'is_superadmin' => true,
            ],
            'token' => $token
        ]);
    }

    /**
     * Get platform statistics
     */
    public function getStats()
    {
        $totalClinics = Clinic::count();
        $totalPatients = Patient::withoutGlobalScopes()->count();
        $totalAppointments = Appointment::withoutGlobalScopes()->count();
        $activeTrials = Subscription::where('status', 'trial')->count();
        $activePlans = Subscription::where('status', 'active')->count();

        $planBreakdown = DB::table('subscriptions')
            ->join('subscription_plans', 'subscriptions.subscription_plan_id', '=', 'subscription_plans.id')
            ->select('subscription_plans.plan_name', DB::raw('count(subscriptions.id) as count'))
            ->groupBy('subscription_plans.plan_name')
            ->get();

        return response()->json([
            'stats' => [
                'totalClinics' => $totalClinics,
                'totalPatients' => $totalPatients,
                'totalAppointments' => $totalAppointments,
                'activeTrials' => $activeTrials,
                'activePlans' => $activePlans,
            ],
            'planBreakdown' => $planBreakdown,
        ]);
    }

    /**
     * Get list of clinics with their tenants and subscriptions
     */
    public function getClinics()
    {
        $clinics = Clinic::with(['tenant', 'subscription.plan', 'fbPageIntegration'])->get();
        return response()->json($clinics);
    }

    /**
     * Update clinic verification status (approve, suspend, set trial)
     */
    public function updateClinicStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,suspended,trial,expired,pending_verification',
        ]);

        $clinic = Clinic::findOrFail($id);
        $clinic->update([
            'status' => $request->status,
        ]);

        if ($request->status === 'active') {
            $subscription = Subscription::where('clinic_id', $clinic->id)->first();
            if ($subscription) {
                $subscription->update(['status' => 'active']);
            }
        } elseif ($request->status === 'suspended') {
            $subscription = Subscription::where('clinic_id', $clinic->id)->first();
            if ($subscription) {
                $subscription->update(['status' => 'suspended']);
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Clinic status updated to {$request->status} successfully.",
            'clinic' => $clinic->load(['tenant', 'subscription.plan'])
        ]);
    }

    /**
     * Get all subscription plans
     */
    public function getPlans()
    {
        $plans = SubscriptionPlan::all();
        return response()->json($plans);
    }

    /**
     * Create or update subscription plan
     */
    public function savePlan(Request $request)
    {
        $request->validate([
            'id' => 'nullable|exists:subscription_plans,id',
            'plan_name' => 'required|string|max:255',
            'plan_code' => 'required|string|unique:subscription_plans,plan_code,' . $request->id,
            'monthly_price' => 'required|numeric|min:0',
            'appointment_limit' => 'nullable|integer|min:-1',
            'staff_limit' => 'nullable|integer|min:-1',
            'features' => 'required|array',
        ]);

        $data = $request->only([
            'plan_name',
            'plan_code',
            'monthly_price',
            'appointment_limit',
            'staff_limit',
            'features',
        ]);

        if ($data['appointment_limit'] == -1) $data['appointment_limit'] = null;
        if ($data['staff_limit'] == -1) $data['staff_limit'] = null;

        $plan = SubscriptionPlan::updateOrCreate(
            ['id' => $request->id],
            $data
        );

        return response()->json([
            'success' => true,
            'plan' => $plan
        ]);
    }

    /**
     * Delete subscription plan
     */
    public function deletePlan($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        if (Subscription::where('subscription_plan_id', $id)->exists()) {
            return response()->json([
                'message' => 'Cannot delete plan because it is currently assigned to one or more clinics.'
            ], 400);
        }

        $plan->delete();

        return response()->json([
            'message' => 'Plan deleted successfully.'
        ]);
    }
}
