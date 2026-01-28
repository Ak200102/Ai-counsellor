import { motion } from "framer-motion";

export function Logo3D({ emoji, size = "lg", animated = true }) {
  const sizeClasses = {
    sm: "text-3xl",
    md: "text-5xl",
    lg: "text-7xl",
    xl: "text-9xl"
  };

  if (!animated) {
    return (
      <div className={`${sizeClasses[size]} inline-block`}>
        {emoji}
      </div>
    );
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} inline-block`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
      animate={{
        rotateX: [0, 10, -10, 0],
        rotateY: [0, 20, -20, 0],
        rotateZ: [0, 5, -5, 0]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileHover={{
        scale: 1.15,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        transition: { duration: 0.3 }
      }}
    >
      {emoji}
    </motion.div>
  );
}

export function Logo3DGlowing({ emoji, size = "lg" }) {
  const sizeClasses = {
    sm: "text-3xl",
    md: "text-5xl",
    lg: "text-7xl",
    xl: "text-9xl"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} inline-block filter drop-shadow-lg`}
      animate={{
        rotateX: [0, 15, -15, 0],
        rotateY: [0, 25, -25, 0],
        scale: [1, 1.05, 1],
        textShadow: [
          "0 0 10px rgba(255, 255, 255, 0.5)",
          "0 0 30px rgba(139, 92, 246, 0.8)",
          "0 0 10px rgba(255, 255, 255, 0.5)"
        ]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileHover={{
        scale: 1.2,
        textShadow: "0 0 40px rgba(139, 92, 246, 1)",
        transition: { duration: 0.3 }
      }}
    >
      {emoji}
    </motion.div>
  );
}

export function Logo3DFlip({ emoji, size = "lg" }) {
  const sizeClasses = {
    sm: "text-3xl",
    md: "text-5xl",
    lg: "text-7xl",
    xl: "text-9xl"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} inline-block`}
      animate={{
        rotateY: [0, 180, 360],
        rotateX: [0, 10, 0]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }}
      whileHover={{
        rotateY: 180,
        rotateX: 15,
        scale: 1.15,
        transition: { duration: 0.6 }
      }}
    >
      {emoji}
    </motion.div>
  );
}

export function Logo3DBounce({ emoji, size = "lg" }) {
  const sizeClasses = {
    sm: "text-3xl",
    md: "text-5xl",
    lg: "text-7xl",
    xl: "text-9xl"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} inline-block`}
      animate={{
        y: [0, -20, 0],
        rotateX: [0, 45, 0],
        rotateZ: [0, 10, -10, 0]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileHover={{
        y: -40,
        rotateX: 60,
        scale: 1.1,
        transition: { duration: 0.3 }
      }}
    >
      {emoji}
    </motion.div>
  );
}
