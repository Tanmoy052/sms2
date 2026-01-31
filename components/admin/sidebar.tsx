"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Bell,
  FolderKanban,
  LogOut,
  Menu,
  X,
  CalendarCheck,
} from "lucide-react";
import { useState, useCallback, memo } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: GraduationCap },
  { href: "/admin/teachers", label: "Teachers", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/admin/notices", label: "Notices", icon: Bell },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
];

const NavItem = memo(function NavItem({
  item,
  isActive,
  onClick,
}: {
  item: (typeof navItems)[0];
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      <item.icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
});

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = useCallback(() => {
    window.location.href = "/api/auth/logout";
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-6jybyzr1r5WRLGCSQ4h5arS8GijNfgo7GA&s"
            alt="CGEC Logo"
            width={32}
            height={32}
            className="rounded-full"
            priority
          />
          <span className="font-semibold text-sm">Admin Panel</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMobile}>
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-14 bg-white z-40 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                onClick={closeMobile}
              />
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              type="button"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Image
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-6jybyzr1r5WRLGCSQ4h5arS8GijNfgo7GA&s"
              alt="CGEC Logo"
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
            <div>
              <h2 className="font-bold text-sm text-primary">CGEC Admin</h2>
              <p className="text-xs text-muted-foreground truncate">
                {adminName}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            type="button"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
