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
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-yellow-50 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background decorative elements */}
      <div className="bg-blur">
        <div className="bg-bubble" style={{ top: '10%', left: '15%', transform: 'scale(1.2)' }} />
        <div className="bg-bubble" style={{ bottom: '15%', right: '10%', transform: 'scale(0.8)' }} />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="relative w-28 h-28 mx-auto mb-4">
            <img 
              src="/bubble-removebg-preview.png" 
              alt="Bubble Trouble" 
              className="w-full h-full object-contain float-animation"
            />
          </div>
          <h1 className="text-4xl font-bold text-yellow-900 mb-4 tracking-tight">
            Welcome to Bubble Trouble
          </h1>
          <p className="text-lg text-yellow-800 max-w-2xl mx-auto leading-relaxed">
            Join our unique social space where messages float like bubbles and
            conversations spark meaningful connections.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="group hover:scale-105 transition-all duration-300 ease-out cursor-pointer">
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className="absolute inset-0 bg-yellow-200 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-4 transform group-hover:rotate-12 transition-transform duration-300">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-yellow-900 mb-3 group-hover:text-yellow-700 transition-colors">
                  Ephemeral Chats
                </h3>
                <p className="text-yellow-800 leading-relaxed group-hover:text-yellow-600 transition-colors">
                  Share thoughts that float away like bubbles in the wind
                </p>
              </div>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all duration-300 ease-out cursor-pointer">
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className="absolute inset-0 bg-yellow-200 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-4 transform group-hover:rotate-12 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-yellow-900 mb-3 group-hover:text-yellow-700 transition-colors">
                  Real Connections
                </h3>
                <p className="text-yellow-800 leading-relaxed group-hover:text-yellow-600 transition-colors">
                  Connect with like-minded individuals in a unique way
                </p>
              </div>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all duration-300 ease-out cursor-pointer">
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className="absolute inset-0 bg-yellow-200 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-4 transform group-hover:rotate-12 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-yellow-900 mb-3 group-hover:text-yellow-700 transition-colors">
                  Bubble Points
                </h3>
                <p className="text-yellow-800 leading-relaxed group-hover:text-yellow-600 transition-colors">
                  Earn points as your bubbles gain attention
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Container */}
        <div className="max-w-md w-full mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:shadow-yellow-200/50">
          <div className="flex justify-center space-x-8 mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={cn(
                'px-8 py-3 text-lg font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1',
                activeTab === 'login'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-yellow-700 hover:bg-yellow-50'
              )}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={cn(
                'px-8 py-3 text-lg font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1',
                activeTab === 'register'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-yellow-700 hover:bg-yellow-50'
              )}
            >
              Register
            </button>
          </div>

          <div className="mt-8">
            {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-yellow-700">
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