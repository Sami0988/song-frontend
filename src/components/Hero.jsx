import React, { useEffect, useState } from 'react';
import './Hero.css';
import { FaMusic, FaSpotify, FaItunesNote, FaYoutube, FaChevronDown } from 'react-icons/fa';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Hero = () => {
  const [isHovering, setIsHovering] = useState(false);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  // Floating notes animation
  const floatingNotes = Array(8).fill(0).map((_, i) => {
    const size = Math.random() * 30 + 10;
    return {
      id: i,
      size,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
      opacity: Math.random() * 0.5 + 0.2
    };
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        scale: [1, 1.02, 1],
        transition: {
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear'
        }
      });
    }
  }, [controls, inView]);

 
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.1, 0.8, 0.2, 1]
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "backOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  };

  const accentVariants = {
    hidden: { opacity: 0, scaleX: 0, transformOrigin: 'left' },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: {
        delay: 0.8,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section className="hero" ref={ref}>
      {/* Floating musical notes background */}
      <div className="floating-notes">
        {floatingNotes.map(note => (
          <motion.div
            key={note.id}
            className="floating-note"
            style={{
              left: `${note.left}%`,
              width: `${note.size}px`,
              height: `${note.size}px`,
              opacity: note.opacity
            }}
            animate={{
              y: [0, -100],
              rotate: [0, Math.random() > 0.5 ? 360 : -360]
            }}
            transition={{
              y: {
                repeat: Infinity,
                repeatType: 'reverse',
                duration: note.duration,
                delay: note.delay,
                ease: 'linear'
              },
              rotate: {
                repeat: Infinity,
                duration: note.duration * 2,
                ease: 'linear'
              }
            }}
          >
            <FaMusic />
          </motion.div>
        ))}
      </div>
      
      {/* Animated gradient overlay */}
      <motion.div 
        className="hero-overlay"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(47, 54, 64, 0.9) 0%, rgba(232, 65, 24, 0.7) 100%)',
            'linear-gradient(135deg, rgba(47, 54, 64, 0.9) 0%, rgba(140, 122, 230, 0.7) 100%)',
            'linear-gradient(135deg, rgba(47, 54, 64, 0.9) 0%, rgba(232, 65, 24, 0.7) 100%)'
          ]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear'
        }}
      />
      
      {/* Background image with subtle animation */}
      <motion.div 
        className="hero-bg-image"
        animate={controls}
      />
      
      <motion.div 
        className="hero-content"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
      >
        <motion.div variants={itemVariants}>
          <motion.h1 
            variants={titleVariants}
            animate={isHovering ? "hover" : "visible"}
          >
            Discover the Soul of <motion.span 
              className="accent-word"
              initial="hidden"
              animate="visible"
              variants={accentVariants}
            >
              Ethiopian
            </motion.span> Music
          </motion.h1>
        </motion.div>
        
        <motion.p variants={itemVariants}>
          Journey through centuries of rich musical heritage
        </motion.p>
        
        <motion.div 
          className="hero-icons"
          variants={itemVariants}
        >
          <motion.a 
            href="#" 
            aria-label="Music"
            whileHover={{ 
              y: -10,
              scale: 1.1,
              boxShadow: '0 10px 20px rgba(232, 65, 24, 0.3)'
            }}
          >
            <FaMusic className="icon" />
          </motion.a>
          <motion.a 
            href="#" 
            aria-label="Spotify"
            whileHover={{ 
              y: -10,
              scale: 1.1,
              backgroundColor: 'rgba(29, 185, 84, 0.2)',
              boxShadow: '0 10px 20px rgba(29, 185, 84, 0.3)'
            }}
          >
            <FaSpotify className="icon spotify" />
          </motion.a>
          <motion.a 
            href="#" 
            aria-label="Apple Music"
            whileHover={{ 
              y: -10,
              scale: 1.1,
              backgroundColor: 'rgba(252, 60, 68, 0.2)',
              boxShadow: '0 10px 20px rgba(252, 60, 68, 0.3)'
            }}
          >
            <FaItunesNote className="icon apple" />
          </motion.a>
          <motion.a 
            href="#" 
            aria-label="YouTube"
            whileHover={{ 
              y: -10,
              scale: 1.1,
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              boxShadow: '0 10px 20px rgba(255, 0, 0, 0.3)'
            }}
          >
            <FaYoutube className="icon youtube" />
          </motion.a>
        </motion.div>
        
        <motion.div 
          className="cta-buttons"
          variants={itemVariants}
        >
          <motion.button 
            className="primary-btn"
            whileHover={{ 
              y: -3,
              scale: 1.05,
              boxShadow: '0 8px 25px rgba(232, 65, 24, 0.6)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Artists
          </motion.button>
          <motion.button 
            className="secondary-btn"
            whileHover={{ 
              y: -3,
              scale: 1.05,
              backgroundColor: 'rgba(255, 255, 255, 0.15)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Listen Now
          </motion.button>
        </motion.div>
        
        <motion.div 
          className="scroll-down"
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <FaChevronDown />
          <span>Scroll Down</span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;