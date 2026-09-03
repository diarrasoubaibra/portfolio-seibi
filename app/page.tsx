import { getContent } from "@/lib/content";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Expertise } from "@/components/Expertise";
import { Missions } from "@/components/Missions";
import { MediaSection } from "@/components/MediaSection";
import { Timeline } from "@/components/Timeline";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  const content = getContent();

  return (
    <>
      <Header brand={content.brand} />
      <main id="top">
        <Hero hero={content.hero} />
        <Expertise expertise={content.expertise} />
        <Missions missionsIntro={content.missionsIntro} missions={content.missions} />
        <MediaSection media={content.media} />
        <Timeline parcours={content.parcours} />
        <Contact contact={content.contact} />
      </main>
      <Footer footer={content.footer} />
    </>
  );
}
