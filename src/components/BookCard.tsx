
import React, { useState, useEffect } from "react";
import { Heart, BookOpen, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Book, bookService } from "@/utils/bookService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authService } from "@/utils/authService";
import { useNavigate } from "react-router-dom";

interface BookCardProps {
  book: Book;
  isWishlist?: boolean;
  onRemoveFromWishlist?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, isWishlist = false, onRemoveFromWishlist }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapLoading, setIsSwapLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isWishlist) {
        const inWishlist = await bookService.isInWishlist(book.id);
        setIsWishlisted(inWishlist);
      }
    };
    
    checkWishlistStatus();
  }, [book.id, isWishlist]);

  // Check if user has already requested this book
  useEffect(() => {
    const checkSwapRequest = async () => {
      const requested = await bookService.hasRequestedSwap(book.id);
      setHasRequested(requested);
    };
    
    checkSwapRequest();
  }, [book.id]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isWishlisted && !isWishlist) {
      setIsLoading(true);
      try {
        await bookService.addToWishlist(book.id);
        setIsWishlisted(true);
      } catch (error) {
        toast("Failed to add to wishlist");
      } finally {
        setIsLoading(false);
      }
    } else if (isWishlist && onRemoveFromWishlist) {
      setIsLoading(true);
      try {
        await bookService.removeFromWishlist(book.id);
        onRemoveFromWishlist();
      } catch (error) {
        toast("Failed to remove from wishlist");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRequestSwap = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast("Please log in to request a swap");
      return;
    }

    if (book.ownerId === currentUser.id) {
      toast("You cannot request your own book");
      return;
    }

    setIsSwapLoading(true);
    try {
      await bookService.requestSwap(book.id);
      setHasRequested(true);
    } catch (error: any) {
      toast(error.message || "Failed to request swap");
    } finally {
      setIsSwapLoading(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/book/${book.id}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const isOwnBook = currentUser && book.ownerId === currentUser.id;

  return (
    <div 
      className="book-card flex flex-col h-full cursor-pointer hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-xl mb-4 aspect-[2/3]">
        {/* Tilt effect on hover */}
        <div className={cn(
          "w-full h-full transition-transform duration-500",
          isHovered ? "scale-105" : "scale-100"
        )}>
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute top-3 right-3">
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "rounded-full bg-white/80 backdrop-blur-sm hover:bg-white",
              isWishlisted && !isWishlist ? "text-bookswap-coral" : "text-bookswap-gray"
            )}
            onClick={handleToggleWishlist}
            disabled={isLoading}
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-all",
                isWishlisted && !isWishlist ? "fill-bookswap-coral" : "",
                isWishlist ? "fill-bookswap-coral" : ""
              )} 
            />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
          <div className="inline-block bg-bookswap-coral/90 px-2 py-0.5 rounded-full text-xs font-medium mb-1">
            {book.genre}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="font-serif font-medium text-xl mb-1 line-clamp-1">{book.title}</h3>
        <p className="text-bookswap-navy/70 mb-2">by {book.author}</p>
        <p className="text-sm text-bookswap-navy/60 mb-3 line-clamp-2">{book.description}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4 text-bookswap-teal" />
            <span className="text-sm font-medium">{book.condition}</span>
          </div>
          <div className="text-sm text-bookswap-navy/60">
            Added {formatDate(book.createdAt)}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/30 flex justify-between items-center">
          <span className="text-sm text-bookswap-navy/80">
            Owner: {book.ownerName}
          </span>
          {isWishlist ? (
            <Button
              variant="outline"
              size="sm"
              className="text-bookswap-coral border-bookswap-coral hover:bg-bookswap-coral/10"
              onClick={handleToggleWishlist}
              disabled={isLoading}
            >
              Remove
            </Button>
          ) : isOwnBook ? (
            <Button 
              variant="outline" 
              size="sm"
              className="text-bookswap-navy/50 border-bookswap-navy/20"
              disabled
            >
              Your Book
            </Button>
          ) : hasRequested ? (
            <Button 
              variant="outline" 
              size="sm"
              className="text-bookswap-teal border-bookswap-teal"
              disabled
            >
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Requested
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              className="bg-bookswap-teal hover:bg-bookswap-teal/80"
              onClick={handleRequestSwap}
              disabled={isSwapLoading}
            >
              {isSwapLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              Request Swap
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
