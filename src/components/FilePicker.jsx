import React from 'react'

import CustomButton from './CustomButton'

const FilePicker = ({ file, setFile, readFile }) => {
  return (
    <div className="filepicker-container">
      <h2 className="section-title">Upload File</h2>
      
      <div className="flex flex-col gap-4">
        <input 
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
        <label 
          htmlFor="file-upload" 
          className="upload-button flex items-center justify-center"
        >
          <span className="text-sm">
            {file ? file.name : 'Select a file'}
          </span>
        </label>

        <div className="mt-2">
          {file && (
            <div className="file-preview">
              <p className="text-xs truncate mb-2">{file.name}</p>
              {file.type.includes('image') && (
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Preview" 
                  className="w-full h-32 object-contain border rounded-md"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-2">
          <CustomButton 
            type="outline"
            title="Logo"
            handleClick={() => readFile('frontLogo')}
            customStyles="text-xs px-2 py-1.5 font-medium"
          />
          <CustomButton 
            type="filled"
            title="Full Texture"
            handleClick={() => readFile('full')}
            customStyles="text-xs px-2 py-1.5 font-medium"
          />
        </div>
      </div>
    </div>
  )
}

export default FilePicker