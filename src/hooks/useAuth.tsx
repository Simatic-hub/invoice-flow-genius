
import { useContext } from "react";
import { AuthContext } from "@/contexts/auth/AuthContext";
import { AuthContextType } from "@/contexts/auth/AuthContext";
import { AuthProvider as ContextAuthProvider } from "@/contexts/auth/AuthProvider";

// Default export for direct imports
export default function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Named export for named imports
export { useAuth } from "@/contexts/auth/useAuth";
export type { AuthContextType } from "@/contexts/auth/AuthContext";

// Re-export the AuthProvider from the contexts folder
export const AuthProvider = ContextAuthProvider;
