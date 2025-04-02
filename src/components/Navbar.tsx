
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  PanelRight, 
  Heart, 
  BookPlus, 
  RefreshCcw,
  Menu, 
  X, 
  LogOut,
  BookOpenText,
  User
} from "lucide-react";
import { authService } from "@/utils/authService";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is logged in
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [location.pathname]);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    navigate("/");
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  // Render mobile menu
  const renderMobileMenu = () => (
    <div 
      className={cn(
        "fixed inset-0 bg-white z-50 transition-transform duration-300 transform lg:hidden",
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <Link to="/" className="flex items-center" onClick={closeMenu}>
          <BookOpenText className="w-8 h-8 text-bookswap-teal mr-2" />
          <span className="font-bold text-xl text-bookswap-navy">BookSwap</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleMenu}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-4">
          {user ? (
            <>
              <li>
                <Link
                  to="/welcome"
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  <BookOpenText className="mr-3 h-5 w-5 text-bookswap-navy" />
                  <span>Browse Books</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/add-book"
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  <BookPlus className="mr-3 h-5 w-5 text-bookswap-navy" />
                  <span>Add Book</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  <Heart className="mr-3 h-5 w-5 text-bookswap-navy" />
                  <span>Wishlist</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/swap-requests"
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  <RefreshCcw className="mr-3 h-5 w-5 text-bookswap-navy" />
                  <span>Swap Requests</span>
                </Link>
              </li>
              <li className="pt-4 border-t">
                <div className="flex items-center p-2 text-bookswap-navy">
                  <User className="mr-3 h-5 w-5" />
                  <span className="font-medium">{user.username}</span>
                </div>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Log Out</span>
                </Button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="block p-2 hover:bg-gray-100 rounded-lg" onClick={closeMenu}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="block p-2 hover:bg-gray-100 rounded-lg" onClick={closeMenu}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
  
  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled 
            ? "bg-white/90 backdrop-blur-md shadow-sm py-2" 
            : "bg-transparent py-4"
        )}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <BookOpenText className="w-8 h-8 text-bookswap-teal mr-2" />
            <span className="font-bold text-xl text-bookswap-navy">BookSwap</span>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {user ? (
              <>
                <Link to="/welcome">
                  <Button variant="ghost" className="text-bookswap-navy">
                    Browse Books
                  </Button>
                </Link>
                <Link to="/add-book">
                  <Button variant="ghost" className="text-bookswap-navy">
                    <BookPlus className="h-4 w-4 mr-2" />
                    Add Book
                  </Button>
                </Link>
                <Link to="/wishlist">
                  <Button variant="ghost" className="text-bookswap-navy">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Button>
                </Link>
                <Link to="/swap-requests">
                  <Button variant="ghost" className="text-bookswap-navy">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Swap Requests
                  </Button>
                </Link>
                <div className="ml-4 border-l pl-4 flex items-center">
                  <span className="text-sm font-medium text-bookswap-navy mr-2">{user.username}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>
      
      {/* Mobile menu */}
      {renderMobileMenu()}
    </>
  );
};

export default Navbar;
