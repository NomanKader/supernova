import * as React from 'react';

const initialAuthState = {
  isAuthenticated: false,
  isSubscribed: false,
  purchasedCourses: [],
  user: null,
  token: null,
};

const AuthContext = React.createContext({
  ...initialAuthState,
  login: () => {},
  logout: () => {},
  subscribe: () => {},
  recordPurchase: () => {},
});

const storageKey = 'supernova-auth-state';

function loadState() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return initialAuthState;
    const parsed = JSON.parse(stored);
    return {
      ...initialAuthState,
      ...parsed,
      purchasedCourses: parsed.purchasedCourses ?? [],
      token: parsed.token ?? null,
    };
  } catch (error) {
    console.warn('Failed to read auth state', error);
    return initialAuthState;
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = React.useState(() => {
    if (typeof window === 'undefined') return initialAuthState;
    return loadState();
  });

  const persist = React.useCallback((nextState) => {
    setState(nextState);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    } catch (error) {
      console.warn('Failed to persist auth state', error);
    }
  }, []);

  const login = React.useCallback((credentials) => {
    const existingPurchases = state.purchasedCourses ?? [];
    const providedPurchases = Array.isArray(credentials?.purchasedCourses)
      ? credentials.purchasedCourses
      : null;
    const mergedPurchases = providedPurchases
      ? Array.from(new Set([...(existingPurchases || []), ...providedPurchases]))
      : existingPurchases;

    const providedUser = credentials?.user || null;
    const userProfile = providedUser
      ? {
          id: providedUser.id ?? state.user?.id ?? null,
          tenantId: providedUser.tenantId ?? state.user?.tenantId ?? null,
          businessName: providedUser.businessName ?? state.user?.businessName ?? null,
          role: providedUser.role ?? state.user?.role ?? null,
          email: providedUser.email ?? 'learner@supernova.dev',
          name: providedUser.name || null,
          avatarUrl: providedUser.avatarUrl || null,
          provider: providedUser.provider || credentials?.provider || 'password',
        }
      : {
          id: state.user?.id ?? null,
          tenantId: state.user?.tenantId ?? null,
          businessName: credentials?.businessName ?? state.user?.businessName ?? null,
          role: state.user?.role ?? null,
          email: credentials?.email ?? 'learner@supernova.dev',
          name: credentials?.name || null,
          avatarUrl: credentials?.avatarUrl || null,
          provider: credentials?.provider || 'password',
        };

    const nextState = {
      isAuthenticated: true,
      isSubscribed: Boolean(credentials?.subscribe),
      purchasedCourses: mergedPurchases,
      user: userProfile,
      token: credentials?.token ?? state.token ?? null,
    };
    persist(nextState);
  }, [persist, state.purchasedCourses, state.token]);

  const logout = React.useCallback(() => {
    persist(initialAuthState);
  }, [persist]);

  const subscribe = React.useCallback(() => {
    persist({ ...state, isSubscribed: true });
  }, [persist, state]);

  const recordPurchase = React.useCallback((courseId) => {
    if (!courseId) return;
    const updated = Array.from(new Set([...(state.purchasedCourses ?? []), courseId]));
    persist({ ...state, purchasedCourses: updated, isSubscribed: true });
  }, [persist, state]);

  const value = React.useMemo(
    () => ({ ...state, login, logout, subscribe, recordPurchase }),
    [state, login, logout, subscribe, recordPurchase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
