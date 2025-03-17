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
    { name: 'Pattern 8', file: 'pattern8.png' },
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
        visible: false,
        texture: 'pattern1.png',
        scale: 1.0,
        opacity: 0.8,
        colorType: 'solid', // 'solid' or 'gradient'
        color: '#ffffff', // Default white color (no tint) for solid color
        gradient: {
          color1: '#3498db', // Default blue
          color2: '#e74c3c', // Default red
          type: 'linear',
          angle: 45
        },
        roughness: 0.5, // Default roughness (0-1)
        metalness: 0.0, // Default metalness (0-1)
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
    
    state.materialTextures[materialName].visible = !state.materialTextures[materialName].visible;
    console.log(`Toggled texture for ${materialName} to ${state.materialTextures[materialName].visible}`);
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
    if (!state.materialTextures[materialName].visible) {
      state.materialTextures[materialName].visible = true;
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
    if (!state.materialTextures[materialName].visible) {
      state.materialTextures[materialName].visible = true;
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
    if (!state.materialTextures[materialName].visible) {
      state.materialTextures[materialName].visible = true;
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
    if (!state.materialTextures[materialName].visible && normalizedColor !== '#ffffff') {
      state.materialTextures[materialName].visible = true;
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
    if (!state.materialTextures[materialName].visible) {
      state.materialTextures[materialName].visible = true;
    }
    
    // Normalize rotation to be between 0 and 360
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    
    state.materialTextures[materialName].rotation = normalizedRotation;
    console.log(`Updated texture rotation for ${materialName} to ${normalizedRotation}°`);
  },
  
  // Function to update texture roughness for a material
  updateTextureRoughness: (materialName, roughness) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // If texture is not already enabled, enable it
    if (!state.materialTextures[materialName].visible) {
      state.materialTextures[materialName].visible = true;
    }
    
    // Ensure roughness is a valid number between 0 and 1
    const normalizedRoughness = Math.max(0, Math.min(1, parseFloat(roughness) || 0.5));
    
    state.materialTextures[materialName].roughness = normalizedRoughness;
    console.log(`Updated texture roughness for ${materialName} to ${normalizedRoughness}`);
  },
  
  // Function to update texture metalness for a material
  updateTextureMetalness: (materialName, metalness) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // If texture is not already enabled, enable it
    if (!state.materialTextures[materialName].visible) {
      state.materialTextures[materialName].visible = true;
    }
    
    // Ensure metalness is a valid number between 0 and 1
    const normalizedMetalness = Math.max(0, Math.min(1, parseFloat(metalness) || 0));
    
    state.materialTextures[materialName].metalness = normalizedMetalness;
    console.log(`Updated texture metalness for ${materialName} to ${normalizedMetalness}`);
  },
  
  // Function to set texture color type (solid or gradient)
  setTextureColorType: (materialName, type) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // Skip if already the same type
    if (state.materialTextures[materialName].colorType === type) {
      console.log(`Texture color for ${materialName} is already type ${type}`);
      return;
    }
    
    console.log(`Changing texture color type for ${materialName} from ${state.materialTextures[materialName].colorType} to ${type}`);
    
    // Update the texture color type
    state.materialTextures[materialName].colorType = type;
    
    // If texture is not already enabled and we're setting to gradient, enable it
    if (!state.materialTextures[materialName].visible && type === 'gradient') {
      state.materialTextures[materialName].visible = true;
      console.log(`Enabled texture for ${materialName} due to gradient color tint being applied`);
    }
    
    console.log(`Set texture color type for ${materialName} to ${type}`);
  },
  
  // Function to update texture gradient properties
  updateTextureGradient: (materialName, property, value) => {
    if (!state.materialTextures) {
      state.materialTextures = {};
    }
    
    if (!state.materialTextures[materialName]) {
      state.initMaterialTexture(materialName);
    }
    
    // Ensure gradient object exists
    if (!state.materialTextures[materialName].gradient) {
      state.materialTextures[materialName].gradient = {
        color1: '#3498db', // Default blue
        color2: '#e74c3c', // Default red
        type: 'linear',
        angle: 45
      };
    }
    
    // Update the gradient property
    state.materialTextures[materialName].gradient[property] = value;
    
    // If texture is not already enabled, enable it
    if (!state.materialTextures[materialName].visible) {
      state.materialTextures[materialName].visible = true;
    }
    
    // Ensure colorType is set to gradient
    if (state.materialTextures[materialName].colorType !== 'gradient') {
      state.materialTextures[materialName].colorType = 'gradient';
    }
    
    console.log(`Updated texture gradient ${property} for ${materialName} to ${value}`);
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
        z: 0.005 // Middle Z position for logos
      },
      rotation: 0,
      roughness: 0.5, // Default roughness (0-1)
      metalness: 0.0  // Default metalness (0-1)
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
        z: 0.02 // Top Z position for text, increased separation from logos
      },
      rotation: 0,
      scale: [0.15, 0.04, 0.1],
      roughness: 0.5, // Default roughness (0-1)
      metalness: 0.0  // Default metalness (0-1)
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
          // Ensure position is an object with x, y, z properties
          if (!logo.position || typeof logo.position !== 'object') {
            logo.position = { x: 0, y: 0, z: 0 };
          } else if (Array.isArray(logo.position)) {
            // Convert from array to object if needed
            logo.position = {
              x: logo.position[0] || 0,
              y: logo.position[1] || 0,
              z: logo.position[2] || 0
            };
          }
          // Update only the x value, preserving y and z
          logo.position.x = value;
        } else if (property === 'positionY') {
          // Ensure position is an object with x, y, z properties
          if (!logo.position || typeof logo.position !== 'object') {
            logo.position = { x: 0, y: 0, z: 0 };
          } else if (Array.isArray(logo.position)) {
            // Convert from array to object if needed
            logo.position = {
              x: logo.position[0] || 0,
              y: logo.position[1] || 0,
              z: logo.position[2] || 0
            };
          }
          // Update only the y value, preserving x and z
          logo.position.y = value;
        } else if (property === 'positionZ') {
          // Ensure position is an object with x, y, z properties
          if (!logo.position || typeof logo.position !== 'object') {
            logo.position = { x: 0, y: 0, z: 0 };
          } else if (Array.isArray(logo.position)) {
            // Convert from array to object if needed
            logo.position = {
              x: logo.position[0] || 0,
              y: logo.position[1] || 0,
              z: logo.position[2] || 0
            };
          }
          // Update only the z value, preserving x and y
          logo.position.z = value;
        } else if (property === 'rotation') {
          // Store rotation as a single value instead of array
          logo.rotation = value;
        } else if (property === 'roughness') {
          // Ensure roughness is a valid number between 0 and 1
          const normalizedRoughness = Math.max(0, Math.min(1, parseFloat(value) || 0.5));
          logo.roughness = normalizedRoughness;
          console.log(`Updated logo roughness for ${materialName}, logo ID: ${logoId} to ${normalizedRoughness}`);
        } else if (property === 'metalness') {
          // Ensure metalness is a valid number between 0 and 1
          const normalizedMetalness = Math.max(0, Math.min(1, parseFloat(value) || 0));
          logo.metalness = normalizedMetalness;
          console.log(`Updated logo metalness for ${materialName}, logo ID: ${logoId} to ${normalizedMetalness}`);
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
          // Ensure position is an object with x, y, z properties
          if (!text.position || typeof text.position !== 'object') {
            text.position = { x: 0, y: 0, z: 0 };
          } else if (Array.isArray(text.position)) {
            // Convert from array to object if needed
            text.position = {
              x: text.position[0] || 0,
              y: text.position[1] || 0,
              z: text.position[2] || 0
            };
          }
          // Update only the x value, preserving y and z
          text.position.x = value;
        } else if (property === 'positionY') {
          // Ensure position is an object with x, y, z properties
          if (!text.position || typeof text.position !== 'object') {
            text.position = { x: 0, y: 0, z: 0 };
          } else if (Array.isArray(text.position)) {
            // Convert from array to object if needed
            text.position = {
              x: text.position[0] || 0,
              y: text.position[1] || 0,
              z: text.position[2] || 0
            };
          }
          // Update only the y value, preserving x and z
          text.position.y = value;
        } else if (property === 'positionZ') {
          // Ensure position is an object with x, y, z properties
          if (!text.position || typeof text.position !== 'object') {
            text.position = { x: 0, y: 0, z: 0 };
          } else if (Array.isArray(text.position)) {
            // Convert from array to object if needed
            text.position = {
              x: text.position[0] || 0,
              y: text.position[1] || 0,
              z: text.position[2] || 0
            };
          }
          // Update only the z value, preserving x and y
          text.position.z = value;
        } else if (property === 'rotation') {
          // Store rotation as a single value instead of array
          text.rotation = value;
        } else if (property === 'roughness') {
          // Ensure roughness is a valid number between 0 and 1
          const normalizedRoughness = Math.max(0, Math.min(1, parseFloat(value) || 0.5));
          text.roughness = normalizedRoughness;
          console.log(`Updated text roughness for ${materialName}, text ID: ${textId} to ${normalizedRoughness}`);
        } else if (property === 'metalness') {
          // Ensure metalness is a valid number between 0 and 1
          const normalizedMetalness = Math.max(0, Math.min(1, parseFloat(value) || 0));
          text.metalness = normalizedMetalness;
          console.log(`Updated text metalness for ${materialName}, text ID: ${textId} to ${normalizedMetalness}`);
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
  logoPositionZ: 0,
});

export default state;
