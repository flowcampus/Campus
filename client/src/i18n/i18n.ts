import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      'common.loading': 'Loading...',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.export': 'Export',
      'common.import': 'Import',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.ok': 'OK',
      'common.close': 'Close',
      'common.submit': 'Submit',
      'common.reset': 'Reset',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.finish': 'Finish',
      'common.view': 'View',
      'common.download': 'Download',
      'common.upload': 'Upload',
      'common.select': 'Select',
      'common.all': 'All',
      'common.none': 'None',
      'common.active': 'Active',
      'common.inactive': 'Inactive',
      'common.pending': 'Pending',
      'common.approved': 'Approved',
      'common.rejected': 'Rejected',
      'common.success': 'Success',
      'common.error': 'Error',
      'common.warning': 'Warning',
      'common.info': 'Info',

      // Authentication
      'auth.login': 'Login',
      'auth.logout': 'Logout',
      'auth.register': 'Register',
      'auth.email': 'Email Address',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.firstName': 'First Name',
      'auth.lastName': 'Last Name',
      'auth.phone': 'Phone Number',
      'auth.rememberMe': 'Remember me',
      'auth.forgotPassword': 'Forgot password?',
      'auth.dontHaveAccount': "Don't have an account?",
      'auth.alreadyHaveAccount': 'Already have an account?',
      'auth.signInHere': 'Sign in here',
      'auth.signUpHere': 'Sign up here',
      'auth.guestLogin': 'Continue as Guest',
      'auth.adminPortal': 'Admin Portal',
      'auth.welcomeBack': 'Welcome back!',
      'auth.createAccount': 'Create Account',

      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.students': 'Students',
      'nav.teachers': 'Teachers',
      'nav.classes': 'Classes',
      'nav.attendance': 'Attendance',
      'nav.grades': 'Grades',
      'nav.fees': 'Fees',
      'nav.announcements': 'Announcements',
      'nav.events': 'Events',
      'nav.messages': 'Messages',
      'nav.notifications': 'Notifications',
      'nav.settings': 'Settings',
      'nav.profile': 'Profile',
      'nav.schools': 'Schools',
      'nav.reports': 'Reports',

      // Dashboard
      'dashboard.welcome': 'Welcome back, {{name}}!',
      'dashboard.overview': "Here's your overview for today",
      'dashboard.quickActions': 'Quick Actions',
      'dashboard.recentActivities': 'Recent Activities',
      'dashboard.upcomingEvents': 'Upcoming Events',
      'dashboard.statistics': 'Statistics',

      // Students
      'students.title': 'Students Management',
      'students.subtitle': 'Manage student records, enrollment, and information',
      'students.addStudent': 'Add Student',
      'students.editStudent': 'Edit Student',
      'students.studentId': 'Student ID',
      'students.class': 'Class',
      'students.guardian': 'Guardian',
      'students.status': 'Status',
      'students.personalInfo': 'Personal Information',
      'students.guardianInfo': 'Guardian Information',
      'students.academicInfo': 'Academic Information',
      'students.contactInfo': 'Contact Information',

      // Teachers
      'teachers.title': 'Teachers Management',
      'teachers.subtitle': 'Manage teaching staff and assignments',
      'teachers.addTeacher': 'Add Teacher',
      'teachers.editTeacher': 'Edit Teacher',
      'teachers.employeeId': 'Employee ID',
      'teachers.qualification': 'Qualification',
      'teachers.specialization': 'Specialization',
      'teachers.subjects': 'Subjects',
      'teachers.schedule': 'Schedule',

      // Classes
      'classes.title': 'Classes Management',
      'classes.subtitle': 'Manage class schedules and assignments',
      'classes.addClass': 'Add Class',
      'classes.editClass': 'Edit Class',
      'classes.className': 'Class Name',
      'classes.level': 'Level',
      'classes.capacity': 'Capacity',
      'classes.teacher': 'Class Teacher',
      'classes.students': 'Students',

      // Attendance
      'attendance.title': 'Attendance Management',
      'attendance.subtitle': 'Track and manage student attendance',
      'attendance.markAttendance': 'Mark Attendance',
      'attendance.present': 'Present',
      'attendance.absent': 'Absent',
      'attendance.late': 'Late',
      'attendance.excused': 'Excused',
      'attendance.rate': 'Attendance Rate',
      'attendance.summary': 'Attendance Summary',

      // Grades
      'grades.title': 'Grades Management',
      'grades.subtitle': 'Record and manage student grades',
      'grades.addGrade': 'Add Grade',
      'grades.editGrade': 'Edit Grade',
      'grades.subject': 'Subject',
      'grades.score': 'Score',
      'grades.maxScore': 'Max Score',
      'grades.grade': 'Grade',
      'grades.remarks': 'Remarks',
      'grades.gpa': 'GPA',
      'grades.average': 'Average',

      // Fees
      'fees.title': 'Fees Management',
      'fees.subtitle': 'Manage school fees and payments',
      'fees.feeStructure': 'Fee Structure',
      'fees.payment': 'Payment',
      'fees.amount': 'Amount',
      'fees.dueDate': 'Due Date',
      'fees.status': 'Status',
      'fees.paid': 'Paid',
      'fees.unpaid': 'Unpaid',
      'fees.partial': 'Partial',
      'fees.balance': 'Balance',

      // Messages
      'messages.title': 'Messages',
      'messages.subtitle': 'Communication center',
      'messages.compose': 'Compose Message',
      'messages.inbox': 'Inbox',
      'messages.sent': 'Sent',
      'messages.recipient': 'Recipient',
      'messages.subject': 'Subject',
      'messages.message': 'Message',
      'messages.send': 'Send Message',
      'messages.reply': 'Reply',
      'messages.forward': 'Forward',

      // Notifications
      'notifications.title': 'Notifications',
      'notifications.subtitle': 'Stay updated with important alerts',
      'notifications.markAllRead': 'Mark All as Read',
      'notifications.unread': 'Unread',
      'notifications.read': 'Read',

      // Settings
      'settings.title': 'Settings',
      'settings.subtitle': 'Manage your preferences',
      'settings.profile': 'Profile Settings',
      'settings.account': 'Account Settings',
      'settings.notifications': 'Notification Settings',
      'settings.privacy': 'Privacy Settings',
      'settings.language': 'Language',
      'settings.theme': 'Theme',
      'settings.lightMode': 'Light Mode',
      'settings.darkMode': 'Dark Mode',

      // Errors
      'error.generic': 'An error occurred. Please try again.',
      'error.network': 'Network error. Please check your connection.',
      'error.unauthorized': 'You are not authorized to perform this action.',
      'error.notFound': 'The requested resource was not found.',
      'error.validation': 'Please check your input and try again.',
      'error.server': 'Server error. Please try again later.',

      // Success messages
      'success.saved': 'Successfully saved!',
      'success.deleted': 'Successfully deleted!',
      'success.updated': 'Successfully updated!',
      'success.created': 'Successfully created!',
      'success.sent': 'Successfully sent!',
    }
  },
  fr: {
    translation: {
      // Common French translations
      'common.loading': 'Chargement...',
      'common.save': 'Enregistrer',
      'common.cancel': 'Annuler',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.add': 'Ajouter',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',
      'common.export': 'Exporter',
      'common.import': 'Importer',
      'common.yes': 'Oui',
      'common.no': 'Non',
      'common.ok': 'OK',
      'common.close': 'Fermer',
      'common.submit': 'Soumettre',
      'common.reset': 'Réinitialiser',
      'common.back': 'Retour',
      'common.next': 'Suivant',
      'common.previous': 'Précédent',
      'common.finish': 'Terminer',

      // Authentication French
      'auth.login': 'Connexion',
      'auth.logout': 'Déconnexion',
      'auth.register': "S'inscrire",
      'auth.email': 'Adresse e-mail',
      'auth.password': 'Mot de passe',
      'auth.confirmPassword': 'Confirmer le mot de passe',
      'auth.firstName': 'Prénom',
      'auth.lastName': 'Nom de famille',
      'auth.phone': 'Numéro de téléphone',
      'auth.rememberMe': 'Se souvenir de moi',
      'auth.forgotPassword': 'Mot de passe oublié?',
      'auth.welcomeBack': 'Bon retour!',

      // Navigation French
      'nav.dashboard': 'Tableau de bord',
      'nav.students': 'Étudiants',
      'nav.teachers': 'Enseignants',
      'nav.classes': 'Classes',
      'nav.attendance': 'Présence',
      'nav.grades': 'Notes',
      'nav.fees': 'Frais',
      'nav.announcements': 'Annonces',
      'nav.events': 'Événements',
      'nav.messages': 'Messages',
      'nav.notifications': 'Notifications',
      'nav.settings': 'Paramètres',
    }
  },
  pidgin: {
    translation: {
      // Pidgin translations (Nigerian Pidgin English)
      'common.loading': 'Dey load...',
      'common.save': 'Save am',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.ok': 'OK',
      'common.back': 'Go back',
      'common.next': 'Next',

      // Authentication Pidgin
      'auth.login': 'Login',
      'auth.logout': 'Logout',
      'auth.register': 'Register',
      'auth.email': 'Email address',
      'auth.password': 'Password',
      'auth.firstName': 'First name',
      'auth.lastName': 'Last name',
      'auth.phone': 'Phone number',
      'auth.welcomeBack': 'Welcome back!',

      // Navigation Pidgin
      'nav.dashboard': 'Dashboard',
      'nav.students': 'Students',
      'nav.teachers': 'Teachers',
      'nav.classes': 'Classes',
      'nav.attendance': 'Attendance',
      'nav.grades': 'Grades',
      'nav.fees': 'School fees',
      'nav.announcements': 'Announcements',
      'nav.events': 'Events',
      'nav.messages': 'Messages',
      'nav.settings': 'Settings',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
