import type { SiteContent } from "@/types/content";

export function Footer({ footer }: { footer: SiteContent["footer"] }) {
  return (
    <footer>
      <div className="wrap footer-row">
        <span>{footer.line1}</span>
        <span>{footer.line2}</span>
      </div>
    </footer>
  );
}
