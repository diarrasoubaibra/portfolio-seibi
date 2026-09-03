import fs from "node:fs";
import path from "node:path";
import type { SiteContent } from "@/types/content";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");

/**
 * Reads the portfolio content from disk. Used by the public page (rendered
 * at build/request time from the file bundled in the deployment) and by the
 * admin dashboard's initial load.
 */
export function getContent(): SiteContent {
  const raw = fs.readFileSync(CONTENT_PATH, "utf-8");
  return JSON.parse(raw) as SiteContent;
}
