import { api, API_BASE_URL } from './apiClient';
import { setSession, clearSession, cacheUser, updateUser, setCachedProfile } from './authStorage';

/**
 * All auth/profile traffic goes through here so components never hand-roll
 * URLs or header plumbing - `apiClient` attaches `Authorization: Bearer <token>`
 * automatically.
 */

/** Turns an axios failure into something safe to show a farmer. */
export const getAuthError = (error) => {
  const data = error?.response?.data;
  return {
    status: error?.response?.status ?? 0,
    code: data?.code || error?.code || 'network_error',
    field: data?.field || null,
    message:
      data?.message ||
      (error?.code === 'ERR_NETWORK'
        ? `Cannot reach the PlantWise API at ${API_BASE_URL}. Is the server running?`
        : 'Something went wrong. Please try again.'),
  };
};

/** Google OAuth entry point (Passport session flow, then hands back a JWT). */
export const googleLoginUrl = `${API_BASE_URL}/auth/google`;

export const registerUser = async (payload) => {
  const { data } = await api.post('/api/auth/register', payload);
  setSession({ token: data.token, user: data.user });
  if (data.user) setCachedProfile(data.user);
  return data;
};

export const loginUser = async ({ identifier, password }) => {
  const { data } = await api.post('/api/auth/login', { identifier, password });
  setSession({ token: data.token, user: data.user });
  if (data.user) setCachedProfile(data.user);
  return data;
};

/**
 * Passive "who am I?" probe - always resolves, never redirects.
 * Returns `{ isAuthenticated: false, user: null }` for anonymous visitors.
 */
export const fetchSession = async () => {
  try {
    const { data } = await api.get('/api/auth/session');
    // Silent cache refresh - see cacheUser(): an updateUser() here made
    // <Headers/> re-probe this endpoint forever.
    if (data.user) {
      cacheUser(data.user);
      // Keep the legacy profile banner cache in sync too, so <Headers /> and
      // <ImageDrop /> never show a stale "complete your profile" prompt after
      // a logout / re-login.
      setCachedProfile(data.user);
    }
    return { isAuthenticated: Boolean(data.isAuthenticated), user: data.user || null };
  } catch (error) {
    return { isAuthenticated: false, user: null, error: getAuthError(error) };
  }
};

/** The stored farmer profile, used to pre-fill the onboarding form. */
export const fetchProfile = async () => {
  const { data } = await api.get('/api/user/profile');
  if (data.user) updateUser(data.user);
  return data.user;
};

/**
 * POST /api/users/complete-profile - requires a bearer token (or the legacy
 * Google session); the axios interceptor supplies the header from storage.
 */
export const completeFarmerProfile = async (payload) => {
  const { data } = await api.post('/api/users/complete-profile', payload);
  if (data.user) {
    setCachedProfile(data.user);
    updateUser(data.user);
  }
  return data;
};

export const sendWhatsappWelcomeAlert = async (phoneNumber, alertType = 'welcome') => {
  const { data } = await api.post('/api/whatsapp/send-alert', { phoneNumber, alertType });
  return data;
};

/** Local-first logout: the server call is best-effort, the token always dies. */
export const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    // A dead API must never trap someone inside a signed-in UI.
    console.warn('Logout request skipped:', getAuthError(error).message);
  }
  clearSession();
  localStorage.removeItem('plantwise_user_profile');
  localStorage.removeItem('plantwise_selected_city');
  window.dispatchEvent(new Event('storage'));
};
