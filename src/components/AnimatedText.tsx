
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
}

export const AnimatedWords: React.FC<AnimatedWordProps> = ({
  text,
  className,
  wordDelay = 100,
  characterDelay = 0
}) => {
  const words = text.split(" ");
  
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
