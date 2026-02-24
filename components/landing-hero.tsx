'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { COLLEGE_INFO, STATISTICS, DEPARTMENTS } from '@/lib/config';
import { cn } from '@/lib/utils';

const COLLEGE_IMAGES = {
  background: '/images/cgec-acdemic.jpeg',
  logo: '/images/cgec-logo.png',
};

type HeroSlide = {
  id: number;
  image: string;
  title: string;
  description: string;
  align?: 'center' | 'left';
};

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: COLLEGE_IMAGES.background,
    title: 'Student Management System',
    description:
      'A comprehensive platform for managing student records, attendance, academic projects, and institutional notices. Empowering education through technology.',
    align: 'center',
  },
];

const features = [
  {
    icon: Users,
    title: 'Student Management',
    description:
      'Comprehensive student profiles with academic records and personal information.',
  },
  {
    icon: Calendar,
    title: 'Attendance Tracking',
    description:
      'Real-time attendance management with detailed reports and analytics.',
  },
  {
    icon: BookOpen,
    title: 'Project Repository',
    description:
      'Showcase student projects with descriptions, technologies, and live demos.',
  },
  {
    icon: Award,
    title: 'Academic Excellence',
    description:
      'Track performance, grades, and achievements throughout the academic journey.',
  },
];

export function LandingHero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);

    return () => window.clearInterval(id);
  }, []);

  const currentSlide = HERO_SLIDES[activeIndex];

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={COLLEGE_IMAGES.logo || '/placeholder.svg'}
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
                href="https://cgec.org.in/"
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
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href="https://cgec.org.in/"
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
      <section className="relative min-h-[560px] md:min-h-[600px] flex items-end justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ perspective: '1000px' }}>
          <div
            className="relative w-full h-full transition-transform duration-700 transform-gpu"
            style={{ transform: `rotateY(${activeIndex * 180}deg)` }}
          >
            {HERO_SLIDES.map((slide, index) => (
              <div
                key={slide.id}
                className="absolute inset-0 backface-hidden"
                style={{ transform: `rotateY(${index * 180}deg)` }}
              >
                <Image
                  src={slide.image || '/placeholder.svg'}
                  alt="slide image"
                  fill
                  className="object-cover brightness-110 saturate-99"
                  priority={index === 0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/22 to-transparent" />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-4 left-0 right-0 z-10 flex justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
            <Image
              src={COLLEGE_IMAGES.logo || '/placeholder.svg'}
              alt="CGEC Logo"
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
            <span className="font-bold text-base md:text-lg text-primary">
              Coochbehar Government Engineering College
            </span>
          </div>
        </div>

        {/* Slide controls */}
        <button
          type="button"
          aria-label="Previous slide"
          className="absolute left-3 md:left-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-md p-2 text-slate-700"
          onClick={goToPrev}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          className="absolute right-3 md:right-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-md p-2 text-slate-700"
          onClick={goToNext}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="relative z-10 container mx-auto px-4 py-10">
          <div
            className={cn(
              'max-w-3xl space-y-4',
              currentSlide.align === 'center'
                ? 'mx-auto text-center'
                : 'ml-0 mr-auto text-left'
            )}
          >
            {currentSlide.showText !== false && (
              <>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance text-white [text-shadow:_2px_2px_8px_rgba(0,0,0,0.8),_0_0_20px_rgba(0,0,0,0.5)]">
                  {currentSlide.title}
                </h1>
                <p className="text-base md:text-lg text-white font-medium max-w-2xl text-pretty [text-shadow:_1px_1px_6px_rgba(0,0,0,0.8),_0_0_15px_rgba(0,0,0,0.4)]">
                  {currentSlide.description}
                </p>
              </>
            )}
            <div
              className={cn(
                'flex gap-3 pt-3',
                currentSlide.align === 'center'
                  ? 'justify-center'
                  : 'justify-start'
              )}
            >
              {activeIndex === 0 ? (
                <>
                  <Link href="/login">
                    <Button size="default" className="gap-2 shadow-xl">
                      Access Portal
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button
                      size="default"
                      variant="outline"
                      className="shadow-xl bg-white hover:bg-white/90 text-primary border-white"
                    >
                      View Projects
                    </Button>
                  </Link>
                </>
              ) : (
                <Link
                  href="https://cgec.org.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="default" className="gap-2 shadow-xl">
                    Know More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'h-1.5 w-4 rounded-full bg-white/40 transition-all',
                  index === activeIndex && 'w-6 bg-white'
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
                  src={COLLEGE_IMAGES.logo || '/placeholder.svg'}
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
