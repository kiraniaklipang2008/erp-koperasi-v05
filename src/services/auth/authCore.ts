
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
  
  // Check for lockout
  if (isLockedOut(email)) {
    throw new Error("Account temporarily locked due to too many failed attempts. Please try again later.");
  }

  try {
    // Demo credentials handling
    if (email === "adminkpri@email.com" && password === "password123") {
      // Get or create profile for super admin
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (!profile) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: `uuid-${Date.now()}`,
            email: email,
            username: 'adminkpri',
            nama: 'Admin KPRI',
            role_id: 'role_superadmin',
            aktif: true
          })
          .select('*')
          .single();

        if (createError) throw createError;
        profile = newProfile;
      }

      // Get role information
      const { data: role } = await supabase
        .from('roles')
        .select('*')
        .eq('id', 'role_superadmin')
        .single();

      const extendedUser: ExtendedUser = {
        id: profile.id,
        username: profile.username || email,
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
          permissions: role.permissions || ['*']
        } : {
          id: 'role_superadmin',
          name: 'Super Admin',
          permissions: ['*']
        }
      };

      // Store session locally for compatibility
      const token = generateSecureToken();
      const refreshToken = generateSecureToken();
      storeSession(profile.id, token, refreshToken);

      clearFailedAttempts(email);
      
      // Log audit entry for successful login
      const { logAuditEntry } = await import("../auditService");
      logAuditEntry(
        "LOGIN",
        "SYSTEM",
        `Login berhasil untuk user: ${email}`,
        profile.id
      );

      return extendedUser;
    }

    // Try other demo credentials
    if ((email === "admin@email.com" && password === "password123") || 
        (email === "demo@email.com" && password === "demo")) {
      
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (!profile) {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: `uuid-${Date.now()}-${email.split('@')[0]}`,
            email: email,
            username: email.split('@')[0],
            nama: email === "admin@email.com" ? 'Admin' : 'Demo User',
            role_id: email === "admin@email.com" ? 'role_admin' : 'role_anggota',
            aktif: true
          })
          .select('*')
          .single();
        
        profile = newProfile;
      }

      if (profile) {
        // Get role information
        const { data: role } = await supabase
          .from('roles')
          .select('*')
          .eq('id', profile.role_id)
          .single();

        const extendedUser: ExtendedUser = {
          id: profile.id,
          username: profile.username || email,
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

        const token = generateSecureToken();
        const refreshToken = generateSecureToken();
        storeSession(profile.id, token, refreshToken);

        clearFailedAttempts(email);
        return extendedUser;
      }
    }

    recordFailedAttempt(email);
    throw new Error("Invalid email or password");
  } catch (error) {
    console.error("Login error:", error);
    recordFailedAttempt(email);
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
