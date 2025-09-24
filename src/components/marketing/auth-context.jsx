import * as React from 'react';

const initialAuthState = {
  isAuthenticated: false,
  isSubscribed: false,
  purchasedCourses: [],
  user: null,
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
    return { ...initialAuthState, ...parsed, purchasedCourses: parsed.purchasedCourses ?? [] };
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
    const nextState = {
      isAuthenticated: true,
      isSubscribed: Boolean(credentials?.subscribe),
      purchasedCourses: credentials?.subscribe ? Array.from(new Set([...(state.purchasedCourses ?? [])])) : state.purchasedCourses ?? [],
      user: { email: credentials?.email ?? 'learner@supernova.dev' },
    };
    persist(nextState);
  }, [persist, state.purchasedCourses]);

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
