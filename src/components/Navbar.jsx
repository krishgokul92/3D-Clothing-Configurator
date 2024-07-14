import React, { useState } from 'react';

const Navbar = ({ onToggleLocationAccess }) => {
  const [state, setState] = useState(false);

  const toggleLocationAccess = () => {
    setState(!state);
    onToggleLocationAccess(!state); // Notify parent component about location access change
  };

  const navigation = [
    { title: "3D Customization", path: "javascript:void(0)" },
    { title: "Try Quick", path: "javascript:void(0)" },
    { title: "Home Decore AR/VR", path: "javascript:void(0)" },
    { title: "Stories", path: "javascript:void(0)" },

    { title: "Notify me", path: "javascript:void(0)" }
  ];

  return (
    <nav className="bg-[#ffffff] w-full border-b md:border-0 md:static">
      <div className="items-center px-4 w-screen-xl  mx-auto md:flex md:px-8">
        <div className="flex items-center justify-between py-3 md:py-5 md:block">
          <a href="javascript:void(0)">
            <img
              src="Myntra-Logo-2015.png"
              width={180}
              height={50}
             
              alt="Float UI logo"
            />
          </a>
         
        </div>
        <div
          className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${
            state ? 'block' : 'hidden'
          }`}
        >
          
          <ul className="justify-end items-center ml-48 space-y-8 md:flex md:space-x-6 md:space-y-0">
            {navigation.map((item, idx) => {
              return (
                
                <li key={idx} className="text-[#170035] font-bold text-sm  border-2 rounded-xl p-2 hover:text-[#f21fb0] ">
                  <a href={item.path}>{item.title}</a>
                </li>
              );
            })}
          </ul>
        </div>
            {/* <button className='text-[#ffffff]  bg-[#170035] font-bold ml-16 border-2 rounded-xl p-2 hover:text-[#170035] hover:bg-[#ffffff]'>Notify me </button> */}
        {/* <div className="hidden md:inline-block">
          <button
            onClick={toggleLocationAccess}
            className="py-3 px-4 text-white bg-red-600 hover:bg-red-700 rounded-md shadow"
          >
            Stop Access Location
          </button>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
