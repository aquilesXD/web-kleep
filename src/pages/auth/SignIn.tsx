import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../components/ui/Form.css';
import { LogoIcon } from '../../components/icons';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/profile-saldo');
    }
  }, [navigate]);

  // Función para validar formato de correo electrónico
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValidEmail(validateEmail(value));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail) {
      setError('Por favor ingrese un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Realizar petición a la API
      const apiUrl = `https://contabl.net/nova/get-videos-to-pay?email=${encodeURIComponent(email)}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }

      const responseData = await response.json();

      // Verificar si la API devolvió datos
      if (responseData && responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
        // La API devolvió datos para este correo, proceder con la autenticación

        // Guardar la respuesta exacta de la API sin modificaciones
        localStorage.setItem('userEmail', email);
        localStorage.setItem('apiResponse', JSON.stringify(responseData));
        localStorage.setItem('isRegistering', 'false');

        // Redirigir a la página de verificación
        navigate('/verify-code');
      } else {
        // La API no devolvió datos para este correo
        setError('Correo electrónico no encontrado en el sistema. Por favor verifique o contacte a soporte.');
      }
    } catch (error: any) {
      setError(`No se pudo conectar con el servidor: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center max-w-5xl w-full">
        {/* Se ha eliminado el Logo Mini a un costado */}

        {/* Formulario de inicio de sesión */}
        <div className="login-container card w-full" style={{ maxWidth: '450px', borderRadius: '8px' }}>
          {/* Logo */}
          <div className="logo mt-4 text-center">
            <LogoIcon width={40} height={40} className="mx-auto" />
          </div>

          <h2 className="text-white w-100 mt-1 text-center text-2xl sm:text-3xl font-bold">
            Iniciar sesión
          </h2>

          <form className="mt-6 px-4 sm:px-6" onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                className={`form-control w-full p-2 sm:p-3 bg-[#191919] border ${error ? 'border-red-500' : 'border-[#333]'} text-white text-sm sm:text-base`}
                id="email"
                placeholder="Tu correo"
                type="email"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
                autoComplete="email"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <button
              className={`w-full mt-2 bg-[#7c3aed] text-white font-medium py-2 sm:py-3 px-4 text-sm sm:text-base ${!isValidEmail || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6d28d9]'}`}
              type="submit"
              disabled={!isValidEmail || isLoading}
            >
              {isLoading ? 'Cargando...' : 'Continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
