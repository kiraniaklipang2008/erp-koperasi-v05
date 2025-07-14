
import { ExtendedUser } from "@/types/auth";
import { getUsers, getUserById } from "@/services/userManagementService";
import { getAnggotaById } from "@/services/anggotaService";
import { getRoleById } from "@/services/user-management/roleService";
import { storeSession, clearSession } from "@/utils/secureStorage";
import { generateSecureToken } from "@/utils/security";
import { isLockedOut, recordFailedAttempt, clearFailedAttempts } from "./rateLimiting";
import { getCurrentUser } from "./sessionManagement";
import { supabase } from "@/integrations/supabase/client";

/**
 * Login function with email authentication
 */
export const loginUser = async (email: string, password: string): Promise<ExtendedUser> => {
  console.log("Attempting login for:", email);
  
  // Check for lockout first and clear if needed for demo accounts
  if (isLockedOut(email)) {
    // Clear lockout for demo accounts
    if (email === "adminkpri@email.com" || email === "admin@email.com" || email === "demo@email.com") {
      clearFailedAttempts(email);
    } else {
      throw new Error("Account temporarily locked due to too many failed attempts. Please try again later.");
    }
  }

  try {
    // Demo credentials handling - create fake user objects without database dependency
    if (email === "adminkpri@email.com" && password === "password123") {
      const extendedUser: ExtendedUser = {
        id: "demo-superadmin-001",
        username: 'adminkpri',
        nama: 'Admin KPRI Super',
        email: email,
        roleId: 'role_superadmin',
        aktif: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: {
          id: 'role_superadmin',
          name: 'Super Admin',
          permissions: ['*']
        }
      };

      // Store session locally for compatibility
      const token = generateSecureToken();
      const refreshToken = generateSecureToken();
      storeSession(extendedUser.id, token, refreshToken);

      clearFailedAttempts(email);
      
      // Log audit entry for successful login
      try {
        const { logAuditEntry } = await import("../auditService");
        logAuditEntry(
          "LOGIN",
          "SYSTEM",
          `Demo login berhasil untuk Super Admin: ${email}`,
          extendedUser.id
        );
      } catch (auditError) {
        console.log("Audit logging failed, but continuing with login:", auditError);
      }

      console.log("Demo Super Admin login successful for:", email);
      return extendedUser;
    }

    if (email === "admin@email.com" && password === "password123") {
      const extendedUser: ExtendedUser = {
        id: "demo-admin-002",
        username: 'admin',
        nama: 'Admin',
        email: email,
        roleId: 'role_admin',
        aktif: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: {
          id: 'role_admin',
          name: 'Admin',
          permissions: ['users:read', 'users:create', 'users:update', 'anggota:create', 'transaksi:create']
        }
      };

      const token = generateSecureToken();
      const refreshToken = generateSecureToken();
      storeSession(extendedUser.id, token, refreshToken);

      clearFailedAttempts(email);
      console.log("Demo Admin login successful for:", email);
      return extendedUser;
    }

    if (email === "demo@email.com" && password === "demo") {
      const extendedUser: ExtendedUser = {
        id: "demo-user-003",
        username: 'demo',
        nama: 'Demo User',
        email: email,
        roleId: 'role_anggota',
        aktif: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: {
          id: 'role_anggota',
          name: 'Anggota',
          permissions: ['view_own_data']
        }
      };

      const token = generateSecureToken();
      const refreshToken = generateSecureToken();
      storeSession(extendedUser.id, token, refreshToken);

      clearFailedAttempts(email);
      console.log("Demo User login successful for:", email);
      return extendedUser;
    }

    // For real users, try Supabase authentication
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        recordFailedAttempt(email);
        throw new Error("Invalid email or password");
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        recordFailedAttempt(email);
        throw new Error("Profile not found");
      }

      // Get role information
      const { data: role } = await supabase
        .from('roles')
        .select('*')
        .eq('id', profile.role_id)
        .single();

      const extendedUser: ExtendedUser = {
        id: profile.id,
        username: profile.username || profile.email,
        nama: profile.nama,
        email: profile.email,
        roleId: profile.role_id,
        aktif: profile.aktif,
        lastLogin: new Date().toISOString(),
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        role: role ? {
          id: role.id,
          name: role.name,
          permissions: role.permissions || []
        } : undefined
      };

      clearFailedAttempts(email);
      return extendedUser;

    } catch (supabaseError) {
      console.log("Supabase auth failed:", supabaseError);
      recordFailedAttempt(email);
      throw new Error("Invalid email or password");
    }

  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error) {
      throw error;
    }
    recordFailedAttempt(email);
    throw new Error("Login failed");
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
