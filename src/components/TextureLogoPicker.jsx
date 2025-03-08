import React, { useState } from 'react';

const TextureLogoPicker = ({ texturesLogos, handleTextureLogoClick }) => {
  const textures = texturesLogos.filter((textureLogo) => textureLogo.type === 'texture');
  const frontLogos = texturesLogos.filter((textureLogo) => textureLogo.type === 'frontLogo');
  const backLogos = texturesLogos.filter((textureLogo) => textureLogo.type === 'backLogo');

  const [frontLogoFile, setFrontLogoFile] = useState(null);
  const [backLogoFile, setBackLogoFile] = useState(null);
  const [activeTab, setActiveTab] = useState('textures');

  const handleFrontLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontLogoFile(file);
    }
  };

  const handleBackLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackLogoFile(file);
    }
  };

  const handleFrontLogoImageClick = () => {
    if (frontLogoFile) {
      const frontLogoImage = URL.createObjectURL(frontLogoFile);
      handleTextureLogoClick({ type: 'frontLogo', image: frontLogoImage });
    }
  };

  const handleBackLogoImageClick = () => {
    if (backLogoFile) {
      const backLogoImage = URL.createObjectURL(backLogoFile);
      handleTextureLogoClick({ type: 'backLogo', image: backLogoImage });
    }
  };

  const renderImages = (images) => {
    return (
      <div className='texture-grid'>
        {images.map((image, index) => (
          <div 
            key={image.name} 
            className="texture-item"
            onClick={() => handleTextureLogoClick(image)}
          >
            <img 
              src={image.image} 
              alt={image.name} 
              className='texture-image' 
            />
            <span className="texture-name">{image.name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='texture-logo-picker'>
      <div className="texture-tabs">
        <button 
          className={`texture-tab ${activeTab === 'textures' ? 'active' : ''}`}
          onClick={() => setActiveTab('textures')}
        >
          Textures
        </button>
        <button 
          className={`texture-tab ${activeTab === 'frontLogos' ? 'active' : ''}`}
          onClick={() => setActiveTab('frontLogos')}
        >
          Front Logos
        </button>
        <button 
          className={`texture-tab ${activeTab === 'backLogos' ? 'active' : ''}`}
          onClick={() => setActiveTab('backLogos')}
        >
          Back Logos
        </button>
      </div>

      <div className="texture-content">
        {activeTab === 'textures' && (
          <div className="textures-container">
            {renderImages(textures)}
          </div>
        )}
        
        {activeTab === 'frontLogos' && (
          <div className="logos-container">
            <div className="logo-grid">
              {renderImages(frontLogos)}
              
              <div className="upload-container">
                {frontLogoFile ? (
                  <div className="uploaded-logo" onClick={handleFrontLogoImageClick}>
                    <img 
                      src={URL.createObjectURL(frontLogoFile)} 
                      alt="Front Logo" 
                      className='uploaded-image' 
                    />
                    <span>Custom Logo</span>
                  </div>
                ) : (
                  <label className="upload-label">
                    <input 
                      type="file" 
                      onChange={handleFrontLogoUpload} 
                      accept="image/*" 
                      className="file-input"
                    />
                    <div className="upload-button">
                      <span>+ Upload Logo</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'backLogos' && (
          <div className="logos-container">
            <div className="logo-grid">
              {renderImages(backLogos)}
              
              <div className="upload-container">
                {backLogoFile ? (
                  <div className="uploaded-logo" onClick={handleBackLogoImageClick}>
                    <img 
                      src={URL.createObjectURL(backLogoFile)} 
                      alt="Back Logo" 
                      className='uploaded-image' 
                    />
                    <span>Custom Logo</span>
                  </div>
                ) : (
                  <label className="upload-label">
                    <input 
                      type="file" 
                      onChange={handleBackLogoUpload} 
                      accept="image/*" 
                      className="file-input"
                    />
                    <div className="upload-button">
                      <span>+ Upload Logo</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextureLogoPicker;
