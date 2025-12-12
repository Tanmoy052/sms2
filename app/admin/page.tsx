import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, Bell, FolderKanban } from "lucide-react"
import { dataStore } from "@/lib/store"

export default function AdminDashboard() {
  const stats = dataStore.getStats()

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      subtext: `${stats.activeStudents} active`,
      icon: GraduationCap,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      subtext: `${stats.activeTeachers} active`,
      icon: Users,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Active Notices",
      value: stats.totalNotices,
      subtext: "Published",
      icon: Bell,
      color: "text-orange-600 bg-orange-100",
    },
    {
      title: "Projects",
      value: stats.totalProjects,
      subtext: "Submitted",
      icon: FolderKanban,
      color: "text-purple-600 bg-purple-100",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome to CGEC Admin Panel</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Use the sidebar to navigate to different sections and manage records.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Add, edit, or delete student records</li>
              <li>• Manage teacher information</li>
              <li>• Publish notices and announcements</li>
              <li>• Review student projects</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>College:</strong> Coochbehar Government Engineering College
            </p>
            <p>
              <strong>System:</strong> Student Management Portal
            </p>
            <p>
              <strong>Admin Access:</strong> Full CRUD Operations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
