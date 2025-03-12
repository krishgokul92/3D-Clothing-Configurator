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
  
  // Texture support
  materialTextures: {
    // Will store texture settings for each material
    // Structure: {materialName: {enabled: true, texture: 'pattern1.png', opacity: 0.8, scale: 1}}
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
  
  // Function to initialize material texture
  initMaterialTexture: (materialName) => {
    if (!state.materialTextures) {
      state.materialTextures = { ...state.materialTextures };
    }
    
    if (!state.materialTextures[materialName]) {
      // Create a new object with default texture settings
      state.materialTextures = {
        ...state.materialTextures,
        [materialName]: {
          enabled: false,
          texture: 'pattern1.png',
          opacity: 0.8,
          scale: 1,
          color: '#000000' // Default to black (original behavior)
        }
      };
      console.log(`Initialized texture settings for: ${materialName}`);
    }
  },
  
  // Function to toggle texture for a material
  toggleMaterialTexture: (materialName) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // Create a new object to ensure Valtio detects the change
    const updatedSettings = { ...state.materialTextures[materialName] };
    updatedSettings.enabled = !updatedSettings.enabled;
    
    // Replace the entire object to ensure the change is detected
    state.materialTextures[materialName] = updatedSettings;
    
    console.log(`Toggled texture for ${materialName} to ${updatedSettings.enabled}`);
  },
  
  // Function to update texture settings
  updateTextureSettings: (materialName, property, value) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // Create a new object to ensure Valtio detects the change
    const updatedSettings = { ...state.materialTextures[materialName] };
    updatedSettings[property] = value;
    
    // Replace the entire object to ensure the change is detected
    state.materialTextures = {
      ...state.materialTextures,
      [materialName]: updatedSettings
    };
    
    console.log(`Updated texture ${property} for ${materialName} to ${value}`);
  },
  
  // Function to set material type (solid or gradient)
  setMaterialType: (materialName, type) => {
    if (!state.materialTypes) {
      state.materialTypes = {};
    }
    
    if (!state.materialTypes[materialName]) {
      state.initMaterialType(materialName);
    }
    
    // When switching to solid, update the material color to the stored solid color
    if (type === 'solid' && state.materialTypes[materialName].type === 'gradient') {
      state.updateMaterialColor(materialName, state.materialTypes[materialName].solidColor);
    }
    
    // When switching to gradient, store the current solid color but don't change gradient colors
    if (type === 'gradient' && state.materialTypes[materialName].type === 'solid') {
      state.materialTypes[materialName].solidColor = state.materials[materialName];
      // Don't update gradient colors here - keep them as they were
    }
    
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
      enabled: true,
      image: null,
      scale: 0.15,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    });
  },
  
  // Function to add text to a material
  addTextToMaterial: (materialName) => {
    if (!state.materialDecorations[materialName]) {
      state.initMaterialDecorations(materialName);
    }
    
    state.materialDecorations[materialName].texts.push({
      id: Date.now().toString(),
      enabled: true,
      content: 'Sample Text',
      font: 'Arial',
      size: 64,
      color: 'white',
      scale: [0.15, 0.04, 0.1],
      position: [0, 0, 0],
      rotation: [0, 0, 0]
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
        logo.enabled = !logo.enabled;
      }
    }
  },
  
  // Function to toggle text visibility
  toggleTextVisibility: (materialName, textId) => {
    if (state.materialDecorations[materialName] && state.materialDecorations[materialName].texts) {
      const text = state.materialDecorations[materialName].texts.find(t => t.id === textId);
      if (text) {
        text.enabled = !text.enabled;
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
        logo.enabled = true; // Ensure logo is enabled when image is set
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
        logo[property] = value;
      }
    }
  },
  
  // Function to update text property
  updateTextProperty: (materialName, textId, property, value) => {
    if (state.materialDecorations[materialName] && state.materialDecorations[materialName].texts) {
      const text = state.materialDecorations[materialName].texts.find(t => t.id === textId);
      if (text) {
        text[property] = value;
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
