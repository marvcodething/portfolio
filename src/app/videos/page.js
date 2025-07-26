"use client";
import Image from 'next/image';
import React from 'react';
import twitShot from "@/assets/twitShot.png";
import deadspace from "@/assets/deadspace.png"
import { IconCpu } from "@tabler/icons-react";
import { motion } from "framer-motion";
import djshot from "@/assets/djshot.jpg"

const VideosPage = () => {
  const navItems = [
    {
      name: "Return",
      link: "/projects",
      icon: <IconCpu className="h-4 w-4 text-neutral-500 dark:text-white" />,
    }
  ];

  return (
    <div>
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

      <div className="max-w-[1200px] mx-auto space-y-20 mb-20 mt-28 pt-20">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Dead Space?
            </h2>
            <p className="text-gray-300">
              Observational documentary centered upon Sycamore Glen on the Occidental College campus. By Marvin Romero and Sloan Whitliff.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <a href="https://youtu.be/5yD2cbRI6a4" target="_blank" rel="noopener noreferrer">
            <Image 
              src={deadspace}
              alt="Video Thumbnail"
              width={400}
              height={300}
              className="w-full h-[250px] md:w-[400px] md:h-[300px] object-cover rounded-lg shadow-xl transition-transform hover:scale-105 cursor-pointer"
            />
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              I Learned How to DJ In A Week
            </h2>
            <p className="text-gray-300">
              Short clips of me yapping about DJing, and how I learned how to DJ in a week.
            </p>
          </div>
          <a href='https://youtu.be/DoEjtSyfHEg'>
          <div className="w-full md:w-auto">
            <Image 
              src={djshot}
              alt="Motion Design Thumbnail"
              width={400}
              height={300}
              className="w-full h-[250px] md:w-[400px] md:h-[300px] object-cover rounded-lg shadow-xl transition-transform hover:scale-105 cursor-pointer"
            />
          </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideosPage;
