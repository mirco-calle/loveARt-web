import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loginUser, googleLogin, logoutUser, getMe } from "../api/Auth";
import type { User } from "../api/Auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  access_token: string | null;
  refresh_token: string | null;

  // Actions
  login: (identifier: string, password: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setSession: (user: User, access: string, refresh: string) => void;
}

/**
 * useAuthStore: Central authentication state management.
 * Uses zustand/persist to synchronize state with localStorage ("auth-storage").
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      access_token: null,
      refresh_token: null,

      /** Manually set session (e.g. after email verification) */
      setSession: (user, access, refresh) => {
        set({
          user,
          access_token: access,
          refresh_token: refresh,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      /** Login with credentials */
      login: async (identifier, password) => {
        set({ isLoading: true });
        try {
          const { data } = await loginUser({ identifier, password });
          set({
            user: data.user,
            access_token: data.access,
            refresh_token: data.refresh,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: unknown) {
          set({ isLoading: false });
          const axiosErr = err as {
            response?: { status?: number; data?: { email?: string } };
          };
          if (axiosErr?.response?.status === 403) {
            const e = new Error("UNVERIFIED") as Error & {
              code: string;
              email?: string;
            };
            e.code = "UNVERIFIED";
            e.email = axiosErr.response?.data?.email ?? "";
            throw e;
          }
          throw new Error("INVALID_CREDENTIALS");
        }
      },

      /** Google OAuth Login */
      loginWithGoogle: async (googleToken) => {
        set({ isLoading: true });
        try {
          const { data } = await googleLogin(googleToken);
          set({
            user: data.user,
            access_token: data.access,
            refresh_token: data.refresh,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
          throw new Error("Error logic with Google");
        }
      },

      /** Logout: wipes state and calls backend */
      logout: async () => {
        const { refresh_token } = get();
        try {
          if (refresh_token) {
            await logoutUser(refresh_token);
          }
        } catch {
          // Ignore errors during logout
        } finally {
          set({
            user: null,
            access_token: null,
            refresh_token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          // Note: createJSONStorage(localStorage) handles clear on set(initialState) if using persist
        }
      },

      /** Refresh user data from API */
      fetchUser: async () => {
        if (!get().access_token) return;
        set({ isLoading: true });
        try {
          const { data } = await getMe();
          set({ user: data, isAuthenticated: true, isLoading: false });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage", // Key in localStorage
      storage: createJSONStorage(() => localStorage),
      // Only persist tokens and basic auth state, user can be re-fetched
      partialize: (state) => ({
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
