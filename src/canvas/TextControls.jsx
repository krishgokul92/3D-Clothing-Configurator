import React, { useState } from 'react';
import { useSnapshot } from 'valtio';
import { SketchPicker } from 'react-color';
import state from '../store';

const fonts = [
  "Arial",
  "Times New Roman",
  "Segoe UI",
  "Tahoma",
  "Calibri",
  "Helvetica",
  "Futura PT",
  "Open Sans",
  "Roboto",
  "Verdana"
];

const TextControls = () => {
  const snap = useSnapshot(state);
  const [activeTab, setActiveTab] = useState('front');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleTextChange = (type, value) => {
    if (type === 'front') {
      state.frontText = value;
    } else if (type === 'back') {
      state.backText = value;
    }
  };

  const handlePositionChange = (type, index, value) => {
    if (type === 'front') {
      state.frontTextPosition[index] = parseFloat(value);
    } else if (type === 'back') {
      state.backTextPosition[index] = parseFloat(value);
    }
  };

  const handleRotationChange = (type, index, value) => {
    if (type === 'front') {
      state.frontTextRotation[index] = parseFloat(value);
    } else if (type === 'back') {
      state.backTextRotation[index] = parseFloat(value);
    }
  };

  const handleScaleChange = (type, index, value) => {
    if (type === 'front') {
      state.frontTextScale[index] = parseFloat(value);
    } else if (type === 'back') {
      state.backTextScale[index] = parseFloat(value);
    }
  };

  const handleFontChange = (type, value) => {
    if (type === 'front') {
      state.frontTextFont = value;
    } else if (type === 'back') {
      state.backTextFont = value;
    }
  };

  const handleColorChange = (type, value) => {
    if (type === 'front') {
      state.frontTextColor = value;
    } else if (type === 'back') {
      state.backTextColor = value;
    }
  };

  return (
    <div className="text-controls">
      <h2 className="section-title">Text Controls</h2>
      
      <div className="text-tabs">
        <button 
          className={`text-tab ${activeTab === 'front' ? 'active' : ''}`}
          onClick={() => setActiveTab('front')}
        >
          Front Text
        </button>
        <button 
          className={`text-tab ${activeTab === 'back' ? 'active' : ''}`}
          onClick={() => setActiveTab('back')}
        >
          Back Text
        </button>
      </div>
      
      {activeTab === 'front' && (
        <div className="text-controls-content">
          <div className="control-section">
            <h3 className="subsection-title">Text Content</h3>
            <div className="input-container">
              <input
                type="text"
                value={snap.frontText}
                onChange={(event) => handleTextChange('front', event.target.value)}
                className="text-input"
                placeholder="Enter front text"
              />
            </div>
          </div>
          
          <div className="control-section">
            <h3 className="subsection-title">Font</h3>
            <div className="select-container">
              <select 
                value={snap.frontTextFont}
                onChange={(e) => handleFontChange('front', e.target.value)}
                className="font-select"
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="control-section">
            <h3 className="subsection-title">Color</h3>
            <div className="color-select-container">
              <div 
                className="color-preview"
                style={{ backgroundColor: snap.frontTextColor }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              ></div>
              {showColorPicker && (
                <div className="color-picker-dropdown">
                  <div className="color-picker-cover" onClick={() => setShowColorPicker(false)}></div>
                  <SketchPicker 
                    color={snap.frontTextColor}
                    onChange={(color) => handleColorChange('front', color.hex)}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="control-section">
            <h3 className="subsection-title">Position</h3>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>X Position</label>
                <span className="slider-value">{snap.frontTextPosition[0].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.frontTextPosition[0]}
                onChange={(e) => handlePositionChange('front', 0, e.target.value)}
                className="modern-slider"
              />
            </div>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Y Position</label>
                <span className="slider-value">{snap.frontTextPosition[1].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.frontTextPosition[1]}
                onChange={(e) => handlePositionChange('front', 1, e.target.value)}
                className="modern-slider"
              />
            </div>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Z Position</label>
                <span className="slider-value">{snap.frontTextPosition[2].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.frontTextPosition[2]}
                onChange={(e) => handlePositionChange('front', 2, e.target.value)}
                className="modern-slider"
              />
            </div>
          </div>
          
          <div className="control-section">
            <h3 className="subsection-title">Scale</h3>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Width</label>
                <span className="slider-value">{snap.frontTextScale[0].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01"
                value={snap.frontTextScale[0]}
                onChange={(e) => handleScaleChange('front', 0, e.target.value)}
                className="modern-slider"
              />
            </div>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Height</label>
                <span className="slider-value">{snap.frontTextScale[1].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01"
                value={snap.frontTextScale[1]}
                onChange={(e) => handleScaleChange('front', 1, e.target.value)}
                className="modern-slider"
              />
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'back' && (
        <div className="text-controls-content">
          <div className="control-section">
            <h3 className="subsection-title">Text Content</h3>
            <div className="input-container">
              <input
                type="text"
                value={snap.backText}
                onChange={(event) => handleTextChange('back', event.target.value)}
                className="text-input"
                placeholder="Enter back text"
              />
            </div>
          </div>
          
          <div className="control-section">
            <h3 className="subsection-title">Font</h3>
            <div className="select-container">
              <select 
                value={snap.backTextFont}
                onChange={(e) => handleFontChange('back', e.target.value)}
                className="font-select"
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="control-section">
            <h3 className="subsection-title">Color</h3>
            <div className="color-select-container">
              <div 
                className="color-preview"
                style={{ backgroundColor: snap.backTextColor }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              ></div>
              {showColorPicker && (
                <div className="color-picker-dropdown">
                  <div className="color-picker-cover" onClick={() => setShowColorPicker(false)}></div>
                  <SketchPicker 
                    color={snap.backTextColor}
                    onChange={(color) => handleColorChange('back', color.hex)}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="control-section">
            <h3 className="subsection-title">Position</h3>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>X Position</label>
                <span className="slider-value">{snap.backTextPosition[0].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.backTextPosition[0]}
                onChange={(e) => handlePositionChange('back', 0, e.target.value)}
                className="modern-slider"
              />
            </div>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Y Position</label>
                <span className="slider-value">{snap.backTextPosition[1].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.backTextPosition[1]}
                onChange={(e) => handlePositionChange('back', 1, e.target.value)}
                className="modern-slider"
              />
            </div>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Z Position</label>
                <span className="slider-value">{snap.backTextPosition[2].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.backTextPosition[2]}
                onChange={(e) => handlePositionChange('back', 2, e.target.value)}
                className="modern-slider"
              />
            </div>
          </div>
          
          <div className="control-section">
            <h3 className="subsection-title">Scale</h3>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Width</label>
                <span className="slider-value">{snap.backTextScale[0].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01"
                value={snap.backTextScale[0]}
                onChange={(e) => handleScaleChange('back', 0, e.target.value)}
                className="modern-slider"
              />
            </div>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Height</label>
                <span className="slider-value">{snap.backTextScale[1].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01"
                value={snap.backTextScale[1]}
                onChange={(e) => handleScaleChange('back', 1, e.target.value)}
                className="modern-slider"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextControls;
