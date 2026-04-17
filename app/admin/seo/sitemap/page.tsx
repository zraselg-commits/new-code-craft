import { redirect } from "next/navigation";

// Redirect /admin/seo to the page editor
export default function SeoIndexRedirect() {
  redirect("/admin/seo");
}
