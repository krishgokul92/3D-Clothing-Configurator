import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSnapshot } from 'valtio';

import LogoControls from '../canvas/LogoControls';
import TextControls from '../canvas/TextControls';
import state from '../store';
import { downloadCanvasToImage, reader } from '../config/helpers';
import { EditorTabs, DecalTypes, texturesLogos } from '../config/constants';
import { fadeAnimation, slideAnimation } from '../config/motion';
import { CustomButton, FilePicker, TextureLogoPicker, Tab } from '../components';
import MaterialColorPicker from '../components/MaterialColorPicker';

const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState('');
  const [activeEditorTab, setActiveEditorTab] = useState("");
  const [activeTabGroup, setActiveTabGroup] = useState("materials");

  // Tab groups for better organization
  const tabGroups = [
    { id: "materials", label: "Materials" },
    { id: "logos", label: "Logos" },
    { id: "text", label: "Text" },
    { id: "textures", label: "Textures" }
  ];

  // show tab content depending on the activeTab
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "filepicker":
        return <FilePicker
          file={file}
          setFile={setFile}
          readFile={readFile}
        />
      case "logocontrols":
        return <LogoControls />;
      case "textcontrols":
        return <TextControls />;
      case "texturelogopicker":
        return (
          <TextureLogoPicker
            texturesLogos={texturesLogos}
            handleTextureLogoClick={handleTextureLogoClick}
          />
        );
      default:
        return null;
    }
  }

  const handleTextureLogoClick = (textureLogo) => {
    // update the state with the selected texture or logo
    if (textureLogo.type === "texture") {
      // update the state with the selected texture
      state.fullDecal = textureLogo.image;
      state.isFullTexture = true;
    } else if (textureLogo.type === "frontLogo") {
      // update the state with the selected logo
      state.frontLogoDecal = textureLogo.image;
      state.isFrontLogoTexture = true;
    } else if (textureLogo.type === "backLogo") {
      // update the state with the selected logo
      state.backLogoDecal = textureLogo.image;
      state.isBackLogoTexture = true;
    }
  };
  
  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];
  
    if (decalType && state[decalType.stateProperty] !== undefined) {
      state[decalType.stateProperty] = result;
      
      // Enable the corresponding texture/logo
      if (type === 'frontLogo') {
        state.isFrontLogoTexture = true;
      } else if (type === 'backLogo') {
        state.isBackLogoTexture = true;
      } else if (type === 'full') {
        state.isFullTexture = true;
      }
    } else {
      console.error(`Decal type '${type}' or state property '${decalType && decalType.stateProperty}' is not defined.`);
    }
  };

  const readFile = (type) => {
    reader(file)
      .then((result) => {
        handleDecals(type, result);
        setActiveEditorTab("");
      })
  }

  // Filter EditorTabs based on active tab group
  const getTabsForActiveGroup = () => {
    switch (activeTabGroup) {
      case "materials":
        return []; // No tabs needed for materials, we'll show the MaterialColorPicker directly
      case "logos":
        return EditorTabs.filter(tab => ["filepicker", "logocontrols", "texturelogopicker"].includes(tab.name));
      case "text":
        return EditorTabs.filter(tab => tab.name === "textcontrols");
      case "textures":
        return EditorTabs.filter(tab => tab.name === "texturelogopicker");
      default:
        return [];
    }
  }

  // Get content based on active tab group
  const getTabGroupContent = () => {
    if (activeTabGroup === "materials") {
      return <MaterialColorPicker />;
    } else {
      return generateTabContent();
    }
  };

  return (
    <motion.div
      key="custom"
      className="customizer-wrapper"
      {...fadeAnimation}
    >
      <div className="customizer-container">
        {/* Tab Group Navigation */}
        <div className="tab-group-nav">
          {tabGroups.map((group) => (
            <button
              key={group.id}
              className={`tab-group-btn ${activeTabGroup === group.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTabGroup(group.id);
                setActiveEditorTab("");
              }}
            >
              {group.label}
            </button>
          ))}
        </div>

        {/* Editor Tabs - Only show if not in materials tab group */}
        {activeTabGroup !== "materials" && (
          <div className="editor-tabs">
            {getTabsForActiveGroup().map((tab) => (
              <Tab 
                key={tab.name}
                tab={tab}
                handleClick={() => setActiveEditorTab(tab.name === activeEditorTab ? "" : tab.name)}
                isActiveTab={tab.name === activeEditorTab}
              />
            ))}
          </div>
        )}

        {/* Tab Content */}
        <div className="tab-content">
          {getTabGroupContent()}
        </div>
      </div>
    </motion.div>
  )
}

export default Customizer
