<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>{{ $subject }}</title>
    <!-- Google Fonts for supported clients -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Work+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Work+Sans:wght@500;600;700;800&display=swap');
        
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            outline: none;
            text-decoration: none;
        }
        @media only screen and (max-width: 640px) {
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
            }
            .content-padding {
                padding: 24px 20px !important;
            }
            .header-padding {
                padding: 20px 20px !important;
            }
            .headline-text {
                font-size: 34px !important;
                line-height: 40px !important;
            }
            .card-padding {
                padding: 18px 16px !important;
            }
            .col-meta {
                display: block !important;
                width: 100% !important;
                padding-bottom: 14px !important;
            }
            .workspace-access-col {
                display: block !important;
                width: 100% !important;
                padding-bottom: 12px !important;
            }
            .footer-col {
                display: block !important;
                width: 100% !important;
                text-align: left !important;
                padding-bottom: 14px !important;
            }
        }
    </style>
</head>
@php
    // Fast, globally accessible GitHub CDN asset URLs (immune to Brevo SMTP stripping & ngrok timeouts)
    $cdnBase = 'https://raw.githubusercontent.com/rolandomajait1-rgb/Dentistly-SaaS-Clinic-System-/main/backend/public/images';
    $brandSymbolUrl = "{$cdnBase}/email-brand-symbol-opt.png";
    $shieldCheckUrl = "{$cdnBase}/email-shield-check.png";
    $checkIconUrl   = "{$cdnBase}/email-check.png";
    $lockIconUrl    = "{$cdnBase}/email-lock-keyhole.png";
