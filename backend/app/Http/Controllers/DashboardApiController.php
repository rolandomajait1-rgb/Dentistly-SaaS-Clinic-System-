<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Clinic\{
    AuthController,
    AppointmentController,
    PatientController,
    PrescriptionController,
    ServiceController,
    SettingController,
    IntegrationController,
    StaffController
};
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    // Auth delegations
    public function login(Request $request) { return resolve(AuthController::class)->login($request); }
    public function logout(Request $request) { return resolve(AuthController::class)->logout($request); }
    public function register(Request $request) { return resolve(AuthController::class)->register($request); }
    public function verifyEmail(Request $request) { return resolve(AuthController::class)->verifyEmail($request); }
    public function resendVerification(Request $request) { return resolve(AuthController::class)->resendVerification($request); }
    public function googleLogin(Request $request) { return resolve(AuthController::class)->googleLogin($request); }

    // Appointments & Walk-In delegations
    public function getOverview(Request $request) { return resolve(AppointmentController::class)->getOverview($request); }
    public function getAnalytics(Request $request) { return resolve(AppointmentController::class)->getAnalytics($request); }
    public function getAppointments(Request $request) { return resolve(AppointmentController::class)->getAppointments($request); }
    public function createAppointment(Request $request) { return resolve(AppointmentController::class)->createAppointment($request); }
    public function updateAppointmentStatus(Request $request, int $id) { return resolve(AppointmentController::class)->updateAppointmentStatus($request, $id); }
    public function getQueue(Request $request) { return resolve(AppointmentController::class)->getOverview($request); }

    // Patients & EHR delegations
    public function getPatients(Request $request) { return resolve(PatientController::class)->getPatients($request); }
    public function createPatient(Request $request) { return resolve(PatientController::class)->createPatient($request); }
    public function getPatientEhr(Request $request, int $id) { return resolve(PatientController::class)->getPatientEhr($request, $id); }
    public function createPrescription(Request $request, int $id) { return resolve(PrescriptionController::class)->createPrescription($request, $id); }
    public function updateToothChart(Request $request, int $id) {
        return response()->json(['success' => true, 'message' => 'Tooth chart legacy call noted.']);
    }

    // Staff & Users delegations
    public function getStaff(Request $request) { return resolve(StaffController::class)->getStaff($request); }
    public function createStaff(Request $request) { return resolve(StaffController::class)->createStaff($request); }
    public function deleteStaff(Request $request, int $id) { return resolve(StaffController::class)->deleteStaff($request, $id); }

    // Dental Services delegations
    public function getServices(Request $request) { return resolve(ServiceController::class)->getServices($request); }
    public function addService(Request $request) { return resolve(ServiceController::class)->addService($request); }
    public function updateService(int $id, Request $request) { return resolve(ServiceController::class)->updateService($request, $id); }
    public function deleteService(int $id, Request $request) { return resolve(ServiceController::class)->deleteService($request, $id); }

    // Settings delegations
    public function getSettings(Request $request) { return resolve(SettingController::class)->getSettings($request); }
    public function updateSettings(Request $request) { return resolve(SettingController::class)->updateSettings($request); }
    public function testEmailWorkflow(Request $request) { return resolve(SettingController::class)->testEmailWorkflow($request); }

    // Integrations delegations (Facebook Messenger)
    public function getFacebookAuthUrl(Request $request) { return resolve(IntegrationController::class)->getFacebookAuthUrl($request); }
    public function handleFacebookCallback(Request $request) { return resolve(IntegrationController::class)->handleFacebookCallback($request); }
    public function connectFacebookPage(Request $request) { return resolve(IntegrationController::class)->connectFacebookPage($request); }
    public function disconnectFacebookPage(Request $request) { return resolve(IntegrationController::class)->disconnectFacebookPage($request); }
    public function getFacebookPageDetails(Request $request) { return resolve(IntegrationController::class)->getFacebookPageDetails($request); }
    public function validateFacebookToken(Request $request) { return resolve(IntegrationController::class)->validateFacebookToken($request); }
    public function testFacebookWebhook(Request $request) { return resolve(IntegrationController::class)->testFacebookWebhook($request); }
}
