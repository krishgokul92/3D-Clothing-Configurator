import React, { useState, useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { SketchPicker } from 'react-color';
import state from '../store';
import LogoEditor from './LogoEditor';
import TextEditor from './TextEditor';

const MaterialColorPicker = () => {
  const snap = useSnapshot(state);
  const [materialsList, setMaterialsList] = useState([]);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [activeDecorTab, setActiveDecorTab] = useState('color'); // 'color', 'logo', 'text', 'texture'
  const [colorInputValue, setColorInputValue] = useState('');
  const [gradientColor1, setGradientColor1] = useState('#3498db'); // Default blue
  const [gradientColor2, setGradientColor2] = useState('#e74c3c'); // Default red
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientType, setGradientType] = useState('linear');
  const [showProperties, setShowProperties] = useState(false);
  const [showTextureColorPicker, setShowTextureColorPicker] = useState(false);
  const [textureColorInput, setTextureColorInput] = useState('');
  
  // Texture gradient state
  const [showTextureGradientPicker1, setShowTextureGradientPicker1] = useState(false);
  const [showTextureGradientPicker2, setShowTextureGradientPicker2] = useState(false);
  const [textureGradientColor1, setTextureGradientColor1] = useState('#3498db');
  const [textureGradientColor2, setTextureGradientColor2] = useState('#e74c3c');
  const [textureGradientAngle, setTextureGradientAngle] = useState(45);
  const [textureGradientType, setTextureGradientType] = useState('linear');
  
  // Predefined color palette - organized by color families
  const colorPalette = {
    reds: ['#FF0000', '#E74C3C', '#C0392B', '#C70039', '#900C3F'],
    oranges: ['#FF5733', '#F39C12', '#E67E22', '#D35400', '#FFC300'],
    yellows: ['#F1C40F', '#FFEB3B', '#FFC107', '#FFD700', '#DAF7A6'],
    greens: ['#2ECC71', '#27AE60', '#1ABC9C', '#16A085', '#4CAF50'],
    blues: ['#3498DB', '#2980B9', '#0000FF', '#00BFFF', '#1E90FF'],
    purples: ['#9B59B6', '#8E44AD', '#673AB7', '#9C27B0', '#E1BEE7'],
    neutrals: ['#FFFFFF', '#EEEEEE', '#95A5A6', '#7F8C8D', '#000000'],
  };

  // Process materials when they change
  useEffect(() => {
    if (snap.materials && Object.keys(snap.materials).length > 0) {
      // Convert materials object to array for easier rendering
      const materialsArray = Object.entries(snap.materials).map(([name, color]) => ({
        name,
        color
      }));
      
      console.log("Materials for picker:", materialsArray);
      setMaterialsList(materialsArray);
      
      // Set the first material as active if none is selected
      if (!activeMaterial && materialsArray.length > 0) {
        setActiveMaterial(materialsArray[0].name);
        state.activeMaterial = materialsArray[0].name;
        
        // Initialize material decorations if not already set
        if (!snap.materialDecorations[materialsArray[0].name]) {
          state.initMaterialDecorations(materialsArray[0].name);
        }
        
        // Initialize material type if not already set
        if (!snap.materialTypes || !snap.materialTypes[materialsArray[0].name]) {
          state.initMaterialType(materialsArray[0].name);
        }
      }
    }
  }, [snap.materials]);

  // Update active material when state.activeMaterial changes
  useEffect(() => {
    if (snap.activeMaterial && snap.activeMaterial !== activeMaterial) {
      setActiveMaterial(snap.activeMaterial);
      
      // Initialize material decorations if not already set
      if (!snap.materialDecorations[snap.activeMaterial]) {
        state.initMaterialDecorations(snap.activeMaterial);
      }
    }
  }, [snap.activeMaterial]);

  // Update gradient state when active material changes or when switching to gradient mode
  useEffect(() => {
    if (activeMaterial && snap.materialTypes && snap.materialTypes[activeMaterial]) {
      const materialType = snap.materialTypes[activeMaterial];
      
      // Only update gradient values if we're in gradient mode or just switched to it
      if (materialType.type === 'gradient' && materialType.gradient) {
        setGradientColor1(materialType.gradient.color1);
        setGradientColor2(materialType.gradient.color2);
        setGradientAngle(materialType.gradient.angle);
        setGradientType(materialType.gradient.type);
      }
    }
  }, [activeMaterial, snap.materialTypes]);

  // Update colorInputValue when active material changes or when switching to solid mode
  useEffect(() => {
    if (activeMaterial) {
      if (snap.materialTypes && 
          snap.materialTypes[activeMaterial]) {
        
        // If in solid mode, use the current material color
        if (snap.materialTypes[activeMaterial].type === 'solid') {
          setColorInputValue(snap.materials[activeMaterial]);
        } else {
          // In gradient mode, use the stored solid color
          setColorInputValue(snap.materialTypes[activeMaterial].solidColor || snap.materials[activeMaterial]);
        }
      } else if (snap.materials[activeMaterial]) {
        // Fallback to material color if material types not initialized
        setColorInputValue(snap.materials[activeMaterial]);
      }
    }
  }, [activeMaterial, snap.materials, snap.materialTypes]);

  // Update textureColorInput and texture gradient values when active material changes
  useEffect(() => {
    if (activeMaterial && snap.materialTextures && snap.materialTextures[activeMaterial]) {
      const textureSetting = snap.materialTextures[activeMaterial];
      
      // Update solid color
      setTextureColorInput(textureSetting.color || '#ffffff');
      
      // Update gradient values if they exist
      if (textureSetting.gradient) {
        setTextureGradientColor1(textureSetting.gradient.color1 || '#3498db');
        setTextureGradientColor2(textureSetting.gradient.color2 || '#e74c3c');
        setTextureGradientAngle(textureSetting.gradient.angle || 45);
        setTextureGradientType(textureSetting.gradient.type || 'linear');
      }
      
      // Log the current state for debugging
      console.log(`Texture settings updated for ${activeMaterial}:`, {
        colorType: textureSetting.colorType,
        color: textureSetting.color,
        gradient: textureSetting.gradient
      });
    }
  }, [activeMaterial, snap.materialTextures, snap.materialTextures?.[activeMaterial]?.colorType]);

  // Ensure texture rotation is properly initialized
  useEffect(() => {
    if (activeMaterial && snap.materialTextures && snap.materialTextures[activeMaterial]) {
      // Make sure rotation is initialized
      if (snap.materialTextures[activeMaterial].rotation === undefined) {
        state.updateTextureRotation(activeMaterial, 0);
      }
    }
  }, [activeMaterial, snap.materialTextures]);

  const handleMaterialChange = (materialName) => {
    setActiveMaterial(materialName);
    state.activeMaterial = materialName;
    setShowProperties(true);
    
    // Ensure material decorations are initialized for the selected material
    if (!snap.materialDecorations[materialName]) {
      state.initMaterialDecorations(materialName);
    }
    
    // Ensure material texture settings are initialized
    if (!snap.materialTextures || !snap.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // Update local state with texture settings
    if (snap.materialTextures && snap.materialTextures[materialName]) {
      const textureSetting = snap.materialTextures[materialName];
      
      // Update solid color
      setTextureColorInput(textureSetting.color || '#ffffff');
      
      // Update gradient values if they exist
      if (textureSetting.gradient) {
        setTextureGradientColor1(textureSetting.gradient.color1 || '#3498db');
        setTextureGradientColor2(textureSetting.gradient.color2 || '#e74c3c');
        setTextureGradientAngle(textureSetting.gradient.angle || 45);
        setTextureGradientType(textureSetting.gradient.type || 'linear');
      }
    }
  };

  const handleColorChange = (color) => {
    if (activeMaterial) {
      console.log(`Changing color for ${activeMaterial} to:`, color.hex);
      state.updateMaterialColor(activeMaterial, color.hex);
      state.updateSolidColor(activeMaterial, color.hex);
      setColorInputValue(color.hex);
    }
  };

  const handleQuickColorChange = (colorValue) => {
    if (activeMaterial) {
      // Always update the input value
      setColorInputValue(colorValue);
      
      // Try to apply the color if it seems valid
      // Basic validation for hex format
      const hexRegex = /^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
      
      // Basic validation for rgb/rgba format
      const rgbRegex = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*(?:0?\.\d+|1|0))?\s*\)$/;
      
      // If it's a valid color format, update the material
      if (hexRegex.test(colorValue) || rgbRegex.test(colorValue)) {
        // Add # prefix if it's a hex color without it
        if (hexRegex.test(colorValue) && !colorValue.startsWith('#')) {
          colorValue = '#' + colorValue;
        }
        
        console.log(`Changing color for ${activeMaterial} to:`, colorValue);
        state.updateMaterialColor(activeMaterial, colorValue);
        state.updateSolidColor(activeMaterial, colorValue);
      }
    }
  };

  // Handle material type change (solid or gradient)
  const handleMaterialTypeChange = (type) => {
    if (activeMaterial) {
      console.log(`Changing material type for ${activeMaterial} to ${type}`);
      
      // Save current state before switching
      if (type === 'gradient' && snap.materialTypes[activeMaterial]?.type === 'solid') {
        // When switching to gradient, make sure we save the current solid color
        const currentColor = snap.materials[activeMaterial];
        console.log(`Saving current solid color before switching to gradient: ${currentColor}`);
      }
      
      // Apply the material type change
      state.setMaterialType(activeMaterial, type);
      
      // Force update the UI state based on the new type
      if (type === 'solid') {
        // When switching to solid, use the stored solid color
        const solidColor = snap.materialTypes[activeMaterial]?.solidColor || snap.materials[activeMaterial];
        console.log(`Setting UI to solid color: ${solidColor}`);
        setColorInputValue(solidColor);
      } else if (type === 'gradient' && snap.materialTypes[activeMaterial]?.gradient) {
        // When switching to gradient, update UI with gradient values
        const gradient = snap.materialTypes[activeMaterial].gradient;
        console.log(`Setting UI to gradient: ${gradient.color1}, ${gradient.color2}`);
        setGradientColor1(gradient.color1);
        setGradientColor2(gradient.color2);
        setGradientAngle(gradient.angle);
        setGradientType(gradient.type);
      }
    }
  };

  // Handle gradient property change
  const handleGradientChange = (property, value) => {
    if (activeMaterial) {
      state.updateGradient(activeMaterial, property, value);
      
      // Update local state
      switch (property) {
        case 'color1':
          setGradientColor1(value);
          break;
        case 'color2':
          setGradientColor2(value);
          break;
        case 'angle':
          setGradientAngle(value);
          break;
        case 'type':
          setGradientType(value);
          break;
        default:
          break;
      }
    }
  };

  // Get current material type
  const getCurrentMaterialType = () => {
    if (activeMaterial && snap.materialTypes && snap.materialTypes[activeMaterial]) {
      return snap.materialTypes[activeMaterial].type;
    }
    return 'solid';
  };

  // Generate gradient preview style
  const getGradientPreviewStyle = () => {
    if (!activeMaterial || !snap.materialTypes[activeMaterial] || !snap.materialTypes[activeMaterial].gradient) {
      return { background: '#ffffff' };
    }
    
    const { gradient } = snap.materialTypes[activeMaterial];
    if (gradient.type === 'linear') {
      return {
        background: `linear-gradient(${gradient.angle}deg, ${gradient.color1}, ${gradient.color2})`
      };
    } else {
      return {
        background: `radial-gradient(circle, ${gradient.color1}, ${gradient.color2})`
      };
    }
  };

  // Get display color for the current material
  const getDisplayColor = () => {
    if (!activeMaterial) return '#ffffff';
    
    const materialType = getCurrentMaterialType();
    const currentMaterial = snap.materials[activeMaterial];
    
    if (materialType === 'solid') {
      return currentMaterial || '#ffffff';
    } else {
      // For gradient, show the stored solid color in the color preview
      return snap.materialTypes[activeMaterial]?.solidColor || '#ffffff';
    }
  };

  // Get current material
  const currentMaterial = activeMaterial ? {
    name: activeMaterial,
    color: snap.materials[activeMaterial] || '#ffffff'
  } : null;

  // Get material type
  const materialType = getCurrentMaterialType();

  // Function to handle texture color change from input field
  const handleTextureColorInputChange = (e) => {
    setTextureColorInput(e.target.value);
  };

  // Function to handle texture color change from color picker
  const handleTextureColorPickerChange = (color) => {
    setTextureColorInput(color.hex);
  };

  // Function to handle texture color change from SketchPicker
  const handleTextureColorChange = (color) => {
    setTextureColorInput(color.hex);
    if (activeMaterial) {
      state.updateTextureColor(activeMaterial, color.hex);
    }
  };

  // Function to apply the texture color
  const applyTextureColor = () => {
    if (activeMaterial && textureColorInput) {
      state.updateTextureColor(activeMaterial, textureColorInput);
    }
  };

  // Handle texture gradient color changes
  const handleTextureGradientColor1Change = (color) => {
    setTextureGradientColor1(color.hex);
    if (activeMaterial) {
      state.updateTextureGradient(activeMaterial, 'color1', color.hex);
    }
  };

  const handleTextureGradientColor2Change = (color) => {
    setTextureGradientColor2(color.hex);
    if (activeMaterial) {
      state.updateTextureGradient(activeMaterial, 'color2', color.hex);
    }
  };

  const handleTextureGradientAngleChange = (e) => {
    const angle = parseInt(e.target.value);
    setTextureGradientAngle(angle);
    if (activeMaterial) {
      state.updateTextureGradient(activeMaterial, 'angle', angle);
    }
  };

  const handleTextureGradientTypeChange = (type) => {
    setTextureGradientType(type);
    if (activeMaterial) {
      state.updateTextureGradient(activeMaterial, 'type', type);
    }
  };

  // Toggle texture color type between solid and gradient
  const toggleTextureColorType = () => {
    if (activeMaterial && snap.materialTextures && snap.materialTextures[activeMaterial]) {
      const currentType = snap.materialTextures[activeMaterial].colorType || 'solid';
      const newType = currentType === 'solid' ? 'gradient' : 'solid';
      state.setTextureColorType(activeMaterial, newType);
    }
  };

  // If no materials are loaded yet, show a loading message
  if (materialsList.length === 0) {
    return (
      <div className="material-color-picker">
        <div className="loading-materials">
          <div className="loading-spinner"></div>
          <p>Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="material-editor">
      {/* Sidebar Navigation */}
      <div className="editor-sidebar">
        <div className="editor-logo">
        </div>
        
        <div className="editor-nav">
          <button 
            className={`nav-item ${activeDecorTab === 'color' ? 'active' : ''}`}
            onClick={() => {
              setActiveDecorTab('color');
              setShowProperties(false);
            }}
          >
            <span className="nav-icon">🎨</span>
            <span className="nav-label">Color</span>
          </button>
          
          <button 
            className={`nav-item ${activeDecorTab === 'logo' ? 'active' : ''}`}
            onClick={() => {
              setActiveDecorTab('logo');
              setShowProperties(false);
            }}
          >
            <span className="nav-icon">🖼️</span>
            <span className="nav-label">Logo</span>
          </button>
          
          <button 
            className={`nav-item ${activeDecorTab === 'text' ? 'active' : ''}`}
            onClick={() => {
              setActiveDecorTab('text');
              setShowProperties(false);
            }}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-label">Text</span>
          </button>
          
          <button 
            className={`nav-item ${activeDecorTab === 'texture' ? 'active' : ''}`}
            onClick={() => {
              setActiveDecorTab('texture');
              setShowProperties(false);
            }}
          >
            <span className="nav-icon">🧶</span>
            <span className="nav-label">Texture</span>
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="editor-content">
        <div className="editor-layout">
          {/* Materials List */}
          <div className={`materials-list-container ${showProperties ? 'shift' : ''}`}>
            <h3>Materials</h3>
            <div className="materials-list">
              {materialsList.map((material) => (
                <div
                  key={material.name}
                  className={`material-item ${material.name === activeMaterial ? 'active' : ''}`}
                  onClick={() => handleMaterialChange(material.name)}
                >
                  <div 
                    className="material-color" 
                    style={{ backgroundColor: material.color }}
                  ></div>
                  <span className="material-name">{material.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Properties Panel - slides in when a material is selected */}
          <div className={`properties-panel ${showProperties ? 'show' : ''}`}>
            {showProperties && activeMaterial && (
              <>
                <div className="properties-header">
                  <h3>{activeMaterial} Properties</h3>
                  <button 
                    className="back-button"
                    onClick={() => {
                      setShowProperties(false);
                      // Keep the active material selected
                    }}
                  >
                    ← Back
                  </button>
                </div>
                
                {/* Tab Content */}
                <div className="tab-content">
                  {/* Color Editor */}
                  {activeDecorTab === 'color' && currentMaterial && (
                    <div className="color-editor">
                      <div className="editor-header">
                        <h3>Color Settings</h3>
                        <div className="color-type-selector">
                          <button 
                            className={`color-type-btn ${materialType === 'solid' ? 'active' : ''}`}
                            onClick={() => handleMaterialTypeChange('solid')}
                          >
                            Solid
                          </button>
                          <button 
                            className={`color-type-btn ${materialType === 'gradient' ? 'active' : ''}`}
                            onClick={() => handleMaterialTypeChange('gradient')}
                          >
                            Gradient
                          </button>
                        </div>
                      </div>
                      
                      {/* Solid Color Editor */}
                      {materialType === 'solid' && (
                        <div className="solid-color-editor">
                          <div className="color-preview" style={{ backgroundColor: getDisplayColor() }}></div>
                          
                          <div className="color-palette-container">
                            <h4>Color Palette</h4>
                            <div className="color-palette">
                              {Object.entries(colorPalette).map(([family, colors]) => (
                                <div key={family} className="color-family">
                                  {colors.map((color) => (
                                    <div
                                      key={color}
                                      className="color-swatch"
                                      style={{ backgroundColor: color }}
                                      onClick={() => handleQuickColorChange(color)}
                                    ></div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="custom-color-input">
                            <h4>Custom Color</h4>
                            <div className="color-input-row">
                              <input
                                type="text"
                                value={colorInputValue}
                                onChange={(e) => setColorInputValue(e.target.value)}
                                placeholder="Enter hex color (#RRGGBB)"
                                className="color-input-field"
                              />
                              <button 
                                className="apply-color-btn"
                                onClick={() => handleColorChange({hex: colorInputValue})}
                              >
                                Apply
                              </button>
                            </div>
                            
                            <div className="sketch-picker-wrapper">
                              <SketchPicker 
                                color={getDisplayColor()}
                                onChange={(color) => handleColorChange(color)}
                                disableAlpha
                                width="100%"
                                presetColors={[]}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Gradient Editor */}
                      {materialType === 'gradient' && (
                        <div className="gradient-editor">
                          <div className="gradient-preview" style={getGradientPreviewStyle()}></div>
                          
                          <div className="gradient-controls">
                            <div className="gradient-type-selector">
                              <label>Gradient Type:</label>
                              <div className="gradient-type-options">
                                <button 
                                  className={`gradient-type-btn ${gradientType === 'linear' ? 'active' : ''}`}
                                  onClick={() => handleGradientChange('type', 'linear')}
                                >
                                  Linear
                                </button>
                                <button 
                                  className={`gradient-type-btn ${gradientType === 'radial' ? 'active' : ''}`}
                                  onClick={() => handleGradientChange('type', 'radial')}
                                >
                                  Radial
                                </button>
                              </div>
                            </div>
                            
                            {gradientType === 'linear' && (
                              <div className="gradient-angle-control">
                                <label htmlFor="angleSlider">Angle: {gradientAngle}°</label>
                                <input
                                  id="angleSlider"
                                  type="range"
                                  min="0"
                                  max="360"
                                  value={gradientAngle}
                                  onChange={(e) => handleGradientChange('angle', parseInt(e.target.value))}
                                  className="modern-slider"
                                />
                              </div>
                            )}
                            
                            <div className="gradient-color-controls">
                              <div className="gradient-color-control">
                                <label>Color 1:</label>
                                <div className="color-input-row">
                                  <div 
                                    className="gradient-color-preview" 
                                    style={{ backgroundColor: gradientColor1 }}
                                  ></div>
                                  <input
                                    type="text"
                                    value={gradientColor1}
                                    onChange={(e) => handleGradientChange('color1', e.target.value)}
                                    className="color-input-field"
                                  />
                                </div>
                                <div className="sketch-picker-wrapper">
                                  <SketchPicker 
                                    color={gradientColor1}
                                    onChange={(color) => handleGradientChange('color1', color.hex)}
                                    disableAlpha
                                    width="100%"
                                    presetColors={[]}
                                  />
                                </div>
                              </div>
                              
                              <div className="gradient-color-control">
                                <label>Color 2:</label>
                                <div className="color-input-row">
                                  <div 
                                    className="gradient-color-preview" 
                                    style={{ backgroundColor: gradientColor2 }}
                                  ></div>
                                  <input
                                    type="text"
                                    value={gradientColor2}
                                    onChange={(e) => handleGradientChange('color2', e.target.value)}
                                    className="color-input-field"
                                  />
                                </div>
                                <div className="sketch-picker-wrapper">
                                  <SketchPicker 
                                    color={gradientColor2}
                                    onChange={(color) => handleGradientChange('color2', color.hex)}
                                    disableAlpha
                                    width="100%"
                                    presetColors={[]}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Logo Editor */}
                  {activeDecorTab === 'logo' && (
                    <LogoEditor />
                  )}
                  
                  {/* Text Editor */}
                  {activeDecorTab === 'text' && (
                    <TextEditor />
                  )}
                  
                  {/* Texture Editor */}
                  {activeDecorTab === 'texture' && (
                    <div className="texture-editor">
                      <div className="editor-header">
                        <h3>Texture Settings</h3>
                      </div>
                      
                      {/* Texture Toggle */}
                      <div className="toggle-container">
                        <span className="toggle-label">Enable Texture</span>
                        <div 
                          className={`toggle-switch ${snap.materialTextures[activeMaterial]?.visible ? 'active' : ''}`}
                          onClick={() => state.toggleMaterialTexture(activeMaterial)}
                        >
                          <div className="toggle-slider"></div>
                        </div>
                      </div>
                      
                      {/* Texture Properties */}
                      {snap.materialTextures[activeMaterial]?.visible && (
                        <div className="texture-properties">
                          {/* Texture Selection */}
                          <h4>Select Texture</h4>
                          <div className="texture-grid">
                            {snap.availableTextures.map((texture) => (
                              <div 
                                key={texture.file}
                                className={`texture-item ${snap.materialTextures[activeMaterial]?.texture === texture.file ? 'active' : ''}`}
                                onClick={() => state.updateMaterialTexture(activeMaterial, texture.file)}
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
                          
                          {/* Texture Scale */}
                          <div className="property-group">
                            <label>Scale: {snap.materialTextures[activeMaterial]?.scale.toFixed(1)}</label>
                            <input
                              type="range"
                              min="0.1"
                              max="5"
                              step="0.1"
                              value={snap.materialTextures[activeMaterial]?.scale || 1}
                              onChange={(e) => state.updateTextureScale(activeMaterial, parseFloat(e.target.value))}
                              className="modern-slider"
                            />
                          </div>
                          
                          {/* Texture Opacity */}
                          <div className="property-group">
                            <label>Opacity: {(snap.materialTextures[activeMaterial]?.opacity * 100).toFixed(0)}%</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={snap.materialTextures[activeMaterial]?.opacity || 0.8}
                              onChange={(e) => state.updateTextureOpacity(activeMaterial, parseFloat(e.target.value))}
                              className="modern-slider"
                            />
                          </div>
                          
                          {/* Texture Rotation */}
                          <div className="property-group">
                            <label>Rotation: {snap.materialTextures[activeMaterial]?.rotation || 0}°</label>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              step="1"
                              value={snap.materialTextures[activeMaterial]?.rotation || 0}
                              onChange={(e) => state.updateTextureRotation(activeMaterial, parseInt(e.target.value))}
                              className="modern-slider"
                            />
                          </div>
                          
                          {/* Texture Roughness */}
                          <div className="property-group">
                            <label>Roughness: {(snap.materialTextures[activeMaterial]?.roughness || 0.5).toFixed(2)}</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={snap.materialTextures[activeMaterial]?.roughness || 0.5}
                              onChange={(e) => state.updateTextureRoughness(activeMaterial, parseFloat(e.target.value))}
                              className="modern-slider"
                            />
                            <div className="property-description">
                              Controls how rough or smooth the texture appears. Lower values create a smoother, more reflective surface.
                            </div>
                          </div>
                          
                          {/* Texture Metalness */}
                          <div className="property-group">
                            <label>Metalness: {(snap.materialTextures[activeMaterial]?.metalness || 0).toFixed(2)}</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={snap.materialTextures[activeMaterial]?.metalness || 0}
                              onChange={(e) => state.updateTextureMetalness(activeMaterial, parseFloat(e.target.value))}
                              className="modern-slider"
                            />
                            <div className="property-description">
                              Controls how metallic the texture appears. Higher values create a more metallic look.
                            </div>
                          </div>
                          
                          {/* Texture Color Tint */}
                          <div className="property-group">
                            <label>
                              Color Tint
                              {((textureColorInput && textureColorInput.toLowerCase() !== '#ffffff') || 
                                (snap.materialTextures[activeMaterial]?.colorType === 'gradient')) && (
                                <span className="color-active-indicator">• Active</span>
                              )}
                            </label>
                            
                            {/* Color Type Toggle */}
                            <div className="color-type-toggle">
                              <button 
                                className={`type-btn ${snap.materialTextures[activeMaterial]?.colorType !== 'gradient' ? 'active' : ''}`}
                                onClick={() => {
                                  state.setTextureColorType(activeMaterial, 'solid');
                                }}
                              >
                                Solid
                              </button>
                              <button 
                                className={`type-btn ${snap.materialTextures[activeMaterial]?.colorType === 'gradient' ? 'active' : ''}`}
                                onClick={() => {
                                  state.setTextureColorType(activeMaterial, 'gradient');
                                }}
                              >
                                Gradient
                              </button>
                            </div>
                            
                            {/* Solid Color Controls */}
                            {(!snap.materialTextures[activeMaterial]?.colorType || 
                              snap.materialTextures[activeMaterial]?.colorType === 'solid') && (
                              <div className="texture-color-control">
                                <div 
                                  className="texture-color-preview"
                                  style={{ backgroundColor: textureColorInput || '#ffffff' }}
                                  onClick={() => setShowTextureColorPicker(!showTextureColorPicker)}
                                ></div>
                                <input
                                  type="text"
                                  value={textureColorInput}
                                  onChange={(e) => handleTextureColorInputChange(e)}
                                  className="color-input-field"
                                />
                                <button 
                                  className="apply-color-btn"
                                  onClick={applyTextureColor}
                                >
                                  Apply
                                </button>
                                
                                {showTextureColorPicker && (
                                  <div className="color-picker-popover">
                                    <div 
                                      className="color-picker-cover" 
                                      onClick={() => setShowTextureColorPicker(false)}
                                    />
                                    <div className="sketch-picker-wrapper">
                                      <SketchPicker 
                                        color={textureColorInput}
                                        onChange={handleTextureColorChange}
                                        disableAlpha
                                        presetColors={[
                                          '#FFFFFF', '#F8F8F8', '#F0F0F0', '#E0E0E0',
                                          '#C0C0C0', '#A0A0A0', '#808080', '#606060',
                                          '#404040', '#202020', '#000000', '#FF0000',
                                          '#00FF00', '#0000FF', '#FFFF00', '#00FFFF',
                                          '#FF00FF', '#FFA500', '#800080', '#008000'
                                        ]}
                                      />
                                      <div className="color-picker-actions">
                                        <button 
                                          className="color-picker-apply-btn"
                                          onClick={() => {
                                            applyTextureColor();
                                            setShowTextureColorPicker(false);
                                          }}
                                        >
                                          Apply
                                        </button>
                                        <button 
                                          className="color-picker-reset-btn"
                                          onClick={() => {
                                            setTextureColorInput('#ffffff');
                                            state.updateTextureColor(activeMaterial, '#ffffff');
                                            setShowTextureColorPicker(false);
                                          }}
                                        >
                                          Reset
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Gradient Color Controls */}
                            {snap.materialTextures[activeMaterial]?.colorType === 'gradient' && (
                              <div className="gradient-controls">
                                <div className="gradient-preview" 
                                  style={{
                                    background: textureGradientType === 'linear' 
                                      ? `linear-gradient(${textureGradientAngle}deg, ${textureGradientColor1}, ${textureGradientColor2})`
                                      : `radial-gradient(circle, ${textureGradientColor1}, ${textureGradientColor2})`
                                  }}
                                ></div>
                                
                                <div className="gradient-type-toggle">
                                  <button 
                                    className={`type-btn ${textureGradientType === 'linear' ? 'active' : ''}`}
                                    onClick={() => handleTextureGradientTypeChange('linear')}
                                  >
                                    Linear
                                  </button>
                                  <button 
                                    className={`type-btn ${textureGradientType === 'radial' ? 'active' : ''}`}
                                    onClick={() => handleTextureGradientTypeChange('radial')}
                                  >
                                    Radial
                                  </button>
                                </div>
                                
                                {textureGradientType === 'linear' && (
                                  <div className="property-group">
                                    <label>Angle: {textureGradientAngle}°</label>
                                    <input
                                      type="range"
                                      min="0"
                                      max="360"
                                      step="1"
                                      value={textureGradientAngle}
                                      onChange={handleTextureGradientAngleChange}
                                      className="modern-slider"
                                    />
                                  </div>
                                )}
                                
                                <div className="gradient-color-controls">
                                  <div className="gradient-color-item">
                                    <div 
                                      className="gradient-color-preview"
                                      style={{ backgroundColor: textureGradientColor1 }}
                                      onClick={() => setShowTextureGradientPicker1(!showTextureGradientPicker1)}
                                    ></div>
                                    <span>Color 1</span>
                                    {showTextureGradientPicker1 && (
                                      <div className="color-picker-popover gradient-picker-popover">
                                        <div 
                                          className="color-picker-cover" 
                                          onClick={() => setShowTextureGradientPicker1(false)}
                                        />
                                        <div className="sketch-picker-wrapper">
                                          <SketchPicker 
                                            color={textureGradientColor1}
                                            onChange={handleTextureGradientColor1Change}
                                            disableAlpha
                                            presetColors={[
                                              '#FFFFFF', '#F8F8F8', '#F0F0F0', '#E0E0E0',
                                              '#C0C0C0', '#A0A0A0', '#808080', '#606060',
                                              '#404040', '#202020', '#000000', '#FF0000',
                                              '#00FF00', '#0000FF', '#FFFF00', '#00FFFF',
                                              '#FF00FF', '#FFA500', '#800080', '#008000'
                                            ]}
                                          />
                                          <div className="color-picker-actions">
                                            <button 
                                              className="color-picker-apply-btn"
                                              onClick={() => setShowTextureGradientPicker1(false)}
                                            >
                                              Apply
                                            </button>
                                            <button 
                                              className="color-picker-reset-btn"
                                              onClick={() => {
                                                setTextureGradientColor1('#3498db');
                                                state.updateTextureGradient(activeMaterial, 'color1', '#3498db');
                                                setShowTextureGradientPicker1(false);
                                              }}
                                            >
                                              Reset
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="gradient-color-item">
                                    <div 
                                      className="gradient-color-preview"
                                      style={{ backgroundColor: textureGradientColor2 }}
                                      onClick={() => setShowTextureGradientPicker2(!showTextureGradientPicker2)}
                                    ></div>
                                    <span>Color 2</span>
                                    {showTextureGradientPicker2 && (
                                      <div className="color-picker-popover gradient-picker-popover">
                                        <div 
                                          className="color-picker-cover" 
                                          onClick={() => setShowTextureGradientPicker2(false)}
                                        />
                                        <div className="sketch-picker-wrapper">
                                          <SketchPicker 
                                            color={textureGradientColor2}
                                            onChange={handleTextureGradientColor2Change}
                                            disableAlpha
                                            presetColors={[
                                              '#FFFFFF', '#F8F8F8', '#F0F0F0', '#E0E0E0',
                                              '#C0C0C0', '#A0A0A0', '#808080', '#606060',
                                              '#404040', '#202020', '#000000', '#FF0000',
                                              '#00FF00', '#0000FF', '#FFFF00', '#00FFFF',
                                              '#FF00FF', '#FFA500', '#800080', '#008000'
                                            ]}
                                          />
                                          <div className="color-picker-actions">
                                            <button 
                                              className="color-picker-apply-btn"
                                              onClick={() => setShowTextureGradientPicker2(false)}
                                            >
                                              Apply
                                            </button>
                                            <button 
                                              className="color-picker-reset-btn"
                                              onClick={() => {
                                                setTextureGradientColor2('#e74c3c');
                                                state.updateTextureGradient(activeMaterial, 'color2', '#e74c3c');
                                                setShowTextureGradientPicker2(false);
                                              }}
                                            >
                                              Reset
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialColorPicker; 