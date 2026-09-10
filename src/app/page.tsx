import ScrollFrameSequence from "@/components/ScrollFrameSequence";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      {/* 
        The entire portfolio experience (Hero, About, Stats, Work, CTA) 
        lives inside this single frame-aware canvas component.
        Everything is synchronized to the 240-frame sequence.
      */}
      <ScrollFrameSequence />

      {/* FOOTER - Appears after the scroll sequence finishes */}
      <Footer />
    </main>
  );
}
