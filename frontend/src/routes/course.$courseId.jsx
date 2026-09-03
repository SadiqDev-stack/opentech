import { createFileRoute } from "@tanstack/react-router";
import { CoursePage } from "@/components/PublicPages";
export const Route = createFileRoute("/course/$courseId")({ component: CoursePage });
