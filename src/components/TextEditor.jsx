import React, { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { SketchPicker } from 'react-color';
import state from '../store';

const TextEditor = () => {
  const snap = useSnapshot(state);
  const [materialsList, setMaterialsList] = useState([]);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [activeTextId, setActiveTextId] = useState(null);
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
        
        // Ensure material decorations are initialized for the selected material
        if (!snap.materialDecorations[materialsArray[0].name]) {
          state.initMaterialDecorations(materialsArray[0].name);
        }
      }
    }
  }, [snap.materials, activeMaterial]);

  // Update active material when state.activeMaterial changes
  useEffect(() => {
    if (snap.activeMaterial && snap.activeMaterial !== activeMaterial) {
      setActiveMaterial(snap.activeMaterial);
      
      // Ensure material decorations are initialized for the selected material
      if (!snap.materialDecorations[snap.activeMaterial]) {
        state.initMaterialDecorations(snap.activeMaterial);
      }
    }
  }, [snap.activeMaterial, activeMaterial]);

  const handleMaterialChange = (materialName) => {
    setActiveMaterial(materialName);
    state.activeMaterial = materialName;
    setActiveTextId(null);
    
    // Ensure material decorations are initialized for the selected material
    if (!snap.materialDecorations[materialName]) {
      state.initMaterialDecorations(materialName);
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
  
  const handleRemoveText = (textId) => {
    if (activeMaterial) {
      state.removeTextFromMaterial(activeMaterial, textId);
      if (activeTextId === textId) {
        setActiveTextId(null);
      }
    }
  };
  
  const handleToggleText = (textId) => {
    if (activeMaterial) {
      state.toggleTextVisibility(activeMaterial, textId);
    }
  };
  
  const handleTextPropertyChange = (textId, property, value) => {
    if (activeMaterial) {
      state.updateTextProperty(activeMaterial, textId, property, value);
    }
  };

  // Get current material
  const currentMaterial = activeMaterial;

  return (
    <div className="material-text-editor">
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

      {/* Text Editor */}
      {currentMaterial && (
        <div className="material-text-editor">
          <h3 className="subsection-title">Text Editor</h3>
          
          <div className="add-item-container">
            <button className="add-item-btn" onClick={handleAddText}>
              Add Text
            </button>
          </div>
          
          {snap.materialDecorations[currentMaterial]?.texts?.length === 0 ? (
            <div className="empty-state">
              No text added yet. Click "Add Text" to get started.
            </div>
          ) : (
            <div className="texts-list">
              {snap.materialDecorations[currentMaterial]?.texts?.map((text) => (
                <div 
                  key={text.id} 
                  className={`text-item ${activeTextId === text.id ? 'active' : ''}`}
                >
                  <div 
                    className="text-item-header"
                    onClick={() => setActiveTextId(activeTextId === text.id ? null : text.id)}
                  >
                    <div className="text-item-title">
                      <div 
                        className="toggle-switch small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleText(text.id);
                        }}
                      >
                        <div className={`toggle-slider ${text.visible ? 'active' : ''}`}></div>
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
                        <h4 className="subsection-title">Text Content</h4>
                        
                        <div className="property-group">
                          <label>Text</label>
                          <input
                            type="text"
                            className="text-input"
                            value={text.content}
                            onChange={(e) => handleTextPropertyChange(text.id, 'content', e.target.value)}
                            placeholder="Enter text"
                          />
                        </div>
                        
                        <div className="property-group">
                          <label>Font</label>
                          <select
                            className="font-select"
                            value={text.font}
                            onChange={(e) => handleTextPropertyChange(text.id, 'font', e.target.value)}
                          >
                            <option value="Arial">Arial</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                          </select>
                        </div>
                        
                        <div className="property-group">
                          <label>Text Color</label>
                          <div className="text-color-picker">
                            <div 
                              className="texture-color-preview"
                              style={{ backgroundColor: text.color }}
                              onClick={() => setShowColorPicker(!showColorPicker)}
                            ></div>
                            <input
                              type="text"
                              className="color-input-field"
                              value={text.color}
                              onChange={(e) => handleTextPropertyChange(text.id, 'color', e.target.value)}
                            />
                          </div>
                          
                          {showColorPicker && (
                            <div className="sketch-picker-wrapper">
                              <SketchPicker
                                color={text.color}
                                onChange={(color) => handleTextPropertyChange(text.id, 'color', color.hex)}
                                disableAlpha
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-properties">
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Size</label>
                            <span className="slider-value">{text.size}</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="120"
                            step="1"
                            className="modern-slider"
                            value={text.size}
                            onChange={(e) => handleTextPropertyChange(text.id, 'size', parseInt(e.target.value))}
                          />
                        </div>
                        
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Scale</label>
                            <span className="slider-value">{text.scale && text.scale[0] ? text.scale[0].toFixed(2) : '0.15'}</span>
                          </div>
                          <input
                            type="range"
                            min="0.01"
                            max="2.5"
                            step="0.01"
                            className="modern-slider"
                            value={text.scale && text.scale[0] ? text.scale[0] : 0.15}
                            onChange={(e) => {
                              const scale = parseFloat(e.target.value);
                              // Create a proportional scale array - maintain height/width ratio
                              const heightRatio = 0.04 / 0.15; // Default height to width ratio
                              const depthRatio = 0.1 / 0.15;   // Default depth to width ratio
                              const newScale = [
                                scale,                  // width
                                scale * heightRatio,    // height
                                scale * depthRatio      // depth
                              ];
                              handleTextPropertyChange(text.id, 'scale', newScale);
                            }}
                          />
                          <div className="property-description">
                            Controls the overall size of the text while maintaining proportions.
                          </div>
                        </div>
                        
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Position X</label>
                            <span className="slider-value">{text.position.x !== undefined ? text.position.x.toFixed(2) : '0.00'}</span>
                          </div>
                          <input
                            type="range"
                            min="-1"
                            max="1"
                            step="0.01"
                            className="modern-slider"
                            value={text.position.x !== undefined ? text.position.x : 0}
                            onChange={(e) => handleTextPropertyChange(text.id, 'positionX', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Position Y</label>
                            <span className="slider-value">{text.position.y !== undefined ? text.position.y.toFixed(2) : '0.00'}</span>
                          </div>
                          <input
                            type="range"
                            min="-1"
                            max="1"
                            step="0.01"
                            className="modern-slider"
                            value={text.position.y !== undefined ? text.position.y : 0}
                            onChange={(e) => handleTextPropertyChange(text.id, 'positionY', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Position Z</label>
                            <span className="slider-value">{text.position.z !== undefined ? text.position.z.toFixed(3) : '0.000'}</span>
                          </div>
                          <input
                            type="range"
                            min="-1"
                            max="1"
                            step="0.01"
                            className="modern-slider"
                            value={text.position.z !== undefined ? text.position.z : 0}
                            onChange={(e) => handleTextPropertyChange(text.id, 'positionZ', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Rotation</label>
                            <span className="slider-value">{typeof text.rotation === 'number' ? text.rotation.toFixed(1) : '0.0'}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="1"
                            className="modern-slider"
                            value={typeof text.rotation === 'number' ? text.rotation : 0}
                            onChange={(e) => handleTextPropertyChange(text.id, 'rotation', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        {/* Roughness Slider */}
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Roughness</label>
                            <span className="slider-value">{typeof text.roughness === 'number' ? text.roughness.toFixed(2) : '0.50'}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            className="modern-slider"
                            value={typeof text.roughness === 'number' ? text.roughness : 0.5}
                            onChange={(e) => handleTextPropertyChange(text.id, 'roughness', parseFloat(e.target.value))}
                          />
                          <div className="property-description">
                            Controls how rough or smooth the text appears. Lower values create a smoother, more reflective surface.
                          </div>
                        </div>
                        
                        {/* Metalness Slider */}
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Metalness</label>
                            <span className="slider-value">{typeof text.metalness === 'number' ? text.metalness.toFixed(2) : '0.00'}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            className="modern-slider"
                            value={typeof text.metalness === 'number' ? text.metalness : 0}
                            onChange={(e) => handleTextPropertyChange(text.id, 'metalness', parseFloat(e.target.value))}
                          />
                          <div className="property-description">
                            Controls how metallic the text appears. Higher values create a more metallic look.
                          </div>
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

export default TextEditor; 