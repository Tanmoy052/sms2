"use client"

import type React from "react"

import { useState } from "react"
import { useProjects } from "@/hooks/use-persistent-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, FolderKanban, ExternalLink, Github, Globe, Eye } from "lucide-react"
import type { Project } from "@/lib/types"
import { DEPARTMENTS } from "@/lib/types"

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    mutate: refreshProjects,
  } = useProjects()
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [viewProject, setViewProject] = useState<Project | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      department: formData.get("department"),
      year: Number.parseInt(formData.get("year") as string),
      status: formData.get("status"),
      technologies: (formData.get("technologies") as string).split(",").map((t) => t.trim()),
      studentNames: (formData.get("studentNames") as string).split(",").map((t) => t.trim()),
      demoUrl: formData.get("demoUrl") || undefined,
      repoUrl: formData.get("repoUrl") || undefined,
      githubUrl: formData.get("githubUrl") || undefined,
      websiteUrl: formData.get("websiteUrl") || undefined,
      studentIds: [],
    }

    await addProject(data as any)
    await refreshProjects()
    setIsAddOpen(false)
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editProject) return

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      department: formData.get("department"),
      year: Number.parseInt(formData.get("year") as string),
      status: formData.get("status"),
      technologies: (formData.get("technologies") as string).split(",").map((t) => t.trim()),
      studentNames: (formData.get("studentNames") as string).split(",").map((t) => t.trim()),
      demoUrl: formData.get("demoUrl") || undefined,
      repoUrl: formData.get("repoUrl") || undefined,
      githubUrl: formData.get("githubUrl") || undefined,
      websiteUrl: formData.get("websiteUrl") || undefined,
    }

    await updateProject(editProject.id, data as any)
    await refreshProjects()
    setIsEditOpen(false)
    setEditProject(null)
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return

    await deleteProject(id)
    await refreshProjects()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage student projects</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSubmit={handleAdd} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects?.map((project) => (
            <Card key={project.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FolderKanban className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="text-xs text-muted-foreground">{project.department}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setViewProject(project)
                        setIsViewOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditProject(project)
                        setIsEditOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                {project.studentNames && project.studentNames.length > 0 && (
                  <p className="text-xs text-muted-foreground mb-2">By: {project.studentNames.join(", ")}</p>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 bg-muted rounded text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${project.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {project.status}
                  </span>
                  <div className="flex gap-2">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <Github className="h-3 w-3 mr-1" />
                          GitHub
                        </Button>
                      </a>
                    )}
                    {project.websiteUrl && (
                      <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Website
                        </Button>
                      </a>
                    )}
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Demo
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {projects?.length === 0 && (
            <Card className="col-span-2">
              <CardContent className="py-8 text-center text-muted-foreground">No projects found</CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editProject && <ProjectForm project={editProject} onSubmit={handleEdit} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {viewProject && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{viewProject.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {viewProject.department} | {viewProject.year}
                </p>
              </div>
              <p className="text-sm">{viewProject.description}</p>
              {viewProject.studentNames && viewProject.studentNames.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Team Members:</p>
                  <p className="text-sm text-muted-foreground">{viewProject.studentNames.join(", ")}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-2">Technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {viewProject.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-1 bg-muted rounded text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {viewProject.githubUrl && (
                  <a href={viewProject.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </a>
                )}
                {viewProject.websiteUrl && (
                  <a href={viewProject.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </Button>
                  </a>
                )}
                {viewProject.demoUrl && (
                  <a href={viewProject.demoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Demo
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProjectForm({
  project,
  onSubmit,
}: {
  project?: Project
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={project?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={project?.description} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="studentNames">Student Names (comma separated)</Label>
        <Input
          id="studentNames"
          name="studentNames"
          defaultValue={project?.studentNames?.join(", ")}
          placeholder="e.g., Rahul Sharma, Priya Das"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select name="department" defaultValue={project?.department || DEPARTMENTS[0]}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            defaultValue={project?.year || new Date().getFullYear()}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="technologies">Technologies (comma separated)</Label>
        <Input id="technologies" name="technologies" defaultValue={project?.technologies.join(", ")} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={project?.status || "ongoing"}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
        <Input
          id="githubUrl"
          name="githubUrl"
          type="url"
          defaultValue={project?.githubUrl}
          placeholder="https://github.com/..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="websiteUrl">Website URL (optional)</Label>
        <Input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          defaultValue={project?.websiteUrl}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="demoUrl">Demo URL (optional)</Label>
        <Input id="demoUrl" name="demoUrl" type="url" defaultValue={project?.demoUrl} />
      </div>
      <div className="flex justify-end">
        <Button type="submit">{project ? "Update" : "Add"} Project</Button>
      </div>
    </form>
  )
}
