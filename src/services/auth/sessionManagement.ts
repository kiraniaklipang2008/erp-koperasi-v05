
import { ExtendedUser } from "@/types/auth";
import { getUserById } from "@/services/userManagementService";
import { getRoleById } from "@/services/user-management/roleService";
import { storeSession, getSession, clearSession, needsRefresh, extendSession } from "@/utils/secureStorage";

interface AuthState {
  currentUser: ExtendedUser | null;
  isAuthenticated: boolean;
}

/**
 * Get authentication state from secure session
 */
export const getAuthState = (): AuthState => {
  const session = getSession();
  
  if (!session) {
    return {
      currentUser: null,
      isAuthenticated: false
    };
  }

  // Extend session if needed
  if (needsRefresh()) {
    extendSession();
  }

  // Get user data
  const user = getUserById(session.userId);
  if (!user) {
    clearSession();
    return {
      currentUser: null,
      isAuthenticated: false
    };
  }

  // Get role information
  const role = user.roleId ? getRoleById(user.roleId) : undefined;
  
  const extendedUser: ExtendedUser = {
    ...user,
    role: role ? {
      id: role.id,
      name: role.name,
      permissions: role.permissions
    } : undefined
  };

  return {
    currentUser: extendedUser,
    isAuthenticated: true
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const authState = getAuthState();
  return authState.isAuthenticated;
};

/**
 * Get the current user
 */
export const getCurrentUser = (): ExtendedUser | null => {
  const authState = getAuthState();
  return authState.currentUser;
};

/**
 * Check if user has permission
 */
export const hasPermission = (permissionId: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (user.permissions?.includes(permissionId)) {
    return true;
  }
  
  if (user.role?.permissions?.includes(permissionId)) {
    return true;
  }
  
  return false;
};
