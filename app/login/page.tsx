"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useState, Suspense, useCallback, memo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Shield, GraduationCap, Users, ChevronRight, User } from "lucide-react"
import { loginAction } from "./actions"
import { DEPARTMENTS } from "@/lib/types"

const DEPT_SHORT_CODES: Record<string, string> = {
  "Computer Science & Engineering": "CSE",
  "Electronics & Communication Engineering": "ECE",
  "Electrical Engineering": "EE",
  "Mechanical Engineering": "ME",
  "Civil Engineering": "CE",
}

const DEPT_COLORS: Record<string, string> = {
  "Computer Science & Engineering": "bg-blue-500",
  "Electronics & Communication Engineering": "bg-green-500",
  "Electrical Engineering": "bg-yellow-500",
  "Mechanical Engineering": "bg-orange-500",
  "Civil Engineering": "bg-purple-500",
}

const portalTypes = {
  admin: {
    title: "Admin Portal",
    description: "Access administrative controls and manage all records",
    icon: Shield,
    color: "bg-red-500",
    demoUsername: "admin",
    demoPassword: "admin123",
    usernameLabel: "Username",
    usernamePlaceholder: "Enter admin username",
  },
  teacher: {
    title: "Teacher Portal",
    description: "Manage attendance, projects, notices for your department",
    icon: Users,
    color: "bg-blue-500",
    demoUsername: "amit.kumar",
    demoPassword: "teacher123",
    usernameLabel: "Username",
    usernamePlaceholder: "Enter teacher username",
  },
  student: {
    title: "Student Portal",
    description: "Access your academic records, attendance and notices",
    icon: GraduationCap,
    color: "bg-green-500",
    demoUsername: "34900122001",
    demoPassword: "any",
    usernameLabel: "Roll Number",
    usernamePlaceholder: "Enter 11-digit roll number",
  },
} as const

