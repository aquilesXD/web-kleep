import { useState, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import tiktokVerificationService from '../../services/tiktokVerificationService';

interface TikTokAccount {
  id: string;
  username: string;
  isVerified: boolean;
  verifiedStatus?: string;
  tiktok_code?: string;
  account_id?: string;
  verified_request?: string;
}

const ProfileConnectedAccounts = () => {
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TikTokAccount | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    fetchTikTokAccounts();

    // Establecer un intervalo para verificar el estado de las cuentas pendientes cada 60 segundos
    const intervalId = setInterval(() => {
      if (accounts.some(acc => acc.verifiedStatus === 'pending')) {
        checkPendingAccountsStatus();
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Función para obtener las cuentas de TikTok
  const fetchTikTokAccounts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener el ID de usuario
      const userId = await getUserId();
      if (!userId) {
        throw new Error('No se pudo determinar el ID de usuario');
      }

      // Obtener cuentas de TikTok usando el servicio
      const accountsData = await tiktokVerificationService.fetchTikTokAccounts(userId);
      setAccounts(accountsData);

      // Si hay cuentas pendientes, verificar su estado actual
      if (accountsData.some(acc => acc.verifiedStatus === 'pending')) {
        setTimeout(() => checkPendingAccountsStatus(), 1000);
      }
    } catch (error: any) {
      console.error('Error al cargar cuentas:', error);
      setError(`Error al cargar cuentas: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener el ID de usuario desde localStorage o API
  const getUserId = async (): Promise<string | null> => {
    const apiResponse = localStorage.getItem('apiResponse');
    if (!apiResponse) return null;

    try {
      const parsedResponse = JSON.parse(apiResponse);

      // Intentar encontrar el ID en diferentes ubicaciones de la respuesta
      if (parsedResponse.data && Array.isArray(parsedResponse.data) && parsedResponse.data.length > 0) {
        const firstItem = parsedResponse.data[0];
        if (firstItem.user_id) return firstItem.user_id;
        if (firstItem.id_user) return firstItem.id_user;
        if (firstItem.id) return firstItem.id;
      }

      if (parsedResponse.user_id) return parsedResponse.user_id;
      if (parsedResponse.id_user) return parsedResponse.id_user;
      if (parsedResponse.id) return parsedResponse.id;

      // Búsqueda recursiva
      const findUserId = (obj: any): string | null => {
        if (!obj || typeof obj !== 'object') return null;

        for (const key in obj) {
          if ((key === 'id' || key === 'user_id' || key === 'id_user') &&
              (typeof obj[key] === 'string' || typeof obj[key] === 'number')) {
            return String(obj[key]);
          }

          if (typeof obj[key] === 'object') {
            const result = findUserId(obj[key]);
            if (result) return result;
          }
        }

        return null;
      };

      return findUserId(parsedResponse) || '1'; // Valor por defecto para pruebas
    } catch (e) {
      console.error('Error al parsear la respuesta:', e);
      return null;
    }
  };

  // Verifica el estado actual de las cuentas pendientes
  const checkPendingAccountsStatus = async () => {
    if (isCheckingStatus || accounts.length === 0) return;

    setIsCheckingStatus(true);

    try {
      // Obtener los IDs de las cuentas pendientes
      const pendingAccounts = accounts.filter(acc => acc.verifiedStatus === 'pending');
      if (pendingAccounts.length === 0) return;

      const pendingIds = pendingAccounts
        .map(acc => acc.account_id)
        .filter((id): id is string => id !== undefined);

      // Verificar el estado actual
      const updatedAccounts = await tiktokVerificationService.checkVerificationStatus(pendingIds);

      // Actualizar solo las cuentas que han cambiado
      if (updatedAccounts.length > 0) {
        setAccounts(prev => {
          const newAccounts = [...prev];

          updatedAccounts.forEach(updatedAcc => {
            const index = newAccounts.findIndex(acc =>
              acc.account_id === updatedAcc.account_id || acc.id === updatedAcc.id
            );

            if (index !== -1) {
              // Si la cuenta ya fue verificada, actualizar su estado
              if (updatedAcc.isVerified) {
                newAccounts[index].isVerified = true;
                newAccounts[index].verifiedStatus = undefined;
              }
            }
          });

          return newAccounts;
        });
      }
    } catch (error) {
      console.error('Error al verificar estado de cuentas pendientes:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Iniciar proceso de verificación
  const handleVerify = (id: string) => {
    const account = accounts.find(acc => acc.id === id);
    if (!account) return;

    setSelectedAccount(account);
    setVerificationCode(account.tiktok_code || tiktokVerificationService.generateVerificationCode());
    setShowVerificationModal(true);
    setVerificationStatus('idle');
    setStatusMessage('');
  };

  // Cerrar modal de verificación
  const handleCloseModal = () => {
    setShowVerificationModal(false);
    setSelectedAccount(null);
    setIsSubmitting(false);
    setVerificationStatus('idle');
  };

  // Procesar verificación de cuenta
  const handleVerifyAccount = async () => {
    if (!selectedAccount) return;

    setIsSubmitting(true);
    setVerificationStatus('loading');
    setStatusMessage('Procesando solicitud...');

    try {
      // Llamar al servicio de verificación
      const result = await tiktokVerificationService.requestTikTokVerification(
        selectedAccount.account_id,
        verificationCode
      );

      if (result.success) {
        // Actualizar el estado de la cuenta localmente
        setAccounts(prev =>
          prev.map(acc =>
            acc.id === selectedAccount.id ?
              {
                ...acc,
                isVerified: false,
                verifiedStatus: 'pending',
                verified_request: new Date().toISOString()
              } : acc
          )
        );

        setVerificationStatus('success');
        setStatusMessage(result.message);

        // Cerrar el modal después de mostrar mensaje de éxito por 2 segundos
        setTimeout(() => {
          setShowVerificationModal(false);
          // Confirmar con alerta
          alert('Solicitud de verificación enviada correctamente. Recuerda colocar este código en la bio de tu perfil de TikTok para completar la verificación.');
        }, 2000);
      } else {
        setVerificationStatus('error');
        setStatusMessage(result.message);
      }
    } catch (error: any) {
      console.error('Error al verificar la cuenta:', error);
      setVerificationStatus('error');
      setStatusMessage(error.message || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para intentar verificación manual
  const handleManualCheck = async () => {
    if (!selectedAccount) return;

    setIsSubmitting(true);
    setVerificationStatus('loading');
    setStatusMessage('Verificando cuenta...');

    try {
      // Use the real verification service instead of the simple mock
      console.log("Performing manual verification check for account:", selectedAccount);

      // Call the verification service to check status
      const result = await tiktokVerificationService.checkVerificationStatus(
        [selectedAccount.account_id].filter((id): id is string => id !== undefined)
      );

      if (result.length > 0 && result[0].isVerified) {
        // Update account status in the UI
        setAccounts(prev =>
          prev.map(acc =>
            acc.id === selectedAccount.id
              ? { ...acc, isVerified: true, verifiedStatus: undefined } : acc
          )
        );

        setVerificationStatus('success');
        setStatusMessage('¡Cuenta verificada exitosamente!');

        setTimeout(() => {
          setShowVerificationModal(false);
        }, 2000);
      } else {
        setVerificationStatus('error');
        setStatusMessage('No se encontró el código en el perfil. Asegúrate de que el código esté visible en tu biografía de TikTok.');
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setStatusMessage(error.message || 'Error al verificar');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para renderizar el indicador de estado de la cuenta
  const renderVerificationStatus = (account: TikTokAccount) => {
    if (account.isVerified) {
      return (
        <div className="flex items-center text-green-500 text-sm mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>Verificada</span>
        </div>
      );
    } else if (account.verifiedStatus === 'pending') {
      return (
        <div className="flex items-center text-yellow-500 text-sm mt-2">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span>Verificación pendiente</span>
          <button
            onClick={() => handleVerify(account.id)}
            className="ml-2 text-indigo-400 hover:text-indigo-300"
            title="Reintentar verificación"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      );
    } else {
      return (
        <div className="mt-2 flex items-center justify-center">
          <AlertTriangle className="text-indigo-400 w-4 h-4 mr-1" />
          <button
            className="text-indigo-400 text-sm hover:underline"
            onClick={() => handleVerify(account.id)}
          >
            Verificar
          </button>
        </div>
      );
    }
  };

  // Función para renderizar el mensaje de estado de verificación
  const renderStatusMessage = () => {
    if (verificationStatus === 'idle') return null;

    const statusClasses = {
      loading: 'text-blue-400',
      success: 'text-green-400',
      error: 'text-red-400'
    };

    const statusIcons = {
      loading: <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>,
      success: <CheckCircle size={16} className="mr-2" />,
      error: <AlertTriangle size={16} className="mr-2" />
    };

    return (
      <div className={`mt-4 flex items-center ${statusClasses[verificationStatus]}`}>
        {statusIcons[verificationStatus]}
        <span>{statusMessage}</span>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="bg-[#0c0c0c] border border-[#1c1c1c] rounded-md">
        <div className="p-5 border-b border-[#1c1c1c]">
          <h2 className="text-lg font-medium">Cuentas conectadas</h2>
          <p className="text-sm text-gray-400 mt-1">Gestiona tus cuentas de TikTok vinculadas</p>
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#8e4dff] border-r-transparent"></div>
              <p className="mt-2 text-gray-400">Cargando cuentas...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto mb-2 text-yellow-500" size={32} />
              <p className="text-yellow-500">{error || 'No se encontraron cuentas de TikTok asociadas a este usuario.'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                {accounts.map((account) => (
                  <div key={account.id} className="relative">
                    <div className="bg-[#161616] text-white rounded-full px-4 py-2 flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        account.isVerified ? 'bg-green-500' :
                        account.verifiedStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span>{account.username}</span>
                    </div>
                    {renderVerificationStatus(account)}
                  </div>
                ))}
              </div>

              {isCheckingStatus && (
                <div className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center">
                  <RefreshCw size={12} className="mr-1 animate-spin" />
                  <span>Verificando estado de cuentas pendientes...</span>
                </div>
              )}

              {error && (
                <div className="mt-4 text-center text-red-400">
                  <p>{error}</p>
                  <button
                    onClick={fetchTikTokAccounts}
                    className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm underline"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de verificación */}
      {showVerificationModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#0c0c0c] border border-[#1c1c1c] rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              disabled={isSubmitting}
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
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  selectedAccount.isVerified ? 'bg-green-500' :
                  selectedAccount.verifiedStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span>{selectedAccount.username}</span>
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
              <div className="relative">
                <div className="bg-[#161616] text-center p-3 rounded-md border border-[#1c1c1c] text-xl font-bold text-white">
                  {verificationCode}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(verificationCode);
                    alert('Código copiado al portapapeles');
                  }}
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  title="Copiar al portapapeles"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </div>

            {renderStatusMessage()}

            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={handleVerifyAccount}
                className={`w-full bg-[#8e4dff] hover:bg-[#7c3aed] text-white py-3 px-4 rounded-md text-center transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isSubmitting || verificationStatus === 'success'}
              >
                {isSubmitting && verificationStatus === 'loading' ? 'Procesando...' : 'Verificar Cuenta de TikTok'}
              </button>

              {selectedAccount.verifiedStatus === 'pending' && (
                <button
                  onClick={handleManualCheck}
                  className="w-full border border-[#8e4dff] text-[#8e4dff] py-2 px-4 rounded-md text-center hover:bg-[#8e4dff10] transition-colors"
                  disabled={isSubmitting || verificationStatus === 'success'}
                >
                  Verificar manualmente ahora
                </button>
              )}
            </div>

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
