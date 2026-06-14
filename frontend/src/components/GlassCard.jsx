import React, { memo } from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', onClick, delay = 0, hoverable = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className={`glass-panel ${hoverable ? 'glass-panel-hover' : ''} p-6 ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </motion.div>
  );
};

export default memo(GlassCard);
