import React from 'react';
import { useSnapshot } from 'valtio';
import state from '../store';
import { downloadCanvasToImage } from '../config/helpers';

const Navbar = () => {
  const snap = useSnapshot(state);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-logo">
          3D Clothing Configurator
        </div>
        <div className="navbar-actions">
          <button 
            className="download-btn"
            onClick={downloadCanvasToImage}
          >
            Download
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
