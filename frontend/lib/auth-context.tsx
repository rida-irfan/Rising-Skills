"use client";

/**
 * Auth context backed by Supabase Auth.
 *
 * The Rising Skills backend validates Supabase Auth JWTs. The login form supports
 * either an email/password flow (via supabase-js) or a pasted access token.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import {
  api,
  ApiError,
  getStoredToken,
  setStoredToken,
  type ProfileResponse,
} from "./api";

interface AuthContextValue {
  token: string | null;
  profile: ProfileResponse | null;
  loading: boolean;
  error: string | null;
  /** Persist a token and trigger a profile fetch. */
  signIn: (token: string) => void;
  /** Sign in with Supabase email/password and return the profile. */
  signInWithCredentials: (
    email: string,
    password: string,
  ) => Promise<ProfileResponse>;
  /** Register a new account via Supabase Auth. */
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
  }) => Promise<{ requiresConfirmation: boolean; profile: ProfileResponse | null }>;
  /** Clear token + profile. */
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PENDING_ORGANIZATION_KEY = "rising_skills_pending_organization";

function savePendingOrganization(name: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_ORGANIZATION_KEY, name);
}

async function createPendingOrganization(token: string): Promise<void> {
  if (typeof window === "undefined") return;
  const name = window.localStorage.getItem(PENDING_ORGANIZATION_KEY);
  if (!name) return;

  const organizations = await api.organizations.list(token);
  if (organizations.length === 0) {
    await api.organizations.create({ name }, token);
  }
  window.localStorage.removeItem(PENDING_ORGANIZATION_KEY);
}

async function ensureEmployerOrganization(
  token: string,
  fullName: string | null | undefined,
): Promise<void> {
  const organizations = await api.organizations.list(token);
  if (organizations.length === 0 && fullName?.trim()) {
    await api.organizations.create({ name: fullName.trim() }, token);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, hydrate token from localStorage and try to fetch profile.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Try to refresh the Supabase session first (auto-refreshes expired tokens)
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.access_token) {
          const freshToken = sessionData.session.access_token;
          setStoredToken(freshToken);
          if (!cancelled) setToken(freshToken);
          try {
            const p = await api.profiles.me(freshToken);
            if (!cancelled) {
              setProfile(p);
              setError(null);
            }
          } catch (err) {
            if (cancelled) return;
            if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
              setStoredToken(null);
              setToken(null);
              setProfile(null);
              setError("Session expired. Please sign in again.");
            } else {
              setError(err instanceof Error ? err.message : "Failed to load profile");
            }
          } finally {
            if (!cancelled) setLoading(false);
          }
          return;
        }
      } catch {
        // Supabase session not available, fall back to stored token
      }

      // Fall back to stored token
      const stored = getStoredToken();
      if (!stored) {
        if (!cancelled) setLoading(false);
        return;
      }
      if (!cancelled) setToken(stored);
      try {
        const p = await api.profiles.me(stored);
        if (!cancelled) {
          setProfile(p);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setStoredToken(null);
          setToken(null);
          setProfile(null);
          setError("Session expired. Please sign in again.");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Listen for Supabase auth state changes (fires on token refresh / sign out)
  useEffect(() => {
    try {
      if (typeof supabase.auth.onAuthStateChange !== 'function') {
        // Stub or incompatible version - skip auth state listening
        return;
      }
      
      const { data: sub } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.access_token) {
            setStoredToken(session.access_token);
            setToken(session.access_token);
          } else {
            setStoredToken(null);
            setToken(null);
            setProfile(null);
          }
        },
      );
      return () => {
        if (sub?.subscription?.unsubscribe) {
          sub.subscription.unsubscribe();
        }
      };
    } catch (error) {
      // If auth state change fails, just continue without it
      console.warn('Auth state change listener failed:', error);
    }
  }, []);

  const signIn = useCallback((newToken: string) => {
    const clean = newToken.trim();
    setStoredToken(clean);
    setToken(clean);
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const p = await api.profiles.me(clean);
        setProfile(p);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setStoredToken(null);
          setToken(null);
          setProfile(null);
          setError("Invalid token.");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signInWithCredentials = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (sbError || !data.session) {
        setLoading(false);
        throw new Error(sbError?.message ?? "Sign in failed");
      }
      const accessToken = data.session.access_token;
      setStoredToken(accessToken);
      setToken(accessToken);
      try {
        let p = await api.profiles.me(accessToken);
        await createPendingOrganization(accessToken);
        const metaName =
          (data.user?.user_metadata?.full_name as string | undefined) ||
          (data.user?.user_metadata?.name as string | undefined);
        if (p.role === "employer") {
          await ensureEmployerOrganization(accessToken, p.full_name || metaName);
        }
        if (!p.full_name && metaName) {
          try {
            p = await api.profiles.updateMe({ full_name: metaName }, accessToken);
          } catch {
            /* non-fatal: profile still usable without backfilled name */
          }
        }
        setProfile(p);
        setError(null);
        return p;
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setStoredToken(null);
          setToken(null);
          setProfile(null);
          setError("Invalid credentials.");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const signUp = useCallback(
    async ({
      email,
      password,
      fullName,
      role,
    }: {
      email: string;
      password: string;
      fullName: string;
      role: string;
    }) => {
      setLoading(true);
      setError(null);
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });
      if (sbError) {
        setLoading(false);
        throw new Error(sbError.message);
      }
      if (sbData.session) {
        const accessToken = sbData.session.access_token;
        setStoredToken(accessToken);
        setToken(accessToken);
        try {
          let p = await api.profiles.me(accessToken);
          if (role === "employer") {
            await api.organizations.create(
              { name: fullName.trim() },
              accessToken,
            );
          }
          if (!p.full_name && fullName) {
            try {
              p = await api.profiles.updateMe({ full_name: fullName }, accessToken);
            } catch {
              /* non-fatal: profile still usable without backfilled name */
            }
          }
          setProfile(p);
          setError(null);
          return { requiresConfirmation: false, profile: p };
        } catch (err) {
          if (
            err instanceof ApiError &&
            (err.status === 401 || err.status === 403)
          ) {
            setStoredToken(null);
            setToken(null);
            setProfile(null);
            setError("Invalid token.");
          } else {
            setError(
              err instanceof Error ? err.message : "Failed to load profile",
            );
          }
          throw err;
        } finally {
          setLoading(false);
        }
      }
      if (role === "employer") {
        savePendingOrganization(fullName.trim());
      }
      setLoading(false);
      return { requiresConfirmation: true, profile: null };
    },
    [],
  );

  const signOut = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setProfile(null);
    setError(null);
    // Sign out of Supabase so the session cookie is cleared if present.
    supabase.auth.signOut().catch(() => {
      /* ignore */
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      profile,
      loading,
      error,
      signIn,
      signInWithCredentials,
      signUp,
      signOut,
    }),
    [
      token,
      profile,
      loading,
      error,
      signIn,
      signInWithCredentials,
      signUp,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
