
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface SignupData extends AuthCredentials {
  username: string;
  fullName: string;
}

const USERS_STORAGE_KEY = 'bookswap_users';
const CURRENT_USER_KEY = 'bookswap_current_user';

// For demonstration purposes, we'll use localStorage
export const authService = {
  signup: (userData: SignupData): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Check if user already exists
          const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
          const existingUser = users.find((user: User) => user.email === userData.email);
          
          if (existingUser) {
            reject(new Error('User with this email already exists'));
            return;
          }
          
          // Create new user
          const newUser = {
            id: crypto.randomUUID(),
            email: userData.email,
            username: userData.username,
            fullName: userData.fullName,
          };
          
          // Save user to "database"
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...users, { ...newUser, password: userData.password }]));
          
          // Return user without password
          resolve(newUser);
        } catch (error) {
          reject(error);
        }
      }, 800); // Simulate network delay
    });
  },
  
  login: (credentials: AuthCredentials): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
          const user = users.find((user: any) => 
            user.email === credentials.email && user.password === credentials.password
          );
          
          if (!user) {
            reject(new Error('Invalid email or password'));
            return;
          }
          
          // Store current user in session
          const { password, ...userWithoutPassword } = user;
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
          
          resolve(userWithoutPassword);
        } catch (error) {
          reject(error);
        }
      }, 800); // Simulate network delay
    });
  },
  
  logout: (): Promise<void> => {
    return new Promise((resolve) => {
      localStorage.removeItem(CURRENT_USER_KEY);
      resolve();
      toast("Logged out successfully");
    });
  },
  
  getCurrentUser: (): User | null => {
    try {
      const userData = localStorage.getItem(CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser();
  }
};
