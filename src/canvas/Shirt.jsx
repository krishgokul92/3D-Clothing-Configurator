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

  // Find all meshes in the model
  useEffect(() => {
    if (scene) {
      const foundMeshes = [];
      scene.traverse((node) => {
        if (node.isMesh && node.material) {
          foundMeshes.push(node);
          
          // Store the original material
          const materialName = node.material.name;
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
          }
          
          // Apply current color from state
          if (snap.materials[materialName]) {
            node.material.color.set(snap.materials[materialName]);
          }
        }
      });
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
          if (snap.materials[materialName]) {
            easing.dampC(
              node.material.color,
              snap.materials[materialName],
              0.25,
              delta
            );
          }
        }
      });
    }
  });

  if (meshes.length === 0) return null;

  return (
    <>
      <OrbitControls />
      {meshes.map((node, index) => (
        <group key={`${index}-${forceUpdate}`}>
          <mesh
            castShadow
            geometry={node.geometry}
            material={node.material}
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
                      console.log(`Skipping logo for ${materialName}, logo ID: ${logo.id} - enabled: ${logo.enabled}, has image: ${!!logo.image}`);
                      return null;
                    }
                    
                    // Skip if texture isn't loaded yet
                    if (!materialLogos.current[materialName] || 
                        !materialLogos.current[materialName][logo.id]) {
                      console.log(`Texture not loaded yet for ${materialName}, logo ID: ${logo.id}`);
                      return null;
                    }
                    
                    console.log(`Rendering logo for ${materialName}, logo ID: ${logo.id}`);
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
      ))}
    </>
  );
};

export default Shirt;
