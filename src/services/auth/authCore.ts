
import { ExtendedUser } from "@/types/auth";
import { getUsers, getUserById } from "@/services/userManagementService";
import { getAnggotaById } from "@/services/anggotaService";
import { getRoleById } from "@/services/user-management/roleService";
import { storeSession, clearSession } from "@/utils/secureStorage";
import { generateSecureToken } from "@/utils/security";
import { isLockedOut, recordFailedAttempt, clearFailedAttempts } from "./rateLimiting";
import { getCurrentUser } from "./sessionManagement";

/**
 * Login function with security improvements
 */
export const loginUser = async (username: string, password: string): Promise<ExtendedUser> => {
  console.log("Attempting secure login for:", username);
  
  // Check for lockout
  if (isLockedOut(username)) {
    throw new Error("Account temporarily locked due to too many failed attempts. Please try again later.");
  }

  try {
    const users = getUsers();
    const user = users.find(user => user.username === username);
    
    if (!user) {
      recordFailedAttempt(username);
      throw new Error("Invalid username or password");
    }

    // In production, verify against hashed password
    // For demo purposes, we'll accept the original demo passwords temporarily
    const isValidPassword = password === "password123" || password === "demo";
    
    if (!isValidPassword) {
      recordFailedAttempt(username);
      throw new Error("Invalid username or password");
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(username);
    
    // Generate secure tokens
    const token = generateSecureToken();
    const refreshToken = generateSecureToken();
    
    // Store secure session
    storeSession(user.id, token, refreshToken);
    
    // Update last login time
    user.lastLogin = new Date().toISOString();
    
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
    
    // Log audit entry for successful login
    const { logAuditEntry } = await import("../auditService");
    logAuditEntry(
      "LOGIN",
      "SYSTEM",
      `Login berhasil untuk user: ${username}`,
      user.id
    );
    
    console.log("Secure login successful for:", username);
    return extendedUser;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Login function for anggota with security improvements
 */
export const loginWithAnggotaId = async (anggotaId: string, password: string): Promise<ExtendedUser> => {
  console.log("Attempting secure anggota login for ID:", anggotaId);
  
  // Check for lockout
  if (isLockedOut(anggotaId)) {
    throw new Error("Akun sementara dikunci karena terlalu banyak percobaan login. Silakan coba lagi nanti.");
  }

  try {
    const anggota = getAnggotaById(anggotaId);
    
    if (!anggota) {
      recordFailedAttempt(anggotaId);
      throw new Error("ID Anggota tidak ditemukan");
    }

    // For demo purposes, accept password123 or the anggota ID
    const isValidPassword = password === "password123" || password === anggota.id;
    
    if (!isValidPassword) {
      recordFailedAttempt(anggotaId);
      throw new Error("Password salah");
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(anggotaId);
    
    // Generate secure tokens
    const token = generateSecureToken();
    const refreshToken = generateSecureToken();
    
    // Create auth user ID
    const authUserId = `anggota-${anggota.id}`;
    
    // Store secure session
    storeSession(authUserId, token, refreshToken);
    
    const authUser: ExtendedUser = {
      id: authUserId,
      username: anggota.nama,
      nama: anggota.nama,
      email: anggota.email || "",
      roleId: "anggota",
      anggotaId: anggota.id,
      aktif: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: {
        id: "anggota",
        name: "Anggota",
        permissions: ["view_own_data"]
      }
    };
    
    // Log audit entry for successful anggota login
    const { logAuditEntry } = await import("../auditService");
    logAuditEntry(
      "LOGIN",
      "SYSTEM",
      `Login anggota berhasil untuk ID: ${anggotaId} (${anggota.nama})`,
      authUserId
    );
    
    console.log("Secure anggota login successful for:", anggotaId);
    return authUser;
  } catch (error) {
    console.error("Anggota login error:", error);
    throw error;
  }
};

/**
 * Logout function
 */
export const logoutUser = (): void => {
  const currentUser = getCurrentUser();
  
  console.log("Logging out user securely");
  clearSession();
  
  // Log audit entry for logout
  if (currentUser) {
    import("../auditService").then(({ logAuditEntry }) => {
      logAuditEntry(
        "LOGOUT",
        "SYSTEM",
        `Logout berhasil untuk user: ${currentUser.username}`,
        currentUser.id
      );
    });
  }
};
