import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { LoginForm, RegisterForm } from "@/components/auth/auth-forms";
import { MessageCircle, Users, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-yellow-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="bg-blur">
        <div className="bg-bubble" style={{ top: '10%', left: '15%', transform: 'scale(1.2)' }} />
        <div className="bg-bubble" style={{ bottom: '15%', right: '10%', transform: 'scale(0.8)' }} />
      </div>

      {/* Decorative bubbles */}
      <div className="bubble-decoration w-20 h-20" style={{ top: '25%', left: '5%' }} />
      <div className="bubble-decoration w-16 h-16" style={{ top: '15%', right: '20%' }} />
      <div className="bubble-decoration w-24 h-24" style={{ bottom: '20%', left: '20%' }} />
      <div className="bubble-decoration w-12 h-12" style={{ bottom: '30%', right: '15%' }} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-16">
          <div className="relative w-40 h-40 mx-auto mb-8">
            <img 
              src="/bubble-removebg-preview.png" 
              alt="Bubble Trouble" 
              className="w-full h-full object-contain float-animation"
            />
          </div>
          <h1 className="text-5xl font-bold text-yellow-900 mb-6 tracking-tight">
            Welcome to Bubble Trouble
          </h1>
          <p className="text-xl text-yellow-800 max-w-2xl mx-auto leading-relaxed">
            Join our unique social space where messages float like bubbles and
            conversations spark meaningful connections.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          <div className="feature-box">
            <MessageCircle className="feature-icon" />
            <h3 className="feature-title">Ephemeral Chats</h3>
            <p className="feature-description">
              Share thoughts that float away like bubbles in the wind
            </p>
          </div>
          <div className="feature-box">
            <Users className="feature-icon" />
            <h3 className="feature-title">Real Connections</h3>
            <p className="feature-description">
              Connect with like-minded individuals in a unique way
            </p>
          </div>
          <div className="feature-box">
            <Clock className="feature-icon" />
            <h3 className="feature-title">Bubble Points</h3>
            <p className="feature-description">
              Earn points as your bubbles gain attention
            </p>
          </div>
        </div>

        {/* Auth Container */}
        <div className="auth-container">
          <div className="flex justify-center mb-8 border-b border-yellow-200">
            <button
              onClick={() => setActiveTab('login')}
              className={cn(
                'auth-tab',
                activeTab === 'login' && 'text-yellow-600'
              )}
              data-state={activeTab === 'login' ? 'active' : 'inactive'}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={cn(
                'auth-tab',
                activeTab === 'register' && 'text-yellow-600'
              )}
              data-state={activeTab === 'register' ? 'active' : 'inactive'}
            >
              Register
            </button>
          </div>

          <div className="mt-8">
            {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>

        <footer className="mt-20 text-center text-sm text-yellow-700">
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-yellow-900 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-yellow-900 transition-colors">Terms of Service</a>
          </div>
          <p className="mt-4">&copy; 2025 Bubble Trouble. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}