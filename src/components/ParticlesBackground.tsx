
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  increasing: boolean;
}

const ParticlesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas to full screen
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reset particles when resizing
      initParticles();
    };
    
    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
    };
    
    // Initialize particles
    const initParticles = () => {
      particles.current = [];
      const numberOfParticles = Math.min(window.innerWidth, window.innerHeight) / 10;
      
      for (let i = 0; i < numberOfParticles; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: getRandomColor(),
          alpha: Math.random() * 0.5 + 0.1,
          increasing: Math.random() > 0.5
        });
      }
    };
    
    const getRandomColor = () => {
      const colors = [
        "rgba(255, 255, 255,",   // White
        "rgba(54, 214, 255,",    // Blue
        "rgba(138, 79, 255,",    // Purple
        "rgba(255, 107, 107,"    // Coral
      ];
      
      return colors[Math.floor(Math.random() * colors.length)];
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach((particle, index) => {
        // Pulse effect - change alpha
        if (particle.increasing) {
          particle.alpha += 0.003;
          if (particle.alpha >= 0.6) {
            particle.increasing = false;
          }
        } else {
          particle.alpha -= 0.003;
          if (particle.alpha <= 0.1) {
            particle.increasing = true;
          }
        }
        
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;
        
        // Attract particles to mouse position
        const dx = mousePosition.current.x - particle.x;
        const dy = mousePosition.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - distance) / 1500;
          
          particle.speedX += Math.cos(angle) * force;
          particle.speedY += Math.sin(angle) * force;
        }
        
        // Apply some drag
        particle.speedX *= 0.99;
        particle.speedY *= 0.99;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color} ${particle.alpha})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    // Initialize
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ backgroundColor: "transparent" }}
    />
  );
};

export default ParticlesBackground;
