import React from 'react'
import { useSnapshot } from 'valtio';

import state from '../store';
import { getContrastingColor } from '../config/helpers';

const CustomButton = ({ type, title, customStyles, handleClick }) => {
  const snap = useSnapshot(state);

  const generateStyle = (type) => {
    if(type === 'filled') {
      return {
        backgroundColor: snap.color,
        color: getContrastingColor(snap.color),
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      }
    } else if(type === 'outline') {
      return {
        borderWidth: '1px',
        borderColor: snap.color,
        color: snap.color,
        borderRadius: '0.375rem',
        transition: 'all 0.3s ease',
      }
    }
  }

  return (
    <button
      className={`px-4 py-2 font-bold ${customStyles}`}
      style={generateStyle(type)}
      onClick={handleClick}
    >
      {title}
    </button>
  )
}

export default CustomButton