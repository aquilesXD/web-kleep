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
          Bio
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

      <h2 className="text-lg sm:text-xl font-medium mb-4">Visibilidad del perfil</h2>
      <p className="text-gray-400 text-sm mb-4">
        Todo lo que ocultes aquí no será visible para los demás.
      </p>

      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="flex items-center justify-between p-3 border border-[#1c1c1c] rounded-md bg-[#101010]">
          <div>
            <p className="text-white text-sm sm:text-base">Se unió a clipper</p>
          </div>
          <div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={joinedVisible}
                onChange={(e) => setJoinedVisible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-9 sm:w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8e4dff]"></div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border border-[#1c1c1c] rounded-md bg-[#101010]">
          <div>
            <p className="text-white text-sm sm:text-base">Clipper en propiedad</p>
          </div>
          <div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ownershipVisible}
                onChange={(e) => setOwnershipVisible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-9 sm:w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8e4dff]"></div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border border-[#1c1c1c] rounded-md bg-[#101010]">
          <div>
            <p className="text-white text-sm sm:text-base">Localización aproximada</p>
          </div>
          <div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={locationVisible}
                onChange={(e) => setLocationVisible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-9 sm:w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8e4dff]"></div>
            </label>
          </div>
        </div>
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
