
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { BookOpenText, Loader2, Heart, ArrowRight } from "lucide-react";
import { Book, bookService } from "@/utils/bookService";
import { authService } from "@/utils/authService";

const Wishlist = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setIsLoading(true);
        const data = await bookService.getWishlist();
        setBooks(data);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // Handle removal from wishlist
  const handleRemoveFromWishlist = async (bookId: string) => {
    try {
      await bookService.removeFromWishlist(bookId);
      setBooks(books.filter(book => book.id !== bookId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      {/* Hero section */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-b from-bookswap-coral/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center page-transition">
            <div className="inline-block bg-bookswap-coral/10 px-4 py-2 rounded-full text-bookswap-coral font-medium mb-4">
              My Collection
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-bookswap-navy">
              Your Wishlist
            </h1>
            <p className="text-lg text-bookswap-navy/70 max-w-3xl mx-auto">
              Keep track of books you're interested in swapping. We'll notify you when they become available.
            </p>
          </div>
        </div>
      </section>
      
      {/* Books grid */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-medium text-bookswap-navy">
              {books.length} {books.length === 1 ? 'Book' : 'Books'} in Your Wishlist
            </h2>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-bookswap-coral animate-spin mb-4" />
              <p className="text-bookswap-navy">Loading your wishlist...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Heart className="h-16 w-16 text-bookswap-navy/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-bookswap-navy mb-2">Your wishlist is empty</h3>
              <p className="text-bookswap-navy/70 mb-6">
                Start adding books you're interested in to your wishlist.
              </p>
              <Button 
                onClick={() => navigate("/welcome")}
                className="bg-bookswap-coral hover:bg-bookswap-coral/80"
              >
                Browse Books
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book, index) => (
                <div 
                  key={book.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <BookCard 
                    book={book} 
                    isWishlist={true}
                    onRemoveFromWishlist={() => handleRemoveFromWishlist(book.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Wishlist;
