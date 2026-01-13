import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getDemoRedirectPath, DemoRole } from "@/lib/demoAuth";

type AppRole = "admin" | "moderator" | "student" | "teacher" | "director";

interface UseRoleGuardOptions {
  requiredRole: AppRole;
  redirectTo?: string;
}

interface UseRoleGuardResult {
  hasAccess: boolean;
  loading: boolean;
  /** Rol principal (resuelto por prioridad), útil para UI */
  userRole: AppRole | null;
}

const resolvePrimaryRole = (roles: AppRole[]): AppRole | null => {
  // Prioridad: admin > director > teacher > moderator > student
  if (roles.includes("admin")) return "admin";
  if (roles.includes("director")) return "director";
  if (roles.includes("teacher")) return "teacher";
  if (roles.includes("moderator")) return "moderator";
  if (roles.includes("student")) return "student";
  return null;
};

const roleToDashboardPath = (role: AppRole | null, fallback: string) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "director":
      return "/director";
    case "teacher":
      return "/docente";
    case "student":
      return "/panel";
    default:
      return fallback;
  }
};

/**
 * Hook para verificar rol desde backend y redirigir si no está autorizado.
 * Nota: un usuario puede tener MÚLTIPLES roles, por eso aquí siempre leemos una lista.
 */
export const useRoleGuard = ({ requiredRole, redirectTo = "/auth" }: UseRoleGuardOptions): UseRoleGuardResult => {
  const { user, loading: authLoading, demoUser, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  const safeNavigate = useMemo(() => {
    return (to: string) => {
      if (to && to !== location.pathname) navigate(to);
    };
  }, [navigate, location.pathname]);

  useEffect(() => {
    let cancelled = false;

    const finish = (next: { access: boolean; role: AppRole | null; redirect?: string }) => {
      if (cancelled) return;
      setHasAccess(next.access);
      setUserRole(next.role);
      setLoading(false);
      if (!next.access && next.redirect) safeNavigate(next.redirect);
    };

    const verifyRole = async () => {
      if (authLoading) return;

      // 1) Demo mode (sessionStorage) – solo para pruebas
      if (isDemoMode && demoUser) {
        const demoRole = demoUser.role as AppRole;
        const access = demoRole === requiredRole || demoRole === "admin";

        if (access) {
          finish({ access: true, role: demoRole });
        } else {
          const redirectPath = getDemoRedirectPath(demoRole as DemoRole);
          finish({ access: false, role: demoRole, redirect: redirectPath });
        }
        return;
      }

      // 2) Usuario real
      if (!user) {
        finish({ access: false, role: null, redirect: redirectTo });
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          if (import.meta.env.DEV) console.error("Error verificando roles:", error);
          finish({ access: false, role: null, redirect: redirectTo });
          return;
        }

        const roles = (data ?? [])
          .map((r) => r.role as AppRole)
          .filter(Boolean);

        const primary = resolvePrimaryRole(roles);
        const access = roles.includes(requiredRole) || roles.includes("admin");

        if (access) {
          finish({ access: true, role: primary });
        } else {
          // Si no tiene acceso, lo mandamos a su dashboard "principal" (por prioridad)
          const target = roleToDashboardPath(primary, redirectTo);
          finish({ access: false, role: primary, redirect: target });
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error("Role verification error:", err);
        finish({ access: false, role: null, redirect: redirectTo });
      }
    };

    verifyRole();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isDemoMode, demoUser, user, requiredRole, redirectTo, safeNavigate]);

  return { hasAccess, loading, userRole };
};

