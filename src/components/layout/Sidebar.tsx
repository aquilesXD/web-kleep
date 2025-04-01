import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Bell, User } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="fixed left-0 top-0 z-30 h-full w-16 bg-[#0c0c0c] border-r border-[#1c1c1c] flex flex-col items-center">
      <div className="pt-4 pb-8">
        <Link to="/">
          <svg
            fill="none"
            height="22"
            width="22"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M6.45144 8.82585C4.61127 8.82585 3.34274 9.63329 2.38277 10.5464 2.38277 10.5464 1.99515 10.9137 2.00005 10.9249L6.03163 14.9565 10.0625 10.9249C9.29915 9.87398 7.8599 8.82585 6.45144 8.82585zM16.4066 8.82585C14.5664 8.82585 13.2979 9.63329 12.3379 10.5464 12.3379 10.5464 11.9839 10.9039 11.9678 10.9249L6.98462 15.9088 11.0099 19.934 20.0176 10.9249C19.2543 9.87398 17.8157 8.82585 16.4066 8.82585zM26.3889 8.82585C24.5487 8.82585 23.2802 9.63329 22.3202 10.5464 22.3202 10.5464 21.9515 10.9067 21.9375 10.9249L11.9691 20.8947 13.0242 21.9498C14.6566 23.5822 17.3287 23.5822 18.9611 21.9498L29.9874 10.9249H30C29.2366 9.87398 27.7981 8.82585 26.3889 8.82585z"
              fill="currentColor"
            />
          </svg>
        </Link>
      </div>

    <div className="flex flex-col items-center justify-center h-full -mt-12 space-y-4">

      </div>
    </div>
  );
};

export default Sidebar;
