<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Book Appointment – {{ $clinic->clinic_name }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --primary: #4f46e5;
            --primary-light: #ede9fe;
            --primary-dark: #3730a3;
            --success: #10b981;
            --danger: #ef4444;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-400: #9ca3af;
            --gray-600: #4b5563;
            --gray-800: #1f2937;
            --white: #ffffff;
            --radius: 14px;
            --shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--gray-50);
            min-height: 100vh;
            color: var(--gray-800);
            padding-bottom: 90px;
        }

        /* ── HEADER ── */
        .header {
            background: var(--white);
            padding: 16px 20px 14px;
            border-bottom: 1px solid var(--gray-200);
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .header h1 {
            font-size: 17px;
            font-weight: 700;
            color: var(--gray-800);
            text-align: center;
        }
        .header p {
            font-size: 12px;
            color: var(--gray-400);
            text-align: center;
            margin-top: 2px;
        }

        /* ── PROGRESS STEPS ── */
        .steps {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px 20px;
            background: var(--white);
            border-bottom: 1px solid var(--gray-100);
        }
        .step {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 600;
            color: var(--gray-400);
        }
        .step-dot {
            width: 26px; height: 26px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px;
            font-weight: 700;
            background: var(--gray-100);
            color: var(--gray-400);
            transition: all 0.3s;
        }
        .step.active .step-dot {
            background: var(--primary);
            color: var(--white);
            box-shadow: 0 0 0 4px var(--primary-light);
        }
        .step.done .step-dot {
            background: var(--success);
            color: var(--white);
        }
        .step.active { color: var(--primary); }
        .step.done  { color: var(--success); }
        .step-line {
            height: 2px; width: 24px;
            background: var(--gray-200);
            border-radius: 2px;
            transition: background 0.3s;
        }
        .step-line.done { background: var(--success); }

        /* ── CONTAINER ── */
        .container { padding: 16px; max-width: 480px; margin: 0 auto; }

        /* ── SECTION LABEL ── */
        .section-label {
            font-size: 13px;
            font-weight: 600;
            color: var(--gray-600);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        /* ── CALENDAR MONTH NAV ── */
        .month-nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--white);
            border-radius: var(--radius);
            padding: 12px 16px;
            margin-bottom: 10px;
            box-shadow: var(--shadow);
        }
        .month-nav button {
            width: 32px; height: 32px;
            border-radius: 50%;
            border: 1px solid var(--gray-200);
            background: var(--white);
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-size: 16px;
            color: var(--gray-600);
            transition: all 0.2s;
        }
        .month-nav button:hover:not(:disabled) {
            background: var(--primary);
            color: var(--white);
            border-color: var(--primary);
        }
        .month-nav button:disabled { opacity: 0.3; cursor: not-allowed; }
        .month-nav h3 { font-size: 15px; font-weight: 700; color: var(--gray-800); }

        /* ── CALENDAR GRID ── */
        .calendar-card {
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            overflow: hidden;
            margin-bottom: 16px;
        }
        .calendar-weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            background: var(--gray-50);
            border-bottom: 1px solid var(--gray-100);
        }
        .weekday {
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            color: var(--gray-400);
            padding: 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .weekday:first-child { color: #ef4444; }
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: var(--gray-100);
        }
        .calendar-day {
            background: var(--white);
            aspect-ratio: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            min-height: 42px;
        }
        .calendar-day.empty { background: var(--gray-50); cursor: default; }
        .calendar-day.past { background: var(--white); cursor: not-allowed; }
        .calendar-day.past .day-num { color: var(--gray-200); }
        .calendar-day.available:hover { background: var(--primary-light); }
        .calendar-day.available .day-num { color: var(--primary); font-weight: 700; }
        .calendar-day.available::after {
            content: '';
            width: 5px; height: 5px;
            background: var(--primary);
            border-radius: 50%;
            position: absolute;
            bottom: 5px;
        }
        .calendar-day.selected { background: var(--primary) !important; }
        .calendar-day.selected .day-num { color: var(--white) !important; font-weight: 700; }
        .calendar-day.selected::after { background: var(--white); }
        .calendar-day.today .day-num {
            background: var(--gray-100);
            border-radius: 50%;
            width: 26px; height: 26px;
            display: flex; align-items: center; justify-content: center;
        }
        .day-num {
            font-size: 13px;
            font-weight: 500;
            color: var(--gray-800);
            line-height: 1;
        }

        /* ── TIME SLOTS ── */
        .time-section {
            animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .time-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }
        .time-btn {
            border: 2px solid var(--gray-200);
            border-radius: 12px;
            padding: 10px 6px;
            text-align: center;
            cursor: pointer;
            background: var(--white);
            transition: all 0.2s;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .time-btn:hover { border-color: var(--primary); background: var(--primary-light); }
        .time-btn.selected { border-color: var(--primary); background: var(--primary); color: var(--white); }
        .time-btn .t-time {
            font-size: 13px;
            font-weight: 700;
            display: block;
            color: var(--gray-800);
        }
        .time-btn .t-period {
            font-size: 10px;
            color: var(--gray-400);
            display: block;
            margin-top: 2px;
        }
        .time-btn.selected .t-time,
        .time-btn.selected .t-period { color: var(--white); }

        /* ── SELECTED SUMMARY ── */
        .selection-summary {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            border-radius: var(--radius);
            padding: 14px 16px;
            color: var(--white);
            margin-bottom: 12px;
            display: none;
            animation: slideUp 0.3s ease;
        }
        .selection-summary.show { display: block; }
        .selection-summary .s-label { font-size: 11px; opacity: 0.7; margin-bottom: 4px; }
        .selection-summary .s-value { font-size: 15px; font-weight: 700; }
        .selection-summary .s-row { display: flex; gap: 20px; }
        .selection-summary .s-col { flex: 1; }

        /* ── EMPTY STATE ── */
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--gray-400);
        }
        .empty-state .icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state p { font-size: 14px; }

        /* ── SUBMIT BUTTON ── */
        .submit-bar {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            padding: 12px 16px;
            background: var(--white);
            border-top: 1px solid var(--gray-100);
            box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
        }
        .submit-btn {
            width: 100%;
            background: var(--primary);
            color: var(--white);
            font-size: 15px;
            font-weight: 700;
            border: none;
            border-radius: 14px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 14px rgba(79,70,229,0.35);
        }
        .submit-btn:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-1px); }
        .submit-btn:disabled { background: var(--gray-200); color: var(--gray-400); cursor: not-allowed; box-shadow: none; transform: none; }

        /* ── SUCCESS SCREEN ── */
        .success-screen {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
            text-align: center;
            padding: 24px;
            animation: slideUp 0.4s ease;
        }
        .success-screen.show { display: flex; }
        .success-icon {
            width: 80px; height: 80px;
            background: #d1fae5;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 40px;
            margin-bottom: 20px;
            animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn {
            from { transform: scale(0); opacity: 0; }
            to   { transform: scale(1); opacity: 1; }
        }
        .success-screen h2 { font-size: 22px; font-weight: 700; color: var(--success); margin-bottom: 8px; }
        .success-screen p  { font-size: 14px; color: var(--gray-600); line-height: 1.6; }

        /* ── ERROR MSG ── */
        .error-msg {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: var(--danger);
            border-radius: 10px;
            padding: 12px 16px;
            font-size: 13px;
            text-align: center;
            margin-bottom: 12px;
            display: none;
        }
        .error-msg.show { display: block; animation: slideUp 0.3s ease; }
    </style>
</head>
<body>

    <!-- HEADER -->
    <div class="header">
        <h1>🦷 {{ $clinic->clinic_name }}</h1>
        <p>Book Your Dental Appointment</p>
    </div>

    <!-- PROGRESS STEPS -->
    <div class="steps">
        <div class="step active" id="step1">
            <div class="step-dot">1</div>
            <span>Date</span>
        </div>
        <div class="step-line" id="line1"></div>
        <div class="step" id="step2">
            <div class="step-dot">2</div>
            <span>Time</span>
        </div>
        <div class="step-line" id="line2"></div>
        <div class="step" id="step3">
            <div class="step-dot">3</div>
            <span>Confirm</span>
        </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="container" id="mainContent">

        <div class="error-msg" id="errorMsg"></div>

        <!-- MONTH NAVIGATION -->
        <div class="month-nav">
            <button id="prevMonth" onclick="changeMonth(-1)">&#8249;</button>
            <h3 id="monthLabel"></h3>
            <button id="nextMonth" onclick="changeMonth(1)">&#8250;</button>
        </div>

        <!-- CALENDAR CARD -->
        <div class="calendar-card">
            <div class="calendar-weekdays">
                <div class="weekday">Sun</div>
                <div class="weekday">Mon</div>
                <div class="weekday">Tue</div>
                <div class="weekday">Wed</div>
                <div class="weekday">Thu</div>
                <div class="weekday">Fri</div>
                <div class="weekday">Sat</div>
            </div>
            <div class="calendar-grid" id="calendarGrid"></div>
        </div>

        <!-- SELECTED SUMMARY -->
        <div class="selection-summary" id="selectionSummary">
            <div class="s-row">
                <div class="s-col">
                    <div class="s-label">📅 Selected Date</div>
                    <div class="s-value" id="summaryDate">—</div>
                </div>
                <div class="s-col">
                    <div class="s-label">⏰ Selected Time</div>
                    <div class="s-value" id="summaryTime">—</div>
                </div>
            </div>
        </div>

        <!-- TIME SLOTS (shown after date selected) -->
        <div id="timeSection" style="display:none;" class="time-section">
            <div class="section-label">⏰ Available Times</div>
            <div class="time-grid" id="timeGrid"></div>
        </div>

        <!-- NO SLOTS STATE (shown when month has no slots) -->
        <div class="empty-state" id="emptyState" style="display:none;">
            <div class="icon">📅</div>
            <p>No available slots this month.<br>Try navigating to another month.</p>
        </div>

    </div>

    <!-- SUCCESS SCREEN -->
    <div class="success-screen" id="successScreen">
        <div class="success-icon">✅</div>
        <h2>Schedule Selected!</h2>
        <p>Your preferred schedule has been saved.<br><br><strong>Redirecting you back to the chat...</strong></p>
    </div>

    <!-- FIXED SUBMIT BAR -->
    <div class="submit-bar" id="submitBar">
        <button class="submit-btn" id="submitBtn" onclick="submitSelection()" disabled>
            Confirm Schedule
        </button>
    </div>

    <!-- Messenger Extensions SDK -->
    <script>
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/messenger.Extensions.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'Messenger'));
    </script>

    <script>
        // ── DATA FROM SERVER ───────────────────────────────────────────────
        const availableData  = @json($availableDates);  // { "2026-05-20": ["09:00","10:00",...], ... }
        const sessionId      = '{{ $session->session_id }}';
        const availableDates = Object.keys(availableData);

        // ── STATE ──────────────────────────────────────────────────────────
        let selectedDate = null;
        let selectedTime = null;
        let currentYear, currentMonth;

        // ── INIT ───────────────────────────────────────────────────────────
        (function init() {
            const today = new Date();
            currentYear  = today.getFullYear();
            currentMonth = today.getMonth(); // 0-indexed

            // Jump to earliest available month if needed
            if (availableDates.length > 0) {
                const earliest = new Date(availableDates[0]);
                if (earliest > today) {
                    currentYear  = earliest.getFullYear();
                    currentMonth = earliest.getMonth();
                }
            }

            renderCalendar();
        })();

        // ── CALENDAR RENDER ────────────────────────────────────────────────
        function renderCalendar() {
            const months = ['January','February','March','April','May','June',
                            'July','August','September','October','November','December'];
            document.getElementById('monthLabel').textContent = `${months[currentMonth]} ${currentYear}`;

            const today = new Date();
            today.setHours(0,0,0,0);

            // Disable prev button if current month <= today's month
            const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const viewMonthStart = new Date(currentYear, currentMonth, 1);
            document.getElementById('prevMonth').disabled = viewMonthStart <= thisMonthStart;

            const grid = document.getElementById('calendarGrid');
            grid.innerHTML = '';

            const firstDay   = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

            // Empty cells before 1st
            for (let i = 0; i < firstDay; i++) {
                const empty = document.createElement('div');
                empty.className = 'calendar-day empty';
                grid.appendChild(empty);
            }

            let hasAnySlot = false;

            // Day cells
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const dateObj = new Date(currentYear, currentMonth, d);
                dateObj.setHours(0,0,0,0);

                const isAvailable = availableDates.includes(dateStr);
                const isPast      = dateObj < today;
                const isToday     = dateObj.getTime() === today.getTime();
                const isSelected  = dateStr === selectedDate;

                if (isAvailable) hasAnySlot = true;

                const cell = document.createElement('div');
                cell.className = 'calendar-day';
                if (isAvailable && !isPast) cell.className += ' available';
                else if (isPast) cell.className += ' past';
                if (isToday)    cell.className += ' today';
                if (isSelected) cell.className += ' selected';

                const num = document.createElement('span');
                num.className = 'day-num';
                num.textContent = d;
                cell.appendChild(num);

                if (isAvailable && !isPast) {
                    cell.onclick = () => selectDate(dateStr, cell);
                }

                grid.appendChild(cell);
            }

            // Show/hide empty state
            document.getElementById('emptyState').style.display = hasAnySlot ? 'none' : 'block';
        }

        function changeMonth(delta) {
            currentMonth += delta;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
            // Clear time selection when month changes
            if (selectedDate) {
                const [y, m] = selectedDate.split('-').map(Number);
                if (y !== currentYear || m - 1 !== currentMonth) {
                    selectedDate = null;
                    selectedTime = null;
                    document.getElementById('timeSection').style.display = 'none';
                    updateSummary();
                    updateSubmitBtn();
                }
            }
            renderCalendar();
        }

        // ── DATE SELECT ────────────────────────────────────────────────────
        function selectDate(date, cell) {
            selectedDate = date;
            selectedTime = null;

            // Update step UI
            setStep(2);

            // Re-render calendar to update selected state
            renderCalendar();

            // Render time slots
            const times = availableData[date] || [];
            const grid  = document.getElementById('timeGrid');
            grid.innerHTML = '';

            times.forEach(time => {
                const [hStr, mStr] = time.split(':');
                const h = parseInt(hStr);
                const ampm  = h >= 12 ? 'PM' : 'AM';
                const h12   = h % 12 || 12;
                const label = `${h12}:${mStr}`;

                const btn = document.createElement('div');
                btn.className = 'time-btn';
                btn.dataset.time = time;
                btn.innerHTML = `<span class="t-time">${label}</span><span class="t-period">${ampm}</span>`;
                btn.onclick = () => selectTime(time, btn);
                grid.appendChild(btn);
            });

            document.getElementById('timeSection').style.display = 'block';
            document.getElementById('timeSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            updateSummary();
            updateSubmitBtn();
        }

        // ── TIME SELECT ────────────────────────────────────────────────────
        function selectTime(time, btnEl) {
            selectedTime = time;

            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
            btnEl.classList.add('selected');

            setStep(3);
            updateSummary();
            updateSubmitBtn();
        }

        // ── SUMMARY ────────────────────────────────────────────────────────
        function updateSummary() {
            const summary = document.getElementById('selectionSummary');
            if (!selectedDate) { summary.classList.remove('show'); return; }

            const d = new Date(selectedDate + 'T00:00:00');
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            document.getElementById('summaryDate').textContent =
                `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

            if (selectedTime) {
                const [hStr, mStr] = selectedTime.split(':');
                const h = parseInt(hStr);
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12  = h % 12 || 12;
                document.getElementById('summaryTime').textContent = `${h12}:${mStr} ${ampm}`;
            } else {
                document.getElementById('summaryTime').textContent = 'Not yet selected';
            }

            summary.classList.add('show');
        }

        // ── PROGRESS STEPS ─────────────────────────────────────────────────
        function setStep(step) {
            for (let i = 1; i <= 3; i++) {
                const el = document.getElementById(`step${i}`);
                el.className = 'step';
                if (i < step)  el.classList.add('done');
                if (i === step) el.classList.add('active');
            }
            for (let i = 1; i <= 2; i++) {
                const line = document.getElementById(`line${i}`);
                line.className = 'step-line';
                if (i < step) line.classList.add('done');
            }
            // Update dot icons for done steps
            document.querySelectorAll('.step.done .step-dot').forEach(d => {
                if (!d.textContent.includes('✓')) d.textContent = '✓';
            });
        }

        // ── SUBMIT ─────────────────────────────────────────────────────────
        function updateSubmitBtn() {
            document.getElementById('submitBtn').disabled = !(selectedDate && selectedTime);
        }

        async function submitSelection() {
            if (!selectedDate || !selectedTime) return;

            const btn = document.getElementById('submitBtn');
            btn.disabled  = true;
            btn.textContent = 'Sending...';

            try {
                const res = await fetch('/api/webview/calendar/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId, date: selectedDate, time: selectedTime })
                });

                if (res.ok) {
                    // Show success screen
                    document.getElementById('mainContent').style.display   = 'none';
                    document.getElementById('submitBar').style.display      = 'none';
                    document.querySelector('.steps').style.display          = 'none';
                    document.getElementById('successScreen').classList.add('show');

                    // Try to close Messenger webview, or fallback to redirecting to Messenger
                    setTimeout(() => {
                        const fbPageId = '{{ $fbPageId }}';
                        if (typeof MessengerExtensions !== 'undefined') {
                            MessengerExtensions.requestCloseBrowser(function success() {
                                console.log("Webview closed successfully");
                            }, function error(err) {
                                console.error("Error closing webview via SDK, redirecting...", err);
                                if (fbPageId) {
                                    window.location.href = 'https://m.me/' + fbPageId;
                                }
                            });
                        } else {
                            if (fbPageId) {
                                window.location.href = 'https://m.me/' + fbPageId;
                            }
                        }
                    }, 2000);
                } else {
                    const data = await res.json();
                    showError(data.error || 'Something went wrong. Please try again.');
                    btn.disabled    = false;
                    btn.textContent = 'Confirm Schedule';
                }
            } catch (err) {
                showError('Network error. Please check your connection and try again.');
                btn.disabled    = false;
                btn.textContent = 'Confirm Schedule';
            }
        }

        function showError(msg) {
            const el = document.getElementById('errorMsg');
            el.textContent = msg;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 5000);
        }
    </script>
</body>
</html>
