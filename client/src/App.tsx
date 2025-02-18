import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { ProtectedRoute } from "@/lib/protected-route";
import { Loader2 } from "lucide-react";
import { ToastProvider } from "@/components/ui/toast";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/pages/home-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const NotFound = lazy(() => import("@/pages/not-found"));

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
          <Navbar />
          
          <main className="flex-1">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }
            >
              <Switch>
                {/* Public Routes */}
                <Route path="/auth" component={AuthPage} />

                {/* Protected Routes */}
                <ProtectedRoute path="/" component={HomePage} />
                <ProtectedRoute path="/profile" component={ProfilePage} />

                {/* Fallback Route */}
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </main>

          <Toaster />
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
