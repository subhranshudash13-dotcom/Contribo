/**
 * OAuth provider configuration guard.
 *
 * Auth.js registers every provider it is given, including one whose client id
 * and secret were never filled in. A half-configured GitHub provider is worse
 * than a missing one: it still shows up on `/api/auth/providers` (so the login
 * screen renders the GitHub button) and still issues a redirect to
 * `github.com/login/oauth/authorize?client_id=` with an empty client id. The
 * user lands on a GitHub error page, and the callback that does come back
 * collapses into an opaque `Configuration` error.
 *
 * The `.env.example` values (`your_github_id_here`) land in exactly that
 * state, so placeholder-looking values are treated as unconfigured too.
 */

export type OAuthProviderId = "github" | "google";

const ENV_KEYS: Record<OAuthProviderId, { id: string; secret: string }> = {
  github: { id: "AUTH_GITHUB_ID", secret: "AUTH_GITHUB_SECRET" },
  google: { id: "AUTH_GOOGLE_ID", secret: "AUTH_GOOGLE_SECRET" },
};

/**
 * Untouched `.env.example` values and whitespace — never valid credentials.
 * GitHub OAuth app ids look like `Iv1.xxx` / `Ov23li...`, Google client ids end
 * in `.apps.googleusercontent.com`, so anything shaped like a template is out.
 */
const PLACEHOLDER_RE =
  /^(your_|change_me|placeholder|todo|tbd|xxx+|<.*>|\[.*\]|.*(id|secret)_here$)/i;

function credentialPresent(value: string | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return false;
  return !PLACEHOLDER_RE.test(trimmed);
}

/** True only when both halves of an OAuth app's credentials are configured. */
export function isOAuthProviderConfigured(
  env: NodeJS.ProcessEnv = process.env,
  provider: OAuthProviderId
): boolean {
  const keys = ENV_KEYS[provider];
  if (!keys) return false;
  return credentialPresent(env[keys.id]) && credentialPresent(env[keys.secret]);
}

/** Ids of the OAuth providers that are safe to register with Auth.js. */
export function configuredOAuthProviderIds(
  env: NodeJS.ProcessEnv = process.env
): OAuthProviderId[] {
  return (Object.keys(ENV_KEYS) as OAuthProviderId[]).filter((provider) =>
    isOAuthProviderConfigured(env, provider)
  );
}
