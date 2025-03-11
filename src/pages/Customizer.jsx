import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSnapshot } from 'valtio';

import state from '../store';
import { downloadCanvasToImage, reader } from '../config/helpers';
import { fadeAnimation } from '../config/motion';
import MaterialColorPicker from '../components/MaterialColorPicker';

const Customizer = () => {
  const snap = useSnapshot(state);

  return (
    <motion.div
      key="custom"
      className="customizer-wrapper"
      {...fadeAnimation}
    >
      <div className="customizer-container">
        <MaterialColorPicker />
      </div>
    </motion.div>
  )
}

export default Customizer
