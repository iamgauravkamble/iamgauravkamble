"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaInstagram, FaLinkedin, FaEnvelope, FaWhatsapp, FaFacebook } from "react-icons/fa6";

// ─── Configuration ──────────────────────────────────────────────────────────
const FRAME_COUNT = 240;
const LAST_FRAME = FRAME_COUNT - 1;
const TOTAL_VH = 2500; // Increased for a smoother story pace over 240 frames

const framePath = (index: number): string =>
  `/frames/frame_${index.toString().padStart(6, "0")}.jpg`;

const LOAD_CONCURRENCY = 8;
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export default function ScrollFrameSequence() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef<boolean[]>(new Array(FRAME_COUNT).fill(false));

  const [loadPercent, setLoadPercent] = useState(0);
  const [ready, setReady] = useState(false);

  // ── REFS FOR STORY BLOCKS ──
  // Chapter 1: Portrait (0-80)
  const heroRef = useRef<HTMLDivElement>(null);
  const theBeginningRef = useRef<HTMLDivElement>(null);
  const startedWithAttentionRef = useRef<HTMLDivElement>(null);
  const managingBrandsRef = useRef<HTMLDivElement>(null);

  // Chapter 2: Laptop (85-165)
  const execToMarketerRef = useRef<HTMLDivElement>(null);
  const contentToConversionRef = useRef<HTMLDivElement>(null);
  const hardPartRef = useRef<HTMLDivElement>(null);
  const funnelRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const googleRef = useRef<HTMLDivElement>(null);
  const numbersRef = useRef<HTMLDivElement>(null);

  // Chapter 3: Phone (165-240)
  const enoughAboutMeRef = useRef<HTMLDivElement>(null);
  const caseStudyRef = useRef<HTMLDivElement>(null);
  const strategyRef = useRef<HTMLDivElement>(null);
  const campaignSystemRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const yearsLaterRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  // ── Draw frame onto canvas ──
  const drawFrame = useCallback(
    (ctx: CanvasRenderingContext2D, frameIndex: number, cssW: number, cssH: number) => {
      const loaded = loadedRef.current;
      let index = frameIndex;
      if (!loaded[index]) {
        for (let offset = 1; offset < FRAME_COUNT; offset++) {
          if (index - offset >= 0 && loaded[index - offset]) { index = index - offset; break; }
          if (index + offset < FRAME_COUNT && loaded[index + offset]) { index = index + offset; break; }
        }
        if (!loaded[index]) return;
      }

      const image = framesRef.current[index];
      if (!image || !cssW || !cssH) return;

      const scale = Math.max(cssW / image.naturalWidth, cssH / image.naturalHeight);
      const dw = image.naturalWidth * scale;
      const dh = image.naturalHeight * scale;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.drawImage(image, (cssW - dw) / 2, (cssH - dh) / 2, dw, dh);
    },
    []
  );

  // ── Animation Loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let cancelled = false;
    let rafId = 0;
    let cssWidth = 0;
    let cssHeight = 0;

    const onResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = canvas.clientWidth;
      cssHeight = canvas.clientHeight;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      const st = -section.getBoundingClientRect().top;
      const totalScroll = (TOTAL_VH / 100) * window.innerHeight - window.innerHeight;
      
      const progress = clamp(st / totalScroll, 0, 1);
      const frameIndex = clamp(Math.floor(progress * LAST_FRAME), 0, LAST_FRAME);
      
      drawFrame(ctx, frameIndex, cssWidth, cssHeight);

      // Helper function to animate story blocks
      // start: frame to begin fade in
      // in: duration of fade in
      // hold: duration to stay visible
      // out: duration of fade out
      const setStyles = (
        ref: React.RefObject<HTMLDivElement | null>, 
        start: number, fadeIn: number, hold: number, fadeOut: number, 
        inX = 0, inY = 20, outX = 0, outY = -20
      ) => {
        if (!ref.current) return;
        const fi = frameIndex;
        if (fi < start) {
          ref.current.style.opacity = "0";
          ref.current.style.transform = `translate(${inX}px, ${inY}px)`;
          ref.current.style.pointerEvents = "none";
        } else if (fi < start + fadeIn) {
          const t = (fi - start) / fadeIn;
          ref.current.style.opacity = String(t);
          ref.current.style.transform = `translate(${(1 - t) * inX}px, ${(1 - t) * inY}px)`;
          ref.current.style.pointerEvents = "none";
        } else if (fi <= start + fadeIn + hold) {
          ref.current.style.opacity = "1";
          ref.current.style.transform = `translate(0px, 0px)`;
          ref.current.style.pointerEvents = "auto";
        } else if (fi < start + fadeIn + hold + fadeOut) {
          const t = (fi - (start + fadeIn + hold)) / fadeOut;
          ref.current.style.opacity = String(1 - t);
          ref.current.style.transform = `translate(${t * outX}px, ${t * outY}px)`;
          ref.current.style.pointerEvents = "none";
        } else {
          ref.current.style.opacity = "0";
          ref.current.style.transform = `translate(${outX}px, ${outY}px)`;
          ref.current.style.pointerEvents = "none";
        }
      };

      // ── CHAPTER 1: PORTRAIT (0 - 80) ──
      setStyles(heroRef, 0, 0, 15, 10);
      setStyles(theBeginningRef, 25, 5, 10, 5, -60, 0, -60, 0); // left slide
      setStyles(startedWithAttentionRef, 45, 5, 10, 5, 60, 0, 60, 0); // right slide
      setStyles(managingBrandsRef, 65, 5, 10, 5, 60, 0, 60, 0); // right slide

      // ── CHAPTER 2: LAPTOP (85 - 165) ──
      setStyles(execToMarketerRef, 85, 2, 18, 5, 0, 0, -40, 0); // container fades in fast, stays put, slides left on exit
      setStyles(contentToConversionRef, 106, 3, 6, 3); // Slightly longer hold so it's not too fast
      setStyles(hardPartRef, 116, 3, 4, 3);
      setStyles(funnelRef, 126, 4, 16, 4);
      setStyles(metaRef, 126, 4, 5, 4);
      // Previous frame googleRef finishes at 149 (136 + 4 + 5 + 4)
      setStyles(googleRef, 136, 4, 5, 4);
      
      // Giant numbers stats grid (fades in right after Google Ads finishes)
      // Finishes at 165 (149 + 4 + 8 + 4)
      setStyles(numbersRef, 149, 4, 8, 4);

      // ── CHAPTER 3: PHONE (165 - 240) ──
      setStyles(enoughAboutMeRef, 165, 5, 10, 5);
      setStyles(caseStudyRef, 175, 10, 10, 5);
      setStyles(strategyRef, 195, 5, 10, 5);
      setStyles(campaignSystemRef, 205, 5, 10, 5);
      setStyles(metricsRef, 210, 5, 10, 5);
      setStyles(yearsLaterRef, 220, 5, 10, 5);
      
      // Final CTA stays visible till end of scroll (frame 240+)
      setStyles(finalCtaRef, 230, 5, 10, 0);

      // ── SEQUENTIAL INTERNAL ANIMATIONS ──

      // Timeline Steps (Chapter 2)
      document.querySelectorAll('.timeline-item').forEach((el, i) => {
        const start = 86 + i * 4;
        const e = el as HTMLElement;
        e.style.opacity = frameIndex >= start ? "1" : "0";
        e.style.transform = frameIndex >= start ? "translateX(0)" : "translateX(-20px)";
        e.style.transition = "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      });

      document.querySelectorAll('.timeline-line').forEach((el, i) => {
        const start = 86 + i * 4;
        const duration = 4;
        const e = el as HTMLElement;
        const progress = clamp((frameIndex - start) / duration, 0, 1);
        e.style.transform = `scaleY(${progress})`;
        e.style.transformOrigin = "top";
      });
      
      // Content Became Conversion
      document.querySelectorAll('.conv-word').forEach((el, i) => {
        const start = 100 + i * 2;
        const e = el as HTMLElement;
        e.style.opacity = frameIndex >= start ? "1" : "0";
        e.style.transform = frameIndex >= start ? "translateY(0)" : "translateY(10px)";
        e.style.transition = "all 0.3s ease-out";
      });

      // Funnel steps
      document.querySelectorAll('.funnel-step').forEach((el, i) => {
        const start = 126 + i * 1.5;
        const e = el as HTMLElement;
        e.style.opacity = frameIndex >= start ? "1" : "0";
        e.style.transform = frameIndex >= start ? "translateX(0)" : "translateX(-15px)";
        e.style.transition = "all 0.3s ease-out";
      });

      // Campaign System Steps
      document.querySelectorAll('.system-step').forEach((el, i) => {
        const start = 205 + i * 1.5;
        const e = el as HTMLElement;
        e.style.opacity = frameIndex >= start ? "1" : "0";
        e.style.transform = frameIndex >= start ? "translateY(0)" : "translateY(10px)";
        e.style.transition = "all 0.3s ease-out";
      });

      // Metrics Thinking
      document.querySelectorAll('.metric-step').forEach((el, i) => {
        const start = 210 + i * 1.5;
        const e = el as HTMLElement;
        e.style.opacity = frameIndex >= start ? "1" : "0";
        e.style.transform = frameIndex >= start ? "translateY(0)" : "translateY(10px)";
        e.style.transition = "all 0.3s ease-out";
      });
      
      // Case Study Inner Progress
      if (caseStudyRef.current) {
        const csProgress = clamp((frameIndex - 175) / 20, 0, 1);
        // We can drive the case study scroll based on csProgress 0 to 1
        const csScroll = caseStudyRef.current.querySelector('.cs-scroll') as HTMLElement;
        if (csScroll) {
          csScroll.style.transform = `translateY(-${csProgress * 150}vh)`;
        }
      }
    };

    const onScroll = () => {
      if (!cancelled) {
        rafId = requestAnimationFrame(draw);
      }
    };

    const loadSingleFrame = (index: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = framePath(index);
        const onDone = () => {
          loadedRef.current[index] = img.naturalWidth > 0;
          framesRef.current[index] = img;
          resolve();
        };
        if (img.complete) { onDone(); return; }
        img.onload = onDone;
        img.onerror = () => { framesRef.current[index] = img; resolve(); };
      });

    const preload = async () => {
      let totalLoaded = 0;
      await loadSingleFrame(0);
      if (cancelled) return;
      totalLoaded = 1;
      setLoadPercent(Math.round((totalLoaded / FRAME_COUNT) * 100));
      setReady(true);
      onResize();

      let nextIndex = 1;
      const worker = async () => {
        while (!cancelled && nextIndex < FRAME_COUNT) {
          const idx = nextIndex++;
          await loadSingleFrame(idx);
          totalLoaded++;
          setLoadPercent(Math.round((totalLoaded / FRAME_COUNT) * 100));
        }
      };

      await Promise.all(Array.from({ length: LOAD_CONCURRENCY }, () => worker()));
      if (!cancelled) draw();
    };

    onResize();
    onScroll();
    void preload();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [drawFrame]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black"
      style={{ height: `${TOTAL_VH}vh` }}
      aria-label="Scroll-driven portfolio experience"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block h-full w-full object-cover"
          aria-label="Frame animation canvas"
          role="img"
        />

        {/* Global Left Shadow Gradient */}
        <div className="absolute inset-0 w-[85%] md:w-[65%] bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none z-[5]" />

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER 1: PORTRAIT / ATTENTION (Frames 0-80)
            ══════════════════════════════════════════════════════════════ */}
        <div ref={heroRef} className="safe-left will-change-transform z-10">
          <div className="story-label">PERFORMANCE MARKETER | META ADS + GOOGLE ADS</div>
          <h1 className="story-h2">
            I DON&apos;T JUST RUN ADS.<br />
            <span className="accent">I BUILD THE SYSTEM</span><br />
            BEHIND THEM.
          </h1>
          <p className="story-p mb-8">
            4+ years turning clicks, searches and attention into leads, sales and measurable growth.
          </p>
          <div className="flex gap-4 pointer-auto">
            <a href="mailto:myselfgauravkamble@gmail.com" className="cta-btn">LET&apos;S TALK →</a>
          </div>
        </div>

        <div ref={theBeginningRef} className="safe-left will-change-transform z-10">
          <div className="story-label">THE BEGINNING</div>
          <h2 className="story-h2">I DIDN&apos;T START<br />WITH ADS.</h2>
        </div>

        <div ref={startedWithAttentionRef} className="safe-right will-change-transform z-10">
          <h2 className="story-h2">I STARTED WITH<br />ATTENTION.</h2>
          <p className="story-p">Social media taught me how brands communicate, how audiences behave and what makes people stop scrolling.</p>
        </div>

        <div ref={managingBrandsRef} className="safe-right will-change-transform z-10">
          <h2 className="story-h2 text-2xl md:text-4xl">THEN I STARTED<br />MANAGING BRANDS.</h2>
          <p className="story-p text-accent font-display text-3xl md:text-4xl tracking-widest font-bold mt-2 uppercase whitespace-nowrap">50+ brands as a Social Media Manager.</p>
          <div className="mt-8 font-display font-bold text-2xl md:text-3xl text-white/50 space-y-4">
            <div className="transition-all duration-300 hover:text-white hover:translate-x-2 hover:scale-105 origin-left cursor-default drop-shadow-sm hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">DIFFERENT BRANDS.</div>
            <div className="transition-all duration-300 hover:text-white hover:translate-x-2 hover:scale-105 origin-left cursor-default drop-shadow-sm hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">DIFFERENT AUDIENCES.</div>
            <div className="transition-all duration-300 hover:text-white hover:translate-x-2 hover:scale-105 origin-left cursor-default drop-shadow-sm hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">DIFFERENT PROBLEMS.</div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER 2: LAPTOP / EXECUTION (Frames 80-160)
            ══════════════════════════════════════════════════════════════ */}
        <div ref={execToMarketerRef} className="safe-left will-change-transform z-20 pointer-auto">
          <div className="relative w-full max-w-lg">
            
            <div className="relative z-10 space-y-0">
              
              {/* Point 1 */}
              <div className="flex gap-6 timeline-item group/item cursor-pointer transition-all duration-300 hover:scale-105 origin-left">
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center w-6 h-6 mt-1.5">
                    <div className="absolute inset-0 rounded-full bg-white/5 group-hover/item:bg-accent/20 group-hover/item:animate-ping transition-all duration-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/40 group-hover/item:bg-accent group-hover/item:shadow-[0_0_15px_rgba(232,80,28,1)] transition-all duration-300 relative z-10" />
                  </div>
                  <div className="relative w-[2px] h-20 bg-white/10 mt-1.5 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-accent shadow-[0_0_10px_rgba(232,80,28,1)] timeline-line transition-transform duration-75" />
                  </div>
                </div>
                <div className="pb-8 pt-1">
                  <div className="text-[11px] md:text-sm font-bold tracking-[0.2em] text-white/50 group-hover/item:text-accent transition-colors duration-300">SOCIAL MEDIA EXECUTIVE</div>
                  <h2 className="font-display font-bold text-3xl md:text-4xl text-white/70 group-hover/item:text-white mt-1 transition-colors duration-300 leading-[1.1] drop-shadow-sm group-hover/item:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">I LEARNED ATTENTION.</h2>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex gap-6 timeline-item group/item cursor-pointer transition-all duration-300 hover:scale-105 origin-left">
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center w-6 h-6 mt-1.5">
                    <div className="absolute inset-0 rounded-full bg-white/5 group-hover/item:bg-accent/20 group-hover/item:animate-ping transition-all duration-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/40 group-hover/item:bg-accent group-hover/item:shadow-[0_0_15px_rgba(232,80,28,1)] transition-all duration-300 relative z-10" />
                  </div>
                  <div className="relative w-[2px] h-20 bg-white/10 mt-1.5 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-accent shadow-[0_0_10px_rgba(232,80,28,1)] timeline-line transition-transform duration-75" />
                  </div>
                </div>
                <div className="pb-8 pt-1">
                  <div className="text-[11px] md:text-sm font-bold tracking-[0.2em] text-white/50 group-hover/item:text-accent transition-colors duration-300">SOCIAL MEDIA MANAGER</div>
                  <h2 className="font-display font-bold text-3xl md:text-4xl text-white/70 group-hover/item:text-white mt-1 transition-colors duration-300 leading-[1.1] drop-shadow-sm group-hover/item:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">I LEARNED RESPONSIBILITY.</h2>
                  <div className="text-[11px] md:text-xs font-bold tracking-widest text-white/40 group-hover/item:text-accent mt-3 transition-colors duration-300">50+ BRANDS</div>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex gap-6 timeline-item group/item cursor-pointer transition-all duration-300 hover:scale-105 origin-left">
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center w-6 h-6 mt-1.5">
                    <div className="absolute inset-0 rounded-full bg-white/5 group-hover/item:bg-accent/20 group-hover/item:animate-ping transition-all duration-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/40 group-hover/item:bg-accent group-hover/item:shadow-[0_0_15px_rgba(232,80,28,1)] transition-all duration-300 relative z-10" />
                  </div>
                </div>
                <div className="pt-1">
                  <div className="text-[11px] md:text-sm font-bold tracking-[0.2em] text-white/50 group-hover/item:text-accent transition-colors duration-300">PERFORMANCE MARKETER</div>
                  <h2 className="font-display font-bold text-3xl md:text-4xl text-white/70 group-hover/item:text-white mt-1 transition-colors duration-300 leading-[1.1] drop-shadow-sm group-hover/item:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">I LEARNED ACCOUNTABILITY.</h2>
                  <div className="text-[11px] md:text-xs font-bold tracking-widest text-white/40 group-hover/item:text-accent mt-3 transition-colors duration-300">20+ PERFORMANCE BRANDS</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* TRANSITION TEXT */}
        <div ref={contentToConversionRef} className="safe-center will-change-transform z-10 mt-[30vh]">
          <h2 className="story-h2 text-center text-2xl md:text-4xl lg:text-[2.75rem] flex flex-wrap justify-center gap-3">
            <span className="conv-word drop-shadow-md">THAT&apos;S WHEN</span>
            <span className="conv-word text-white/50 drop-shadow-md">CONTENT</span>
            <span className="conv-word drop-shadow-md">BECAME</span>
            <span className="conv-word accent drop-shadow-md">CONVERSION.</span>
          </h2>
        </div>

        <div ref={hardPartRef} className="safe-left will-change-transform z-10">
          <div className="-mt-24 md:-mt-40">
            <div className="story-label">PERFORMANCE MARKETING</div>
            <h2 className="story-h2">ANYONE CAN<br />LAUNCH AN AD.</h2>
            <p className="story-p text-2xl font-bold mt-4">THE HARD PART<br/>STARTS AFTER<br/>THE CLICK.</p>
          </div>
        </div>

        <div ref={funnelRef} className="safe-right will-change-transform z-10 pointer-auto">
          <div className="flex flex-col gap-4 items-end w-full">
            <div className="funnel-step ios-notification group cursor-default">
              <span className="font-display font-bold text-xl md:text-2xl text-white/60 group-hover:text-white transition-colors">ATTENTION</span>
              <span className="text-sm bg-white/10 rounded-full w-8 h-8 flex shrink-0 items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">↓</span>
            </div>
            <div className="funnel-step ios-notification group cursor-default">
              <span className="font-display font-bold text-xl md:text-2xl text-white/60 group-hover:text-white transition-colors">CLICK</span>
              <span className="text-sm bg-white/10 rounded-full w-8 h-8 flex shrink-0 items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">↓</span>
            </div>
            <div className="funnel-step ios-notification group cursor-default">
              <span className="font-display font-bold text-xl md:text-2xl text-white/60 group-hover:text-white transition-colors">LANDING PAGE</span>
              <span className="text-sm bg-white/10 rounded-full w-8 h-8 flex shrink-0 items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">↓</span>
            </div>
            <div className="funnel-step ios-notification group cursor-default">
              <span className="font-display font-bold text-xl md:text-2xl text-white/60 group-hover:text-white transition-colors">LEAD / PURCHASE</span>
              <span className="text-sm bg-white/10 rounded-full w-8 h-8 flex shrink-0 items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">↓</span>
            </div>
            <div className="funnel-step ios-notification group cursor-default" style={{ borderColor: 'rgba(232,80,28,0.3)' }}>
              <span className="font-display font-bold text-xl md:text-2xl text-accent group-hover:text-white transition-colors">REVENUE</span>
              <span className="text-lg bg-accent/20 text-accent rounded-full w-10 h-10 flex shrink-0 items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">$$</span>
            </div>
          </div>
        </div>

        <div ref={metaRef} className="safe-left will-change-transform z-10">
          <div className="-mt-16 md:-mt-24 pointer-events-auto">
            <h2 className="story-h2">META ADS</h2>
            <div className="story-label">DEMAND CREATION</div>
            <p className="story-p mb-8 font-bold">People aren&apos;t always looking for you.<br/>You create the reason to stop.</p>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm font-bold tracking-widest text-white/60 uppercase">
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Lead Generation</div>
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Sales</div>
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Retargeting</div>
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Creative Testing</div>
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Audience Strategy</div>
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Scaling</div>
            </div>
            <div className="mt-8 flex">
              <div className="cta-btn cursor-pointer">SEE RESULTS →</div>
            </div>
          </div>
        </div>

        <div ref={googleRef} className="safe-left will-change-transform z-10">
          <div className="-mt-16 md:-mt-24 pointer-events-auto">
            <h2 className="story-h2">GOOGLE ADS</h2>
            <div className="story-label">DEMAND CAPTURE</div>
            <p className="story-p mb-8 font-bold">People are already searching.<br/>You show up at the right moment.</p>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm font-bold tracking-widest text-white/60 uppercase">
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Search</div>
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Performance Max</div>
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Shopping</div>
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Call Campaigns</div>
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Keyword Strategy</div>
              <div className="flex items-center gap-2"><span className="text-accent text-xs">▹</span> Conversion Tracking</div>
            </div>
            <div className="mt-8 flex">
              <div className="cta-btn cursor-pointer">SEE RESULTS →</div>
            </div>
          </div>
        </div>

        <div ref={numbersRef} className="safe-center will-change-transform z-10 w-full h-full p-0 m-0 relative">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-8 md:p-24 gap-4">
            <div className="flex flex-col justify-center items-center">
              <div className="giant-number text-accent">4+</div>
              <div className="number-label">YEARS</div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="giant-number">50+</div>
              <div className="number-label">BRANDS MANAGED</div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="giant-number">20+</div>
              <div className="number-label">PERFORMANCE BRANDS</div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="giant-number text-accent">₹5L+</div>
              <div className="number-label">MONTHLY AD SPEND</div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER 3: PHONE / COMMUNICATION (Frames 160-240)
            ══════════════════════════════════════════════════════════════ */}
        <div ref={enoughAboutMeRef} className="safe-center will-change-transform z-10">
          <div className="story-label">REAL CAMPAIGNS</div>
          <h2 className="giant-number text-[8rem]">ENOUGH<br/>ABOUT ME.</h2>
          <h3 className="story-h2 mt-8 text-accent">LET&apos;S TALK<br/>ABOUT THE MONEY.</h3>
          <p className="story-p mt-4 font-bold">Real campaigns. Real decisions. Real outcomes.</p>
        </div>

        <div ref={caseStudyRef} className="absolute inset-0 overflow-hidden z-20 pointer-events-none">
          <div className="cs-scroll absolute top-full left-0 w-full flex flex-col pt-[50vh] pb-[50vh] will-change-transform pointer-auto">
            
            {/* Case Study Block */}
            <div className="w-full max-w-5xl mx-auto px-6 mb-32">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-16">
                  <div>
                    <div className="story-label">STEP 01</div>
                    <h2 className="story-h2 text-3xl">FOOTWEAR<br/>E-COMMERCE</h2>
                  </div>
                  <div>
                    <div className="story-label">THE PROBLEM</div>
                    <p className="story-p text-xl font-bold">Traffic was coming in.<br/>The numbers weren&apos;t adding up.</p>
                  </div>
                  <div>
                    <div className="story-label">THE RESULT</div>
                    <div className="space-y-6">
                      <div><div className="text-4xl font-display font-bold">525</div><div className="text-xs font-bold tracking-widest text-accent uppercase">Purchases</div></div>
                      <div><div className="text-4xl font-display font-bold">₹5.77L</div><div className="text-xs font-bold tracking-widest text-accent uppercase">Revenue</div></div>
                      <div><div className="text-5xl font-display font-bold text-green-400">3.85X</div><div className="text-xs font-bold tracking-widest text-green-400 uppercase">ROAS</div></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                    <img src="/google-ads-result.png" alt="Google Ads Proof" className="w-full rounded-xl" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                    <div className="hidden w-full h-64 flex items-center justify-center text-white/30 text-sm italic border border-dashed border-white/20 rounded-xl">
                      [google-ads-result.png]
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div ref={strategyRef} className="safe-center will-change-transform z-10">
          <h2 className="story-h2 text-5xl">THE AD<br/>ISN&apos;T ALWAYS<br/>THE PROBLEM.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            <div>
              <div className="story-label">OFFER</div>
              <p className="font-bold text-white/80">Is there a reason to buy?</p>
            </div>
            <div>
              <div className="story-label">MESSAGE</div>
              <p className="font-bold text-white/80">Is the value obvious?</p>
            </div>
            <div>
              <div className="story-label">TRAFFIC</div>
              <p className="font-bold text-white/80">Are we reaching the right people?</p>
            </div>
          </div>
          <div className="mt-16 text-2xl font-display font-bold text-accent uppercase">
            GOOD PERFORMANCE<br/>STARTS BEFORE<br/>ADS MANAGER.
          </div>
        </div>

        <div ref={campaignSystemRef} className="safe-left will-change-transform z-10">
          <h2 className="story-h2 text-3xl mb-12">BEFORE I SPEND ₹1...</h2>
          <div className="relative pl-8 border-l border-white/20 space-y-12">
            <div className="system-step relative">
              <div className="absolute w-3 h-3 bg-accent rounded-full -left-[38.5px] top-2"></div>
              <div className="story-label mb-1">01 UNDERSTAND</div>
              <div className="text-sm font-bold text-white/50">Business • Offer • Audience • Competition</div>
            </div>
            <div className="system-step relative">
              <div className="absolute w-3 h-3 bg-accent rounded-full -left-[38.5px] top-2"></div>
              <div className="story-label mb-1">02 BUILD</div>
              <div className="text-sm font-bold text-white/50">Tracking • Campaign structure • Creatives • Keywords</div>
            </div>
            <div className="system-step relative">
              <div className="absolute w-3 h-3 bg-accent rounded-full -left-[38.5px] top-2"></div>
              <div className="story-label mb-1">03 TEST</div>
              <div className="text-sm font-bold text-white/50">Creative • Audience • Copy • Intent</div>
            </div>
            <div className="system-step relative">
              <div className="absolute w-3 h-3 bg-accent rounded-full -left-[38.5px] top-2"></div>
              <div className="story-label mb-1">04 OPTIMIZE</div>
              <div className="text-sm font-bold text-white/50">Cut waste. Push winners.</div>
            </div>
            <div className="system-step relative">
              <div className="absolute w-3 h-3 bg-accent rounded-full -left-[38.5px] top-2"></div>
              <div className="story-label mb-1">05 SCALE</div>
              <div className="text-sm font-bold text-white/50">Only when the numbers make sense.</div>
            </div>
          </div>
        </div>

        <div ref={metricsRef} className="safe-right will-change-transform z-10 text-right">
          <h2 className="story-h2 text-3xl mb-12">I DON&apos;T OPTIMIZE<br/>FOR PRETTY<br/>DASHBOARDS.</h2>
          <div className="space-y-6">
            <div className="metric-step flex items-center justify-end gap-4"><span className="text-sm text-white/50 font-bold">Does the ad earn attention?</span> <span className="font-display font-bold text-2xl text-accent w-16 text-right">CTR</span></div>
            <div className="metric-step flex items-center justify-end gap-4"><span className="text-sm text-white/50 font-bold">Are we paying too much?</span> <span className="font-display font-bold text-2xl text-accent w-16 text-right">CPC</span></div>
            <div className="metric-step flex items-center justify-end gap-4"><span className="text-sm text-white/50 font-bold">Does traffic convert?</span> <span className="font-display font-bold text-2xl text-accent w-16 text-right">CVR</span></div>
            <div className="metric-step flex items-center justify-end gap-4"><span className="text-sm text-white/50 font-bold">What does one acquisition cost?</span> <span className="font-display font-bold text-2xl text-accent w-16 text-right">CPA</span></div>
            <div className="metric-step flex items-center justify-end gap-4"><span className="text-sm text-white/50 font-bold">Does the spend make money?</span> <span className="font-display font-bold text-2xl text-green-400 w-16 text-right">ROAS</span></div>
          </div>
        </div>

        <div ref={yearsLaterRef} className="safe-center will-change-transform z-10">
          <div className="story-label mb-12">4+ YEARS LATER</div>
          <div className="space-y-8 font-display font-bold text-3xl md:text-5xl uppercase tracking-tighter leading-none">
            <div className="text-white/30">I STARTED BY<br/>LEARNING HOW<br/>PEOPLE SCROLL.</div>
            <div className="text-white/60">I LEARNED<br/>WHY THEY CLICK.</div>
            <div className="text-white">NOW I FOCUS ON<br/>WHY THEY BUY.</div>
          </div>
          <div className="mt-16 flex flex-wrap justify-center gap-6 text-[10px] font-bold tracking-widest text-accent uppercase">
            <span>4+ Years</span> • <span>50+ Brands</span> • <span>20+ Perf Brands</span> • <span>₹5L+ Ad Spend</span>
          </div>
        </div>

        <div ref={finalCtaRef} className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center will-change-transform px-6">
          <div className="story-label text-white/50">SO...</div>
          <h2 className="giant-number text-[12vw] mb-4 text-center">WHAT ARE WE<br/>GROWING?</h2>
          <p className="story-p text-center mb-12">Have a product, service or business that needs better paid acquisition?</p>
          
          <div className="flex flex-wrap justify-center gap-4 pointer-auto">
            <a href="mailto:myselfgauravkamble@gmail.com" className="cta-btn">LET&apos;S TALK →</a>
            <a href="https://linkedin.com/in/gaurav-kamble-3b3851273/" target="_blank" rel="noreferrer" className="cta-btn">VIEW LINKEDIN →</a>
          </div>
        </div>

        {/* ── Loading / Progress ── */}
        <div className={`absolute inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ${ready ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <span className="font-body text-white/50 text-sm tracking-widest uppercase">
              Loading Experience {loadPercent}%
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
