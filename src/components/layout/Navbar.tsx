import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  FileText, 
  User, 
  LogIn, 
  LogOut, 
  PlusCircle, 
  Home, 
  Sparkles,
  Settings,
  UserCog 
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isLoggedIn?: boolean;
}

const Navbar = ({ isLoggedIn }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">Resume AI Nexus</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/features" className="text-foreground/80 hover:text-primary transition-colors">
            Features
          </Link>
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/dashboard" className="text-foreground/80 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserCog className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button asChild variant="default">
                <Link to="/register">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Register
                </Link>
              </Button>
            </>
          )}
        </div>
        
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <Link 
              to="/" 
              className="block py-2 text-foreground/80 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Home
              </div>
            </Link>
            <Link 
              to="/features" 
              className="block py-2 text-foreground/80 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Features
              </div>
            </Link>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block py-2 text-foreground/80 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </div>
                </Link>
                <div className="flex items-center space-x-2 py-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" onClick={() => signOut()} className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block"
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link 
                  to="/register" 
                  className="block"
                  onClick={() => setIsOpen(false)}
                >
                  <Button className="w-full justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Register
                  </Button>
                </Link>
              </>
            )}
            {user && (
              <>
                <Link 
                  to="/profile" 
                  className="block py-2 text-foreground/80 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <UserCog className="h-4 w-4 mr-2" />
                    Profile Settings
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
