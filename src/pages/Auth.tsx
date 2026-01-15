import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Loader2 } from "lucide-react";
import { validateDemoCredentials, setDemoSession, getDemoRedirectPath } from "@/lib/demoAuth";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading, isDemoMode, demoUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to fetch user role and redirect
  const redirectByRole = useCallback(async (userId: string) => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (roles && roles.length > 0) {
      // Priority: admin > director > teacher > student
      if (roles.some(r => r.role === "admin")) {
        navigate("/admin");
      } else if (roles.some(r => r.role === "director")) {
        navigate("/director");
      } else if (roles.some(r => r.role === "teacher")) {
        navigate("/docente");
      } else {
        navigate("/panel");
      }
    } else {
      navigate("/panel");
    }
  }, [navigate]);

  useEffect(() => {
    // If demo user is logged in, redirect to appropriate dashboard based on role
    if (!loading && isDemoMode && demoUser) {
      const redirectPath = getDemoRedirectPath(demoUser.role);
      navigate(redirectPath);
      return;
    }
    
    // If real Supabase user is logged in, redirect by role
    if (!loading && user) {
      redirectByRole(user.id);
    }
  }, [user, loading, redirectByRole, isDemoMode, demoUser, navigate]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);

    // Primero verificar si es un usuario demo (predefinido o registrado)
    const demoResult = validateDemoCredentials(data.email, data.password);
    if (demoResult.valid && demoResult.user) {
      // Guardar la sesión demo para que persista durante la navegación
      setDemoSession(demoResult.user);
      toast({
        title: "Inicio de sesión exitoso (Demo)",
        description: `Bienvenido ${demoResult.user.profile.firstName}. Datos temporales hasta cerrar navegador.`,
      });
      setIsLoading(false);
      // Redirigir al dashboard correspondiente según el rol
      const redirectPath = getDemoRedirectPath(demoResult.user.role);
      window.location.href = redirectPath;
      return;
    }

    // Si no es demo, intentar con Supabase
    const { error } = await signIn(data.email, data.password);

    if (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message === "Invalid login credentials" 
          ? "Credenciales inválidas. Verifica tu correo y contraseña."
          : error.message,
      });
    } else {
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      });
      // Redirection will be handled by useEffect after user state updates
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="rounded-lg bg-primary p-2.5">
          <GraduationCap className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">UPEA</h1>
          <p className="text-sm text-muted-foreground">Sistema de Evaluación Estudiantil</p>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa con tu cuenta institucional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center pt-2">
                <Button type="submit" className="w-full max-w-xs" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Credenciales de prueba:
            </p>
            <div className="space-y-1 text-xs">
              <p><span className="font-medium">Admin:</span> admin@upea.edu.bo / admin123</p>
              <p><span className="font-medium">Director:</span> director@upea.edu.bo / director123</p>
              <p><span className="font-medium">Docente:</span> docente@upea.edu.bo / docente123</p>
              <p><span className="font-medium">Estudiante:</span> estudiante@upea.edu.bo / estudiante123</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground text-center">
        ¿Necesitas ayuda? Contacta a soporte técnico
      </p>
    </div>
  );
};

export default Auth;
