import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chamados/")({
  component: ChamadosPage,
});

const statusLabel: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  aguardando_usuario: "Aguardando você",
  aguardando_terceiro: "Aguardando terceiro",
  resolvido: "Resolvido",
  fechado: "Fechado",
  cancelado: "Cancelado",
};

const prioLabel: Record<string, string> = {
  baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica",
};

function ChamadosPage() {
  const { user } = Route.useRouteContext();

  const { data: chamados, isLoading } = useQuery({
    queryKey: ["meus-chamados", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chamados")
        .select("id, numero, titulo, status, prioridade, aberto_em")
        .order("aberto_em", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus chamados</h1>
          <p className="text-sm text-muted-foreground">Chamados abertos por você.</p>
        </div>
        <Link to="/chamados/novo">
          <Button><PlusCircle className="mr-2 h-4 w-4" />Novo chamado</Button>
        </Link>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : !chamados?.length ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum chamado ainda. Clique em "Novo chamado" para começar.
          </div>
        ) : (
          <div className="divide-y">
            {chamados.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 hover:bg-muted/40">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{c.numero}</span>
                    <Badge variant="secondary">{prioLabel[c.prioridade] ?? c.prioridade}</Badge>
                  </div>
                  <div className="truncate font-medium">{c.titulo}</div>
                  <div className="text-xs text-muted-foreground">
                    Aberto em {new Date(c.aberto_em).toLocaleString("pt-BR")}
                  </div>
                </div>
                <Badge>{statusLabel[c.status] ?? c.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
