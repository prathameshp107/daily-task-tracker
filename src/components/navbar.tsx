"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Plus, Settings, User, LogOut, ChevronDown, BarChart3, Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [notifications, setNotifications] = useState(3); // Example notification count
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TaskFlow
          </Link>
          <Badge variant="outline" className="hidden md:flex items-center gap-1 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            Active
          </Badge>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/">
            <Button 
              variant={pathname === "/" ? "default" : "ghost"} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Tasks
            </Button>
          </Link>
          <Link href="/analytics">
            <Button 
              variant={pathname === "/analytics" ? "default" : "ghost"} 
              size="sm"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="relative rounded-full h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setNotifications(0)}
        >
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {notifications}
            </span>
          )}
        </Button>
        
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 pl-3 pr-2 h-9">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  john@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
