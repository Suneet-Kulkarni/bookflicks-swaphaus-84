import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Book, bookService } from "@/utils/bookService";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpenText, BookText, RefreshCw, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/utils/authService";
import { toast } from "sonner";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSwapLoading, setIsSwapLoading] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const bookData = await bookService.getBookById(id);
        setBook(bookData);
        
        // Check if user has already requested this book
        const requested = await bookService.hasRequestedSwap(id);
        setHasRequested(requested);
      } catch (error) {
        console.error("Error fetching book:", error);
        toast("Could not load book details");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleRequestSwap = async () => {
    if (!book || !currentUser) return;

    if (book.ownerId === currentUser.id) {
      toast("You cannot request your own book");
      return;
    }

    setIsSwapLoading(true);
    try {
      await bookService.requestSwap(book.id);
      setHasRequested(true);
      toast("Swap request sent successfully!");
    } catch (error: any) {
      toast(error.message || "Failed to request swap");
    } finally {
      setIsSwapLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  const isOwnBook = book && currentUser && book.ownerId === currentUser.id;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 px-6 pb-20 flex items-center justify-center">
          <RefreshCw className="h-10 w-10 text-bookswap-teal animate-spin" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 px-6 pb-20 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-8 text-bookswap-navy/70 hover:text-bookswap-teal"
            onClick={() => navigate("/welcome")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Button>
          
          <div className="glass rounded-2xl p-8 text-center">
            <BookText className="h-16 w-16 text-bookswap-navy/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-bookswap-navy mb-2">Book Not Found</h2>
            <p className="text-bookswap-navy/70 mb-6">
              The book you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              onClick={() => navigate("/welcome")}
              className="bg-bookswap-teal hover:bg-bookswap-teal/80"
            >
              Browse Books
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-32 px-6 pb-20 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          className="mb-8 text-bookswap-navy/70 hover:text-bookswap-teal"
          onClick={() => navigate("/welcome")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </Button>
        
        <div className="glass rounded-2xl p-4 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden">
              <img 
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-bookswap-coral/90 text-white rounded-full text-sm font-medium">
                  {book.genre}
                </span>
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-serif font-bold text-bookswap-navy mb-2">{book.title}</h1>
              <p className="text-xl text-bookswap-navy/70 mb-4">by {book.author}</p>
              
              <div className="flex items-center gap-2 mb-6">
                <BookOpenText className="h-5 w-5 text-bookswap-teal" />
                <span className="font-medium text-bookswap-navy">{book.condition}</span>
                <span className="text-bookswap-navy/50 text-sm">• Added {formatDate(book.createdAt)}</span>
              </div>
              
              <Separator className="my-6" />
              
              <div className="mb-6">
                <h2 className="text-lg font-medium text-bookswap-navy mb-2">Description</h2>
                <p className="text-bookswap-navy/80 leading-relaxed">
                  {book.description}
                </p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="mb-8">
                <h2 className="text-lg font-medium text-bookswap-navy mb-2">Book Owner</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-bookswap-navy font-medium">{book.ownerName}</p>
                    <div className="flex items-center mt-2">
                      <Phone className="h-4 w-4 mr-2 text-bookswap-teal" />
                      <span className="text-bookswap-navy">{book.ownerMobileNumber || "Not available"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {isOwnBook ? (
                <Button 
                  variant="outline" 
                  className="w-full py-6 text-bookswap-navy/50 border-bookswap-navy/20 cursor-not-allowed"
                  disabled
                >
                  This is your book
                </Button>
              ) : hasRequested ? (
                <div className="space-y-3">
                  <Button 
                    variant="outline"
                    className="w-full py-6 text-bookswap-teal border-bookswap-teal"
                    disabled
                  >
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Swap Requested
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full py-6 bg-bookswap-teal hover:bg-bookswap-teal/80"
                  onClick={handleRequestSwap}
                  disabled={isSwapLoading}
                >
                  {isSwapLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Request to Swap
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
