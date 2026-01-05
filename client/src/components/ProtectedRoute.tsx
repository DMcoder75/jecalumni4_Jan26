import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ component: Component, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/auth");
    } else if (!loading && user && adminOnly && !user.is_admin) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation, adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;
  if (adminOnly && !user.is_admin) return null;

  return <Component />;
}
