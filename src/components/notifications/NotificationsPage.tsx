import { useState, useEffect } from "react";
import { Cog, MessageSquare, Heart, Share2, User, Bell, Check } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "../layout/MainLayout";


// Tipos de datos para las notificaciones
interface Notification {
  id: string;
  type: 'mention' | 'like' | 'follow' | 'share' | 'message' | 'system';
  user?: {
    name: string;
    avatar: string;
  };
  content: string;
  fullContent?: string;
  whopId?: string;
  timestamp: Date;
  read: boolean;
  date: 'today' | 'yesterday' | 'older';
}

// Función auxiliar para crear una fecha relativa
const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (hours < 1) return "Ahora";
  if (hours < 24) return `Today, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
  if (hours < 48) return `Yesterday, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

  return `${date.toLocaleDateString()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
};

// Datos de ejemplo para las notificaciones que se asemejan más a la captura de pantalla
const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'mention',
    user: {
      name: 'Azan',
      avatar: 'https://i.pravatar.cc/100?u=azan1',
    },
    content: '@everyone giving $5 at the end of the day to the most helpful person. -you can help others out, -guide them -give advice -calling out scammers And etc etc etc',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 2, 29)),
    date: 'today',
    read: false,
  },
  {
    id: '2',
    type: 'mention',
    user: {
      name: 'Azan',
      avatar: 'https://i.pravatar.cc/100?u=azan1',
    },
    content: '@everyone giving $5 at the end of the day to the most helpful person. -you can help others out, -guide them -give advice -calling out scammers And etc etc etc',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 3, 44)),
    date: 'today',
    read: false,
  },
  {
    id: '3',
    type: 'mention',
    user: {
      name: 'Azan',
      avatar: 'https://i.pravatar.cc/100?u=azan1',
    },
    content: '@everyone if anyone wants to join our paid community.. Here\'s some other things that were going to be offering: - Exclusive deals - 1-1 calls with Maxim - Everything from how to start the account a',
    fullContent: '@everyone if anyone wants to join our paid community.. Here\'s some other things that were going to be offering: - Exclusive deals - 1-1 calls with Maxim - Everything from how to start the account and more',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 4, 36)),
    date: 'today',
    read: false,
  },
  {
    id: '4',
    type: 'mention',
    user: {
      name: 'Azan',
      avatar: 'https://i.pravatar.cc/100?u=azan1',
    },
    content: '@everyone giving $5 at the end of the day to the most helpful person. -you can help others out, -guide them -give advice And etc etc etc',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 5, 24)),
    date: 'today',
    read: false,
  },
  {
    id: '5',
    type: 'mention',
    user: {
      name: 'Azan',
      avatar: 'https://i.pravatar.cc/100?u=azan1',
    },
    content: '@everyone giving $5 at the end of the day to the most helpful person. -you can help others out, -guide them -give advice And etc etc etc',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 6, 18)),
    date: 'today',
    read: false,
  },
  {
    id: '6',
    type: 'mention',
    user: {
      name: 'Azan',
      avatar: 'https://i.pravatar.cc/100?u=azan1',
    },
    content: 'Yo @everyone who would want a giveaway for most helpful person of the week/month? Like yall helping others and calling out scammers etc',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 12, 10)),
    date: 'today',
    read: false,
  },
  {
    id: '7',
    type: 'mention',
    user: {
      name: 'Azan',
      avatar: 'https://i.pravatar.cc/100?u=azan1',
    },
    content: '@everyone we had an amazing call in our paid whop, and this is just the start of what we have in store🔥 If you still haven\'t joined.. Here\'s some other things that were going to be offering: - Exclu',
    fullContent: '@everyone we had an amazing call in our paid whop, and this is just the start of what we have in store🔥 If you still haven\'t joined.. Here\'s some other things that were going to be offering: - Exclusive deals and more',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 14, 38)),
    date: 'today',
    read: false,
  },
  {
    id: '8',
    type: 'mention',
    user: {
      name: 'eric',
      avatar: 'https://i.pravatar.cc/100?u=eric1',
    },
    content: '@everyone who is cooking on whop rn? want to reward some of the grinders 🤑',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 34, 23)),
    date: 'yesterday',
    read: false,
  },
  {
    id: '9',
    type: 'mention',
    user: {
      name: 'Azan',
      avatar: 'https://i.pravatar.cc/100?u=azan1',
    },
    content: '@everyone we had an amazing call in our paid whop, and this is just the start of what we have in store🔥 If you still haven\'t joined.. Here\'s some other things that were going to be offering: - Exclu',
    fullContent: '@everyone we had an amazing call in our paid whop, and this is just the start of what we have in store🔥 If you still haven\'t joined.. Here\'s some other things that were going to be offering: - Exclusive deals and more',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 36, 1)),
    date: 'yesterday',
    read: false,
  },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [groupedNotifications, setGroupedNotifications] = useState<{[key: string]: Notification[]}>({});

  // Agrupar notificaciones por fecha
  useEffect(() => {
    const grouped = notifications.reduce((acc, notification) => {
      const key = notification.date;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(notification);
      return acc;
    }, {} as {[key: string]: Notification[]});

    setGroupedNotifications(grouped);
  }, [notifications]);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  return (
    <MainLayout>
      <div className="flex flex-col w-full h-full min-h-screen bg-[#121212] text-white">
        {/* Header Principal */}
        <div className="sticky top-0 z-10 bg-[#121212] border-b border-[#1c1c1c] px-4 py-3">
          <h1 className="text-xl font-bold">Notificaciones</h1>
        </div>

        {/* Barra de navegación simplificada */}
        <div className="sticky top-14 z-10 bg-[#121212] border-b border-[#1c1c1c] px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex">
              <span className="px-4 py-2 text-sm font-medium text-white">
                Toda la actividad
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                className="px-3 py-1.5 rounded-md bg-transparent border border-[#333] hover:bg-[#1a1a1a] text-white text-sm transition-colors flex items-center"
              >
                <span>Marcar todo como leído</span>
              </button>
        
            </div>
          </div>
        </div>

        {/* Lista de notificaciones agrupadas por fecha */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(groupedNotifications).map(([date, notifications]) => (
            <div key={date} className="border-b border-[#1c1c1c]">
              {/* Encabezado de sección con fecha */}
              {date !== 'older' && (
                <div className="py-1 px-4 text-xs text-gray-500 uppercase bg-[#0f0f0f]">
                  {date}
                </div>
              )}

              {/* Notificaciones de esta fecha */}
              <ul className="divide-y divide-[#1c1c1c]">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="hover:bg-[#111] transition-colors cursor-pointer"
                  >
                    <div className="px-4 py-3 flex items-start">
                      {/* Avatar */}
                      <div className="flex-shrink-0 mt-0.5">
                        <img
                          src={notification.user?.avatar}
                          alt={notification.user?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>

                      {/* Contenido */}
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-semibold text-white text-sm">{notification.user?.name}</div>
                          <div className="text-xs text-gray-500">{getRelativeTimeString(notification.timestamp)}</div>
                        </div>
                        <p className="text-sm text-gray-300 break-words leading-relaxed">
                          {notification.content}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Estado vacío si no hay notificaciones */}
          {Object.keys(groupedNotifications).length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 p-6">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
                <Bell className="text-gray-500" size={24} />
              </div>
              <h2 className="text-lg font-medium text-white mb-2">
                No hay notificaciones
              </h2>
              <p className="text-gray-400 text-center text-sm max-w-md">
                No tienes notificaciones actualmente
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
