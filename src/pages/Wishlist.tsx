
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, bookService } from "@/utils/bookService";
import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Loader2, HeartOff } from "lucide-react";
import { authService } from "@/utils/authService";

const Wishlist = () => {
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch wishlist books
  useEffect(() => {
    const fetchWishlistBooks = async () => {
      try {
        setIsLoading(true);
        const books = await bookService.getWishlist();
        setWishlistBooks(books);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistBooks();
  }, []);

  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (bookId: string) => {
    try {
      await bookService.removeFromWishlist(bookId);
      setWishlistBooks(wishlistBooks.filter(book => book.id !== bookId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      {/* Hero section */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-b from-bookswap-teal/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center page-transition">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-bookswap-navy">
              My Wishlist
            </h1>
            <p className="text-lg text-bookswap-navy/70 max-w-3xl mx-auto">
              Books you're interested in swapping. Request a swap or remove books from your wishlist.
            </p>
          </div>
        </div>
      </section>
      
      {/* Wishlist books */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-bookswap-teal animate-spin mb-4" />
              <p className="text-bookswap-navy">Loading wishlist...</p>
            </div>
          ) : wishlistBooks.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <HeartOff className="h-16 w-16 text-bookswap-navy/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-bookswap-navy mb-2">Your wishlist is empty</h3>
              <p className="text-bookswap-navy/70 mb-6">
                Browse available books and add them to your wishlist.
              </p>
              <Button 
                onClick={() => navigate("/welcome")}
                className="bg-bookswap-teal hover:bg-bookswap-teal/80"
              >
                Browse Books
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistBooks.map((book) => (
                <div key={book.id} className="animate-fade-in-up">
                  <BookCard 
                    book={book} 
                    onRemoveFromWishlist={() => handleRemoveFromWishlist(book.id)}
                    isInWishlist={true}
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
