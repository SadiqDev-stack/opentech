import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/PublicPages";
export const Route = createFileRoute("/login")({ component: () => <AuthPage /> });
