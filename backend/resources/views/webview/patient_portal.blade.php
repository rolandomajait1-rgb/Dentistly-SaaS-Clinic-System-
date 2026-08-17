<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Patient Portal – {{ $clinic->clinic_name }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --primary: #4f46e5;
            --primary-light: #ede9fe;
            --primary-dark: #3730a3;
            --success: #10b981;
            --success-light: #d1fae5;
            --danger: #ef4444;
            --danger-light: #fee2e2;
            --warning: #f59e0b;
            --warning-light: #fef3c7;
            --info: #3b82f6;
            --info-light: #dbeafe;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-500: #6b7280;
            --gray-700: #374151;
            --gray-900: #111827;
            --white: #ffffff;
            --radius-lg: 16px;
            --radius-md: 12px;
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
            --shadow-md: 0 4px 20px rgba(0,0,0,0.06);
            --shadow-lg: 0 10px 30px rgba(79,70,229,0.08);
            --font: 'Inter', sans-serif;
        }

        body {
            font-family: var(--font);
            background: var(--gray-50);
            min-height: 100vh;
            color: var(--gray-700);
            padding-bottom: 40px;
        }

        /* ── HEADER ── */
        .header {
            background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            padding: 30px 20px 25px;
            color: var(--white);
            border-bottom-left-radius: 24px;
            border-bottom-right-radius: 24px;
            box-shadow: var(--shadow-lg);
        }
        .header-content {
            max-width: 500px;
            margin: 0 auto;
            text-align: center;
        }
        .header-clinic {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            opacity: 0.85;
            margin-bottom: 6px;
        }
        .header-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 12px;
        }
        .header-patient {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            padding: 10px 16px;
            border-radius: var(--radius-md);
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
        }
        .header-patient-dot {
            width: 8px; height: 8px;
            background: var(--success);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        /* ── TABS ── */
        .tabs-container {
            position: sticky;
            top: 0;
            z-index: 99;
            background: var(--gray-50);
            padding: 12px 10px;
            margin-top: -10px;
        }
        .tabs {
            display: flex;
            background: var(--gray-200);
            border-radius: var(--radius-md);
            padding: 4px;
            max-width: 500px;
            margin: 0 auto;
            box-shadow: var(--shadow-sm);
        }
        .tab-btn {
            flex: 1;
            border: none;
            background: transparent;
            font-family: var(--font);
            font-size: 11px;
            font-weight: 700;
            color: var(--gray-500);
            padding: 12px 4px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
        }
        .tab-btn.active {
            background: var(--white);
            color: var(--primary);
            box-shadow: var(--shadow-sm);
        }

        /* ── CONTAINER ── */
        .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 16px;
        }

        .tab-content {
            display: none;
            animation: fadeIn 0.3s ease;
        }
        .tab-content.active {
            display: block;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ── FALLBACK / EMPTY STATE ── */
        .empty-state {
            background: var(--white);
            border-radius: var(--radius-lg);
            padding: 40px 20px;
            text-align: center;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--gray-200);
        }
        .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .empty-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--gray-900);
            margin-bottom: 8px;
        }
        .empty-desc {
            font-size: 13px;
            color: var(--gray-500);
            line-height: 1.5;
            margin-bottom: 20px;
        }

        /* ── TIMELINE (TAB 1) ── */
        .timeline {
            position: relative;
            padding-left: 24px;
            margin-top: 10px;
        }
        .timeline::before {
            content: '';
            position: absolute;
            left: 7px; top: 0; bottom: 0;
            width: 2px;
            background: var(--gray-200);
        }
        .timeline-item {
            position: relative;
            margin-bottom: 24px;
        }
        .timeline-dot {
            position: absolute;
            left: -24px; top: 4px;
            width: 16px; height: 16px;
            border-radius: 50%;
            background: var(--white);
            border: 4px solid var(--primary);
            box-shadow: var(--shadow-sm);
        }
        .timeline-card {
            background: var(--white);
            border-radius: var(--radius-md);
            padding: 16px;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--gray-200);
            transition: transform 0.2s ease;
        }
        .timeline-card:hover {
            transform: translateY(-2px);
        }
        .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
            border-bottom: 1px dashed var(--gray-100);
            padding-bottom: 8px;
        }
        .timeline-date {
            font-size: 13px;
            font-weight: 700;
            color: var(--gray-900);
        }
        .timeline-price {
            font-size: 13px;
            font-weight: 700;
            color: var(--primary);
        }
        .timeline-service {
            font-size: 14px;
            font-weight: 700;
            color: var(--gray-800);
            margin-bottom: 6px;
        }
        .timeline-doctor {
            font-size: 12px;
            color: var(--gray-500);
            display: flex;
            align-items: center;
            gap: 4px;
            margin-bottom: 10px;
        }
        .timeline-details {
            background: var(--gray-50);
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 12px;
            line-height: 1.5;
            margin-top: 6px;
        }
        .timeline-details strong {
            color: var(--gray-900);
        }

        /* ── TOOTH CHART (TAB 2) ── */
        .chart-legend {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            background: var(--white);
            border-radius: var(--radius-md);
            padding: 12px;
            margin-bottom: 16px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--gray-200);
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 10px;
            font-weight: 600;
        }
        .legend-color {
            width: 12px; height: 12px;
            border-radius: 3px;
        }
        .legend-color.healthy { background: var(--success); }
        .legend-color.decayed { background: var(--danger); }
        .legend-color.filled { background: var(--info); }
        .legend-color.missing { background: var(--gray-300); }
        .legend-color.crowned { background: var(--warning); }

        .chart-card {
            background: var(--white);
            border-radius: var(--radius-lg);
            padding: 20px 14px;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--gray-200);
            margin-bottom: 16px;
            text-align: center;
        }
        .chart-arch-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--gray-500);
            text-transform: uppercase;
            margin-bottom: 14px;
            letter-spacing: 0.05em;
        }
        .chart-grid {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 6px;
            margin-bottom: 24px;
        }
        .tooth-btn {
            background: var(--success-light);
            border: 2px solid var(--success);
            aspect-ratio: 1;
            border-radius: var(--radius-md);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: var(--font);
            transition: all 0.2s ease;
            position: relative;
            min-height: 46px;
        }
        .tooth-btn:hover {
            transform: scale(1.05);
        }
        .tooth-btn.selected {
            box-shadow: 0 0 0 3px var(--primary);
        }
        .tooth-btn.decayed { background: var(--danger-light); border-color: var(--danger); }
        .tooth-btn.filled { background: var(--info-light); border-color: var(--info); }
        .tooth-btn.missing { background: var(--gray-100); border-color: var(--gray-300); }
        .tooth-btn.crowned { background: var(--warning-light); border-color: var(--warning); }
        
        .tooth-num {
            font-size: 13px;
            font-weight: 700;
            color: var(--gray-900);
        }
        .tooth-btn.decayed .tooth-num { color: var(--danger); }
        .tooth-btn.filled .tooth-num { color: var(--info); }
        .tooth-btn.missing .tooth-num { color: var(--gray-500); }
        .tooth-btn.crowned .tooth-num { color: var(--warning); }
        
        .tooth-label {
            font-size: 8px;
            font-weight: 500;
            color: var(--gray-500);
            margin-top: 1px;
        }

        .tooth-info-card {
            background: var(--gray-100);
            border-radius: var(--radius-md);
            padding: 14px;
            font-size: 13px;
            text-align: left;
            border: 1px solid var(--gray-200);
            display: none;
            animation: fadeIn 0.3s ease;
        }
        .tooth-info-card.show {
            display: block;
        }
        .tooth-info-title {
            font-weight: 700;
            color: var(--gray-900);
            margin-bottom: 4px;
        }
        .tooth-info-condition {
            display: inline-block;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 2px 8px;
            border-radius: 12px;
            margin-bottom: 8px;
        }

        /* ── PRESCRIPTIONS (TAB 3) ── */
        .prescription-card {
            background: var(--white);
            border-radius: var(--radius-lg);
            padding: 16px;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--gray-200);
            margin-bottom: 16px;
            position: relative;
            overflow: hidden;
        }
        .prescription-card::before {
            content: 'Rx';
            position: absolute;
            right: 12px; top: 12px;
            font-size: 40px;
            font-weight: 800;
            font-style: italic;
            color: var(--gray-100);
            line-height: 1;
        }
        .presc-header {
            border-bottom: 1px solid var(--gray-200);
            padding-bottom: 10px;
            margin-bottom: 12px;
        }
        .presc-doctor {
            font-size: 15px;
            font-weight: 700;
            color: var(--gray-900);
        }
        .presc-license {
            font-size: 11px;
            color: var(--gray-500);
            margin-top: 2px;
        }
        .presc-date {
            font-size: 11px;
            font-weight: 600;
            color: var(--primary);
            margin-top: 4px;
        }
        .presc-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed var(--gray-100);
            font-size: 13px;
        }
        .presc-item:last-child {
            border-bottom: none;
        }
        .presc-item-name {
            font-weight: 700;
            color: var(--gray-800);
        }
        .presc-item-desc {
            font-size: 11px;
            color: var(--gray-500);
            margin-top: 2px;
        }
        .presc-item-qty {
            font-weight: 700;
            color: var(--gray-900);
        }
        .presc-instructions {
            margin-top: 14px;
            background: var(--primary-light);
            color: var(--primary-dark);
            padding: 12px;
            border-radius: var(--radius-md);
            font-size: 12px;
            line-height: 1.5;
        }

        /* ── PROFILE (TAB 4) ── */
        .profile-card {
            background: var(--white);
            border-radius: var(--radius-lg);
            padding: 20px;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--gray-200);
        }
        .profile-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid var(--gray-100);
            font-size: 13px;
        }
        .profile-row:last-child {
            border-bottom: none;
        }
        .profile-label {
            color: var(--gray-500);
            font-weight: 500;
        }
        .profile-val {
            font-weight: 700;
            color: var(--gray-900);
            text-align: right;
        }
        .profile-block {
            padding: 12px 0;
        }
        .profile-block-label {
            color: var(--gray-500);
            font-weight: 600;
            font-size: 12px;
            margin-bottom: 6px;
            text-transform: uppercase;
        }
        .profile-block-val {
            background: var(--gray-50);
            padding: 12px;
            border-radius: var(--radius-md);
            font-size: 13px;
            line-height: 1.6;
            color: var(--gray-800);
            border: 1px dashed var(--gray-200);
        }
    </style>
