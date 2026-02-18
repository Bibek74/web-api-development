export type SessionUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
};

const USER_UPDATED_EVENT = "user-profile-updated";

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (!match) return null;
  return match.split("=")[1];
};

export const getSessionUser = (): SessionUser | null => {
  try {
    const encoded = getCookieValue("user");
    if (!encoded) return null;

    const parsed = JSON.parse(decodeURIComponent(encoded)) as SessionUser;
    return parsed;
  } catch {
    return null;
  }
};

export const setSessionUser = (user: SessionUser) => {
  if (typeof document === "undefined") return;
  document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; sameSite=lax`;
  window.dispatchEvent(new Event(USER_UPDATED_EVENT));
};

export const clearSessionCookies = () => {
  if (typeof document === "undefined") return;
  document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  window.dispatchEvent(new Event(USER_UPDATED_EVENT));
};

export const onSessionUserUpdate = (handler: () => void) => {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(USER_UPDATED_EVENT, handler);
  return () => {
    window.removeEventListener(USER_UPDATED_EVENT, handler);
  };
};

export const buildProfileImageUrl = (profileImage?: string) => {
  if (!profileImage) return "";
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  return `${base}${profileImage}`;
};
