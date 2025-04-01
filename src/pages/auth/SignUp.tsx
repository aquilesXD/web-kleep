import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../components/ui/Form.css';
import { isEmailAllowed, addAllowedEmail } from '../../services/authService';

const SignUp: React.FC = () => {
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

  // Función para validar correo electrónico
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

    // Comentamos esta validación para permitir cualquier correo válido
    // if (isEmailAllowed(email)) {
    //   setError('Este correo electrónico ya está registrado. Por favor, inicie sesión.');
    //   return;
    // }

    setIsLoading(true);
    setError(null);

    try {
      // Realizar petición a la API real
      console.log(`Registering email: ${email}`);
      const apiUrl = `https://contabl.net/nova/get-videos-to-pay?email=${encodeURIComponent(email)}`;
      console.log(`API URL: ${apiUrl}`);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Registration API Response:", responseData);

      // Verificar que la respuesta sea válida
      if (!responseData) {
        throw new Error('La respuesta de la API no es válida');
      }

      // Procesar la respuesta en el formato {"data":[...]}
      const data = responseData.data || [];

      // Generar un código de verificación temporal
      // Esto es necesario porque la respuesta de la API no incluye un código específico
      const emailCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Crear el objeto de datos a almacenar
      const authData = {
        email_code: emailCode,
        data: data
      };

      console.log("Using verification code:", emailCode);

      // Registrar el nuevo correo en la lista de permitidos
      addAllowedEmail(email);

      // Guardar el correo y la respuesta de la API en localStorage para su uso en la pantalla de verificación
      localStorage.setItem('userEmail', email);
      localStorage.setItem('apiResponse', JSON.stringify(authData));
      localStorage.setItem('isRegistering', 'true'); // Indicar que estamos en proceso de registro

      // Redirigir a la página de verificación
      navigate('/verify-code');
    } catch (error: any) {
      console.error('Error:', error);
      setError(`No se pudo conectar con el servidor: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4">
      <div className="login-container card w-full" style={{ maxWidth: '400px', borderRadius: '8px' }}>
        {/* Logo */}
        <div className="logo mt-4 text-center">
          <img
            alt="Clipper Logo"
            src="https://whop.com/oauth/_next/image/?url=%2Foauth%2Fwhop-logo-square.png&w=48&q=75"
            className="mx-auto"
            style={{ borderRadius: '8px' }}
          />
        </div>

        <h2 className="text-white w-100 mt-1 text-center text-2xl sm:text-3xl font-bold">
          Crear una cuenta
        </h2>

        <form className="mt-6" onSubmit={handleSubmit}>
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

        <div className="create-account">
          <hr className="border-t border-[#333] my-4" />
          <div className="mt-3 flex items-center justify-center">
            <p className="text-white text-center text-sm sm:text-base">
              ¿Ya tienes una cuenta?
              <Link className="text-[#7c3aed] ml-1 hover:underline" to="/signin">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
