import React, { useState, useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { SketchPicker } from 'react-color';
import state from '../store';

const MaterialColorPicker = () => {
  const snap = useSnapshot(state);
  const [materialsList, setMaterialsList] = useState([]);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [activeDecorTab, setActiveDecorTab] = useState('color'); // 'color', 'logo', 'text', 'pattern'
  const [activeLogoId, setActiveLogoId] = useState(null);
  const [activeTextId, setActiveTextId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [colorInputValue, setColorInputValue] = useState('');
  const [gradientColor1, setGradientColor1] = useState('#3498db'); // Default blue
  const [gradientColor2, setGradientColor2] = useState('#e74c3c'); // Default red
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientType, setGradientType] = useState('linear');
  
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

  const handleMaterialChange = (materialName) => {
    setActiveMaterial(materialName);
    state.activeMaterial = materialName;
    setActiveLogoId(null);
    setActiveTextId(null);
    
    // Ensure material decorations are initialized for the selected material
    if (!snap.materialDecorations[materialName]) {
      state.initMaterialDecorations(materialName);
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
  
  const handleAddLogo = () => {
    if (activeMaterial) {
      // Ensure material decorations are initialized
      if (!snap.materialDecorations[activeMaterial]) {
        state.initMaterialDecorations(activeMaterial);
      }
      
      state.addLogoToMaterial(activeMaterial);
      
      // Use setTimeout to ensure state has updated before accessing it
      setTimeout(() => {
        const logos = snap.materialDecorations[activeMaterial]?.logos || [];
        if (logos.length > 0) {
          setActiveLogoId(logos[logos.length - 1].id);
        }
      }, 0);
    }
  };
  
  const handleAddText = () => {
    if (activeMaterial) {
      // Ensure material decorations are initialized
      if (!snap.materialDecorations[activeMaterial]) {
        state.initMaterialDecorations(activeMaterial);
      }
      
      state.addTextToMaterial(activeMaterial);
      
      // Use setTimeout to ensure state has updated before accessing it
      setTimeout(() => {
        const texts = snap.materialDecorations[activeMaterial]?.texts || [];
        if (texts.length > 0) {
          setActiveTextId(texts[texts.length - 1].id);
        }
      }, 0);
    }
  };
  
  const handleRemoveLogo = (logoId) => {
    if (activeMaterial) {
      state.removeLogoFromMaterial(activeMaterial, logoId);
      if (activeLogoId === logoId) {
        setActiveLogoId(null);
      }
    }
  };
  
  const handleRemoveText = (textId) => {
    if (activeMaterial) {
      state.removeTextFromMaterial(activeMaterial, textId);
      if (activeTextId === textId) {
        setActiveTextId(null);
      }
    }
  };
  
  const handleToggleLogo = (logoId) => {
    if (activeMaterial) {
      state.toggleLogoVisibility(activeMaterial, logoId);
    }
  };
  
  const handleToggleText = (textId) => {
    if (activeMaterial) {
      state.toggleTextVisibility(activeMaterial, textId);
    }
  };
  
  const handleLogoUpload = (e, logoId) => {
    const file = e.target.files[0];
    if (file && activeMaterial) {
      console.log(`Uploading logo for ${activeMaterial}, logo ID: ${logoId}`);
      
      // Create a URL for the file
      const logoUrl = URL.createObjectURL(file);
      setLogoFile(file);
      
      // Update the logo image in the state
      state.updateLogoImage(activeMaterial, logoId, logoUrl);
      
      console.log(`Logo image updated for ${activeMaterial}, logo ID: ${logoId}, URL: ${logoUrl}`);
    }
  };
  
  const handleTextChange = (e, textId) => {
    if (activeMaterial) {
      state.updateTextContent(activeMaterial, textId, e.target.value);
    }
  };
  
  const handleLogoPropertyChange = (logoId, property, value) => {
    if (activeMaterial) {
      state.updateLogoProperty(activeMaterial, logoId, property, value);
    }
  };
  
  const handleTextPropertyChange = (textId, property, value) => {
    if (activeMaterial) {
      state.updateTextProperty(activeMaterial, textId, property, value);
    }
  };

  // Handle material type change (solid or gradient)
  const handleMaterialTypeChange = (type) => {
    if (activeMaterial) {
      // If switching to gradient, make sure we don't copy the solid color to gradient color1
      state.setMaterialType(activeMaterial, type);
      
      // Force update the UI state based on the new type
      if (type === 'solid' && snap.materialTypes[activeMaterial]) {
        setColorInputValue(snap.materialTypes[activeMaterial].solidColor || snap.materials[activeMaterial]);
      } else if (type === 'gradient' && snap.materialTypes[activeMaterial] && snap.materialTypes[activeMaterial].gradient) {
        // Update gradient values from state
        setGradientColor1(snap.materialTypes[activeMaterial].gradient.color1);
        setGradientColor2(snap.materialTypes[activeMaterial].gradient.color2);
        setGradientAngle(snap.materialTypes[activeMaterial].gradient.angle);
        setGradientType(snap.materialTypes[activeMaterial].gradient.type);
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
    if (activeMaterial && snap.materialTypes && snap.materialTypes[activeMaterial]) {
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
    }
    return {};
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

  // Find the current active material object
  const currentMaterial = materialsList.find(m => m.name === activeMaterial) || materialsList[0];
  const materialDecor = snap.materialDecorations[activeMaterial] || { logos: [], texts: [] };
  const materialType = getCurrentMaterialType();

  // Get the appropriate color to display based on material type
  const getDisplayColor = () => {
    if (!currentMaterial) return '#ffffff';
    
    if (materialType === 'solid') {
      return currentMaterial.color;
    } else {
      // For gradient, show the stored solid color in the color preview
      return snap.materialTypes && 
             snap.materialTypes[activeMaterial] && 
             snap.materialTypes[activeMaterial].solidColor ? 
             snap.materialTypes[activeMaterial].solidColor : 
             '#ffffff';
    }
  };

  return (
    <div className="material-color-picker">
      <h2 className="section-title">Material Editor</h2>
      <p className="section-description">Select a material to customize</p>
      
      {/* Material Tabs */}
      <div className="material-tabs">
        {materialsList.map(({ name, color }) => (
          <button
            key={name}
            className={`material-tab ${activeMaterial === name ? 'active' : ''}`}
            onClick={() => handleMaterialChange(name)}
          >
            <div 
              className="material-tab-color" 
              style={{ backgroundColor: color }}
            ></div>
            <span className="material-tab-name">{name}</span>
          </button>
        ))}
      </div>
      
      {/* Material Editor Tabs */}
      <div className="decor-tabs">
        <button 
          className={`decor-tab ${activeDecorTab === 'color' ? 'active' : ''}`}
          onClick={() => setActiveDecorTab('color')}
        >
          Color
        </button>
        <button 
          className={`decor-tab ${activeDecorTab === 'logo' ? 'active' : ''}`}
          onClick={() => setActiveDecorTab('logo')}
        >
          Logos
        </button>
        <button 
          className={`decor-tab ${activeDecorTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveDecorTab('text')}
        >
          Texts
        </button>
        <button 
          className={`decor-tab ${activeDecorTab === 'pattern' ? 'active' : ''}`}
          onClick={() => setActiveDecorTab('pattern')}
        >
          Pattern
        </button>
      </div>
      
      {/* Color Editor for Active Material */}
      {currentMaterial && activeDecorTab === 'color' && (
        <div className="material-color-editor">
          <div className="material-color-header">
            <div className="material-color-info">
              <span className="material-name">{currentMaterial.name}</span>
              <span className="material-color-hex">
                {materialType === 'solid' ? currentMaterial.color : 'Gradient'}
              </span>
            </div>
            <div 
              className="material-color-preview"
              style={materialType === 'solid' 
                ? { backgroundColor: currentMaterial.color } 
                : getGradientPreviewStyle()}
            ></div>
          </div>
          
          {/* Color Type Selection */}
          <div className="color-type-selector">
            <div className="color-type-options">
              <button 
                className={`color-type-btn ${materialType === 'solid' ? 'active' : ''}`}
                onClick={() => handleMaterialTypeChange('solid')}
              >
                Solid Color
              </button>
              <button 
                className={`color-type-btn ${materialType === 'gradient' ? 'active' : ''}`}
                onClick={() => handleMaterialTypeChange('gradient')}
              >
                Gradient
              </button>
            </div>
          </div>
          
          {/* Solid Color Controls */}
          {materialType === 'solid' && (
            <>
              {/* Custom Color Input */}
              <div className="custom-color-input">
                <label htmlFor="hexInput">Custom Color (Hex/RGBA):</label>
                <div className="color-input-row">
                  <input
                    id="hexInput"
                    type="text"
                    value={colorInputValue}
                    onChange={(e) => handleQuickColorChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && activeMaterial) {
                        state.updateMaterialColor(activeMaterial, colorInputValue);
                        state.updateSolidColor(activeMaterial, colorInputValue);
                      }
                    }}
                    placeholder="#RRGGBB or rgba(r,g,b,a)"
                    className="color-input-field"
                  />
                  <button 
                    className="apply-color-btn"
                    onClick={() => {
                      if (activeMaterial) {
                        state.updateMaterialColor(activeMaterial, colorInputValue);
                        state.updateSolidColor(activeMaterial, colorInputValue);
                      }
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
              
              {/* Advanced Color Picker */}
              <div className="advanced-color-picker">
                <div className="advanced-color-picker-header">
                  <span>Advanced Color Picker</span>
                </div>
                <div className="sketch-picker-wrapper">
                  <SketchPicker 
                    color={currentMaterial.color}
                    onChange={handleColorChange}
                    disableAlpha
                    width="100%"
                    presetColors={[]}
                  />
                </div>
              </div>
            </>
          )}
          
          {/* Gradient Controls */}
          {materialType === 'gradient' && (
            <div className="gradient-controls">
              <div className="gradient-preview" style={getGradientPreviewStyle()}></div>
              
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
          )}
        </div>
      )}
      
      {/* Logo Editor for Active Material */}
      {currentMaterial && activeDecorTab === 'logo' && (
        <div className="material-logo-editor">
          <div className="add-item-container">
            <button 
              className="add-item-btn"
              onClick={handleAddLogo}
            >
              + Add New Logo
            </button>
          </div>
          
          {materialDecor.logos.length === 0 ? (
            <div className="empty-state">
              <p>No logos added yet. Click the button above to add a logo.</p>
            </div>
          ) : (
            <div className="logos-list">
              {materialDecor.logos.map((logo) => (
                <div 
                  key={logo.id} 
                  className={`logo-item ${activeLogoId === logo.id ? 'active' : ''}`}
                >
                  <div className="logo-item-header" onClick={() => setActiveLogoId(activeLogoId === logo.id ? null : logo.id)}>
                    <div className="logo-item-title">
                      <div 
                        className={`toggle-switch small ${logo.enabled ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLogo(logo.id);
                        }}
                      >
                        <div className="toggle-slider"></div>
                      </div>
                      <span>Logo {materialDecor.logos.findIndex(l => l.id === logo.id) + 1}</span>
                    </div>
                    <div className="logo-item-actions">
                      <button 
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLogo(logo.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  {activeLogoId === logo.id && (
                    <div className="logo-item-content">
                      <div className="logo-upload-container">
                        <h3 className="subsection-title">Logo Image</h3>
                        {logo.image ? (
                          <div className="logo-preview-container">
                            <img 
                              src={logo.image} 
                              alt="Logo" 
                              className="logo-preview" 
                            />
                            <button 
                              className="change-logo-btn"
                              onClick={() => document.getElementById(`logo-upload-${logo.id}`).click()}
                            >
                              Change Logo
                            </button>
                          </div>
                        ) : (
                          <div className="logo-upload">
                            <input
                              id={`logo-upload-${logo.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload(e, logo.id)}
                              className="hidden"
                            />
                            <label 
                              htmlFor={`logo-upload-${logo.id}`} 
                              className="logo-upload-label"
                            >
                              <div className="upload-icon">+</div>
                              <span>Upload Logo</span>
                            </label>
                          </div>
                        )}
                      </div>
                      
                      <div className="logo-properties">
                        <h3 className="subsection-title">Logo Properties</h3>
                        
                        <div className="property-group">
                          <label>Scale</label>
                          <input 
                            type="range" 
                            min="0.05" 
                            max="0.5" 
                            step="0.01"
                            value={logo.scale}
                            onChange={(e) => handleLogoPropertyChange(logo.id, 'scale', parseFloat(e.target.value))}
                            className="modern-slider"
                          />
                          <div className="slider-value">{logo.scale.toFixed(2)}</div>
                        </div>
                        
                        <div className="property-group">
                          <label>X Position</label>
                          <input 
                            type="range" 
                            min="-1" 
                            max="1" 
                            step="0.01"
                            value={logo.position[0]}
                            onChange={(e) => {
                              const newPos = [...logo.position];
                              newPos[0] = parseFloat(e.target.value);
                              handleLogoPropertyChange(logo.id, 'position', newPos);
                            }}
                            className="modern-slider"
                          />
                          <div className="slider-value">{logo.position[0].toFixed(2)}</div>
                        </div>
                        
                        <div className="property-group">
                          <label>Y Position</label>
                          <input 
                            type="range" 
                            min="-1" 
                            max="1" 
                            step="0.01"
                            value={logo.position[1]}
                            onChange={(e) => {
                              const newPos = [...logo.position];
                              newPos[1] = parseFloat(e.target.value);
                              handleLogoPropertyChange(logo.id, 'position', newPos);
                            }}
                            className="modern-slider"
                          />
                          <div className="slider-value">{logo.position[1].toFixed(2)}</div>
                        </div>
                        
                        <div className="property-group">
                          <label>Z Position</label>
                          <input 
                            type="range" 
                            min="-1" 
                            max="1" 
                            step="0.01"
                            value={logo.position[2]}
                            onChange={(e) => {
                              const newPos = [...logo.position];
                              newPos[2] = parseFloat(e.target.value);
                              handleLogoPropertyChange(logo.id, 'position', newPos);
                            }}
                            className="modern-slider"
                          />
                          <div className="slider-value">{logo.position[2].toFixed(2)}</div>
                        </div>
                        
                        <div className="property-group">
                          <label>Rotation</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            step="1"
                            value={logo.rotation[1] * (180/Math.PI)}
                            onChange={(e) => {
                              const newRot = [0, parseFloat(e.target.value) * (Math.PI/180), 0];
                              handleLogoPropertyChange(logo.id, 'rotation', newRot);
                            }}
                            className="modern-slider"
                          />
                          <div className="slider-value">{(logo.rotation[1] * (180/Math.PI)).toFixed(0)}°</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Text Editor for Active Material */}
      {currentMaterial && activeDecorTab === 'text' && (
        <div className="material-text-editor">
          <div className="add-item-container">
            <button 
              className="add-item-btn"
              onClick={handleAddText}
            >
              + Add New Text
            </button>
          </div>
          
          {materialDecor.texts.length === 0 ? (
            <div className="empty-state">
              <p>No texts added yet. Click the button above to add text.</p>
            </div>
          ) : (
            <div className="texts-list">
              {materialDecor.texts.map((text) => (
                <div 
                  key={text.id} 
                  className={`text-item ${activeTextId === text.id ? 'active' : ''}`}
                >
                  <div className="text-item-header" onClick={() => setActiveTextId(activeTextId === text.id ? null : text.id)}>
                    <div className="text-item-title">
                      <div 
                        className={`toggle-switch small ${text.enabled ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleText(text.id);
                        }}
                      >
                        <div className="toggle-slider"></div>
                      </div>
                      <span>{text.content.substring(0, 15)}{text.content.length > 15 ? '...' : ''}</span>
                    </div>
                    <div className="text-item-actions">
                      <button 
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveText(text.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  {activeTextId === text.id && (
                    <div className="text-item-content">
                      <div className="text-input-container">
                        <h3 className="subsection-title">Text Content</h3>
                        <input
                          type="text"
                          value={text.content}
                          onChange={(e) => handleTextChange(e, text.id)}
                          placeholder="Enter text"
                          className="text-input"
                        />
                      </div>
                      
                      <div className="text-properties">
                        <h3 className="subsection-title">Text Properties</h3>
                        
                        <div className="property-group">
                          <label>Font</label>
                          <select 
                            value={text.font}
                            onChange={(e) => handleTextPropertyChange(text.id, 'font', e.target.value)}
                            className="font-select"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                          </select>
                        </div>
                        
                        <div className="property-group">
                          <label>Size</label>
                          <input 
                            type="range" 
                            min="32" 
                            max="128" 
                            step="1"
                            value={text.size}
                            onChange={(e) => handleTextPropertyChange(text.id, 'size', parseInt(e.target.value))}
                            className="modern-slider"
                          />
                          <div className="slider-value">{text.size}px</div>
                        </div>
                        
                        <div className="property-group">
                          <label>Color</label>
                          <div className="text-color-picker">
                            <div 
                              className="text-color-preview"
                              style={{ backgroundColor: text.color }}
                            ></div>
                            <select 
                              value={text.color}
                              onChange={(e) => handleTextPropertyChange(text.id, 'color', e.target.value)}
                              className="color-select"
                            >
                              <option value="white">White</option>
                              <option value="black">Black</option>
                              <option value="red">Red</option>
                              <option value="blue">Blue</option>
                              <option value="green">Green</option>
                              <option value="yellow">Yellow</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="property-group">
                          <label>X Position</label>
                          <input 
                            type="range" 
                            min="-1" 
                            max="1" 
                            step="0.01"
                            value={text.position[0]}
                            onChange={(e) => {
                              const newPos = [...text.position];
                              newPos[0] = parseFloat(e.target.value);
                              handleTextPropertyChange(text.id, 'position', newPos);
                            }}
                            className="modern-slider"
                          />
                          <div className="slider-value">{text.position[0].toFixed(2)}</div>
                        </div>
                        
                        <div className="property-group">
                          <label>Y Position</label>
                          <input 
                            type="range" 
                            min="-1" 
                            max="1" 
                            step="0.01"
                            value={text.position[1]}
                            onChange={(e) => {
                              const newPos = [...text.position];
                              newPos[1] = parseFloat(e.target.value);
                              handleTextPropertyChange(text.id, 'position', newPos);
                            }}
                            className="modern-slider"
                          />
                          <div className="slider-value">{text.position[1].toFixed(2)}</div>
                        </div>
                        
                        <div className="property-group">
                          <label>Z Position</label>
                          <input 
                            type="range" 
                            min="-1" 
                            max="1" 
                            step="0.01"
                            value={text.position[2]}
                            onChange={(e) => {
                              const newPos = [...text.position];
                              newPos[2] = parseFloat(e.target.value);
                              handleTextPropertyChange(text.id, 'position', newPos);
                            }}
                            className="modern-slider"
                          />
                          <div className="slider-value">{text.position[2].toFixed(2)}</div>
                        </div>
                        
                        <div className="property-group">
                          <label>Rotation</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            step="1"
                            value={text.rotation[1] * (180/Math.PI)}
                            onChange={(e) => {
                              const newRot = [0, parseFloat(e.target.value) * (Math.PI/180), 0];
                              handleTextPropertyChange(text.id, 'rotation', newRot);
                            }}
                            className="modern-slider"
                          />
                          <div className="slider-value">{(text.rotation[1] * (180/Math.PI)).toFixed(0)}°</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Pattern Editor */}
      {currentMaterial && activeDecorTab === 'pattern' && (
        <div className="material-pattern-editor">
          <div className="toggle-container">
            <label className="toggle-label">Enable Pattern Overlay</label>
            <div 
              className={`toggle-switch ${snap.isPatternVisible ? 'active' : ''}`}
              onClick={() => state.togglePattern()}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          
          {snap.isPatternVisible && (
            <div className="pattern-properties">
              <h3 className="subsection-title">Pattern Properties</h3>
              
              {/* Pattern Selection */}
              <div className="property-group">
                <label>Select Pattern</label>
                <div className="pattern-grid">
                  {snap.availablePatterns.map((pattern) => (
                    <div 
                      key={pattern.file}
                      className={`pattern-item ${snap.selectedPattern === pattern.file ? 'active' : ''}`}
                      onClick={() => state.updateSelectedPattern(pattern.file)}
                    >
                      <div className="pattern-image-container">
                        <img 
                          src={`/pattern/${pattern.file}`} 
                          alt={pattern.name}
                          className="pattern-image"
                        />
                      </div>
                      <div className="pattern-name">{pattern.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="property-group">
                <label>Opacity</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.05"
                  value={snap.patternOpacity}
                  onChange={(e) => state.updatePatternOpacity(parseFloat(e.target.value))}
                  className="modern-slider"
                />
                <div className="slider-value">{snap.patternOpacity.toFixed(2)}</div>
              </div>
              
              <div className="property-group">
                <label>Scale</label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="0.5"
                  value={snap.patternScale}
                  onChange={(e) => state.updatePatternScale(parseFloat(e.target.value))}
                  className="modern-slider"
                />
                <div className="slider-value">{snap.patternScale.toFixed(1)}</div>
              </div>
              
              <div className="property-group">
                <label>Color Tint</label>
                <div className="pattern-color-preview" style={{ backgroundColor: snap.patternColor }}></div>
                <div className="pattern-color-picker">
                  <SketchPicker 
                    color={snap.patternColor}
                    onChange={(color) => {
                      console.log("Pattern color changed to:", color.hex);
                      state.updatePatternColor(color.hex);
                    }}
                    disableAlpha
                    width="100%"
                    presetColors={[
                      '#FFFFFF', '#F8F8F8', '#F0F0F0', '#E0E0E0',
                      '#C0C0C0', '#A0A0A0', '#808080', '#606060',
                      '#404040', '#202020', '#000000', '#FF0000',
                      '#00FF00', '#0000FF', '#FFFF00', '#00FFFF',
                      '#FF00FF', '#FFA500', '#800080', '#008000'
                    ]}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialColorPicker; 