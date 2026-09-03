import { createFileRoute } from "@tanstack/react-router";
import { StorePage } from "@/components/PublicPages";
export const Route = createFileRoute("/store")({ component: StorePage });
