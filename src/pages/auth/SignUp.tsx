import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../components/ui/Form.css';
import { isEmailAllowed, addAllowedEmail } from '../../services/authService';
import { toast } from 'react-hot-toast';

// API endpoint for user creation
const API_USER_ENDPOINT = 'https://contabl.net/kleep/api/user';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/campaign-home');
    }
  }, [navigate]);

  // Validar formulario completo cuando cambian los campos
  useEffect(() => {
    setIsValidForm(
      isValidEmail && 
      name.trim().length > 0 && 
      phone.trim().length > 0 && 
      country.trim().length > 0 && 
      city.trim().length > 0
    );
  }, [isValidEmail, name, phone, country, city]);

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

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Crear URL para previsualización
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  // Función para crear un nuevo usuario
  const createUserProfile = async (userData: FormData): Promise<any> => {
    const response = await fetch(API_USER_ENDPOINT, {
      method: 'POST',
      body: userData,
    });

    if (!response.ok) {
      // Si la respuesta no es exitosa, lanzar un error con el detalle
      const errorData = await response.json().catch(() => ({
        message: `Error en el servidor: ${response.status}`,
      }));
      throw new Error(errorData.message || 'Error al crear el usuario');
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidForm) {
      setError('Por favor complete todos los campos correctamente');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('country', country);
      formData.append('city', city);
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }

      // Llamar a la API de creación de usuario
      const userResponse = await createUserProfile(formData);
      
      // Mostrar notificación de éxito
      toast.success('Usuario creado correctamente');

      // Registrar el nuevo correo en la lista de permitidos
      addAllowedEmail(email);

      // Guardar el correo y la información del usuario en localStorage
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', userResponse.id || userResponse.user_id);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Agregar información adicional del usuario
      localStorage.setItem('userInfo', JSON.stringify({
        name,
        phone,
        country,
        city,
        has_profile_picture: !!profilePicture
      }));

      // Redirigir al usuario al perfil
      navigate('/profile');
    } catch (error: any) {
      console.error('Error:', error);
      setError(`Error al crear el usuario: ${error.message}`);
      toast.error(error.message || 'Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4">
      <div className="login-container card w-full" style={{ maxWidth: '500px', borderRadius: '8px' }}>
        {/* Logo */}
        

        <h2 className="text-white w-100 mt-1 text-center text-2xl sm:text-3xl font-bold">
          Crear una cuenta
        </h2>

        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              className={`form-control w-full p-2 sm:p-3 bg-[#191919] border ${error ? 'border-red-500' : 'border-[#333]'} text-white text-sm sm:text-base`}
              id="name"
              placeholder="Nombre completo"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
          
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
          </div>
          
          <div className="mb-4">
            <input
              className={`form-control w-full p-2 sm:p-3 bg-[#191919] border ${error ? 'border-red-500' : 'border-[#333]'} text-white text-sm sm:text-base`}
              id="phone"
              placeholder="Teléfono"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>
          
          <div className="mb-4">
            <input
              className={`form-control w-full p-2 sm:p-3 bg-[#191919] border ${error ? 'border-red-500' : 'border-[#333]'} text-white text-sm sm:text-base`}
              id="country"
              placeholder="País"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isLoading}
              autoComplete="country"
            />
          </div>
          
          <div className="mb-4">
            <input
              className={`form-control w-full p-2 sm:p-3 bg-[#191919] border ${error ? 'border-red-500' : 'border-[#333]'} text-white text-sm sm:text-base`}
              id="city"
              placeholder="Ciudad"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isLoading}
              autoComplete="address-level2"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-white text-sm mb-2">Foto de perfil (opcional)</label>
            <div className="flex items-center gap-4">
              {previewUrl && (
                <div className="h-16 w-16 rounded-full overflow-hidden bg-[#333]">
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <label className="cursor-pointer bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded">
                {profilePicture ? 'Cambiar foto' : 'Subir foto'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>
          
          {error && <p className="text-red-500 text-xs mt-1 mb-2">{error}</p>}
          
          <button
            className={`w-full mt-2 bg-[#7c3aed] text-white font-medium py-2 sm:py-3 px-4 text-sm sm:text-base ${!isValidForm || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6d28d9]'}`}
            type="submit"
            disabled={!isValidForm || isLoading}
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