</head>
<body>

    <!-- HEADER -->
    <div class="header">
        <div class="header-content">
            <div class="header-clinic">{{ $clinic->clinic_name }}</div>
            <h1 class="header-title">Secure Patient Portal</h1>
            @if($patient)
                <div class="header-patient">
                    <span class="header-patient-dot"></span>
                    <span>{{ $patient->full_name }}</span>
                </div>
            @endif
        </div>
    </div>

    <!-- TABS -->
    <div class="tabs-container">
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('history')">📜 Timeline</button>
            <button class="tab-btn" onclick="switchTab('chart')">🦷 Chart</button>
            <button class="tab-btn" onclick="switchTab('prescriptions')">💊 Reseta</button>
            <button class="tab-btn" onclick="switchTab('profile')">👤 Profile</button>
        </div>
    </div>

    <!-- CONTAINER -->
    <div class="container">

        <!-- NO PATIENT RECORD FALLBACK -->
        @if(!$patient)
            <div class="empty-state">
                <div class="empty-icon">🦷</div>
                <h2 class="empty-title">Walang Record / No History</h2>
                <p class="empty-desc">You do not have any clinical treatment or diagnosis history recorded at this clinic yet.</p>
            </div>
        @else

            <!-- ── TAB 1: HISTORY TIMELINE ── -->
            <div id="tab-history" class="tab-content active">
                @if($history->isEmpty())
                    <div class="empty-state">
                        <div class="empty-icon">📜</div>
                        <h2 class="empty-title">Walang Treatment</h2>
                        <p class="empty-desc">No treatment encounters have been completed yet.</p>
                    </div>
                @else
                    <div class="timeline">
                        @foreach($history as $record)
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-card">
                                    <div class="timeline-header">
                                        <span class="timeline-date">{{ \Carbon\Carbon::parse($record->service_date)->format('M d, Y') }}</span>
                                        @if($record->amount_charged > 0)
                                            <span class="timeline-price">₱{{ number_format($record->amount_charged, 2) }}</span>
                                        @endif
                                    </div>
                                    <h3 class="timeline-service">{{ $record->service->service_name ?? 'Dental Treatment' }}</h3>
                                    <div class="timeline-doctor">
                                        👨‍⚕️ {{ $record->performedBy->name ?? 'Attending Dentist' }}
                                    </div>
                                    
                                    @if($record->diagnosis || $record->treatment || $record->prescription || $record->doctor_notes)
                                        <div class="timeline-details">
                                            @if($record->diagnosis)
                                                <p><strong>Diagnosis:</strong> {{ $record->diagnosis }}</p>
                                            @endif
                                            @if($record->treatment)
                                                <p style="margin-top: 4px;"><strong>Treatment:</strong> {{ $record->treatment }}</p>
                                            @endif
                                            @if($record->prescription)
                                                <p style="margin-top: 4px;"><strong>Medication:</strong> {{ $record->prescription }}</p>
                                            @endif
                                            @if($record->doctor_notes)
                                                <p style="margin-top: 4px; font-style: italic; color: var(--gray-500);">"{{ $record->doctor_notes }}"</p>
                                            @endif
                                        </div>
                                    @endif
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>

            <!-- ── TAB 2: TOOTH CHART ── -->
            <div id="tab-chart" class="tab-content">
                <!-- Legend -->
                <div class="chart-legend">
                    <div class="legend-item"><span class="legend-color healthy"></span>Healthy</div>
                    <div class="legend-item"><span class="legend-color decayed"></span>Decayed</div>
                    <div class="legend-item"><span class="legend-color filled"></span>Filled</div>
                    <div class="legend-item"><span class="legend-color missing"></span>Missing</div>
                    <div class="legend-item"><span class="legend-color crowned"></span>Crowned</div>
                </div>

                <!-- Upper Arch Card -->
                <div class="chart-card">
                    <div class="chart-arch-title">Upper Teeth (Arko sa Taas)</div>
                    <div class="chart-grid">
                        @for($i = 1; $i <= 16; $i++)
                            @php
                                $tooth = $toothCharts->firstWhere('tooth_number', $i);
                                $cond  = $tooth ? $tooth->condition : 'healthy';
                                $notes = $tooth ? $tooth->notes : 'Healthy Tooth / Walang sira';
                            @endphp
                            <button class="tooth-btn {{ $cond }}" id="tooth-{{ $i }}" onclick="showToothInfo({{ $i }}, '{{ ucfirst($cond) }}', '{{ addslashes($notes) }}')">
                                <span class="tooth-num">{{ $i }}</span>
                                <span class="tooth-label">U</span>
                            </button>
                        @endfor
                    </div>

                    <!-- Lower Arch -->
                    <div class="chart-arch-title">Lower Teeth (Arko sa Baba)</div>
                    <div class="chart-grid">
                        @for($i = 17; $i <= 32; $i++)
                            @php
                                $tooth = $toothCharts->firstWhere('tooth_number', $i);
                                $cond  = $tooth ? $tooth->condition : 'healthy';
                                $notes = $tooth ? $tooth->notes : 'Healthy Tooth / Walang sira';
                            @endphp
                            <button class="tooth-btn {{ $cond }}" id="tooth-{{ $i }}" onclick="showToothInfo({{ $i }}, '{{ ucfirst($cond) }}', '{{ addslashes($notes) }}')">
                                <span class="tooth-num">{{ $i }}</span>
                                <span class="tooth-label">L</span>
                            </button>
                        @endfor
                    </div>

                    <!-- Interactive Info Panel -->
                    <div class="tooth-info-card" id="toothInfoPanel">
                        <div class="tooth-info-title" id="infoTitle">Select a tooth to view details</div>
                        <span class="tooth-info-condition" id="infoCondition"></span>
                        <div id="infoNotes" style="font-size: 12px; color: var(--gray-500);"></div>
                    </div>
                </div>
            </div>

            <!-- ── TAB 3: PRESCRIPTIONS ── -->
            <div id="tab-prescriptions" class="tab-content">
                @if($prescriptions->isEmpty())
                    <div class="empty-state">
                        <div class="empty-icon">💊</div>
                        <h2 class="empty-title">Walang Reseta</h2>
                        <p class="empty-desc">No prescriptions have been issued to your profile yet.</p>
                    </div>
                @else
                    @foreach($prescriptions as $presc)
                        <div class="prescription-card">
                            <div class="presc-header">
                                <div class="presc-doctor">👨‍⚕️ {{ $presc->doctor_name }}</div>
                                @if($presc->prc_license_number)
                                    <div class="presc-license">PRC License: <strong>{{ $presc->prc_license_number }}</strong></div>
                                @endif
                                <div class="presc-date">Issued: {{ $presc->prescription_date->format('F d, Y') }}</div>
                            </div>
                            
                            <!-- Items List -->
                            <div class="presc-items">
                                @if(is_array($presc->items))
                                    @foreach($presc->items as $item)
                                        <div class="presc-item">
                                            <div>
                                                <div class="presc-item-name">{{ $item['name'] ?? 'Medication' }}</div>
                                                <div class="presc-item-desc">{{ $item['dosage'] ?? '' }} - {{ $item['frequency'] ?? '' }}</div>
                                            </div>
                                            <div class="presc-item-qty">Qty: {{ $item['quantity'] ?? '1' }}</div>
                                        </div>
                                    @endforeach
                                @endif
                            </div>

                            @if($presc->instructions)
                                <div class="presc-instructions">
                                    <strong>📖 Instructions:</strong><br>
                                    {{ $presc->instructions }}
                                </div>
                            @endif
                        </div>
                    @endforeach
                @endif
            </div>

            <!-- ── TAB 4: PROFILE INFO ── -->
            <div id="tab-profile" class="tab-content">
                <div class="profile-card">
                    <div class="profile-row">
                        <span class="profile-label">👤 Full Name</span>
                        <span class="profile-val">{{ $patient->full_name }}</span>
                    </div>
                    <div class="profile-row">
                        <span class="profile-label">📞 Contact Number</span>
                        <span class="profile-val">{{ $patient->contact_number }}</span>
                    </div>
                    @if($patient->email)
                        <div class="profile-row">
                            <span class="profile-label">✉️ Email</span>
                            <span class="profile-val">{{ $patient->email }}</span>
                        </div>
                    @endif
                    @if($patient->age)
                        <div class="profile-row">
                            <span class="profile-label">🎂 Age</span>
                            <span class="profile-val">{{ $patient->age }} years old</span>
                        </div>
                    @endif
                    @if($patient->gender)
                        <div class="profile-row">
                            <span class="profile-label">🚻 Gender</span>
                            <span class="profile-val">{{ ucfirst($patient->gender) }}</span>
                        </div>
                    @endif
                    <div class="profile-row">
                        <span class="profile-label">📍 Address</span>
                        <span class="profile-val">{{ $patient->address ?? 'N/A' }}</span>
                    </div>

                    <div class="profile-block">
                        <div class="profile-block-label">⚠️ Allergies (Allergy sa Gamot)</div>
                        <div class="profile-block-val" style="color: {{ !empty($patient->allergies) && strtolower($patient->allergies) !== 'none' ? 'var(--danger)' : 'var(--success)' }}">
                            {{ $patient->allergies ?: 'None / Walang Allergy' }}
                        </div>
                    </div>

                    <div class="profile-block">
                        <div class="profile-block-label">🩺 Medical History (Sakit/Karamdaman)</div>
                        <div class="profile-block-val">
                            {{ $patient->medical_history ?: 'None / Healthy' }}
                        </div>
                    </div>
                </div>
            </div>

        @endif

    </div>

    <script>
        // ── TAB SWITCHER ──
        function switchTab(tabName) {
            // Update Tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            // Update Tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById('tab-' + tabName).classList.add('active');
        }

        // ── TOOTH CHART INTERACTION ──
        function showToothInfo(toothNum, condition, notes) {
            // Remove active highlight from all teeth
            document.querySelectorAll('.tooth-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            // Add highlight to clicked tooth
            document.getElementById('tooth-' + toothNum).classList.add('selected');

            // Populate Info Panel
            document.getElementById('infoTitle').textContent = 'Tooth #' + toothNum;
            
            const condEl = document.getElementById('infoCondition');
            condEl.textContent = condition;
            condEl.className = 'tooth-info-condition';
            
            // Color conditions dynamically in info block
            const lowerCond = condition.toLowerCase();
            if (lowerCond === 'decayed') {
                condEl.style.background = 'var(--danger-light)';
                condEl.style.color = 'var(--danger)';
            } else if (lowerCond === 'filled') {
                condEl.style.background = 'var(--info-light)';
                condEl.style.color = 'var(--info)';
            } else if (lowerCond === 'missing') {
                condEl.style.background = 'var(--gray-100)';
                condEl.style.color = 'var(--gray-700)';
            } else if (lowerCond === 'crowned') {
                condEl.style.background = 'var(--warning-light)';
                condEl.style.color = 'var(--warning)';
            } else {
                condEl.style.background = 'var(--success-light)';
                condEl.style.color = 'var(--success)';
            }

            document.getElementById('infoNotes').textContent = notes;

            // Display panel
            document.getElementById('toothInfoPanel').classList.add('show');
        }
    </script>
</body>
</html>
