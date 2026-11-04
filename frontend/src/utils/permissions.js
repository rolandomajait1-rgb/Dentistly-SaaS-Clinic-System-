/**
 * Role-Based Access Control (RBAC) & Multi-Clinic Permission Helper
 * Matches Pivodent Figma Design Specs:
 * - Clinic Owner (node 556:11367): Dashboard, Appointments, Patients, Reports & Analytics, Staff & Users, Clinic Settings
 * - Admin (node 586:46302): Dashboard, Appointments, Patients, Reports & Analytics
 * - Dentist (node 586:50950): Dashboard (Clinical KPIs + Service Mix), Appointments, Patients
 * - Dental Assistant (node 596:58586): Dashboard, Appointments, Patients
 */

export const ROLE_CONFIGS = {
  owner: {
    roleKey: 'owner',
    displayName: 'Clinic Owner',
    headerLabel: 'clinic owner',
    pillLabel: 'Owner',
    allowedTabs: ['overview', 'schedule', 'patients', 'reports', 'staff', 'settings'],
    canViewRevenue: true,
    canManageStaff: true,
    canManageSettings: true,
  },
  admin: {
    roleKey: 'admin',
    displayName: 'Admin',
    headerLabel: 'admin',
    pillLabel: 'Admin',
    allowedTabs: ['overview', 'schedule', 'patients', 'reports'],
    canViewRevenue: true,
    canManageStaff: false,
    canManageSettings: false,
  },
  dentist: {
    roleKey: 'dentist',
    displayName: 'Dentist',
    headerLabel: 'dentist',
    pillLabel: 'Dentist',
    allowedTabs: ['overview', 'schedule', 'patients'],
    canViewRevenue: false,
    canManageStaff: false,
    canManageSettings: false,
  },
  assistant: {
    roleKey: 'assistant',
    displayName: 'Dental Assistant',
    headerLabel: 'Dental Assistant',
    pillLabel: 'Assistant',
    allowedTabs: ['overview', 'schedule', 'patients'],
    canViewRevenue: true,
    canManageStaff: false,
    canManageSettings: false,
  },
};

/**
 * Normalizes any database/UI role string into one of: 'owner' | 'admin' | 'dentist' | 'assistant'
 */
export function normalizeRoleKey(roleString) {
  if (!roleString) return 'owner';
  const r = String(roleString).toLowerCase().trim();

  if (r === 'owner' || r === 'clinic owner' || r === 'superadmin') {
    return 'owner';
  }
  if (r.includes('admin') || r === 'restricted') {
    return 'admin';
  }
  if (r.includes('dentist') || r.includes('doctor')) {
    return 'dentist';
  }
  if (r.includes('assistant') || r === 'staff' || r.includes('receptionist')) {
    return 'assistant';
  }
  return 'owner';
}

/**
 * Returns the full RBAC configuration for a given user (with optional per-clinic permissions array override)
 */
export function getRoleConfig(user) {
  const roleKey = normalizeRoleKey(user?.role_display || user?.role);
  const baseConfig = ROLE_CONFIGS[roleKey] || ROLE_CONFIGS.owner;

  // Support per-clinic custom permission overrides stored in user.permissions (JSON array)
  if (Array.isArray(user?.permissions) && user.permissions.length > 0 && roleKey !== 'owner') {
    const validTabIds = ['overview', 'schedule', 'patients', 'reports', 'staff', 'settings'];
    const customTabs = user.permissions.filter((p) => validTabIds.includes(p));
    if (customTabs.length > 0) {
      const mergedTabs = Array.from(new Set(['overview', ...customTabs]));
      return {
        ...baseConfig,
        allowedTabs: mergedTabs,
        canViewRevenue:
          user.permissions.includes('hide_revenue')
            ? false
            : user.permissions.includes('view_revenue') || baseConfig.canViewRevenue,
        canManageStaff: mergedTabs.includes('staff'),
        canManageSettings: mergedTabs.includes('settings'),
      };
    }
  }

  return baseConfig;
}
