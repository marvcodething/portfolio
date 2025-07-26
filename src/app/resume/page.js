"use client";
import { IconHome, IconCpu, IconFileCv } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { Timeline } from "@/components/ui/timeline";
import Image from "next/image";

export default function Projects() {
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
      title: "2025",
      content: (
        <div>
          <div className="mb-6">
            <h3 className="text-pink-500 text-sm md:text-base font-semibold mb-2">
              DOJi - Software Engineering Intern, MarketCanvas (Remote)
            </h3>
            <p className="text-cyan-400 text-xs md:text-sm mb-2">July 2025 – September 2025</p>
            <ul className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal list-disc ml-4 space-y-1">
              <li>Collaborated with founding team to develop analytical tools for financial market pattern recognition, implementing mathematical coordinate systems and algorithmic positioning methods for multiple candlestick pattern types using agile development practices</li>
              <li>Engineered interval-based positioning algorithms and dynamic grid systems while contributing to strategic product decisions through user authentication and pattern sharing frameworks</li>
            </ul>
          </div>
          <div>
            <h3 className="text-pink-500 text-sm md:text-base font-semibold mb-2">
              The Confracted Company - Co-Founder, CTO, and Creative Director
            </h3>
            <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal">
              Overseeing ecommerce operations, platform management, and performance optimization. 
              Led website development using Next.JS, TailwindCSS, PostgreSQL, and MedusaJS. 
              Directed branding, content strategy, and product design initiatives.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Late 2024",
      content: (
        <div>
          <h3 className="text-pink-500 text-sm md:text-base font-semibold mb-2">
            Occidental College Biochemistry Department - Software Engineering Intern
          </h3>
          <p className="text-cyan-400 text-xs md:text-sm mb-2">August 2024 – December 2024</p>
          <ul className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal list-disc ml-4 space-y-1">
            <li>Analyzed complex departmental workflows and designed custom scheduling platform using Flask, React, SQLAlchemy, and PostgreSQL that reduced manual overhead by 50%</li>
            <li>Led cross-functional collaboration with faculty and administrative stakeholders through structured planning sessions, identifying key pain points and prioritizing high-impact strategic initiatives using agile methodologies</li>
          </ul>
        </div>
      ),
    },
    {
      title: "2023",
      content: (
        <div>
          <h3 className="text-pink-500 text-sm md:text-base font-semibold mb-2">
            California Native Vote Project - Web Development Intern
          </h3>
          <p className="text-cyan-400 text-xs md:text-sm mb-2">August 2023 – December 2023</p>
          <ul className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal list-disc ml-4 space-y-1">
            <li>Developed interactive data visualization tools using Leaflet.js, D3.js, and Python, analyzing multiple datasets to generate actionable insights that enhanced targeting accuracy for advocacy campaigns</li>
            <li>Implemented agile project management across multiple campaigns, integrating weekly stakeholder feedback to enable rapid response to political developments</li>
          </ul>
        </div>
      ),
    },
    {
      title: "2022",
      content: (
        <div>
          <h3 className="text-pink-500 text-sm md:text-base font-semibold mb-2">
            480 Club Student Ambassador - Lead Ambassador/Mentor
          </h3>
          <p className="text-cyan-400 text-xs md:text-sm mb-2">Gaithersburg, Maryland</p>
          <ul className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal list-disc ml-4 space-y-1">
            <li>Organized and participated in workshops promoting collaboration and development in underprivileged communities</li>
            <li>Mentored children academically and socially, conducting weekly individual and group sessions</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Changelog",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            Recent projects and achievements:
          </p>
          <ul className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal list-disc ml-4">
            <li>Launched the ROSE union website with React and TailwindCSS, enhancing member engagement and communication.</li>
            <li>Developed a Twitter/X clone using the MERN stack with real-time updates and Cloudinary integration.</li>
            <li>Created an ML Loan Prediction Web App utilizing Scikit Learn models and Flask API.</li>
          </ul>
        </div>
      ),
    },
  ];
  
  return (
    <div className="py-20 overflow-x-hidden">
      {/* Static Navbar */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-stone-700/50"
      >
        <div className="flex items-center justify-center px-6 py-4">
          <div className="flex space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={`nav-${index}-${item.name}`}
                href={item.link}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="flex items-center space-x-2 text-stone-300 hover:text-white transition-all duration-300 px-4 py-2 rounded-lg relative group hover:bg-stone-800/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.3),0_0_40px_rgba(34,211,238,0.2)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-pink-500/10 before:via-cyan-400/10 before:to-pink-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>
      
      <div className="px-6 pt-20">
        <Timeline data={data} />
        {/* Add your projects content here */}
      </div>
    </div>
  );
}