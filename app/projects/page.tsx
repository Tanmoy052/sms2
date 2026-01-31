"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useProjects } from "@/hooks/use-persistent-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Github } from "lucide-react"

export default function ProjectsPage() {
  const { projects, isLoading } = useProjects()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-6jybyzr1r5WRLGCSQ4h5arS8GijNfgo7GA&s" alt="CGEC Logo" width={40} height={40} className="rounded-full" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg">CGEC</span>
              <span className="text-sm text-muted-foreground">Student Portal</span>
            </div>
          </Link>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Student Projects</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore innovative projects developed across CGEC departments. This list updates automatically when anyone
            adds, edits, or deletes a project in the portal.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading projects…</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{project.department.split(" ")[0]}</Badge>
                    <span className="text-sm text-muted-foreground">{project.year}</span>
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(project.technologies || []).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {project.githubUrl && (
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                          Code
                        </a>
                      </Button>
                    )}
                    {(project.websiteUrl || project.demoUrl) && (
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent" asChild>
                        <a href={(project.websiteUrl || project.demoUrl) as string} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
