import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Ticket, ShieldCheck, Zap, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Ticket className="h-4 w-4" />
            </div>
            <span>Service Desk Vemplast</span>
          </div>
          <Link to="/auth">
            <Button>Entrar</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Central de Chamados oficial da Vemplast
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Abra, acompanhe e resolva chamados de TI e demais áreas em um único lugar,
            com SLA, histórico completo e integração com Teams e Microsoft 365.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/auth">
              <Button size="lg">Acessar portal</Button>
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Zap, title: "Rápido e simples", desc: "Abertura de chamados em poucos cliques com categorias claras." },
            { icon: ShieldCheck, title: "SLA controlado", desc: "Prazos de resposta e resolução por prioridade." },
            { icon: BookOpen, title: "Base de conhecimento", desc: "Consulte artigos e resolva por conta própria." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border bg-card p-6">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Vemplast — Uso interno.
      </footer>
    </div>
  );
}
