import React, { useState } from 'react'
import { SketchPicker } from 'react-color'
import { useSnapshot } from 'valtio'

import state from '../store';

const ColorPicker = () => {
  const snap = useSnapshot(state);
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  
  // Predefined color palette
  const colors = [
    '#FF0000', '#FF5733', '#FFC300', '#DAF7A6', 
    '#C70039', '#900C3F', '#581845', '#2E4053',
    '#1ABC9C', '#3498DB', '#8E44AD', '#2C3E50',
    '#F1C40F', '#E67E22', '#E74C3C', '#ECF0F1',
    '#FFFFFF', '#000000', '#34495E', '#7F8C8D'
  ];

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  return (
    <div className="color-picker-container">
      <h2 className="section-title">Choose Color</h2>
      
      <div className="color-palette">
        {colors.map((color, i) => (
          <div 
            key={i} 
            className="color-swatch"
            style={{ backgroundColor: color }}
            onClick={() => state.color = color}
          />
        ))}
      </div>
      
      <div className="current-color-container">
        <span>Current Color:</span>
        <div 
          className="current-color"
          style={{ backgroundColor: snap.color }}
          onClick={handleClick}
        />
      </div>
      
      {displayColorPicker && (
        <div className="color-picker-popover">
          <div className="color-picker-cover" onClick={handleClose} />
          <SketchPicker 
            color={snap.color}
            disableAlpha
            onChange={(color) => state.color = color.hex}
          />
        </div>
      )}
      
      <div className="color-sliders">
        <div className="slider-container">
          <label>Hue</label>
          <input 
            type="range" 
            min="0" 
            max="360" 
            className="hue-slider"
            onChange={(e) => {
              const h = e.target.value;
              const s = 100;
              const l = 50;
              state.color = `hsl(${h}, ${s}%, ${l}%)`;
            }}
          />
        </div>
        
        <div className="slider-container">
          <label>Brightness</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="50"
            className="brightness-slider"
            onChange={(e) => {
              // Extract current HSL values
              const hslMatch = snap.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
              if (hslMatch) {
                const h = hslMatch[1];
                const s = hslMatch[2];
                const l = e.target.value;
                state.color = `hsl(${h}, ${s}%, ${l}%)`;
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ColorPicker