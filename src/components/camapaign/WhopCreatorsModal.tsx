import React from 'react';
import { X } from 'lucide-react';
import { WaitlistFormModal } from './WaitlistFormModal';
import { useNavigate } from 'react-router-dom';

interface WhopCreatorsModalProps {
  onClose: () => void;
  isJoined?: boolean;
  reward?: {
    title: string;
    creator: string;
    rate: string;
    paidAmount: string;
    totalAmount: string;
    percentage: number;
    image?: string;
  };
}

const WhopCreatorsModal: React.FC<WhopCreatorsModalProps> = ({ onClose, reward, isJoined: initialIsJoined = false }) => {
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const [isJoined, setIsJoined] = React.useState(initialIsJoined);
  const imageUrl = reward?.image ?? 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80';
  const navigate = useNavigate();

  const handleJoinSuccess = () => {
    setIsJoined(true);
    setShowJoinModal(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="relative bg-[#0c0c0c] border border-[#1c1c1c] rounded-lg w-full max-w-2xl p-6 text-white mx-4">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-gray-400 hover:text-white z-50"
          >
            <X size={24} />
          </button>

          <div className="aspect-video w-full rounded-md overflow-hidden mb-4 relative">
            <img
              src={imageUrl}
              alt={reward?.title}
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-2xl font-bold mb-4 text-center">{reward?.title ?? 'Whop Creators'}</h2>

          <p className="text-base mb-2">
            Gana <span className="text-green-400 font-semibold">{reward?.rate ?? '$3,500'}</span> por cada 1,000,000 de vistas en videos Whop UGC!
          </p>

          <p className="text-sm text-gray-400 mb-4">
            Has ganado <span className="text-white">{reward?.paidAmount ?? '$0'}</span> de un total de <span className="text-white">{reward?.totalAmount ?? '$100,000'}</span>
          </p>

          <div className="h-2 w-full bg-[#1c1c1c] rounded-full overflow-hidden mb-2">
            <div
              className="bg-[#7c3aed] h-full"
              style={{ width: `${reward?.percentage ?? 0}%` }}
            />
          </div>

          <p className="text-xs text-right text-gray-500 mb-6">
            Progreso: {reward?.percentage ?? 0}%
          </p>

          {/* Botón CTA */}
          <button
            className={`w-full bg-[#7c3aed] hover:bg-purple-700 text-white text-black font-bold py-2 px-4 rounded ${isJoined ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            onClick={() => !isJoined && setShowJoinModal(true)}
            disabled={isJoined}
          >
            {isJoined ? 'Ya estás unido' : 'Únete a'}
          </button>

          <button
            onClick={() => {
              // Simplemente navegar a la página de campaña sin eliminar la autenticación
              navigate("/campaign");
            }}
            className="w-full text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 hover:text-purple-500 mt-4"
          >
            Llévame a la página de la tienda
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5l6 6m0 0l-6 6m6-6H3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal de formulario de espera */}
      {showJoinModal && (
        <WaitlistFormModal 
          onClose={handleJoinSuccess} 
          reward={reward}
        />
      )}
    </>
  );
};

export default WhopCreatorsModal;
