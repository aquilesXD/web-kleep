// Lista de correos electrónicos permitidos
export const ALLOWED_EMAILS = [
  'usuario1@ejemplo.com',
  'usuario2@ejemplo.com',
  'admin@clipper.com',
  'test@clipper.com',
  'demo@clipper.com'
];

// Clave para almacenar los correos en localStorage
const STORED_EMAILS_KEY = 'clipper_registered_emails';

/**
 * Inicializa el servicio de autenticación cargando los correos electrónicos guardados
 */
export const initAuthService = (): void => {
  try {
    // Intentar cargar correos registrados del localStorage
    const storedEmails = localStorage.getItem(STORED_EMAILS_KEY);
    if (storedEmails) {
      const emailsArray = JSON.parse(storedEmails) as string[];

      // Añadir los correos almacenados a la lista de permitidos (sin duplicados)
      emailsArray.forEach(email => {
        if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
          ALLOWED_EMAILS.push(email.toLowerCase());
        }
      });

      console.log('Correos electrónicos cargados del almacenamiento local:', ALLOWED_EMAILS);
    }
  } catch (error) {
    console.error('Error al cargar los correos electrónicos registrados:', error);
  }
};

/**
 * Agrega un nuevo correo electrónico a la lista de permitidos
 * @param email Correo electrónico a agregar
 */
export const addAllowedEmail = (email: string): void => {
  const normalizedEmail = email.toLowerCase();

  // Solo agregar si no existe ya
  if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
    ALLOWED_EMAILS.push(normalizedEmail);

    try {
      // Guardar en localStorage para persistencia
      localStorage.setItem(STORED_EMAILS_KEY, JSON.stringify(ALLOWED_EMAILS));
      console.log(`Correo electrónico registrado con éxito: ${normalizedEmail}`);
    } catch (error) {
      console.error('Error al guardar el correo electrónico:', error);
    }
  }
};

/**
 * Verifica si un correo electrónico está permitido
 * @param email Correo electrónico a verificar
 * @returns true si el correo está permitido, false en caso contrario
 */
export const isEmailAllowed = (email: string): boolean => {
  return ALLOWED_EMAILS.includes(email.toLowerCase());
};

/**
 * Simula el cierre de sesión eliminando datos de autenticación
 */
export const logout = (): void => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('apiResponse');
};

// Inicializar el servicio al importar el módulo
initAuthService();
