import { motion } from "framer-motion";

// Modern easing functions
const easeVariants = {
  smooth: [0.33, 0.66, 0.66, 1],
  bounce: [0.175, 0.885, 0.32, 1.275],
  elastic: [0.68, -0.55, 0.265, 1.55],
  smooth_slow: [0.25, 0.46, 0.45, 0.94],
};

// Modern entrance animation
export function ModernEntrance({ children, delay = 0, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.7,
        delay: delay + index * 0.12,
        ease: easeVariants.smooth,
      }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {children}
    </motion.div>
  );
}

// Smooth scale-up animation
export function ScaleUp({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6, delay, ease: easeVariants.smooth }}
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
    >
      {children}
    </motion.div>
  );
}

// Modern stagger effect with blur
export function StaggerContainer({ children, delay = 0 }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: easeVariants.smooth },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.isArray(children) 
        ? children.map((child, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

// Modern slide animations
export function SlideInLeft({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -80, filter: "blur(10px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay, ease: easeVariants.smooth }}
      whileHover={{ x: 8, transition: { duration: 0.3 } }}
    >
      {children}
    </motion.div>
  );
}

export function SlideInRight({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80, filter: "blur(10px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay, ease: easeVariants.smooth }}
      whileHover={{ x: -8, transition: { duration: 0.3 } }}
    >
      {children}
    </motion.div>
  );
}

export function SlideInUp({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay, ease: easeVariants.smooth }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
    >
      {children}
    </motion.div>
  );
}

// Modern rotate animation
export function RotateIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: -30, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay, ease: easeVariants.bounce }}
      whileHover={{ scale: 1.08, rotate: 5, transition: { duration: 0.3 } }}
    >
      {children}
    </motion.div>
  );
}

// Floating element with modern physics
export function FloatingElement({ children, delay = 0 }) {
  return (
    <motion.div
      animate={{ 
        y: [0, -25, 0],
        rotateZ: [0, 3, -3, 0],
      }}
      transition={{ 
        duration: 5, 
        repeat: Infinity, 
        delay,
        ease: "easeInOut",
      }}
      style={{ perspective: 1200 }}
    >
      {children}
    </motion.div>
  );
}

// Glowing card with modern effects
export function GlowingCard({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6, delay, ease: easeVariants.smooth }}
      whileHover={{
        boxShadow: "0 20px 60px rgba(99, 102, 241, 0.6), 0 0 40px rgba(139, 92, 246, 0.4)",
        transform: "translateY(-12px) scale(1.02)",
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

// Pulsing element
export function PulseElement({ children, delay = 0 }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.08, 1],
        boxShadow: [
          "0 0 20px rgba(99, 102, 241, 0.3)",
          "0 0 40px rgba(99, 102, 241, 0.6)",
          "0 0 20px rgba(99, 102, 241, 0.3)",
        ],
      }}
      transition={{ duration: 2.5, repeat: Infinity, delay }}
    >
      {children}
    </motion.div>
  );
}

// Shimmer effect
export function ShimmerElement({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0.7 }}
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 2, repeat: Infinity, delay }}
    >
      {children}
    </motion.div>
  );
}

// Fade-in with scale
export function FadeInScale({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: easeVariants.smooth }}
    >
      {children}
    </motion.div>
  );
}

// Modern container - maintains backward compatibility
export function AnimatedContainer({ children, delay = 0, index = 0 }) {
  return (
    <ModernEntrance delay={delay} index={index}>
      {children}
    </ModernEntrance>
  );
}
