/**
 * End-to-end smoke test for the JWT auth flow.
 *
 * Usage:
 *   1) start the API:            node app.js
 *   2) in another terminal:      node test-auth-flow.js [baseUrl]
 *
 * Requires JWT_SECRET to be identical in both terminals, otherwise every
 * bearer token will be rejected as invalid. dotenv is loaded here too so the
 * secret is picked up straight from server/.env.
 */

require("dotenv").config();
const jwt = require("jsonwebtoken");

const BASE = process.argv[2] || "http://localhost:6005";
const SECRET = process.env.JWT_SECRET || "dev-only-insecure-plantwise-jwt-secret";

let passed = 0;
let failed = 0;

const check = (label, condition, detail) => {
  if (condition) {
    passed += 1;
    console.log(`  ✅ ${label}`);
  } else {
    failed += 1;
    console.log(`  ❌ ${label}${detail ? ` -> ${JSON.stringify(detail)}` : ""}`);
  }
};

const call = async (method, path, { body, token } = {}) => {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  return { status: res.status, data };
};

const run = async () => {
  const email = `authsmoke.${Date.now()}@plantwise.test`;
  const phone = `03${String(Date.now()).slice(-9)}`; // 03xxxxxxxxx -> normalized to 923xxxxxxxxx
  const password = "cotton#123";

  console.log(`\nTesting ${BASE}\n`);

  console.log("1) Register");
  const weak = await call("POST", "/api/auth/register", {
    body: { fullName: "Smoke Test", email, password: "123" },
  });
  check("rejects a short password with 400", weak.status === 400, weak.data);

  const created = await call("POST", "/api/auth/register", {
    body: { fullName: "Smoke Test", email, password },
  });
  check("creates the account", created.status === 201 && !!created.data.token, created.data?.message);
  check("no password hash leaks in the response", created.data.user && created.data.user.password === undefined);
  check("registration returns a JWT immediately (single-step sign-up)", created.data.tokenType === "Bearer" && !!created.data.expiresIn);

  const again = await call("POST", "/api/auth/register", {
    body: { fullName: "Smoke Test", email, password },
  });
  check("duplicate email is rejected with 409", again.status === 409, again.data);

  console.log("\n2) Protected profile endpoints");
  const anonymous = await call("POST", "/api/users/complete-profile", {
    body: { fullName: "Smoke Test", whatsappNumber: phone, city: "Khairpur", landSize: "12 Acres" },
  });
  check("no token -> 401", anonymous.status === 401 && ["missing_token", "unauthenticated"].includes(anonymous.data.code), anonymous.data);

  const forged = jwt.sign({ userId: "000000000000000000000000" }, "wrong-secret", { expiresIn: "1h" });
  const badToken = await call("GET", "/api/user/profile", { token: forged });
  check("forged token -> 401 invalid_token", badToken.status === 401 && badToken.data.code === "invalid_token", badToken.data);

  const expired = jwt.sign({ userId: created.data.user._id }, SECRET, { expiresIn: "-10s" });
  const staleToken = await call("GET", "/api/user/profile", { token: expired });
  check("expired token -> 403 token_expired", staleToken.status === 403 && staleToken.data.code === "token_expired", staleToken.data);

  const nonBearer = await fetch(`${BASE}/api/user/profile`, {
    headers: { Authorization: created.data.token },
  });
  check("token without 'Bearer ' prefix -> 401", nonBearer.status === 401);

  const fetched = await call("GET", "/api/user/profile", { token: created.data.token });
  check("GET /api/user/profile with token -> 200", fetched.status === 200 && !!fetched.data.user, fetched.data);

  const saved = await call("POST", "/api/users/complete-profile", {
    token: created.data.token,
    body: {
      fullName: "Smoke Test Farmer",
      whatsappNumber: phone,
      city: "Sukkur",
      landSize: "12 Acres",
      crops: ["Cotton", "Wheat"],
      isWhatsappVerified: true,
    },
  });
  check("complete-profile with token -> 200", saved.status === 200 && saved.data.user.isProfileComplete === true, saved.data);
  check("phone normalized to 92...", saved.data?.user?.whatsappNumber === `92${phone.slice(1)}`, saved.data?.user?.whatsappNumber);
  check("crops persisted", JSON.stringify(saved.data?.user?.crops) === JSON.stringify(["Cotton", "Wheat"]));

  const legacy = await call("PUT", "/api/user/profile", {
    token: created.data.token,
    body: { fullName: "Smoke Test Farmer", whatsappNumber: phone, city: "Khairpur", landSize: "9 Acres", crops: ["Cotton"] },
  });
  check("legacy PUT /api/user/profile still works", legacy.status === 200 && legacy.data.user.landSize === "9 Acres", legacy.data);

  const invalid = await call("POST", "/api/users/complete-profile", {
    token: created.data.token,
    body: { fullName: "X", whatsappNumber: "123", city: "", landSize: "" },
  });
  check("invalid profile fields -> 400", invalid.status === 400 && !!invalid.data.field, invalid.data);

  console.log("\n3) Session + login");
  const session = await call("GET", "/api/auth/session", { token: created.data.token });
  check("/api/auth/session reports the bearer identity", session.data?.isAuthenticated === true, session.data);

  const anonSession = await call("GET", "/api/auth/session");
  check("/api/auth/session never errors when anonymous", anonSession.status === 200 && anonSession.data.isAuthenticated === false);

  const legacyAuth = await call("GET", "/login/sucess", { token: created.data.token });
  check("/login/sucess accepts a bearer token", legacyAuth.status === 200 && legacyAuth.data.user?.email === email, legacyAuth.data);

  const wrongPass = await call("POST", "/api/auth/login", { body: { identifier: email, password: "nope-nope" } });
  check("wrong password -> 401", wrongPass.status === 401, wrongPass.data);

  const unknownUser = await call("POST", "/api/auth/login", { body: { identifier: "ghost@plantwise.test", password } });
  check("unknown account -> same 401 (no enumeration)", unknownUser.status === 401 && unknownUser.data.message === wrongPass.data.message);

  const byEmail = await call("POST", "/api/auth/login", { body: { identifier: email.toUpperCase(), password } });
  check("login by email (case-insensitive) -> 200 + token", byEmail.status === 200 && !!byEmail.data.token, byEmail.data);

  const byPhone = await call("POST", "/api/auth/login", { body: { identifier: `+${phone}`, password } });
  check("login by WhatsApp number -> 200", byPhone.status === 200 && !!byPhone.data.token, byPhone.data);

  const me = await call("GET", "/api/auth/me", { token: byPhone.data.token });
  check("newly minted token resolves /api/auth/me", me.status === 200 && me.data.user.email === email, me.data);

  const logout = await call("POST", "/api/auth/logout", { token: byPhone.data.token });
  check("logout returns 200", logout.status === 200 && logout.data.success === true);

  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
};

run().catch((error) => {
  console.error("Smoke test crashed:", error.message);
  console.error("Is the API running and sharing the same JWT_SECRET?");
  process.exit(1);
});
