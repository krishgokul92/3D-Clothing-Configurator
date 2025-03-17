import React, { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import state from '../store';

const LogoEditor = () => {
  const snap = useSnapshot(state);
  const [materialsList, setMaterialsList] = useState([]);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [activeLogoId, setActiveLogoId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

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
    setActiveLogoId(null);
    
    // Ensure material decorations are initialized for the selected material
    if (!snap.materialDecorations[materialName]) {
      state.initMaterialDecorations(materialName);
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
  
  const handleRemoveLogo = (logoId) => {
    if (activeMaterial) {
      state.removeLogoFromMaterial(activeMaterial, logoId);
      if (activeLogoId === logoId) {
        setActiveLogoId(null);
      }
    }
  };
  
  const handleToggleLogo = (logoId) => {
    if (activeMaterial) {
      state.toggleLogoVisibility(activeMaterial, logoId);
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

  const handleLogoPropertyChange = (logoId, property, value) => {
    if (activeMaterial) {
      state.updateLogoProperty(activeMaterial, logoId, property, value);
    }
  };

  // Get current material
  const currentMaterial = activeMaterial;

  return (
    <div className="material-logo-editor">
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

      {/* Logo Editor */}
      {currentMaterial && (
        <div className="material-logo-editor">
          <h3 className="subsection-title">Logo Editor</h3>
          
          <div className="add-item-container">
            <button className="add-item-btn" onClick={handleAddLogo}>
              Add Logo
            </button>
          </div>
          
          {snap.materialDecorations[currentMaterial]?.logos?.length === 0 ? (
            <div className="empty-state">
              No logos added yet. Click "Add Logo" to get started.
            </div>
          ) : (
            <div className="logos-list">
              {snap.materialDecorations[currentMaterial]?.logos?.map((logo) => (
                <div 
                  key={logo.id} 
                  className={`logo-item ${activeLogoId === logo.id ? 'active' : ''}`}
                >
                  <div 
                    className="logo-item-header"
                    onClick={() => setActiveLogoId(activeLogoId === logo.id ? null : logo.id)}
                  >
                    <div className="logo-item-title">
                      <div 
                        className="toggle-switch small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLogo(logo.id);
                        }}
                      >
                        <div className={`toggle-slider ${logo.visible ? 'active' : ''}`}></div>
                      </div>
                      <span>Logo {logo.id.substring(logo.id.length - 4)}</span>
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
                        <h4 className="subsection-title">Logo Image</h4>
                        
                        {logo.image ? (
                          <div className="logo-preview-container">
                            <img 
                              src={logo.image} 
                              alt="Logo" 
                              className="logo-preview" 
                            />
                            <label className="change-logo-btn">
                              Change Logo
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden"
                                onChange={(e) => handleLogoUpload(e, logo.id)}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="logo-upload">
                            <div className="logo-upload-label">
                              <span className="upload-icon">+</span>
                              <span>Upload Logo</span>
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden"
                              onChange={(e) => handleLogoUpload(e, logo.id)}
                            />
                          </label>
                        )}
                      </div>
                      
                      <div className="logo-properties">
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Scale</label>
                            <span className="slider-value">{logo.scale.toFixed(2)}</span>
                          </div>
                          <input
                            type="range"
                            min="0.01"
                            max="0.5"
                            step="0.01"
                            className="modern-slider"
                            value={logo.scale}
                            onChange={(e) => handleLogoPropertyChange(logo.id, 'scale', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Position X</label>
                            <span className="slider-value">{logo.position.x !== undefined ? logo.position.x.toFixed(2) : '0.00'}</span>
                          </div>
                          <input
                            type="range"
                            min="-1"
                            max="1"
                            step="0.01"
                            className="modern-slider"
                            value={logo.position.x !== undefined ? logo.position.x : 0}
                            onChange={(e) => handleLogoPropertyChange(logo.id, 'positionX', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Position Y</label>
                            <span className="slider-value">{logo.position.y !== undefined ? logo.position.y.toFixed(2) : '0.00'}</span>
                          </div>
                          <input
                            type="range"
                            min="-1"
                            max="1"
                            step="0.01"
                            className="modern-slider"
                            value={logo.position.y !== undefined ? logo.position.y : 0}
                            onChange={(e) => handleLogoPropertyChange(logo.id, 'positionY', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Position Z</label>
                            <span className="slider-value">{logo.position.z !== undefined ? logo.position.z.toFixed(3) : '0.000'}</span>
                          </div>
                          <input
                            type="range"
                            min="-1"
                            max="1"
                            step="0.01"
                            className="modern-slider"
                            value={logo.position.z !== undefined ? logo.position.z : 0}
                            onChange={(e) => handleLogoPropertyChange(logo.id, 'positionZ', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Rotation</label>
                            <span className="slider-value">{typeof logo.rotation === 'number' ? logo.rotation.toFixed(1) : '0.0'}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="1"
                            className="modern-slider"
                            value={typeof logo.rotation === 'number' ? logo.rotation : 0}
                            onChange={(e) => handleLogoPropertyChange(logo.id, 'rotation', parseFloat(e.target.value))}
                          />
                        </div>
                        
                        {/* Roughness Slider */}
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Roughness</label>
                            <span className="slider-value">{typeof logo.roughness === 'number' ? logo.roughness.toFixed(2) : '0.50'}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            className="modern-slider"
                            value={typeof logo.roughness === 'number' ? logo.roughness : 0.5}
                            onChange={(e) => handleLogoPropertyChange(logo.id, 'roughness', parseFloat(e.target.value))}
                          />
                          <div className="property-description">
                            Controls how rough or smooth the logo appears. Lower values create a smoother, more reflective surface.
                          </div>
                        </div>
                        
                        {/* Metalness Slider */}
                        <div className="property-group">
                          <div className="slider-label-row">
                            <label>Metalness</label>
                            <span className="slider-value">{typeof logo.metalness === 'number' ? logo.metalness.toFixed(2) : '0.00'}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            className="modern-slider"
                            value={typeof logo.metalness === 'number' ? logo.metalness : 0}
                            onChange={(e) => handleLogoPropertyChange(logo.id, 'metalness', parseFloat(e.target.value))}
                          />
                          <div className="property-description">
                            Controls how metallic the logo appears. Higher values create a more metallic look.
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

export default LogoEditor; 