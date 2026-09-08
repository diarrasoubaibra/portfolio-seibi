type PersistResult = {
  mode: "github" | "local";
  detail?: string;
};

export function isGithubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO);
}

function githubHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN as string}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function githubContentsUrl(repoPath: string): string {
  const owner = process.env.GITHUB_OWNER as string;
  const repo = process.env.GITHUB_REPO as string;
  return `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`;
}

async function getFileSha(repoPath: string): Promise<string> {
  const branch = process.env.GITHUB_BRANCH || "main";
  const res = await fetch(`${githubContentsUrl(repoPath)}?ref=${encodeURIComponent(branch)}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Impossible de lire ${repoPath} sur GitHub (${res.status}). Vérifie GITHUB_OWNER/GITHUB_REPO/GITHUB_BRANCH et les droits du token. ${body}`,
    );
  }
  const current = (await res.json()) as { sha?: string };
  if (!current.sha) {
    throw new Error(`Réponse GitHub inattendue : sha manquant pour ${repoPath}.`);
  }
  return current.sha;
}

/**
 * Creates or updates a single file in the GitHub repo via one commit. `sha`
 * is the current blob sha, required when overwriting a file that already
 * exists and forbidden (must be omitted) when creating a new one — callers
 * that always generate a fresh, unique path (e.g. uploaded images) never
 * need to pass it.
 */
async function commitFileToGithub(
  repoPath: string,
  content: Buffer,
  message: string,
  sha?: string,
): Promise<{ url?: string }> {
  const branch = process.env.GITHUB_BRANCH || "main";
  const putRes = await fetch(githubContentsUrl(repoPath), {
    method: "PUT",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: content.toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!putRes.ok) {
    const body = await putRes.text().catch(() => "");
    throw new Error(`Échec de la publication sur GitHub (${putRes.status}). ${body}`);
  }
  const result = (await putRes.json()) as { commit?: { html_url?: string } };
  return { url: result.commit?.html_url };
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
  const filePath = process.env.GITHUB_CONTENT_PATH || "data/content.json";
  const jsonString = JSON.stringify(content, null, 2) + "\n";

  if (isGithubConfigured()) {
    const sha = await getFileSha(filePath);
    const result = await commitFileToGithub(
      filePath,
      Buffer.from(jsonString, "utf-8"),
      "Mise à jour du contenu du portfolio depuis l’Atelier",
      sha,
    );
    return { mode: "github", detail: result.url };
  }

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const filePathOnDisk = path.join(process.cwd(), "data", "content.json");
  await fs.writeFile(filePathOnDisk, jsonString, "utf-8");
  return { mode: "local" };
}

/**
 * Saves an image uploaded from the Atelier, using the exact same
 * persistence strategy as persistContent (GitHub commit in production, disk
 * write locally) so images work the same way as every other piece of
 * content: no external storage service to configure. Each upload gets a
 * unique generated filename, so this is always a new file — never an
 * overwrite — which means the GitHub call never needs a prior blob sha.
 */
export async function persistUpload(fileName: string, content: Buffer): Promise<PersistResult & { url: string }> {
  const repoPath = `public/uploads/${fileName}`;
  const url = `/uploads/${fileName}`;

  if (isGithubConfigured()) {
    await commitFileToGithub(repoPath, content, `Ajout d’une image depuis l’Atelier (${fileName})`);
    return { mode: "github", url };
  }

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), content);
  return { mode: "local", url };
}
