import { createFileRoute } from "@tanstack/react-router";
import { EditorArtigo } from "@/components/base-conhecimento/EditorArtigo";

export const Route = createFileRoute("/_authenticated/base-conhecimento/novo")({
  component: () => <EditorArtigo />,
});
