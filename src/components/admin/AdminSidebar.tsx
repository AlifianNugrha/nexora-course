import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard, BookOpen, Layers, Calendar, FileText, Users,
  LogOut, ArrowLeft, Camera, Ticket, X, ClipboardList, Menu
} from "lucide-react";

export type Tab = "dashboard" | "categories" | "courses" | "schedules" | "materials" | "absensi" | "events" | "gallery" | "announcements" | "users";

type Props = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
  role: string;
};

const allTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "mentor"] },
  { id: "categories", label: "Categories", icon: Layers, roles: ["super_admin"] },
  { id: "courses", label: "Courses", icon: BookOpen, roles: ["super_admin", "mentor"] },
  { id: "schedules", label: "Schedules", icon: Calendar, roles: ["super_admin", "mentor"] },
  { id: "materials", label: "Materials", icon: FileText, roles: ["super_admin", "mentor"] },
  { id: "events", label: "Events", icon: Ticket, roles: ["super_admin"] },
  { id: "gallery", label: "Gallery", icon: Camera, roles: ["super_admin"] },
  { id: "announcements", label: "Announcements", icon: FileText, roles: ["super_admin"] },
  { id: "absensi", label: "Absensi", icon: ClipboardList, roles: ["super_admin", "mentor"] },
  { id: "users", label: "Users", icon: Users, roles: ["super_admin"] },
] as const;

export function AdminSidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout, role }: Props) {
  const visibleTabs = allTabs.filter(t => t.roles.includes(role));

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary-deep">Nexora Admin</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as Tab); setIsOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
          <div className="pt-8 mt-8 border-t border-border">
            <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">
              <LogOut className="h-4 w-4" /> Logout
            </button>
            <Link to="/" className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary">
              <ArrowLeft className="h-4 w-4" /> Back to Site
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}

export function AdminHeader({ activeTab, onMenuClick, children }: { activeTab: string; onMenuClick: () => void; children?: React.ReactNode }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:px-8 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100">
          <Menu className="h-5 w-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold capitalize">{activeTab}</h1>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        {children}
      </div>
    </header>
  );
}
