/**
 * One-time script to generate a Gmail OAuth2 refresh token.
 *
 * Run with:
 *   node scripts/get-gmail-token.mjs
 */

import * as http from "http";
import * as https from "https";
import * as querystring from "querystring";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Load .env.local manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
const envFile = fs.readFileSync(envPath, "utf8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "❌  Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET in .env.local\n" +
    "    Set them first, then re-run this script."
  );
  process.exit(1);
}

const REDIRECT_URI = "http://localhost:4242";

const params = new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope: "https://www.googleapis.com/auth/gmail.compose",
  access_type: "offline",
  prompt: "consent",
});

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

console.log("\n✨  Falling Star Parties — Gmail OAuth2 Setup\n");
console.log("Open this URL in your browser (log in as info@fallingstarparties.com):\n");
console.log("   " + authUrl + "\n");
console.log("Waiting for Google to redirect back...\n");

// Exchange auth code for tokens using raw https (Node 17 compatible)
function exchangeCode(code) {
  return new Promise((resolve, reject) => {
    const body = querystring.stringify({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const req = https.request(
      {
        hostname: "oauth2.googleapis.com",
        path: "/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("Failed to parse response: " + data));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Spin up a temporary server to catch the redirect
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");

  if (!code) {
    res.end("No code found. Please try again.");
    return;
  }

  res.end("<html><body><h2>✅ Authorized! You can close this tab and check your terminal.</h2></body></html>");
  server.close();

  try {
    const tokens = await exchangeCode(code);

    if (tokens.error) {
      console.error("❌  Google returned an error:", tokens.error, tokens.error_description);
      process.exit(1);
    }

    console.log("✅  Success! Add this to your .env.local and Amplify environment config:\n");
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);

    if (!tokens.refresh_token) {
      console.warn(
        "⚠️  No refresh_token returned. This usually means the account was already authorized.\n" +
        "   Go to https://myaccount.google.com/permissions, revoke access for this app, then re-run."
      );
    }
  } catch (err) {
    console.error("❌  Failed to exchange code for token:", err);
  }

  process.exit(0);
});

server.listen(4242);
