import { useState, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface TikTokAccount {
  id: string;
  username: string;
  isVerified: boolean;
  verifiedStatus?: string; // Campo opcional para almacenar el estado de verificación "pendiente"
  tiktok_code?: string; // Código de verificación
  account_id?: string; // ID de la cuenta en la BD
}

// Interfaz para almacenar intentos de verificación
interface VerificationAttempt {
  count: number;
  lastAttempt: number;
}

const ProfileConnectedAccounts = () => {
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TikTokAccount | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState<Record<string, VerificationAttempt>>({});
  const [cooldownTimer, setCooldownTimer] = useState<number | null>(null);

  // Cargar intentos de verificación almacenados
  useEffect(() => {
    const storedAttempts = localStorage.getItem('verificationAttempts');
    if (storedAttempts) {
      try {
        setVerificationAttempts(JSON.parse(storedAttempts));
      } catch (e) {
        console.error('Error al cargar intentos de verificación:', e);
      }
    }
  }, []);

  // Actualizar localStorage cuando cambian los intentos
  useEffect(() => {
    if (Object.keys(verificationAttempts).length > 0) {
      localStorage.setItem('verificationAttempts', JSON.stringify(verificationAttempts));
    }
  }, [verificationAttempts]);

  // Gestionar el contador de tiempo de espera
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (cooldownTimer !== null && cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer(prev => (prev !== null && prev > 0) ? prev - 1 : null);
      }, 1000);
    } else if (cooldownTimer === 0 && selectedAccount) {
      // Reiniciar intentos cuando el temporizador llega a cero
      setVerificationAttempts(prev => ({
        ...prev,
        [selectedAccount.id]: { count: 0, lastAttempt: Date.now() }
      }));
      setCooldownTimer(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownTimer, selectedAccount]);

  useEffect(() => {
    // Función para obtener las cuentas de TikTok de la API
    const fetchTikTokAccounts = async () => {
      setIsLoading(true);
      setError(null);
      let debugMessages: string[] = [];

      try {
        // Para fines de desarrollo, utilizar un ID fijo si no podemos obtenerlo de la API
        let userId = "1"; // ID por defecto para pruebas

        // Obtener el ID de usuario del almacenamiento local
        const userEmail = localStorage.getItem('userEmail');
        debugMessages.push(`Email del usuario: ${userEmail || 'No disponible'}`);

        const apiResponse = localStorage.getItem('apiResponse');
        debugMessages.push(`Respuesta API guardada: ${apiResponse ? 'Disponible' : 'No disponible'}`);

        // Intentar obtener el ID de usuario desde la respuesta de la API almacenada
        if (apiResponse) {
          try {
            const parsedResponse = JSON.parse(apiResponse);
            debugMessages.push(`Respuesta API parseada: ${JSON.stringify(parsedResponse).substring(0, 200)}...`);

            if (parsedResponse.data && Array.isArray(parsedResponse.data) && parsedResponse.data.length > 0) {
              // Buscar diferentes posibles nombres de campo para el ID
              const firstItem = parsedResponse.data[0];
              debugMessages.push(`Primer item de datos: ${JSON.stringify(firstItem).substring(0, 200)}...`);

              if (firstItem.user_id) {
                userId = firstItem.user_id;
                debugMessages.push(`ID encontrado como user_id: ${userId}`);
              } else if (firstItem.id_user) {
                userId = firstItem.id_user;
                debugMessages.push(`ID encontrado como id_user: ${userId}`);
              } else if (firstItem.id) {
                userId = firstItem.id;
                debugMessages.push(`ID encontrado como id: ${userId}`);
              }
            } else if (parsedResponse.user_id) {
              userId = parsedResponse.user_id;
              debugMessages.push(`ID encontrado en la raíz como user_id: ${userId}`);
            } else if (parsedResponse.id_user) {
              userId = parsedResponse.id_user;
              debugMessages.push(`ID encontrado en la raíz como id_user: ${userId}`);
            } else if (parsedResponse.id) {
              userId = parsedResponse.id;
              debugMessages.push(`ID encontrado en la raíz como id: ${userId}`);
            }

            // Buscar cualquier ID en la respuesta de la API recursivamente
            const findUserId = (obj: any, prefix = ''): string | null => {
              if (!obj || typeof obj !== 'object') return null;

              for (const key in obj) {
                const fullKey = prefix ? `${prefix}.${key}` : key;

                if ((key === 'id' || key === 'user_id' || key === 'id_user') &&
                    (typeof obj[key] === 'string' || typeof obj[key] === 'number')) {
                  debugMessages.push(`ID encontrado en ${fullKey}: ${obj[key]}`);
                  return String(obj[key]);
                }

                if (typeof obj[key] === 'object') {
                  const result = findUserId(obj[key], fullKey);
                  if (result) return result;
                }
              }

              return null;
            };

            // Intentar encontrar cualquier ID en la respuesta
            const foundId = findUserId(parsedResponse);
            if (foundId && !userId) {
              userId = foundId;
              debugMessages.push(`ID encontrado mediante búsqueda recursiva: ${userId}`);
            }

          } catch (e) {
            console.error('Error al parsear la respuesta de la API:', e);
            debugMessages.push(`Error al parsear la respuesta: ${e}`);
          }
        }

        debugMessages.push(`ID final a utilizar: ${userId}`);

        // Realizar la petición a la API con el ID obtenido
        const apiUrl = 'https://contabl.net/nova/get-tiktok-accounts-by-user';
        debugMessages.push(`URL de la API: ${apiUrl}`);
        debugMessages.push(`ID de usuario a enviar: ${userId}`);

        // Primera forma: Usando parámetros de consulta
        let response = await fetch(`${apiUrl}?id_user=${encodeURIComponent(userId)}`);

        // Si falla la primera forma, intentar con formato JSON
        if (!response.ok) {
          debugMessages.push(`Primera solicitud fallida con estado: ${response.status}. Intentando con formato JSON...`);

          const requestOptions = {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              }
          };

          response = await fetch(`${apiUrl}?id_user=${encodeURIComponent(userId)}`, requestOptions);
          debugMessages.push(`Segunda solicitud status: ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }

        // Obtener y analizar la respuesta
        const data = await response.json();
        debugMessages.push(`Respuesta completa recibida: ${JSON.stringify(data)}`);
        console.log("API Response:", data);

        // Verificación de estructura personalizada para depuración
        if (data) {
          debugMessages.push(`Tipo de respuesta: ${typeof data}`);

          // Verificar si hay una propiedad 'accounts' (según el formato proporcionado)
          if (data.accounts) {
            debugMessages.push(`Propiedad 'accounts' encontrada!`);
            debugMessages.push(`Tipo de accounts: ${typeof data.accounts}`);
            debugMessages.push(`Es array accounts: ${Array.isArray(data.accounts)}`);
            debugMessages.push(`Longitud de accounts: ${Array.isArray(data.accounts) ? data.accounts.length : 'No es array'}`);

            // Mostrar los valores de verified para depuración
            if (Array.isArray(data.accounts) && data.accounts.length > 0) {
              data.accounts.forEach((account, index) => {
                debugMessages.push(`Cuenta ${index + 1} - Objeto completo: ${JSON.stringify(account)}`);
                debugMessages.push(`Cuenta ${index + 1} - verified: ${account.verified}, tipo: ${typeof account.verified}`);
                debugMessages.push(`Cuenta ${index + 1} - tiktok_code: ${account.tiktok_code || 'No disponible'}`);
                if (account.verified_request) {
                  debugMessages.push(`Cuenta ${index + 1} - verified_request: ${account.verified_request}`);
                }
              });
            }
          }
          // Verificar también la estructura anterior 'data' por si acaso
          else if (data.data) {
            debugMessages.push(`Propiedad 'data' encontrada!`);
            debugMessages.push(`Tipo de data: ${typeof data.data}`);
            debugMessages.push(`Es array data: ${Array.isArray(data.data)}`);
            debugMessages.push(`Longitud de data: ${Array.isArray(data.data) ? data.data.length : 'No es array'}`);

            // Mostrar los valores de verificación para depuración
            if (Array.isArray(data.data) && data.data.length > 0) {
              data.data.forEach((account, index) => {
                debugMessages.push(`Cuenta ${index + 1} - Objeto completo: ${JSON.stringify(account)}`);
                const verifiedField = account.verified !== undefined ? 'verified' :
                                      account.is_verified !== undefined ? 'is_verified' : 'No encontrado';
                debugMessages.push(`Cuenta ${index + 1} - Campo de verificación: ${verifiedField}, valor: ${account[verifiedField]}`);
              });
            }
          } else {
            // Intentar buscar cualquier array en los datos de la respuesta
            for (const key in data) {
              if (Array.isArray(data[key]) && data[key].length > 0) {
                debugMessages.push(`Array encontrado en clave '${key}' con ${data[key].length} elementos`);
                debugMessages.push(`Primer elemento: ${JSON.stringify(data[key][0])}`);
              }
            }

            debugMessages.push(`No se encontró ni 'accounts' ni 'data' en la respuesta`);
          }
        }

        // Procesar los datos de la API según la estructura proporcionada
        // Primero intentar con la estructura 'accounts' (según el formato proporcionado)
        if (data && data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
          // Transformar los datos de la API (formato 'accounts') al formato que necesitamos
          const formattedAccounts = data.accounts.map((account: any) => {
            // Determinar el estado de verificación
            let isVerified = false;
            let verifiedStatus = undefined;

            // Interpretar el estado de verificación según los valores
            if (account.verified === 1 || account.verified === true) {
              isVerified = true;
            } else if (account.verified_request && account.verified === 0) {
              // Si hay una solicitud de verificación pendiente
              verifiedStatus = 'pending';
            }

            // Devolver el objeto formateado
            return {
              id: account.id || String(Math.random()),
              account_id: account.id || null, // Guardar el ID original para API calls
              username: account.account || `@${account.id_user || 'usuario'}${Math.floor(Math.random() * 1000)}`,
              isVerified,
              verifiedStatus,
              tiktok_code: account.tiktok_code ? String(account.tiktok_code) : generateVerificationCode()
            };
          });

          setAccounts(formattedAccounts);
          debugMessages.push(`Procesadas ${formattedAccounts.length} cuentas reales de la API (formato 'accounts')`);

          // Mostrar información sobre el estado de verificación
          formattedAccounts.forEach((account, index) => {
            debugMessages.push(`Cuenta ${index + 1} - ${account.username} - Verificada: ${account.isVerified}, Estado: ${account.verifiedStatus || 'no establecido'}, Código: ${account.tiktok_code}`);
          });
        }
        // Si no hay 'accounts', intentar con la estructura antigua 'data'
        else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Transformar los datos de la API (formato 'data') al formato que necesitamos
          const formattedAccounts = data.data.map((account: any) => {
            // Determinar el estado de verificación
            const isVerified = account.is_verified === 1 || account.is_verified === true ||
                           account.verified === 1 || account.verified === true;

            // Devolver el objeto formateado
            return {
              id: account.id || String(Math.random()),
              account_id: account.id || null,
              username: account.username || account.account_name || account.tiktok_username || `@usuario${Math.floor(Math.random() * 1000)}`,
              isVerified,
              tiktok_code: account.tiktok_code ? String(account.tiktok_code) : generateVerificationCode()
            };
          });

          setAccounts(formattedAccounts);
          debugMessages.push(`Procesadas ${formattedAccounts.length} cuentas reales de la API (formato 'data')`);
        } else {
          // Si no hay datos en la respuesta, mostrar mensaje de error
          debugMessages.push(`No se encontraron cuentas asociadas a este usuario en la API.`);
          setError('No se encontraron cuentas de TikTok asociadas a este usuario.');
        }
      } catch (error: any) {
        console.error('Error al obtener las cuentas de TikTok:', error);
        debugMessages.push(`Error al obtener cuentas: ${error.message}`);
        setError(`Error al cargar las cuentas: ${error.message}`);
      } finally {
        setIsLoading(false);
        setDebugInfo(debugMessages.join('\n'));
      }
    };

    // Llamar a la función para obtener las cuentas
    fetchTikTokAccounts();
  }, []);

  // Función para generar un código de verificación si no viene de la API
  const generateVerificationCode = (): string => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  // Obtener el número de intentos para una cuenta específica
  const getAttemptsForAccount = (accountId: string): number => {
    return verificationAttempts[accountId]?.count || 0;
  };

  // Verificar si una cuenta está en periodo de espera
  const isAccountInCooldown = (accountId: string): boolean => {
    if (!verificationAttempts[accountId]) return false;

    const attempt = verificationAttempts[accountId];
    if (attempt.count >= 3) {
      const now = Date.now();
      const elapsedTime = now - attempt.lastAttempt;
      return elapsedTime < 30000; // 30 segundos en milisegundos
    }
    return false;
  };

  // Calcular tiempo restante en segundos
  const getRemainingCooldownTime = (accountId: string): number => {
    if (!verificationAttempts[accountId]) return 0;

    const attempt = verificationAttempts[accountId];
    if (attempt.count >= 3) {
      const now = Date.now();
      const elapsedTime = now - attempt.lastAttempt;
      const remainingTime = Math.max(0, 30000 - elapsedTime); // 30 segundos - tiempo transcurrido
      return Math.ceil(remainingTime / 1000); // Convertir a segundos
    }
    return 0;
  };

  const handleVerify = (id: string) => {
    // Encontrar la cuenta seleccionada
    const account = accounts.find(acc => acc.id === id);
    if (account) {
      const accountId = account.id;

      // Verificar si la cuenta está en periodo de espera
      if (isAccountInCooldown(accountId)) {
        const remainingTime = getRemainingCooldownTime(accountId);
        setCooldownTimer(remainingTime);
        alert(`Has excedido el número máximo de intentos. Por favor espera ${remainingTime} segundos para intentar nuevamente.`);
        return;
      }

      // Si la cuenta había agotado intentos pero ya pasó el tiempo de espera
      if (getAttemptsForAccount(accountId) >= 3) {
        // Reiniciar intentos
        setVerificationAttempts(prev => ({
          ...prev,
          [accountId]: { count: 0, lastAttempt: Date.now() }
        }));
      }

      setSelectedAccount(account);
      setVerificationCode(account.tiktok_code || generateVerificationCode());
      setShowVerificationModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowVerificationModal(false);
    setSelectedAccount(null);
    setIsSubmitting(false);
    setCooldownTimer(null);
  };

  const handleVerifyAccount = async () => {
    if (!selectedAccount) return;

    setIsSubmitting(true);

    try {
      const accountId = selectedAccount.id;

      // Obtener el número actual de intentos
      const currentAttempts = getAttemptsForAccount(accountId);
      const newAttemptCount = currentAttempts + 1;

      // Actualizar el contador de intentos
      setVerificationAttempts(prev => ({
        ...prev,
        [accountId]: { count: newAttemptCount, lastAttempt: Date.now() }
      }));

      console.log(`Verificando cuenta ${selectedAccount.username} con código ${verificationCode} (Intento ${newAttemptCount}/3)`);

      // URL de la API para solicitar la verificación
      const verifyUrl = 'https://contabl.net/nova/request-tiktok-verification';

      // Los datos para enviar a la API
      const verifyData = {
        account_id: selectedAccount.account_id,
        tiktok_code: verificationCode,
        verified_request: new Date().toISOString() // Fecha actual como string ISO
      };

      console.log("Datos de verificación a enviar:", verifyData);

      // Simular un tiempo de respuesta
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar si se alcanzó el límite de intentos
      if (newAttemptCount >= 3) {
        setCooldownTimer(30); // Iniciar el temporizador de 30 segundos
        setIsSubmitting(false);
        setShowVerificationModal(false);
        alert(`Has alcanzado el límite de 3 intentos. Por favor espera 30 segundos para intentar nuevamente.`);
        return;
      }

      // Actualizar el estado a pendiente localmente
      setAccounts(prev =>
        prev.map(acc =>
          acc.id === selectedAccount.id ? { ...acc, isVerified: false, verifiedStatus: 'pending' } : acc
        )
      );

      // Cerrar el modal
      setShowVerificationModal(false);

      // Mensaje de éxito
      alert('Solicitud de verificación enviada correctamente. Recuerda colocar este código en la bio de tu perfil de TikTok para completar la verificación.');
    } catch (error: any) {
      console.error('Error al verificar la cuenta:', error);
      alert(`Error al verificar la cuenta: ${error.message || 'Intente de nuevo más tarde'}`);
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
        </div>
      );
    } else if (isAccountInCooldown(account.id)) {
      return (
        <div className="flex items-center text-gray-400 text-sm mt-2">
          <Clock className="w-4 h-4 mr-1" />
          <span>Espera {getRemainingCooldownTime(account.id)}s</span>
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
            Verificar{getAttemptsForAccount(account.id) > 0 ? ` (${getAttemptsForAccount(account.id)}/3)` : ''}
          </button>
        </div>
      );
    }
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
                        account.verifiedStatus === 'pending' ? 'bg-yellow-500' :
                        isAccountInCooldown(account.id) ? 'bg-gray-500' : 'bg-red-500'
                      }`}></div>
                      <span>{account.username}</span>
                    </div>
                    {renderVerificationStatus(account)}
                  </div>
                ))}
              </div>
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
                <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
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
              <div className="bg-[#161616] text-center p-3 rounded-md border border-[#1c1c1c] text-xl font-bold text-white">
                {verificationCode}
              </div>
            </div>

            {/* Indicador de intentos */}
            <div className="mt-2 mb-4 text-sm text-center">
              <span className={`${getAttemptsForAccount(selectedAccount.id) >= 2 ? 'text-red-500' : 'text-gray-400'}`}>
                Intento {getAttemptsForAccount(selectedAccount.id) + 1} de 3
              </span>
            </div>

            <button
              onClick={handleVerifyAccount}
              className={`w-full bg-[#8e4dff] hover:bg-[#7c3aed] text-white py-3 px-4 rounded-md text-center transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Verificar Cuenta de TikTok'}
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
