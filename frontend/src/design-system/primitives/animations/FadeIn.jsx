import { motion } from 'framer-motion';
import * as config from '../../config';

export default function FadeIn({ children, delay = 0, className = '', ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: config.animations.duration.slow,
        delay,
        ease: config.animations.easing.standard,
      }}
      viewport={config.animations.viewport}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
