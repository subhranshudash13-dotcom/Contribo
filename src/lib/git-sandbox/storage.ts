import { GitGraphState } from './types';

const STORAGE_KEY_STATE = 'contribo_git_sandbox_state_v1';
const STORAGE_KEY_CHALLENGE = 'contribo_git_sandbox_active_challenge_v1';
const STORAGE_KEY_COMPLETED = 'contribo_git_sandbox_completed_v1';

export function saveSandboxState(state: GitGraphState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save sandbox state:', err);
  }
}

export function loadSandboxState(): GitGraphState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATE);
    return raw ? (JSON.parse(raw) as GitGraphState) : null;
  } catch {
    return null;
  }
}

export function saveActiveChallengeId(challengeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CHALLENGE, challengeId);
  } catch (err) {
    console.error('Failed to save active challenge id:', err);
  }
}

export function loadActiveChallengeId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_CHALLENGE);
  } catch {
    return null;
  }
}

export function getCompletedChallenges(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLETED);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markChallengeCompleted(challengeId: string): string[] {
  if (typeof window === 'undefined') return [challengeId];
  try {
    const completed = new Set(getCompletedChallenges());
    completed.add(challengeId);
    const arr = Array.from(completed);
    localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(arr));
    return arr;
  } catch {
    return [challengeId];
  }
}

export function clearSandboxStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_STATE);
  } catch (err) {
    console.error('Failed to clear sandbox state:', err);
  }
}
