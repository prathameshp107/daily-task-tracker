"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Plus, Settings, User, LogOut, ChevronDown, BarChart3, Home, Menu, Clock, CheckCircle, Calendar, Zap, CalendarCheck, CalendarX, Settings as SettingsIcon, FolderOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth, useUserProfile, useLogout } from "@/contexts";

export function Navbar() {
  const [notifications, setNotifications] = useState(3);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  // Authentication hooks
  const { isAuthenticated } = useAuth();
  const { displayName, initials, user } = useUserProfile();
  const { logout } = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "sticky top-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 transition-all duration-300",
      scrolled 
        ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200/80 dark:border-gray-800/80"
        : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-transparent"
    )}>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
          >
            TaskFlow
          </Link>
          <Badge 
            variant="outline" 
            className="hidden md:flex items-center gap-1.5 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-medium">Active</span>
          </Badge>
        </div>
        
        {/* Desktop Navigation - Only show if authenticated */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            <Link href="/tasks">
              <Button 
                variant={pathname === "/tasks" ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2 px-3 py-1.5 h-9 transition-all hover:scale-[1.02]"
              >
                <Home className="h-4 w-4" />
                <span className="font-medium">Tasks</span>
              </Button>
            </Link>
            <Link href="/analytics">
              <Button 
                variant={pathname === "/analytics" ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2 px-3 py-1.5 h-9 transition-all hover:scale-[1.02]"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Analytics</span>
              </Button>
            </Link>
            <Link href="/projects">
              <Button 
                variant={pathname === "/projects" ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2 px-3 py-1.5 h-9 transition-all hover:scale-[1.02]"
              >
                <FolderOpen className="h-4 w-4" />
                <span className="font-medium">Projects</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button 
                variant={pathname.startsWith("/settings") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2 px-3 py-1.5 h-9 transition-all hover:scale-[1.02]"
              >
                <SettingsIcon className="h-4 w-4" />
                <span className="font-medium">Settings</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="relative rounded-full h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          onClick={() => setNotifications(0)}
        >
          <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
              {notifications}
            </span>
          )}
        </Button>
        
        <ThemeToggle />
        
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2 pl-3 pr-2 h-9 transition-all hover:shadow-sm"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                  {initials}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md" 
              align="end"
            >
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{user?.name || displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem className="px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <User className="mr-2 h-4 w-4 opacity-70" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Settings className="mr-2 h-4 w-4 opacity-70" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem 
                className="px-2 py-1.5 rounded-md text-sm cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4 opacity-70" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
