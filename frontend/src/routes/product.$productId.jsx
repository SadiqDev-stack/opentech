import { createFileRoute } from "@tanstack/react-router";
import { ProductPage } from "@/components/PublicPages";
export const Route = createFileRoute("/product/$productId")({ component: ProductPage });
