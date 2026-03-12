import { Link, useNavigate } from "react-router-dom";
import { Search, Shirt, Upload, Sparkles, BookmarkCheck, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const initials = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-5 gap-4 sticky top-0 z-30">
      <SidebarTrigger className="lg:hidden" />

      <Link to="/dashboard" className="font-heading font-bold text-xl text-foreground shrink-0 hidden sm:block tracking-tight">
        SmartClosetAI
      </Link>

      <div className="relative flex-1 max-w-sm mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search your wardrobe..." className="pl-10 bg-secondary/50 border-0 h-9 rounded-xl text-sm" />
      </div>

      <nav className="hidden md:flex items-center gap-0.5">
        {[
          { icon: Shirt, label: "Closet", path: "/closet" },
          { icon: Upload, label: "Upload", path: "/upload" },
          { icon: BookmarkCheck, label: "Outfits", path: "/saved-outfits" },
          { icon: Sparkles, label: "AI", path: "/recommendations" },
        ].map((item) => (
          <Button key={item.path} variant="ghost" size="sm" onClick={() => navigate(item.path)} className="text-muted-foreground hover:text-foreground text-xs gap-1.5">
            <item.icon className="h-3.5 w-3.5" /> {item.label}
          </Button>
        ))}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0 shadow-soft hover:shadow-elevated transition-shadow">
            {initials}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          <DropdownMenuItem onClick={() => navigate("/settings")} className="rounded-lg">
            <User className="h-4 w-4 mr-2" /> Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { logout(); navigate("/"); }} className="rounded-lg">
            <LogOut className="h-4 w-4 mr-2" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
