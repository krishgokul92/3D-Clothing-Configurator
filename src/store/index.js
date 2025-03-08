import { proxy } from 'valtio';

const state = proxy({
  // color: '#f21fb0',
  color: '#000000',
  
  // Multiple materials support
  currentModel: 'shirt2.glb', // Use the multi-material model
  materials: {
    // Default colors for each material in shirt2.glb
    // These will be populated dynamically when the model loads
  },
  activeMaterial: null, // Currently selected material for editing
  
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
