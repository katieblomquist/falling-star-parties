/**
 * One-time script to generate a Gmail OAuth2 refresh token.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json scripts/get-gmail-token.ts
 *
 * Prerequisites:
 *   1. Go to https://console.cloud.google.com
 *   2. Create a project (or use an existing one)
 *   3. Enable the Gmail API
 *   4. Create OAuth2 credentials (Desktop app type)
 *   5. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in your .env.local
 *   6. Run this script — it will open a URL in your terminal
 *   7. Visit the URL, authorize with info@fallingstarparties.com
 *   8. Copy the code from the redirect URL and paste it here
 *   9. Copy the printed refresh_token into GMAIL_REFRESH_TOKEN in .env.local
 *      and into your Amplify environment config.
 */

import { google } from "googleapis";
import * as readline from "readline";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "❌  Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET in .env.local\n" +
    "    Set them first, then re-run this script."
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "urn:ietf:wg:oauth:2.0:oob" // OOB redirect — shows code on screen
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose", // create drafts
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent", // force refresh token to be issued
});

console.log("\n✨  Falling Star Parties — Gmail OAuth2 Setup\n");
console.log("1. Open this URL in your browser (log in as info@fallingstarparties.com):\n");
console.log("   " + authUrl + "\n");
console.log("2. Authorize the app, then copy the code shown on the page.\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("3. Paste the authorization code here: ", async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log("\n✅  Success! Add this to your .env.local and Amplify environment config:\n");
    console.log(`   GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    if (!tokens.refresh_token) {
      console.warn(
        "⚠️  No refresh_token returned. This usually means the account was already authorized.\n" +
        "   Go to https://myaccount.google.com/permissions, revoke access for this app, then re-run."
      );
    }
  } catch (err) {
    console.error("❌  Failed to exchange code for token:", err);
    process.exit(1);
  }
});
