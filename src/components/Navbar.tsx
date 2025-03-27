
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpenText, LogOut, Menu, X } from "lucide-react";
import { authService } from "@/utils/authService";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 lg:px-12 py-4", 
        isScrolled 
          ? "bg-white/70 backdrop-blur-lg shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <BookOpenText className="h-8 w-8 text-bookswap-teal" />
          <span className="font-serif text-2xl font-bold text-bookswap-navy">
            Book<span className="text-bookswap-coral">Swap</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="nav-link">Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/welcome" className="nav-link">Books</Link>
              <Link to="/wishlist" className="nav-link">Wishlist</Link>
              <Link to="/add-book" className="nav-link">Add Book</Link>
              <div className="flex items-center gap-4">
                <span className="text-bookswap-navy font-medium">
                  Hi, {user?.username}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-bookswap-coral border-bookswap-coral hover:bg-bookswap-coral/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="button-outline py-2 px-4">Login</Link>
              <Link to="/signup" className="button-primary py-2 px-4">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-bookswap-navy"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-white/95 backdrop-blur-lg animate-fade-in">
          <div className="flex flex-col items-center justify-center h-full gap-6 text-xl">
            <Link to="/" className="nav-link font-medium">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/welcome" className="nav-link font-medium">Books</Link>
                <Link to="/wishlist" className="nav-link font-medium">Wishlist</Link>
                <Link to="/add-book" className="nav-link font-medium">Add Book</Link>
                <div className="flex flex-col items-center mt-6 gap-2">
                  <span className="text-bookswap-navy font-medium">
                    Hi, {user?.username}
                  </span>
                  <Button 
                    variant="outline"
                    onClick={handleLogout}
                    className="text-bookswap-coral border-bookswap-coral hover:bg-bookswap-coral/10 mt-2"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 mt-6">
                <Link to="/login" className="button-outline w-full text-center">Login</Link>
                <Link to="/signup" className="button-primary w-full text-center">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
