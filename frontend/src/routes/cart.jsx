import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/components/PublicPages";
export const Route = createFileRoute("/cart")({ component: CartPage });
