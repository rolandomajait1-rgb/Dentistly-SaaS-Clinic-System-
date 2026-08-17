<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $subject }}</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 25px; }
        .logo { font-size: 22px; font-weight: 800; color: #0d9488; text-decoration: none; }
        .body { line-height: 1.6; font-size: 14px; color: #334155; }
        .footer { text-align: center; margin-top: 35px; font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="logo">{{ $clinic_name }}</span>
        </div>
        <div class="body">
            {!! $body !!}
        </div>
        <div class="footer">
            <p>This is an automated notification from {{ $clinic_name }}. Please do not reply directly to this email.</p>
            <p>© 2026 Powered by Pivodent SaaS</p>
        </div>
    </div>
</body>
</html>
