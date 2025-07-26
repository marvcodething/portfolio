# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack for fast builds
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js 15 portfolio website with App Router built for showcasing projects and interactive features.

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **React**: Version 19 with modern features
- **Styling**: TailwindCSS with DaisyUI, custom CSS variables system, Tailwind Animate
- **Animations**: Framer Motion (motion/react)
- **Icons**: Tabler Icons, React Icons, Lucide React
- **UI Components**: Custom components with shadcn/ui pattern
- **Analytics**: Vercel Analytics integration
- **Fonts**: Geist Sans and Geist Mono from Google Fonts

### Directory Structure
- `/src/app/` - Next.js App Router pages (layout.js, page.js, projects/, resume/, videos/)
- `/src/components/` - Reusable React components including custom UI components
- `/src/components/ui/` - UI components (apple-cards-carousel, floating-navbar, glare-card, timeline, tracing-beam)
- `/src/assets/` - Static images and project screenshots
- `/src/hooks/` - Custom React hooks (use-outside-click)
- `/src/lib/` - Utility functions (utils.js for class merging)

### Key Components
- **Chat.jsx**: Interactive chat interface with suggested questions and animated messages
- **apple-cards-carousel.jsx**: Project showcase carousel component
- **floating-navbar.jsx**: Animated navigation component
- Custom UI components following shadcn/ui patterns with class-variance-authority

### Styling System
- Uses CSS custom properties defined in globals.css
- TailwindCSS with extended color palette using HSL variables
- DaisyUI plugin for additional components
- Custom plugin for color variables injection
- Responsive design with mobile-first approach

### Animation Patterns
- Framer Motion for page transitions and component animations
- Staggered animations for lists and navigation items
- Loading states with skeleton screens
- Smooth scrolling and hover effects

### Navigation Structure
- Home page (`/`) with Chat interface and social links
- Projects page (`/projects`) with carousel and spotlight sections
- Resume page (`/resume`)
- Videos page (`/videos`)

### Development Notes
- Uses "use client" directives for client-side React features
- Image optimization with Next.js Image component
- External links open in new tabs with security attributes
- Responsive grid layouts for different screen sizes