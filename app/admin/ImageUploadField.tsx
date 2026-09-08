"use client";

import { useRef, useState } from "react";

/**
 * A URL text field plus a file picker that uploads straight to /api/upload
 * and fills the field with the resulting path — so a non-technical owner
 * can attach a photo without ever finding an image URL to paste. Pasting a
 * link still works too: the two are just two ways to fill the same string.
 */
export function ImageUploadField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Échec de l’envoi de l’image.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="efield">
      <label>{label}</label>
      <div className="image-field">
        {value ? (
          <div className="image-preview">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary external/user-uploaded URLs, not build-time known */}
            <img src={value} alt="" />
          </div>
        ) : null}
        <div className="image-field-controls">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… (ou choisis un fichier)" />
          <div className="image-field-actions">
            <button type="button" className="add-btn" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? "Envoi…" : "Choisir une image"}
            </button>
            {value ? (
              <button type="button" className="add-btn" onClick={() => onChange("")} disabled={uploading}>
                Retirer
              </button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>
      {error ? <p className="ehint ehint-error">{error}</p> : hint ? <p className="ehint">{hint}</p> : null}
    </div>
  );
}
