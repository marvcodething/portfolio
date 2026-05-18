"use client";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { MdEmail } from "react-icons/md";
import Link from "next/link";
import { Righteous } from "next/font/google";

const righteous = Righteous({ subsets: ["latin"], weight: "400" });

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.13, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function Home() {
  const [mode, setMode] = useState("swe");
  const isSWE = mode === "swe";

  const iconHoverClass = isSWE
    ? "fill-stone-400 group-hover:fill-orange-400 group-hover:drop-shadow-[0_0_10px_rgba(249,115,22,0.9)]"
    : "fill-stone-500 group-hover:fill-cyan-400 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]";

  const sweControls = useAnimation();
  const filmControls = useAnimation();
  const iconCtrl0 = useAnimation();
  const iconCtrl1 = useAnimation();
  const iconCtrl2 = useAnimation();
  const iconCtrl3 = useAnimation();

  const bounceRef = useRef(null);
  const waveRef = useRef(null);

  // Hover state refs — no re-render needed, just gate the animations
  const iconHoverRef = useRef(false);
  const bounceHoverRef = useRef(false);

  // Stable scheduling functions stored in refs so event handlers can call them
  const scheduleWaveRef = useRef(null);
  const scheduleBounceRef = useRef(null);

  // Icon wave
  useEffect(() => {
    const allCtrls = [iconCtrl0, iconCtrl1, iconCtrl2, iconCtrl3];

    const snapAllToRest = () =>
      allCtrls.forEach(c =>
        c.start({ y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } })
      );

    const doWave = () => {
      if (iconHoverRef.current) return;
      const reversed = Math.random() > 0.5;
      const order = reversed ? [3, 2, 1, 0] : [0, 1, 2, 3];
      order.forEach((idx, i) => {
        setTimeout(() => {
          if (iconHoverRef.current) return;
          allCtrls[idx].start({
            y: [0, -(10 + Math.random() * 5), 2, 0],
            transition: { duration: 0.58 + Math.random() * 0.2, ease: "easeInOut" },
          });
        }, i * 140 + Math.random() * 35);
      });
    };

    const scheduleWave = (delay) => {
      clearTimeout(waveRef.current);
      waveRef.current = setTimeout(() => {
        doWave();
        scheduleWave(9000 + Math.random() * 7000);
      }, delay);
    };

    // Exposed to hover handlers: stop in-progress wave, reset timer
    scheduleWaveRef.current = (delay = 4000 + Math.random() * 3000) => {
      snapAllToRest();
      scheduleWave(delay);
    };

    scheduleWave(3000 + Math.random() * 1500);
    return () => clearTimeout(waveRef.current);
  }, []);

  // Inactive button bounce
  useEffect(() => {
    const inactiveCtrl = isSWE ? filmControls : sweControls;

    const snapToRest = () =>
      inactiveCtrl.start({ y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } });

    const doBounce = () => {
      if (bounceHoverRef.current) return;
      const h = 7 + Math.random() * 5;
      inactiveCtrl.start({
        y: [0, -h, 2, -(h * 0.55), 0],
        scale: [1, 1.12, 0.96, 1.07, 1],
        transition: { duration: 0.62 + Math.random() * 0.18, ease: "easeInOut" },
      });
    };

    const scheduleBounce = (delay) => {
      clearTimeout(bounceRef.current);
      bounceRef.current = setTimeout(() => {
        doBounce();
        scheduleBounce(5000 + Math.random() * 4000);
      }, delay);
    };

    // Exposed to hover handlers: stop in-progress bounce, reset timer
    scheduleBounceRef.current = (delay = 3000 + Math.random() * 2000) => {
      snapToRest();
      scheduleBounce(delay);
    };

    scheduleBounce(1200 + Math.random() * 800);
    return () => clearTimeout(bounceRef.current);
  }, [mode]);

  const handleIconHoverStart = () => {
    iconHoverRef.current = true;
    scheduleWaveRef.current?.();
  };

  const handleIconHoverEnd = () => {
    iconHoverRef.current = false;
    scheduleWaveRef.current?.(4000 + Math.random() * 3000);
  };

  const handleButtonHoverStart = () => {
    bounceHoverRef.current = true;
    scheduleBounceRef.current?.();
  };

  const handleButtonHoverEnd = () => {
    bounceHoverRef.current = false;
    scheduleBounceRef.current?.();
  };

  return (
    <motion.div
      animate={{ backgroundColor: isSWE ? "#09090b" : "#fafaf9" }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      {/* Ambient background glows */}
      <motion.div
        animate={{
          background: isSWE
            ? "radial-gradient(circle at 20% 80%, rgba(34,211,238,0.07) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(249,115,22,0.05) 0%, transparent 50%)"
            : "radial-gradient(circle at 80% 20%, rgba(249,115,22,0.09) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(34,211,238,0.05) 0%, transparent 50%)",
        }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-8 relative z-10"
      >
        {/* Name + subtitle */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-2">
          <motion.h1
            animate={{ color: isSWE ? "#e7e5e4" : "#1c1917" }}
            transition={{ duration: 0.35 }}
            className={`text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-wide text-center ${righteous.className}`}
          >
            Marvin Romero
          </motion.h1>

          <AnimatePresence mode="wait">
            <motion.p
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              style={{ color: isSWE ? "#22d3ee" : "#f97316" }}
              className="text-xs md:text-sm lg:text-base font-futura tracking-[0.25em] uppercase"
            >
              {isSWE ? "Software Engineer" : "Filmmaker · Creative Technologist"}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Social icons */}
        <motion.div variants={itemVariants} className="flex items-center space-x-1">
          <motion.a
            href="https://www.github.com/marvcodething"
            target="_blank"
            rel="noopener noreferrer"
            animate={iconCtrl0}
            onHoverStart={handleIconHoverStart}
            onHoverEnd={handleIconHoverEnd}
            whileHover={{ scale: 1.25, y: -3 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="p-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-all duration-300 ${iconHoverClass}`} viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </motion.a>

          <motion.a
            href="https://www.instagram.com/marv_ar"
            target="_blank"
            rel="noopener noreferrer"
            animate={iconCtrl1}
            onHoverStart={handleIconHoverStart}
            onHoverEnd={handleIconHoverEnd}
            whileHover={{ scale: 1.25, y: -3 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="p-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-all duration-300 ${iconHoverClass}`} viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </motion.a>

          <motion.a
            href="https://www.linkedin.com/in/marvin-romero"
            target="_blank"
            rel="noopener noreferrer"
            animate={iconCtrl2}
            onHoverStart={handleIconHoverStart}
            onHoverEnd={handleIconHoverEnd}
            whileHover={{ scale: 1.25, y: -3 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="p-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-all duration-300 ${iconHoverClass}`} viewBox="0 0 24 24">
              <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
            </svg>
          </motion.a>

          <motion.a
            href="mailto:marv.a.romero05@gmail.com"
            animate={iconCtrl3}
            onHoverStart={handleIconHoverStart}
            onHoverEnd={handleIconHoverEnd}
            whileHover={{ scale: 1.25, y: -3 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="p-2 group"
          >
            <MdEmail className={`h-6 w-6 transition-all duration-300 ${iconHoverClass}`} />
          </motion.a>
        </motion.div>

        {/* Toggle */}
        <motion.div variants={itemVariants}>
          <div className={`relative flex rounded-full p-1 transition-colors duration-300 ${isSWE ? "bg-zinc-800" : "bg-stone-200"}`}>
            <motion.span
              className="absolute top-1 bottom-1 rounded-full"
              style={{ width: "calc(50% - 4px)" }}
              animate={{
                left: isSWE ? "4px" : "calc(50%)",
                backgroundColor: isSWE ? "#22d3ee" : "#f97316",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            />
            <motion.button
              animate={sweControls}
              onHoverStart={handleButtonHoverStart}
              onHoverEnd={handleButtonHoverEnd}
              onClick={() => setMode("swe")}
              className={`relative z-10 px-10 py-2 text-sm font-bold rounded-full transition-colors duration-200 font-futura tracking-widest ${isSWE ? "text-black" : "text-stone-400"}`}
            >
              SWE
            </motion.button>
            <motion.button
              animate={filmControls}
              onHoverStart={handleButtonHoverStart}
              onHoverEnd={handleButtonHoverEnd}
              onClick={() => setMode("film")}
              className={`relative z-10 px-10 py-2 text-sm font-bold rounded-full transition-colors duration-200 font-futura tracking-widest ${!isSWE ? "text-black" : "text-stone-500"}`}
            >
              FILM
            </motion.button>
          </div>
        </motion.div>

        {/* Enter */}
        <motion.div variants={itemVariants}>
          <Link href={isSWE ? "/projects" : "/film"}>
            <motion.span
              animate={{ color: isSWE ? "#22d3ee" : "#f97316" }}
              whileHover={{ color: isSWE ? "#f97316" : "#22d3ee", x: 4, opacity: 0.85 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-futura tracking-[0.35em] uppercase cursor-pointer inline-block"
            >
              Enter →
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
