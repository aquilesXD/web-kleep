import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../components/ui/Form.css';
import { LogoIcon } from '../../components/icons';
import { sendVerificationCode, getVideoToPay } from '../../services/authService';

// Almacenamiento de código global para asegurar sincronización
const VERIFICATION_STATE = {
  latestCode: '',
  codeTimestamp: 0
};

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [email, setEmail] = useState<string>('');
  const [emailMasked, setEmailMasked] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [expectedCode, setExpectedCode] = useState<string>('');
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Estado para mostrar el código actual (solo para depuración)
  const [debugInfo, setDebugInfo] = useState<string>('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const latestCodeRef = useRef<string>('');
const codeTimestampRef = useRef<number>(0);

  // Initialize the array of refs for 6 digits
  if (inputRefs.current.length !== 6) {
    inputRefs.current = Array(6).fill(null);
  }

  // Este efecto se ejecuta cuando el componente se monta
  useEffect(() => {
    // Recuperar el correo y datos de la API del localStorage
    const storedEmail = localStorage.getItem('userEmail');
    const storedApiData = localStorage.getItem('apiResponse');
    const registering = localStorage.getItem('isRegistering') === 'true';
    

    setIsRegistering(registering);

    if (!storedEmail) {
      // Si no hay correo almacenado, redirigir a la página de inicio de sesión
      navigate('/signin');
      return;
    }

    // Extraer y establecer el código esperado
    extractAndSetExpectedCode(storedApiData);

    // Enmascarar el correo electrónico
    const maskEmail = (email: string) => {
      const [username, domain] = email.split('@');
      if (!username || !domain) {
        return email; // Devolver el email original si no tiene formato válido
      }
      if (username.length <= 3) {
        return `${username}***@${domain}`;
      }
      return `${username.substring(0, 3)}${'*'.repeat(Math.min(5, username.length - 3))}@${domain}`;
    };

    setEmail(storedEmail);
    setEmailMasked(maskEmail(storedEmail));

    // Actualizar información de depuración
    updateDebugInfo();

    // Intentar establecer el foco en el primer campo de entrada
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 500);
  }, [navigate]);

  // Función para extraer y establecer el código esperado a partir de los datos de la API
  const extractAndSetExpectedCode = (apiDataStr: string | null) => {
    if (!apiDataStr) {
      setError("No se encontraron datos de verificación. Por favor, inicie sesión nuevamente.");
      setTimeout(() => navigate('/signin'), 3000);
      return;
    }

    try {
      const parsedData = JSON.parse(apiDataStr);
      setApiData(parsedData);

      // Extraer el código de verificación de la respuesta
      let foundCode = '';

      // 1. Primero, buscar en data[0].email_code (estructura más común)
      if (parsedData.data && Array.isArray(parsedData.data) && parsedData.data.length > 0) {
        foundCode = parsedData.data[0].email_code || '';
      }

      // 2. Si no se encontró, buscar en la raíz
      if (!foundCode && parsedData.email_code) {
        foundCode = parsedData.email_code;
      }

      // 3. Buscar recursivamente cualquier campo que pueda contener el código
      if (!foundCode) {
        foundCode = findCodeInObject(parsedData) || '';
      }

      // Si se encontró un código, establecerlo
      if (foundCode) {
        // Actualizar el código tanto en el estado como en el almacenamiento global
        setExpectedCode(String(foundCode));
        updateLatestCode(String(foundCode));
      } else {
        setError("No se pudo encontrar un código de verificación. Por favor, solicite un nuevo código.");
      }
    } catch (error) {
      setError("Error al procesar los datos. Por favor, inicie sesión nuevamente.");
      setTimeout(() => navigate('/signin'), 3000);
    }
  };

  // Función para actualizar el código más reciente en el almacenamiento global
  const updateLatestCode = (newCode: string) => {
    const trimmed = newCode.trim();
    if (!trimmed) return;
  
    latestCodeRef.current = trimmed;
    codeTimestampRef.current = Date.now();
  
    try {
      localStorage.setItem('latest_verification_code', trimmed);
      localStorage.setItem('latest_code_timestamp', String(Date.now()));
    } catch (e) {
      console.warn("No se pudo guardar en localStorage:", e);
    }
  
    setExpectedCode(trimmed);
    updateDebugInfo();
  };

  // Función para actualizar la información de depuración
  const updateDebugInfo = () => {
    setDebugInfo(`Código actual: ${VERIFICATION_STATE.latestCode} (actualizado hace ${Math.floor((Date.now() - VERIFICATION_STATE.codeTimestamp)/1000)} segundos)`);
  };

  // Función recursiva para buscar un código en un objeto
  const findCodeInObject = (obj: any): string | undefined => {
    if (!obj || typeof obj !== 'object') return undefined;

    // Buscar propiedades que contengan "code" o "código"
    for (const key in obj) {
      if (key.toLowerCase().includes('code') || key.toLowerCase().includes('codigo') || key.toLowerCase().includes('código')) {
        if (obj[key] && (typeof obj[key] === 'string' || typeof obj[key] === 'number')) {
          return String(obj[key]);
        }
      }

      // Buscar recursivamente en objetos anidados
      if (typeof obj[key] === 'object') {
        const found = findCodeInObject(obj[key]);
        if (found) return found;
      }
    }

    return undefined;
  };

  // Verificar código completo
  useEffect(() => {
    const isCodeComplete = code.every(digit => digit !== '');

    if (isCodeComplete && code.length === 6) {
      verifyCode();
    }
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;

    // Solo permitir dígitos
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    // Update the code state
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Move focus to next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move focus to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async () => {
    setIsVerifying(true);
    setError(null);
  
    try {
      const enteredCode = code.join('').trim();
  
      if (enteredCode.length !== 6) {
        setError('Por favor, ingrese el código de 6 dígitos completo.');
        setIsVerifying(false);
        return;
      }
  
      const expected = latestCodeRef.current.trim() || expectedCode.trim();
      const age = Date.now() - codeTimestampRef.current;
  
  
      if (enteredCode === expected) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.removeItem('isRegistering');
        navigate('/profile-saldo');
      } else {
        setError('Código de verificación incorrecto. Por favor, revisa e intenta de nuevo.');
        setCode(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      setError(`Ocurrió un error al verificar el código: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Función para reenviar el código
  const handleResendCode = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSendingCode(true);
  
    try {
      const userId = extractUserId(apiData);
      if (!userId) {
        throw new Error('No se pudo determinar el ID de usuario. Inicia sesión nuevamente.');
      }
   
      await sendVerificationCode(userId, email);
  
      // 🔄 Esperar brevemente para que el backend actualice el nuevo código
      await new Promise((res) => setTimeout(res, 3000));
      const refreshed = await getVideoToPay(email);


      const refreshedData = await getVideoToPay(email);
      localStorage.setItem('apiResponse', JSON.stringify(refreshedData));
      setApiData(refreshedData);
  
      const newCode = findCodeInObject(refreshedData);
      if (!newCode) {
        throw new Error("No se encontró el nuevo código en la respuesta del servidor.");
      }
  
      
      updateLatestCode(newCode);
      setSuccessMessage('✅ Código reenviado correctamente. Revisa tu correo electrónico.');
  
      // Limpiar inputs
      setCode(Array(6).fill(''));
      inputRefs.current[0]?.focus();
  
    } catch (error: any) {
      setError(`Error al reenviar el código: ${error.message}`);
    } finally {
      setIsSendingCode(false);
      updateDebugInfo();
    }
  };

  // Función auxiliar para extraer el ID de usuario
  const extractUserId = (data: any): string => {
    let userId = '';

    // Buscar en data[0] si existe
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      userId = data.data[0].user_id || data.data[0].id_user || data.data[0].id || '';
    }

    // Si no se encuentra, buscar en la raíz
    if (!userId) {
      userId = data?.user_id || data?.id_user || data?.id || '';
    }

    return userId;
  };

  const handleBackClick = () => {
    navigate(isRegistering ? '/signup' : '/signin');
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4">
      <div className="verification-container card w-full" style={{ maxWidth: '400px', borderRadius: '8px', backgroundColor: '#191919' }}>
        <div className="logo mt-4 text-center">
          <LogoIcon width={40} height={40} className="mx-auto" />
        </div>

        <h2 className="text-white text-center mt-4 text-xl sm:text-2xl font-bold">
          {isRegistering ? '¡Bienvenido a Clipper!' : '¡Bienvenido de nuevo!'}
        </h2>

        <p className="text-[#aaa] text-center mb-6 text-sm sm:text-base mt-2">
          {isRegistering
            ? 'Ingrese el código para verificar su cuenta'
            : 'Ingrese el código que recibió en su correo electrónico'
          }
          <br />
          <strong className="text-white block mt-1">
            {emailMasked}
          </strong>
        </p>


        {error && (
          <div className="text-red-500 text-sm text-center mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="text-green-500 text-sm text-center mb-4">
            {successMessage}
          </div>
        )}

        <div className="code-input flex justify-center mb-6">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              className={`w-10 h-10 sm:w-12 sm:h-12 mx-1 text-center text-lg sm:text-xl bg-[#0c0c0c] border ${error ? 'border-red-500' : 'border-[#333]'} text-white`}
              maxLength={1}
              value={code[index]}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              style={{ borderRadius: '8px' }}
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={isVerifying}
            />
          ))}
        </div>

        <button
          onClick={handleBackClick}
          className="btn-back text-white bg-transparent border-0 cursor-pointer flex items-center justify-center w-full mb-2 text-sm sm:text-base"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div className="no-code text-center mt-2">
          <button
            className="text-white hover:underline text-sm sm:text-base"
            onClick={handleResendCode}
            disabled={isSendingCode}
          >
            {isSendingCode ? 'Enviando...' : 'No recibí un código - Reenviar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