const PortalCard = memo(function PortalCard({
  type,
  portal,
  onClick,
}: {
  type: string
  portal: (typeof portalTypes)[keyof typeof portalTypes]
  onClick: () => void
}) {
  const Icon = portal.icon
  return (
    <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer" onClick={onClick}>
      <CardHeader className="text-center pb-2">
        <div className={`mx-auto h-12 w-12 rounded-full ${portal.color} flex items-center justify-center mb-2`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-lg">{portal.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center">{portal.description}</p>
        <div className="mt-3 p-2 bg-muted rounded text-xs text-center">
          <p className="font-medium">Demo:</p>
          <p>
            {portal.usernameLabel}: <span className="font-mono">{portal.demoUsername}</span>
          </p>
          <p>
            Password: <span className="font-mono">{portal.demoPassword}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
})

const DeptCard = memo(function DeptCard({
  department,
  onClick,
}: {
  department: string
  onClick: () => void
}) {
  const shortCode = DEPT_SHORT_CODES[department] || department
  const color = DEPT_COLORS[department] || "bg-gray-500"

  return (
    <Card className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer" onClick={onClick}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`h-12 w-12 rounded-full ${color} flex items-center justify-center shrink-0`}>
          <span className="text-white font-bold text-sm">{shortCode}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{department}</h3>
          <p className="text-xs text-muted-foreground">Select to view teachers</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  )
})

interface TeacherInfo {
  id: string
  name: string
  username: string
  department: string
  designation: string
}

function LoginContent() {
  const searchParams = useSearchParams()
  const portalType = (searchParams.get("type") as keyof typeof portalTypes) || null
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [deptTeachers, setDeptTeachers] = useState<TeacherInfo[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherInfo | null>(null)

  const fetchTeachersByDept = useCallback(async (dept: string) => {
    setLoadingTeachers(true)
    try {
      const res = await fetch(`/api/teachers?department=${encodeURIComponent(dept)}`)
      const data = await res.json()
      setDeptTeachers(data.teachers || [])
    } catch (err) {
      console.error("Failed to fetch teachers:", err)
      setDeptTeachers([])
    } finally {
      setLoadingTeachers(false)
    }
  }, [])

  const handleDeptSelect = useCallback(
    (dept: string) => {
      setSelectedDept(dept)
      fetchTeachersByDept(dept)
    },
    [fetchTeachersByDept],
  )

  const handleTeacherSelect = useCallback((teacher: TeacherInfo) => {
    setSelectedTeacher(teacher)
    setUsername(teacher.username)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!portalType) return

      setError("")
      setLoading(true)

      const formData = new FormData()
      formData.append("username", username)
      formData.append("password", password)
      formData.append("role", portalType)

      const result = await loginAction(formData)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        window.location.href = result.redirect || "/"
      }
    },
    [portalType, username, password],
  )

  const fillDemoCredentials = useCallback(
    (demoUser?: string, demoPass?: string) => {
      if (portalType) {
        const portal = portalTypes[portalType]
        setUsername(demoUser || portal.demoUsername)
        setPassword(demoPass || portal.demoPassword)
      }
    },
    [portalType],
  )

  const goBackToPortal = useCallback(() => {
    setSelectedDept(null)
    setSelectedTeacher(null)
    setDeptTeachers([])
    setUsername("")
    setPassword("")
    window.location.href = "/login"
  }, [])

  const goBackToDeptSelect = useCallback(() => {
    setSelectedDept(null)
    setSelectedTeacher(null)
    setDeptTeachers([])
    setUsername("")
    setPassword("")
  }, [])

  const goBackToTeacherSelect = useCallback(() => {
    setSelectedTeacher(null)
    setPassword("")
  }, [])

  const navigateToPortal = useCallback((type: string) => {
    window.location.href = `/login?type=${type}`
  }, [])

  // Portal selection view
  if (!portalType) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/cgec-logo.png"
                alt="CGEC Logo"
                width={64}
                height={64}
                className="rounded-full"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold">CGEC Student Management System</h1>
            <p className="text-muted-foreground mt-2">Select your portal to continue</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {(Object.keys(portalTypes) as Array<keyof typeof portalTypes>).map((type) => (
              <PortalCard key={type} type={type} portal={portalTypes[type]} onClick={() => navigateToPortal(type)} />
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Student Roll Number Format</CardTitle>
              <CardDescription>Any valid roll number can login with any password</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Format: <span className="font-mono font-semibold">349XXXYYZZ</span> (11 digits)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-muted rounded">
                  <span className="font-semibold">349</span> = College Code
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="font-semibold">XXX</span> = Dept Code
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="font-semibold">YY</span> = Year (22,23,24,25)
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="font-semibold">ZZZ</span> = Serial (001-999)
                </div>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2 text-xs">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-center">
                  <span className="font-semibold">001</span>
                  <br />
                  CSE
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded text-center">
                  <span className="font-semibold">002</span>
                  <br />
                  ECE
                </div>
                <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-center">
                  <span className="font-semibold">016</span>
                  <br />
                  EE
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded text-center">
                  <span className="font-semibold">004</span>
                  <br />
                  ME
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded text-center">
                  <span className="font-semibold">005</span>
                  <br />
                  CE
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Example: <span className="font-mono">34900124015</span> = CSE, 2024 batch, Roll 015
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (portalType === "teacher" && !selectedDept) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={goBackToPortal}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portal Selection
          </button>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                <Users className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Teacher Portal</CardTitle>
              <CardDescription>Select your department to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEPARTMENTS.map((dept) => (
                <DeptCard key={dept} department={dept} onClick={() => handleDeptSelect(dept)} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (portalType === "teacher" && selectedDept && !selectedTeacher) {
    const shortCode = DEPT_SHORT_CODES[selectedDept] || selectedDept
    const color = DEPT_COLORS[selectedDept] || "bg-gray-500"

    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={goBackToDeptSelect}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Department Selection
          </button>

          <Card>
            <CardHeader className="text-center">
              <div className={`mx-auto h-14 w-14 rounded-full ${color} flex items-center justify-center mb-2`}>
                <span className="text-white font-bold">{shortCode}</span>
              </div>
              <CardTitle className="text-xl">{selectedDept}</CardTitle>
              <CardDescription>Select your name to login</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTeachers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : deptTeachers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No teachers found in this department</p>
                  <p className="text-xs text-muted-foreground mt-2">Contact admin to add teachers</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {deptTeachers.map((teacher) => (
                    <Card
                      key={teacher.id}
                      className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                      onClick={() => handleTeacherSelect(teacher)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{teacher.name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.designation}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (portalType === "teacher" && selectedTeacher) {
    const shortCode = DEPT_SHORT_CODES[selectedDept || ""] || ""
    const color = DEPT_COLORS[selectedDept || ""] || "bg-gray-500"

    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={goBackToTeacherSelect}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teacher Selection
          </button>

          <Card>
            <CardHeader className="text-center">
              <div className={`mx-auto h-14 w-14 rounded-full ${color} flex items-center justify-center mb-2`}>
                <span className="text-white font-bold">{shortCode}</span>
              </div>
              <CardTitle className="text-xl">{selectedTeacher.name}</CardTitle>
              <CardDescription>{selectedTeacher.designation}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" type="text" value={username} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium text-center mb-2">Demo Password</p>
                <div className="text-xs text-center">
                  <p>
                    Password: <span className="font-mono font-semibold">teacher123</span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs bg-transparent"
                  onClick={() => setPassword("teacher123")}
                >
                  Fill Demo Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Login form view for admin and student
  const portal = portalTypes[portalType]
  const Icon = portal.icon

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={goBackToPortal}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portal Selection
        </button>

        <Card>
          <CardHeader className="text-center">
            <div className={`mx-auto h-14 w-14 rounded-full ${portal.color} flex items-center justify-center mb-2`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl">{portal.title}</CardTitle>
            <CardDescription>{portal.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">{portal.usernameLabel}</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder={portal.usernamePlaceholder}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter any password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {portalType === "student" && (
                  <p className="text-xs text-muted-foreground">Any password works for students</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            {portalType === "student" ? (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium text-center mb-2">Try Any Roll Number</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    className="bg-background p-2 rounded cursor-pointer hover:bg-accent text-center"
                    onClick={() => fillDemoCredentials("34900122001", "any")}
                  >
                    <span className="font-semibold">CSE 2022</span>
                    <br />
                    <span className="font-mono">34900122001</span>
                  </div>
                  <div
                    className="bg-background p-2 rounded cursor-pointer hover:bg-accent text-center"
                    onClick={() => fillDemoCredentials("34900223020", "any")}
                  >
                    <span className="font-semibold">ECE 2023</span>
                    <br />
                    <span className="font-mono">34900223020</span>
                  </div>
                  <div
                    className="bg-background p-2 rounded cursor-pointer hover:bg-accent text-center"
                    onClick={() => fillDemoCredentials("34901624012", "any")}
                  >
                    <span className="font-semibold">EE 2024</span>
                    <br />
                    <span className="font-mono">34901624012</span>
                  </div>
                  <div
                    className="bg-background p-2 rounded cursor-pointer hover:bg-accent text-center"
                    onClick={() => fillDemoCredentials("34900525007", "any")}
                  >
                    <span className="font-semibold">CE 2025</span>
                    <br />
                    <span className="font-mono">34900525007</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Or try any valid format: 349 + dept + year + serial
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium text-center mb-2">Demo Credentials</p>
                <div className="text-xs text-center space-y-1">
                  <p>
                    Username: <span className="font-mono font-semibold">{portal.demoUsername}</span>
                  </p>
                  <p>
                    Password: <span className="font-mono font-semibold">{portal.demoPassword}</span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs bg-transparent"
                  onClick={() => fillDemoCredentials()}
                >
                  Fill Demo Credentials
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
