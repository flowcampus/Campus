import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { USER_ROLES } from '../utils/constants';

interface Permission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
}

interface Permissions {
  students: Permission;
  teachers: Permission;
  classes: Permission;
  attendance: Permission;
  grades: Permission;
  fees: Permission;
  announcements: Permission;
  events: Permission;
  messages: Permission;
  reports: Permission;
  settings: Permission;
  schools: Permission;
  users: Permission;
}

const usePermissions = (): Permissions => {
  const { user, profile } = useAppSelector((state) => state.auth);
  const userRole = profile?.role || user?.role || 'guest';

  const permissions = useMemo((): Permissions => {
    const defaultPermission: Permission = {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManage: false,
    };

    const fullPermission: Permission = {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canManage: true,
    };

    const readOnlyPermission: Permission = {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManage: false,
    };

    const limitedPermission: Permission = {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canManage: false,
    };

    switch (userRole) {
      case USER_ROLES.SUPER_ADMIN:
        return {
          students: fullPermission,
          teachers: fullPermission,
          classes: fullPermission,
          attendance: fullPermission,
          grades: fullPermission,
          fees: fullPermission,
          announcements: fullPermission,
          events: fullPermission,
          messages: fullPermission,
          reports: fullPermission,
          settings: fullPermission,
          schools: fullPermission,
          users: fullPermission,
        };

      case USER_ROLES.SCHOOL_ADMIN:
      case USER_ROLES.PRINCIPAL:
        return {
          students: fullPermission,
          teachers: fullPermission,
          classes: fullPermission,
          attendance: fullPermission,
          grades: fullPermission,
          fees: fullPermission,
          announcements: fullPermission,
          events: fullPermission,
          messages: fullPermission,
          reports: fullPermission,
          settings: limitedPermission,
          schools: { ...readOnlyPermission, canEdit: true },
          users: limitedPermission,
        };

      case USER_ROLES.TEACHER:
        return {
          students: { ...readOnlyPermission, canEdit: true },
          teachers: readOnlyPermission,
          classes: readOnlyPermission,
          attendance: limitedPermission,
          grades: limitedPermission,
          fees: readOnlyPermission,
          announcements: readOnlyPermission,
          events: readOnlyPermission,
          messages: limitedPermission,
          reports: readOnlyPermission,
          settings: { ...defaultPermission, canView: true, canEdit: true },
          schools: defaultPermission,
          users: defaultPermission,
        };

      case USER_ROLES.STUDENT:
        return {
          students: { ...defaultPermission, canView: true, canEdit: true }, // Own profile only
          teachers: readOnlyPermission,
          classes: readOnlyPermission,
          attendance: readOnlyPermission,
          grades: readOnlyPermission,
          fees: readOnlyPermission,
          announcements: readOnlyPermission,
          events: readOnlyPermission,
          messages: limitedPermission,
          reports: readOnlyPermission,
          settings: { ...defaultPermission, canView: true, canEdit: true },
          schools: defaultPermission,
          users: defaultPermission,
        };

      case USER_ROLES.PARENT:
        return {
          students: readOnlyPermission, // Children only
          teachers: readOnlyPermission,
          classes: readOnlyPermission,
          attendance: readOnlyPermission, // Children only
          grades: readOnlyPermission, // Children only
          fees: readOnlyPermission, // Children only
          announcements: readOnlyPermission,
          events: readOnlyPermission,
          messages: limitedPermission,
          reports: readOnlyPermission, // Children only
          settings: { ...defaultPermission, canView: true, canEdit: true },
          schools: defaultPermission,
          users: defaultPermission,
        };

      case USER_ROLES.GUEST:
        return {
          students: defaultPermission,
          teachers: defaultPermission,
          classes: defaultPermission,
          attendance: defaultPermission,
          grades: defaultPermission,
          fees: defaultPermission,
          announcements: readOnlyPermission,
          events: readOnlyPermission,
          messages: defaultPermission,
          reports: defaultPermission,
          settings: defaultPermission,
          schools: defaultPermission,
          users: defaultPermission,
        };

      default:
        return {
          students: defaultPermission,
          teachers: defaultPermission,
          classes: defaultPermission,
          attendance: defaultPermission,
          grades: defaultPermission,
          fees: defaultPermission,
          announcements: defaultPermission,
          events: defaultPermission,
          messages: defaultPermission,
          reports: defaultPermission,
          settings: defaultPermission,
          schools: defaultPermission,
          users: defaultPermission,
        };
    }
  }, [userRole]);

  return permissions;
};

export default usePermissions;