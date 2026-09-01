<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 24px 12px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04), 0 4px 6px -4px rgba(0,0,0,0.02); }
        .header { background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); text-align: center; border-bottom: 1px solid #f1f5f9; padding: 28px 24px 20px 24px; }
        .clinic-logo { max-height: 56px; max-width: 220px; object-fit: contain; margin: 0 auto 10px auto; display: block; }
        .clinic-title { font-size: 20px; font-weight: 800; color: #0d9488; text-decoration: none; margin: 0; letter-spacing: -0.02em; }
        .clinic-subtitle { font-size: 11px; font-weight: 600; color: #64748b; margin-top: 4px; }
        .body-content { padding: 28px 28px; line-height: 1.65; font-size: 14px; color: #334155; }
        .body-content p { margin: 0 0 14px 0; }
        .body-content strong { color: #0f172a; }
        .contact-box { margin-top: 24px; padding: 14px 18px; background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 10px; font-size: 12px; color: #0f766e; }
        .contact-box strong { color: #115e59; }
        .footer { text-align: center; background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 22px 20px; font-size: 11px; color: #64748b; }
        .footer p { margin: 4px 0; }
        .footer .powered { font-size: 10px; color: #94a3b8; margin-top: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            @if(!empty($clinic_logo))
                <img src="{{ $clinic_logo }}" alt="{{ $clinic_name }}" class="clinic-logo">
            @endif
            <h1 class="clinic-title">{{ $clinic_name }}</h1>
            @if(!empty($clinic_address))
                <div class="clinic-subtitle">{{ $clinic_address }}</div>
            @endif
        </div>
        
        <div class="body-content">
            {!! $body !!}

            @if(!empty($clinic_phone) || !empty($reply_to_email))
                <div class="contact-box">
                    <strong>Have questions or need to reschedule?</strong><br>
                    @if(!empty($clinic_phone)) Phone: {{ $clinic_phone }} &nbsp;|&nbsp; @endif
                    @if(!empty($reply_to_email)) Direct Reply: {{ $reply_to_email }} @endif
                </div>
            @endif
        </div>

        <div class="footer">
            <p>This is an automated notification from <strong>{{ $clinic_name }}</strong>.</p>
            <p>You can directly reply to this email to get in touch with the clinic team.</p>
            <div class="powered">Powered by Pivodent Dental SaaS Platform</div>
        </div>
    </div>
</body>
</html>
