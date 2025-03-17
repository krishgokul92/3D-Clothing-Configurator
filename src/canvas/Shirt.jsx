import React, { useEffect, useState, useRef, useMemo } from 'react'
import * as THREE from 'three';
import { easing } from 'maath';
import { useSnapshot } from 'valtio';
import { useFrame, useThree } from '@react-three/fiber';
import { Decal, useGLTF, useTexture, OrbitControls } from '@react-three/drei';
import { TextureLoader, sRGBEncoding, RepeatWrapping, LinearFilter, CanvasTexture } from 'three';

import state from '../store';

const Shirt = () => {
  const snap = useSnapshot(state);
  const { scene, nodes, materials } = useGLTF(`/${snap.currentModel}`);
  const [meshes, setMeshes] = useState([]);
  const materialsRef = useRef({});
  const materialLogos = useRef({});
  const textTexturesRef = useRef({});
  const gradientTexturesRef = useRef({});
  const textureTexturesRef = useRef({}); // For pattern textures
  const [forceUpdate, setForceUpdate] = useState(0);

  const logoTexture = useTexture(snap.frontLogoDecal);
  const fullTexture = useTexture(snap.fullDecal);
  const backLogoTexture = useTexture(snap.backLogoDecal);

  // Create a texture from text content
  const createTextTexture = (textConfig) => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Get font size with a default if not provided
      const fontSize = textConfig.size || 64;
      
      // Set canvas size based on text size
      canvas.width = fontSize * 10;
      canvas.height = fontSize * 3;
      
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set text properties
      context.font = `${fontSize}px ${textConfig.font}`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = textConfig.color;
      
      // Draw text
      context.fillText(textConfig.content, canvas.width / 2, canvas.height / 2);
      
      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      return texture;
    } catch (error) {
      console.error("Error creating text texture:", error);
      return null;
    }
  };
  
  // Create a gradient texture
  const createGradientTexture = (gradientConfig) => {
    try {
    const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = 512;
      canvas.height = 512;
      
      // Create gradient
      let gradient;
      
      if (gradientConfig.type === 'linear') {
        // Calculate start and end points based on angle
        const angle = gradientConfig.angle * (Math.PI / 180);
        const x1 = 256 + Math.cos(angle) * 256;
        const y1 = 256 + Math.sin(angle) * 256;
        const x2 = 256 - Math.cos(angle) * 256;
        const y2 = 256 - Math.sin(angle) * 256;
        
        gradient = context.createLinearGradient(x1, y1, x2, y2);
      } else {
        // Radial gradient
        gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
      }
      
      gradient.addColorStop(0, gradientConfig.color1);
      gradient.addColorStop(1, gradientConfig.color2);
      
      // Fill canvas with gradient
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      return texture;
    } catch (error) {
      console.error("Error creating gradient texture:", error);
      return null;
    }
  };

  // Load and configure a pattern texture
  const loadPatternTexture = (texturePath, scale) => {
    try {
      const textureLoader = new THREE.TextureLoader();
      
      // Ensure the path is properly formatted
      const fullPath = texturePath.startsWith('/') ? texturePath : `/pattern/${texturePath}`;
      
      console.log(`Loading texture from path: ${fullPath} with scale: ${scale}`);
      
      return new Promise((resolve, reject) => {
        textureLoader.load(
          fullPath,
          (texture) => {
            try {
              // Configure the texture
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              
              // Ensure scale is a valid number
              const textureScale = typeof scale === 'number' && !isNaN(scale) 
                ? scale 
                : 1.0;
                
              texture.repeat.set(textureScale, textureScale);
              
              // Apply additional settings for better quality
              texture.anisotropy = 16; // Improve texture quality
              texture.encoding = THREE.sRGBEncoding; // Ensure proper color encoding
              texture.premultiplyAlpha = true; // Handle alpha correctly
              texture.needsUpdate = true; // Ensure texture updates
              
              // Store the texture path for identification
              texture.userData = { path: fullPath };
              
              console.log(`Pattern texture loaded successfully from: ${fullPath} with scale: ${textureScale}`);
              resolve(texture);
            } catch (configError) {
              console.error(`Error configuring texture from ${fullPath}:`, configError);
              reject(configError);
            }
          },
          undefined, // onProgress callback
          (error) => {
            console.error(`Error loading pattern texture from ${fullPath}:`, error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error("Error in loadPatternTexture:", error);
      return Promise.reject(error);
    }
  };
  
  // Helper function to create and apply a texture material
  const createAndApplyTextureMaterial = (node, materialName, texture, textureSettings) => {
    // Create a new material that will be used for the texture overlay
    let textureMaterial;
    
    // Initialize userData object
    const userData = {
      isGradient: textureSettings.colorType === 'gradient'
    };
    
    // Apply scale and rotation to texture
    if (texture) {
      // Apply scale
      if (typeof textureSettings.scale === 'number' && !isNaN(textureSettings.scale)) {
        texture.repeat.set(textureSettings.scale, textureSettings.scale);
      }
      
      // Apply rotation
      if (typeof textureSettings.rotation === 'number' && !isNaN(textureSettings.rotation)) {
        const rotationRadians = textureSettings.rotation * (Math.PI / 180);
        texture.rotation = rotationRadians;
      }
      
      // Ensure texture updates
      texture.needsUpdate = true;
    }
    
    // Check if we need to create a gradient-enabled material
    if (textureSettings.colorType === 'gradient' && textureSettings.gradient) {
      // Create gradient texture for color tint
      const gradientTexture = createGradientTexture(textureSettings.gradient);
      
      // Store the gradient texture for future reference
      userData.gradientMap = gradientTexture;
      
      // Create a custom shader material that combines pattern texture with gradient
      textureMaterial = new THREE.ShaderMaterial({
        uniforms: {
          patternTexture: { value: texture },
          gradientTexture: { value: gradientTexture },
          opacity: { value: textureSettings.opacity },
          scale: { value: textureSettings.scale || 1.0 },
          rotation: { value: (textureSettings.rotation || 0) * (Math.PI / 180) },
          roughness: { value: textureSettings.roughness !== undefined ? textureSettings.roughness : 0.5 },
          metalness: { value: textureSettings.metalness !== undefined ? textureSettings.metalness : 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          uniform float scale;
          uniform float rotation;
          
          vec2 rotateUV(vec2 uv, float rotation) {
            float mid = 0.5;
            return vec2(
              cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
              cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
            );
          }
          
          void main() {
            // Apply scale and rotation to UVs
            vec2 transformedUV = uv;
            
            // Apply scale (from center)
            transformedUV = (transformedUV - 0.5) * scale + 0.5;
            
            // Apply rotation
            transformedUV = rotateUV(transformedUV, rotation);
            
            vUv = transformedUV;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D patternTexture;
          uniform sampler2D gradientTexture;
          uniform float opacity;
          uniform float roughness;
          uniform float metalness;
          
          varying vec2 vUv;
          
          void main() {
            // Sample the pattern texture
            vec4 patternColor = texture2D(patternTexture, vUv);
            
            // Sample the gradient texture
            vec4 gradientColor = texture2D(gradientTexture, vUv);
            
            // Multiply the pattern with the gradient
            vec4 finalColor = patternColor * gradientColor;
            
            // Apply roughness and metalness effects
            // Roughness affects the brightness - higher roughness = more diffuse/matte look
            finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * (1.0 - roughness * 0.5), roughness);
            
            // Metalness adds a specular highlight effect - higher metalness = more reflective
            finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * (1.0 + metalness * 0.5), metalness);
            
            // Apply opacity
            finalColor.a *= opacity;
            
            // Output the final color
            gl_FragColor = finalColor;
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: true
      });
      
      // Set polygon offset to ensure it renders behind other elements
      textureMaterial.polygonOffset = true;
      textureMaterial.polygonOffsetFactor = -10;
      textureMaterial.polygonOffsetUnits = -10;
      
      // Set render order to ensure it renders before other elements
      textureMaterial.renderOrder = -10;
      
      // Store roughness and metalness in userData for reference
      userData.roughness = textureSettings.roughness !== undefined ? textureSettings.roughness : 0.5;
      userData.metalness = textureSettings.metalness !== undefined ? textureSettings.metalness : 0.0;
      
      console.log(`Applied gradient color tint to texture for ${materialName}`, textureSettings.gradient);
    } else {
      // Create a standard material for solid color tint
      textureMaterial = new THREE.MeshPhysicalMaterial({
        map: texture,
        transparent: true,
        opacity: textureSettings.opacity,
        alphaTest: 0.1, // Discard pixels with alpha below this threshold
        blending: THREE.CustomBlending, // Use custom blending for better alpha handling
        blendSrc: THREE.SrcAlphaFactor, // Use the alpha of the source
        blendDst: THREE.OneMinusSrcAlphaFactor, // Use one minus the alpha of the source
        blendEquation: THREE.AddEquation, // Add the source and destination
        depthWrite: false, // Don't write to depth buffer for transparent objects
        depthTest: true, // But still test against depth buffer
        side: THREE.DoubleSide,
        polygonOffset: true,     // Enable polygon offset
        polygonOffsetFactor: -10, // Move the pattern significantly back in Z (increased from -1)
        polygonOffsetUnits: -10,   // Move the pattern significantly back in Z (increased from -1)
        roughness: textureSettings.roughness !== undefined ? textureSettings.roughness : 0.5,
        metalness: textureSettings.metalness !== undefined ? textureSettings.metalness : 0.0
      });
      
      // Set renderOrder to ensure it renders before other elements
      textureMaterial.renderOrder = -10;
      
      // Apply solid color tint
      if (textureSettings.color && textureSettings.color.toLowerCase() !== '#ffffff') {
        // Apply the solid color tint
        textureMaterial.color = new THREE.Color(textureSettings.color);
        console.log(`Applied solid color tint ${textureSettings.color} to texture for ${materialName}`);
      } else {
        // Use default white color (no tint)
        textureMaterial.color = new THREE.Color('#ffffff');
        console.log(`Using default color (no tint) for texture on ${materialName}`);
      }
      
      // Ensure the texture is set and updated
      if (texture) {
        textureMaterial.map = texture;
        textureMaterial.map.needsUpdate = true;
      }
    }
    
    // Force material update
    textureMaterial.needsUpdate = true;
    
    // Store the texture material
    if (!node.userData) node.userData = {};
    textureMaterial.userData = userData;
    node.userData.textureMaterial = textureMaterial;
    node.userData.hasTextureOverlay = true;
    
    // Store the original material if not already stored
    if (!node.userData.originalMaterial) {
      node.userData.originalMaterial = node.material;
    }
    
    // Log the texture material properties for debugging
    console.log(`Applied texture material to ${materialName}:`, {
      texture: textureSettings.texture,
      opacity: textureSettings.opacity,
      scale: textureSettings.scale,
      colorType: textureSettings.colorType,
      color: textureSettings.colorType === 'solid' ? textureSettings.color : 'gradient',
      gradient: textureSettings.colorType === 'gradient' ? textureSettings.gradient : null,
      roughness: textureSettings.roughness,
      metalness: textureSettings.metalness,
      rotation: textureSettings.rotation || 0
    });
  };
  
  // Load material-specific logos when they change
  useEffect(() => {
    console.log("Material decorations changed:", snap.materialDecorations);
    
    if (snap.materialDecorations) {
      Object.entries(snap.materialDecorations).forEach(([materialName, decorations]) => {
        // Initialize objects for this material if they don't exist
        if (!materialLogos.current[materialName]) {
          materialLogos.current[materialName] = {};
        }
        if (!textTexturesRef.current[materialName]) {
          textTexturesRef.current[materialName] = {};
        }
        
        // Load logos for this material
        if (decorations.logos && decorations.logos.length > 0) {
          decorations.logos.forEach((logo) => {
            if (logo.image) {
              console.log(`Loading logo for ${materialName}, logo ID: ${logo.id}, image: ${logo.image}`);
              
              // Only load if not already loaded or if image has changed
              if (!materialLogos.current[materialName][logo.id]) {
                const loader = new THREE.TextureLoader();
                loader.load(logo.image, (texture) => {
                  console.log(`Logo texture loaded for ${materialName}, logo ID: ${logo.id}`);
                  materialLogos.current[materialName][logo.id] = texture;
                  // Force a re-render to show the loaded texture
                  setForceUpdate(prev => prev + 1);
                }, 
                undefined, // onProgress callback
                (error) => {
                  console.error(`Error loading logo texture for ${materialName}, logo ID: ${logo.id}:`, error);
                });
              }
            }
          });
        }
        
        // Create textures for text elements
        if (decorations.texts && decorations.texts.length > 0) {
          decorations.texts.forEach((text) => {
            if (text.content && text.visible) {
              // Create or update the texture
              textTexturesRef.current[materialName][text.id] = createTextTexture(text);
            }
          });
        }
      });
    }
  }, [snap.materialDecorations]);

  // Update materials when they change
  useEffect(() => {
    console.log("Material properties changed, updating materials...");
    
    meshes.forEach((node) => {
      const materialName = node.material.name;
      
      // Check if this material uses a gradient
      if (snap.materialTypes && 
          snap.materialTypes[materialName] && 
          snap.materialTypes[materialName].type === 'gradient') {
        
        console.log(`Applying gradient to ${materialName}`);
        
        // Create or update gradient texture
        if (!gradientTexturesRef.current) {
          gradientTexturesRef.current = {};
        }
        
        // Create new gradient texture
        const gradientTexture = createGradientTexture(snap.materialTypes[materialName].gradient);
        gradientTexturesRef.current[materialName] = gradientTexture;
        
        // Apply gradient texture to material
        if (gradientTexture) {
          // Ensure any previous map is disposed to prevent memory leaks
          if (node.material.map && node.material.map !== gradientTexture) {
            node.material.map.dispose();
          }
          
          node.material.map = gradientTexture;
          // Reset material color to white to prevent blending with the gradient texture
          node.material.color.set('#ffffff');
          node.material.needsUpdate = true;
        }
      } else if (snap.materials[materialName]) {
        console.log(`Applying solid color to ${materialName}: ${snap.materials[materialName]}`);
        
        try {
        // Remove any existing texture map if switching from gradient to solid
        if (node.material.map) {
          node.material.map.dispose();
          node.material.map = null;
        }
        
        // Only set color directly for solid materials or if material type is not yet defined
          if (!snap.materialTypes || !snap.materialTypes[materialName] || snap.materialTypes[materialName].type === 'solid') {
            // Ensure the color is a valid hex string
            const colorValue = snap.materials[materialName];
            if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
              node.material.color.set(colorValue);
            } else {
              console.warn(`Invalid color value for ${materialName}: ${colorValue}, using default`);
              node.material.color.set('#ffffff');
            }
        }
        node.material.needsUpdate = true;
        } catch (error) {
          console.error(`Error applying solid color to ${materialName}:`, error);
        }
      }
      
      // Apply pattern texture if enabled
      applyPatternTexture(node, materialName);
    });
  }, [meshes, snap.materials, snap.materialTypes, snap.materialTextures]);

  // Initialize materials and textures when model loads
  useEffect(() => {
    if (scene) {
      const foundMeshes = [];
      const materialNames = new Set();
      
      console.log("Scanning model for materials...");
      
      scene.traverse((node) => {
        if (node.isMesh && node.material) {
          foundMeshes.push(node);
          
          // Log material name
          const materialName = node.material.name;
          materialNames.add(materialName);
          
          // Store the original material
          if (!materialsRef.current[materialName]) {
            materialsRef.current[materialName] = node.material.clone();
            
            // Initialize material in state if not already there
            if (!snap.materials[materialName]) {
              state.materials[materialName] = '#' + node.material.color.getHexString();
            }
            
            // Initialize material type if not already there
            if (!snap.materialTypes || !snap.materialTypes[materialName]) {
              state.initMaterialType(materialName);
            }
            
            // Ensure material type is properly initialized
            if (snap.materialTypes && !snap.materialTypes[materialName]) {
              snap.materialTypes[materialName] = {
                type: 'solid',
                solidColor: snap.materials[materialName] || '#ffffff',
                gradient: {
                  color1: '#3498db',
                  color2: '#e74c3c',
                  type: 'linear',
                  angle: 45
                }
              };
            }
            
            // Initialize material texture settings if not already there
            if (!snap.materialTextures || !snap.materialTextures[materialName]) {
              state.initMaterialTexture(materialName);
            }
            
            // Initialize material decorations if not already there
            if (!snap.materialDecorations[materialName]) {
              state.initMaterialDecorations(materialName);
            }
          }
          
          // Apply current color from state or gradient if applicable
          if (snap.materialTypes && 
              snap.materialTypes[materialName] && 
              snap.materialTypes[materialName].type === 'gradient') {
            
            // Create and apply gradient texture
            const gradientTexture = createGradientTexture(snap.materialTypes[materialName].gradient);
            if (gradientTexture) {
              node.material.map = gradientTexture;
              node.material.color.set('#ffffff'); // Reset color to white for gradient
              node.material.needsUpdate = true;
            }
          } else if (snap.materials[materialName]) {
            // Remove any existing texture map if switching from gradient to solid
            if (node.material.map) {
              node.material.map = null;
            }
            
            // Only set color directly for solid materials or if material type is not yet defined
            if (!snap.materialTypes[materialName] || snap.materialTypes[materialName].type === 'solid') {
              node.material.color.set(snap.materials[materialName]);
            }
            node.material.needsUpdate = true;
          }
          
          // Apply pattern texture if enabled
          applyPatternTexture(node, materialName);
        }
      });
      
      console.log("Available materials:", Array.from(materialNames));
      
      setMeshes(foundMeshes);
      
      // Set first material as active if none is selected
      if (!snap.activeMaterial && foundMeshes.length > 0) {
        const firstMaterialName = foundMeshes[0].material.name;
        state.activeMaterial = firstMaterialName;
        
        // Initialize material decorations if not already there
        if (!snap.materialDecorations[firstMaterialName]) {
          state.initMaterialDecorations(firstMaterialName);
        }
      }
    }
  }, [scene]);

  // Update material colors in real-time
  useFrame((state, delta) => {
    if (meshes.length > 0) {
      meshes.forEach((node) => {
        if (node.material) {
          const materialName = node.material.name;
          
          // Only apply color easing to solid materials, not to materials with gradients
          if (snap.materials[materialName] && 
              snap.materialTypes && 
              snap.materialTypes[materialName] && 
              snap.materialTypes[materialName].type === 'solid') {
            
            try {
            // Get the target color from the materials state
            const targetColor = snap.materials[materialName];
            
            // Apply smooth color transition
            easing.dampC(
              node.material.color,
              targetColor,
              0.25,
              delta
            );
            } catch (error) {
              console.error(`Error updating color for ${materialName}:`, error);
              
              // Fallback: directly set the color without easing
              try {
                node.material.color.set(snap.materials[materialName]);
                node.material.needsUpdate = true;
              } catch (fallbackError) {
                console.error(`Fallback color update also failed:`, fallbackError);
              }
            }
          }
        }
      });
    }
  });

  // Apply textures when texture settings change
  useEffect(() => {
    if (!meshes || meshes.length === 0 || !snap.materialTextures) {
      return;
    }
    
    console.log("Texture settings changed, updating textures...");
    
    // Force update to ensure re-render after texture changes
    const updatePromises = [];
    
    meshes.forEach((node) => {
      try {
        if (!node || !node.material || !node.material.name) {
          console.warn("Invalid mesh node or missing material name:", node);
          return;
        }
        
        const materialName = node.material.name;
        if (snap.materialTextures && snap.materialTextures[materialName]) {
          const textureSettings = snap.materialTextures[materialName];
          console.log(`Updating texture for ${materialName}:`, textureSettings);
          
          // Apply or update the texture
          const result = applyPatternTexture(node, materialName);
          if (result instanceof Promise) {
            updatePromises.push(result);
          }
        }
      } catch (error) {
        console.error("Error applying texture to mesh:", error);
      }
    });
    
    // If there are any promises, wait for them to complete and then force update
    if (updatePromises.length > 0) {
      Promise.all(updatePromises)
        .then(() => {
          console.log("All texture updates completed, forcing re-render");
          setForceUpdate(prev => prev + 1);
        })
        .catch(error => {
          console.error("Error updating textures:", error);
        });
    } else {
      // Force update anyway to ensure UI reflects changes
      setForceUpdate(prev => prev + 1);
    }
  }, [meshes, snap.materialTextures]);
  
  // Use a separate effect to track when specific texture properties change
  useEffect(() => {
    // This effect doesn't need to do anything, it just forces a re-render
    // when the stringified materialTextures changes
    console.log("Texture properties changed");
    setForceUpdate(prev => prev + 1);
  }, [JSON.stringify(snap.materialTextures)]);

  // Apply pattern texture to a material
  const applyPatternTexture = (node, materialName) => {
    try {
      if (!snap.materialTextures || !snap.materialTextures[materialName]) {
        return;
      }
      
      const textureSettings = snap.materialTextures[materialName];
      
      // Skip if texture is not visible
      if (!textureSettings.visible) {
        // Remove texture material if it exists
        if (node.userData.textureMaterial) {
          node.material = node.userData.originalMaterial;
          delete node.userData.textureMaterial;
        }
        return;
      }
      
      // Check if we already have a texture loaded for this material
      const existingTexture = textureTexturesRef.current[materialName];
      const currentTexturePath = existingTexture?.userData?.path;
      const newTexturePath = `/pattern/${textureSettings.texture}`;
      
      // Check if we need to load a new texture or update an existing one
      if (!existingTexture || currentTexturePath !== newTexturePath) {
        console.log(`Loading new texture for ${materialName}: ${textureSettings.texture}`);
        
        // Load the texture
        return loadPatternTexture(textureSettings.texture).then(texture => {
          // Apply the texture to the material
          createAndApplyTextureMaterial(node, materialName, texture, textureSettings);
        }).catch(error => {
          console.error(`Error loading texture for ${materialName}:`, error);
        });
      } else {
        console.log(`Updating existing texture for ${materialName}`);
        
        // Update texture properties
        if (existingTexture) {
          // Update scale
          if (typeof textureSettings.scale === 'number' && !isNaN(textureSettings.scale)) {
            existingTexture.repeat.set(textureSettings.scale, textureSettings.scale);
            existingTexture.needsUpdate = true;
            console.log(`Updated texture scale for ${materialName} to ${textureSettings.scale}`);
          }
          
          // Update rotation
          if (typeof textureSettings.rotation === 'number' && !isNaN(textureSettings.rotation)) {
            // Convert degrees to radians
            const rotationRadians = textureSettings.rotation * (Math.PI / 180);
            existingTexture.rotation = rotationRadians;
            existingTexture.needsUpdate = true;
            console.log(`Updated texture rotation for ${materialName} to ${textureSettings.rotation}°`);
          }
        }
        
        // Check if the material exists and update its properties
        if (node.userData.textureMaterial) {
          // Update roughness and metalness based on material type
          if (node.userData.textureMaterial instanceof THREE.ShaderMaterial) {
            // For gradient materials, update the uniforms
            if (node.userData.textureMaterial.uniforms) {
              // Update scale in shader uniform
              if (typeof textureSettings.scale === 'number' && !isNaN(textureSettings.scale)) {
                node.userData.textureMaterial.uniforms.scale.value = textureSettings.scale;
                console.log(`Updated shader texture scale for ${materialName} to ${textureSettings.scale}`);
              }
              
              // Update rotation in shader uniform
              if (typeof textureSettings.rotation === 'number' && !isNaN(textureSettings.rotation)) {
                const rotationRadians = textureSettings.rotation * (Math.PI / 180);
                node.userData.textureMaterial.uniforms.rotation.value = rotationRadians;
                console.log(`Updated shader texture rotation for ${materialName} to ${textureSettings.rotation}° (${rotationRadians} radians)`);
              }
              
              // Update roughness
              if (typeof textureSettings.roughness === 'number' && !isNaN(textureSettings.roughness)) {
                node.userData.textureMaterial.uniforms.roughness.value = textureSettings.roughness;
                console.log(`Updated shader texture roughness for ${materialName} to ${textureSettings.roughness}`);
              }
              
              // Update metalness
              if (typeof textureSettings.metalness === 'number' && !isNaN(textureSettings.metalness)) {
                node.userData.textureMaterial.uniforms.metalness.value = textureSettings.metalness;
                console.log(`Updated shader texture metalness for ${materialName} to ${textureSettings.metalness}`);
              }
              
              // Force material update
              node.userData.textureMaterial.needsUpdate = true;
            }
          } else {
            // For solid color materials, update the properties directly
            // Scale and rotation are already updated on the texture above
            
            // Update roughness and metalness
            if (typeof textureSettings.roughness === 'number' && !isNaN(textureSettings.roughness)) {
              node.userData.textureMaterial.roughness = textureSettings.roughness;
              console.log(`Updated texture roughness for ${materialName} to ${textureSettings.roughness}`);
            }
            
            if (typeof textureSettings.metalness === 'number' && !isNaN(textureSettings.metalness)) {
              node.userData.textureMaterial.metalness = textureSettings.metalness;
              console.log(`Updated texture metalness for ${materialName} to ${textureSettings.metalness}`);
            }
            
            // Force material update
            node.userData.textureMaterial.needsUpdate = true;
            
            // Make sure the texture's needsUpdate flag is set
            if (node.userData.textureMaterial.map) {
              node.userData.textureMaterial.map.needsUpdate = true;
            }
          }
          
          // Update opacity
          if (typeof textureSettings.opacity === 'number' && !isNaN(textureSettings.opacity)) {
            if (node.userData.textureMaterial instanceof THREE.ShaderMaterial) {
              if (node.userData.textureMaterial.uniforms) {
                node.userData.textureMaterial.uniforms.opacity.value = textureSettings.opacity;
              }
            } else {
              node.userData.textureMaterial.opacity = textureSettings.opacity;
            }
            console.log(`Updated texture opacity for ${materialName} to ${textureSettings.opacity}`);
          }
          
          // Force a re-render
          setForceUpdate(prev => prev + 1);
        } else {
          // No texture material exists yet, create one
          createAndApplyTextureMaterial(node, materialName, existingTexture, textureSettings);
        }
      }
    } catch (error) {
      console.error(`Error in applyPatternTexture for ${materialName}:`, error);
    }
  };

  if (meshes.length === 0) return null;

  return (
    <>
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={1}
        maxDistance={10}
      />
      {meshes.map((node, index) => {
        const materialName = node.material.name;
        const hasTextureOverlay = node.userData && 
                                 node.userData.textureMaterial && 
                                 node.userData.hasTextureOverlay &&
                                 snap.materialTextures && 
                                 snap.materialTextures[materialName] && 
                                 snap.materialTextures[materialName].visible;
        
        return (
          <group key={`${index}-${forceUpdate}`}>
            {/* Render the base mesh with its material */}
            <mesh
              castShadow
              geometry={node.geometry}
              material={node.material}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
              renderOrder={0} // Base mesh renders at order 0
            >
              {/* Global decorations */}
              {node.material.name === 'lambert1' && (
                <>
          {snap.isFullTexture && (
            <Decal
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              scale={1}
              map={fullTexture}
              renderOrder={-1} // Full texture renders below everything
              metalness={snap.fullTextureMetalness !== undefined ? snap.fullTextureMetalness : 0.0}
              roughness={snap.fullTextureRoughness !== undefined ? snap.fullTextureRoughness : 0.5}
            />
          )}

          {snap.isFrontLogoTexture && (
              <Decal
                position={snap.frontLogoPosition}
                rotation={[0, 0, 0]}
                scale={snap.frontLogoScale}
                map={logoTexture}
                renderOrder={1} // Logo renders above base mesh
                metalness={snap.frontLogoMetalness !== undefined ? snap.frontLogoMetalness : 0.0}
                roughness={snap.frontLogoRoughness !== undefined ? snap.frontLogoRoughness : 0.5}
              />
          )}
                  
          {snap.isFrontText && (
          <Decal
            position={snap.frontTextPosition}
            rotation={snap.frontTextRotation}
            scale={snap.frontTextScale}
            map={createTextTexture({
              content: snap.frontText,
              font: snap.frontTextFont,
              size: snap.frontTextSize,
              color: snap.frontTextColor
            })}
            renderOrder={2} // Text renders above logo
            metalness={snap.frontTextMetalness !== undefined ? snap.frontTextMetalness : 0.0}
            roughness={snap.frontTextRoughness !== undefined ? snap.frontTextRoughness : 0.5}
          />
          )}

          {snap.isBackLogoTexture && (
            <Decal
              position={snap.backLogoPosition}
              rotation={snap.backLogoRotation}
              scale={snap.backLogoScale}
              map={backLogoTexture}
              renderOrder={1} // Logo renders above base mesh
              metalness={snap.backLogoMetalness !== undefined ? snap.backLogoMetalness : 0.0}
              roughness={snap.backLogoRoughness !== undefined ? snap.backLogoRoughness : 0.5}
            />
          )}
                  
          {snap.isBackText && (
            <Decal
              position={snap.backTextPosition}
              rotation={snap.backTextRotation}
              scale={snap.backTextScale}
              map={createTextTexture({
                content: snap.backText,
                font: snap.backTextFont,
                size: snap.backTextSize,
                color: snap.backTextColor
              })}
              metalness={snap.backTextMetalness !== undefined ? snap.backTextMetalness : 0.0}
              roughness={snap.backTextRoughness !== undefined ? snap.backTextRoughness : 0.5}
            />
          )}
                </>
              )}
              
              {/* Material-specific decorations */}
              {(() => {
                const materialName = node.material.name;
                const materialDecor = snap.materialDecorations[materialName];
                
                if (!materialDecor) return null;
                
                return (
                  <>
                    {/* Render texture overlay if enabled - MOVED TO RENDER FIRST */}
                    {hasTextureOverlay && (
                      <mesh
                        geometry={node.geometry}
                        material={node.userData.textureMaterial}
                        position={node.position}
                        rotation={node.rotation}
                        scale={node.scale}
                        renderOrder={-1} // Negative render order to ensure it renders before everything else
                        userData={{ isTextureOverlay: true }}
                      >
                        {/* This empty fragment ensures the mesh is properly updated when texture properties change */}
                        <></>
                      </mesh>
                    )}

                    {/* Render logos for this material */}
                    {materialDecor.logos && materialDecor.logos.map((logo, index) => {
                      // Skip if logo is disabled or has no image
                      if (!logo.visible || !logo.image) {
                        return null;
                      }
                      
                      // Skip if texture isn't loaded yet
                      if (!materialLogos.current[materialName] || 
                          !materialLogos.current[materialName][logo.id]) {
                        return null;
                      }
                      
                      // Calculate position with a small z-index offset based on index to prevent z-fighting
                      const position = [
                        typeof logo.position.x === 'number' ? logo.position.x : 0,
                        typeof logo.position.y === 'number' ? logo.position.y : 0,
                        typeof logo.position.z === 'number' ? logo.position.z + (index * 0.005) : 0.005 + (index * 0.005)
                      ];
                      
                      return (
                        <Decal
                          key={`logo-${materialName}-${logo.id}-${forceUpdate}`}
                          position={position}
                          rotation={[0, 0, typeof logo.rotation === 'number' ? logo.rotation * (Math.PI / 180) : 0]}
                          scale={typeof logo.scale === 'number' ? logo.scale : 0.15}
                          map={materialLogos.current[materialName][logo.id]}
                          // Add depth test and depth write for better z handling
                          depthTest={true}
                          depthWrite={false}
                          polygonOffset={true}
                          polygonOffsetFactor={-5}
                          polygonOffsetUnits={-5}
                          renderOrder={1} // Logos render after pattern
                          metalness={typeof logo.metalness === 'number' ? logo.metalness : 0.0}
                          roughness={typeof logo.roughness === 'number' ? logo.roughness : 0.5}
                        />
                      );
                    })}
                    
                    {/* Render texts for this material */}
                    {materialDecor.texts && materialDecor.texts.map((text, index) => {
                      if (!text.visible || !text.content) return null;
                      
                      // Create a new texture on the fly
                      const textTexture = createTextTexture(text);
                      if (!textTexture) return null;
                      
                      // Calculate position with a small z-index offset based on index to prevent z-fighting
                      const position = [
                        typeof text.position.x === 'number' ? text.position.x : 0,
                        typeof text.position.y === 'number' ? text.position.y : 0,
                        typeof text.position.z === 'number' ? text.position.z + (index * 0.005) : 0.01 + (index * 0.005)
                      ];
                      
                      return (
                        <Decal
                          key={`text-${materialName}-${text.id}-${forceUpdate}`}
                          position={position}
                          rotation={[0, 0, typeof text.rotation === 'number' ? text.rotation * (Math.PI / 180) : 0]}
                          scale={text.scale && Array.isArray(text.scale) ? text.scale : [0.15, 0.04, 0.1]}
                          map={textTexture}
                          // Add depth test and depth write for better z handling
                          depthTest={true}
                          depthWrite={false}
                          polygonOffset={true}
                          polygonOffsetFactor={-2}
                          polygonOffsetUnits={-2}
                          renderOrder={2} // Text renders last
                          metalness={typeof text.metalness === 'number' ? text.metalness : 0.0}
                          roughness={typeof text.roughness === 'number' ? text.roughness : 0.5}
                        />
                      );
                    })}
                  </>
                );
              })()}
            </mesh>
          </group>
        );
      })}
    </>
  );
};

export default Shirt;
