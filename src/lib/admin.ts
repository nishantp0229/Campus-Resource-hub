// ---------------------------------------------------------------------------
// Admin configuration
// ---------------------------------------------------------------------------
// - Any email listed in ADMIN_EMAILS gets admin access.
// - They must ALSO enter ADMIN_PASSWORD to unlock the /admin panel.
// ---------------------------------------------------------------------------

export const ADMIN_EMAILS: string[] = [
  'LEVIackermann@gmail.com',
  'uzumaki123@gmail.com',
  'naruto123@gmail.com',
];

// Change this to whatever password you want.
export const ADMIN_PASSWORD = 'amritaamma@1234';

// Session key — once unlocked, admin stays unlocked until they close the tab
export const ADMIN_SESSION_KEY = 'campus_admin_unlocked';

// ---------------------------------------------------------------------------
// Helpers — work with different possible auth field names
// ---------------------------------------------------------------------------

export function getUserEmail(user: any): string | null {
  if (!user) return null;
  return (
    user.email ||
    user.userEmail ||
    user.emailAddress ||
    user.user_email ||
    user.username ||
    null
  );
}

export function getUserName(user: any): string | null {
  if (!user) return null;
  return (
    user.name ||
    user.userName ||
    user.username ||
    user.displayName ||
    null
  );
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.map((e) => e.toLowerCase().trim()).includes(normalized);
}

export function isAdmin(user: any): boolean {
  return isAdminEmail(getUserEmail(user));
}

// ---------------------------------------------------------------------------
// Admin session unlock (per-browser-tab)
// ---------------------------------------------------------------------------

export function isAdminUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

export function unlockAdmin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export function lockAdmin(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}