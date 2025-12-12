import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/login?type=admin")
  }

  const adminName = session.user?.name || "Administrator"

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar adminName={adminName} />
      <div className="lg:pl-64">
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
