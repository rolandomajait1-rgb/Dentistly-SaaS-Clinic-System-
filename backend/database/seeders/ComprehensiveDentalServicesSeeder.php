<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DentalService;
use App\Models\Clinic;

class ComprehensiveDentalServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clinic = Clinic::first();
        
        if (!$clinic) {
            $this->command->error('No clinic found! Please create a clinic first.');
            return;
        }

        // Clear existing services (optional - comment out if you want to keep old ones)
        // DentalService::where('clinic_id', $clinic->id)->delete();

        $services = [
            // ═══════════════════════════════════════════════════════════════
            // ORTHODONTICS (Braces)
            // ═══════════════════════════════════════════════════════════════
            [
                'category' => 'Orthodontics',
                'service_name' => 'Braces - Mild Case (Ordinary Metal Brackets)',
                'description' => 'Minimum 2 years treatment. Down payment: ₱15,000, Monthly: ₱1,000',
                'price' => 45000,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Orthodontics',
                'service_name' => 'Braces - Moderate Case (Metal Brackets MEM Brand)',
                'description' => 'Down payment: ₱25,000, Monthly: ₱1,000',
                'price' => 65000,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Orthodontics',
                'service_name' => 'Braces - Self-Ligating / SWLF (Metal Brackets)',
                'description' => 'Down payment: ₱20,000, Monthly: ₱1,500',
                'price' => 65000,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Orthodontics',
                'service_name' => 'Braces - Mild Case (Ceramic Brackets)',
                'description' => 'Down payment: ₱15,000, Monthly: ₱1,500',
                'price' => 45000,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Orthodontics',
                'service_name' => 'Retainer (Acrylic Base with Metal Wire or Clear)',
                'description' => 'Upper & Lower',
                'price' => 6000,
                'duration_minutes' => 30,
            ],
            [
                'category' => 'Orthodontics',
                'service_name' => 'Orthodontic Kits',
                'description' => 'Complete orthodontic kit set',
                'price' => 250,
                'duration_minutes' => 15,
            ],
            [
                'category' => 'Orthodontics',
                'service_name' => 'Brackets Removal / Debonding with Cleaning (Mild Cases)',
                'description' => 'Upper & Lower',
                'price' => 3000,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Orthodontics',
                'service_name' => 'Rebond and Bracket Replacement - Ordinary Metal',
                'description' => 'Per bracket',
                'price' => 200,
                'duration_minutes' => 15,
            ],
            [
                'category' => 'Orthodontics',
                'service_name' => 'Rebond and Bracket Replacement - All Other Types',
                'description' => 'Per bracket',
                'price' => 500,
                'duration_minutes' => 15,
            ],
            [
                'category' => 'Orthodontics',
                'service_name' => 'Pediatric Fixed/Removable Space Maintainers',
                'description' => 'Per piece',
                'price' => 2500,
                'duration_minutes' => 45,
            ],

            // ═══════════════════════════════════════════════════════════════
            // FIXED PROSTHODONTICS (Bridges/Crowns)
            // ═══════════════════════════════════════════════════════════════
            [
                'category' => 'Fixed Prosthodontics',
                'service_name' => 'Porcelain Fused to Metal Crown & Bridge (Non-precious)',
                'description' => 'With/without porcelain on cervical margins, per unit',
                'price' => 6500,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'Fixed Prosthodontics',
                'service_name' => 'Porcelain Fused to Metal Crown & Bridge (Precious Metal)',
                'description' => 'Per unit',
                'price' => 8500,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'Fixed Prosthodontics',
                'service_name' => 'Plastic Crown with Pontic Facing (Temporary)',
                'description' => 'Per unit',
                'price' => 3000,
                'duration_minutes' => 45,
            ],
            [
                'category' => 'Fixed Prosthodontics',
                'service_name' => 'Plastic Acrylic Crown (Temporary)',
                'description' => 'Per unit',
                'price' => 1500,
                'duration_minutes' => 30,
            ],
            [
                'category' => 'Fixed Prosthodontics',
                'service_name' => 'Stainless Steel Crown',
                'description' => 'Per unit',
                'price' => 3000,
                'duration_minutes' => 45,
            ],

            // ═══════════════════════════════════════════════════════════════
            // REMOVABLE PROSTHODONTICS
            // ═══════════════════════════════════════════════════════════════
            [
                'category' => 'Removable Prosthodontics',
                'service_name' => 'Complete Denture - Ordinary Pontics and Acrylic',
                'description' => 'Upper & Lower',
                'price' => 20000,
                'duration_minutes' => 120,
            ],
            [
                'category' => 'Removable Prosthodontics',
                'service_name' => 'Complete Denture - New Ace Px Pontics and Ordinary Acrylic',
                'description' => 'Upper & Lower',
                'price' => 30000,
                'duration_minutes' => 120,
            ],
            [
                'category' => 'Removable Prosthodontics',
                'service_name' => 'Complete Denture - New Ace Px Pontics and Ivocap',
                'description' => 'Upper & Lower',
                'price' => 50000,
                'duration_minutes' => 120,
            ],
            [
                'category' => 'Removable Prosthodontics',
                'service_name' => 'Removable Partial Denture - Acrylic Base & Ordinary Pontic',
                'description' => 'Base: ₱3,500 + ₱500 per pontic',
                'price' => 3500,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'Removable Prosthodontics',
                'service_name' => 'Removable Partial Denture - Acrylic Base & New Ace Px (Anteriors)',
                'description' => 'Base: ₱3,500 + ₱1,000 per pontic',
                'price' => 3500,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'Removable Prosthodontics',
                'service_name' => 'Removable Partial Denture - Metal Framework',
                'description' => 'Base: ₱7,000 + ₱500 or ₱1,000 per pontic',
                'price' => 7000,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'Removable Prosthodontics',
                'service_name' => 'Flexible Partial Denture (Unilateral)',
                'description' => 'Per piece',
                'price' => 8000,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'Removable Prosthodontics',
                'service_name' => 'Flexible Partial Denture (Bilateral)',
                'description' => 'Per piece',
                'price' => 17500,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'Removable Prosthodontics',
                'service_name' => 'Recementation - Resin Cement or GIC',
                'description' => 'Per unit',
                'price' => 2000,
                'duration_minutes' => 30,
            ],
            [
                'category' => 'Removable Prosthodontics',
                'service_name' => 'Recementation - Temporary/IRM',
                'description' => 'Per unit',
                'price' => 1000,
                'duration_minutes' => 20,
            ],
            [
                'category' => 'Removable Prosthodontics',
                'service_name' => 'Denture Repair (Reline, Rebase, Crack Repairs)',
                'description' => 'Per piece. Additional ₱1,500 for clasp and metal wires',
                'price' => 3500,
                'duration_minutes' => 60,
            ],

            // ═══════════════════════════════════════════════════════════════
            // GENERAL SERVICES
            // ═══════════════════════════════════════════════════════════════
            [
                'category' => 'General Services',
                'service_name' => 'Problem-focused Consultation / Check-up',
                'description' => 'Per session',
                'price' => 400,
                'duration_minutes' => 30,
            ],
            [
                'category' => 'General Services',
                'service_name' => 'Comprehensive Consultation',
                'description' => 'With Diagnostics, Treatment Planning & Case Presentation',
                'price' => 1500,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'General Services',
                'service_name' => 'Periapical Radiograph / X-ray',
                'description' => 'Per film/shot (digital)',
                'price' => 400,
                'duration_minutes' => 15,
            ],

            // ═══════════════════════════════════════════════════════════════
            // PERIODONTICS / Cleaning
            // ═══════════════════════════════════════════════════════════════
            [
                'category' => 'Periodontics',
                'service_name' => 'Oral Prophylaxis / Cleaning (Mild)',
                'description' => 'Per session',
                'price' => 800,
                'duration_minutes' => 45,
            ],
            [
                'category' => 'Periodontics',
                'service_name' => 'Oral Prophylaxis / Cleaning (Moderate)',
                'description' => 'Per session',
                'price' => 1500,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Periodontics',
                'service_name' => 'Oral Prophylaxis / Cleaning (Severe)',
                'description' => 'Per session',
                'price' => 2500,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'Periodontics',
                'service_name' => 'Deep Scaling and Root Planing (Periodontal Therapy)',
                'description' => 'Per quadrant',
                'price' => 5000,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Periodontics',
                'service_name' => 'Topical Fluoride Application (after OP)',
                'description' => 'Additional service',
                'price' => 500,
                'duration_minutes' => 15,
            ],

            // ═══════════════════════════════════════════════════════════════
            // SURGERY
            // ═══════════════════════════════════════════════════════════════
            [
                'category' => 'Surgery',
                'service_name' => 'Simple Extraction (Permanent Tooth)',
                'description' => 'With local infiltration, per tooth',
                'price' => 800,
                'duration_minutes' => 30,
            ],
            [
                'category' => 'Surgery',
                'service_name' => 'Simple Extraction (Milk Tooth)',
                'description' => 'With local infiltration, per tooth',
                'price' => 600,
                'duration_minutes' => 20,
            ],
            [
                'category' => 'Surgery',
                'service_name' => 'Complicated Extraction',
                'description' => 'Section and/or bone removal, per tooth',
                'price' => 2000,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Surgery',
                'service_name' => 'Soft Tissue Surgery',
                'description' => 'Minimum per lesion',
                'price' => 3500,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Surgery',
                'service_name' => 'Additional Anesthesia - Lidocaine',
                'description' => 'Per carpule (e.g. IAN Block)',
                'price' => 100,
                'duration_minutes' => 5,
            ],
            [
                'category' => 'Surgery',
                'service_name' => 'Additional Anesthesia - Articaine',
                'description' => 'Per carpule',
                'price' => 200,
                'duration_minutes' => 5,
            ],

            // ═══════════════════════════════════════════════════════════════
            // ODONTECTOMY (Wisdom Tooth Removal)
            // ═══════════════════════════════════════════════════════════════
            [
                'category' => 'Odontectomy',
                'service_name' => 'Wisdom Tooth Removal - Mesioangular Position',
                'description' => 'By position',
                'price' => 2000,
                'duration_minutes' => 45,
            ],
            [
                'category' => 'Odontectomy',
                'service_name' => 'Wisdom Tooth Removal - Horizontal Position',
                'description' => 'By position',
                'price' => 3000,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Odontectomy',
                'service_name' => 'Wisdom Tooth Removal - Vertical Position',
                'description' => 'By position',
                'price' => 4000,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Odontectomy',
                'service_name' => 'Wisdom Tooth Removal - Distoangular Position',
                'description' => 'By position',
                'price' => 5000,
                'duration_minutes' => 75,
            ],
            [
                'category' => 'Odontectomy',
                'service_name' => 'Wisdom Tooth Removal - Level A (High)',
                'description' => 'By depth',
                'price' => 2000,
                'duration_minutes' => 45,
            ],
            [
                'category' => 'Odontectomy',
                'service_name' => 'Wisdom Tooth Removal - Level B (Medium)',
                'description' => 'By depth',
                'price' => 3000,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Odontectomy',
                'service_name' => 'Wisdom Tooth Removal - Level C (Low)',
                'description' => 'By depth',
                'price' => 4000,
                'duration_minutes' => 75,
            ],
            [
                'category' => 'Odontectomy',
                'service_name' => 'Wisdom Tooth Removal - Class 1 (Sufficient Space)',
                'description' => 'By space',
                'price' => 1000,
                'duration_minutes' => 30,
            ],
            [
                'category' => 'Odontectomy',
                'service_name' => 'Wisdom Tooth Removal - Class 2 (Reduced Space)',
                'description' => 'By space',
                'price' => 2000,
                'duration_minutes' => 45,
            ],
            [
                'category' => 'Odontectomy',
                'service_name' => 'Wisdom Tooth Removal - Class 3 (No Space)',
                'description' => 'By space',
                'price' => 3000,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Odontectomy',
                'service_name' => 'Third Molar Removal (Not Impacted)',
                'description' => 'Per tooth',
                'price' => 2000,
                'duration_minutes' => 45,
            ],

            // ═══════════════════════════════════════════════════════════════
            // ENDODONTICS (Root Canal Treatment)
            // ═══════════════════════════════════════════════════════════════
            [
                'category' => 'Endodontics',
                'service_name' => 'Root Canal Treatment',
                'description' => 'Per canal. Final restoration charged separately',
                'price' => 5000,
                'duration_minutes' => 120,
            ],
            [
                'category' => 'Endodontics',
                'service_name' => 'Post and Core - Metal',
                'description' => 'Per post',
                'price' => 2500,
                'duration_minutes' => 45,
            ],
            [
                'category' => 'Endodontics',
                'service_name' => 'Post and Core - Fiber',
                'description' => 'Per post',
                'price' => 1500,
                'duration_minutes' => 45,
            ],
            [
                'category' => 'Endodontics',
                'service_name' => 'RCT Miscellaneous Fee - Pulpitis',
                'description' => 'Buildup, meds, 4 radiographs (Pre-op, IAF, MAF/MAC, Post-op)',
                'price' => 1500,
                'duration_minutes' => 30,
            ],
            [
                'category' => 'Endodontics',
                'service_name' => 'RCT Miscellaneous Fee - Periapical Pathoses',
                'description' => 'Buildup, meds, 4 radiographs',
                'price' => 2500,
                'duration_minutes' => 30,
            ],
            [
                'category' => 'Endodontics',
                'service_name' => 'Pulpotomy and Pulpectomy',
                'description' => 'Pediatric treatment',
                'price' => 4500,
                'duration_minutes' => 60,
            ],
            [
                'category' => 'Endodontics',
                'service_name' => 'Internal Bleaching',
                'description' => 'Per application',
                'price' => 1500,
                'duration_minutes' => 30,
            ],

            // ═══════════════════════════════════════════════════════════════
            // RESTORATIVE AND PREVENTIVE (Pasta)
            // ═══════════════════════════════════════════════════════════════
            [
                'category' => 'Restorative',
                'service_name' => 'Pit and Fissure Sealant',
                'description' => 'Per tooth',
                'price' => 600,
                'duration_minutes' => 20,
            ],
            [
                'category' => 'Restorative',
                'service_name' => 'Composite Restoration',
                'description' => 'Per surface. Add-ons: SDR/Flowable Base (+₱300), GIC Base (+₱500), CaOH Liner (+₱300)',
                'price' => 800,
                'duration_minutes' => 45,
            ],
            [
                'category' => 'Restorative',
                'service_name' => 'Amalgam Restoration',
                'description' => 'Per surface. Same additional fees for base/liner',
                'price' => 1000,
                'duration_minutes' => 45,
            ],
            [
                'category' => 'Restorative',
                'service_name' => 'Temporary Restoration',
                'description' => 'Per surface',
                'price' => 500,
                'duration_minutes' => 20,
            ],
            [
                'category' => 'Restorative',
                'service_name' => 'Dentin Desensitization',
                'description' => 'Per application',
                'price' => 500,
                'duration_minutes' => 15,
            ],
            [
                'category' => 'Restorative',
                'service_name' => 'Anesthesia during Restoration - Lidocaine',
                'description' => 'Per carpule',
                'price' => 100,
                'duration_minutes' => 5,
            ],
            [
                'category' => 'Restorative',
                'service_name' => 'Anesthesia during Restoration - Articaine',
                'description' => 'Per carpule',
                'price' => 200,
                'duration_minutes' => 5,
            ],

            // ═══════════════════════════════════════════════════════════════
            // COSMETIC DENTISTRY (Veneers)
            // ═══════════════════════════════════════════════════════════════
            [
                'category' => 'Cosmetic Dentistry',
                'service_name' => 'All Porcelain Crown (Emax)',
                'description' => 'Per unit',
                'price' => 20000,
                'duration_minutes' => 120,
            ],
            [
                'category' => 'Cosmetic Dentistry',
                'service_name' => 'Porcelain Veneers (Emax)',
                'description' => 'Per unit',
                'price' => 20000,
                'duration_minutes' => 120,
            ],
            [
                'category' => 'Cosmetic Dentistry',
                'service_name' => 'Alumina Crowns',
                'description' => 'Per unit',
                'price' => 15000,
                'duration_minutes' => 120,
            ],
            [
                'category' => 'Cosmetic Dentistry',
                'service_name' => 'Direct Composite Veneers',
                'description' => 'Per unit',
                'price' => 5000,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'Cosmetic Dentistry',
                'service_name' => 'Zirconia or Porcelain fused to Zirconia Crown/Bridge',
                'description' => 'Per unit',
                'price' => 25000,
                'duration_minutes' => 120,
            ],
            [
                'category' => 'Cosmetic Dentistry',
                'service_name' => 'Indirect Onlay or Inlay (Composite or Porcelain)',
                'description' => 'Per unit',
                'price' => 5000,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'Cosmetic Dentistry',
                'service_name' => 'Bleaching/Whitening (One Session, Three Cycles)',
                'description' => 'Per session',
                'price' => 8500,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'Cosmetic Dentistry',
                'service_name' => 'Gingivoplasty / Gum Recontouring',
                'description' => 'Per tooth',
                'price' => 1000,
                'duration_minutes' => 30,
            ],
            [
                'category' => 'Cosmetic Dentistry',
                'service_name' => 'Diastema Closure with Composite',
                'description' => 'Mesial and Incisal, per tooth',
                'price' => 2000,
                'duration_minutes' => 60,
            ],

            // ═══════════════════════════════════════════════════════════════
            // TMJ DYSFUNCTION THERAPY
            // ═══════════════════════════════════════════════════════════════
            [
                'category' => 'TMJ Therapy',
                'service_name' => 'Splint Therapy (Cash)',
                'description' => 'Per case. Down payment: ₱15,000, Monthly (6 months): ₱2,500',
                'price' => 30000,
                'duration_minutes' => 90,
            ],
            [
                'category' => 'TMJ Therapy',
                'service_name' => 'Night Guard (Hard or Soft)',
                'description' => 'Upper or Lower',
                'price' => 3000,
                'duration_minutes' => 60,
            ],
        ];

        $this->command->info('Adding ' . count($services) . ' dental services...');
        $progressBar = $this->command->getOutput()->createProgressBar(count($services));
        $progressBar->start();

        foreach ($services as $serviceData) {
            DentalService::create([
                'clinic_id' => $clinic->id,
                'category' => $serviceData['category'],
                'service_name' => $serviceData['service_name'],
                'description' => $serviceData['description'],
                'price' => $serviceData['price'],
                'duration_minutes' => $serviceData['duration_minutes'],
                'is_active' => true,
                'sort_order' => 0,
            ]);
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->command->newLine(2);
        $this->command->info('✅ Successfully added ' . count($services) . ' dental services!');
        $this->command->newLine();
        
        // Show summary by category
        $this->command->info('📊 Services by Category:');
        $categories = DentalService::where('clinic_id', $clinic->id)
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->get();
        
        foreach ($categories as $cat) {
            $this->command->line("   • {$cat->category}: {$cat->count} services");
        }
    }
}