@endphp
<body style="margin: 0; padding: 0; background-color: #EEF2F0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EEF2F0; padding: 36px 12px;">
        <tr>
            <td align="center">
                <!-- Main Card Container (Figma: 880px canvas, responsive max 680px for standard email clients) -->
                <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 680px; background-color: #FFFFFF; border: 1px solid #DCE5E0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05); text-align: left;">
                    
                    <!-- 1. Top Brand Accent Line (#064B42, 6px) -->
                    <tr>
                        <td height="6" style="background-color: #064B42; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>

                    <!-- 2. Brand Header (Logo on left, CLINICAL PRACTICE SUITE on right) -->
                    <tr>
                        <td class="header-padding" style="padding: 28px 48px; background-color: #FFFFFF;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <!-- Left: Brand Logo & Wordmark -->
                                    <td valign="middle" align="left">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td valign="middle" style="padding-right: 10px; line-height: 0;">
                                                    <img src="{{ $brandSymbolUrl }}" alt="Pivodent" width="38" height="40" style="display: block; width: 38px; height: 40px; border: 0;" />
                                                </td>
                                                <td valign="middle">
                                                    <span style="font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; font-weight: 700; color: #063E3F; letter-spacing: 0.05em; text-transform: uppercase;">
                                                        PIVODENT
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <!-- Right: Clinical Practice Suite descriptor -->
                                    <td valign="middle" align="right">
                                        <span style="font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 500; color: #637570; letter-spacing: 0.08em; text-transform: uppercase;">
                                            CLINICAL PRACTICE SUITE
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- 3. Main Body Section -->
                    <tr>
                        <td class="content-padding" style="padding: 0 48px 40px 48px; background-color: #FFFFFF;">
                            
                            <!-- Category: Shield Icon + Text (Work Sans 12px uppercase #064B42) -->
                            <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                <tr>
                                    <td valign="middle" style="padding-right: 8px; line-height: 0;">
                                        <img src="{{ $shieldCheckUrl }}" alt="" width="18" height="18" style="display: block; width: 18px; height: 18px; border: 0;" />
                                    </td>
                                    <td valign="middle">
                                        <span style="font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 500; color: #064B42; letter-spacing: 0.06em; text-transform: uppercase;">
                                            {{ $role_badge_text }}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Main Headline: "You're invited to join pivodent." (DM Sans Bold 46px, color #064B42) -->
                            <h1 class="headline-text" style="margin: 0 0 24px 0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 46px; font-weight: 700; color: #064B42; line-height: 1.15; letter-spacing: -0.025em;">
                                You're invited<br />to join {{ strtolower($clinic_name) }}.
                            </h1>

                            <!-- Personal Greeting -->
                            <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 600; color: #1E2939; line-height: 28px; margin-bottom: 8px;">
                                Hello {{ $staff_name }},
                            </div>

                            <!-- Intro Message -->
                            <p style="margin: 0 0 32px 0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 22px; color: #637570;">
                                You have been invited to join the clinic operations team at <strong style="color: #0F3E38; font-weight: 600;">{{ $clinic_name }}</strong> as an authorized <strong style="color: #0F3E38; font-weight: 600;">{{ $role_title }}</strong> on the Pivodent Dental SaaS platform.
                            </p>

                            <!-- 4. Your Clinic Workspace Card (#F4F7F4, border #DCE5E0, radius 16px) -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F4F7F4; border: 1px solid #DCE5E0; border-radius: 16px; margin-bottom: 28px;">
                                <tr>
                                    <td class="card-padding" style="padding: 24px 28px;">
                                        
                                        <!-- Card Section Title -->
                                        <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 600; color: #064B42; line-height: 28px; margin-bottom: 20px;">
                                            Your clinic workspace
                                        </div>

                                        <!-- Assignment Details (3 Columns Grid) -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <!-- Col 1: Assigned Role -->
                                                <td class="col-meta" width="30%" valign="top" style="padding-right: 12px;">
                                                    <div style="font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 500; color: #637570; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px;">
                                                        ASSIGNED ROLE
                                                    </div>
                                                    <div>
                                                        <span style="display: inline-block; background-color: #E8F3EC; color: #0F3E38; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 9999px;">
                                                            {{ $role_title }}
                                                        </span>
                                                    </div>
                                                </td>

                                                <!-- Col 2: Dental Clinic -->
                                                <td class="col-meta" width="35%" valign="top" style="padding-right: 12px;">
                                                    <div style="font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 500; color: #637570; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px;">
                                                        DENTAL CLINIC
                                                    </div>
                                                    <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 600; color: #064B42; line-height: 20px;">
                                                        {{ $clinic_name }}
                                                    </div>
                                                </td>

                                                <!-- Col 3: Location -->
                                                <td class="col-meta" width="35%" valign="top">
                                                    <div style="font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 500; color: #637570; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px;">
                                                        LOCATION
                                                    </div>
                                                    <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 600; color: #064B42; line-height: 20px;">
                                                        {{ $clinic_address ?: 'Apalit Pampanga' }}
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Inner Card Divider Line (#DCE5E0) -->
                                        <div style="height: 1px; background-color: #DCE5E0; margin: 20px 0; font-size: 0; line-height: 0;">&nbsp;</div>

                                        <!-- Workspace Access Row -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td class="workspace-access-col" width="160" valign="top">
                                                    <div style="font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 500; color: #637570; text-transform: uppercase; letter-spacing: 0.04em;">
                                                        WORKSPACE ACCESS
                                                    </div>
                                                </td>
                                                <td valign="top">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        @foreach($workspace_features as $feature)
                                                        <tr>
                                                            <td width="24" valign="top" style="padding-bottom: 10px; line-height: 0;">
                                                                <img src="{{ $checkIconUrl }}" alt="✓" width="16" height="16" style="display: block; width: 16px; height: 16px; margin-top: 2px; border: 0;" />
                                                            </td>
                                                            <td valign="top" style="padding-bottom: 10px; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 400; color: #064B42; line-height: 20px;">
                                                                {{ $feature }}
                                                            </td>
                                                        </tr>
                                                        @endforeach
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <!-- 5. CTA Button: Full Width #0F3E38, radius 12px -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 18px;">
                                <tr>
                                    <td align="center" bgcolor="#0F3E38" style="background-color: #0F3E38; border-radius: 12px; height: 58px;">
                                        <a href="{{ $invite_url }}" target="_blank" style="display: block; width: 100%; padding: 18px 24px; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #FFFFFF; text-decoration: none; text-align: center; border-radius: 12px; box-sizing: border-box; letter-spacing: -0.01em;">
                                            Accept Invitation &amp; Set Password &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- 6. Activation Security (Lock icon + 48 hours note) -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 8px;">
                                <tr>
                                    <td align="center" style="padding-bottom: 6px;">
                                        <table border="0" cellpadding="0" cellspacing="0" style="display: inline-table;">
                                            <tr>
                                                <td valign="middle" style="padding-right: 6px; line-height: 0;">
                                                    <img src="{{ $lockIconUrl }}" alt="🔒" width="14" height="14" style="display: block; width: 14px; height: 14px; border: 0;" />
                                                </td>
                                                <td valign="middle">
                                                    <span style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #637570; line-height: 16px;">
                                                        This activation link is unique to you and will expire in <strong style="color: #0F3E38; font-weight: 700;">48 hours.</strong>
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <span style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #637570; line-height: 16px;">
                                            If the button doesn't work, <a href="{{ $invite_url }}" style="color: #0F3E38; font-weight: 500; text-decoration: underline;">click here to accept your invitation.</a>
                                        </span>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- 7. Footer: Support and Authenticity (#F4F7F4, border-top #DCE5E0) -->
                    <tr>
                        <td class="content-padding" style="background-color: #F4F7F4; border-top: 1px solid #DCE5E0; padding: 28px 48px;">
                            
                            <!-- Support Row (Questions on left, Contact on right) -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td class="footer-col" width="60%" valign="top">
                                        <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 600; color: #064B42; line-height: 20px; margin-bottom: 4px;">
                                            Questions about this invitation?
                                        </div>
                                        <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #637570; line-height: 16px;">
                                            Contact {{ $clinic_name }} by phone or email.
                                        </div>
                                    </td>
                                    <td class="footer-col" width="40%" valign="top" align="right">
                                        @if(!empty($clinic_phone))
                                        <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 600; color: #064B42; line-height: 20px; margin-bottom: 4px;">
                                            {{ $clinic_phone }}
                                        </div>
                                        @endif
                                        @if(!empty($reply_to_email))
                                        <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #064B42; line-height: 20px;">
                                            <a href="mailto:{{ $reply_to_email }}" style="color: #064B42; text-decoration: none;">{{ $reply_to_email }}</a>
                                        </div>
                                        @endif
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider Line (#DCE5E0) -->
                            <div style="height: 1px; background-color: #DCE5E0; margin: 20px 0 16px 0; font-size: 0; line-height: 0;">&nbsp;</div>

                            <!-- Official Dispatched Notice -->
                            <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #637570; line-height: 1.6;">
                                This is an official automated invitation dispatched on behalf of <strong style="color: #637570;">{{ $clinic_name }}.</strong><br />
                                If you did not expect this invitation, you can safely disregard it.
                            </div>

                            <!-- Platform Attribution: POWERED BY PIVODENT DENTAL EHR SYSTEMS -->
                            <div style="font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 500; color: #064B42; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 18px;">
                                POWERED BY PIVODENT DENTAL EHR SYSTEMS
                            </div>

                        </td>
                    </tr>

                </table>
                <!-- /Main Card Container -->
            </td>
        </tr>
    </table>
</body>
</html>
