
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
  shimmerColor?: "gold" | "coral" | "teal" | "default";
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
    default: "bg-gradient-to-r from-white via-white/70 to-white bg-[length:200%_100%] animate-text-shimmer",
    gold: "bg-gradient-to-r from-bookswap-amber via-yellow-300 to-bookswap-amber bg-[length:200%_100%] animate-text-shimmer",
    coral: "bg-gradient-to-r from-bookswap-coral via-pink-300 to-bookswap-coral bg-[length:200%_100%] animate-text-shimmer",
    teal: "bg-gradient-to-r from-bookswap-teal via-cyan-300 to-bookswap-teal bg-[length:200%_100%] animate-text-shimmer"
  };
  
  return (
    <>
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
    </>
  );
};

export default AnimatedText;
