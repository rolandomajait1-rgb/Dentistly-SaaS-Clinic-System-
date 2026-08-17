<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClinicFaq;
use App\Models\Clinic;

class PricingFaqSeeder extends Seeder
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

        $faqs = [
            // General Pricing FAQs
            [
                'category' => 'pricing',
                'question' => 'How much is teeth cleaning?',
                'answer' => "Our teeth cleaning services:\n• Mild: ₱800\n• Moderate: ₱1,500\n• Severe: ₱2,500\n\nAdditional fluoride application: +₱500",
                'keywords' => ['cleaning', 'linis', 'prophylaxis', 'magkano cleaning', 'price cleaning'],
            ],
            [
                'category' => 'pricing',
                'question' => 'How much are braces?',
                'answer' => "Our braces packages:\n• Mild Case (Metal): ₱45,000\n• Moderate Case (Metal): ₱65,000\n• Self-Ligating: ₱65,000\n• Ceramic: ₱45,000\n\nAll include down payment options and monthly installments!",
                'keywords' => ['braces', 'bracket', 'orthodontics', 'magkano braces', 'price braces', 'ortho'],
            ],
            [
                'category' => 'pricing',
                'question' => 'How much is tooth extraction?',
                'answer' => "Extraction prices:\n• Simple (Permanent): ₱800\n• Simple (Milk tooth): ₱600\n• Complicated: ₱2,000\n• Wisdom tooth: ₱1,000 - ₱5,000 (depends on position)",
                'keywords' => ['extraction', 'bunot', 'tanggal', 'magkano bunot', 'price extraction', 'wisdom tooth'],
            ],
            [
                'category' => 'pricing',
                'question' => 'How much is root canal treatment?',
                'answer' => "Root canal treatment: ₱5,000 per canal\n\nAdditional fees:\n• Post and Core (Metal): ₱2,500\n• Post and Core (Fiber): ₱1,500\n• Miscellaneous (Pulpitis): ₱1,500\n• Miscellaneous (Periapical): ₱2,500",
                'keywords' => ['root canal', 'rct', 'endodontics', 'magkano root canal', 'price root canal'],
            ],
            [
                'category' => 'pricing',
                'question' => 'How much is teeth whitening?',
                'answer' => "Teeth whitening/bleaching: ₱8,500 per session (includes 3 cycles)\n\nFor a brighter, whiter smile! ✨",
                'keywords' => ['whitening', 'bleaching', 'puti', 'magkano whitening', 'price whitening', 'paputi'],
            ],
            [
                'category' => 'pricing',
                'question' => 'How much is pasta (tooth filling)?',
                'answer' => "Tooth filling prices:\n• Composite: ₱800 per surface\n• Amalgam: ₱1,000 per surface\n• Temporary: ₱500 per surface\n\nAdd-ons available for base/liner materials.",
                'keywords' => ['pasta', 'filling', 'restoration', 'magkano pasta', 'price filling', 'butas'],
            ],
            [
                'category' => 'pricing',
                'question' => 'How much are dentures?',
                'answer' => "Denture prices:\n\nComplete Dentures:\n• Ordinary: ₱20,000 (U&L)\n• New Ace Px: ₱30,000 (U&L)\n• Ivocap: ₱50,000 (U&L)\n\nPartial Dentures:\n• Acrylic: ₱3,500 + per pontic\n• Metal Framework: ₱7,000 + per pontic\n• Flexible (Unilateral): ₱8,000\n• Flexible (Bilateral): ₱17,500",
                'keywords' => ['denture', 'pustiso', 'false teeth', 'magkano denture', 'price denture'],
            ],
            [
                'category' => 'pricing',
                'question' => 'How much are crowns and bridges?',
                'answer' => "Crown & Bridge prices:\n• Porcelain fused to Metal (Non-precious): ₱6,500/unit\n• Porcelain fused to Metal (Precious): ₱8,500/unit\n• All Porcelain (Emax): ₱20,000/unit\n• Zirconia: ₱25,000/unit\n• Temporary: ₱1,500 - ₱3,000/unit",
                'keywords' => ['crown', 'bridge', 'korona', 'magkano crown', 'price crown'],
            ],
            [
                'category' => 'pricing',
                'question' => 'How much is consultation?',
                'answer' => "Consultation fees:\n• Problem-focused check-up: ₱400\n• Comprehensive consultation (with diagnostics & treatment planning): ₱1,500\n• X-ray (Periapical): ₱400 per shot",
                'keywords' => ['consultation', 'checkup', 'check-up', 'magkano consultation', 'price consultation', 'xray'],
            ],
            [
                'category' => 'pricing',
                'question' => 'How much are veneers?',
                'answer' => "Veneer prices:\n• Porcelain Veneers (Emax): ₱20,000/unit\n• Direct Composite Veneers: ₱5,000/unit\n• Alumina Crowns: ₱15,000/unit\n\nPerfect for smile makeovers! 😁",
                'keywords' => ['veneer', 'veneers', 'magkano veneer', 'price veneer', 'smile makeover'],
            ],
            [
                'category' => 'pricing',
                'question' => 'Do you offer payment plans?',
                'answer' => "Yes! We offer flexible payment plans for:\n\n• Braces: Down payment + monthly installments\n• Splint Therapy: ₱15,000 down + ₱2,500/month (6 months)\n\nAsk our staff about payment options for other services!",
                'keywords' => ['payment plan', 'installment', 'hulugan', 'monthly', 'down payment'],
            ],
            [
                'category' => 'pricing',
                'question' => 'What is your most affordable service?',
                'answer' => "Our most affordable services:\n• Additional Anesthesia: ₱100\n• Rebond Bracket (Ordinary): ₱200\n• Orthodontic Kits: ₱250\n• Check-up: ₱400\n• Temporary Restoration: ₱500",
                'keywords' => ['affordable', 'cheap', 'mura', 'lowest price', 'budget'],
            ],
        ];

        $this->command->info('Adding ' . count($faqs) . ' pricing FAQs...');
        
        foreach ($faqs as $faqData) {
            ClinicFaq::create([
                'clinic_id' => $clinic->id,
                'category' => $faqData['category'],
                'question' => $faqData['question'],
                'answer' => $faqData['answer'],
                'keywords' => json_encode($faqData['keywords']),
                'is_active' => true,
            ]);
        }

        $this->command->info('✅ Successfully added ' . count($faqs) . ' pricing FAQs!');
    }
}
