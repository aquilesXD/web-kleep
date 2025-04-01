import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConnectedAccount {
  id: string;
  username: string;
  isVerified: boolean;
}

const ProfileConnectedAccounts = () => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    { id: '1', username: '@merwebo', isVerified: false },
    { id: '2', username: '@merwebo2', isVerified: false },
    { id: '3', username: '@elbroscoli', isVerified: false },
    { id: '4', username: '@ingvictorf', isVerified: true },
    { id: '5', username: '@aquilesmeo', isVerified: true }
  ]);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('10567333');

  const handleVerify = (id: string) => {
    // Encontrar la cuenta seleccionada
    const account = accounts.find(acc => acc.id === id);
    if (account) {
      setSelectedAccount(account.username);
      setShowVerificationModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowVerificationModal(false);
    setSelectedAccount('');
  };

  const handleVerifyAccount = () => {
    // En una aplicación real, aquí enviaríamos el código de verificación a la API
    console.log(`Verificando cuenta ${selectedAccount} con código ${verificationCode}`);

    // Actualizar el estado de la cuenta a verificada
    setAccounts(prev =>
      prev.map(acc =>
        acc.username === selectedAccount ? { ...acc, isVerified: true } : acc
      )
    );

    // Cerrar el modal
    setShowVerificationModal(false);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="bg-[#0c0c0c] border border-[#1c1c1c] rounded-md">
        <div className="p-5 border-b border-[#1c1c1c]">
          <h2 className="text-lg font-medium">Cuentas conectadas</h2>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="relative">
                <div className="bg-[#161616] text-white rounded-full px-4 py-2 flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${account.isVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{account.username}</span>
                </div>
                {!account.isVerified && (
                  <div className="mt-2 flex items-center justify-center">
                    <AlertTriangle className="text-indigo-400 w-4 h-4 mr-1" />
                    <button
                      className="text-indigo-400 text-sm hover:underline"
                      onClick={() => handleVerify(account.id)}
                    >
                      Verificar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de verificación */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#0c0c0c] border border-[#1c1c1c] rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="mb-4">
              <p className="text-gray-300 text-center">
                Para poder procesar los pagos, es importante que verifiquemos
                que tu eres el dueño de la siguiente cuenta de TikTok.
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="bg-[#161616] text-white rounded-full px-5 py-2.5 flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
                <span>{selectedAccount}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-medium mb-4">Pasos para verificar tu cuenta:</h3>
              <ol className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="flex-shrink-0 bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center mr-2">1</span>
                  <span>Copia el código</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center mr-2">2</span>
                  <span>Pégalo en la bio (perfil) de tu cuenta de TikTok</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center mr-2">3</span>
                  <span>Una vez lo hayas hecho, toca el botón "Verificar mi cuenta"</span>
                </li>
              </ol>
            </div>

            <p className="text-gray-300 mb-2">
              Nuestro sistema revisará tu perfil y, si el código está visible, marcará tu cuenta como verificada.
            </p>

            <div className="mb-6">
              <p className="text-gray-400 mb-2">Este es tu código:</p>
              <div className="bg-[#161616] text-center p-3 rounded-md border border-[#1c1c1c] text-xl font-bold text-white">
                {verificationCode}
              </div>
            </div>

            <button
              onClick={handleVerifyAccount}
              className="w-full bg-[#8e4dff] hover:bg-[#7c3aed] text-white py-3 px-4 rounded-md text-center transition-colors"
            >
              Verificar Cuenta de TikTok
            </button>

            <div className="mt-4 flex items-center justify-center text-yellow-500 text-sm">
              <AlertTriangle size={16} className="mr-2" />
              <span>Este paso es obligatorio para recibir pagos.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileConnectedAccounts;
