import * as THREE from 'three';

/**
 * Configures a texture for proper transparency handling and UV mapping
 * @param {THREE.Texture} texture - The texture to configure
 * @param {number} scale - Scale factor for the texture
 * @returns {THREE.Texture} The configured texture
 */
export const configureTexture = (texture, scale = 1) => {
  // Configure wrapping and repeating for proper UV mapping
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  
  // Ensure scale is a number and has a valid value
  const validScale = typeof scale === 'number' && !isNaN(scale) && scale > 0 ? scale : 1;
  console.log(`Configuring texture with scale: ${validScale}`);
  texture.repeat.set(validScale, validScale);
  
  // Set texture center for proper UV mapping
  texture.center.set(0.5, 0.5);
  
  texture.anisotropy = 16; // Improve texture quality
  
  // Fix texture bleeding by using nearest filtering instead of linear
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  
  // Disable mipmaps to prevent bleeding at edges
  texture.generateMipmaps = false;
  
  // Ensure proper handling of transparency
  texture.premultiplyAlpha = false; // Important for correct alpha handling
  texture.format = THREE.RGBAFormat; // Use RGBA format to include alpha channel
  
  // Use sRGB encoding for correct colors if available
  if (THREE.sRGBEncoding !== undefined) {
    texture.encoding = THREE.sRGBEncoding;
  }
  
  texture.needsUpdate = true;
  return texture;
};

/**
 * Creates a material for texture overlay with proper transparency and custom color
 * @param {THREE.Texture} texture - The texture to use
 * @param {number} opacity - Opacity value (0-1)
 * @param {string} color - Hex color to apply to the black pixels
 * @returns {THREE.Material} The configured material
 */
export const createTextureOverlayMaterial = (texture, opacity = 0.8, color = '#000000') => {
  // If no custom color is provided or it's black, use the simple multiply blending approach
  if (color === '#000000') {
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: opacity,
      alphaTest: 0.2, // Increased to eliminate semi-transparent edges
      blending: THREE.MultiplyBlending, // Use multiply blending for black pixels
      side: THREE.DoubleSide, // Ensure both sides are rendered
      depthWrite: false, // Prevent z-fighting with the base material
      depthTest: true
    });
  }
  
  // For custom colors, use a ShaderMaterial
  const colorObj = new THREE.Color(color);
  
  // Custom shader for coloring black pixels
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      opacity: { value: opacity },
      patternColor: { value: new THREE.Vector3(colorObj.r, colorObj.g, colorObj.b) }
    },
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv; // Use the mesh's UV coordinates directly
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform vec3 patternColor;
      varying vec2 vUv;
      
      void main() {
        vec4 texColor = texture2D(map, vUv);
        
        // Calculate how "black" the pixel is (closer to 0 means more black)
        float blackness = 1.0 - (texColor.r + texColor.g + texColor.b) / 3.0;
        
        // Only apply color to pixels that have some opacity and are dark
        if (texColor.a > 0.1 && blackness > 0.5) {
          // Mix between the pattern color and transparent based on the texture's alpha and blackness
          gl_FragColor = vec4(patternColor, texColor.a * opacity * blackness);
        } else {
          // For non-black or transparent pixels, keep them transparent
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      }
    `,
    transparent: true,
    side: THREE.DoubleSide, // Ensure both sides are rendered
    depthWrite: false,
    depthTest: true
  });
};

/**
 * Loads a texture from the pattern directory and configures it for overlay use with custom color
 * @param {string} texturePath - Path to the texture file
 * @param {number} scale - Scale factor for the texture
 * @param {number} opacity - Opacity value (0-1)
 * @param {string} color - Hex color to apply to the black pixels
 * @returns {Promise<THREE.Material>} A promise that resolves to the configured material
 */
export const loadTextureOverlay = (texturePath, scale = 1, opacity = 0.8, color = '#000000') => {
  return new Promise((resolve, reject) => {
    try {
      const textureLoader = new THREE.TextureLoader();
      
      // Ensure parameters have valid values
      const validScale = typeof scale === 'number' && !isNaN(scale) && scale > 0 ? scale : 1;
      const validOpacity = typeof opacity === 'number' && !isNaN(opacity) && opacity >= 0 && opacity <= 1 ? opacity : 0.8;
      const validColor = typeof color === 'string' && color.trim() !== '' ? color : '#000000';
      
      console.log(`Loading texture overlay with scale: ${validScale}, opacity: ${validOpacity}, color: ${validColor}`);
      
      // Set high priority for loading to ensure quick updates
      textureLoader.load(
        texturePath,
        (texture) => {
          try {
            // Configure the texture
            configureTexture(texture, validScale);
            
            // Create and return the material
            const material = createTextureOverlayMaterial(texture, validOpacity, validColor);
            resolve(material);
          } catch (innerError) {
            console.error(`Error configuring texture ${texturePath}:`, innerError);
            reject(innerError);
          }
        },
        undefined,
        (error) => {
          console.error(`Error loading texture ${texturePath}:`, error);
          reject(error);
        }
      );
    } catch (outerError) {
      console.error(`Error in loadTextureOverlay for ${texturePath}:`, outerError);
      reject(outerError);
    }
  });
};

/**
 * Creates a material that blends the texture with the base material using UV mapping
 * This approach ensures the texture is applied consistently across all parts of the model
 * @param {THREE.Material} baseMaterial - The base material to blend with
 * @param {THREE.Texture} texture - The texture to apply
 * @param {number} opacity - Opacity value (0-1)
 * @param {string} color - Hex color to apply to the black pixels
 * @returns {THREE.Material} The blended material
 */
export const createUVMappedTextureMaterial = (baseMaterial, texture, opacity = 0.8, color = '#000000') => {
  // Get the base color from the material
  const baseColor = new THREE.Color(baseMaterial.color);
  
  // Check if the base material has a map (for gradients)
  const hasBaseMap = baseMaterial.map !== null && baseMaterial.map !== undefined;
  
  // For custom colors, use a ShaderMaterial
  const colorObj = new THREE.Color(color);
  
  // Create a custom shader material that properly blends the texture with the base material
  const material = new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: baseColor },
      baseMap: { value: hasBaseMap ? baseMaterial.map : null },
      hasBaseMap: { value: hasBaseMap ? 1.0 : 0.0 },
      map: { value: texture },
      opacity: { value: opacity },
      patternColor: { value: new THREE.Vector3(colorObj.r, colorObj.g, colorObj.b) }
    },
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv; // Use the mesh's UV coordinates directly
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform sampler2D baseMap;
      uniform float hasBaseMap;
      uniform sampler2D map;
      uniform float opacity;
      uniform vec3 patternColor;
      varying vec2 vUv;
      
      void main() {
        // Get the pattern texture color
        vec4 texColor = texture2D(map, vUv);
        
        // Calculate how "black" the pixel is (closer to 0 means more black)
        float blackness = 1.0 - (texColor.r + texColor.g + texColor.b) / 3.0;
        
        // Get the base color (either from uniform or from texture)
        vec3 materialBaseColor = baseColor;
        if (hasBaseMap > 0.5) {
          vec4 baseMapColor = texture2D(baseMap, vUv);
          materialBaseColor = baseMapColor.rgb;
        }
        
        // Start with the base material color
        vec3 finalColor = materialBaseColor;
        float finalAlpha = 1.0;
        
        // Only apply pattern color to pixels that have some opacity and are dark
        if (texColor.a > 0.1 && blackness > 0.5) {
          // Blend the pattern color with the base color based on opacity
          finalColor = mix(materialBaseColor, patternColor, opacity * blackness);
        }
        
        gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `,
    side: THREE.DoubleSide, // Ensure both sides are rendered
    transparent: false, // We're replacing the base material, not overlaying
    depthWrite: true,
    depthTest: true
  });
  
  // Copy other relevant properties from the base material
  if (baseMaterial.map) {
    material.uniforms.baseMap.value = baseMaterial.map;
    material.uniforms.hasBaseMap.value = 1.0;
  }
  
  return material;
};

