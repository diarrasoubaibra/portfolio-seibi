#!/usr/bin/env node
// Génère un sel + un hash pour le mot de passe de l'Atelier (espace admin).
// Usage : npm run hash-password

import crypto from "node:crypto";
import readline from "node:readline";

function hidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // Best-effort masking; readline in Node doesn't support true password
    // masking without extra native bindings, so this stays simple.
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const password = await hidden("Mot de passe admin à hasher : ");

if (!password || password.trim().length < 8) {
  console.error("\nChoisis un mot de passe d'au moins 8 caractères.");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");

console.log("\nAjoute ces lignes à ton fichier .env.local, et dans les variables");
console.log("d'environnement de ton hébergeur (Vercel / Netlify) pour la prod :\n");
console.log(`ADMIN_PASSWORD_SALT=${salt}`);
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log("\nNe mets jamais le mot de passe en clair dans le code ou dans git.");
