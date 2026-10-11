import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "sicsi_user";

function readStoredUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = readStoredUser();

    if (storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const updateUser = (userData) => {
    if (!userData) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  const refreshUser = () => {
    const storedUser = readStoredUser();

    setUser(storedUser);

    return storedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser usado dentro de AuthProvider."
    );
  }

  return context;
}
