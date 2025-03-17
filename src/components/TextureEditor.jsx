import React, { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { SketchPicker } from 'react-color';
import state from '../store';

const TextureEditor = () => {
  const snap = useSnapshot(state);
  const [materialsList, setMaterialsList] = useState([]);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [textureEnabled, setTextureEnabled] = useState(false);
  const [selectedTexture, setSelectedTexture] = useState('pattern1.png');
  const [textureOpacity, setTextureOpacity] = useState(0.8);
  const [textureScale, setTextureScale] = useState(1);
  const [textureColor, setTextureColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Process materials when they change
  useEffect(() => {
    if (snap.materials && Object.keys(snap.materials).length > 0) {
      // Convert materials object to array for easier rendering
      const materialsArray = Object.entries(snap.materials).map(([name, color]) => ({
        name,
        color
      }));
      
      setMaterialsList(materialsArray);
      
      // Set the first material as active if none is selected
      if (!activeMaterial && materialsArray.length > 0) {
        setActiveMaterial(materialsArray[0].name);
        state.activeMaterial = materialsArray[0].name;
        
        // Initialize texture settings if needed
        if (!snap.materialTextures || !snap.materialTextures[materialsArray[0].name]) {
          state.initMaterialTexture(materialsArray[0].name);
        }
      }
    }
  }, [snap.materials, activeMaterial]);

  // Update active material when state.activeMaterial changes
  useEffect(() => {
    if (snap.activeMaterial && snap.activeMaterial !== activeMaterial) {
      setActiveMaterial(snap.activeMaterial);
      
      // Initialize texture settings if needed
      if (!snap.materialTextures || !snap.materialTextures[snap.activeMaterial]) {
        state.initMaterialTexture(snap.activeMaterial);
      }
    }
  }, [snap.activeMaterial, activeMaterial]);

  // Update texture state when active material changes
  useEffect(() => {
    if (activeMaterial && snap.materialTextures && snap.materialTextures[activeMaterial]) {
      const textureSettings = snap.materialTextures[activeMaterial];
      setTextureEnabled(textureSettings.enabled || false);
      setSelectedTexture(textureSettings.texture || 'pattern1.png');
      setTextureOpacity(textureSettings.opacity || 0.8);
      setTextureScale(textureSettings.scale || 1);
      setTextureColor(textureSettings.color || '#000000');
    }
  }, [activeMaterial, snap.materialTextures]);

  const handleMaterialChange = (materialName) => {
    setActiveMaterial(materialName);
    state.activeMaterial = materialName;
    
    // Initialize texture settings if needed
    if (!snap.materialTextures || !snap.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
  };

  // Handle texture toggle
  const handleTextureToggle = () => {
    if (activeMaterial) {
      state.toggleMaterialTexture(activeMaterial);
      setTextureEnabled(!textureEnabled);
    }
  };

  // Handle texture property change
  const handleTextureChange = (property, value) => {
    if (activeMaterial) {
      state.updateTextureSettings(activeMaterial, property, value);
      
      // Update local state
      switch (property) {
        case 'opacity':
          setTextureOpacity(value);
          break;
        case 'scale':
          setTextureScale(value);
          break;
        case 'texture':
          setSelectedTexture(value);
          break;
        case 'color':
          setTextureColor(value);
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="material-texture-editor">
      {/* Material Selection */}
      <div className="material-tabs">
        {materialsList.map((material) => (
          <div
            key={material.name}
            className={`material-tab ${activeMaterial === material.name ? 'active' : ''}`}
            onClick={() => handleMaterialChange(material.name)}
          >
            <div 
              className="material-tab-color" 
              style={{ backgroundColor: material.color }}
            ></div>
            <div className="material-tab-name">{material.name}</div>
          </div>
        ))}
      </div>

      {/* Texture Editor */}
      {!activeMaterial ? (
        <p>Please select a material first.</p>
      ) : (
        <>
          <div className="toggle-container">
            <label className="toggle-label">Enable Texture Overlay</label>
            <div 
              className={`toggle-switch ${textureEnabled ? 'active' : ''}`}
              onClick={handleTextureToggle}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          
          {textureEnabled && (
            <div className="texture-properties">
              <h3 className="subsection-title">Texture Properties</h3>
              
              {/* Texture Selection */}
              <div className="property-group">
                <label>Select Texture</label>
                <div className="texture-grid">
                  {snap.availableTextures.map((texture) => (
                    <div
                      key={texture.file}
                      className={`texture-item ${selectedTexture === texture.file ? 'active' : ''}`}
                      onClick={() => handleTextureChange('texture', texture.file)}
                    >
                      <div className="texture-image-container">
                        <img
                          src={`/pattern/${texture.file}`}
                          alt={texture.name}
                          className="texture-image"
                        />
                      </div>
                      <div className="texture-name">{texture.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Opacity Slider */}
              <div className="property-group">
                <div className="slider-label-row">
                  <label>Opacity</label>
                  <span className="slider-value">{textureOpacity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  className="modern-slider"
                  value={textureOpacity}
                  onChange={(e) => handleTextureChange('opacity', parseFloat(e.target.value))}
                />
              </div>
              
              {/* Scale Slider */}
              <div className="property-group">
                <div className="slider-label-row">
                  <label>Scale</label>
                  <span className="slider-value">{textureScale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  className="modern-slider"
                  value={textureScale}
                  onChange={(e) => handleTextureChange('scale', parseFloat(e.target.value))}
                />
              </div>
              
              {/* Texture Color */}
              <div className="property-group">
                <label>Texture Color</label>
                <div className="color-input-row">
                  <div 
                    className="texture-color-preview"
                    style={{ backgroundColor: textureColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  ></div>
                  <input
                    type="text"
                    className="color-input-field"
                    value={textureColor}
                    onChange={(e) => handleTextureChange('color', e.target.value)}
                  />
                </div>
                
                {showColorPicker && (
                  <div className="sketch-picker-wrapper">
                    <SketchPicker
                      color={textureColor}
                      onChange={(color) => handleTextureChange('color', color.hex)}
                      disableAlpha
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TextureEditor; 