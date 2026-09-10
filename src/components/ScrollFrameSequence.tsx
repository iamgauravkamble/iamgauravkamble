"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaInstagram, FaLinkedin, FaEnvelope, FaWhatsapp, FaFacebook } from "react-icons/fa6";

// ─── Configuration ──────────────────────────────────────────────────────────
const FRAME_COUNT = 240;
const LAST_FRAME = FRAME_COUNT - 1;

const PIN_FRAME = 72;
const RESUME_FRAME = 73;

const PHASE1_VH = 250;
const PHASE2_VH = 1500;
const PHASE3_VH = 600;
const TOTAL_VH = PHASE1_VH + PHASE2_VH + PHASE3_VH;

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

  // ── Overlay Refs ──
  const p1ContainerRef = useRef<HTMLDivElement>(null);
  const p1EyebrowRef = useRef<HTMLDivElement>(null);
  const p1State1Ref = useRef<HTMLDivElement>(null);
  const p1State1H1Ref = useRef<HTMLHeadingElement>(null);
  const p1State1P1Ref = useRef<HTMLParagraphElement>(null);
  const p1State1P2Ref = useRef<HTMLParagraphElement>(null);
  const p1State2Ref = useRef<HTMLDivElement>(null);

  const p2InnerRef = useRef<HTMLDivElement>(null);
  const p2Ch1 = useRef<HTMLDivElement>(null);
  const p2Ch2 = useRef<HTMLDivElement>(null);
  const p2Ch3 = useRef<HTMLDivElement>(null);
  const p2Ch4 = useRef<HTMLDivElement>(null);
  const p2Stats = useRef<HTMLDivElement>(null);
  const p2Close = useRef<HTMLDivElement>(null);
  const p2AdsContainer = useRef<HTMLDivElement>(null);
  const p2AdsScroll = useRef<HTMLDivElement>(null);

  const p3StrategyRef = useRef<HTMLDivElement>(null);
  const p3S1 = useRef<HTMLDivElement>(null);
  const p3S2 = useRef<HTMLDivElement>(null);
  const p3S3 = useRef<HTMLDivElement>(null);

  const p3CasesRef = useRef<HTMLDivElement>(null);
  
  const p3PhoneCtaRef = useRef<HTMLDivElement>(null);
  const p3P1 = useRef<HTMLDivElement>(null);
  const p3P2 = useRef<HTMLDivElement>(null);

  const p3FinalCtaRef = useRef<HTMLDivElement>(null);

  // ── Draw frame onto canvas (cover-fit) ──
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

    let viewportH = window.innerHeight;
    let phase1Px = 0;
    let phase2Px = 0;
    let totalPx = 0;

    const computeBoundaries = () => {
      viewportH = window.innerHeight;
      phase1Px = (PHASE1_VH / 100) * viewportH;
      phase2Px = phase1Px + (PHASE2_VH / 100) * viewportH;
      totalPx = (TOTAL_VH / 100) * viewportH;
    };

    computeBoundaries();

    const getScrollTop = () => -section.getBoundingClientRect().top;

    // Phase 1: 0 -> phase1Px (Frames 0 -> 72)
    // Phase 2: phase1Px -> phase2Px (Frame 72, internal p2Progress 0 -> 1)
    // Phase 3: phase2Px -> totalPx - viewportH (Frames 73 -> 239)

    const draw = () => {
      const st = getScrollTop();
      
      let frameIndex = 0;
      let p2 = 0;
      let phase = 1;

      if (st < 0) {
        frameIndex = 0;
        phase = 1;
      } else if (st < phase1Px) {
        phase = 1;
        const p1Progress = st / phase1Px;
        frameIndex = Math.floor(p1Progress * PIN_FRAME);
      } else if (st < phase2Px) {
        phase = 2;
        frameIndex = PIN_FRAME;
        p2 = (st - phase1Px) / (phase2Px - phase1Px);
      } else {
        phase = 3;
        const scrollSpace = totalPx - phase2Px - viewportH;
        const p3Progress = clamp((st - phase2Px) / scrollSpace, 0, 1);
        frameIndex = RESUME_FRAME + Math.floor(p3Progress * (LAST_FRAME - RESUME_FRAME));
      }

      frameIndex = clamp(frameIndex, 0, LAST_FRAME);
      drawFrame(ctx, frameIndex, cssWidth, cssHeight);

      // --- APPLY ANIMATIONS BASED ON FRAME INDEX AND PHASE ---

      // Phase 1 elements (Frames 0 - 71)
      if (p1ContainerRef.current) {
        // Fade out the entire container smoothly at the end of Phase 1
        if (frameIndex > 65) {
          const t = clamp((frameIndex - 65) / 7, 0, 1);
          p1ContainerRef.current.style.opacity = String(1 - t);
        } else {
          p1ContainerRef.current.style.opacity = "1";
        }

        // Eyebrow label: 0 to 44 (Fades out before 45)
        if (p1EyebrowRef.current) {
          const end = 44;
          const outDuration = 6;
          if (frameIndex > end) {
            p1EyebrowRef.current.style.opacity = "0";
          } else if (frameIndex > end - outDuration) {
            const t = (frameIndex - (end - outDuration)) / outDuration;
            p1EyebrowRef.current.style.opacity = String(1 - t);
          } else {
            p1EyebrowRef.current.style.opacity = "1";
          }
        }
        
        // State 1: 0 to 23 (Visible on load, animate out on first scroll)
        if (p1State1Ref.current && p1State1H1Ref.current && p1State1P1Ref.current && p1State1P2Ref.current) {
          const end = 23;
          const outDuration = 6;
          
          if (frameIndex > end) {
             p1State1Ref.current.style.opacity = "0";
          } else if (frameIndex > end - outDuration) {
             const t = (frameIndex - (end - outDuration)) / outDuration;
             p1State1Ref.current.style.opacity = String(1 - t);
             
             // Break apart effect
             p1State1H1Ref.current.style.transform = `translateX(${t * 40}px) scale(${1 + 0.15 * t})`;
             p1State1H1Ref.current.style.filter = `blur(${t * 8}px)`;

             p1State1P1Ref.current.style.transform = `translate(${-t * 20}px, ${t * 20}px)`;
             p1State1P1Ref.current.style.filter = `blur(${t * 5}px)`;

             p1State1P2Ref.current.style.transform = `translate(${-t * 30}px, ${t * 40}px)`;
             p1State1P2Ref.current.style.filter = `blur(${t * 5}px)`;
          } else {
             // Fully visible immediately on frame 0
             p1State1Ref.current.style.opacity = "1";
             p1State1H1Ref.current.style.transform = "translateX(0) scale(1)";
             p1State1H1Ref.current.style.filter = "blur(0)";
             p1State1P1Ref.current.style.transform = "translate(0, 0)";
             p1State1P1Ref.current.style.filter = "blur(0)";
             p1State1P2Ref.current.style.transform = "translate(0, 0)";
             p1State1P2Ref.current.style.filter = "blur(0)";
          }
        }

        // State 2: 24 to 44 (Animate in on second scroll)
        if (p1State2Ref.current) {
          const start = 24;
          const end = 44;
          const inDuration = 6;
          const outDuration = 6;
          
          if (frameIndex < start) {
            p1State2Ref.current.style.opacity = "0";
            p1State2Ref.current.style.transform = "translateY(30px) scale(0.95)";
            p1State2Ref.current.style.filter = "blur(10px)";
          } else if (frameIndex < start + inDuration) {
            const t = (frameIndex - start) / inDuration;
            p1State2Ref.current.style.opacity = String(t);
            p1State2Ref.current.style.transform = `translateY(${(1 - t) * 30}px) scale(${0.95 + 0.05 * t})`;
            p1State2Ref.current.style.filter = `blur(${(1 - t) * 10}px)`;
          } else if (frameIndex > end - outDuration) {
            const t = (frameIndex - (end - outDuration)) / outDuration;
            p1State2Ref.current.style.opacity = String(1 - t);
            p1State2Ref.current.style.transform = `translateY(${-t * 30}px) scale(${1 + 0.05 * t})`;
            p1State2Ref.current.style.filter = `blur(${t * 10}px)`;
          } else {
            p1State2Ref.current.style.opacity = "1";
            p1State2Ref.current.style.transform = "translateY(0) scale(1)";
            p1State2Ref.current.style.filter = "blur(0)";
          }
        }
      }

      // Phase 2 elements (Pinned at Frame 72)
      // The glass panel slides in from the right during Phase 1 (Frames 48-71)
      if (p2InnerRef.current) {
        if (phase === 1) {
          if (frameIndex < 48) {
            p2InnerRef.current.style.transform = "translateX(100%)";
            p2InnerRef.current.style.opacity = "0";
          } else if (frameIndex <= 71) {
            const t = (frameIndex - 48) / (71 - 48);
            const easeOut = 1 - Math.pow(1 - t, 3);
            p2InnerRef.current.style.transform = `translateX(${(1 - easeOut) * 100}%)`;
            p2InnerRef.current.style.opacity = String(Math.min(1, t * 2));
          }
        } else if (phase === 2) {
          p2InnerRef.current.style.transform = "translateX(0%)";
          p2InnerRef.current.style.opacity = "1";
        } else {
          // Fade out slightly in phase 3 or keep hidden
          const scrollSpace = totalPx - phase2Px - viewportH;
          const p3Progress = clamp((st - phase2Px) / scrollSpace, 0, 1);
          p2InnerRef.current.style.opacity = p3Progress > 0.05 ? "0" : String(1 - (p3Progress / 0.05));
          p2InnerRef.current.style.transform = "translateX(0%)";
        }

        const setCh = (ref: any, start: number, end: number, currentProgress: number) => {
          if (!ref.current) return;
          if (currentProgress >= start && currentProgress <= end) {
            const fade = currentProgress < start + 0.05 ? (currentProgress - start) / 0.05 : currentProgress > end - 0.05 ? 1 - (currentProgress - (end - 0.05)) / 0.05 : 1;
            ref.current.style.opacity = String(fade);
            ref.current.style.transform = `translateY(${(1-fade)*30}px)`;
          } else {
            ref.current.style.opacity = "0";
            ref.current.style.transform = `translateY(30px)`;
          }
        };

        if (phase === 1) {
          setCh(p2Ch1, -1, 2, 0); // fully visible
          setCh(p2Ch2, 2, 2, 0);
          setCh(p2Ch3, 2, 2, 0);
          setCh(p2Ch4, 2, 2, 0);
          setCh(p2Stats, 2, 2, 0);
          setCh(p2Close, 2, 2, 0);
          if (p2AdsContainer.current) p2AdsContainer.current.style.opacity = "0";
        } else if (phase === 2) {
          setCh(p2Ch1, 0.00, 0.08, p2);
          setCh(p2Ch2, 0.08, 0.16, p2);
          setCh(p2Ch3, 0.16, 0.24, p2);
          setCh(p2Ch4, 0.24, 0.32, p2);
          setCh(p2Stats, 0.32, 0.45, p2);
          setCh(p2Close, 0.45, 0.55, p2);

          if (p2AdsContainer.current && p2AdsScroll.current) {
            const startAds = 0.55;
            const endAds = 1.0;
            if (p2 >= startAds && p2 <= endAds) {
              const localP2 = (p2 - startAds) / (endAds - startAds);
              // Fade in smoothly at the start
              p2AdsContainer.current.style.opacity = localP2 < 0.05 ? String(localP2 / 0.05) : "1";
              // Scroll effect inside frosted glass
              p2AdsScroll.current.style.transform = `translateY(-${localP2 * 75}%)`;
            } else {
              p2AdsContainer.current.style.opacity = "0";
            }
          }
        }
      }

      // Phase 3 elements (Frames 73 - 239)
      if (p3StrategyRef.current) {
        const setStrat = (ref: any, start: number, end: number) => {
          if (!ref.current) return;
          if (frameIndex >= start && frameIndex <= end) {
            const fade = frameIndex < start + 3 ? (frameIndex - start)/3 : frameIndex > end - 3 ? 1 - (frameIndex - (end-3))/3 : 1;
            ref.current.style.opacity = String(fade);
            ref.current.style.transform = `translateX(${(1-fade)*20}px)`;
          } else {
            ref.current.style.opacity = "0";
          }
        };
        setStrat(p3S1, 100, 110);
        setStrat(p3S2, 111, 121);
        setStrat(p3S3, 122, 132);
      }

      if (p3CasesRef.current) {
        const start = 133, end = 159;
        const visible = frameIndex >= start && frameIndex <= end;
        const fade = frameIndex < start + 5 ? (frameIndex - start)/5 : frameIndex > end - 5 ? 1 - (frameIndex - (end-5))/5 : 1;
        p3CasesRef.current.style.opacity = visible ? String(fade) : "0";
      }

      if (p3PhoneCtaRef.current) {
        const setPhone = (ref: any, start: number, end: number) => {
          if (!ref.current) return;
          if (frameIndex >= start && frameIndex <= end) {
            const fade = frameIndex < start + 2 ? (frameIndex - start)/2 : frameIndex > end - 2 ? 1 - (frameIndex - (end-2))/2 : 1;
            ref.current.style.opacity = String(fade);
          } else {
            ref.current.style.opacity = "0";
          }
        };
        setPhone(p3P1, 160, 167);
        setPhone(p3P2, 168, 175);
      }

      if (p3FinalCtaRef.current) {
        const start = 176, end = 239;
        const visible = frameIndex >= start && frameIndex <= end;
        const fade = frameIndex < start + 10 ? (frameIndex - start)/10 : 1;
        p3FinalCtaRef.current.style.opacity = visible ? String(fade) : "0";
        p3FinalCtaRef.current.style.pointerEvents = visible ? "auto" : "none";
      }
    };

    const onScroll = () => {
      if (!cancelled) {
        rafId = requestAnimationFrame(draw);
      }
    };

    const onResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = canvas.clientWidth;
      cssHeight = canvas.clientHeight;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      computeBoundaries();
      draw();
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

      await loadSingleFrame(PIN_FRAME);
      totalLoaded++;
      setLoadPercent(Math.round((totalLoaded / FRAME_COUNT) * 100));

      let nextIndex = 1;
      const worker = async () => {
        while (!cancelled && nextIndex < FRAME_COUNT) {
          const idx = nextIndex++;
          if (idx === PIN_FRAME) continue;
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

        {/* ══════════════════════════════════════════════════════════════
            PHASE 1: HERO & JOURNEY (0 - 71)
            ══════════════════════════════════════════════════════════════ */}
        <div className="hero-vignette" />

        <div ref={p1ContainerRef} className="frame-overlay fo-content fo-left will-change-transform z-10 pointer-events-none">
          <div ref={p1EyebrowRef} className="hero-eyebrow mb-8 will-change-transform">
            GAURAV KAMBLE / PERFORMANCE MARKETER
          </div>
          
          <div className="relative w-full h-[400px]">
             {/* State 1 */}
             <div ref={p1State1Ref} className="absolute inset-0 flex flex-col justify-start will-change-transform origin-left">
               <h1 ref={p1State1H1Ref} className="hero-h1 leading-[0.9] will-change-transform origin-left">
                 FIRST, I LEARNED<br/>HOW TO GET<br/><span className="accent">ATTENTION.</span>
               </h1>
               <p ref={p1State1P1Ref} className="font-body text-white/70 text-lg mt-8 max-w-md tracking-wide will-change-transform">
                 Started with content and social media.<br/>Stayed curious about what makes people stop.
               </p>
               <p ref={p1State1P2Ref} className="font-body text-white/40 text-xs tracking-[0.2em] mt-6 uppercase will-change-transform">
                 CONTENT × STRATEGY × PERFORMANCE
               </p>
             </div>

             {/* State 2 */}
             <div ref={p1State2Ref} className="absolute inset-0 flex flex-col justify-start will-change-transform origin-left" style={{opacity: 0}}>
               <h1 className="hero-h1 leading-[0.9]">
                 THEN I LEARNED<br/>HOW TO MAKE IT<br/><span className="accent">PAY.</span>
               </h1>
             </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            PHASE 2: PINNED ABOUT & STATS (72)
            ══════════════════════════════════════════════════════════════ */}
        <div ref={p2InnerRef} className="frame-overlay fo-right will-change-transform z-20 pointer-events-none">
          <div className="pinned-content-block pointer-events-auto">
            
            <div ref={p2Ch1} className="absolute inset-0 px-16 flex flex-col justify-center items-start text-left will-change-transform">
              <h2 className="pinned-h2">I DIDN&apos;T START<br />WITH ADS.</h2>
              <p className="pinned-p">I started with attention. As a Social Media Executive, I learned how brands communicate, create communities, and stop the scroll.</p>
            </div>

            <div ref={p2Ch2} className="absolute inset-0 px-16 flex flex-col justify-center items-start text-left will-change-transform">
              <h2 className="pinned-h2">BEYOND<br /><span className="text-white">CONTENT.</span></h2>
              <p className="pinned-p">As I grew into a Social Media Manager, strategy became the focus. It wasn&apos;t just about posting anymore—it was about positioning, campaigns, and presence.</p>
            </div>

            <div ref={p2Ch3} className="absolute inset-0 px-16 flex flex-col justify-center items-start text-left will-change-transform">
              <h2 className="pinned-h2">THEN I FOUND<br />THE NUMBERS.</h2>
              <p className="pinned-p">That led me to Performance Marketing. Today, I work across Google Ads and Meta Ads, turning creative ideas into data-driven outcomes and measurable ROAS.</p>
            </div>

            <div ref={p2Ch4} className="absolute inset-0 px-16 flex flex-col justify-center items-start text-left will-change-transform">
              <h2 className="pinned-h2">CREATE ATTENTION.<br />TURN IT INTO <span className="text-white">ACTION.</span></h2>
              <p className="pinned-p">For the last 4 years, I&apos;ve helped transform ideas into content, campaigns into conversations, and ad spend into real business growth.</p>
            </div>

            <div ref={p2Stats} className="absolute inset-0 px-16 flex flex-col justify-center items-start text-left will-change-transform">
              <h2 className="pinned-h2 text-2xl mb-12">THE METRICS BEHIND THE JOURNEY</h2>
              <div className="stat-container">
                <div className="stat-item"><span className="stat-num text-white">₹8L+</span><span className="stat-label">Monthly Ad Spend Managed</span></div>
                <div className="stat-item"><span className="stat-num">50+</span><span className="stat-label">Brands Managed</span></div>
                <div className="stat-item"><span className="stat-num">20K+</span><span className="stat-label">Content Pieces Delivered</span></div>
                <div className="stat-item"><span className="stat-num">20+</span><span className="stat-label">Ads Projects</span></div>
              </div>
            </div>

            <div ref={p2Close} className="absolute inset-0 px-16 flex flex-col justify-center items-start text-left will-change-transform">
              <h2 className="pinned-h2 text-[3.5rem] leading-[1.1] text-white">IDEAS ARE GOOD.<br />RESULTS ARE BETTER.</h2>
            </div>

            <div ref={p2AdsContainer} className="absolute inset-0 px-6 sm:px-12 py-10 flex flex-col justify-start items-start text-left will-change-transform overflow-hidden pointer-events-none">
              <div ref={p2AdsScroll} className="w-full flex flex-col gap-6 pt-[80vh] pb-[20vh] will-change-transform">
                
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2 leading-tight">
                  Footwear Brand —<br/><span className="text-accent">Google Ads Sales Campaign</span>
                </h3>
                
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
                  <h4 className="text-accent text-xs font-bold tracking-widest uppercase mb-6">Campaign Performance</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4">
                    <div><div className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Ad Spend</div><div className="text-white font-display text-xl sm:text-2xl font-bold">₹1,50,000</div></div>
                    <div><div className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Clicks</div><div className="text-white font-display text-xl sm:text-2xl font-bold">8,500</div></div>
                    <div><div className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Purchases</div><div className="text-white font-display text-xl sm:text-2xl font-bold">525</div></div>
                    <div><div className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Cost/Purchase</div><div className="text-white font-display text-xl sm:text-2xl font-bold">₹286</div></div>
                    <div><div className="text-white/50 text-[10px] uppercase tracking-widest mb-1">CPC</div><div className="text-white font-display text-xl sm:text-2xl font-bold">₹17.65</div></div>
                    <div><div className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Purchase Rate</div><div className="text-white font-display text-xl sm:text-2xl font-bold">6.18%</div></div>
                    <div><div className="text-white/50 text-[10px] uppercase tracking-widest mb-1">AOV</div><div className="text-white font-display text-xl sm:text-2xl font-bold">₹1,100</div></div>
                    <div className="col-span-2 sm:col-span-1"><div className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Revenue</div><div className="text-accent font-display text-xl sm:text-2xl font-bold">₹5,77,500</div></div>
                    <div><div className="text-white/50 text-[10px] uppercase tracking-widest mb-1">ROAS</div><div className="text-green-400 font-display text-xl sm:text-2xl font-bold">3.85×</div></div>
                  </div>
                </div>

                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
                  <h4 className="text-accent text-xs font-bold tracking-widest uppercase mb-4">Quick Calculation</h4>
                  <div className="flex flex-col gap-3 font-mono text-sm">
                    <div className="text-white/70 flex flex-wrap gap-2 items-center">
                      525 Purchases <span className="text-white/30">×</span> ₹1,100 AOV <span className="text-white/30">=</span> <span className="text-white font-bold text-base bg-white/10 px-2 py-1 rounded">₹5,77,500 Revenue</span>
                    </div>
                    <div className="text-white/70 flex flex-wrap gap-2 items-center">
                      ₹5,77,500 <span className="text-white/30">÷</span> ₹1,50,000 Ad Spend <span className="text-white/30">=</span> <span className="text-green-400 font-bold text-base bg-green-400/10 px-2 py-1 rounded">3.85× ROAS</span>
                    </div>
                  </div>
                </div>

                <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 mt-2 relative bg-[#1E1E1E]">
                  {/* Google Ads Result Image */}
                  <img 
                    src="/google-ads-result.png" 
                    alt="Google Ads Result" 
                    className="w-full h-auto object-cover border-b border-white/10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-48 flex items-center justify-center text-white/30 text-sm italic font-mono border-b border-white/10">
                    [Place your image as /public/google-ads-result.png]
                  </div>
                  
                  {/* Short Summary attached below the image */}
                  <div className="p-5 bg-gradient-to-b from-transparent to-black/40">
                    <h4 className="text-accent text-[10px] font-bold tracking-widest uppercase mb-2">Short Summary</h4>
                    <p className="text-white/80 leading-relaxed text-sm">
                      Generated <strong className="text-white">525 purchases</strong> with ₹1.5L ad spend, delivering <strong className="text-white">₹5.77L</strong> in estimated revenue at a <strong className="text-green-400">3.85× ROAS</strong> and ₹286 cost per purchase.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            PHASE 3: WORK & CTA (73 - 239)
            ══════════════════════════════════════════════════════════════ */}
        <div ref={p3StrategyRef} className="frame-overlay fo-content fo-top-left will-change-transform">
          <div ref={p3S1} className="absolute top-32 left-16 strategy-phrase">THE CREATIVE GETS THE CLICK.</div>
          <div ref={p3S2} className="absolute top-48 left-16 strategy-phrase">DATA GUIDES THE WAY.</div>
          <div ref={p3S3} className="absolute top-64 left-16 strategy-phrase accent">PERFORMANCE SCALES THE BUSINESS.</div>
        </div>

        <div ref={p3CasesRef} className="frame-overlay fo-content fo-top-left will-change-transform">
          <h3 className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-8">SELECTED CASE STUDIES</h3>
          <div className="case-study-compact">
            <div className="case-study-title">E-Commerce Scale-Up</div>
            <div className="case-study-desc">Meta Ads campaign restructuring resulting in 3x ROAS and 45% reduction in CPA for a luxury fashion brand.</div>
          </div>
          <div className="case-study-compact">
            <div className="case-study-title">B2B Lead Generation</div>
            <div className="case-study-desc">Google Ads Search & Performance Max strategy delivering 150+ highly qualified leads per month.</div>
          </div>
          <div className="case-study-compact">
            <div className="case-study-title">Social Community Growth</div>
            <div className="case-study-desc">Organic social strategy across 3 platforms driving 2M+ organic impressions and 15k new followers in 90 days.</div>
          </div>
        </div>

        <div ref={p3PhoneCtaRef} className="frame-overlay fo-content fo-left will-change-transform">
          <h2 ref={p3P1} className="cta-h2 absolute bottom-32 left-16">GOT A PROJECT<br />IN MIND?</h2>
          <h2 ref={p3P2} className="cta-h2 absolute bottom-32 left-16 accent">LET&apos;S TALK<br />ABOUT GROWTH.</h2>
        </div>

        <div ref={p3FinalCtaRef} className="frame-overlay fo-content fo-bottom pointer-auto will-change-transform">
          
          {/* Background text on the right */}
          <h2 
            className="absolute inset-y-0 right-8 md:right-24 flex flex-col items-end justify-center text-[8vw] sm:text-[6vw] leading-[0.85] font-display font-black text-white text-right uppercase tracking-tighter -z-10 select-none pointer-events-none" 
            style={{ 
              transform: 'translateZ(-100px)'
            }}
          >
            <span>READY</span>
            <span>WHEN</span>
            <span>YOU ARE</span>
          </h2>

          <div className="flex flex-row justify-center items-center gap-4 w-full max-w-full overflow-x-auto pb-4 no-scrollbar relative z-10">
            <a href="https://wa.me/917666401860" target="_blank" rel="noreferrer" className="glass-pill whitespace-nowrap">
              <FaWhatsapp size={18} />
              +91 7666401860
            </a>
            <a href="mailto:myselfgauravkamble@gmail.com" className="glass-pill whitespace-nowrap">
              <FaEnvelope size={18} />
              myselfgauravkamble@gmail.com
            </a>
            <a href="https://www.linkedin.com/in/gaurav-kamble-3b3851273/" target="_blank" rel="noreferrer" className="glass-pill whitespace-nowrap">
              <FaLinkedin size={18} />
              LinkedIn
            </a>
            <a href="https://www.instagram.com/iamgauravkamble/" target="_blank" rel="noreferrer" className="glass-pill whitespace-nowrap">
              <FaInstagram size={18} />
              Instagram
            </a>
            <a href="https://www.facebook.com/iamgauravkamble" target="_blank" rel="noreferrer" className="glass-pill whitespace-nowrap">
              <FaFacebook size={18} />
              Facebook
            </a>
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
