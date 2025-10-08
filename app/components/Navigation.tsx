import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  BookOpen,
  Code,
  Target,
  Trophy,
  ShoppingBag,
  History,
  User,
  Shield,
  HelpCircle,
  LogOut,
  Menu,
  Star,
} from "lucide-react";
import { MilestackLogo } from "./MilestackLogo";
import { Button } from "@/components/ui/button";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

interface NavigationProps {
  onLogout: () => void;
  points: number;
  userName: string;
  userEmail: string;
  userProfilePicture?: string | null;
  userOAuthAvatarUrl?: string | null;
  isAuthenticated?: boolean;
}

export function Navigation({
  onLogout,
  points,
  userName,
  userEmail,
  userProfilePicture,
  userOAuthAvatarUrl,
  isAuthenticated = true,
}: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    {
      id: "assignments",
      label: "Assignments",
      icon: BookOpen,
      path: "/assignments",
    },
    {
      id: "challenges",
      label: "Practice",
      icon: Code,
      path: "/challenge/library",
    },
    { id: "pathway", label: "Learning Path", icon: Target, path: "/pathway" },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      path: "/leaderboard",
    },
    {
      id: "rewards",
      label: "Rewards Shop",
      icon: ShoppingBag,
      path: "/rewards",
    },
    { id: "history", label: "AI History", icon: History, path: "/ai/ask" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
    { id: "honor", label: "Honor Code", icon: Shield, path: "/honor" },
    { id: "help", label: "Help", icon: HelpCircle, path: "/help" },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setShowMobileMenu(false);
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="flex items-center hover-elevate px-2 py-1 rounded-md"
              data-testid="button-logo"
            >
              <MilestackLogo size={40} />
              <span className="ml-3 text-xl font-bold">Milestack</span>
            </button>

            <div className="hidden lg:flex ml-10 space-x-8">
              {navigationItems.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`px-1 pt-1 pb-3 text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? "text-primary border-b-2 border-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                  data-testid={`nav-${item.id}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <div className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-blue-100">
                <Star className="w-5 h-5 text-[#F59E0B] mr-2" />
                <span
                  className="font-bold text-foreground"
                  data-testid="text-points"
                >
                  {points}
                </span>
                <span className="ml-1 text-muted-foreground">pts</span>
              </div>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  data-testid="button-profile-dropdown"
                >
                  {userProfilePicture || userOAuthAvatarUrl ? (
                    <Image
                      src={userProfilePicture || userOAuthAvatarUrl || ""}
                      alt={`${userName}'s profile`}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback =
                          target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                      onLoad={(e) => {
                        // Hide initials fallback when image loads successfully
                        const target = e.target as HTMLImageElement;
                        const fallback =
                          target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "none";
                      }}
                      priority
                    />
                  ) : null}
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-r from-primary to-blue-400 flex items-center justify-center text-white font-medium ${
                      userProfilePicture || userOAuthAvatarUrl
                        ? "hidden"
                        : "flex"
                    }`}
                  >
                    {userName.charAt(0)}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-popover rounded-lg shadow-lg py-2 border">
                    <div className="px-4 py-2 border-b">
                      <p
                        className="text-sm font-medium"
                        data-testid="text-profile-name"
                      >
                        {userName}
                      </p>
                      <p
                        className="text-xs text-muted-foreground"
                        data-testid="text-profile-email"
                      >
                        {userEmail}
                      </p>
                    </div>
                    {navigationItems.slice(5).map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            handleNavigation(item.path);
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover-elevate flex items-center"
                          data-testid={`dropdown-${item.id}`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </button>
                      );
                    })}
                    <div className="border-t mt-2 pt-2">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover-elevate flex items-center"
                        data-testid="button-logout"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigation("/login")}
                  data-testid="button-login"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleNavigation("/signup")}
                  data-testid="button-signup"
                >
                  Sign Up
                </Button>
              </div>
            )}

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden"
              data-testid="button-mobile-menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="lg:hidden border-t">
            <div className="py-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavigation(item.path);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover-elevate flex items-center ${
                      pathname === item.path
                        ? "text-primary bg-primary/10"
                        : "text-foreground"
                    }`}
                    data-testid={`mobile-nav-${item.id}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
