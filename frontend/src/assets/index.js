// Hero Section Images (from herosection_images)
import heroAppointments from './herosection_images/Appointments.png';
import heroDashboard    from './herosection_images/Dashboard.png';
import heroDashboardio  from './herosection_images/Dashboardio.png';
import heroPatients     from './herosection_images/Patients.png';
import heroPatientsdev  from './herosection_images/Patientsdev.png';
import heroReports      from './herosection_images/Reports.png';
import heroStaffUsers   from './herosection_images/Staff & Users.png';

// Logos (from pivodent_logo)
import pivodentLogo from './pivodent_logo/Group 3.svg';
import pivodentText from './pivodent_logo/Pivodent.svg';
import pivodentIcon from './pivodent_logo/6.svg';

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
  pivodentText,
  pivodentIcon,

  // Fallbacks/Aliases for legacy asset imports
  dentalOfficeMockup: heroDashboard,
  dentalScheduleUi:   heroAppointments,
  dentalPatientsUi:   heroPatients,
  illustrationHero:   heroDashboardio,
};
