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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, hydrate token from localStorage and try to fetch profile.
  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    let cancelled = false;
    (async () => {
      try {
        const p = await api.profiles.me(stored);
        if (!cancelled) {
          setProfile(p);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          // Token invalid — clear it.
          setStoredToken(null);
          setToken(null);
          setProfile(null);
          setError("Session expired. Please sign in again.");
        } else {
          // Keep token but surface a non-fatal error.
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
        const metaName =
          (data.user?.user_metadata?.full_name as string | undefined) ||
          (data.user?.user_metadata?.name as string | undefined);
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
