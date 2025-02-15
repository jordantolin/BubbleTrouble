import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { LoginForm, RegisterForm } from "@/components/auth/auth-forms";

export default function AuthPage() {
  const { user } = useAuth();

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <img 
            src="/bubbletroublelogo-3-removebg-preview.png" 
            alt="Bubble Trouble" 
            className="h-20 mx-auto mb-6 float-animation"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Bubble Trouble
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our unique social space where messages float like bubbles and
            conversations spark meaningful connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="text-left">
              <h2 className="text-2xl font-semibold mb-2">Sign In</h2>
              <p className="text-gray-600">
                Welcome back! Continue your journey with Bubble Trouble.
              </p>
            </div>
            <LoginForm />
          </div>

          <div className="space-y-6">
            <div className="text-left">
              <h2 className="text-2xl font-semibold mb-2">Create Account</h2>
              <p className="text-gray-600">
                New to Bubble Trouble? Join our community today!
              </p>
            </div>
            <RegisterForm />
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}