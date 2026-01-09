import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, Zap, FileText, MessageSquare, 
  BarChart3, Lightbulb, User, LogOut, Settings 
} from "lucide-react";
import { getCurrentUser, clearAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { name: "Resume Builder", path: "/resume", icon: FileText },
  { name: "Interview", path: "/interview", icon: MessageSquare },
  { name: "Insights", path: "/insights", icon: Lightbulb },
  { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <span className="font-mono text-xl font-bold gradient-text">
              PREP.AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "neon" : "ghost"}
                      className="relative"
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 rounded-lg border border-primary/50"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-primary/10"
                  >
                    <Avatar className="w-8 h-8 bg-gradient-to-br from-primary to-secondary">
                      <AvatarFallback className="bg-transparent text-white text-sm font-semibold">
                        {getInitials(user.name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name?.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
                  <DropdownMenuLabel className="font-mono">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard")}
                    className="cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="gradient" size="lg">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-t border-border/50"
          >
            <div className="container mx-auto px-4 py-4">
              {/* User Info (Mobile) */}
              {user && (
                <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-primary/10 border border-primary/20">
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-primary to-secondary">
                    <AvatarFallback className="bg-transparent text-white font-semibold">
                      {getInitials(user.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Nav Items (Mobile) */}
              {user && (
                <div className="flex flex-col gap-2 mb-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive ? "neon" : "ghost"}
                          className="w-full justify-start"
                        >
                          <Icon className="w-4 h-4" />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Auth Buttons (Mobile) */}
              <div className="space-y-2 pt-4 border-t border-border/50">
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/settings");
                        setIsOpen(false);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)}>
                      <Button variant="gradient" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;