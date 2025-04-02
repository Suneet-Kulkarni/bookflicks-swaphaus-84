export interface BookInput {
  title: string;
  author: string;
  description: string;
  coverUrl?: string; // Now optional as we'll handle file uploads
  condition: string;
  genre: string;
  coverImage?: File; // New field for file upload
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
}

const WISHLIST_STORAGE_KEY = 'bookswap_wishlist';
const SWAP_REQUESTS_KEY = 'bookswap_swap_requests';
const BOOKS_STORAGE_KEY = 'books';

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
          const books = JSON.parse(localStorage.getItem('books') || '[]');
          const book = books.find((book: Book) => book.id === id);
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
            createdAt: new Date().toISOString(),
          };

          const books = JSON.parse(localStorage.getItem('books') || '[]');
          localStorage.setItem('books', JSON.stringify([...books, newBook]));

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

  getWishlist: (): Promise<string[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
        resolve(wishlist);
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

          swapRequests = [...swapRequests, { bookId, userId: currentUser.id, status: 'pending' }];
          localStorage.setItem(SWAP_REQUESTS_KEY, JSON.stringify(swapRequests));
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  getSwapRequests: (): Promise<any[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
        const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
        const userRequests = swapRequests.filter((req: any) => req.userId === currentUser.id);
        resolve(userRequests);
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
