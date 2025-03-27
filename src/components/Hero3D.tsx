
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Book cover URLs
const bookCovers = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1629992101753-56d196c8aabb?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800",
];

interface Book3DProps {
  coverUrl: string;
  rotateY: number;
  rotateX: number;
  translateZ: number;
  delay: number;
  scale?: number;
}

const Book3D: React.FC<Book3DProps> = ({
  coverUrl,
  rotateY,
  rotateX,
  translateZ,
  delay,
  scale = 1
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "absolute book-3d transition-all duration-1000 ease-out opacity-0 transform",
        isLoaded && "opacity-100"
      )}
      style={{
        transform: `
          rotateY(${rotateY}deg) 
          rotateX(${rotateX}deg) 
          translateZ(${translateZ}px)
          scale(${scale})
        `,
        transformStyle: "preserve-3d",
        transition: `transform 0.5s ease, opacity 0.8s ease ${delay}ms`,
        willChange: "transform, opacity",
      }}
    >
      {/* Front cover */}
      <div 
        className="relative w-40 h-56 rounded-md overflow-hidden shadow-xl"
        style={{ backfaceVisibility: "hidden" }}
      >
        <img
          src={coverUrl}
          alt="Book cover"
          className="w-full h-full object-cover"
          style={{ display: "block" }}
        />
      </div>

      {/* Book spine */}
      <div
        className="absolute top-0 left-0 w-6 h-56 bg-gray-800 origin-left"
        style={{
          transform: "rotateY(90deg) translateX(-3px)",
          backfaceVisibility: "hidden",
        }}
      ></div>

      {/* Book back */}
      <div
        className="absolute top-0 left-0 w-40 h-56 bg-gray-200 origin-right"
        style={{
          transform: "rotateY(180deg) translateZ(6px)",
          backfaceVisibility: "hidden",
        }}
      ></div>
    </div>
  );
};

const Hero3D = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sceneRef.current) return;
      
      const rect = sceneRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized mouse position (-1 to 1)
      const normalizedX = (e.clientX - centerX) / (rect.width / 2);
      const normalizedY = (e.clientY - centerY) / (rect.height / 2);
      
      setMousePosition({ x: normalizedX, y: normalizedY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={sceneRef}
      className="relative w-full h-96 md:h-[500px] perspective"
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      <div
        className="scene w-full h-full flex items-center justify-center"
        style={{
          transform: `
            rotateY(${mousePosition.x * 10}deg) 
            rotateX(${-mousePosition.y * 10}deg)
          `,
          transformStyle: "preserve-3d",
          transition: "transform 0.1s ease-out",
        }}
      >
        <Book3D
          coverUrl={bookCovers[0]}
          rotateY={-25}
          rotateX={5}
          translateZ={-50}
          delay={100}
          scale={0.9}
        />
        <Book3D
          coverUrl={bookCovers[1]}
          rotateY={0}
          rotateX={0}
          translateZ={0}
          delay={300}
          scale={1.1}
        />
        <Book3D
          coverUrl={bookCovers[2]}
          rotateY={25}
          rotateX={-5}
          translateZ={-80}
          delay={200}
          scale={0.8}
        />
        <Book3D
          coverUrl={bookCovers[3]}
          rotateY={-35}
          rotateX={-10}
          translateZ={-120}
          delay={400}
          scale={0.7}
        />
        <Book3D
          coverUrl={bookCovers[4]}
          rotateY={40}
          rotateX={15}
          translateZ={-150}
          delay={500}
          scale={0.6}
        />

        {/* Floating particles */}
        <div className="absolute w-4 h-4 rounded-full bg-bookswap-teal/30 animate-float" 
             style={{ top: '20%', left: '30%', animationDelay: '0s' }}></div>
        <div className="absolute w-3 h-3 rounded-full bg-bookswap-coral/30 animate-float" 
             style={{ top: '70%', left: '15%', animationDelay: '1.5s' }}></div>
        <div className="absolute w-5 h-5 rounded-full bg-bookswap-amber/30 animate-float" 
             style={{ top: '40%', right: '25%', animationDelay: '0.7s' }}></div>
        <div className="absolute w-2 h-2 rounded-full bg-bookswap-teal/30 animate-float" 
             style={{ bottom: '30%', right: '10%', animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default Hero3D;
