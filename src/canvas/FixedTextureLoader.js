import * as THREE from 'three';

/**
 * Loads a texture for a material with proper transparency handling
 * @param {string} texturePath - Path to the texture file
 * @param {number} scale - Scale factor for the texture
 * @param {number} opacity - Opacity value (0-1)
 * @returns {Promise<THREE.Material>} A promise that resolves to the configured material
 */
export const loadTextureWithTransparency = (texturePath, scale = 1, opacity = 0.8) => {
  return new Promise((resolve, reject) => {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(
      texturePath,
      (texture) => {
        // Configure the texture
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(scale, scale);
        texture.anisotropy = 16; // Improve texture quality
        
        // Fix texture bleeding by using nearest filtering instead of linear
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        
        // Disable mipmaps to prevent bleeding at edges
        texture.generateMipmaps = false;
        
        // Ensure proper handling of transparency
        texture.premultiplyAlpha = false;
        
        // Create a material for the texture layer
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: opacity,
          alphaTest: 0.2, // Increased to eliminate semi-transparent edges
          blending: THREE.MultiplyBlending,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        
        resolve(material);
      },
      undefined,
      (error) => {
        console.error(`Error loading texture ${texturePath}:`, error);
        reject(error);
      }
    );
  });
};

/**
 * Replace this function in your Shirt.jsx file:
 * 
 * // Load and configure texture for a material
 * const loadMaterialTexture = (materialName) => {
 *   if (!snap.materialTextures || !snap.materialTextures[materialName]) {
 *     console.log(`No texture settings found for ${materialName}`);
 *     return null;
 *   }
 *   
 *   const textureSettings = snap.materialTextures[materialName];
 *   if (!textureSettings.enabled) {
 *     console.log(`Texture disabled for ${materialName}`);
 *     return null;
 *   }
 *   
 *   console.log(`Loading texture for ${materialName}:`, textureSettings);
 *   
 *   try {
 *     // Use the utility function to load the texture with proper transparency
 *     return loadTextureWithTransparency(
 *       `/pattern/${textureSettings.texture}`,
 *       textureSettings.scale,
 *       textureSettings.opacity
 *     );
 *   } catch (error) {
 *     console.error("Error creating texture layer:", error);
 *     return null;
 *   }
 * };
 */ 