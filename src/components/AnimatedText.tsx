
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className,
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <span 
      className={cn(
        "inline-block transition-all duration-700 opacity-0 translate-y-8",
        isVisible && "opacity-100 translate-y-0",
        className
      )}
    >
      {text}
    </span>
  );
};

interface AnimatedWordProps {
  text: string;
  className?: string;
  wordDelay?: number;
  characterDelay?: number;
  shimmerColor?: "purple" | "blue" | "gradient" | "bright" | "default";
}

export const AnimatedWords: React.FC<AnimatedWordProps> = ({
  text,
  className,
  wordDelay = 100,
  characterDelay = 0,
  shimmerColor = "default"
}) => {
  const words = text.split(" ");
  
  const shimmerClasses = {
    default: "text-white",
    purple: "bg-gradient-to-r from-purple-400 via-bookswap-purple to-purple-300 bg-clip-text text-transparent bg-[length:200%_100%] animate-text-shimmer",
    blue: "bg-gradient-to-r from-bookswap-blue via-cyan-300 to-bookswap-blue bg-clip-text text-transparent bg-[length:200%_100%] animate-text-shimmer",
    gradient: "bg-gradient-to-r from-bookswap-purple via-pink-400 to-bookswap-blue bg-clip-text text-transparent bg-[length:200%_100%] animate-text-shimmer",
    bright: "bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-text-shimmer font-extrabold text-shadow-sm"
  };
  
  return (
    <span className={shimmerClasses[shimmerColor]}>
      {words.map((word, index) => (
        <span key={index} className="inline-block">
          {characterDelay > 0 ? (
            // Animate each character
            word.split("").map((char, charIndex) => (
              <AnimatedText 
                key={`${index}-${charIndex}`}
                text={char}
                className={className}
                delay={index * wordDelay + charIndex * characterDelay}
              />
            ))
          ) : (
            // Animate full word
            <AnimatedText 
              text={word}
              className={className}
              delay={index * wordDelay}
            />
          )}
          {index < words.length - 1 && " "}
        </span>
      ))}
    </span>
  );
};

export default AnimatedText;
