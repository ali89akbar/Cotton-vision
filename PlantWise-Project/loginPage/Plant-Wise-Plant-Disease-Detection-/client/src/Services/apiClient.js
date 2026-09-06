import axios from 'axios';
import { clearSession, getStoredToken, captureTokenFromRedirect } from './authStorage';

/**
 * Single place that knows where the PlantWise API lives.
 * Override with REACT_APP_API_URL in client/.env when the API moves.
 */
export const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:6005').replace(/\/+$/, '');

// Many existing components still call the hard-coded dev URL; treat both as ours.
const BACKEND_HOSTS = [API_BASE_URL, 'http://localhost:6005', 'https://localhost:6005'];

/**
 * Endpoints that answer 401 as a *normal* answer for anonymous visitors or that
 * would otherwise redirect-loop. A 401 there never bounces the user to /login.
 */
const SILENT_AUTH_PATHS = [
  '/login/sucess',
  '/api/auth/session',
  '/api/auth/me',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
];

const AUTH_ERROR_CODES = [
  'missing_token',
  'invalid_token',
  'unauthenticated',
  'account_not_found',
  'token_expired',
];

export const resolveUrl = (config = {}) => {
  const url = config.url || '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${config.baseURL || API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const isBackendRequest = (url) => BACKEND_HOSTS.some((host) => url.startsWith(`${host}/`) || url === host);

const getPathname = (url) => {
  try {
    return new URL(url).pathname;
  } catch (e) {
    return url;
  }
};

const isSilentAuthRequest = (url) => SILENT_AUTH_PATHS.includes(getPathname(url));

const getExistingHeader = (headers) => {
  if (!headers) return null;
  if (typeof headers.get === 'function') return headers.get('Authorization');
  return headers.Authorization || headers.authorization || null;
};

/**
 * Adds `Authorization: Bearer <token>` to PlantWise API calls only.
 * Third-party hosts (OpenWeatherMap, Open-Meteo, ...) are left completely
 * untouched - they answer with `Access-Control-Allow-Origin: *`, which the
 * browser rejects for credentialed/authorized requests.
 */
const attachAuthHeader = (config) => {
  const url = resolveUrl(config);
  if (!isBackendRequest(url)) {
    // SocialMedia.js still sets `axios.defaults.withCredentials = true`;
    // strip that for foreign hosts so wildcard-CORS APIs keep answering.
    if (config.withCredentials) config.withCredentials = false;
    return config;
  }

  const token = getStoredToken();
  if (token && !getExistingHeader(config.headers)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const redirectToLogin = (reason) => {
  const { pathname } = window.location;
  if (pathname.startsWith('/login')) return; // already there - no loop
  window.location.replace(`/login?reason=${encodeURIComponent(reason)}`);
};

/**
 * 401 (invalid/absent credentials) and 403 `token_expired` mean "you are not
 * signed in". Only people who actually held a token get their session dropped
 * and are bounced to /login - an anonymous visitor asking for a protected
 * profile is a normal 401 and must never be redirected (that is how the
 * sign-up form on /register is reached in the first place).
 * A 401 from a third-party API, or a plain bad-password answer from /login, is
 * deliberately left alone - the component owns those messages.
 */
const handleAuthFailure = (error) => {
  const response = error?.response;
  if (!response) return; // network error - keep the session

  const url = resolveUrl(error.config || {});
  if (!isBackendRequest(url)) return;

  // Read the token once, before anything is cleared.
  const heldToken = Boolean(getStoredToken());
  if (!heldToken) return; // nobody was signed in - nothing to clean up

  const { status, data } = response;
  const code = data?.code;
  const isAuthCode = AUTH_ERROR_CODES.includes(code);

  const isExpired = status === 403 && code === 'token_expired';
  // A 401 without a recognized code only matters because we sent a token.
  const isRejectedToken = status === 401 && !isAuthCode;

  if (!isExpired && !isAuthCode && !isRejectedToken) return;

  clearSession();
  if (!isSilentAuthRequest(url)) {
    redirectToLogin(isExpired ? 'expired' : 'unauthorized');
  }
};

const installInterceptors = (instance) => {
  instance.interceptors.request.use(attachAuthHeader, (error) => Promise.reject(error));
  instance.interceptors.response.use((response) => response, (error) => {
    handleAuthFailure(error);
    return Promise.reject(error);
  });
  return instance;
};

/** Pre-configured instance for new code: `api.post('/api/users/complete-profile', ...)`. */
export const api = installInterceptors(
  axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // keeps the legacy Google OAuth session working too
  })
);

// The rest of the app still uses the bare `axios` object with absolute URLs, so
// the same behaviour is installed there.
installInterceptors(axios);

// Passport's Google callback hands its token over in the URL fragment.
captureTokenFromRedirect();

export default api;
