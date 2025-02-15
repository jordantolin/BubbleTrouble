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
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Welcome to Bubble Trouble</h1>
              <p className="text-lg text-gray-600">
                Where thoughts float like bubbles in a digital space. Join our
                community and start sharing your ideas today!
              </p>
            </div>
            <LoginForm />
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">New here?</h2>
              <p className="text-gray-600">
                Create an account and start your journey with Bubble Trouble.
              </p>
            </div>
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
