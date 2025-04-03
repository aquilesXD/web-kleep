import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../components/ui/Form.css';
import { LogoIcon } from '../../components/icons';

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [email, setEmail] = useState<string>('');
  const [emailMasked, setEmailMasked] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [expectedCode, setExpectedCode] = useState<string>('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Initialize the array of refs for 6 digits
  if (inputRefs.current.length !== 6) {
    inputRefs.current = Array(6).fill(null);
  }

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

    try {
      if (storedApiData) {
        const parsedData = JSON.parse(storedApiData);

        // Guardar los datos de la API tal como vienen
        setApiData(parsedData);

        // Verificar si hay datos con email_code en los elementos de la respuesta
        if (parsedData.data && Array.isArray(parsedData.data) && parsedData.data.length > 0) {
          const firstItem = parsedData.data[0];
          if (firstItem.email_code) {
            // Usar el código exacto como viene de la API
            const apiCode = String(firstItem.email_code);
            setExpectedCode(apiCode);
          }
        }

        // Si no se encontró código en los datos, buscar en la raíz de la respuesta
        if (!expectedCode && parsedData.email_code) {
          const apiCode = String(parsedData.email_code);
          setExpectedCode(apiCode);
        }

        if (!expectedCode) {
          setError("");
        }
      } else {
        setError("No se encontraron datos de verificación. Por favor, inicie sesión nuevamente.");
        setTimeout(() => navigate('/signin'), 3000);
        return;
      }
    } catch (error: any) {
      setError("Error al procesar los datos. Por favor, inicie sesión nuevamente.");
      setTimeout(() => navigate('/signin'), 3000);
      return;
    }

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
  }, [navigate]);

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
      // Obtener el código ingresado por el usuario
      const enteredCode = code.join('');

      if (!expectedCode) {
        setError('');
        return;
      }

      // Verificar si el código ingresado coincide exactamente con el código de la API
      if (enteredCode === expectedCode) {
        // Código correcto, guardar información del usuario
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.removeItem('isRegistering');

        navigate('/profile-saldo');
      } else {
        setError('Código de verificación incorrecto. Por favor, inténtelo de nuevo.');
        setCode(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      setError(`Ocurrió un error al verificar el código: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
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
          <Link className="text-white hover:underline text-sm sm:text-base" to={isRegistering ? '/signup' : '/signin'}>
            No recibí un código
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
