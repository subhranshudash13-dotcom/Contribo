/**
 * Pure predicates for OAuth provider configuration.
 *
 * A provider is only usable when BOTH its client id and client secret are
 * present and do not hold the literal placeholder values shipped in
 * `.env.example` (`your_github_id_here`, etc.). Registering a provider with
 * missing/placeholder credentials makes Auth.js advertise it and build an
 * authorize URL with an empty `client_id`, which 500s on `/api/auth/error`.
 */

export type OAuthProviderId = "github" | "google";

const OAUTH_PROVIDER_IDS = ["github", "google"] as const;

/** Placeholder values follow the `your_*_here` pattern from `.env.example`. */
const PLACEHOLDER_RE = /^your_.*_here$/i;

function isUsableCredential(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !PLACEHOLDER_RE.test(trimmed);
}

export function isProviderConfigured(
  env: Record<string, string | undefined>,
  provider: OAuthProviderId
): boolean {
  const upper = provider.toUpperCase();
  return (
    isUsableCredential(env[`AUTH_${upper}_ID`]) &&
    isUsableCredential(env[`AUTH_${upper}_SECRET`])
  );
}

export function getConfiguredOAuthProviders(
  env: Record<string, string | undefined> = process.env
): OAuthProviderId[] {
  return OAUTH_PROVIDER_IDS.filter((id) => isProviderConfigured(env, id));
}
