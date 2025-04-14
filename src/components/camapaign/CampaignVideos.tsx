import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { ExternalLink, AlertTriangle, X } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import { CampaignSidebar } from "../layout/CampainSidebar";

interface VideoItem {
  id: string;
  creator: string;
  video_link: string;
  views: number;
  total_to_pay: number;
  status: number;
  status_note?: string;
}

export function CampaignVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      const email = localStorage.getItem("email");
      if (!email) return;

      try {
        const response = await fetch(`https://contabl.net/nova/get-videos-to-pay?email=${email}`);
        const data: VideoItem[] = await response.json();

        setVideos(data);

        const uniqueCreators = [
          ...new Set(
            data
              .filter((v: VideoItem) => v.status !== 1 && v.creator)
              .map((v: VideoItem) => v.creator!)
          ),
        ];

        setPendingAccounts(uniqueCreators);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("No se pudo cargar la información de los videos.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const openModal = (video: VideoItem) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedVideo(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <Sidebar />
      <div className="pl-20 lg:pl-24">
        <div className="flex flex-col lg:flex-row">
          <CampaignSidebar activeItem="videos" />

          <div className="flex-1 p-4 lg:p-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-6 lg:mb-8">MIS VIDEOS</h1>

              <h2 className="text-lg lg:text-xl text-white mb-6 lg:mb-8 text-center">
                Podcast de Tucker Carlson + Noticias // $ 4 por cada 1.000 visitas
              </h2>

              {loading ? (
                <p className="text-gray-400 text-sm text-center">Cargando videos...</p>
              ) : error ? (
                <p className="text-red-500 text-sm text-center">{error}</p>
              ) : (
                <div className="border border-[#222] rounded-sm overflow-hidden mb-6 lg:mb-8">
                  <div className="hidden lg:grid grid-cols-5 bg-[#111] border-b border-[#222] text-gray-400 text-xs uppercase">
                    <div className="p-4">Cuentas</div>
                    <div className="p-4">Video</div>
                    <div className="p-4">Vistas</div>
                    <div className="p-4">Total a pagar</div>
                    <div className="p-4">Estado</div>
                  </div>

                  {videos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => {
                        if (video.status === 0 && video.status_note) {
                          openModal(video);
                        }
                      }}
                      className="border-b border-[#222] text-white p-4 lg:grid lg:grid-cols-5 hover:bg-[#1c1c1c] cursor-pointer transition"
                    >
                      <div className="text-sm mb-2 lg:mb-0">{video.creator}</div>
                      <div className="mb-2 lg:mb-0">
                        <a
                          href={video.video_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 text-sm flex items-center"
                        >
                          Ver video <ExternalLink size={14} className="ml-1" />
                        </a>
                      </div>
                      <div className="text-sm mb-2 lg:mb-0">{formatNumber(video.views)}</div>
                      <div className="text-sm mb-2 lg:mb-0">${video.total_to_pay.toFixed(2)}</div>
                      <div>
                      {video.status === 1 && (
                        <span className="inline-flex items-center bg-green-900/30 text-green-500 text-xs px-2 py-1 rounded">
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Aprobado
                        </span>
                      )}
                      {video.status === 0 && (
                        <span className="inline-flex items-center bg-red-900/30 text-red-500 text-xs px-2 py-1 rounded">
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M18 6L6 18M6 6L18 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          Rechazado
                        </span>
                      )}
                      {video.status === 2 && (
                        <span className="inline-flex items-center bg-yellow-900/30 text-yellow-500 text-xs px-2 py-1 rounded">
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          En proceso
                        </span>
                      )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-6 lg:mb-8">
                <h3 className="text-white font-semibold text-base lg:text-lg mb-2">Verifica tus cuentas de TikTok</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Para poder procesar los pagos, es importante que verifiquemos que tú eres el dueño de la cuenta de TikTok.
                </p>
                <div className="flex items-start mb-4">
                  <AlertTriangle size={18} className="text-yellow-500 mr-2 mt-0.5" />
                  <p className="text-yellow-500 text-sm">
                    Este paso es obligatorio para recibir pagos.
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Cuentas pendientes por verificar:</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pendingAccounts.map((account) => (
                      <span key={account} className="text-white text-sm bg-[#222] px-2 py-1 rounded">
                        {account}
                      </span>
                    ))}
                  </div>
                </div>
                {pendingAccounts.length > 0 && (
                  <button
                  onClick={() => navigate('/profile-cuentas')}
                  className="w-full lg:w-auto bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded transition-colors"
                  >
                  Verificar Cuentas de TikTok
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative bg-[#0c0c0c] border border-[#1c1c1c] rounded-lg max-w-md w-full p-6 text-white mx-4">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4 text-center">Tu video no ha sido aceptado</h3>
            <p className="text-gray-400 text-sm text-center mb-2">MOTIVO:</p>

            <p className="text-sm text-red-400 whitespace-pre-line text-center">
              {selectedVideo.status_note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
