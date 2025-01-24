"use client";
import portrait from "@/assets/portrait.png";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { MdEmail } from "react-icons/md";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconCpu, IconFileCv } from "@tabler/icons-react";
import { GlareCard } from "@/components/ui/glare-card";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { BsChevronDown } from "react-icons/bs";

export default function Home() {
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScroll(false);
      } else {
        setShowScroll(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      name: "Projects",
      link: "/projects",
      icon: <IconCpu className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Home",
      link: "/",
      icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    
    {
      name: "Resume",
      link: "/resume",
      icon: (
        <IconFileCv className="h-4 w-4 text-neutral-500 dark:text-white" />
      ),
    },
  ];

  return (
    <div className="overflow-x-hidden">
      <div className="px-6">
        <FloatingNav navItems={navItems} />
        <div className="flex flex-col items-center justify-center min-h-screen py-2 mb-10">
          <h1 className="text-4xl font-bold text-stone-300 mb-4">
            Marvin Romero
          </h1>
          <div className="flex flex-col items-center">
            <div className="text-2xl text-stone-300 inline-block">
              Aspiring&nbsp;
              <TypeAnimation
                className="inline-block"
                sequence={[
                  "Engineer",
                  1000,
                  "Creative",
                  1000,
                  "Innovator",
                  1000,
                  "Problem Solver",
                  1000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </div>
            <div className="flex mt-4 space-x-4">
              <a
                href="https://www.github.com/marvcodething"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 fill-stone-300 transform transition-transform duration-200 hover:scale-125 hover:fill-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/marv_ar"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 fill-stone-300 transform transition-transform duration-200 hover:scale-125 hover:fill-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/marvin-romero"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 fill-stone-300 transform transition-transform duration-200 hover:scale-125 hover:fill-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </a>
              <a
                href="mailto:marv.a.romero05@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MdEmail className="h-6 w-6 fill-stone-300 transform transition-transform duration-200 hover:scale-125 hover:fill-white" />
              </a>
            </div>
          </div>
          {showScroll && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 10 }}
              transition={{ 
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1
              }}
              className="absolute bottom-10"
            >
              <BsChevronDown className="h-8 w-8 text-stone-300" />
            </motion.div>
          )}
        </div>
        <div className="flex justify-center min-h-screen items-center">
          <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl space-y-4 md:space-y-0 md:space-x-8">
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 10,
                duration: 0.8
              }}
              className="md:w-1/2 text-left"
            >
              <h1 className="text-4xl font-bold text-stone-300 mb-4">About Me</h1>
              <p className="text-stone-300 mt-4">
                I'm a student at Occidental College, studying Computer Science and
                Media Arts and Culture. I thrive at the intersection of creativity
                and technology, exploring how code can be used as a medium for
                storytelling and cultural expression. I'm passionate about
                crafting experiences that inspire, engage, and empower—whether
                through interactive media, accessible applications, or tools for
                civic engagement. My goal is to create innovative digital works
                that bridge technical precision with artistic vision, amplifying
                voices and ideas that spark change.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 10,
                duration: 0.8
              }}
              className="md:w-1/2 flex justify-center mb-4"
            >
              <GlareCard className="w-full h-full">
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src={portrait}
                    alt="Portrait"
                    className="rounded-lg shadow-lg w-full h-full object-cover"
                  />
                </div>
              </GlareCard>
            </motion.div>
          </div>
        </div>
        <div>
          
        </div>
      </div>
    </div>
  );
}
