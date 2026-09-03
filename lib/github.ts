type GithubCommitResult = {
  committed: boolean;
  url?: string;
};

type PersistResult = {
  mode: "github" | "local";
  detail?: string;
};

function isGithubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO);
}

async function commitContentToGithub(content: unknown): Promise<GithubCommitResult> {
  const token = process.env.GITHUB_TOKEN as string;
  const owner = process.env.GITHUB_OWNER as string;
  const repo = process.env.GITHUB_REPO as string;
  const branch = process.env.GITHUB_BRANCH || "main";
  const filePath = process.env.GITHUB_CONTENT_PATH || "data/content.json";

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // GitHub's "update file" endpoint requires the current file's blob sha.
  const currentRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers, cache: "no-store" });
  if (!currentRes.ok) {
    const body = await currentRes.text().catch(() => "");
    throw new Error(
      `Impossible de lire ${filePath} sur GitHub (${currentRes.status}). Vérifie GITHUB_OWNER/GITHUB_REPO/GITHUB_BRANCH et les droits du token. ${body}`,
    );
  }
  const current = (await currentRes.json()) as { sha?: string };
  if (!current.sha) {
    throw new Error(`Réponse GitHub inattendue : sha manquant pour ${filePath}.`);
  }

  const jsonString = JSON.stringify(content, null, 2) + "\n";
  const base64Content =
    typeof Buffer !== "undefined"
      ? Buffer.from(jsonString, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(jsonString)));

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Mise à jour du contenu du portfolio depuis l’Atelier",
      content: base64Content,
      sha: current.sha,
      branch,
    }),
  });
  if (!putRes.ok) {
    const body = await putRes.text().catch(() => "");
    throw new Error(`Échec de la publication sur GitHub (${putRes.status}). ${body}`);
  }
  const result = (await putRes.json()) as { commit?: { html_url?: string } };
  return { committed: true, url: result.commit?.html_url };
}

/**
 * Saves updated portfolio content.
 *
 * In production (Vercel/Netlify), the deployed filesystem is read-only and
 * not persistent between requests, so saving means committing the new
 * data/content.json straight to the GitHub repository via the GitHub API —
 * which the hosting platform then picks up automatically and redeploys.
 * This requires GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO to be set.
 *
 * When those are not set (typically local development with `npm run dev`),
 * this falls back to writing the file directly to disk for a fast local
 * edit/save loop. That branch will throw on most serverless hosts if the
 * GitHub env vars are missing — which is intentional: it surfaces the
 * misconfiguration instead of silently discarding an editor's changes.
 */
export async function persistContent(content: unknown): Promise<PersistResult> {
  if (isGithubConfigured()) {
    const result = await commitContentToGithub(content);
    return { mode: "github", detail: result.url };
  }

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const filePath = path.join(process.cwd(), "data", "content.json");
  await fs.writeFile(filePath, JSON.stringify(content, null, 2) + "\n", "utf-8");
  return { mode: "local" };
}
