import { proxy } from 'valtio';

const state = proxy({
  // color: '#f21fb0',
  color: '#000000',
  
  // Multiple materials support
  currentModel: 'jerseyhalf.glb', // Use the multi-material model
  materials: {
    // Default colors for each material in shirt2.glb
    // These will be populated dynamically when the model loads
  },
  materialTypes: {
    // Will store whether each material uses solid color or gradient
    // Structure: {materialName: {type: 'solid' | 'gradient', gradient: {color1: '#fff', color2: '#000', type: 'linear', angle: 45}}}
  },
  activeMaterial: null, // Currently selected material for editing
  
  // Texture settings for materials
  materialTextures: {
    // Structure: {materialName: {enabled: boolean, texture: string, scale: number, opacity: number}}
  },
  
  // Available textures
  availableTextures: [
    { name: 'Pattern 1', file: 'pattern1.png' },
    { name: 'Pattern 2', file: 'pattern2.png' },
    { name: 'Pattern 3', file: 'pattern3.png' },
    { name: 'Pattern 4', file: 'pattern4.png' },
    { name: 'Pattern 5', file: 'pattern5.png' },
    { name: 'Pattern 6', file: 'pattern6.png' },
    { name: 'Pattern 7', file: 'pattern7.png' },
  ],
  
  // Material-specific decorations
  materialDecorations: {
    // Will be populated with material-specific decorations
    // Structure: {materialName: {logos: [], texts: []}}
  },
  
  // Function to update a material color
  updateMaterialColor: (materialName, color) => {
    if (materialName && state.materials[materialName]) {
      state.materials[materialName] = color;
      console.log(`Updated material ${materialName} to color ${color}`);
    }
  },
  
  // Function to initialize material type
  initMaterialType: (materialName) => {
    if (!state.materialTypes) {
      state.materialTypes = {};
    }
    
    if (!state.materialTypes[materialName]) {
      // Get a default color - either from materials or use white
      const defaultColor = state.materials[materialName] || '#ffffff';
      
      state.materialTypes[materialName] = {
        type: 'solid',
        solidColor: defaultColor, // Store the solid color separately
        gradient: {
          color1: '#3498db', // Default blue
          color2: '#e74c3c', // Default red
          type: 'linear',
          angle: 45
        }
      };
      console.log(`Initialized material type for: ${materialName}`);
    }
  },
  
  // Function to initialize material texture settings
  initMaterialTexture: (materialName) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.materialTextures[materialName] = {
        enabled: false,
        texture: 'pattern1.png',
        scale: 1.0,
        opacity: 0.8,
        color: '#ffffff', // Default white color (no tint)
        rotation: 0 // Default rotation in degrees
      };
      console.log(`Initialized texture settings for: ${materialName}`);
    }
  },
  
  // Function to toggle texture visibility for a material
  toggleMaterialTexture: (materialName) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    state.materialTextures[materialName].enabled = !state.materialTextures[materialName].enabled;
    console.log(`Toggled texture for ${materialName} to ${state.materialTextures[materialName].enabled}`);
  },
  
  // Function to update texture for a material
  updateMaterialTexture: (materialName, textureFile) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // If texture is not already enabled, enable it
    if (!state.materialTextures[materialName].enabled) {
      state.materialTextures[materialName].enabled = true;
    }
    
    state.materialTextures[materialName].texture = textureFile;
    console.log(`Updated texture for ${materialName} to ${textureFile}`);
  },
  
  // Function to update texture scale for a material
  updateTextureScale: (materialName, scale) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // If texture is not already enabled, enable it
    if (!state.materialTextures[materialName].enabled) {
      state.materialTextures[materialName].enabled = true;
    }
    
    state.materialTextures[materialName].scale = scale;
    console.log(`Updated texture scale for ${materialName} to ${scale}`);
  },
  
  // Function to update texture opacity for a material
  updateTextureOpacity: (materialName, opacity) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // If texture is not already enabled, enable it
    if (!state.materialTextures[materialName].enabled) {
      state.materialTextures[materialName].enabled = true;
    }
    
    state.materialTextures[materialName].opacity = opacity;
    console.log(`Updated texture opacity for ${materialName} to ${opacity}`);
  },
  
  // Function to update texture color for a material
  updateTextureColor: (materialName, color) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // Normalize color value
    const normalizedColor = color ? color.toLowerCase() : '#ffffff';
    
    // Store the color value
    state.materialTextures[materialName].color = normalizedColor;
    
    // If texture is not already enabled and we're setting a non-default color, enable it
    if (!state.materialTextures[materialName].enabled && normalizedColor !== '#ffffff') {
      state.materialTextures[materialName].enabled = true;
      console.log(`Enabled texture for ${materialName} due to color tint being applied`);
    }
    
    console.log(`Updated texture color for ${materialName} to ${normalizedColor}`);
  },
  
  // Function to update texture rotation for a material
  updateTextureRotation: (materialName, rotation) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // If texture is not already enabled, enable it
    if (!state.materialTextures[materialName].enabled) {
      state.materialTextures[materialName].enabled = true;
    }
    
    // Normalize rotation to be between 0 and 360
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    
    state.materialTextures[materialName].rotation = normalizedRotation;
    console.log(`Updated texture rotation for ${materialName} to ${normalizedRotation}°`);
  },
  
  // Function to set material type (solid or gradient)
  setMaterialType: (materialName, type) => {
    if (!state.materialTypes) {
      state.materialTypes = {};
    }
    
    if (!state.materialTypes[materialName]) {
      state.initMaterialType(materialName);
    }
    
    // Skip if already the same type
    if (state.materialTypes[materialName].type === type) {
      console.log(`Material ${materialName} is already type ${type}`);
      return;
    }
    
    console.log(`Changing material ${materialName} from ${state.materialTypes[materialName].type} to ${type}`);
    
    // When switching to solid, update the material color to the stored solid color
    if (type === 'solid' && state.materialTypes[materialName].type === 'gradient') {
      const solidColor = state.materialTypes[materialName].solidColor;
      console.log(`Switching to solid color: ${solidColor}`);
      state.updateMaterialColor(materialName, solidColor);
    }
    
    // When switching to gradient, store the current solid color but don't change gradient colors
    if (type === 'gradient' && state.materialTypes[materialName].type === 'solid') {
      const currentColor = state.materials[materialName];
      console.log(`Switching to gradient, storing solid color: ${currentColor}`);
      state.materialTypes[materialName].solidColor = currentColor;
      // Don't update gradient colors here - keep them as they were
    }
    
    // Update the material type
    state.materialTypes[materialName].type = type;
    console.log(`Set material ${materialName} type to ${type}`);
  },
  
  // Function to update solid color
  updateSolidColor: (materialName, color) => {
    if (!state.materialTypes) {
      state.materialTypes = {};
    }
    
    if (!state.materialTypes[materialName]) {
      state.initMaterialType(materialName);
    }
    
    state.materialTypes[materialName].solidColor = color;
    console.log(`Updated solid color for ${materialName} to ${color}`);
  },
  
  // Function to update gradient properties
  updateGradient: (materialName, property, value) => {
    if (!state.materialTypes) {
      state.materialTypes = {};
    }
    
    if (!state.materialTypes[materialName]) {
      state.initMaterialType(materialName);
    }
    
    state.materialTypes[materialName].gradient[property] = value;
    console.log(`Updated gradient ${property} for ${materialName} to ${value}`);
  },
  
  // Function to initialize material decorations
  initMaterialDecorations: (materialName) => {
    if (!state.materialDecorations) {
      state.materialDecorations = {};
    }
    
    if (!state.materialDecorations[materialName]) {
      state.materialDecorations[materialName] = {
        logos: [],
        texts: []
      };
      console.log(`Initialized decorations for material: ${materialName}`);
    }
  },
  
  // Function to add a logo to a material
  addLogoToMaterial: (materialName) => {
    if (!state.materialDecorations[materialName]) {
      state.initMaterialDecorations(materialName);
    }
    
    state.materialDecorations[materialName].logos.push({
      id: Date.now().toString(),
      visible: true,
      image: null,
      scale: 0.15,
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      rotation: 0
    });
  },
  
  // Function to add text to a material
  addTextToMaterial: (materialName) => {
    if (!state.materialDecorations[materialName]) {
      state.initMaterialDecorations(materialName);
    }
    
    state.materialDecorations[materialName].texts.push({
      id: Date.now().toString(),
      visible: true,
      content: 'Sample Text',
      font: 'Arial',
      size: 64,
      color: 'white',
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      rotation: 0
    });
  },
  
  // Function to remove a logo from a material
  removeLogoFromMaterial: (materialName, logoId) => {
    if (state.materialDecorations[materialName] && state.materialDecorations[materialName].logos) {
      state.materialDecorations[materialName].logos = 
        state.materialDecorations[materialName].logos.filter(logo => logo.id !== logoId);
    }
  },
  
  // Function to remove text from a material
  removeTextFromMaterial: (materialName, textId) => {
    if (state.materialDecorations[materialName] && state.materialDecorations[materialName].texts) {
      state.materialDecorations[materialName].texts = 
        state.materialDecorations[materialName].texts.filter(text => text.id !== textId);
    }
  },
  
  // Function to toggle logo visibility
  toggleLogoVisibility: (materialName, logoId) => {
    if (state.materialDecorations[materialName] && state.materialDecorations[materialName].logos) {
      const logo = state.materialDecorations[materialName].logos.find(l => l.id === logoId);
      if (logo) {
        logo.visible = !logo.visible;
      }
    }
  },
  
  // Function to toggle text visibility
  toggleTextVisibility: (materialName, textId) => {
    if (state.materialDecorations[materialName] && state.materialDecorations[materialName].texts) {
      const text = state.materialDecorations[materialName].texts.find(t => t.id === textId);
      if (text) {
        text.visible = !text.visible;
      }
    }
  },
  
  // Function to update logo image
  updateLogoImage: (materialName, logoId, image) => {
    console.log(`Store: Updating logo image for ${materialName}, logo ID: ${logoId}`);
    
    if (!state.materialDecorations) {
      state.materialDecorations = {};
    }
    
    if (!state.materialDecorations[materialName]) {
      state.initMaterialDecorations(materialName);
    }
    
    if (state.materialDecorations[materialName] && state.materialDecorations[materialName].logos) {
      const logo = state.materialDecorations[materialName].logos.find(l => l.id === logoId);
      if (logo) {
        logo.image = image;
        logo.visible = true; // Ensure logo is enabled when image is set
        console.log(`Store: Logo image updated successfully for ${materialName}, logo ID: ${logoId}`);
      } else {
        console.error(`Store: Logo with ID ${logoId} not found for material ${materialName}`);
      }
    } else {
      console.error(`Store: No logos array found for material ${materialName}`);
    }
  },
  
  // Function to update text content
  updateTextContent: (materialName, textId, content) => {
    if (state.materialDecorations[materialName] && state.materialDecorations[materialName].texts) {
      const text = state.materialDecorations[materialName].texts.find(t => t.id === textId);
      if (text) {
        text.content = content;
      }
    }
  },
  
  // Function to update logo property
  updateLogoProperty: (materialName, logoId, property, value) => {
    if (state.materialDecorations[materialName] && state.materialDecorations[materialName].logos) {
      const logo = state.materialDecorations[materialName].logos.find(l => l.id === logoId);
      if (logo) {
        // Handle position properties
        if (property === 'positionX') {
          if (!logo.position.x) {
            // Convert from array to object if needed
            logo.position = {
              x: logo.position[0] || 0,
              y: logo.position[1] || 0,
              z: logo.position[2] || 0
            };
          }
          logo.position.x = value;
        } else if (property === 'positionY') {
          if (!logo.position.x) {
            // Convert from array to object if needed
            logo.position = {
              x: logo.position[0] || 0,
              y: logo.position[1] || 0,
              z: logo.position[2] || 0
            };
          }
          logo.position.y = value;
        } else if (property === 'rotation') {
          // Store rotation as a single value instead of array
          logo.rotation = value;
        } else {
          // For other properties like scale, just set directly
          logo[property] = value;
        }
      }
    }
  },
  
  // Function to update text property
  updateTextProperty: (materialName, textId, property, value) => {
    if (state.materialDecorations[materialName] && state.materialDecorations[materialName].texts) {
      const text = state.materialDecorations[materialName].texts.find(t => t.id === textId);
      if (text) {
        // Handle position properties
        if (property === 'positionX') {
          if (!text.position.x) {
            // Convert from array to object if needed
            text.position = {
              x: text.position[0] || 0,
              y: text.position[1] || 0,
              z: text.position[2] || 0
            };
          }
          text.position.x = value;
        } else if (property === 'positionY') {
          if (!text.position.x) {
            // Convert from array to object if needed
            text.position = {
              x: text.position[0] || 0,
              y: text.position[1] || 0,
              z: text.position[2] || 0
            };
          }
          text.position.y = value;
        } else if (property === 'rotation') {
          // Store rotation as a single value instead of array
          text.rotation = value;
        } else {
          // For other properties like font, size, color, just set directly
          text[property] = value;
        }
      }
    }
  },

  isFrontLogoTexture: true,
  isBackLogoTexture: true,
  isFrontText: true,
  isBackText: true,
  isFullTexture: false,
  frontLogoDecal: './2249158.webp',
  fullDecal: './texture.jpeg',
  frontLogoPosition: [ 0, 0.04, 0.15 ],
  frontLogoScale: 0.15,
  backLogoDecal: './threejs.png',
  backLogoPosition: [0, 0.04, -0.15],
  backLogoRotation: [0, Math.PI, 0],
  backLogoScale: 0.15,
  frontText: 'Front Text',
  frontTextPosition: [0, -0.04, 0.15],
  frontTextRotation: [0, 0, 0],
  frontTextFontSize: 0.1,
  frontTextScale: [0.15, 0.04, 0.1],
  frontTextFont: 'Arial',
  frontTextSize: 64,
  frontTextColor: 'white',
  backText: 'Back Text',
  backTextPosition: [0, -0.04, -0.15],
  backTextRotation: [0, Math.PI, 0],
  backTextFontSize: 0.1,
  backTextScale: [0.15, 0.04, 0.1],
  backTextFont: 'Arial',
  backTextSize: 64,
  backTextColor: 'white',
  
  // New transform control properties
  logoScale: 0.5,
  logoRotation: 0,
  logoPositionX: 0,
  logoPositionY: 0,
});

export default state;
