import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type AppRole = "admin" | "moderator" | "student" | "teacher" | "director";

interface UseRoleGuardOptions {
  requiredRole: AppRole;
  redirectTo?: string;
}

interface UseRoleGuardResult {
  hasAccess: boolean;
  loading: boolean;
  userRole: AppRole | null;
}

/**
 * Hook to verify user role from the database and redirect if unauthorized.
 * This provides server-side role verification in addition to client-side checks.
 */
export const useRoleGuard = ({ requiredRole, redirectTo = "/auth" }: UseRoleGuardOptions): UseRoleGuardResult => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  useEffect(() => {
    const verifyRole = async () => {
      if (authLoading) return;

      if (!user) {
        setLoading(false);
        setHasAccess(false);
        navigate(redirectTo);
        return;
      }

      try {
        // Fetch user's role from database (RLS-protected query)
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error verifying role:", error);
          setHasAccess(false);
          navigate(redirectTo);
          return;
        }

        const fetchedRole = data?.role as AppRole | null;
        setUserRole(fetchedRole);

        if (fetchedRole === requiredRole || fetchedRole === "admin") {
          // User has the required role or is an admin (admins can access everything)
          setHasAccess(true);
        } else {
          // User doesn't have access - redirect to appropriate dashboard
          setHasAccess(false);
          redirectToRoleDashboard(fetchedRole);
        }
      } catch (error) {
        console.error("Role verification error:", error);
        setHasAccess(false);
        navigate(redirectTo);
      } finally {
        setLoading(false);
      }
    };

    const redirectToRoleDashboard = (role: AppRole | null) => {
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "teacher":
          navigate("/docente");
          break;
        case "director":
          navigate("/director");
          break;
        case "student":
          navigate("/panel");
          break;
        default:
          navigate(redirectTo);
      }
    };

    verifyRole();
  }, [user, authLoading, requiredRole, redirectTo, navigate]);

  return { hasAccess, loading, userRole };
};
