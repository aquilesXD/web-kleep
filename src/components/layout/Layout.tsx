import { Outlet, useNavigate } from 'react-router-dom';
import ProfileSidebar from './ProfileSidebar';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

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
        className="md:hidden fixed top-4 left-4 z-40 bg-[#161616] p-2 rounded-md"
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
              <ProfileSidebar mobile={true} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 ml-0 md:ml-16 p-2 sm:p-4 md:p-6">
        <div className="flex flex-col lg:flex-row h-full md:h-[calc(100vh-48px)] rounded-xl overflow-hidden border border-[#1c1c1c]">
          {/* Left sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-64 border-r border-[#1c1c1c]">
            <ProfileSidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 md:px-6 py-3 border-b border-[#1c1c1c] flex items-center justify-between">
              <h1 className="text-lg md:text-xl font-medium">Mi Wallet</h1>
            </div>

            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
