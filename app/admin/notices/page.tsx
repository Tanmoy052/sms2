"use client"

import type React from "react"

import { useState } from "react"
import { useNotices } from "@/hooks/use-persistent-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, Bell } from "lucide-react"
import type { Notice } from "@/lib/types"

export default function NoticesPage() {
  const {
    notices,
    isLoading,
    addNotice,
    updateNotice,
    deleteNotice,
    mutate: refreshNotices,
  } = useNotices()
  const [editNotice, setEditNotice] = useState<Notice | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
      isActive: formData.get("isActive") === "on",
      publishedAt: new Date().toISOString(),
      expiresAt: formData.get("expiresAt") || null,
    }

    await addNotice(data as any)
    await refreshNotices()
    setIsAddOpen(false)
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editNotice) return

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
      isActive: formData.get("isActive") === "on",
      expiresAt: formData.get("expiresAt") || null,
    }
    await updateNotice(editNotice.id, data as any)
    await refreshNotices()
    setIsEditOpen(false)
    setEditNotice(null)
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this notice?")) return
    await deleteNotice(id)
    await refreshNotices()
  }

  const categoryColors: Record<string, string> = {
    general: "bg-gray-100 text-gray-700",
    academic: "bg-blue-100 text-blue-700",
    exam: "bg-red-100 text-red-700",
    event: "bg-green-100 text-green-700",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notices</h1>
          <p className="text-sm text-muted-foreground">Manage announcements</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Notice</DialogTitle>
            </DialogHeader>
            <NoticeForm onSubmit={handleAdd} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid gap-4">
          {notices?.map((notice) => (
            <Card key={notice.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{notice.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[notice.category]}`}>
                          {notice.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${notice.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {notice.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditNotice(notice)
                        setIsEditOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(notice.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{notice.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Published: {new Date(notice.publishedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
          {notices?.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No notices found</CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
          </DialogHeader>
          {editNotice && <NoticeForm notice={editNotice} onSubmit={handleEdit} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NoticeForm({
  notice,
  onSubmit,
}: {
  notice?: Notice
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={notice?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" name="content" rows={4} defaultValue={notice?.content} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={notice?.category || "general"}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
            <SelectItem value="event">Event</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="isActive" name="isActive" defaultChecked={notice?.isActive ?? true} />
        <Label htmlFor="isActive">Active</Label>
      </div>
      <div className="flex justify-end">
        <Button type="submit">{notice ? "Update" : "Add"} Notice</Button>
      </div>
    </form>
  )
}
