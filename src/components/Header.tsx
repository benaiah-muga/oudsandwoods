import { ShoppingCart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-serif font-bold tracking-tight">
            Ouds & Woods
          </h1>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/shop" className="text-sm font-medium transition-colors hover:text-secondary">
            Shop
          </Link>
          <Link to="/collections" className="text-sm font-medium transition-colors hover:text-secondary">
            Collections
          </Link>
          <Link to="/about" className="text-sm font-medium transition-colors hover:text-secondary">
            About
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Link to="/auth">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-secondary text-xs flex items-center justify-center text-primary font-semibold">
              0
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
