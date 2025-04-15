import React, { useEffect, useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface WaitlistFormModalProps {
  onClose: () => void;
  reward?: {
    title: string;
    image?: string;
  };
}

export const WaitlistFormModal: React.FC<WaitlistFormModalProps> = ({ onClose, reward }) => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0c0c0c] p-6 rounded-lg max-w-sm w-full border border-[#1c1c1c] text-white transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {reward?.image && (
          <img
            src={reward.image}
            alt={reward.title}
            className="w-full h-32 object-cover rounded-md mb-4"
          />
        )}

        {loading ? (
          <div className="text-center">
            <div className="loader mb-4 mx-auto border-t-4 border-purple-500 border-solid rounded-full w-10 h-10 animate-spin"></div>
            <p className="text-sm text-gray-400">Procesando tu solicitud...</p>
          </div>
        ) : success ? (
          <div className="text-center">
            <CheckCircle className="text-green-400 w-10 h-10 mx-auto mb-2" />
            <h3 className="text-xl font-semibold mb-2">¡Te has unido a la campaña exitosamente!</h3>
           
            <button
              onClick={onClose}
              className="mt-6 w-full bg-[#7c3aed] hover:bg-purple-700 text-white text-black font-bold py-2 px-4 rounded"
            >
              Entendido
            </button>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-gray-600 text-center">
          Al continuar, aceptas nuestros <a href="#" className="underline">Términos</a> y <a href="#" className="underline">Privacidad</a>.
        </p>
      </div>
    </div>
  );
};
