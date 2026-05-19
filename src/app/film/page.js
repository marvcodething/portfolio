"use client";
import Image from 'next/image';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import deadspace from "@/assets/deadspace.png";
import djshot from "@/assets/djshot.jpg";
import iformeshot from "@/assets/iforme.png"
import introShot from "@/assets/introShot.png"
import { IconHome } from "@tabler/icons-react";
import { motion, AnimatePresence, animate } from "framer-motion";
import itigShot from "@/assets/poster1.png"
import grasnShot from "@/assets/litstill.jpg"
const CATEGORIES = ["short films", "cinematography", "documentary", "video essays"];
import progShot from "@/assets/still.jpg"
import frontShot from "@/assets/fronthand.png"
import whichShot from "@/assets/whichOne.png"
import linkedShot from "@/assets/linkedin.png"
import stompShot from "@/assets/stompShot.jpg"
import wacShot from "@/assets/thumb.jpg"
import sylvanShot from "@/assets/SylvanTheatreChildren.jpg"
import kShot from "@/assets/2k.jpg"
import lizardShot from "@/assets/lizardsShot.png"
import storyShot from "@/assets/storyShot.png"

const films = [
  // 2026
  { id: 0,  title: "Lizards",                                        category: "short films",    description: "Director/Writer/Editor, a film about a guy who is tasked with delivering a sandwich to his boss, who happens to be a lizard. It's not about that.", image: lizardShot,       link: "https://drive.google.com/file/d/1lT1smAed3m_iR0_LiOgCR3WfojXtjDKH/view?usp=sharing" },
  { id: 1,  title: "I think I'm good.",                              category: "short films",    description: "Director/Writer/DP/Editor, a film about a man going through a new form of cyber-therapy.", image: itigShot,   link: "https://youtu.be/7_viGMnGqSY" },
  { id: 2,  title: "Girl Realllllly Appreciates The Social Network", shortTitle: "GRASN", category: "short films",    description: "Director/DP/Editor, a film about a girl who is really into this one scene from 'The Social Network'.", image: grasnShot,  link: "https://drive.google.com/file/d/1Kg2Tc8FriCCvnyaMr5M7qeakC7C81bYS/view?usp=sharing" },
  { id: 3,  title: "I for Me",                                       category: "video essays",   description: "Video Essay on the films 'Mulholland Drive', 'Vertigo', and 'Possession'.", image: iformeshot, link: "https://drive.google.com/file/d/1CcSGrBQllNejEwYNqBPmHsPC8uYyjK-L/view?usp=sharing" },
  { id: 4,  title: "Fronthand",                                      category: "cinematography", description: "DP, a man messes up his first gig.", image: frontShot,  link: "https://www.youtube.com/watch?v=7zM0jfA3de8" },
  { id: 5,  title: "'Which One' Dance Visual",                       category: "cinematography", description: "DP/AD/Editor", image: whichShot,  link: "https://www.youtube.com/watch?v=B4xyujRcn_g&list=PL2ipmfzCnaiVhGSL4aHDLI1Dqx0-8PkHB&index=1" },
  // 2025
  { id: 6,  title: "LinkedIn Sucks.",                                category: "video essays",   description: "A theoretical dismantling of LinkedIn.", image: linkedShot, link: "https://vimeo.com/1141959282?share=copy&fl=sv&fe=ci" },
  { id: 7,  title: "On the Sylvan Theatre",                          category: "video essays",   description: "About The Sylvan Theatre in Eagle Rock, Los Angeles.", image: sylvanShot, link: "https://drive.google.com/file/d/13XkZVlpDddVSa_CAL7qF71WlNhUkoT9W/view?usp=drive_link" },
  { id: 8,  title: "Untitled Character Intro",                       category: "short films",    description: "Proof of concept character introduction for a character that never existed.", image: introShot,  link: "https://drive.google.com/file/d/1vLnbZ3SpZ5cNhHbBGjhxH5cwNIZiGiv8/view?usp=sharing" },
  { id: 9,  title: "Situationship Story",                            category: "short films",    description: "A modern day marriage story!", image: storyShot,       link: "https://vimeo.com/1132219275" },
  { id: 10, title: "The Wacumentary",                                category: "documentary",    description: "Documentary about the Occidental College Women's Ultimate Frisbee Team.", image: wacShot,    link: "https://vimeo.com/1123339978?share=copy&fl=sv&fe=ci" },
  // 2024
  { id: 11, title: "NBA 2K and the 'Black Experience'",              category: "video essays",   description: "A video essay on neo-minstrelsy and NBA 2K.", image: kShot,      link: "https://drive.google.com/file/d/1X9PeIMATPpNAjHdT1W3a9bZd7Pi8QJ1X/view?usp=sharing" },
  { id: 12, title: "Stomping Ground",                                category: "documentary",    description: "Interactive documentary on dorm life at Occidental College.", image: stompShot,  link: "stomping.site" },
  { id: 13, title: "I Learned How to DJ In A Week",                  category: "documentary",    description: "Short clips of me yapping about DJing, and how I learned how to DJ in a week.", image: djshot,    link: "https://youtu.be/DoEjtSyfHEg" },
  { id: 14, title: "Dead Space?",                                    category: "documentary",    description: "Observational documentary centered upon Sycamore Glen on the Occidental College campus. By Marvin Romero and Sloan Whitliff.", image: deadspace, link: "https://youtu.be/5yD2cbRI6a4" },
  // undated
  { id: 15, title: "Progression",                                    category: "short films",    description: "Director/DP/Editor, a film about a band grieving after the death of their lead singer.", image: progShot,  link: "https://drive.google.com/file/d/1VaAy7aEPCKagTJbcgrI7VydMVMKdbvw9/view?usp=sharing" },
];

