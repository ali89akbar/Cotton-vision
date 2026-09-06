/**
 * JWT + user persistence for the PlantWise SPA.
 *
 * The token lives in localStorage so it survives reloads on a farmer's shared
 * tablet and can be attached to every API call by the axios interceptor.
 * localStorage is readable by any script on the origin, so the token payload is
 * deliberately minimal (userId + role) and every mutating endpoint is still
 * authorized server-side against the token's own `userId` claim.
 */

const TOKEN_KEY = 'plantwise_jwt';
const USER_KEY = 'plantwise_user';

// Fired inside the current tab (the native `storage` event only fires in other
// tabs), so <Headers /> can react to a login/logout immediately.
export const AUTH_CHANGE_EVENT = 'plantwise-auth-change';

const emitChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

const safeParse = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const getStoredUser = () => safeParse(localStorage.getItem(USER_KEY));

/** Decodes `{ exp, userId, role }` from a JWT without verifying it (client hint only). */
export const readTokenClaims = (token) => {
  if (!token || typeof token !== 'string') return null;
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      window.atob(normalized)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

/** True while the token exists and is past its own expiry check. */
export const hasActiveSession = () => {
  const token = getStoredToken();
  if (!token) return false;

  const claims = readTokenClaims(token);
  if (!claims || !claims.exp) return true; // un-decodable but present: let the server judge
  return claims.exp * 1000 > Date.now() + 1000; // 1s clock-skew buffer
};

export const setSession = ({ token, user } = {}) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitChange();
  return user || null;
};

/**
 * Refreshes the cached user WITHOUT announcing it. Read-only probes must use
 * this: emitting an auth-change event makes the listeners (e.g. <Headers/>)
 * re-run the very probe that just fired it, which spins into an endless loop of
 * /api/auth/session requests.
 */
export const cacheUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/** For real profile changes (sign-up, profile save) that listeners should react to. */
export const updateUser = (user) => {
  cacheUser(user);
  emitChange();
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  emitChange();
};

/**
 * Passport's Google callback redirects to `<client>/dashboard#pw_token=<jwt>`.
 * Fragments are never sent to servers or referrers, so we lift the token out of
 * the URL, store it, and scrub the fragment before anything can read it back.
 * @returns {boolean} whether a token was captured
 */
export const captureTokenFromRedirect = () => {
  const { hash, pathname, search } = window.location;
  const match = /[?&#]pw_token=([^&]+)/.exec(hash || '');
  if (!match) return false;

  try {
    localStorage.setItem(TOKEN_KEY, decodeURIComponent(match[1]));
  } catch (e) {
    return false;
  }

  const cleanedHash = hash.replace(/[#&]?pw_token=[^&]+/, '').replace(/[&#]$/, '');
  window.history.replaceState(
    {},
    document.title,
    `${pathname}${search}${cleanedHash}`
  );
  emitChange();
  return true;
};

/** Legacy helper kept so the profile cache and the JWT live and die together. */
export const setCachedProfile = (profile) => {
  if (profile) localStorage.setItem('plantwise_user_profile', JSON.stringify(profile));
  window.dispatchEvent(new Event('storage'));
};

export const getCachedProfile = () => safeParse(localStorage.getItem('plantwise_user_profile'));
