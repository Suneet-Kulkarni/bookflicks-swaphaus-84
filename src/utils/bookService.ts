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
  ownerMobileNumber?: string; // Added for owner contact info
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
const BOOKS_STORAGE_KEY = 'bookswap_books_database'; // Updated key name

// Initialize with some sample books if database is empty
const initializeDatabase = () => {
  const existingBooks = localStorage.getItem(BOOKS_STORAGE_KEY);
  if (!existingBooks) {
    // Get any existing books from old storage
    const oldBooks = JSON.parse(localStorage.getItem('books') || '[]');
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(oldBooks));
  }
};

// Call initialization on module load
initializeDatabase();

export const bookService = {
  getBooks: (): Promise<Book[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
        resolve(books);
      }, 500);
    });
  },

  getBookById: async (id: string): Promise<Book | null> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
          const book = books.find((book: Book) => book.id === id);
          
          // Make sure mobile number is included
          if (book) {
            const users = JSON.parse(localStorage.getItem('bookswap_users') || '[]');
            const bookOwner = users.find((user: any) => user.id === book.ownerId);
            if (bookOwner && bookOwner.mobileNumber) {
              book.ownerMobileNumber = bookOwner.mobileNumber;
            }
          }
          
          resolve(book || null);
        } catch (error) {
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

          const newBook: Book = {
            id: crypto.randomUUID(),
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            coverUrl: coverUrl,
            condition: bookData.condition,
            genre: bookData.genre,
            ownerId: currentUser.id,
            ownerName: currentUser.fullName || currentUser.username,
            ownerMobileNumber: currentUser.mobileNumber,
            createdAt: new Date().toISOString(),
          };

          const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
          localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify([...books, newBook]));

          resolve(newBook);
        } catch (error) {
          reject(error);
        }
      }, 800);
    });
  },

  addToWishlist: (bookId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
        if (!wishlist.includes(bookId)) {
          localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([...wishlist, bookId]));
        }
        resolve();
      }, 300);
    });
  },

  removeFromWishlist: (bookId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
        wishlist = wishlist.filter((id: string) => id !== bookId);
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
        resolve();
      }, 300);
    });
  },

  getWishlist: async (): Promise<Book[]> => {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const wishlistIds = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
        const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
        const wishlistBooks = books.filter((book: Book) => wishlistIds.includes(book.id));
        resolve(wishlistBooks);
      }, 300);
    });
  },

  isInWishlist: (bookId: string): boolean => {
    const wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
    return wishlist.includes(bookId);
  },

  requestSwap: (bookId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
          if (!currentUser.id) {
            reject(new Error('You must be logged in to request a swap'));
            return;
          }

          let swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
          
          // Check if the request already exists
          const existingRequest = swapRequests.find(
            (req: any) => req.bookId === bookId && req.userId === currentUser.id
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
          };

          swapRequests = [...swapRequests, newRequest];
          localStorage.setItem(SWAP_REQUESTS_KEY, JSON.stringify(swapRequests));
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  getSwapRequests: (): Promise<SwapRequest[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
        const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
        const userRequests = swapRequests.filter((req: SwapRequest) => req.userId === currentUser.id);
        resolve(userRequests);
      }, 500);
    });
  },

  getMySwapRequests: (): Promise<SwapRequest[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
        const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
        const userRequests = swapRequests.filter((req: SwapRequest) => req.userId === currentUser.id);
        resolve(userRequests);
      }, 500);
    });
  },

  getIncomingSwapRequests: (): Promise<{request: SwapRequest, book: Book}[]> => {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
        if (!currentUser.id) {
          resolve([]);
          return;
        }
        
        // Get all books owned by current user
        const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
        const myBooks = books.filter((book: Book) => book.ownerId === currentUser.id);
        const myBookIds = myBooks.map((book: Book) => book.id);
        
        // Get all swap requests for those books
        const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
        const incomingRequests = swapRequests.filter(
          (req: SwapRequest) => myBookIds.includes(req.bookId)
        );
        
        // Combine with book data
        const requestsWithBooks = await Promise.all(
          incomingRequests.map(async (request: SwapRequest) => {
            const book = books.find((b: Book) => b.id === request.bookId);
            return { request, book };
          })
        );
        
        resolve(requestsWithBooks);
      }, 500);
    });
  },

  updateSwapRequestStatus: (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
          const updatedRequests = swapRequests.map((req: SwapRequest) => 
            req.id === requestId ? { ...req, status } : req
          );
          localStorage.setItem(SWAP_REQUESTS_KEY, JSON.stringify(updatedRequests));
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  hasRequestedSwap: (bookId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
        if (!currentUser.id) {
          resolve(false);
          return;
        }
        const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
        const requested = swapRequests.some(
          (req: any) => req.bookId === bookId && req.userId === currentUser.id
        );
        resolve(requested);
      }, 300);
    });
  },
};

// Helper function to convert File to base64 string (for local storage)
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
