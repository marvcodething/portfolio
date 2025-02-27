"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconCpu, IconFileCv } from "@tabler/icons-react";
import rose from "@/assets/rose.png";
import confracted from "@/assets/confracted.png";
import buddysystem from "@/assets/buddysystem.jpg";
import { motion } from "framer-motion";
import twitShot from "@/assets/twitShot.png";
import loanPic from "@/assets/loanPic.png";
import schedShot from "@/assets/schedShot.png";
import mushieShot from "@/assets/mushieShot.png";

export default function Projects() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reduced loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
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
      icon: <IconFileCv className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
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
        description="A scheduling application to help the Occidental College BioChem deparement manage class scheduling. Built with HTML, CSS, JavaScript, Flask, and SQLAlchemy."
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
    }
  ];

  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="px-6">
          <div className="relative z-10">
            <FloatingNav navItems={navItems} />
          </div>
          
          <div className="animate-pulse">
            <div className="relative z-0 flex justify-center mt-24 py-8">
              <div className="h-10 w-64 bg-gray-700 rounded"></div>
            </div>

            <div className="max-w-[1200px] mx-auto space-y-20 mb-20">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="max-w-xl w-full">
                    <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
                    <div className="h-24 bg-gray-700 rounded"></div>
                  </div>
                  <div className="w-full md:w-[400px] h-[300px] bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>

            <div className="relative z-0 flex justify-center mt-24 pt-8">
              <div className="h-10 w-64 bg-gray-700 rounded"></div>
            </div>
            
            <div className="h-[400px] bg-gray-700 rounded mt-8"></div>
          </div>
        </div>
      </div>
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
          <h1 className="text-4xl font-bold text-white">Cool Stuff I'm Building</h1>
        </motion.div>

        <div className="max-w-[1200px] mx-auto space-y-20 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Confracted Company</h2>
              <p className="text-gray-300">Building a clothing brand centered on mental health and suicide prevention. Responsible for creative direction and design. Creating the brand website using Next.js, Tailwind, Medusa, and more.</p>
            </div>
            <a href="https://confracted.co" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
              <Image 
                src={confracted}
                alt="Confracted Company Website"
                width={400}
                height={300}
                priority
                className="w-full h-[250px] md:w-[400px] md:h-[300px] object-cover rounded-lg shadow-xl transition-transform hover:scale-105 cursor-pointer"
              />
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-white mb-4">ROSE Website</h2>
              <p className="text-gray-300">Leading development of ROSE's (Rising Occidental Student Employees) official website - empowering student workers through accessible information and collective action tools. Built with React and Tailwind CSS, featuring a comprehensive bargaining updates portal and detailed resources about workplace rights, union membership, and ongoing campaigns. Implemented responsive design to ensure information remains accessible across all devices.</p>
            </div>
            <a href="https://rose-union.org" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
              <Image 
                src={rose}
                alt="ROSE Website"
                width={400}
                height={300}
                priority
                className="w-full h-[250px] md:w-[400px] md:h-[300px] object-cover rounded-lg shadow-xl transition-transform hover:scale-105 cursor-pointer"
              />
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-white mb-4">The Buddy System</h2>
              <p className="text-gray-300">Full-Stack Development of a small business organizational tool (details limited for confidentiality). Built with React, Next.js, Tailwind, MongoDB, and more.</p>
            </div>
            <div className="w-full md:w-auto">
              <Image 
                src={buddysystem}
                alt="Blockchain Analytics"
                width={400}
                height={300}
                priority
                className="w-full h-[250px] md:w-[400px] md:h-[300px] object-cover rounded-lg shadow-xl"
              />
            </div>
          </motion.div>
        </div>

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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="pb-20"
        >
          <Carousel items={cards}/>
        </motion.div>
      </div>
    </div>
  );
}

const ProjectContent = ({ description, image, githubLink, demoLink }) => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <div className="flex justify-between items-center mb-8">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-xl font-sans max-w-3xl">
          {description}
        </p>
        <a 
          href={githubLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
      </div>
      <a 
        href={demoLink}
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full h-[200px] sm:h-[300px] md:h-[400px]"
      >
        <Image
          src={image}
          alt="Project screenshot"
          width={800}
          height={400}
          priority
          className="w-full h-full object-contain rounded-lg transition-transform hover:scale-105"
        />
      </a>
    </div>
  );
};
