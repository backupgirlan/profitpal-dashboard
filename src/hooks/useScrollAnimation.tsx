import { useEffect, useRef, useState } from "react";

type AnimationVariant = 
  | "fade-up" 
  | "fade-down" 
  | "fade-left" 
  | "fade-right" 
  | "zoom-in" 
  | "zoom-out"
  | "flip-up"
  | "rotate-in"
  | "blur-in"
  | "slide-up-spring"
  | "scale-rotate";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.15, rootMargin = "0px 0px -50px 0px", once = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
};

export const getAnimationClass = (variant: AnimationVariant, isVisible: boolean, delay = 0): string => {
  const base = "transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]";
  const delayStyle = delay > 0 ? `delay-[${delay}ms]` : "";
  
  const variants: Record<AnimationVariant, { hidden: string; visible: string }> = {
    "fade-up": {
      hidden: "opacity-0 translate-y-16",
      visible: "opacity-100 translate-y-0",
    },
    "fade-down": {
      hidden: "opacity-0 -translate-y-16",
      visible: "opacity-100 translate-y-0",
    },
    "fade-left": {
      hidden: "opacity-0 translate-x-16",
      visible: "opacity-100 translate-x-0",
    },
    "fade-right": {
      hidden: "opacity-0 -translate-x-16",
      visible: "opacity-100 translate-x-0",
    },
    "zoom-in": {
      hidden: "opacity-0 scale-75",
      visible: "opacity-100 scale-100",
    },
    "zoom-out": {
      hidden: "opacity-0 scale-110",
      visible: "opacity-100 scale-100",
    },
    "flip-up": {
      hidden: "opacity-0 [transform:perspective(800px)_rotateX(25deg)_translateY(40px)]",
      visible: "opacity-100 [transform:perspective(800px)_rotateX(0deg)_translateY(0)]",
    },
    "rotate-in": {
      hidden: "opacity-0 rotate-6 scale-90",
      visible: "opacity-100 rotate-0 scale-100",
    },
    "blur-in": {
      hidden: "opacity-0 blur-sm scale-95",
      visible: "opacity-100 blur-0 scale-100",
    },
    "slide-up-spring": {
      hidden: "opacity-0 translate-y-24",
      visible: "opacity-100 translate-y-0",
    },
    "scale-rotate": {
      hidden: "opacity-0 scale-50 -rotate-12",
      visible: "opacity-100 scale-100 rotate-0",
    },
  };

  const v = variants[variant];
  return `${base} ${delayStyle} ${isVisible ? v.visible : v.hidden}`;
};

// Component wrapper for easy usage
export const ScrollReveal = ({
  children,
  variant = "fade-up",
  delay = 0,
  className = "",
  stagger = false,
  staggerDelay = 100,
}: {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  className?: string;
  stagger?: boolean;
  staggerDelay?: number;
}) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`${getAnimationClass(variant, isVisible, delay)} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default useScrollAnimation;
