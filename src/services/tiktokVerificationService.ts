/**
 * Servicio para manejar las operaciones relacionadas con la verificación de cuentas de TikTok
 */

interface TikTokAccount {
    id: string;
    username: string;
    isVerified: boolean;
    verifiedStatus?: string;
    tiktok_code?: string;
    account_id?: string;
    verified_request?: string;
    verified_att?: number; // Contador de intentos de verificación
  }
  
  interface VerificationResponse {
    success: boolean;
    message: string;
    account?: TikTokAccount;
  }
  
  /**
   * Obtiene las cuentas de TikTok asociadas a un usuario
   * @param userId ID del usuario
   * @returns Promise con las cuentas formateadas
   */
  export const fetchTikTokAccounts = async (userId: string): Promise<TikTokAccount[]> => {
    try {
      const apiUrl = `https://contabl.net/nova/get-tiktok-accounts-by-user?id_user=${encodeURIComponent(userId)}`;
  
      const response = await fetch(apiUrl);
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("TikTok accounts API Response:", data);
  
      // Verificar la estructura de la respuesta
      if (!data || (!data.accounts && !data.data)) {
        throw new Error('Formato de respuesta inválido');
      }
  
      // Procesar las cuentas según el formato (accounts o data)
      const accountsArray = data.accounts || data.data || [];
  
      if (!Array.isArray(accountsArray)) {
        throw new Error('El campo accounts/data no es un array');
      }
  
      // Transformar los datos al formato que necesita la UI
      return accountsArray.map((account: any) => {
        // Asegurar que verified_att sea un número y que exista
        let verifiedAttempts = 0;
        if (account.verified_att !== undefined) {
          // Si existe, asegurarnos de que sea un número
          verifiedAttempts = typeof account.verified_att === 'number'
            ? account.verified_att
            : parseInt(account.verified_att, 10) || 0;
        }
  
        return {
          id: account.id || String(Math.random()),
          account_id: account.id || null,
          username: account.account || account.username || `@${account.id_user || 'usuario'}`,
          isVerified: account.verified === 1 || account.verified === true,
          verifiedStatus: account.verified === 0 && account.verified_request ? 'pending' : undefined,
          tiktok_code: account.tiktok_code ? String(account.tiktok_code) : generateVerificationCode(),
          verified_request: account.verified_request,
          verified_att: verifiedAttempts  // Asegurar que siempre sea un número
        };
      });
    } catch (error: any) {
      console.error('Error al obtener cuentas de TikTok:', error);
      throw error;
    }
  };
  
  /**
   * Genera un código de verificación aleatorio
   * @returns Código de verificación
   */
  export const generateVerificationCode = (): string => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };
  
  /**
   * Solicita la verificación de una cuenta de TikTok
   * @param accountId ID de la cuenta
   * @param tiktokCode Código de verificación
   * @param currentAttempts Número actual de intentos (opcional)
   * @returns Promise con el resultado de la solicitud
   */
  export const requestTikTokVerification = async (
    accountId: string | undefined,
    tiktokCode: string,
    currentAttempts: number = 0
  ): Promise<VerificationResponse> => {
    try {
      if (!accountId) {
        throw new Error('ID de cuenta no proporcionado');
      }
  
      // Incrementar el contador de intentos (sin límite máximo)
      const newAttemptCount = currentAttempts + 1;
  
      // En una implementación real, esto llamaría a la API de verificación
      // Por ahora, simularemos el proceso
      const verifyUrl = 'https://contabl.net/nova/request-tiktok-verification';
  
      const verifyData = {
        account_id: accountId,
        tiktok_code: tiktokCode,
        verified_request: new Date().toISOString(),
        verified_att: newAttemptCount
      };
  
      console.log("Datos de verificación a enviar:", verifyData);
  
      // Simulación de llamada a la API
      // En un entorno real, descomenta este código y elimina la simulación
      /*
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verifyData)
      });
  
      if (!response.ok) {
        throw new Error(`Error en la verificación: ${response.status}`);
      }
  
      const result = await response.json();
      */
  
      // Simulación del resultado (eliminar en producción)
      const result = {
        success: true,
        message: `Solicitud de verificación registrada correctamente (Intento ${newAttemptCount})`,
        data: {
          ...verifyData,
          id: accountId
        }
      };
  
      return {
        success: true,
        message: result.message || 'Solicitud de verificación enviada correctamente',
        account: {
          id: accountId,
          account_id: accountId,
          username: '', // La UI actualizará este valor
          isVerified: false,
          verifiedStatus: 'pending',
          tiktok_code: tiktokCode,
          verified_request: verifyData.verified_request,
          verified_att: newAttemptCount
        }
      };
    } catch (error: any) {
      console.error('Error al solicitar verificación:', error);
      return {
        success: false,
        message: error.message || 'Error al solicitar verificación'
      };
    }
  };
  
  /**
   * Verifica el estado actual de las cuentas pendientes
   * @param accountIds Array de IDs de cuentas a verificar
   * @returns Promise con las cuentas actualizadas
   */
  export const checkVerificationStatus = async (accountIds: string[]): Promise<TikTokAccount[]> => {
    try {
      if (!accountIds.length) {
        return [];
      }
  
      console.log("Verificando estado de cuentas:", accountIds);
  
      // Intentar obtener los datos actuales de localStorage para preservar los contadores de intentos
      const apiResponse = localStorage.getItem('apiResponse');
      let currentAccounts: any[] = [];
  
      if (apiResponse) {
        try {
          const parsedResponse = JSON.parse(apiResponse);
          if (parsedResponse.data && Array.isArray(parsedResponse.data)) {
            currentAccounts = parsedResponse.data;
          }
        } catch (e) {
          console.error("Error parsing API response:", e);
        }
      }
  
      // Simulación (eliminar en producción)
      // En un entorno real, esto sería reemplazado por la respuesta de la API
      return accountIds.map(id => {
        // Buscar la cuenta en los datos actuales para obtener intentos previos
        const existingAccount = currentAccounts.find(acc => acc.id === id || acc.account_id === id);
        const previousAttempts = existingAccount?.verified_att || 0;
  
        // Simulación más realista: no verificar en el primer intento
        // Solo verificar si hay al menos 3 intentos previos y con baja probabilidad
        let isVerified = false;
  
        if (previousAttempts >= 3) {
          // 20% de probabilidad después de 3 intentos
          isVerified = Math.random() > 0.8;
        }
  
        console.log(`Verificación de cuenta ${id}: ${isVerified ? 'VERIFICADA' : 'PENDIENTE'}, intentos previos: ${previousAttempts}`);
  
        return {
          id,
          account_id: id,
          username: existingAccount?.username || existingAccount?.account || '', // Preservar nombre si existe
          isVerified,
          verifiedStatus: isVerified ? undefined : 'pending',
          verified_att: previousAttempts // Preservar el contador de intentos
        };
      });
    } catch (error: any) {
      console.error('Error al verificar estado de cuentas:', error);
      return [];
    }
  };
  
  export default {
    fetchTikTokAccounts,
    generateVerificationCode,
    requestTikTokVerification,
    checkVerificationStatus
  };
  