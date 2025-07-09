'use client';
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconCpu, IconFileCv } from "@tabler/icons-react";
import rose from "@/assets/rose.png";
import confracted from "@/assets/confracted.png";
import studyspotraster from "@/assets/studyspotraster.png";
import marketcanvas from "@/assets/marketcanvas.png";
import { motion } from "framer-motion";
import twitShot from "@/assets/twitShot.png";
import loanPic from "@/assets/loanPic.png";
import schedShot from "@/assets/schedShot.png";
import mushieShot from "@/assets/mushieShot.png";
//import stompyShot from "@/assets/stompShot.png";
import retroShot from "@/assets/retroShot.png";
import noteShot from "@/assets/noteShot.png";
import stompShot from "@/assets/stompShot.jpg"
import Link from "next/link"

export default function Projects() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { name: "Projects", link: "/projects", icon: <IconCpu className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "Home", link: "/", icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "Resume", link: "/resume", icon: <IconFileCv className="h-4 w-4 text-neutral-500 dark:text-white" /> },
  ];

  const data = [
    {
      category: "Social Media",
      title: "Twitter Clone",
      src: twitShot,
      githubLink: "https://github.com/marvcodething/twitter-clone",
      demoLink: "https://twitter-clone-lxyw.onrender.com/login",
      content: <ProjectContent 
        description="A Twitter clone built with React, MongoDB, Tailwind, Node.js, and Express.js, featuring real-time updates and user authentication."
        image={twitShot}
        githubLink="https://github.com/marvcodething/twitter-clone"
        demoLink="https://twitter-clone-lxyw.onrender.com/login"
      />,
    },
    {
      category: "Interactive Media",
      title: "Notes App Interactive Documentary",
      src: noteShot,
      githubLink: "https://github.com/marvcodething/notesapp",
      demoLink: "https://notesapp-phi-gilt.vercel.app",
      content: <ProjectContent 
        description="An interactive documentary presented through a notes app-style interface. Built with Next.js and React, exploring themes of memory, organization, and digital intimacy."
        image={noteShot}
        githubLink="https://github.com/marvcodething/notesapp"
        demoLink="https://notesapp-phi-gilt.vercel.app"
      />,
    },
    {
      category: "Web Development",
      title: "ROSE Website",
      src: rose,
      githubLink: "https://github.com/marvcodething/rose-website",
      demoLink: "https://rose-union.org",
      content: <ProjectContent
        description="Official website for the Rising Occidental Student Employees (ROSE) union. Built with React and TailwindCSS, featuring a comprehensive updates portal and responsive design."
        image={rose}
        githubLink="https://github.com/marvcodething/rose-website"
        demoLink="https://rose-union.org"
      />,
    },
    {
      category: "Finance",
      title: "Loan Calculator",
      src: loanPic,
      githubLink: "https://github.com/marvcodething/loanPrediction",
      demoLink: "https://loanprediction-rxir.onrender.com",
      content: <ProjectContent
        description="A comprehensive loan calculator tool to help users plan their finances. Frontend built with React + Tailwind. Backend built with Flask. Model built with Scikit-Learn."
        image={loanPic}
        githubLink="https://github.com/marvcodething/loanPrediction"
        demoLink="https://loanprediction-rxir.onrender.com"
      />,
    },
    {
      category: "Productivity",
      title: "Schedule Manager",
      src: schedShot,
      githubLink: "https://github.com/MA0610/SchedulingWebsite",
      demoLink: null,
      content: <ProjectContent
        description="A scheduling application to help the Occidental College BioChem department manage class scheduling. Built with HTML, CSS, JavaScript, Flask, and SQLAlchemy."
        image={schedShot}
        githubLink="https://github.com/MA0610/SchedulingWebsite"
        demoLink={null}
      />,
    },
    {
      category: "Gaming",
      title: "Mushie World",
      src: mushieShot,
      githubLink: "https://github.com/marvcodething/MushieWorld",
      demoLink: "https://drive.google.com/drive/folders/13qJ0bTIlSbndu2-mBqmzXxgXUnnKIyAR?usp=drive_link",
      content: <ProjectContent
        description="Law-themed visual novel game built with Ren'Py."
        image={mushieShot}
        githubLink="https://github.com/marvcodething/MushieWorld"
        demoLink="https://drive.google.com/drive/folders/13qJ0bTIlSbndu2-mBqmzXxgXUnnKIyAR?usp=drive_link"
      />,
    },
    {
      category: "Gaming",
      title: "Escape8",
      src: retroShot,
      githubLink: null,
      demoLink: null,
      content: <ProjectContent
        description="A full length polemical game with 3d and 2d mixed gameplay in Unity. Self designing all game mechanics and art. Set to release May 8th 2025."
        image={retroShot}
        githubLink={null}
        demoLink={null}
      />,
    },
  ];

  const cards = data.map((card, index) => (
    <Card key={index} card={card} index={index} />
  ));

  if (isLoading) {
    return (
      <div className="min-h-screen">{/* your skeleton loading screen */}</div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-6">
        <div className="relative z-10">
          <FloatingNav navItems={navItems} />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="relative z-0 flex justify-center mt-24 py-8"
        >
          <h1 className="text-4xl font-bold text-white">Project Spotlight</h1>
        </motion.div>
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-white mb-4">stomping ground</h2>
              <p className="text-gray-300">Students explore identity, intimacy, and shared meaning through the spaces they live in and the communities they build inside them. Multimedia project built in Next.js with Phaser.js and React Sphere Viewer.</p>
            </div>
            <Link href="https://stomping.site" target="_blank" rel="noopener noreferrer">
            <Image src={stompShot} alt="Confracted Company" width={400} height={300} priority className="w-full h-[250px] md:w-[400px] md:h-[300px] object-cover rounded-lg shadow-xl hover:scale-105 transition-transform" />
            </Link>
          </motion.div>
        

        {/* Cool Stuff I'm Building */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="relative z-0 flex justify-center mt-24 py-8"
        >
          <h1 className="text-4xl font-bold text-white">Cool Stuff I'm Building</h1>
        </motion.div>

        <div className="max-w-[1200px] mx-auto space-y-20 mb-20">

          {/* StudySpot */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-white mb-4">StudySpot</h2>
              <p className="text-gray-300">A collaborative study platform that helps students find and share study spaces, organize study groups, and track their progress. Built with modern web technologies.</p>
            </div>
            <Image src={studyspotraster} alt="StudySpot" width={400} height={300} priority className="w-full h-[250px] md:w-[400px] md:h-[300px] object-cover rounded-lg shadow-xl hover:scale-105 transition-transform" />
          </motion.div>

          {/* DOJi MarketCanvas */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-white mb-4">DOJi MarketCanvas</h2>
              <p className="text-gray-300">A comprehensive market analysis tool for businesses to create and analyze their market canvas, built with modern web technologies for strategic planning.</p>
            </div>
            <Image src={marketcanvas} alt="DOJi MarketCanvas" width={400} height={300} priority className="w-full h-[250px] md:w-[400px] md:h-[300px] object-cover rounded-lg shadow-xl hover:scale-105 transition-transform" />
          </motion.div>

          {/* Confracted */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Confracted Company</h2>
              <p className="text-gray-300">Building a clothing brand centered on mental health and suicide prevention. Responsible for creative direction, branding, and e-commerce development.</p>
            </div>
            <a href="https://confracted.co" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
              <Image src={confracted} alt="Confracted Company" width={400} height={300} priority className="w-full h-[250px] md:w-[400px] md:h-[300px] object-cover rounded-lg shadow-xl hover:scale-105 transition-transform" />
            </a>
          </motion.div>

        </div>

        {/* Cool Stuff I've Built */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="relative z-0 flex flex-col items-center mt-24 pt-8 space-y-2"
        >
          <h1 className="text-4xl font-bold text-white">Cool Stuff I've Built</h1>
          <a href="/videos" className="text-gray-400 hover:text-white transition-colors">
            Check out my video projects →
          </a>
        </motion.div>

        {/* Carousel of completed projects */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="pb-20"
        >
          <Carousel items={cards} />
        </motion.div>
      </div>
    </div>
  );
}

const ProjectContent = ({ description, image, githubLink, demoLink }) => (
  <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
    <div className="flex justify-between items-center mb-8">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-xl font-sans max-w-3xl">
        {description}
      </p>
      <a href={githubLink} target="_blank" rel="noopener noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
      </a>
    </div>
    <a href={demoLink} target="_blank" rel="noopener noreferrer" className="block w-full h-[200px] sm:h-[300px] md:h-[400px]">
      <Image src={image} alt="Project screenshot" width={800} height={400} priority className="w-full h-full object-contain rounded-lg hover:scale-105 transition-transform" />
    </a>
  </div>
);
