/**
 * Google Sign-In doctor.
 *
 * passport only ever says "InternalOAuthError: Failed to obtain access token",
 * which hides whether the real problem is the network, the client credentials or
 * an unlisted redirect URI. This script tests each layer separately, using the
 * same Node HTTPS stack the server uses (a browser succeeding proves nothing).
 *
 *   cd server
 *   node google-auth-doctor.js
 *
 * Nothing is written to the database and no secret is printed in full.
 */
require("dotenv").config();
const https = require("https");
const tls = require("tls");
const dns = require("dns");

const CLIENT_ID = process.env.CLIENT_ID || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";
const PORT = process.env.PORT || 6005;
const CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/auth/google/callback`;

const MODERN_TOKEN = "https://oauth2.googleapis.com/token";
const LEGACY_TOKEN = "https://www.googleapis.com/oauth2/v4/token"; // passport-google-oauth2 default
const USERINFO_CANDIDATES = [
  { label: "openidconnect (used by app.js)", host: "openidconnect.googleapis.com", path: "/v1/userinfo" },
  { label: "legacy www.googleapis.com", host: "www.googleapis.com", path: "/oauth2/v3/userinfo" },
];

const ok = (label, detail) => console.log(`  \x1b[32mPASS\x1b[0m  ${label}${detail ? ` - ${detail}` : ""}`);
const bad = (label, detail) => console.log(`  \x1b[31mFAIL\x1b[0m  ${label}${detail ? ` - ${detail}` : ""}`);
const info = (label) => console.log(`        ${label}`);

/** POST an authorization_code exchange and return { status, json, transportError }. */
const exchangeToken = (url) =>
  new Promise((resolve) => {
    const body = new URLSearchParams({
      code: "0000000000-doctor-probe", // deliberately invalid
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: CALLBACK_URL,
      grant_type: "authorization_code",
    }).toString();

    const req = https.request(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) },
        timeout: 15000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed = null;
          try { parsed = JSON.parse(data); } catch (e) { /* non-JSON body */ }
          resolve({ status: res.statusCode, json: parsed, raw: data.slice(0, 200) });
        });
      }
    );

    req.on("timeout", () => req.destroy(new Error("ETIMEDOUT after 15s")));
    req.on("error", (err) => resolve({ transportError: err }));
    req.end(body);
  });

const lookupHost = (host) =>
  new Promise((resolve) => dns.lookup(host, { all: true }, (err, addresses) => resolve(err ? { err } : { addresses })));

const tlsHandshake = (host) =>
  new Promise((resolve) => {
    const socket = tls.connect({ host, port: 443, servername: host, timeout: 12000 }, () => {
      const cert = socket.getPeerCertificate(true);
      const issuer = cert && cert.issuer ? Object.entries(cert.issuer).map(([k, v]) => `${k}=${v}`).join(", ") : "unknown";
      socket.end();
      resolve({ authorized: socket.authorized, issuer, subject: cert && cert.subject && cert.subject.CN });
    });
    socket.on("timeout", () => { socket.destroy(new Error("TLS handshake timed out")); });
    socket.on("error", (err) => resolve({ err }));
  });

/** Translate Google's answer into something actionable. */
const interpret = (label, result) => {
  if (result.transportError) {
    const e = result.transportError;
    bad(label, `${e.code || e.name}: ${e.message}`);
    info("  -> Node cannot complete TLS to Google. Antivirus / VPN / firewall TLS filtering");
    info("     or an ISP reset is the usual cause. The browser path still works because");
    info("     the browser is allowed through while the Node server process is not.");
    return;
  }

  const errCode = result.json && result.json.error;
  if (errCode === "invalid_client") {
    bad(label, `HTTP ${result.status} invalid_client - Google does not recognise this client`);
    info(`  -> client_id starts ${CLIENT_ID.slice(0, 12)}… (${CLIENT_ID.length} chars).`);
    info("     Check CLIENT_ID / CLIENT_SECRET in server/.env belong to the SAME OAuth");
    info("     desktop/web client, and that the client is not deleted or restricted.");
    return;
  }
  if (errCode === "invalid_grant") {
    ok(label, `HTTP ${result.status} ${errCode} (expected: the probe code is fake)`);
    info("  -> Google ACCEPTED client_id + client_secret, so the credentials are good.");
    info("     If the browser flow still fails, the remaining suspect is the redirect URI:");
    info(`     "${CALLBACK_URL}" must be listed verbatim under Authorized redirect URIs.`);
    return;
  }
  if (result.status && result.status < 500) {
    ok(label, `HTTP ${result.status} ${errCode || result.raw}`);
    return;
  }
  bad(label, `unexpected answer: ${JSON.stringify(result.json || result.raw || result)}`);
};

(async () => {
  console.log(`\nGoogle Sign-In doctor   node ${process.version}   ${new Date().toISOString()}`);
  console.log(`client_id: ${CLIENT_ID ? `${CLIENT_ID.slice(0, 24)}… (${CLIENT_ID.length} chars)` : "MISSING"}`);
  console.log(`client_secret: ${CLIENT_SECRET ? `set (${CLIENT_SECRET.length} chars)` : "MISSING"}`);
  console.log(`redirect uri: ${CALLBACK_URL}\n`);

  console.log("1. DNS + TLS (what the server process can actually reach)");
  for (const host of ["oauth2.googleapis.com", "openidconnect.googleapis.com", "www.googleapis.com"]) {
    const looked = await lookupHost(host);
    if (looked.err) bad(`dns.lookup ${host}`, looked.err.code || looked.err.message);
    else ok(`dns.lookup ${host}`, looked.addresses.map((a) => a.address).join(", "));

    const hand = await tlsHandshake(host);
    if (hand.err) bad(`TLS ${host}`, `${hand.err.code || hand.err.name}: ${hand.err.message}`);
    else if (!hand.authorized) bad(`TLS ${host}`, `certificate not trusted: ${hand.reason || "unknown reason"}`);
    else ok(`TLS ${host}`, `verified, issuer: ${hand.issuer}`);
  }
  console.log("     (an issuer whose organization is your antivirus means TLS interception:");
  console.log("      export its root CA and set NODE_EXTRA_CA_CERTS to its .pem path.)");

  console.log("\n2. Code-for-token exchange (the step that threw InternalOAuthError)");
  if (!CLIENT_ID || !CLIENT_SECRET) {
    bad("token endpoint", "CLIENT_ID / CLIENT_SECRET are missing, so no probe was sent");
  } else {
    interpret(`modern  ${MODERN_TOKEN}`, await exchangeToken(MODERN_TOKEN));
    interpret(`legacy  ${LEGACY_TOKEN}`, await exchangeToken(LEGACY_TOKEN));
    info(`\n     app.js now uses: ${process.env.GOOGLE_TOKEN_URL || MODERN_TOKEN}`);
    info("     If only the legacy line fails, the endpoint pin in app.js was the fix.");
  }

  console.log("\n3. Profile fetch endpoint used right after the token");
  for (const target of USERINFO_CANDIDATES) {
    const userinfo = await new Promise((resolve) => {
      const req = https.request(
        { host: target.host, path: target.path, method: "GET", timeout: 12000 },
        (res) => {
          res.resume();
          res.on("end", () => resolve({ status: res.statusCode }));
        }
      );
      req.on("timeout", () => req.destroy(new Error("ETIMEDOUT")));
      req.on("error", (err) => resolve({ transportError: err }));
      req.end();
    });
    // A 401/403 is the correct answer when no access token is attached: the
    // important part is that TLS completed.
    if (userinfo.transportError) bad(`${target.label}`, `${target.host} - ${userinfo.transportError.code || userinfo.transportError.message}`);
    else ok(`${target.label}`, `${target.host} reachable (HTTP ${userinfo.status} without a token is correct)`);
  }
  console.log("     (app.js overrides the profile URL precisely because the package hardcodes");
  console.log("      www.googleapis.com; set GOOGLE_USERINFO_URL to the host that passed above.)");

  console.log("\nDone. Re-run after every change to server/.env.\n");
})();
