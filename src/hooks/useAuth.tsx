
import { useState, useEffect, createContext, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthProvider mounted');
    let isMounted = true;

    // Check for existing session first to avoid flicker
    const initializeAuth = async () => {
      try {
        console.log('Getting initial session');
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (isMounted) {
          console.log('Initial session check:', data.session ? 'Session found' : 'No session');
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (e) {
        console.error('Error getting initial session:', e);
        if (isMounted) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Handle redirects based on auth state changes
          if (event === 'SIGNED_IN') {
            setTimeout(() => {
              navigate('/dashboard');
            }, 0);
          } else if (event === 'SIGNED_OUT') {
            setTimeout(() => {
              navigate('/login');
            }, 0);
          }
        }
      }
    );

    initializeAuth();

    // Cleanup
    return () => {
      console.log('AuthProvider unmounting');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // If we encountered an error during initialization, log it
  useEffect(() => {
    if (error) {
      console.error('Auth provider initialization error:', error);
    }
  }, [error]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error; // Re-throw to handle in the login component
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Signing up:', email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Registration successful",
        description: "Welcome! Please check your email for confirmation.",
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out');
      setLoading(true); // Set loading to true before signout to prevent UI flashes
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear user and session state manually to ensure immediate UI update
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Navigate to login page
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context values with null checks
  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  // Debug output
  console.log('Auth provider rendering with:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading 
  });

  return (
    <AuthContext.Provider value={value}>
      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Authentication Error</h3>
          <p className="text-red-700">{error.message}</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
