import { Link, useLocation } from "wouter";
import { Car, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Car className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-gray-900">AutoWynajem Pro</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className={`${isActive("/") ? "text-primary font-semibold" : "text-gray-700"} hover:text-primary`}
                >
                  Flota
                </Button>
              </Link>
              <Link href="/customer">
                <Button 
                  variant="ghost" 
                  className={`${isActive("/customer") ? "text-primary font-semibold" : "text-gray-700"} hover:text-primary`}
                >
                  Moje Konto
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  variant="ghost" 
                  className={`${isActive("/admin") ? "text-primary font-semibold" : "text-gray-700"} hover:text-primary`}
                >
                  Panel Admina
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <Bell className="h-5 w-5" />
              </Button>
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Jan Kowalski</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profil</DropdownMenuItem>
                <DropdownMenuItem>Ustawienia</DropdownMenuItem>
                <DropdownMenuItem>Wyloguj</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
