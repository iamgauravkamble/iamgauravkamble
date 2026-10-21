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
  const [clickCount, setClickCount] = useState(0);

  const triggerShock = useCallback(() => {
    setClickCount((prev) => {
      if (prev >= 1) return prev;
      setTimeout(() => setClickCount(0), 4000);
      return 1;
    });
  }, []);

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
  const notificationsRef = useRef<HTMLDivElement>(null);
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
      setStyles(notificationsRef, 165, 5, 65, 5);
      
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

      // Notifications Popup Sequence (Stacking & Fading)
      document.querySelectorAll('.notif-popup').forEach((el, i) => {
        const start = 168 + i * 8; // Spread out even more (8 frames per popup)
        const e = el as HTMLElement;
        
        if (frameIndex < start) {
          e.style.opacity = "0";
          e.style.transform = "translateY(100px) scale(0.9)";
        } else if (frameIndex >= start && frameIndex < start + 8) {
          e.style.opacity = "1";
          e.style.transform = "translateY(0) scale(1)";
        } else if (frameIndex >= start + 8 && frameIndex < start + 16) {
          e.style.opacity = "0.85";
          e.style.transform = "translateY(-110px) scale(0.95)";
        } else if (frameIndex >= start + 16 && frameIndex < start + 24) {
          e.style.opacity = "0.4";
          e.style.transform = "translateY(-220px) scale(0.9)";
        } else if (frameIndex >= start + 24 && frameIndex < start + 32) {
          e.style.opacity = "0";
          e.style.transform = "translateY(-330px) scale(0.85)";
        } else {
          e.style.opacity = "0";
          e.style.transform = "translateY(-330px) scale(0.85)";
        }
        e.style.transition = "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease-in-out";
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

    let currentX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    let currentY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
    let targetX = currentX;
    let targetY = currentY;
    let cursorRafId = 0;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const updateCursor = () => {
      currentX = lerp(currentX, targetX, 0.1);
      currentY = lerp(currentY, targetY, 0.1);
      
      document.body.style.setProperty('--mouse-x', `${currentX}px`);
      document.body.style.setProperty('--mouse-y', `${currentY}px`);
      
      cursorRafId = requestAnimationFrame(updateCursor);
    };

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

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
    updateCursor();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(cursorRafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
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
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Top Left */}
            <div className="absolute top-[10%] lg:top-[15%] left-[5%] lg:left-[10%] flex flex-col gap-2 items-start">
              <div className="font-display font-bold text-7xl md:text-8xl lg:text-9xl leading-none tracking-tighter text-white drop-shadow-2xl">4+</div>
              <div className="number-label text-left mt-2">YEARS</div>
            </div>
            
            {/* Top Right */}
            <div className="absolute top-[10%] lg:top-[15%] right-[5%] lg:right-[10%] flex flex-col gap-2 items-end text-right">
              <div className="font-display font-bold text-7xl md:text-8xl lg:text-9xl leading-none tracking-tighter text-white drop-shadow-2xl">50+</div>
              <div className="number-label text-right mt-2">BRANDS<br />MANAGED</div>
            </div>
            
            {/* Bottom Left */}
            <div className="absolute bottom-[10%] lg:bottom-[15%] left-[5%] lg:left-[10%] flex flex-col gap-2 items-start">
              <div className="font-display font-bold text-7xl md:text-8xl lg:text-9xl leading-none tracking-tighter text-white drop-shadow-2xl">20+</div>
              <div className="number-label text-left mt-2">PERFORMANCE<br />BRANDS</div>
            </div>
            
            {/* Bottom Right */}
            <div className="absolute bottom-[10%] lg:bottom-[15%] right-[5%] lg:right-[10%] flex flex-col gap-2 items-end text-right">
              <div className="font-display font-bold text-7xl md:text-8xl lg:text-9xl leading-none tracking-tighter text-white drop-shadow-2xl">₹5L+</div>
              <div className="number-label text-right mt-2">MONTHLY<br />AD SPEND</div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CHAPTER 3: PHONE / COMMUNICATION (Frames 160-240)
            ══════════════════════════════════════════════════════════════ */}
        <div ref={enoughAboutMeRef} className="absolute inset-0 flex flex-col justify-center items-start pb-[20vh] pl-6 md:pl-[4vw] lg:pl-[6vw] will-change-transform z-10 text-left pointer-events-none">
          <div className="story-label mb-3">REAL CAMPAIGNS</div>
          <h2 className="font-display font-black text-5xl md:text-[5rem] lg:text-[6rem] leading-[0.85] tracking-tighter text-white/40 uppercase drop-shadow-2xl mix-blend-screen">ENOUGH<br/>ABOUT ME.</h2>
          <h3 className="font-display font-bold text-2xl md:text-4xl lg:text-[3rem] leading-[0.9] tracking-tight text-accent mt-4 drop-shadow-lg">LET&apos;S TALK<br/>ABOUT THE MONEY.</h3>
          <p className="font-body text-xs md:text-sm font-bold text-white/70 mt-6 tracking-widest uppercase">Real campaigns. Real decisions. Real outcomes.</p>
        </div>
          
        {/* Notifications on the right side */}
        <div ref={notificationsRef} className="absolute inset-0 pointer-events-none z-10 will-change-transform">
          <div className="absolute right-4 md:right-[6vw] top-1/2 -translate-y-1/2 w-[85vw] max-w-sm md:w-[26rem] h-32 hidden md:flex items-center justify-center">
            
            <div className="notif-popup absolute w-full opacity-0 bg-white/10 backdrop-blur-2xl border border-white/20 p-5 md:p-6 rounded-[2rem] flex items-center gap-5 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <div className="text-white font-bold text-base md:text-lg leading-tight">Payment Received</div>
                <div className="text-white/70 text-sm md:text-base mt-1 font-medium">₹24,500 via Stripe</div>
              </div>
            </div>
            
            <div className="notif-popup absolute w-full opacity-0 bg-white/10 backdrop-blur-2xl border border-white/20 p-5 md:p-6 rounded-[2rem] flex items-center gap-5 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <div>
                <div className="text-white font-bold text-base md:text-lg leading-tight">New Order #8921</div>
                <div className="text-white/70 text-sm md:text-base mt-1 font-medium">2 items • Just now</div>
              </div>
            </div>

            <div className="notif-popup absolute w-full opacity-0 bg-white/10 backdrop-blur-2xl border border-white/20 p-5 md:p-6 rounded-[2rem] flex items-center gap-5 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </div>
              <div>
                <div className="text-white font-bold text-base md:text-lg leading-tight">App Downloaded</div>
                <div className="text-white/70 text-sm md:text-base mt-1 font-medium">iOS • New User</div>
              </div>
            </div>

            <div className="notif-popup absolute w-full opacity-0 bg-white/10 backdrop-blur-2xl border border-white/20 p-5 md:p-6 rounded-[2rem] flex items-center gap-5 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </div>
              <div>
                <div className="text-white font-bold text-base md:text-lg leading-tight">Membership Upgraded</div>
                <div className="text-white/70 text-sm md:text-base mt-1 font-medium">Pro Annual Plan</div>
              </div>
            </div>

            <div className="notif-popup absolute w-full opacity-0 bg-white/10 backdrop-blur-2xl border border-white/20 p-5 md:p-6 rounded-[2rem] flex items-center gap-5 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <div>
                <div className="text-white font-bold text-base md:text-lg leading-tight">New Order #8922</div>
                <div className="text-white/70 text-sm md:text-base mt-1 font-medium">1 item • Just now</div>
              </div>
            </div>
            
            <div className="notif-popup absolute w-full opacity-0 bg-white/10 backdrop-blur-2xl border border-white/20 p-5 md:p-6 rounded-[2rem] flex items-center gap-5 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <div className="text-white font-bold text-base md:text-lg leading-tight">Payment Received</div>
                <div className="text-white/70 text-sm md:text-base mt-1 font-medium">₹12,000 via UPI</div>
              </div>
            </div>

          </div>
        </div>

        <div ref={campaignSystemRef} className="hidden" />
        <div ref={metricsRef} className="hidden" />

        <div ref={yearsLaterRef} className="hidden" />

        <div ref={finalCtaRef} className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center will-change-transform px-6 pointer-events-auto">
          <div className="story-label text-white/50">SO...</div>
          <h2 className="giant-number text-[12vw] mb-4 text-center cursor-default transition-transform duration-1000 hover:scale-[1.03]">
            <span className="text-spotlight">WHAT ARE WE<br/>GROWING</span><span onClick={triggerShock} className={`text-spotlight inline-block cursor-pointer relative z-10 ${clickCount === 1 ? 'fall-down-animation' : ''}`}>?</span>
          </h2>
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
