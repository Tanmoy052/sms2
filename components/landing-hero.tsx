"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BookOpen,
  Calendar,
  Award,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COLLEGE_INFO, STATISTICS, DEPARTMENTS } from "@/lib/config";
import { cn } from "@/lib/utils";

const COLLEGE_IMAGES = {
  background: "/images/cgec-acdemic.jpeg",
  slider2: "/images/slider-2.jpg",
  slider3: "/images/slider-3.jpg",
  logo: "/images/cgec-logo.png",
};

type HeroSlide = {
  id: number;
  image: string;
  title: string;
  description: string;
  align?: "center" | "left";
  showText?: boolean;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: COLLEGE_IMAGES.background,
    title: "Student Management System",
    description:
      "A comprehensive platform for managing student records, attendance, academic projects, and institutional notices. Empowering education through technology.",
    align: "center",
  },
  {
    id: 2,
    image: COLLEGE_IMAGES.slider2,
    title: "Academic Excellence",
    description:
      "Foster a culture of learning and innovation with our comprehensive academic tools.",
    align: "center",
    showText: true,
  },
  {
    id: 3,
    image: COLLEGE_IMAGES.slider3,
    title: "Project Showcase",
    description:
      "Explore innovative projects and research work from our talented students.",
    align: "center",
    showText: true,
  },
];

const features = [
  {
    icon: Users,
    title: "Student Management",
    description:
      "    Comprehensive student profiles with academic records and personal information.",
  },
  {
    icon: Calendar,
    title: "Attendance Tracking",
    description:
      "Real-time attendance management with detailed reports and analytics.",
  },
  {
    icon: BookOpen,
    title: "Project Repository",
    description:
      "Showcase student projects with descriptions, technologies, and live demos.",
  },
  {
    icon: Award,
    title: "Academic Excellence",
    description:
      "Track performance, grades, and achievements throughout the academic journey.",
  },
];

