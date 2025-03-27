
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpenText, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-bookswap-teal/5 via-transparent to-bookswap-coral/5 pointer-events-none"></div>
      <div className="absolute top-20 right-20 w-60 h-60 bg-bookswap-amber/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-bookswap-teal/10 rounded-full blur-3xl"></div>
      
      <div className="glass max-w-md p-10 rounded-2xl text-center relative z-10 animate-fade-in-up">
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full bg-bookswap-coral/10 mb-6">
            <BookOpenText className="h-10 w-10 text-bookswap-coral" />
          </div>
          
          <h1 className="text-6xl font-bold text-bookswap-navy mb-2">404</h1>
          <h2 className="text-2xl font-medium text-bookswap-navy mb-4">Page Not Found</h2>
          
          <p className="text-bookswap-navy/70 mb-8">
            Oops! It seems this page has been swapped out or doesn't exist.
          </p>
          
          <Link to="/" className="button-primary flex items-center justify-center w-full">
            <Home className="mr-2 h-5 w-5" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
