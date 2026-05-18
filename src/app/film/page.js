"use client";
import Image from 'next/image';
import React from 'react';
import deadspace from "@/assets/deadspace.png";
import djshot from "@/assets/djshot.jpg";
import { IconHome } from "@tabler/icons-react";
import { motion } from "framer-motion";

const FilmPage = () => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-stone-700/50"
      >
        <div className="flex items-center justify-center px-6 py-4">
          <motion.a
            href="/"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center space-x-2 text-stone-300 hover:text-white transition-all duration-300 px-4 py-2 rounded-lg hover:bg-stone-800/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-pink-500/10 before:to-pink-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 relative"
          >
            <IconHome className="h-4 w-4" />
            <span className="text-sm font-medium">Home</span>
          </motion.a>
        </div>
      </motion.div>

      <div className="max-w-[1200px] mx-auto px-6 mb-20 mt-28 pt-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-white mb-20"
        >
          Film & Creative
        </motion.h1>

        <div className="space-y-20">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-white mb-4">Dead Space?</h2>
              <p className="text-gray-300">
                Observational documentary centered upon Sycamore Glen on the Occidental College campus. By Marvin Romero and Sloan Whitliff.
              </p>
            </div>
            <a href="https://youtu.be/5yD2cbRI6a4" target="_blank" rel="noopener noreferrer">
              <Image
                src={deadspace}
                alt="Dead Space documentary thumbnail"
                width={400}
                height={300}
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
              <h2 className="text-3xl font-bold text-white mb-4">I Learned How to DJ In A Week</h2>
              <p className="text-gray-300">
                Short clips of me yapping about DJing, and how I learned how to DJ in a week.
              </p>
            </div>
            <a href="https://youtu.be/DoEjtSyfHEg" target="_blank" rel="noopener noreferrer">
              <Image
                src={djshot}
                alt="DJ project thumbnail"
                width={400}
                height={300}
                className="w-full h-[250px] md:w-[400px] md:h-[300px] object-cover rounded-lg shadow-xl transition-transform hover:scale-105 cursor-pointer"
              />
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FilmPage;
