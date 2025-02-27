"use client";
import Image from 'next/image';
import React from 'react';
import twitShot from "@/assets/twitShot.png";
import deadspace from "@/assets/deadspace.png"
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconCpu } from "@tabler/icons-react";
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
      <div className="relative z-10 w-48 fixed top-4 left-4">
        <FloatingNav navItems={navItems} />
      </div>

      <div className="max-w-[1200px] mx-auto space-y-20 mb-20 mt-28">
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
