# TODO - Fix “website not fully working”

## Step 1: Identify failing auth/cookie flow
- Locate how OAuth callback sets `app_session_id` cookie.
- Confirm whether cookie is being rejected/blocked in browser due to `sameSite: none` + `secure` rules.

## Step 2: Make cookie settings robust
- Update `rent-room/server/_core/cookies.ts` to set `secure`/`sameSite` safely for local dev and proxied environments.

## Step 3: Add server-side debug logs
- Add logging around OAuth callback and `sdk.authenticateRequest()` failure paths (missing cookie vs verify failure).

## Step 4: Validate OAuth redirectUri/origin
- Ensure `client/src/const.ts` `redirectUri` matches actual deployed origin.

## Step 5: Test
- Run dev server, perform OAuth login, verify cookie presence, then verify protected tRPC calls succeed.