export function LandingHero() {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);

  // derived active index for UI (0-based into HERO_SLIDES)
  const activeIndex =
    ((page % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length;
  const currentSlide = HERO_SLIDES[activeIndex];

  // advance forward
  const paginate = (newDirection: number) => {
    setPage(page + newDirection);
    setDirection(newDirection);
  };

  const goToNext = () => paginate(1);
  const goToPrev = () => paginate(-1);

  // jump to an arbitrary slide (0-based into HERO_SLIDES)
  const goToSlide = (index: number) => {
    const diff = index - activeIndex;
    if (diff !== 0) {
      paginate(diff);
    }
  };

  // auto-advance every 8 seconds
  useEffect(() => {
    const id = window.setInterval(() => {
      goToNext();
    }, 8000);

    return () => window.clearInterval(id);
  }, [page]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={COLLEGE_IMAGES.logo || "/placeholder.svg"}
              alt="CGEC Logo"
              width={36}
              height={36}
              className="rounded-full"
              priority
            />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm text-primary">CGEC</span>
              <span className="text-xs text-muted-foreground">
                Student Portal
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="https://cgec-website-frontend.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-gray-700 hover:text-blue-700 transition-colors"
              >
                Visit Website
              </Link>
              <Link
                href="/notices"
                className="text-sm font-semibold text-gray-700 hover:text-blue-700 transition-colors"
              >
                Notices
              </Link>
              <Link
                href="/projects"
                className="text-sm font-semibold text-gray-700 hover:text-blue-700 transition-colors"
              >
                Projects
              </Link>
            </nav>
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    id="dropdown-menu-trigger"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href="https://cgec-website-frontend.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      Visit Website
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/notices" className="cursor-pointer">
                      Notices
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/projects" className="cursor-pointer">
                      Projects
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Link href="/login">
              <Button size="sm" className="gap-1.5">
                Access Portal
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-3rem)] min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-900/5 py-0">
        <div className="absolute inset-0 bg-slate-900/5 -z-10" />

        {/* 3D Carousel Container */}
        <div className="relative w-full h-full">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 600, damping: 40, mass: 0.8 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.4 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full h-full shadow-2xl overflow-hidden cursor-pointer bg-black"
            >
              <div className="relative w-full h-full">
                <motion.div
                  className="relative w-full h-full"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 10, ease: "linear" }}
                >
                  <Image
                    src={currentSlide.image || "/placeholder.svg"}
                    alt={currentSlide.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent" />

                {/* Text Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-left z-20">
                  <motion.div
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {currentSlide.title && (
                      <motion.h2
                        className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg tracking-tight"
                        variants={textVariants}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {currentSlide.title}
                      </motion.h2>
                    )}
                    {currentSlide.description && (
                      <motion.p
                        className="text-white/90 text-base md:text-xl max-w-2xl drop-shadow-md line-clamp-3 md:line-clamp-none font-medium leading-relaxed"
                        variants={textVariants}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        {currentSlide.description}
                      </motion.p>
                    )}

                    <motion.div
                      className="mt-6 md:mt-8 flex flex-wrap gap-3 md:gap-4"
                      variants={textVariants}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      {activeIndex === 0 ? (
                        <>
                          <Link href="/login">
                            <Button
                              size="lg"
                              className="gap-2 text-sm md:text-base px-6 md:px-8 h-10 md:h-12 shadow-xl bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                            >
                              Access Portal{" "}
                              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                          </Link>
                          <Link href="/projects">
                            <Button
                              size="lg"
                              variant="outline"
                              className="text-sm md:text-base px-6 md:px-8 h-10 md:h-12 shadow-xl bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                            >
                              View Projects
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <Link href="/projects">
                          <Button
                            size="lg"
                            className="gap-2 text-sm md:text-base px-6 md:px-8 h-10 md:h-12 shadow-xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                          >
                            Learn More{" "}
                            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                          </Button>
                        </Link>
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 shadow-lg text-white transition-all backdrop-blur-sm"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 shadow-lg text-white transition-all backdrop-blur-sm"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-30">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 shadow-lg",
                  index === activeIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-3 text-primary">
            Platform Features
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Everything you need to manage academic operations efficiently
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-5 rounded-xl border border-primary/10 bg-gradient-to-br from-white to-primary/5 hover:shadow-lg hover:border-primary/20 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-1.5 text-foreground">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">
                {STATISTICS.totalStudents}
              </div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">
                {STATISTICS.totalFaculty}
              </div>
              <div className="text-sm text-muted-foreground">Faculty</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">
                {STATISTICS.totalDepartments}
              </div>
              <div className="text-sm text-muted-foreground">Departments</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">
                {STATISTICS.totalProjects}
              </div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3 text-primary">Departments</h2>
          <p className="text-sm text-muted-foreground">
            Explore academic programs at CGEC
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept.shortName}
              className="p-5 rounded-xl border border-primary/10 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">
                    {dept.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Undergraduate Program
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary font-medium">
                  {dept.shortName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <div className="rounded-2xl p-8 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Student Projects
              </h3>
              <p className="text-sm text-muted-foreground">
                Browse innovative project work across departments. See
                technologies used, team members, and links to demos and
                repositories.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/projects">
                <Button className="gap-1.5">
                  Explore Projects
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Access Portal</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* College Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src={COLLEGE_IMAGES.logo || "/placeholder.svg"}
                  alt="CGEC Logo"
                  width={48}
                  height={48}
                  className="rounded-full shadow-md"
                />
                <div>
                  <h3 className="font-bold text-sm text-black">
                    Coochbehar Government
                  </h3>
                  <h3 className="font-bold text-sm text-black">
                    Engineering College
                  </h3>
                </div>
              </div>
              <p className="text-xs text-black leading-relaxed">
                Established in 2016, CGEC is committed to providing quality
                technical education and fostering innovation among students.
              </p>
              <p className="text-xs italic text-black font-medium">
                तमसो मा ज्योतिर्गमय
              </p>
              <p className="text-xs text-black">(From darkness to light)</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-black flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-black" />
                Departments
              </h4>
              <ul className="space-y-2">
                {DEPARTMENTS.map((dept) => (
                  <li
                    key={dept.shortName}
                    className="text-xs text-black cursor-default flex items-center gap-2"
                  >
                    <span className="font-semibold text-black w-8">
                      {dept.shortName}
                    </span>
                    <span>- {dept.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-black">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-black mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-black">
                    Harinchawra, Ghughumari,
                    <br />
                    Coochbehar, West Bengal - 736170
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-black flex-shrink-0" />
                  <p className="text-xs text-black">03582-255279</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-black flex-shrink-0" />
                  <p className="text-xs text-black">info@cgec.ac.in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-gray-300">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-xs text-black">
                © {new Date().getFullYear()} {COLLEGE_INFO.name}. All rights
                reserved.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/login"
                  className="text-xs text-black hover:text-gray-600 transition-colors"
                >
                  Access Portal
                </Link>
                <Link
                  href="/projects"
                  className="text-xs text-black hover:text-gray-600 transition-colors"
                >
                  Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
