import { useState } from 'react';

const ProfileGeneral = () => {
  const [joinedVisible, setJoinedVisible] = useState(true);
  const [ownershipVisible, setOwnershipVisible] = useState(true);
  const [locationVisible, setLocationVisible] = useState(true);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-lg sm:text-xl font-medium mb-4">Información básica</h2>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1.5">
          Nombre
        </label>
        <input
          className="w-full p-2.5 bg-[#101010] border border-[#1c1c1c] rounded-md text-white focus:outline-none focus:border-[#272727]"
          placeholder="Nombre"
          type="text"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1.5">
          Biografia
        </label>
        <textarea
          className="w-full p-2.5 bg-[#101010] border border-[#1c1c1c] rounded-md text-white h-[80px] sm:h-[100px] focus:outline-none focus:border-[#272727]"
          placeholder="Sin biografía"
        ></textarea>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-1.5">
          Nombre de usuario
        </label>
        <input
          className="w-full p-2.5 bg-[#101010] border border-[#1c1c1c] rounded-md text-white focus:outline-none focus:border-[#272727]"
          placeholder="Nombre de usuario"
          type="text"
        />
      </div>

      <div className="pb-4">
        <button className="w-full py-3.5 bg-[#8e4dff] text-white rounded-md font-medium">
          Guardar
        </button>
      </div>
    </div>
  );
};

export default ProfileGeneral;
