import { createFileRoute } from "@tanstack/react-router";
import { AcademyPage } from "@/components/PublicPages";
export const Route = createFileRoute("/academy")({ component: AcademyPage });
