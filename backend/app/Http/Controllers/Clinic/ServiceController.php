<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\DentalService;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Get all active services for the clinic
     */
    public function getServices(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $services = DentalService::where('clinic_id', $clinicId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json($services);
    }

    /**
     * Add new treatment service
     */
    public function addService(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $request->validate([
            'service_name' => 'required|string',
            'price' => 'required|numeric',
            'category' => 'nullable|string',
            'duration_minutes' => 'nullable|integer',
        ]);

        $maxSort = DentalService::where('clinic_id', $clinicId)->max('sort_order') ?? 0;

        $service = DentalService::create([
            'clinic_id' => $clinicId,
            'service_name' => $request->service_name,
            'price' => $request->price,
            'duration_minutes' => $request->duration_minutes ?? 45,
            'category' => $request->category ?? 'General Dentistry',
            'is_active' => true,
            'sort_order' => $maxSort + 1,
        ]);

        return response()->json([
            'message' => 'Service added successfully.',
            'service' => $service
        ]);
    }

    /**
     * Update treatment service details
     */
    public function updateService(Request $request, int $id)
    {
        $clinicId = $request->user()->clinic_id;

        $request->validate([
            'service_name' => 'required|string',
            'price' => 'required|numeric',
        ]);

        $service = DentalService::where('clinic_id', $clinicId)->findOrFail($id);
        $service->update([
            'service_name' => $request->service_name,
            'price' => $request->price,
        ]);

        return response()->json([
            'message' => 'Service updated successfully.',
            'service' => $service
        ]);
    }

    /**
     * Delete / deactivate treatment service
     */
    public function deleteService(Request $request, int $id)
    {
        $clinicId = $request->user()->clinic_id;

        $service = DentalService::where('clinic_id', $clinicId)->findOrFail($id);
        $service->is_active = false;
        $service->save();

        return response()->json([
            'message' => 'Service deleted successfully.'
        ]);
    }
}
