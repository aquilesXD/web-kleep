import { Outlet, useNavigate } from 'react-router-dom';
import ProfileSidebar from './ProfileSidebar';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import LogoKleep from '../icons/LogoKleep';
import Sidebar from './Sidebar';



const Layout = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [navigate]);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <div className="flex min-h-screen bg-[#0c0c0c] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-9 right-4 z-40 bg-[#161616] p-2 rounded-md"
      >
        {showMobileSidebar ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Sidebar */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleMobileSidebar}></div>
          <div className="absolute left-0 top-0 h-full w-64 bg-[#0c0c0c] border-r border-[#1c1c1c] p-4">
            <div className="flex justify-end">
              <button onClick={toggleMobileSidebar} className="p-2">
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
            <ProfileSidebar mobile={true} onCloseMobileMenu={() => setShowMobileSidebar(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 ml-0 md:ml-16 p-2 sm:p-4 md:p-6">
        <div className="flex flex-col lg:flex-row h-full md:h-[calc(100vh-48px)] rounded-xl overflow-hidden border border-[#1c1c1c]">
          {/* Left sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-64 border-r border-[#1c1c1c]">
          <Sidebar />
            <ProfileSidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 md:px-6 py-3 border-b border-[#1c1c1c] flex items-center justify-between">
            <div className="flex items-center gap-2">
            <LogoKleep />
            
            </div>
            </div>

            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>

            <div className="mt-6 px-4 md:px-6 pb-6 text-sm text-center text-gray-400">
             <p>
              <strong>¿Tienes dudas o necesitas ayuda? Escríbenos por WhatsApp:</strong>
              </p>
              <a
             href="https://wa.me/15757284361"
             target="_blank"
             rel="noopener noreferrer"
           className="text-green-400 hover:underline"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline-block mr-1">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            +1 (575) 728-4361
            </a>
           </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
