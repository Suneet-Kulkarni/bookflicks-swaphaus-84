import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Navbar from "@/components/Navbar";
import { BookOpenText, BookPlus, ArrowLeft, ImageIcon, Upload, X } from "lucide-react";
import { bookService } from "@/utils/bookService";
import { authService } from "@/utils/authService";
import { toast } from "sonner";

// Form validation schema
const addBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  coverUrl: z.string().optional(), 
  condition: z.string().min(1, "Book condition is required"),
  genre: z.string().min(1, "Genre is required"),
});

type AddBookFormValues = z.infer<typeof addBookSchema>;

const conditions = [
  "Like New",
  "Very Good",
  "Good",
  "Fair",
  "Poor",
];

const genres = [
  "Fiction",
  "Fantasy",
  "Romance",
  "Mystery",
  "Thriller",
  "Science Fiction",
  "Historical Fiction",
  "Non-Fiction",
  "Biography",
  "Self-Help",
  "Business",
  "Classic",
  "Children's",
  "Young Adult",
  "Poetry",
  "Other",
];

const AddBook = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // Initialize form
  const form = useForm<AddBookFormValues>({
    resolver: zodResolver(addBookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      coverUrl: "",
      condition: "",
      genre: "",
    },
  });

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle form submission
  const onSubmit = async (data: AddBookFormValues) => {
    setIsLoading(true);
    try {
      // Make sure we have all required fields
      const bookInput = {
        title: data.title,
        author: data.author,
        description: data.description,
        condition: data.condition,
        genre: data.genre,
        coverUrl: data.coverUrl,
        coverImage: selectedImage
      };
      
      await bookService.addBook(bookInput);
      toast.success("Book added successfully!");
      navigate("/welcome");
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Failed to add book. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <div className="pt-32 px-6 pb-10 page-transition">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className="text-bookswap-navy/70 hover:text-bookswap-teal mb-6"
            onClick={() => navigate("/welcome")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Button>
          
          <div className="glass rounded-2xl p-8 md:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="p-3 rounded-full bg-bookswap-teal/10 mb-4">
                <BookPlus className="h-8 w-8 text-bookswap-teal" />
              </div>
              <h1 className="text-3xl font-bold text-bookswap-navy mb-2">Add a Book</h1>
              <p className="text-bookswap-navy/70 text-center max-w-lg">
                Share a book from your collection that you'd like to swap with others.
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="label">Book Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter book title" className="input-field" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="label">Author</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter author name" className="input-field" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="genre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="label">Genre</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="input-field">
                                <SelectValue placeholder="Select a genre" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genres.map((genre) => (
                                <SelectItem key={genre} value={genre}>
                                  {genre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="label">Book Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="input-field">
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {conditions.map((condition) => (
                                <SelectItem key={condition} value={condition}>
                                  {condition}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="label">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide a brief description of the book..." 
                              className="input-field min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel className="label mb-2 block">Book Cover Image</FormLabel>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      
                      {imagePreview ? (
                        <div className="relative aspect-[2/3] rounded-md overflow-hidden border-2 border-bookswap-teal">
                          <img 
                            src={imagePreview} 
                            alt="Book cover preview" 
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          onClick={triggerFileInput}
                          className="aspect-[2/3] rounded-md border-2 border-dashed border-bookswap-navy/30 flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-bookswap-navy/5 transition-colors"
                        >
                          <ImageIcon className="h-12 w-12 text-bookswap-navy/40 mb-2" />
                          <p className="text-bookswap-navy/60 text-center">
                            Click to upload book cover image
                          </p>
                          <p className="text-bookswap-navy/40 text-sm text-center mt-1">
                            JPEG, PNG, or GIF
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-4"
                    onClick={() => navigate("/welcome")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="button-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding Book..." : "Add Book"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBook;
