import React, { useState, useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { SketchPicker } from 'react-color';
import state from '../store';

const MaterialColorPicker = () => {
  const snap = useSnapshot(state);
  const [materialsList, setMaterialsList] = useState([]);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [activeDecorTab, setActiveDecorTab] = useState('color'); // 'color', 'logo', 'text', 'texture'
  const [activeLogoId, setActiveLogoId] = useState(null);
  const [activeTextId, setActiveTextId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [colorInputValue, setColorInputValue] = useState('');
  const [gradientColor1, setGradientColor1] = useState('#3498db'); // Default blue
  const [gradientColor2, setGradientColor2] = useState('#e74c3c'); // Default red
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientType, setGradientType] = useState('linear');
  const [showProperties, setShowProperties] = useState(false);
  
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
    setShowProperties(true);
    
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
                    <div className="logo-editor">
                      <div className="editor-header">
                        <h3>Logo Settings</h3>
                      </div>
                      
                      {/* Add Logo Button */}
                      <div className="add-item-container">
                        <button 
                          className="add-item-btn"
                          onClick={handleAddLogo}
                        >
                          + Add Logo
                        </button>
                      </div>
                      
                      {/* Logos List */}
                      {snap.materialDecorations[activeMaterial]?.logos?.length > 0 ? (
                        <div className="logos-list">
                          {snap.materialDecorations[activeMaterial].logos.map((logo) => (
                            <div 
                              key={logo.id}
                              className={`logo-item ${logo.id === activeLogoId ? 'active' : ''}`}
                              onClick={() => setActiveLogoId(logo.id)}
                            >
                              <div className="logo-item-header">
                                <div className="logo-item-title">Logo {logo.id.slice(0, 4)}</div>
                                <div className="logo-item-actions">
                                  <div 
                                    className={`toggle-switch small ${logo.visible ? 'active' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleLogo(logo.id);
                                    }}
                                  >
                                    <div className="toggle-slider"></div>
                                  </div>
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
                              
                              {logo.id === activeLogoId && (
                                <div className="logo-item-content">
                                  <div className="logo-upload-container">
                                    {logo.image ? (
                                      <div className="logo-preview-container">
                                        <img 
                                          src={logo.image} 
                                          alt="Logo Preview" 
                                          className="logo-preview"
                                        />
                                        <label 
                                          htmlFor={`logo-upload-${logo.id}`}
                                          className="change-logo-btn"
                                        >
                                          Change Logo
                                        </label>
                                      </div>
                                    ) : (
                                      <label 
                                        htmlFor={`logo-upload-${logo.id}`}
                                        className="logo-upload"
                                      >
                                        <div className="upload-icon">+</div>
                                        <span className="logo-upload-label">Upload Logo</span>
                                      </label>
                                    )}
                                    <input
                                      id={`logo-upload-${logo.id}`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleLogoUpload(e, logo.id)}
                                      className="hidden"
                                    />
                                  </div>
                                  
                                  <div className="logo-properties">
                                    <div className="property-group">
                                      <label>Scale: {logo.scale.toFixed(1)}</label>
                                      <input
                                        type="range"
                                        min="0.1"
                                        max="2"
                                        step="0.1"
                                        value={logo.scale}
                                        onChange={(e) => handleLogoPropertyChange(logo.id, 'scale', parseFloat(e.target.value))}
                                        className="modern-slider"
                                      />
                                    </div>
                                    
                                    <div className="property-group">
                                      <label>Position X: {logo.position.x.toFixed(1)}</label>
                                      <input
                                        type="range"
                                        min="-1"
                                        max="1"
                                        step="0.1"
                                        value={logo.position.x}
                                        onChange={(e) => handleLogoPropertyChange(logo.id, 'positionX', parseFloat(e.target.value))}
                                        className="modern-slider"
                                      />
                                    </div>
                                    
                                    <div className="property-group">
                                      <label>Position Y: {logo.position.y.toFixed(1)}</label>
                                      <input
                                        type="range"
                                        min="-1"
                                        max="1"
                                        step="0.1"
                                        value={logo.position.y}
                                        onChange={(e) => handleLogoPropertyChange(logo.id, 'positionY', parseFloat(e.target.value))}
                                        className="modern-slider"
                                      />
                                    </div>
                                    
                                    <div className="property-group">
                                      <label>Rotation: {logo.rotation}°</label>
                                      <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        step="1"
                                        value={logo.rotation}
                                        onChange={(e) => handleLogoPropertyChange(logo.id, 'rotation', parseInt(e.target.value))}
                                        className="modern-slider"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <p>No logos added yet. Click the button above to add a logo.</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Text Editor */}
                  {activeDecorTab === 'text' && (
                    <div className="text-editor">
                      <div className="editor-header">
                        <h3>Text Settings</h3>
                      </div>
                      
                      {/* Add Text Button */}
                      <div className="add-item-container">
                        <button 
                          className="add-item-btn"
                          onClick={handleAddText}
                        >
                          + Add Text
                        </button>
                      </div>
                      
                      {/* Texts List */}
                      {snap.materialDecorations[activeMaterial]?.texts?.length > 0 ? (
                        <div className="texts-list">
                          {snap.materialDecorations[activeMaterial].texts.map((text) => (
                            <div 
                              key={text.id}
                              className={`text-item ${text.id === activeTextId ? 'active' : ''}`}
                              onClick={() => setActiveTextId(text.id)}
                            >
                              <div className="text-item-header">
                                <div className="text-item-title">
                                  {text.content ? 
                                    (text.content.length > 15 ? 
                                      text.content.substring(0, 15) + '...' : 
                                      text.content) : 
                                    `Text ${text.id.slice(0, 4)}`}
                                </div>
                                <div className="text-item-actions">
                                  <div 
                                    className={`toggle-switch small ${text.visible ? 'active' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleText(text.id);
                                    }}
                                  >
                                    <div className="toggle-slider"></div>
                                  </div>
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
                              
                              {text.id === activeTextId && (
                                <div className="text-item-content">
                                  <div className="text-input-container">
                                    <label>Text Content</label>
                                    <input
                                      type="text"
                                      value={text.content}
                                      onChange={(e) => handleTextChange(e, text.id)}
                                      placeholder="Enter text"
                                      className="text-input"
                                    />
                                  </div>
                                  
                                  <div className="text-properties">
                                    <div className="property-group">
                                      <label>Font</label>
                                      <select
                                        value={text.font}
                                        onChange={(e) => handleTextPropertyChange(text.id, 'font', e.target.value)}
                                        className="font-select"
                                      >
                                        <option value="Arial">Arial</option>
                                        <option value="Verdana">Verdana</option>
                                        <option value="Helvetica">Helvetica</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Courier New">Courier New</option>
                                      </select>
                                    </div>
                                    
                                    <div className="property-group">
                                      <label>Size: {text.size}</label>
                                      <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="1"
                                        value={text.size}
                                        onChange={(e) => handleTextPropertyChange(text.id, 'size', parseInt(e.target.value))}
                                        className="modern-slider"
                                      />
                                    </div>
                                    
                                    <div className="property-group">
                                      <label>Color</label>
                                      <div className="text-color-picker">
                                        <div 
                                          className="text-color-preview"
                                          style={{ backgroundColor: text.color }}
                                        ></div>
                                        <input
                                          type="text"
                                          value={text.color}
                                          onChange={(e) => handleTextPropertyChange(text.id, 'color', e.target.value)}
                                          className="color-input-field"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="property-group">
                                      <label>Position X: {text.position.x.toFixed(1)}</label>
                                      <input
                                        type="range"
                                        min="-1"
                                        max="1"
                                        step="0.1"
                                        value={text.position.x}
                                        onChange={(e) => handleTextPropertyChange(text.id, 'positionX', parseFloat(e.target.value))}
                                        className="modern-slider"
                                      />
                                    </div>
                                    
                                    <div className="property-group">
                                      <label>Position Y: {text.position.y.toFixed(1)}</label>
                                      <input
                                        type="range"
                                        min="-1"
                                        max="1"
                                        step="0.1"
                                        value={text.position.y}
                                        onChange={(e) => handleTextPropertyChange(text.id, 'positionY', parseFloat(e.target.value))}
                                        className="modern-slider"
                                      />
                                    </div>
                                    
                                    <div className="property-group">
                                      <label>Rotation: {text.rotation}°</label>
                                      <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        step="1"
                                        value={text.rotation}
                                        onChange={(e) => handleTextPropertyChange(text.id, 'rotation', parseInt(e.target.value))}
                                        className="modern-slider"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <p>No text added yet. Click the button above to add text.</p>
                        </div>
                      )}
                    </div>
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
                          className={`toggle-switch ${snap.materialTextures[activeMaterial]?.enabled ? 'active' : ''}`}
                          onClick={() => state.toggleMaterialTexture(activeMaterial)}
                        >
                          <div className="toggle-slider"></div>
                        </div>
                      </div>
                      
                      {/* Texture Properties */}
                      {snap.materialTextures[activeMaterial]?.enabled && (
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
                          
                          {/* Texture Color Tint */}
                          <div className="property-group">
                            <label>Color Tint</label>
                            <div className="texture-color-control">
                              <div 
                                className="texture-color-preview"
                                style={{ backgroundColor: snap.materialTextures[activeMaterial]?.color || '#ffffff' }}
                              ></div>
                              <input
                                type="text"
                                value={snap.materialTextures[activeMaterial]?.color || '#ffffff'}
                                onChange={(e) => state.updateTextureColor(activeMaterial, e.target.value)}
                                className="color-input-field"
                              />
                            </div>
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