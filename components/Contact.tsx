import type { SiteContent } from "@/types/content";

export function Contact({ contact }: { contact: SiteContent["contact"] }) {
  const phoneHref = contact.phone.replace(/\s+/g, "");
  return (
    <section id="contact" className="section-pad">
      <div className="wrap">
        <div className="box">
          <div>
            <p className="eyebrow">{contact.eyebrow}</p>
            <h2>{contact.title}</h2>
            <p className="addr">{contact.address}</p>
          </div>
          <div className="contact-actions">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="btn btn-solid">
                Écrire par email ↗
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${phoneHref}`} className="btn btn-outline">
                {contact.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
