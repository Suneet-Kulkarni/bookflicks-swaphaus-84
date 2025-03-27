
import { toast } from "sonner";
import { authService } from "./authService";

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

interface BookInput {
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  condition: string;
  genre: string;
}

const BOOKS_STORAGE_KEY = 'bookswap_books';
const WISHLIST_STORAGE_KEY = 'bookswap_wishlist';

// Sample book covers
const sampleCovers = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
];

// Sample book data for initial state
const sampleBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A story of wealth, love, and tragedy in the Roaring Twenties.',
    coverUrl: sampleCovers[0],
    condition: 'Good',
    genre: 'Classic',
    ownerId: 'sample1',
    ownerName: 'BookLover42',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'A science fiction masterpiece set on the desert planet Arrakis.',
    coverUrl: sampleCovers[1],
    condition: 'Like New',
    genre: 'Science Fiction',
    ownerId: 'sample2',
    ownerName: 'SciFiReader',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'A romantic novel of manners set in early 19th-century England.',
    coverUrl: sampleCovers[2],
    condition: 'Fair',
    genre: 'Romance',
    ownerId: 'sample3',
    ownerName: 'ClassicsFan',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'A fantasy adventure novel about a hobbit who embarks on an unexpected journey.',
    coverUrl: sampleCovers[3],
    condition: 'Good',
    genre: 'Fantasy',
    ownerId: 'sample1',
    ownerName: 'BookLover42',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A novel about racial inequality and moral growth in the American South.',
    coverUrl: sampleCovers[4],
    condition: 'Excellent',
    genre: 'Classic',
    ownerId: 'sample2',
    ownerName: 'SciFiReader',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    description: 'A philosophical novel about a shepherd boy who dreams of finding treasure.',
    coverUrl: sampleCovers[5],
    condition: 'Like New',
    genre: 'Fiction',
    ownerId: 'sample3',
    ownerName: 'ClassicsFan',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Initialize books in localStorage if not present
const initializeBooks = () => {
  if (!localStorage.getItem(BOOKS_STORAGE_KEY)) {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(sampleBooks));
  }
};

// Initialize books when module is loaded
initializeBooks();

export const bookService = {
  getBooks: (): Promise<Book[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
        resolve(books);
      }, 500); // Simulate network delay
    });
  },
  
  addBook: (bookInput: BookInput): Promise<Book> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user = authService.getCurrentUser();
          
          if (!user) {
            reject(new Error('User not authenticated'));
            return;
          }
          
          const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
          
          const newBook: Book = {
            id: crypto.randomUUID(),
            ...bookInput,
            ownerId: user.id,
            ownerName: user.username,
            createdAt: new Date().toISOString(),
          };
          
          localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify([...books, newBook]));
          
          toast("Book added successfully!");
          resolve(newBook);
        } catch (error) {
          reject(error);
        }
      }, 800); // Simulate network delay
    });
  },
  
  getWishlist: (): Promise<Book[]> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user = authService.getCurrentUser();
          
          if (!user) {
            reject(new Error('User not authenticated'));
            return;
          }
          
          const wishlistIds = JSON.parse(localStorage.getItem(`${WISHLIST_STORAGE_KEY}_${user.id}`) || '[]');
          const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || '[]');
          
          const wishlistedBooks = books.filter((book: Book) => wishlistIds.includes(book.id));
          resolve(wishlistedBooks);
        } catch (error) {
          reject(error);
        }
      }, 500); // Simulate network delay
    });
  },
  
  addToWishlist: (bookId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const user = authService.getCurrentUser();
        
        if (!user) {
          reject(new Error('User not authenticated'));
          return;
        }
        
        const wishlistKey = `${WISHLIST_STORAGE_KEY}_${user.id}`;
        const wishlistIds = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
        
        if (!wishlistIds.includes(bookId)) {
          wishlistIds.push(bookId);
          localStorage.setItem(wishlistKey, JSON.stringify(wishlistIds));
          toast("Added to wishlist!");
        }
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  
  removeFromWishlist: (bookId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const user = authService.getCurrentUser();
        
        if (!user) {
          reject(new Error('User not authenticated'));
          return;
        }
        
        const wishlistKey = `${WISHLIST_STORAGE_KEY}_${user.id}`;
        let wishlistIds = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
        
        wishlistIds = wishlistIds.filter((id: string) => id !== bookId);
        localStorage.setItem(wishlistKey, JSON.stringify(wishlistIds));
        toast("Removed from wishlist");
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  
  isInWishlist: (bookId: string): boolean => {
    try {
      const user = authService.getCurrentUser();
      
      if (!user) {
        return false;
      }
      
      const wishlistKey = `${WISHLIST_STORAGE_KEY}_${user.id}`;
      const wishlistIds = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
      
      return wishlistIds.includes(bookId);
    } catch {
      return false;
    }
  }
};
