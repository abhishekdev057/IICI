"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Settings, LogOut, Home, Menu, X, User } from "lucide-react";
import Link from "next/link";
import { useData } from "@/contexts/data-context";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from "./notification-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  variant?: "landing" | "dashboard" | "admin" | "institution";
  title?: string;
  showInstitutionBadge?: boolean;
}

export function Navigation({
  variant = "landing",
  title,
  showInstitutionBadge = false,
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state } = useData();
  const { data: session, status } = useSession();

  const application = state.currentApplication;
  const institutionData = application?.institutionData;

  const getLogo = () => (
    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">II</span>
      </div>
      <span className="font-bold text-xl">{title || "IIICI"}</span>
    </Link>
  );

  const getNavigationItems = () => {
    switch (variant) {
      case "landing":
        return (
          <>
            <Link href="/about">
              <Button variant="ghost" size="sm">
                About
              </Button>
            </Link>
            <Link href="/process">
              <Button variant="ghost" size="sm">
                Process
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost" size="sm">
                FAQ
              </Button>
            </Link>
            {session ? (
              <div className="flex items-center space-x-2">
                {application?.status === "submitted" || application?.status === "under_review" || application?.status === "certified" || application?.status === "approved" ? (
                  <Link href="/dashboard">
                    <Button size="sm" className="btn-primary">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/application">
                    <Button size="sm" className="btn-primary">
                      Continue Application
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session.user?.image || ""}
                          alt={session.user?.name || ""}
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(application?.status === "submitted" || application?.status === "under_review" || application?.status === "certified" || application?.status === "approved") && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/application">
                        {application?.status === "submitted" || application?.status === "under_review" || application?.status === "certified" || application?.status === "approved"
                          ? "View Application" 
                          : "Application"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/institution">Institution Settings</Link>
                    </DropdownMenuItem>
                    {(session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN') && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/application">
                  <Button size="sm" className="btn-primary">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </>
        );
      case "dashboard":
      case "admin":
      case "institution":
        return (
          <>
            <NotificationDropdown />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Home className="w-4 h-4" />
              </Link>
            </Button>
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user?.image || ""}
                        alt={session.user?.name || ""}
                      />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(application?.status === "submitted" || application?.status === "under_review" || application?.status === "certified") && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/application">
                      {application?.status === "submitted" || application?.status === "under_review" || application?.status === "certified" 
                        ? "View Application" 
                        : "Application"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/institution">Institution Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const getMobileNavigationItems = () => {
    switch (variant) {
      case "landing":
        return (
          <div className="flex flex-col space-y-4 p-4">
            <Button variant="ghost" className="justify-start">
              About
            </Button>
            <Button variant="ghost" className="justify-start">
              Process
            </Button>
            <Button variant="ghost" className="justify-start">
              FAQ
            </Button>
            {session ? (
              <>
                {application?.status === "submitted" || application?.status === "under_review" || application?.status === "certified" || application?.status === "approved" ? (
                  <Link href="/dashboard" className="w-full">
                    <Button className="w-full btn-primary">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/application" className="w-full">
                    <Button className="w-full btn-primary">
                      Continue Application
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth" className="w-full">
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link href="/application" className="w-full">
                  <Button className="w-full btn-primary">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        );
      case "dashboard":
      case "admin":
      case "institution":
        return (
          <div className="flex flex-col space-y-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Notifications</span>
              <NotificationDropdown />
            </div>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
            {session && (
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            {getLogo()}
            {showInstitutionBadge && institutionData && (
              <>
                <Badge variant="outline">{institutionData.name}</Badge>
                {application && (
                  <Badge
                    variant={
                      application.status === "submitted"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {application.status === "submitted"
                      ? "Submitted"
                      : application.status}
                  </Badge>
                )}
              </>
            )}
            {variant === "admin" && (
              <Badge className="bg-destructive">Admin Access</Badge>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {getNavigationItems()}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center justify-between mb-6">
                  <div onClick={() => setIsMobileMenuOpen(false)}>
                    {getLogo()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {getMobileNavigationItems()}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
