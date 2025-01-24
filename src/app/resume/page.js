"use client";
import { FloatingNav } from "@/components/ui/floating-navbar";
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
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Co-Founder, CTO, and Creative Director at The Confracted Company. 
            Overseeing ecommerce operations, platform management, and performance optimization. 
            Led website development using Next.JS, TailwindCSS, PostgreSQL, and MedusaJS. 
            Directed branding, content strategy, and product design initiatives.
          </p>
        </div>
      ),
    },
    {
      title: "Late 2024",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Software Engineering Intern for Occidental College Biochemistry Department. 
            Developed a web app using Flask and React to optimize departmental scheduling and collaboration. 
            Implemented advanced data algorithms using SQLAlchemy and conducted data analysis to improve scheduling efficiency.
          </p>
        </div>
      ),
    },
    {
      title: "2023",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Computing IRL Intern for California Native Vote Project. 
            Co-developed a dynamic map using JavaScript libraries like Leaflet.js and D3.js, integrating broadband and tribal datasets. 
            Enhanced data visualization techniques to support broadband expansion projects in Indigenous communities.
          </p>
        </div>
      ),
    },
    {
      title: "2022",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Lead Ambassador/Mentor for the Student-Athlete Mentor Program, Gaithersburg, Maryland. 
            Organized and participated in workshops promoting collaboration and development in underprivileged communities. 
            Mentored children academically and socially, conducting weekly individual and group sessions.
          </p>
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
      <div className="px-6">
        <FloatingNav navItems={navItems} />
        
          <Timeline data={data} />
          {/* Add your projects content here */}
        
      </div>
    </div>
  );
}