import { getContent } from "@/lib/content";
import { AdminEditor } from "./AdminEditor";
import "./admin.css";

export default function AdminDashboardPage() {
  const content = getContent();
  return <AdminEditor initialContent={content} />;
}
