import React, { useState } from 'react';
import { useSnapshot } from 'valtio';

import state from '../store';

const LogoControls = () => {
  const snap = useSnapshot(state);
  const [activeTab, setActiveTab] = useState('front');

  const handlePositionChange = (type, index, value) => {
    if (type === 'front') {
      state.frontLogoPosition[index] = parseFloat(value);
    } else if (type === 'back') {
      state.backLogoPosition[index] = parseFloat(value);
    }
  };

  const handleScaleChange = (type, value) => {
    if (type === 'front') {
      state.frontLogoScale = parseFloat(value);
    } else if (type === 'back') {
      state.backLogoScale = parseFloat(value);
    }
  };

  return (
    <div className="logo-controls">
      <h2 className="section-title">Logo Controls</h2>
      
      <div className="logo-tabs">
        <button 
          className={`logo-tab ${activeTab === 'front' ? 'active' : ''}`}
          onClick={() => setActiveTab('front')}
        >
          Front Logo
        </button>
        <button 
          className={`logo-tab ${activeTab === 'back' ? 'active' : ''}`}
          onClick={() => setActiveTab('back')}
        >
          Back Logo
        </button>
      </div>
      
      {activeTab === 'front' && (
        <div className="logo-controls-content">
          <div className="control-section">
            <h3 className="subsection-title">Position</h3>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>X Position</label>
                <span className="slider-value">{snap.frontLogoPosition[0].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.frontLogoPosition[0]}
                onChange={(e) => handlePositionChange('front', 0, e.target.value)}
                className="modern-slider"
              />
            </div>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Y Position</label>
                <span className="slider-value">{snap.frontLogoPosition[1].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.frontLogoPosition[1]}
                onChange={(e) => handlePositionChange('front', 1, e.target.value)}
                className="modern-slider"
              />
            </div>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Z Position</label>
                <span className="slider-value">{snap.frontLogoPosition[2].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.frontLogoPosition[2]}
                onChange={(e) => handlePositionChange('front', 2, e.target.value)}
                className="modern-slider"
              />
            </div>
          </div>
          
          <div className="control-section">
            <h3 className="subsection-title">Scale</h3>
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Size</label>
                <span className="slider-value">{snap.frontLogoScale.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01"
                value={snap.frontLogoScale}
                onChange={(e) => handleScaleChange('front', e.target.value)}
                className="modern-slider"
              />
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'back' && (
        <div className="logo-controls-content">
          <div className="control-section">
            <h3 className="subsection-title">Position</h3>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>X Position</label>
                <span className="slider-value">{snap.backLogoPosition[0].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.backLogoPosition[0]}
                onChange={(e) => handlePositionChange('back', 0, e.target.value)}
                className="modern-slider"
              />
            </div>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Y Position</label>
                <span className="slider-value">{snap.backLogoPosition[1].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.backLogoPosition[1]}
                onChange={(e) => handlePositionChange('back', 1, e.target.value)}
                className="modern-slider"
              />
            </div>
            
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Z Position</label>
                <span className="slider-value">{snap.backLogoPosition[2].toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.01"
                value={snap.backLogoPosition[2]}
                onChange={(e) => handlePositionChange('back', 2, e.target.value)}
                className="modern-slider"
              />
            </div>
          </div>
          
          <div className="control-section">
            <h3 className="subsection-title">Scale</h3>
            <div className="slider-container">
              <div className="slider-label-row">
                <label>Size</label>
                <span className="slider-value">{snap.backLogoScale.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01"
                value={snap.backLogoScale}
                onChange={(e) => handleScaleChange('back', e.target.value)}
                className="modern-slider"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoControls;
