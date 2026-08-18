import { motion } from 'framer-motion';
import * as config from '../../config';

export default function Card({ 
  children, 
  size = 'medium', // 'small' | 'medium' | 'large'
  elevation = 'md',
  hover = true,
  className = '',
  ...props 
}) {
  return (
    <motion.div
      className={`bg-white ${className}`}
      style={{
        borderRadius: config.borderRadius.card[size],
        boxShadow: config.shadows[elevation],
        padding: config.spacing.gaps.lg,
        border: `1px solid ${config.colors.slate[200]}`,
      }}
      whileHover={hover ? { 
        scale: config.animations.hover.scale,
        y: config.animations.hover.translateY,
        boxShadow: config.shadows.hover.card,
      } : undefined}
      transition={{ 
        duration: config.animations.duration.fast,
        ease: config.animations.easing.standard,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
