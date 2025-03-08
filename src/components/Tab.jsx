import React from 'react'
import { useSnapshot } from 'valtio'

import state from '../store';

const Tab = ({ tab, isFilterTab, isActiveTab, handleClick }) => {
  const snap = useSnapshot(state);

  const activeStyles = isFilterTab && isActiveTab 
    ? { backgroundColor: snap.color, opacity: 0.5 }
    : { backgroundColor: "transparent", opacity: 1 }

  return (
    <div 
      className={`tab ${isActiveTab && !isFilterTab ? 'active-tab' : ''}`}
      onClick={handleClick}
    >
      <div
        className={`tab-btn ${isFilterTab ? 'filter-tab' : 'editor-tab'} ${isActiveTab && !isFilterTab ? 'active' : ''}`}
        style={isFilterTab ? activeStyles : {}}
      >
        <img 
          src={tab.icon}
          alt={tab.name}
          className={`${isFilterTab ? 'w-2/3 h-2/3' : 'w-5 h-5 mr-2'}`}
        />
        {!isFilterTab && (
          <span className="tab-label">{tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}</span>
        )}
      </div>
    </div>
  )
}

export default Tab