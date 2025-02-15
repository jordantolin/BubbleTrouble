import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route, Redirect, RouteComponentProps } from "wouter";
import { useAuth } from "@/providers/auth-provider";
import { Layout } from "@/components/layout/Layout";
import { LoadingLogo } from "@/components/ui/loading-logo";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/pages/home-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const NotFound = lazy(() => import("@/pages/not-found"));
const MyBubblesPage = lazy(() => import("@/pages/my-bubbles-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));

interface ProtectedRouteProps {
  component: React.ComponentType<RouteComponentProps>;
  path: string;
}

function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

function App() {
  const { user } = useAuth();

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex flex-col items-center justify-center gap-4 p-4">
          <div className="w-full max-w-md">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500 h-5 w-5" />
                  Something went wrong
                </CardTitle>
                <CardDescription>
                  We encountered an error while loading the application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Please try refreshing the page. If the problem persists, contact support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <Layout>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <LoadingLogo size="lg" showText />
            </div>
          }
        >
          <Switch>
            {/* Public Routes */}
            <Route path="/auth">
              {user ? <Redirect to="/" /> : <AuthPage />}
            </Route>

            {/* Protected Routes */}
            <ProtectedRoute path="/" component={HomePage} />
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <ProtectedRoute path="/bubbles" component={MyBubblesPage} />
            <ProtectedRoute path="/settings" component={SettingsPage} />

            {/* Not Found */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
        <Toaster />
      </Layout>
    </ErrorBoundary>
  );
}

export default App;