// Hero Section Images (from herosection_images)
import heroAppointments from './herosection_images/Appointments.png';
import heroDashboard    from './herosection_images/Dashboard.png';
import heroDashboardio  from './herosection_images/Dashboardio.png';
import heroPatients     from './herosection_images/Patients.png';
import heroPatientsdev  from './herosection_images/Patientsdev.png';
import heroReports      from './herosection_images/Reports.png';
import heroStaffUsers   from './herosection_images/Staff & Users.png';

// Logos (from pivodent_logo & footer)
import pivodentLogo from './pivodent_logo/Group 3.svg';
import pivodentLogoWhite from './footer/pivodent_white.svg';
import pivodentText from './pivodent_logo/Pivodent.svg';
import pivodentIcon from './pivodent_logo/6.svg';

// Phone Design Assets
import phoneIconContainer from './phone_design/Icon Container.svg';
import phoneChatbotLogo   from './phone_design/chabot logo.svg';

// Footer & CTA Banner Assets (from footer)
import footerRectangle   from './footer/Rectangle.png';
import footerFacebook    from './footer/Clip path group.svg';
import footerGmail       from './footer/Clip path group-1.svg';
import footerMessenger   from './footer/Clip path group-2.svg';
import footerChat        from './footer/Group.svg';
import footerMeta        from './footer/images 2.svg';
import footerSocialGrid  from './footer/Social Media Icons.svg';

export default {
  // Hero section images
  heroAppointments,
  heroDashboard,
  heroDashboardio,
  heroPatients,
  heroPatientsdev,
  heroReports,
  heroStaffUsers,

  // Logos
  pivodentLogo,
  pivodentLogoWhite,
  pivodentText,
  pivodentIcon,

  // Phone Design Assets
  phoneIconContainer,
  phoneChatbotLogo,

  // Footer & CTA Banner Assets
  footerRectangle,
  ctaBannerBg: footerRectangle,
  footerFacebook,
  footerGmail,
  footerMessenger,
  footerChat,
  footerMeta,
  footerSocialGrid,

  // Fallbacks/Aliases for legacy asset imports
  dentalOfficeMockup: heroDashboard,
  dentalScheduleUi:   heroAppointments,
  dentalPatientsUi:   heroPatients,
  illustrationHero:   heroDashboardio,
};
