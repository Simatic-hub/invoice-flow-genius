
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/language";
import { Pen, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const LoginPage = () => {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setValidationError(t('form.required'));
      return;
    }
    
    setIsLoading(true);
    setValidationError("");
    
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      setValidationError(error.message || t('auth.login.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 py-4">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              <Pen className="h-6 w-6 text-indigo-600" />
              <span className="italic">Proforma</span>
            </a>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">About Us</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
          </nav>
          <div className="flex items-center space-x-3">
            <a href="#" className="hidden md:block border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              Try Free
            </a>
            <a href="/login" className="hidden md:block bg-[#212d5b] text-white rounded-md px-4 py-2 text-sm hover:bg-[#1e2b54] transition-colors">
              Login
            </a>
            <button className="md:hidden text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to your Proforma account</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            {validationError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-300"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-gray-300"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#212d5b] hover:bg-[#1e2b54] text-white" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <a href="#" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                </a>
                <a href="#" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7h-2.54v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a href="/register" className="text-indigo-600 hover:text-indigo-800">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Image and quote section */}
      <div className="hidden lg:block bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="max-w-2xl text-center">
              <blockquote className="text-xl italic text-gray-700">
                "Proforma has made my invoicing process incredibly simple and efficient. I can now send invoices in just a few clicks, which saves me a lot of time."
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold text-gray-900">Sarah Johnson</p>
                <p className="text-gray-600">Freelance Graphic Designer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">© 2025 Proforma. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
