import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogIn, UserPlus } from "lucide-react";
import RegisterModal from "@/components/RegisterModal";
import BlockchainVerificationButton from "@/components/BlockchainVerificationButton";

const Index = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary p-2.5 shadow-[var(--shadow-soft)]">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">UPEA</h1>
                <p className="text-xs text-muted-foreground">Universidad Pública de El Alto</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Sistema en línea
          </div>

          {/* Main Heading */}
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Sistema de Evaluación
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Docente Estudiantil
            </span>
          </h2>

          {/* Description */}
          <p className="mb-10 text-lg text-muted-foreground md:text-xl">
            Plataforma institucional para la evaluación del desempeño docente.
            Participa en la mejora continua de la calidad educativa de la UPEA.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => navigate("/auth")}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Iniciar sesión
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setRegisterModalOpen(true)}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Regístrate aquí
            </Button>
          </div>

          {/* Modal de registro */}
          <RegisterModal 
            open={registerModalOpen} 
            onOpenChange={setRegisterModalOpen} 
          />
          {/* Info Cards */}
          <div className="mt-20 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-medium)]">
              <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-3">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-card-foreground">Proceso transparente</h3>
              <p className="text-sm text-muted-foreground">
                Sistema seguro y confidencial para tus evaluaciones
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-medium)]">
              <div className="mb-3 inline-flex rounded-lg bg-secondary/10 p-3">
                <svg
                  className="h-6 w-6 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-card-foreground">Acceso rápido</h3>
              <p className="text-sm text-muted-foreground">
                Completa tus evaluaciones desde cualquier dispositivo
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-medium)]">
              <div className="mb-3 inline-flex rounded-lg bg-accent/10 p-3">
                <svg
                  className="h-6 w-6 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-card-foreground">Mejora continua</h3>
              <p className="text-sm text-muted-foreground">
                Tu opinión contribuye a la excelencia académica
              </p>
            </div>
          </div>

          {/* Blockchain Verification */}
          <div className="mt-10 flex justify-center">
            <BlockchainVerificationButton />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Universidad Pública de El Alto - Sistema de Evaluación Docente
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