/**
 * Loads a texture and creates a UV-mapped material that blends with the base material
 * @param {THREE.Material} baseMaterial - The base material to blend with
 * @param {string} texturePath - Path to the texture file
 * @param {number} scale - Scale factor for the texture
 * @param {number} opacity - Opacity value (0-1)
 * @param {string} color - Hex color to apply to the black pixels
 * @returns {Promise<THREE.Material>} A promise that resolves to the blended material
 */
export const loadUVMappedTexture = (baseMaterial, texturePath, scale = 1, opacity = 0.8, color = '#000000') => {
  return new Promise((resolve, reject) => {
    try {
      const textureLoader = new THREE.TextureLoader();
      
      // Ensure parameters have valid values
      const validScale = typeof scale === 'number' && !isNaN(scale) && scale > 0 ? scale : 1;
      const validOpacity = typeof opacity === 'number' && !isNaN(opacity) && opacity >= 0 && opacity <= 1 ? opacity : 0.8;
      const validColor = typeof color === 'string' && color.trim() !== '' ? color : '#000000';
      
      console.log(`Loading UV-mapped texture with scale: ${validScale}, opacity: ${validOpacity}, color: ${validColor}`);
      
      // Use high priority loading
      textureLoader.load(
        texturePath,
        (texture) => {
          try {
            // Configure the texture
            configureTexture(texture, validScale);
            
            // Create and return the blended material
            const material = createUVMappedTextureMaterial(baseMaterial, texture, validOpacity, validColor);
            
            // Store the original parameters on the material for later updates
            material.userData = {
              texturePath,
              scale: validScale,
              opacity: validOpacity,
              color: validColor
            };
            
            resolve(material);
          } catch (innerError) {
            console.error(`Error configuring UV-mapped texture ${texturePath}:`, innerError);
            reject(innerError);
          }
        },
        undefined,
        (error) => {
          console.error(`Error loading texture ${texturePath}:`, error);
          reject(error);
        }
      );
    } catch (outerError) {
      console.error(`Error in loadUVMappedTexture for ${texturePath}:`, outerError);
      reject(outerError);
    }
  });
}; 