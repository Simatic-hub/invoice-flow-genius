
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/language";
import { Pen, LockKeyhole, Mail, Facebook, Twitter, Linkedin } from "lucide-react";
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
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl font-serif italic font-medium text-proforma-navy">Proforma</span>
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
            <a href="/login" className="hidden md:block bg-proforma-navy text-white rounded-md px-4 py-2 text-sm hover:bg-proforma-navyDark transition-colors">
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
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-white to-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.welcome.back')}</h1>
            <p className="text-gray-600">Sign in to your Proforma account</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-proforma p-6">
            {validationError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.email.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-300"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password" className="text-gray-700">{t('auth.password')}</Label>
                  <a href="#" className="text-sm text-proforma-blue hover:text-proforma-navy">
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
                className="w-full bg-proforma-navy hover:bg-proforma-navyDark text-white" 
                disabled={isLoading}
              >
                {isLoading ? t('auth.logging.in') : t('auth.login')}
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

              <div className="mt-6 grid grid-cols-3 gap-3">
                <a href="#" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a href="/register" className="text-proforma-blue hover:text-proforma-navy">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Testimonial section */}
      <div className="bg-gray-50 py-12 px-4 border-t border-gray-100">
        <div className="container mx-auto">
          <div className="flex flex-col max-w-3xl mx-auto items-center text-center">
            <blockquote className="text-xl italic text-gray-700 mb-4">
              "Proforma has made my invoicing process incredibly simple and efficient. I can now send invoices in just a few clicks, which saves me a lot of time."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
              <div>
                <p className="font-semibold text-gray-900">Sarah Johnson</p>
                <p className="text-gray-600 text-sm">Freelance Graphic Designer</p>
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
