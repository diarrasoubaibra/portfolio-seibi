import type { CustomSection } from "@/types/content";

function CustomSectionBlock({ section, alt }: { section: CustomSection; alt: boolean }) {
  return (
    <section id={`bloc-${section.id}`} className={`custom-section section-pad${alt ? " alt" : ""}`}>
      <div className="wrap custom-section-inner">
        {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
        <h2>{section.title}</h2>

        {section.type === "text" && section.text ? <p className="custom-text">{section.text}</p> : null}

        {section.type === "quote" && section.quote ? (
          <blockquote className="custom-quote">
            <p>{section.quote}</p>
            {section.quoteAuthor ? <cite>{section.quoteAuthor}</cite> : null}
          </blockquote>
        ) : null}

        {section.type === "list" && section.items && section.items.length > 0 ? (
          <div className="custom-list">
            {section.items.map((item, i) => (
              <div className="custom-list-item" key={i}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        ) : null}

        {section.type === "gallery" && section.images && section.images.length > 0 ? (
          <div className="custom-gallery">
            {section.images.map((image, i) => (
              <figure className="custom-gallery-item" key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element -- owner-supplied / uploaded URLs */}
                <img src={image.url} alt={image.caption || section.title} />
                {image.caption ? <figcaption>{image.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Renders the owner's freely added sections, in the order they were placed
 * from the Atelier. Always inserted at one fixed point in the page (after
 * Parcours, before Contact) — sections can be reordered among themselves,
 * but not interleaved with the built-in ones, to keep the page's structure
 * predictable to reason about and to style consistently.
 */
export function CustomSections({ sections }: { sections: CustomSection[] }) {
  const visible = sections.filter((section) => section.enabled);
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((section, i) => (
        <CustomSectionBlock section={section} alt={i % 2 === 1} key={section.id} />
      ))}
    </>
  );
}
