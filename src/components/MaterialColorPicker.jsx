import React, { useState, useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { SketchPicker } from 'react-color';
import state from '../store';

const MaterialColorPicker = () => {
  const snap = useSnapshot(state);
  const [materialsList, setMaterialsList] = useState([]);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [activeDecorTab, setActiveDecorTab] = useState('color'); // 'color', 'logo', 'text'
  const [activeLogoId, setActiveLogoId] = useState(null);
  const [activeTextId, setActiveTextId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  
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
    }
  };

  const handleQuickColorChange = (colorHex) => {
    if (activeMaterial) {
      console.log(`Quick changing color for ${activeMaterial} to:`, colorHex);
      state.updateMaterialColor(activeMaterial, colorHex);
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
      </div>
      
      {/* Color Editor for Active Material */}
      {currentMaterial && activeDecorTab === 'color' && (
        <div className="material-color-editor">
          <div className="material-color-header">
            <div className="material-color-info">
              <span className="material-name">{currentMaterial.name}</span>
              <span className="material-color-hex">{currentMaterial.color}</span>
            </div>
            <div 
              className="material-color-preview"
              style={{ backgroundColor: currentMaterial.color }}
            ></div>
          </div>
          
          {/* Color Families */}
          <div className="color-families">
            {Object.entries(colorPalette).map(([family, colors]) => (
              <div key={family} className="color-family">
                <div className="color-family-name">{family}</div>
                <div className="color-family-swatches">
                  {colors.map((colorHex, i) => (
                    <div 
                      key={i} 
                      className={`color-swatch ${currentMaterial.color === colorHex ? 'active' : ''}`}
                      style={{ backgroundColor: colorHex }}
                      onClick={() => handleQuickColorChange(colorHex)}
                      title={colorHex}
                    />
                  ))}
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default MaterialColorPicker; 