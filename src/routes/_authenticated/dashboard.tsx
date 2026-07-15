import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [abertos, andamento, resolvidos, violados] = await Promise.all([
        supabase.from("chamados").select("id", { count: "exact", head: true }).eq("status", "aberto"),
        supabase.from("chamados").select("id", { count: "exact", head: true }).eq("status", "em_andamento"),
        supabase.from("chamados").select("id", { count: "exact", head: true }).eq("status", "resolvido"),
        supabase.from("chamados").select("id", { count: "exact", head: true }).eq("sla_resolucao_violado", true),
      ]);
      return {
        abertos: abertos.count ?? 0,
        andamento: andamento.count ?? 0,
        resolvidos: resolvidos.count ?? 0,
        violados: violados.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Abertos", value: stats?.abertos ?? 0, icon: Ticket, color: "text-blue-600" },
    { label: "Em andamento", value: stats?.andamento ?? 0, icon: Clock, color: "text-amber-600" },
    { label: "Resolvidos", value: stats?.resolvidos ?? 0, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "SLA violado", value: stats?.violados ?? 0, icon: AlertTriangle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral dos chamados que você pode ver.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
