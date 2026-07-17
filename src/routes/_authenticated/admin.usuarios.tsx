import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id);
    if (!(data ?? []).some((r) => r.role === "admin")) throw redirect({ to: "/dashboard" });
  },
  component: AdminUsuariosPage,
});

const ROLES = [
  { v: "colaborador", l: "Colaborador" },
  { v: "atendente", l: "Atendente" },
  { v: "gestor", l: "Gestor" },
  { v: "admin", l: "Admin" },
] as const;

function AdminUsuariosPage() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id,nome,email,departamento,ativo").order("nome"),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      const byUser = new Map<string, string[]>();
      (roles ?? []).forEach((r: any) => {
        const arr = byUser.get(r.user_id) ?? [];
        arr.push(r.role);
        byUser.set(r.user_id, arr);
      });
      return (profiles ?? []).map((p: any) => ({ ...p, roles: byUser.get(p.id) ?? [] }));
    },
  });

  const toggleRole = useMutation({
    mutationFn: async ({ userId, role, add }: { userId: string; role: string; add: boolean }) => {
      if (add) {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any } as never);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Papéis atualizados"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("profiles").update({ ativo } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = users.filter((u: any) => {
    const q = busca.toLowerCase();
    return !q || u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.departamento?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Usuários e permissões</h1>
      </div>

      <Card>
        <CardContent className="p-3">
          <Input placeholder="Buscar por nome, e-mail ou departamento…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Colaboradores ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6 text-center text-sm text-muted-foreground">Carregando…</div> : (
            <div className="divide-y">
              {filtered.map((u: any) => (
                <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="min-w-[220px]">
                    <div className="font-medium">{u.nome ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.email}{u.departamento && ` · ${u.departamento}`}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {ROLES.map((r) => {
                      const has = u.roles.includes(r.v);
                      return (
                        <Badge
                          key={r.v}
                          variant={has ? "default" : "outline"}
                          className="cursor-pointer select-none"
                          onClick={() => toggleRole.mutate({ userId: u.id, role: r.v, add: !has })}
                        >
                          <Shield className="mr-1 h-3 w-3" />{r.l}
                        </Badge>
                      );
                    })}
                    <Button size="sm" variant={u.ativo ? "outline" : "secondary"}
                      onClick={() => toggleAtivo.mutate({ id: u.id, ativo: !u.ativo })}>
                      {u.ativo ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Nenhum usuário encontrado.</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
