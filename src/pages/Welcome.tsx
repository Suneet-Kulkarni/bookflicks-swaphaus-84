
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Loader2, 
  BookOpenText 
} from "lucide-react";
import { Book, bookService } from "@/utils/bookService";
import { authService } from "@/utils/authService";
import { cn } from "@/lib/utils";

const Welcome = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const data = await bookService.getBooks();
        setBooks(data);
        setFilteredBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Filter books
  useEffect(() => {
    let result = books;
    
    // Search filter
    if (searchQuery) {
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Genre filter
    if (selectedGenre) {
      result = result.filter(book => book.genre === selectedGenre);
    }
    
    setFilteredBooks(result);
  }, [books, searchQuery, selectedGenre]);

  // Extract unique genres
  const genres = [...new Set(books.map(book => book.genre))];

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      {/* Hero section */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-b from-bookswap-teal/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center page-transition">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-bookswap-navy">
              Available Books for Swapping
            </h1>
            <p className="text-lg text-bookswap-navy/70 max-w-3xl mx-auto mb-8">
              Browse through our collection of books shared by the community. Find your next read and request a swap!
            </p>

            {/* Search and filter */}
            <div className="glass p-4 rounded-xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bookswap-navy/50" />
                <Input
                  type="text"
                  placeholder="Search by title, author, or description..."
                  className="input-field pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 flex-wrap md:flex-nowrap">
                <Button
                  variant="outline"
                  className={cn(
                    "text-sm whitespace-nowrap",
                    !selectedGenre && "bg-bookswap-teal text-white hover:bg-bookswap-teal/80"
                  )}
                  onClick={() => setSelectedGenre(null)}
                >
                  All
                </Button>
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    variant="outline"
                    className={cn(
                      "text-sm whitespace-nowrap",
                      selectedGenre === genre && "bg-bookswap-teal text-white hover:bg-bookswap-teal/80"
                    )}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Books grid */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-medium text-bookswap-navy">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'} Available
            </h2>
            <Button 
              onClick={() => navigate("/add-book")}
              className="bg-bookswap-teal hover:bg-bookswap-teal/80"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-bookswap-teal animate-spin mb-4" />
              <p className="text-bookswap-navy">Loading books...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <BookOpenText className="h-16 w-16 text-bookswap-navy/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-bookswap-navy mb-2">No books found</h3>
              <p className="text-bookswap-navy/70 mb-6">
                {searchQuery || selectedGenre
                  ? "Try adjusting your search filters."
                  : "Be the first to add a book to our collection!"}
              </p>
              <Button 
                onClick={() => navigate("/add-book")}
                className="bg-bookswap-teal hover:bg-bookswap-teal/80"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book, index) => (
                <div 
                  key={book.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Welcome;
