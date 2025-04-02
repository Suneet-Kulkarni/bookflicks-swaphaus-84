
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Hero3D from "@/components/Hero3D";
import { ArrowRight, BookOpenText, RefreshCw, BookMarked, Users } from "lucide-react";
import { useEffect } from "react";

const features = [
  {
    icon: <BookOpenText className="h-6 w-6 text-bookswap-teal" />,
    title: "Browse Books",
    description: "Explore a wide variety of books available for swapping from our community members."
  },
  {
    icon: <RefreshCw className="h-6 w-6 text-bookswap-coral" />,
    title: "Swap Books",
    description: "Exchange your books with others, refreshing your collection without spending money."
  },
  {
    icon: <BookMarked className="h-6 w-6 text-bookswap-amber" />,
    title: "Save Books",
    description: "Add books to your wishlist and get notified when they become available for swapping."
  },
  {
    icon: <Users className="h-6 w-6 text-bookswap-navy" />,
    title: "Join Community",
    description: "Connect with fellow book lovers who share your passion for reading and discovering new stories."
  }
];

const testimonials = [
  {
    quote: "BookSwap helped me discover amazing books I wouldn't have found otherwise. The community is fantastic!",
    author: "Sarah K.",
    role: "English Teacher"
  },
  {
    quote: "I've saved so much money and shelf space by swapping books instead of buying new ones. Highly recommend!",
    author: "Michael T.",
    role: "Avid Reader"
  },
  {
    quote: "The process is so simple and the selection is great. I've found rare books I couldn't find anywhere else.",
    author: "Jamie L.",
    role: "Book Collector"
  }
];

const Index = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-bookswap-teal/5 to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0 page-transition">
              <div className="inline-block bg-bookswap-teal/10 px-4 py-2 rounded-full text-bookswap-teal font-medium mb-4">
                Swap Books, Share Stories
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-bookswap-navy">
                Trade Books with <span className="text-bookswap-coral">Fellow Readers</span>
              </h1>
              <p className="text-lg text-bookswap-navy/70 mb-8">
                Join our community of book lovers who share, swap, and discover new stories through an eco-friendly book exchange platform.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="button-primary">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/login" className="button-outline">
                  Sign In
                </Link>
              </div>
            </div>
            
            <div className="relative lg:h-[600px] flex items-center justify-center perspective">
              <Hero3D />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-bookswap-coral/10 px-4 py-2 rounded-full text-bookswap-coral font-medium mb-4">
              Our Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-bookswap-navy mb-4">
              How BookSwap Works
            </h2>
            <p className="text-lg text-bookswap-navy/70 max-w-2xl mx-auto">
              Our platform makes it easy to exchange books with other readers, building a community of literary enthusiasts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="glass rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 p-3 rounded-full bg-white/50 backdrop-blur-sm inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-bookswap-navy mb-2">
                  {feature.title}
                </h3>
                <p className="text-bookswap-navy/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-bookswap-cream/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-bookswap-teal/5 to-bookswap-coral/5 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-bookswap-amber/10 px-4 py-2 rounded-full text-bookswap-amber font-medium mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-bookswap-navy mb-4">
              What Our Community Says
            </h2>
            <p className="text-lg text-bookswap-navy/70 max-w-2xl mx-auto">
              Hear from our members about their experience with BookSwap.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="glass rounded-xl p-6 relative animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute -top-3 -left-3 text-5xl text-bookswap-coral opacity-30">"</div>
                <div className="pt-4">
                  <p className="text-bookswap-navy mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-bookswap-teal to-bookswap-coral flex items-center justify-center text-white font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-bookswap-navy">
                        {testimonial.author}
                      </h4>
                      <p className="text-sm text-bookswap-navy/70">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-bookswap-teal/10 to-bookswap-coral/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center glass rounded-2xl p-10">
          <h2 className="text-3xl md:text-4xl font-bold text-bookswap-navy mb-6">
            Ready to Start Swapping?
          </h2>
          <p className="text-lg text-bookswap-navy/70 mb-8 max-w-2xl mx-auto">
            Join our community today and discover new books while sharing your favorites with fellow readers. It's free, eco-friendly, and connects you with book lovers worldwide.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup" className="button-primary">
              Join BookSwap Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/login" className="button-outline">
              Sign In
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-6 bg-bookswap-navy/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpenText className="h-6 w-6 text-bookswap-teal" />
            <span className="font-serif text-xl font-bold text-bookswap-navy">
              Book<span className="text-bookswap-coral">Swap</span>
            </span>
          </div>
          <p className="text-bookswap-navy/70 mb-6">
            Connect, Share, Read, Repeat
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <Link to="/" className="text-bookswap-navy/70 hover:text-bookswap-teal transition-colors">Home</Link>
            <Link to="/login" className="text-bookswap-navy/70 hover:text-bookswap-teal transition-colors">Login</Link>
            <Link to="/signup" className="text-bookswap-navy/70 hover:text-bookswap-teal transition-colors">Sign Up</Link>
          </div>
          <div className="text-sm text-bookswap-navy/50">
            &copy; {new Date().getFullYear()} BookSwap. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
