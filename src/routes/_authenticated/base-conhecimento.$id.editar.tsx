import { createFileRoute } from "@tanstack/react-router";
import { EditorArtigo } from "@/components/base-conhecimento/EditorArtigo";

export const Route = createFileRoute("/_authenticated/base-conhecimento/$id/editar")({
  component: EditarPage,
});

function EditarPage() {
  const { id } = Route.useParams();
  return <EditorArtigo id={id} />;
}
