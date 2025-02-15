import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { LoginForm, RegisterForm } from "@/components/auth/auth-forms";
import { MessageCircle, Users, Clock } from "lucide-react";

export default function AuthPage() {
  const { user } = useAuth();

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <img 
            src="/bubble-removebg-preview.png" 
            alt="Bubble Trouble" 
            className="h-40 mx-auto mb-10 float-animation"
          />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Bubble Trouble
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our unique social space where messages float like bubbles and
            conversations spark meaningful connections.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto mb-16">
          <div className="text-center">
            <MessageCircle className="feature-icon" />
            <h3 className="feature-title">Ephemeral Chats</h3>
            <p className="feature-description">
              Share thoughts that float away like bubbles in the wind
            </p>
          </div>
          <div className="text-center">
            <Users className="feature-icon" />
            <h3 className="feature-title">Real Connections</h3>
            <p className="feature-description">
              Connect with like-minded individuals in a unique way
            </p>
          </div>
          <div className="text-center">
            <Clock className="feature-icon" />
            <h3 className="feature-title">Bubble Points</h3>
            <p className="feature-description">
              Earn points as your bubbles gain attention
            </p>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="auth-form">
            <h2 className="text-2xl font-semibold mb-8">Login</h2>
            <LoginForm />
          </div>

          <div className="auth-form">
            <h2 className="text-2xl font-semibold mb-8">Register</h2>
            <RegisterForm />
          </div>
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-yellow-600 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-yellow-600 transition-colors">Terms of Service</a>
          </div>
          <p className="mt-4">&copy; 2025 Bubble Trouble. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}