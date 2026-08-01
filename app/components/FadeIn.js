"use client";
import { useEffect, useRef, useState } from "react";

export default function FadeIn({ children, delay = 0, direction = "up" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "30px",
      }
    );

    if (ref.current) observer.observe(ref.current);
    
    return () => {
      if (ref.current) observer.disconnect();
    };
  }, []);

  const getTransform = () => {
    if (direction === "up") return "translateY(40px)";
    if (direction === "left") return "translateX(-40px)";
    if (direction === "right") return "translateX(40px)";
    return "none";
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate(0,0)" : getTransform(),
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
      className="w-full flex-grow"
    >
      {children}
    </div>
  );
}
