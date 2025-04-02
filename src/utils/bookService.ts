
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
const BOOKS_STORAGE_KEY = 'bookswap_books_database';

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

// Database initialization
class BookDatabase {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private initPromise: Promise<boolean> | null = null;
  
  constructor() {
    this.initPromise = this.initDatabase();
  }
  
  private initDatabase(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Check if IndexedDB is supported
      if (!window.indexedDB) {
        console.warn("Your browser doesn't support IndexedDB. Falling back to localStorage.");
        this.migrateFromLocalStorage();
        resolve(false);
        return;
      }
      
      const request = indexedDB.open("BookSwapDatabase", 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains("books")) {
          db.createObjectStore("books", { keyPath: "id" });
        }
        
        if (!db.objectStoreNames.contains("wishlist")) {
          db.createObjectStore("wishlist", { keyPath: "id" });
        }
        
        if (!db.objectStoreNames.contains("swapRequests")) {
          db.createObjectStore("swapRequests", { keyPath: "id" });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        
        // Seed database with initial data and/or migrate from localStorage
        this.seedDatabase().then(() => {
          resolve(true);
        });
      };
      
      request.onerror = (event) => {
        console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error);
        this.migrateFromLocalStorage();
        resolve(false);
      };
    });
  }
  
  private async seedDatabase(): Promise<void> {
    // First check if we have any books
    const existingBooks = await this.getAllBooks();
    
    // If no books exist, add sample books
    if (existingBooks.length === 0) {
      // Check localStorage for existing books first
      const localStorageBooks = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
      
      if (localStorageBooks.length > 0) {
        // Migrate existing localStorage data
        await Promise.all(localStorageBooks.map((book: Book) => this.addBook(book)));
      } else {
        // Add sample books if no localStorage data
        await Promise.all(SAMPLE_BOOKS.map((book) => this.addBook(book)));
      }
      
      // Migrate wishlist and swap requests
      this.migrateFromLocalStorage();
    }
  }
  
  private migrateFromLocalStorage(): void {
    // Migrate books
    const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
    books.forEach((book: Book) => this.addBook(book));
    
    // Migrate wishlist
    const wishlistIds = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
    wishlistIds.forEach((id: string) => this.addToWishlist(id));
    
    // Migrate swap requests
    const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
    swapRequests.forEach((request: SwapRequest) => this.addSwapRequest(request));
  }
  
  async getAllBooks(): Promise<Book[]> {
    await this.initPromise;
    
    if (!this.db) {
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["books"], "readonly");
      const objectStore = transaction.objectStore("books");
      const request = objectStore.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
        console.error("Error getting books:", request.error);
      };
    });
  }
  
  async getBookById(id: string): Promise<Book | null> {
    await this.initPromise;
    
    if (!this.db) {
      // Fallback to localStorage
      const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
      return books.find((book: Book) => book.id === id) || null;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["books"], "readonly");
      const objectStore = transaction.objectStore("books");
      const request = objectStore.get(id);
      
      request.onsuccess = () => {
        const book = request.result;
        if (book) {
          // Try to get owner's mobile number from localStorage if not in book
          if (!book.ownerMobileNumber) {
            const users = JSON.parse(localStorage.getItem('bookswap_users') || '[]');
            const bookOwner = users.find((user: any) => user.id === book.ownerId);
            if (bookOwner && bookOwner.mobileNumber) {
              book.ownerMobileNumber = bookOwner.mobileNumber;
            }
          }
        }
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject(request.error);
        console.error("Error getting book:", request.error);
      };
    });
  }
  
  async addBook(book: Book): Promise<Book> {
    await this.initPromise;
    
    // Always add to localStorage as backup
    const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
    const bookExists = books.some((b: Book) => b.id === book.id);
    
    if (!bookExists) {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify([...books, book]));
    }
    
    if (!this.db) {
      return book;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["books"], "readwrite");
      const objectStore = transaction.objectStore("books");
      const request = objectStore.put(book);
      
      request.onsuccess = () => {
        resolve(book);
      };
      
      request.onerror = () => {
        reject(request.error);
        console.error("Error adding book:", request.error);
      };
    });
  }
  
  async getAllWishlist(): Promise<string[]> {
    await this.initPromise;
    
    if (!this.db) {
      return JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["wishlist"], "readonly");
      const objectStore = transaction.objectStore("wishlist");
      const request = objectStore.getAll();
      
      request.onsuccess = () => {
        resolve(request.result.map(item => item.id));
      };
      
      request.onerror = () => {
        reject(request.error);
        console.error("Error getting wishlist:", request.error);
      };
    });
  }
  
  async addToWishlist(bookId: string): Promise<void> {
    await this.initPromise;
    
    // Always add to localStorage as backup
    const wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
    if (!wishlist.includes(bookId)) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([...wishlist, bookId]));
    }
    
    if (!this.db) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["wishlist"], "readwrite");
      const objectStore = transaction.objectStore("wishlist");
      const request = objectStore.put({ id: bookId });
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
        console.error("Error adding to wishlist:", request.error);
      };
    });
  }
  
  async removeFromWishlist(bookId: string): Promise<void> {
    await this.initPromise;
    
    // Update localStorage backup
    let wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
    wishlist = wishlist.filter((id: string) => id !== bookId);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    
    if (!this.db) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["wishlist"], "readwrite");
      const objectStore = transaction.objectStore("wishlist");
      const request = objectStore.delete(bookId);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
        console.error("Error removing from wishlist:", request.error);
      };
    });
  }
  
  async addSwapRequest(request: SwapRequest): Promise<void> {
    await this.initPromise;
    
    // Always update localStorage as backup
    let swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
    const exists = swapRequests.some((r: SwapRequest) => r.id === request.id);
    
    if (!exists) {
      swapRequests.push(request);
      localStorage.setItem(SWAP_REQUESTS_KEY, JSON.stringify(swapRequests));
    }
    
    if (!this.db) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["swapRequests"], "readwrite");
      const objectStore = transaction.objectStore("swapRequests");
      const dbRequest = objectStore.put(request);
      
      dbRequest.onsuccess = () => {
        resolve();
      };
      
      dbRequest.onerror = () => {
        reject(dbRequest.error);
        console.error("Error adding swap request:", dbRequest.error);
      };
    });
  }
  
  async getAllSwapRequests(): Promise<SwapRequest[]> {
    await this.initPromise;
    
    if (!this.db) {
      return JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["swapRequests"], "readonly");
      const objectStore = transaction.objectStore("swapRequests");
      const request = objectStore.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
        console.error("Error getting swap requests:", request.error);
      };
    });
  }
  
  async updateSwapRequestStatus(requestId: string, status: 'accepted' | 'rejected'): Promise<void> {
    await this.initPromise;
    
    // Update localStorage backup
    let swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
    swapRequests = swapRequests.map((req: SwapRequest) => 
      req.id === requestId ? { ...req, status } : req
    );
    localStorage.setItem(SWAP_REQUESTS_KEY, JSON.stringify(swapRequests));
    
    if (!this.db) {
      return;
    }
    
    // First get the existing request to update it
    return new Promise(async (resolve, reject) => {
      try {
        const allRequests = await this.getAllSwapRequests();
        const request = allRequests.find(req => req.id === requestId);
        
        if (!request) {
          reject(new Error("Swap request not found"));
          return;
        }
        
        const updatedRequest = { ...request, status };
        
        const transaction = this.db!.transaction(["swapRequests"], "readwrite");
        const objectStore = transaction.objectStore("swapRequests");
        const dbRequest = objectStore.put(updatedRequest);
        
        dbRequest.onsuccess = () => {
          resolve();
        };
        
        dbRequest.onerror = () => {
          reject(dbRequest.error);
          console.error("Error updating swap request:", dbRequest.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Create single instance of database
const database = new BookDatabase();

// Main service export
export const bookService = {
  getBooks: async (): Promise<Book[]> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const books = await database.getAllBooks();
          resolve(books);
        } catch (error) {
          console.error("Error fetching books:", error);
          // Fallback to localStorage
          const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
          resolve(books);
        }
      }, 500);
    });
  },

  getBookById: async (id: string): Promise<Book | null> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const book = await database.getBookById(id);
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

          await database.addBook(newBook);
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
          await database.addToWishlist(bookId);
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
          await database.removeFromWishlist(bookId);
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
          const wishlistIds = await database.getAllWishlist();
          const books = await database.getAllBooks();
          const wishlistBooks = books.filter((book: Book) => wishlistIds.includes(book.id));
          resolve(wishlistBooks);
        } catch (error) {
          console.error("Error getting wishlist books:", error);
          // Fallback to localStorage
          const wishlistIds = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
          const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
          const wishlistBooks = books.filter((book: Book) => wishlistIds.includes(book.id));
          resolve(wishlistBooks);
        }
      }, 300);
    });
  },

  isInWishlist: async (bookId: string): Promise<boolean> => {
    try {
      const wishlist = await database.getAllWishlist();
      return wishlist.includes(bookId);
    } catch (error) {
      console.error("Error checking wishlist:", error);
      // Fallback to localStorage
      const wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
      return wishlist.includes(bookId);
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

          // Get all swap requests to check for duplicates
          const swapRequests = await database.getAllSwapRequests();
          
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

          await database.addSwapRequest(newRequest);
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
          const swapRequests = await database.getAllSwapRequests();
          const userRequests = swapRequests.filter((req: SwapRequest) => req.userId === currentUser.id);
          resolve(userRequests);
        } catch (error) {
          console.error("Error getting swap requests:", error);
          // Fallback to localStorage
          const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
          const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
          const userRequests = swapRequests.filter((req: SwapRequest) => req.userId === currentUser.id);
          resolve(userRequests);
        }
      }, 500);
    });
  },

  getMySwapRequests: async (): Promise<SwapRequest[]> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
          const swapRequests = await database.getAllSwapRequests();
          const userRequests = swapRequests.filter((req: SwapRequest) => req.userId === currentUser.id);
          resolve(userRequests);
        } catch (error) {
          console.error("Error getting my swap requests:", error);
          // Fallback to localStorage
          const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
          const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
          const userRequests = swapRequests.filter((req: SwapRequest) => req.userId === currentUser.id);
          resolve(userRequests);
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
          
          // Get all books owned by current user
          const books = await database.getAllBooks();
          const myBooks = books.filter((book: Book) => book.ownerId === currentUser.id);
          const myBookIds = myBooks.map((book: Book) => book.id);
          
          // Get all swap requests for those books
          const swapRequests = await database.getAllSwapRequests();
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
        } catch (error) {
          console.error("Error getting incoming swap requests:", error);
          // Fallback to localStorage
          const currentUser = JSON.parse(localStorage.getItem('bookswap_current_user') || '{}');
          if (!currentUser.id) {
            resolve([]);
            return;
          }
          
          const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
          const myBooks = books.filter((book: Book) => book.ownerId === currentUser.id);
          const myBookIds = myBooks.map((book: Book) => book.id);
          
          const swapRequests = JSON.parse(localStorage.getItem(SWAP_REQUESTS_KEY) || '[]');
          const incomingRequests = swapRequests.filter(
            (req: SwapRequest) => myBookIds.includes(req.bookId)
          );
          
          const requestsWithBooks = incomingRequests.map((request: SwapRequest) => {
            const book = books.find((b: Book) => b.id === request.bookId);
            return { request, book };
          });
          
          resolve(requestsWithBooks);
        }
      }, 500);
    });
  },

  updateSwapRequestStatus: async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          await database.updateSwapRequestStatus(requestId, status);
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
          
          const swapRequests = await database.getAllSwapRequests();
          const requested = swapRequests.some(
            (req: SwapRequest) => req.bookId === bookId && req.userId === currentUser.id
          );
          
          resolve(requested);
        } catch (error) {
          console.error("Error checking if swap requested:", error);
          // Fallback to localStorage
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
        }
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
