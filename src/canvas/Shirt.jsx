import React, { useEffect, useState, useRef, useMemo } from 'react'
import * as THREE from 'three';
import { easing } from 'maath';
import { useSnapshot } from 'valtio';
import { useFrame, useThree } from '@react-three/fiber';
import { Decal, useGLTF, useTexture, OrbitControls } from '@react-three/drei';
import { TextureLoader, sRGBEncoding, RepeatWrapping, LinearFilter, CanvasTexture } from 'three';

import state from '../store';
import { configureTexture, createTextureOverlayMaterial, loadTextureOverlay, loadUVMappedTexture } from './TextureUtils';

const Shirt = () => {
  const snap = useSnapshot(state);
  const { scene, nodes, materials } = useGLTF(`/${snap.currentModel}`);
  const [meshes, setMeshes] = useState([]);
  const materialsRef = useRef({});
  const materialLogos = useRef({});
  const textTexturesRef = useRef({});
  const gradientTexturesRef = useRef({});
  const textureLayersRef = useRef({});
  const [forceUpdate, setForceUpdate] = useState(0);

  const logoTexture = useTexture(snap.frontLogoDecal);
  const fullTexture = useTexture(snap.fullDecal);
  const backLogoTexture = useTexture(snap.backLogoDecal);

  // Create a texture from text content
  const createTextTexture = (textConfig) => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas size based on text size
      canvas.width = textConfig.size * 10;
      canvas.height = textConfig.size * 3;
      
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set text properties
      context.font = `${textConfig.size}px ${textConfig.font}`;
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
  
  // Preprocess texture to ensure proper transparency handling
  const preprocessTexture = (texture) => {
    // Configure the texture
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16; // Improve texture quality
    
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
  
  // Load and configure texture for a material
  const loadMaterialTexture = (materialName) => {
    if (!snap.materialTextures || !snap.materialTextures[materialName]) {
      console.log(`No texture settings found for ${materialName}`);
      return null;
    }
    
    const textureSettings = snap.materialTextures[materialName];
    if (!textureSettings.enabled) {
      console.log(`Texture disabled for ${materialName}`);
      return null;
    }
    
    console.log(`Loading texture for ${materialName}:`, textureSettings);
    
    try {
      // Find the base material for this material name
      const baseMaterial = materialsRef.current[materialName];
      if (!baseMaterial) {
        console.error(`Base material not found for ${materialName}`);
        return null;
      }
      
      // Check if we have a gradient for this material
      const hasGradient = snap.materialTypes && 
                         snap.materialTypes[materialName] && 
                         snap.materialTypes[materialName].type === 'gradient';
      
      // If we have a gradient, make sure it's applied to the base material
      if (hasGradient && !baseMaterial.map) {
        const gradientConfig = snap.materialTypes[materialName].gradient;
        const gradientTexture = createGradientTexture(gradientConfig);
        if (gradientTexture) {
          baseMaterial.map = gradientTexture;
          baseMaterial.needsUpdate = true;
        }
      }
      
      // Use the UV-mapped texture approach to blend with the base material
      return loadUVMappedTexture(
        baseMaterial,
        `/pattern/${textureSettings.texture}`,
        textureSettings.scale || 1, // Ensure scale has a default value
        textureSettings.opacity || 0.8, // Ensure opacity has a default value
        textureSettings.color || '#000000' // Use custom color or default to black
      );
    } catch (error) {
      console.error("Error creating texture layer:", error);
      return null;
    }
  };
  
  // Update textures when texture settings change
  useEffect(() => {
    console.log("Texture settings changed, updating textures...", snap.materialTextures);
    const updateTextures = async () => {
      try {
        // Clear existing texture layers if needed
        if (textureLayersRef.current) {
          // Keep track of which materials had textures before
          const previousMaterials = Object.keys(textureLayersRef.current);
          
          // For materials that no longer have enabled textures, remove them
          for (const materialName of previousMaterials) {
            if (!snap.materialTextures[materialName] || !snap.materialTextures[materialName].enabled) {
              delete textureLayersRef.current[materialName];
            }
          }
        }
        
        // Update or create new texture layers
        for (const materialName in snap.materialTextures) {
          if (snap.materialTextures[materialName].enabled) {
            try {
              // Always reload the texture when any property changes
              const textureMaterial = await loadMaterialTexture(materialName);
              if (textureMaterial) {
                if (!textureLayersRef.current) {
                  textureLayersRef.current = {};
                }
                textureLayersRef.current[materialName] = textureMaterial;
              }
            } catch (error) {
              console.error(`Failed to load texture for ${materialName}:`, error);
            }
          }
        }
        
        // Force a re-render to update the UI
        setForceUpdate(prev => prev + 1);
      } catch (error) {
        console.error("Error updating textures:", error);
      }
    };
    
    // Execute the update immediately
    updateTextures();
  }, [snap.materialTextures, snap.materials, snap.materialTypes]); // Also depend on material colors and types
  
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
            if (text.content && text.enabled) {
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
    meshes.forEach((node) => {
      const materialName = node.material.name;
      
      // Check if this material uses a gradient
      if (snap.materialTypes && 
          snap.materialTypes[materialName] && 
          snap.materialTypes[materialName].type === 'gradient') {
        
        // Create or update gradient texture
        if (!gradientTexturesRef.current) {
          gradientTexturesRef.current = {};
        }
        
        // Create new gradient texture
        const gradientTexture = createGradientTexture(snap.materialTypes[materialName].gradient);
        gradientTexturesRef.current[materialName] = gradientTexture;
        
        // Apply gradient texture to material
        if (gradientTexture) {
          node.material.map = gradientTexture;
          // Reset material color to white to prevent blending with the gradient texture
          node.material.color.set('#ffffff');
          node.material.needsUpdate = true;
        }
      } else {
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
      }
    });
  }, [meshes, snap.materials, snap.materialTypes]);

  // Find all meshes in the model
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
            
            // Initialize material decorations if not already there
            if (!snap.materialDecorations[materialName]) {
              state.initMaterialDecorations(materialName);
            }
            
            // Initialize material texture settings if not already there
            if (!snap.materialTextures || !snap.materialTextures[materialName]) {
              state.initMaterialTexture(materialName);
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
        
        // Initialize material type if not already there
        if (!snap.materialTypes || !snap.materialTypes[firstMaterialName]) {
          state.initMaterialType(firstMaterialName);
        }
        
        // Initialize material texture settings if not already there
        if (!snap.materialTextures || !snap.materialTextures[firstMaterialName]) {
          state.initMaterialTexture(firstMaterialName);
        }
      }
    }
  }, []);

  // Update material colors in real-time
  useFrame((state, delta) => {
    if (meshes.length > 0) {
      meshes.forEach((node) => {
        if (node.material) {
          const materialName = node.material.name;
          
          // Only apply color easing to solid materials, not to materials with gradients
          if (snap.materials[materialName] && 
              (!snap.materialTypes[materialName] || 
               snap.materialTypes[materialName].type === 'solid')) {
            
            easing.dampC(
              node.material.color,
              snap.materials[materialName],
              0.25,
              delta
            );
            
            // If this material has a texture layer with a shader, update its base color uniform
            if (textureLayersRef.current && 
                textureLayersRef.current[materialName] && 
                textureLayersRef.current[materialName].uniforms && 
                textureLayersRef.current[materialName].uniforms.baseColor) {
              
              // Smoothly update the base color in the shader
              easing.dampC(
                textureLayersRef.current[materialName].uniforms.baseColor.value,
                snap.materials[materialName],
                0.25,
                delta
              );
              
              // Mark the material as needing update
              textureLayersRef.current[materialName].needsUpdate = true;
            }
          }
        }
      });
    }
  });

  // Update pattern scale when it changes in the state
  useEffect(() => {
    // Any other code that might be here
  }, []);

  // Update shader uniforms when material properties change
  useEffect(() => {
    // Update shader uniforms for texture materials
    if (textureLayersRef.current) {
      for (const materialName in textureLayersRef.current) {
        const material = textureLayersRef.current[materialName];
        
        // Skip if not a shader material
        if (!material || !material.uniforms) continue;
        
        // Update base color if material exists
        if (materialsRef.current[materialName]) {
          const baseColor = new THREE.Color(materialsRef.current[materialName].color);
          if (material.uniforms.baseColor) {
            material.uniforms.baseColor.value = baseColor;
          }
          
          // Update base map if material has one
          if (materialsRef.current[materialName].map && material.uniforms.baseMap) {
            material.uniforms.baseMap.value = materialsRef.current[materialName].map;
            material.uniforms.hasBaseMap.value = 1.0;
          }
        }
        
        // Update texture settings if they exist
        if (snap.materialTextures && snap.materialTextures[materialName]) {
          const settings = snap.materialTextures[materialName];
          
          // Update opacity
          if (material.uniforms.opacity && settings.opacity !== undefined) {
            material.uniforms.opacity.value = settings.opacity;
          }
          
          // Update pattern color
          if (material.uniforms.patternColor && settings.color) {
            const colorObj = new THREE.Color(settings.color);
            material.uniforms.patternColor.value = new THREE.Vector3(colorObj.r, colorObj.g, colorObj.b);
          }
          
          // Update texture scale if the map exists
          if (material.uniforms.map && material.uniforms.map.value && settings.scale !== undefined) {
            material.uniforms.map.value.repeat.set(settings.scale, settings.scale);
            material.uniforms.map.value.needsUpdate = true;
          }
        }
        
        // Mark material as needing update
        material.needsUpdate = true;
      }
      
      // Force a re-render
      setForceUpdate(prev => prev + 1);
    }
  }, [snap.materials, snap.materialTextures, snap.materialTypes]);

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
        const hasTextureLayer = textureLayersRef.current && 
                               textureLayersRef.current[materialName] && 
                               snap.materialTextures && 
                               snap.materialTextures[materialName] && 
                               snap.materialTextures[materialName].enabled;
        
        // Log texture status for debugging
        if (snap.materialTextures && snap.materialTextures[materialName]) {
          const textureSettings = snap.materialTextures[materialName];
          if (textureSettings.enabled && !hasTextureLayer) {
            console.log(`Texture enabled for ${materialName} but no texture layer found. Settings:`, textureSettings);
          }
        }
        
        return (
          <group key={`${index}-${forceUpdate}`}>
            {/* Render the base mesh with its material */}
            <mesh
              castShadow
              geometry={node.geometry}
              material={hasTextureLayer ? textureLayersRef.current[materialName] : node.material}
              material-roughness={1}
              dispose={null}
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
            />
          )}

          {snap.isFrontLogoTexture && (
              <Decal
                position={snap.frontLogoPosition}
                rotation={[0, 0, 0]}
                scale={snap.frontLogoScale}
                map={logoTexture}
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
          />
          )}

          {snap.isBackLogoTexture && (
            <Decal
              position={snap.backLogoPosition}
              rotation={snap.backLogoRotation}
              scale={snap.backLogoScale}
              map={backLogoTexture}
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
                    {/* Render logos for this material */}
                    {materialDecor.logos && materialDecor.logos.map((logo) => {
                      // Skip if logo is disabled or has no image
                      if (!logo.enabled || !logo.image) {
                        return null;
                      }
                      
                      // Skip if texture isn't loaded yet
                      if (!materialLogos.current[materialName] || 
                          !materialLogos.current[materialName][logo.id]) {
                        return null;
                      }
                      
                      return (
                        <Decal
                          key={`logo-${materialName}-${logo.id}-${forceUpdate}`}
                          position={logo.position}
                          rotation={logo.rotation}
                          scale={logo.scale}
                          map={materialLogos.current[materialName][logo.id]}
                        />
                      );
                    })}
                    
                    {/* Render texts for this material */}
                    {materialDecor.texts && materialDecor.texts.map((text) => {
                      if (!text.enabled || !text.content) return null;
                      
                      // Create a new texture on the fly
                      const textTexture = createTextTexture(text);
                      if (!textTexture) return null;
                      
                      return (
                        <Decal
                          key={`text-${materialName}-${text.id}-${forceUpdate}`}
                          position={text.position}
                          rotation={text.rotation}
                          scale={0.15}
                          map={textTexture}
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
