import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const value = useMemo(() => ({
    isAuthenticated,
    setIsAuthenticated,
  }), [isAuthenticated, setIsAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
