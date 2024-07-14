// import React from 'react';

// const TextureLogoPicker = ({ texturesLogos, handleTextureLogoClick }) => {
//   const textures = texturesLogos.filter((textureLogo) => textureLogo.type === 'texture');
//   const frontLogos = texturesLogos.filter((textureLogo) => textureLogo.type === 'frontLogo');
//   const backLogos = texturesLogos.filter((textureLogo) => textureLogo.type === 'backLogo');

//   const renderImages = (images) => {
//     return (
//       <div className='grid grid-cols-2 gap-2'>
//         {images.map((image, index) => (
//           <div key={image.name} onClick={() => handleTextureLogoClick(image)}>
//             <img src={image.image} alt={image.name} className='rounded-full w-full' />
//           </div>
//         ))}
//       </div>
//     );
//   };
  
  

//   return (
//     <div className='absolute left-full ml-3'>
//       <h2>Textures</h2>
//       <div className='flex flex-wrap overflow-y-scroll w-40 h-40'>{renderImages(textures)}</div>
//       <h2>Front Logos</h2>
//       <div className='flex flex-wrap overflow-y-scroll w-40 h-40'>{renderImages(frontLogos)}</div>
//       <h2>Back Logos</h2>
//       <div className='flex flex-wrap overflow-y-scroll w-40 h-40'>{renderImages(backLogos)}</div>
//     </div>
//   );
// };

// export default TextureLogoPicker;
import React, { useState } from 'react';

const TextureLogoPicker = ({ texturesLogos, handleTextureLogoClick }) => {
  const textures = texturesLogos.filter((textureLogo) => textureLogo.type === 'texture');
  const frontLogos = texturesLogos.filter((textureLogo) => textureLogo.type === 'frontLogo');
  const backLogos = texturesLogos.filter((textureLogo) => textureLogo.type === 'backLogo');

  const [frontLogoFile, setFrontLogoFile] = useState(null);
  const [backLogoFile, setBackLogoFile] = useState(null);

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
      <div className='grid grid-cols-2 gap-2'>
        {images.map((image, index) => (
          <div key={image.name} onClick={() => handleTextureLogoClick(image)}>
            <img src={image.image} alt={image.name} className='rounded-full w-full' />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='absolute left-full ml-3'>
      <h2>Textures</h2>
      <div className='flex flex-wrap overflow-y-scroll w-40 h-40'>{renderImages(textures)}</div>
      <h2>Front Logos</h2>
      <div className='flex flex-wrap overflow-y-scroll w-40 h-40'>
        {frontLogoFile ? (
          <div onClick={handleFrontLogoImageClick}>
            <img src={URL.createObjectURL(frontLogoFile)} alt="Front Logo" className='rounded-full w-full cursor-pointer' />
          </div>
        ) : (
          <label className="cursor-pointer">
            <input type="file" onChange={handleFrontLogoUpload} style={{ display: 'none' }} accept="image/*" />
            <div className="border-dashed border-2 border-gray-400 rounded-md p-2 hover:bg-gray-100">
              Click to upload Front Logo
            </div>
          </label>
        )}
      </div>
      <h2>Back Logos</h2>
      <div className='flex flex-wrap overflow-y-scroll w-40 h-40'>
        {backLogoFile ? (
          <div onClick={handleBackLogoImageClick}>
            <img src={URL.createObjectURL(backLogoFile)} alt="Back Logo" className='rounded-full w-full cursor-pointer' />
          </div>
        ) : (
          <label className="cursor-pointer">
            <input type="file" onChange={handleBackLogoUpload} style={{ display: 'none' }} accept="image/*" />
            <div className="border-dashed border-2 border-gray-400 rounded-md p-2 hover:bg-gray-100">
              Click to upload Back Logo
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

export default TextureLogoPicker;
