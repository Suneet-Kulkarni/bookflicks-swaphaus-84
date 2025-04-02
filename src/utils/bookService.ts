import { supabase } from "@/integrations/supabase/client";

export interface BookInput {
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  condition: string;
  genre: string;
  coverImage?: File;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  condition: string;
  genre: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  ownerMobileNumber?: string;
}

export interface SwapRequest {
  id: string;
  bookId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const WISHLIST_STORAGE_KEY = 'bookswap_wishlist';
const SWAP_REQUESTS_KEY = 'bookswap_swap_requests';

// Sample initial books data to ensure users always see content
const SAMPLE_BOOKS = [
  {
    id: "1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A novel about racial injustice and the loss of innocence in the American South.",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1974&auto=format&fit=crop",
    condition: "Good",
    genre: "Classic",
    ownerId: "system",
    ownerName: "BookSwap Admin",
    createdAt: "2023-01-01T00:00:00.000Z",
    ownerMobileNumber: "555-123-4567"
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    description: "A dystopian novel about totalitarianism, surveillance, and censorship.",
    coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1974&auto=format&fit=crop",
    condition: "Like New",
    genre: "Science Fiction",
    ownerId: "system",
    ownerName: "BookSwap Admin",
    createdAt: "2023-01-02T00:00:00.000Z",
    ownerMobileNumber: "555-123-4567"
  },
  {
    id: "3",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A novel about the American Dream set in the Jazz Age.",
    coverUrl: "https://images.unsplash.com/photo-1495640388908-44d4eb3bb0d7?q=80&w=1974&auto=format&fit=crop",
    condition: "Fair",
    genre: "Classic",
    ownerId: "system",
    ownerName: "BookSwap Admin",
    createdAt: "2023-01-03T00:00:00.000Z",
    ownerMobileNumber: "555-123-4567"
  }
];

// Helper function to convert File to base64 string
function processBookCoverImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to process image'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Initialize Supabase with sample books if needed
async function initializeSupabaseBooks() {
  const { data: existingBooks, error } = await supabase
    .from('books')
    .select('*');

  if (error) {
    console.error('Error checking for existing books:', error);
    return;
  }

  // If there are no books, add sample books
  if (existingBooks.length === 0) {
    for (const book of SAMPLE_BOOKS) {
      await supabase.from('books').insert([{
        title: book.title,
        author: book.author, 
        description: book.description,
        cover_url: book.coverUrl,
        condition: book.condition,
        genre: book.genre,
        owner_id: book.ownerId,
        owner_name: book.ownerName,
        owner_mobile_number: book.ownerMobileNumber,
        created_at: book.createdAt
      }]);
    }
    console.log('Sample books initialized in Supabase');
  }
}

// Call initialization on module load
initializeSupabaseBooks().catch(console.error);

// Main service export
export const bookService = {
  getBooks: async (): Promise<Book[]> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('books')
            .select('*');
          
          if (error) {
            throw error;
          }
          
          // Transform from Supabase format to our Book interface
          const books: Book[] = data.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            description: book.description || '',
            coverUrl: book.cover_url || '',
            condition: book.condition,
            genre: book.genre,
            ownerId: book.owner_id || 'system',
            ownerName: book.owner_name || 'Unknown',
            createdAt: book.created_at,
            ownerMobileNumber: book.owner_mobile_number,
          }));
          
          resolve(books);
        } catch (error) {
          console.error("Error fetching books:", error);
          reject(error);
        }
      }, 500); // Keep timeout for consistent UX
    });
  },

  getBookById: async (id: string): Promise<Book | null> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            if (error.code === 'PGRST116') { // Not found
              return resolve(null);
            }
            throw error;
          }
          
          if (!data) {
            return resolve(null);
          }
          
          const book: Book = {
            id: data.id,
            title: data.title,
            author: data.author,
            description: data.description || '',
            coverUrl: data.cover_url || '',
            condition: data.condition,
            genre: data.genre,
            ownerId: data.owner_id || 'system',
            ownerName: data.owner_name || 'Unknown',
            createdAt: data.created_at,
            ownerMobileNumber: data.owner_mobile_number,
          };
          
          resolve(book);
        } catch (error) {
          console.error("Error fetching book:", error);
          reject(error);
        }
      }, 300);
    });
  },

  addBook: async (bookData: BookInput): Promise<Book> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          if (!bookData.title || !bookData.author || !bookData.condition || !bookData.genre) {
            reject(new Error('Required fields are missing'));
            return;
          }

          let coverUrl = bookData.coverUrl || '';
          
          // Handle file upload if present
          if (bookData.coverImage) {
            coverUrl = await processBookCoverImage(bookData.coverImage);
          }
          
          const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
          if (!currentUser.id) {
            reject(new Error('You must be logged in to add a book'));
            return;
          }

          const { data, error } = await supabase
            .from('books')
            .insert([{
              title: bookData.title,
              author: bookData.author,
              description: bookData.description,
              cover_url: coverUrl,
              condition: bookData.condition,
              genre: bookData.genre,
              owner_id: currentUser.id,
              owner_name: currentUser.fullName || currentUser.username,
              owner_mobile_number: currentUser.mobileNumber
            }])
            .select()
            .single();

          if (error) {
            throw error;
          }
          
          if (!data) {
            throw new Error('Failed to add book');
          }
          
          const newBook: Book = {
            id: data.id,
            title: data.title,
            author: data.author,
            description: data.description || '',
            coverUrl: data.cover_url || '',
            condition: data.condition,
            genre: data.genre,
            ownerId: data.owner_id || currentUser.id,
            ownerName: data.owner_name || currentUser.fullName || currentUser.username,
            ownerMobileNumber: data.owner_mobile_number || currentUser.mobileNumber,
            createdAt: data.created_at,
          };

          resolve(newBook);
        } catch (error) {
          reject(error);
        }
      }, 800);
    });
  },

  addToWishlist: async (bookId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // For now, we'll keep wishlist in localStorage until we create a wishlist table
          let wishlistIds = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
          if (!wishlistIds.includes(bookId)) {
            wishlistIds.push(bookId);
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
          }
          resolve();
        } catch (error) {
          console.error("Error adding to wishlist:", error);
          reject(error);
        }
      }, 300);
    });
  },

  removeFromWishlist: async (bookId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          let wishlistIds = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
          wishlistIds = wishlistIds.filter((id: string) => id !== bookId);
          localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
          resolve();
        } catch (error) {
          console.error("Error removing from wishlist:", error);
          reject(error);
        }
      }, 300);
    });
  },

  getWishlist: async (): Promise<Book[]> => {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        try {
          const wishlistIds = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
          
          if (wishlistIds.length === 0) {
            return resolve([]);
          }
          
          const { data, error } = await supabase
            .from('books')
            .select('*')
            .in('id', wishlistIds);
            
          if (error) {
            throw error;
          }
          
          const books: Book[] = data.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            description: book.description || '',
            coverUrl: book.cover_url || '',
            condition: book.condition,
            genre: book.genre,
            ownerId: book.owner_id || 'system',
            ownerName: book.owner_name || 'Unknown',
            createdAt: book.created_at,
            ownerMobileNumber: book.owner_mobile_number,
          }));
          
          resolve(books);
        } catch (error) {
          console.error("Error getting wishlist books:", error);
          resolve([]);
        }
      }, 300);
    });
  },

  isInWishlist: async (bookId: string): Promise<boolean> => {
    try {
      const wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
      return wishlist.includes(bookId);
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
  },

  requestSwap: async (bookId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
          if (!currentUser.id) {
            reject(new Error('You must be logged in to request a swap'));
            return;
          }

          // For now, we'll keep swap requests in localStorage
          let swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
          
          // Check if the request already exists
          const existingRequest = swapRequests.find(
            (req: SwapRequest) => req.bookId === bookId && req.userId === currentUser.id
          );
          
          if (existingRequest) {
            reject(new Error('You have already requested this book'));
            return;
          }

          const newRequest = {
            id: crypto.randomUUID(),
            bookId,
            userId: currentUser.id,
            status: 'pending',
            createdAt: new Date().toISOString()
          } as SwapRequest;

          swapRequests.push(newRequest);
          localStorage.setItem(SWAP_REQUESTS_KEY, JSON.stringify(swapRequests));
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  getSwapRequests: async (): Promise<SwapRequest[]> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
          const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
          const userRequests = swapRequests.filter((req: SwapRequest) => req.userId === currentUser.id);
          resolve(userRequests);
        } catch (error) {
          console.error("Error getting swap requests:", error);
          resolve([]);
        }
      }, 500);
    });
  },

  getMySwapRequests: async (): Promise<SwapRequest[]> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
          const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
          const userRequests = swapRequests.filter((req: SwapRequest) => req.userId === currentUser.id);
          resolve(userRequests);
        } catch (error) {
          console.error("Error getting my swap requests:", error);
          resolve([]);
        }
      }, 500);
    });
  },

  getIncomingSwapRequests: async (): Promise<{request: SwapRequest, book: Book}[]> => {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
          if (!currentUser.id) {
            resolve([]);
            return;
          }
          
          // Get books from Supabase
          const { data: books, error } = await supabase
            .from('books')
            .select('*')
            .eq('owner_id', currentUser.id);
          
          if (error) {
            throw error;
          }
          
          const myBookIds = books.map(book => book.id);
          
          // Get swap requests from localStorage
          const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
          const incomingRequests = swapRequests.filter(
            (req: SwapRequest) => myBookIds.includes(req.bookId)
          );
          
          // Map books to requests
          const booksMap = books.reduce((map: Record<string, any>, book: any) => {
            map[book.id] = book;
            return map;
          }, {});
          
          // Combine with book data
          const requestsWithBooks = incomingRequests.map((request: SwapRequest) => {
            const bookData = booksMap[request.bookId];
            
            const book: Book = bookData ? {
              id: bookData.id,
              title: bookData.title,
              author: bookData.author,
              description: bookData.description || '',
              coverUrl: bookData.cover_url || '',
              condition: bookData.condition,
              genre: bookData.genre,
              ownerId: bookData.owner_id || 'system',
              ownerName: bookData.owner_name || 'Unknown',
              createdAt: bookData.created_at,
              ownerMobileNumber: bookData.owner_mobile_number,
            } : null;
            
            return { request, book };
          });
          
          resolve(requestsWithBooks.filter(item => item.book));
        } catch (error) {
          console.error("Error getting incoming swap requests:", error);
          resolve([]);
        }
      }, 500);
    });
  },

  updateSwapRequestStatus: async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // For now, we'll keep swap requests in localStorage
          let swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
          swapRequests = swapRequests.map((req: SwapRequest) => 
            req.id === requestId ? { ...req, status } : req
          );
          localStorage.setItem(SWAP_REQUESTS_KEY, JSON.stringify(swapRequests));
          resolve();
        } catch (error) {
          console.error("Error updating swap request status:", error);
          reject(error);
        }
      }, 500);
    });
  },

  hasRequestedSwap: async (bookId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
          if (!currentUser.id) {
            resolve(false);
            return;
          }
          
          const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
          const requested = swapRequests.some(
            (req: SwapRequest) => req.bookId === bookId && req.userId === currentUser.id
          );
          
          resolve(requested);
        } catch (error) {
          console.error("Error checking if swap requested:", error);
          resolve(false);
        }
      }, 300);
    });
  },
};