const SLOT_ANGLE = 22;
const RADIUS = 140;

function mod(n, m) {
  return ((n % m) + m) % m;
}

const FilmPage = () => {
  const [offset, setOffset] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const offsetRef = useRef(0);
  const dialRef = useRef(null);
  const dragRef = useRef(null);
  const snapTimerRef = useRef(null);
  const animRef = useRef(null);

  const filteredFilms = activeFilter
    ? films.filter(f => f.category === activeFilter)
    : films;

  const activeIndex = filteredFilms.length > 0
    ? mod(Math.round(offset), filteredFilms.length)
    : 0;

  const setOffsetSync = useCallback((val) => {
    offsetRef.current = val;
    setOffset(val);
  }, []);

  // Reset dial to top whenever filter changes
  useEffect(() => {
    if (animRef.current) animRef.current.stop();
    setOffsetSync(0);
  }, [activeFilter, setOffsetSync]);

  const scheduleSnap = useCallback(() => {
    clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(() => {
      const current = offsetRef.current;
      const target = Math.round(current);
      if (animRef.current) animRef.current.stop();
      animRef.current = animate(current, target, {
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1],
        onUpdate: (val) => setOffsetSync(val),
      });
    }, 100);
  }, [setOffsetSync]);

  useEffect(() => {
    const el = dialRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      if (animRef.current) animRef.current.stop();
      setHasScrolled(true);
      setOffsetSync(offsetRef.current + e.deltaY * 0.008);
      scheduleSnap();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setOffsetSync, scheduleSnap]);

  const handlePointerDown = (e) => {
    if (animRef.current) animRef.current.stop();
    clearTimeout(snapTimerRef.current);
    setHasScrolled(true);
    dragRef.current = { startY: e.clientY, startOffset: offsetRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const next = dragRef.current.startOffset - (e.clientY - dragRef.current.startY) * 0.015;
    setOffsetSync(next);
  };

  const handlePointerUp = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    scheduleSnap();
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const dialWidth = isMobile ? 260 : 320;
  const dialHeight = isMobile ? 200 : 280;

  const slots = [];
  if (filteredFilms.length > 0) {
    for (let i = Math.floor(offset) - 4; i <= Math.ceil(offset) + 4; i++) {
      const itemIndex = mod(i, filteredFilms.length);
      const visualOffset = i - offset;
      const angleDeg = visualOffset * SLOT_ANGLE;
      const angleRad = angleDeg * Math.PI / 180;
      const y = Math.sin(angleRad) * RADIUS;
      const opacity = Math.max(0, Math.cos(angleRad));
      const fontSize = (0.65 + 0.35 * opacity) * 1.05;
      slots.push({ i, itemIndex, y, angleDeg, opacity, fontSize });
    }
  }

  return (
    <div className="bg-stone-50 h-dvh overflow-hidden">
      {/* Preload all film images */}
      <div aria-hidden className="absolute w-0 h-0 overflow-hidden pointer-events-none">
        {films.filter(f => f.image).map(f => (
          <Image key={f.id} src={f.image} alt="" width={1} height={1} priority />
        ))}
      </div>
      {/* Navbar — desktop only */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200"
      >
        <div className="flex items-center justify-center px-6 py-4">
          <motion.a
            href="/"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-stone-100 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] relative"
          >
            <IconHome className="h-4 w-4" />
            <span className="text-sm font-medium font-futura tracking-wide">Home</span>
          </motion.a>
        </div>
      </motion.div>


      {/* Full-screen layout */}
      <div className="h-dvh md:pt-16 flex flex-col-reverse md:flex-row overflow-hidden">

        {/* Dial sidebar */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0 flex flex-col items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-0"
        >
          {/* Scroll hint */}
          <div className="h-5 flex items-center justify-center">
            <AnimatePresence>
              {!hasScrolled && (
                <motion.p
                  key="hint"
                  className="text-[10px] font-futura text-orange-400 uppercase tracking-widest"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    filter: [
                      'drop-shadow(0 0 0px rgba(249,115,22,0))',
                      'drop-shadow(0 0 7px rgba(249,115,22,0.95))',
                      'drop-shadow(0 0 0px rgba(249,115,22,0))',
                    ],
                  }}
                  exit={{ opacity: 0, transition: { duration: 0.45 } }}
                  transition={{
                    opacity: { duration: 0.7, ease: 'easeOut' },
                    filter: {
                      duration: 1.6,
                      repeat: Infinity,
                      repeatDelay: 0.9,
                      ease: 'easeInOut',
                      delay: 0.9,
                    },
                  }}
                >
                  scroll to browse
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Dial */}
          <div className="relative">
            {/* Orange triangle pointer */}
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderLeft: '11px solid #f97316',
              }}
            />
            {/* Pointer lines */}
            <div className="absolute inset-x-0 z-10 pointer-events-none" style={{ top: 'calc(50% - 20px)' }}>
              <div className="" />
            </div>
            <div className="absolute inset-x-0 z-10 pointer-events-none" style={{ top: 'calc(50% + 20px)' }}>
              <div className="" />
            </div>

            <div
              ref={dialRef}
              className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
              style={{ width: dialWidth, height: dialHeight, perspective: '500px', touchAction: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Glow behind active slot */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="rounded-full bg-orange-400 blur-2xl opacity-20"
                  style={{ width: dialWidth - 30, height: 28 }}
                />
              </div>
              {/* Items */}
              <div className="absolute inset-0 flex items-center justify-center">
                {slots.map(({ i, itemIndex, y, angleDeg, opacity, fontSize }) => (
                  <div
                    key={i}
                    className="absolute w-full overflow-hidden text-center px-4"
                    style={{
                      transform: `translateY(${y}px) rotateX(${-angleDeg}deg)`,
                      opacity,
                    }}
                  >
                    <span
                      className="font-abominable uppercase tracking-wider text-stone-900 whitespace-nowrap"
                      style={{ fontSize: `${fontSize}rem` }}
                    >
                      {filteredFilms[itemIndex].shortTitle ?? filteredFilms[itemIndex].title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category filters */}
          <div className="grid grid-cols-4 md:grid-cols-2 gap-1.5 md:gap-2 mt-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(prev => prev === cat ? null : cat)}
                className={`text-[9px] md:text-[10px] font-futura uppercase tracking-widest px-2 md:px-3 py-1 rounded-full border transition-all duration-200 text-center ${
                  activeFilter === cat
                    ? 'bg-orange-400 border-orange-400 text-white'
                    : 'border-stone-300 text-stone-400 hover:border-orange-300 hover:text-orange-400'
                }`}
              >
                {cat === "cinematography" ? (
                  <><span className="md:hidden">DP</span><span className="hidden md:inline">cinematography</span></>
                ) : cat === "documentary" ? (
                  <><span className="md:hidden">doc</span><span className="hidden md:inline">documentary</span></>
                ) : cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Image panel — dominant */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-1 relative py-2 pr-2 pl-2 md:py-6 md:pr-6 md:pl-3"
        >
          <div className="relative h-full border-4 md:border-8 border-orange-400 border-double overflow-hidden shadow-2xl bg-black">
            {filteredFilms.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                <p className="text-stone-400 font-futura text-sm uppercase tracking-widest">No films yet</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {filteredFilms[activeIndex].image ? (
                    <Image
                      src={filteredFilms[activeIndex].image}
                      alt={filteredFilms[activeIndex].title}
                      fill
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-stone-800" />
                  )}
                  {/* Gradient for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  {/* Home link — mobile only, top-left inside image */}
                  <a
                    href="/"
                    className="md:hidden absolute top-0 left-0 p-4 inline-flex items-center gap-2 text-orange-400 font-futura text-xs font-medium"
                  >
                    ← Home
                  </a>
                  {/* Text overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10">
                    <h2 className="text-xl md:text-4xl font-bold text-white font-abominable uppercase tracking-wide mb-1 md:mb-3">
                      {filteredFilms[activeIndex].title}
                    </h2>
                    <p className="text-white/70 font-futura text-xs md:text-sm max-w-xl mb-3 md:mb-5 leading-relaxed">
                      {filteredFilms[activeIndex].description}
                    </p>
                    <a
                      href={filteredFilms[activeIndex].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-futura text-xs md:text-sm font-medium transition-colors"
                    >
                      Watch →
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default FilmPage;
