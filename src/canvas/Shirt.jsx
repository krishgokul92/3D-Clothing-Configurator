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

  // Load and configure a pattern texture
  const loadPatternTexture = (materialName, textureSettings) => {
    try {
      // Initialize the texture storage if it doesn't exist
      if (!textureTexturesRef.current[materialName]) {
        textureTexturesRef.current[materialName] = {};
      }
      
      const textureLoader = new THREE.TextureLoader();
      return new Promise((resolve, reject) => {
        textureLoader.load(
          `/pattern/${textureSettings.texture}`,
          (texture) => {
            // Configure texture
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(textureSettings.scale, textureSettings.scale);
            texture.anisotropy = 16; // Improve texture quality
            
            // Store the texture with its file name for identification
            texture.userData = { fileName: textureSettings.texture };
            textureTexturesRef.current[materialName] = texture;
            console.log(`Pattern texture loaded for ${materialName}: ${textureSettings.texture}`);
            
            resolve(texture);
          },
          undefined, // onProgress callback
          (error) => {
            console.error(`Error loading pattern texture for ${materialName}:`, error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error("Error in loadPatternTexture:", error);
      return null;
    }
  };
  
  // Apply pattern texture to a material
  const applyPatternTexture = (node, materialName) => {
    try {
      // Check if texture is enabled for this material
      if (!snap.materialTextures || 
          !snap.materialTextures[materialName] || 
          !snap.materialTextures[materialName].enabled) {
        
        // If there was a texture material before, remove it
        if (node.userData && node.userData.textureMaterial) {
          node.userData.textureMaterial = null;
        }
        return false;
      }
      
      const textureSettings = snap.materialTextures[materialName];
      const currentTexture = textureTexturesRef.current[materialName];
      
      // Check if we need to load a new texture or update an existing one
      const needsNewTexture = !currentTexture || 
                             (currentTexture.userData && 
                              currentTexture.userData.fileName !== textureSettings.texture);
      
      if (needsNewTexture) {
        // Load the new texture
        loadPatternTexture(materialName, textureSettings)
          .then(texture => {
            if (texture) {
              createAndApplyTextureMaterial(node, materialName, texture, textureSettings);
              // Force update to re-render
              setForceUpdate(prev => prev + 1);
            }
          })
          .catch(error => {
            console.error("Error applying pattern texture:", error);
          });
      } else {
        // Update existing texture properties
        currentTexture.repeat.set(textureSettings.scale, textureSettings.scale);
        currentTexture.needsUpdate = true;
        
        // Create or update the texture material
        createAndApplyTextureMaterial(node, materialName, currentTexture, textureSettings);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in applyPatternTexture:", error);
      return false;
    }
  };
  
  // Helper function to create and apply a texture material
  const createAndApplyTextureMaterial = (node, materialName, texture, textureSettings) => {
    // Create a new material that will be used for the texture overlay
    const textureMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: textureSettings.opacity,
      blending: THREE.MultiplyBlending, // This will multiply the texture with the base color
      side: THREE.DoubleSide
    });
    
    // Store the texture material
    if (!node.userData) node.userData = {};
    node.userData.textureMaterial = textureMaterial;
    node.userData.hasTextureOverlay = true;
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
        
        // Remove any existing texture map if switching from gradient to solid
        if (node.material.map) {
          node.material.map.dispose();
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
              snap.materialTypes[materialName] && 
              snap.materialTypes[materialName].type === 'solid') {
            
            // Get the target color from the materials state
            const targetColor = snap.materials[materialName];
            
            // Apply smooth color transition
            easing.dampC(
              node.material.color,
              targetColor,
              0.25,
              delta
            );
          }
        }
      });
    }
  });

  // Update texture settings when they change
  useEffect(() => {
    if (!meshes.length) return;
    
    console.log("Texture settings changed, updating textures...");
    
    meshes.forEach((node) => {
      const materialName = node.material.name;
      if (snap.materialTextures && snap.materialTextures[materialName]) {
        const textureSettings = snap.materialTextures[materialName];
        console.log(`Updating texture for ${materialName}:`, textureSettings);
        
        // Apply or update the texture
        applyPatternTexture(node, materialName);
      }
    });
  }, [meshes, snap.materialTextures]);
  
  // Use a separate effect to track when specific texture properties change
  useEffect(() => {
    // This effect doesn't need to do anything, it just forces a re-render
    // when the stringified materialTextures changes
    console.log("Texture properties changed");
  }, [JSON.stringify(snap.materialTextures)]);

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
                                 snap.materialTextures[materialName].enabled;
        
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
            
            {/* Render texture overlay if enabled */}
            {hasTextureOverlay && (
              <mesh
                geometry={node.geometry}
                material={node.userData.textureMaterial}
                position={node.position}
                rotation={node.rotation}
                scale={node.scale}
                renderOrder={2} // Ensure it renders after the base material
              />
            )}
          </group>
        );
      })}
    </>
  );
};

export default Shirt;
