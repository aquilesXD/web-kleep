"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Check, Clock, AlertTriangle, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Video {
  id: string
  title: string
  thumbnail: string
  price: number
  date: string
  campaign?: string
  video_link?: string
  total_to_pay?: number
  verified?: boolean
  views?: number
  creator?: string // Cambiado de account a creator
  status?: number // 0: En proceso, 1: Aprobado, 2: Rechazado
  status_note?: string
}

interface ApiUser {
  id_user?: string
  email?: string
  whatsapp_phone?: string
  first_name?: string
  verified?: number
  approved?: number
  email_code?: string
  tiktok_code?: string
  age?: string
  campaign?: string
  video_link?: string
  views?: number
  total_to_pay?: string | number
  status?: number // Asegurarse de que el campo status esté presente
  creator?: string // Campo para la cuenta de TikTok del creador
  status_note?: string
}

interface PlatformOption {
  name: string
  icon: string
}

interface PendingAccount {
  id: string
  username: string
  dateSubmitted: string
  status: "pending" | "verified" | "rejected"
}

interface Deposit {
  id: string
  amount: number
  rate: string
  netAmount: number
  status: "completado" | "pendiente"
  creditType: string
  date: string
}

const ProfileBalance = () => {
  const [email, setEmail] = useState<string | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [apiResponseData, setApiResponseData] = useState<any>(null)
  const [showingExampleData, setShowingExampleData] = useState<boolean>(false)
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [pendingTiktokAccounts, setPendingTiktokAccounts] = useState<PendingAccount[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false)
  const [showTiktokVerificationSection, setShowTiktokVerificationSection] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"videos" | "depositos">("videos")
  const [deposits, setDeposits] = useState<Deposit[]>([
    {
      id: "1",
      amount: 200.0,
      rate: "2%",
      netAmount: 196.0,
      status: "completado",
      creditType: "Tarjeta",
      date: "2024-03-01",
    },
    {
      id: "2",
      amount: 350.75,
      rate: "1.5%",
      netAmount: 345.49,
      status: "pendiente",
      creditType: "Transferencia",
      date: "2024-03-03",
    },
  ])

  const navigate = useNavigate()

  const platformOptions: PlatformOption[] = [
    { name: "TikTok", icon: "🎵" },
    { name: "Discord", icon: "🎮" },
    { name: "Solana", icon: "💰" },
    { name: "Telegram", icon: "✉️" },
    { name: "Instagram", icon: "📷" },
    { name: "Youtube", icon: "🎬" },
    { name: "X", icon: "🐦" },
    { name: "TradingView", icon: "📊" },
  ]

  const handleNavigateToAccountsVerification = () => {
    navigate("/profile-cuentas")
  }

  useEffect(() => {
    // Código existente sin console.log
  }, [isLoading])

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      navigate("/signin")
      return
    }

    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) {
      navigate("/signin")
      return
    }

    setEmail(userEmail)

    fetchDataFromApi(userEmail)
  }, [navigate])

  // Función para cargar las cuentas de TikTok no verificadas
  const fetchPendingTikTokAccounts = async () => {
    setLoadingAccounts(true)

    try {
      const userEmail = localStorage.getItem("userEmail")
      if (!userEmail) {
        throw new Error("No hay email de usuario disponible")
      }

      // Cargar datos del usuario ya sea del localStorage o hacer una petición a la API
      let userData: any = null
      const apiResponse = localStorage.getItem("apiResponse")

      if (apiResponse) {
        userData = JSON.parse(apiResponse)
      } else {
        // Si no hay datos en localStorage, puedes intentar cargarlos de la API
        const apiUrl = `https://contabl.net/nova/get-videos-to-pay?email=${encodeURIComponent(userEmail)}`
        const response = await fetch(apiUrl)

        if (!response.ok) {
          throw new Error(`Error al obtener datos: ${response.status}`)
        }

        userData = await response.json()
        localStorage.setItem("apiResponse", JSON.stringify(userData))
      }

      // Obtener el ID de usuario
      let userId = ""
      if (userData?.data && Array.isArray(userData.data) && userData.data.length > 0) {
        const firstItem = userData.data[0]
        userId = firstItem.user_id || firstItem.id_user || firstItem.id || ""
      }

      if (!userId) {
        // No mostrar la sección de verificación si no podemos obtener el ID
        setShowTiktokVerificationSection(false)
        setLoadingAccounts(false)
        return
      }

      // Hacer la petición para obtener cuentas de TikTok
      const tiktokAccountsUrl = `https://contabl.net/nova/get-tiktok-accounts-by-user?id_user=${encodeURIComponent(userId)}`
      const accountsResponse = await fetch(tiktokAccountsUrl)

      if (!accountsResponse.ok) {
        throw new Error(`Error al obtener cuentas: ${accountsResponse.status}`)
      }

      const accountsData = await accountsResponse.json()

      // Procesar las cuentas de TikTok (suponiendo que vienen en accountsData.accounts)
      if (accountsData?.accounts && Array.isArray(accountsData.accounts)) {
        // Filtrar solo las cuentas pendientes (no verificadas)
        const pendingAccounts = accountsData.accounts
          .filter((account: any) => account.verified !== 1 && account.verified !== true)
          .map((account: any) => ({
            id: account.id || String(Math.random()),
            username: account.account || `@${account.id_user || "usuario"}`,
            dateSubmitted: account.created_at || new Date().toISOString(),
            status: account.verified_request ? "pending" : "rejected",
          }))

        setPendingTiktokAccounts(pendingAccounts)

        // Mostrar la sección de verificación solo si hay cuentas pendientes
        setShowTiktokVerificationSection(pendingAccounts.length > 0)
      } else {
        // Si no hay cuentas en la respuesta, no mostrar la sección
        setShowTiktokVerificationSection(false)
        setPendingTiktokAccounts([])
      }
    } catch (error) {
      // No mostrar cuentas de ejemplo en caso de error
      setShowTiktokVerificationSection(false)
      setPendingTiktokAccounts([])
    } finally {
      setLoadingAccounts(false)
    }
  }

  // Llamar a la función para cargar cuentas pendientes
  useEffect(() => {
    if (email) {
      fetchPendingTikTokAccounts()
    }
  }, [email])

  const fetchDataFromApi = async (userEmail: string) => {
    setIsLoading(true)
    setError(null)
    setShowingExampleData(false)

    try {
      const apiUrl = `https://contabl.net/nova/get-videos-to-pay?email=${encodeURIComponent(userEmail)}`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`)
      }

      const data = await response.json()

      setApiResponseData(data)

      localStorage.setItem("apiResponse", JSON.stringify(data))

      processApiData(data, userEmail)
    } catch (error: any) {
      setError(`No se pudo conectar con el servidor: ${error.message}`)

      const storedApiResponse = localStorage.getItem("apiResponse")
      if (storedApiResponse) {
        try {
          const parsedData = JSON.parse(storedApiResponse)
          processApiData(parsedData, userEmail)
        } catch (parseError) {
          showExampleDataForUser(userEmail)
        }
      } else {
        showExampleDataForUser(userEmail)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const findCreatorByEmail = (email: string): string | undefined => {
    try {
      if (!email) return undefined

      const raw = localStorage.getItem("connectedAccounts")
      if (!raw) return undefined

      const accounts = JSON.parse(raw)
      const match = accounts.find((acc: any) => acc.email === email)
      return match?.username
    } catch (err) {
      console.warn("❌ Error al buscar creator por email:", err)
      return undefined
    }
  }

  // 🔍 Extraer creator desde el link de TikTok si tiene formato /@usuario/
  const extractCreatorFromLink = (link: string): string | null => {
    const match = link?.match(/@([^/]+)\/video/)
    return match ? match[1] : null
  }

  // Función para procesar los datos de la API
  const processApiData = (data: any, userEmail: string) => {
    const apiData = data?.data || []

    if (Array.isArray(apiData) && apiData.length > 0) {
      setShowingExampleData(false)

      const processedVideos = apiData.map((item: ApiUser, index: number) => {
        let totalToPay = 0
        if (item.total_to_pay !== undefined && item.total_to_pay !== null) {
          totalToPay =
            typeof item.total_to_pay === "string" ? Number.parseFloat(item.total_to_pay) : Number(item.total_to_pay)
        }
        if (isNaN(totalToPay)) totalToPay = 0

        const status = item.status !== undefined ? item.status : 0

        // ✅ Usar el creator individual de cada video o un nombre genérico
        const creatorAccount =
          item.creator ||
          findCreatorByEmail(item.email ?? "") ||
          extractCreatorFromLink(item.video_link ?? "") ||
          `@user_${index}`

        return {
          id: `api-video-${index}-${Date.now()}`,
          title: item.first_name ? `Video de ${item.first_name}` : `Vídeo ${index + 1}`,
          thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
          price: totalToPay,
          date: new Date().toISOString().split("T")[0],
          campaign: item.campaign || "Campaña estándar",
          video_link: item.video_link || "#",
          total_to_pay: totalToPay,
          verified: status === 1,
          status: status,
          status_note: item.status_note || "",
          views: item.views || 0,
          creator: creatorAccount,
        }
      })

      setVideos(processedVideos)

      let totalBalance = 0
      processedVideos.forEach((video) => {
        if ((video.views || 0) >= 2000) {
          totalBalance += video.total_to_pay || 0
        }
      })

      setBalance(totalBalance)
    } else {
      showExampleDataForUser(userEmail)
    }

    setIsLoading(false)
  }

  // Función para mostrar datos de ejemplo cuando no hay datos de la API
  const showExampleDataForUser = (userEmail: string) => {
    setShowingExampleData(true)

    const emailHash = hashString(userEmail) // Generar un hash basado en el correo
    const random = (seed: number, max: number) => (Math.floor((seed * 9301 + 49297) % 233280) / 233280) * max

    const numVideos = 3 + Math.floor(random(emailHash, 4))
    const exampleVideos: Video[] = []

    const campaignOptions = [
      "Campaña Marketing Q1",
      "Campaña Verano 2024",
      "Lanzamiento Producto",
      "Promoción Especial",
      "Black Friday",
      "Navidad 2024",
    ]
    const titleOptions = [
      "Cómo hacer un video viral en TikTok",
      "Los mejores tips para editar videos profesionales",
      "Guía completa para monetizar en YouTube",
      "Estrategias de marketing para redes sociales",
      "Tutorial de edición de video con Adobe Premiere",
      "Cómo crear contenido que enganche a tu audiencia",
      "Secretos de iluminación para videos de calidad",
      "Optimización SEO para videos en YouTube",
    ]

    let totalBalance = 0

    for (let i = 0; i < numVideos; i++) {
      const seed = emailHash + i
      const price = Math.floor(random(seed, 200) + 50) + 0.99
      const views = Math.floor(random(seed, 50000) + 5000)

      // Generar un status aleatorio (0, 1 o 2)
      const statusRand = random(seed, 1)
      let status
      if (statusRand < 0.33)
        status = 0 // 33% En proceso
      else if (statusRand < 0.8)
        status = 1 // 47% Aprobado
      else status = 2 // 20% Rechazado

      const video: Video = {
        id: `example-video-${i}-${Date.now()}`, // ID único garantizado
        title: titleOptions[Math.floor(random(seed, titleOptions.length))],
        thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        price: price,
        date: `2024-${Math.floor(random(seed, 12)) + 1}-${Math.floor(random(seed, 28)) + 1}`,
        campaign: campaignOptions[Math.floor(random(seed, campaignOptions.length))],
        video_link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        total_to_pay: price,
        views: views,
        verified: status === 1, // Para compatibilidad
        status: status, // 0: En proceso, 1: Aprobado, 2: Rechazado
        creator: `@tiktok_user_${i}`, // Usar un nombre de usuario de TikTok de ejemplo
      }

      exampleVideos.push(video)

      // Sumar TODOS los videos al balance, independientemente de su estado
      totalBalance += price
    }

    setVideos(exampleVideos)
    setBalance(totalBalance)
  }

  const hashString = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convertir a entero de 32 bits
    }
    return Math.abs(hash)
  }

  const handleShowRejectionModal = (videoId: string) => {
    const video = videos.find((v) => v.id === videoId)
    if (video) {
      setSelectedVideo(video) // Aquí debes tener: const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
      setShowRejectionModal(true)
    }
  }

  const handleCloseRejectionModal = () => {
    setShowRejectionModal(false)
    setSelectedVideoId(null)
  }

  const handleVerificationToggle = (videoId: string) => {
    const video = videos.find((v) => v.id === videoId)

    if (!video) return

    if (video.status === 2) {
      handleShowRejectionModal(videoId)
    }
  }

  const renderMobileVideoCard = (video: Video, index: number) => {
    let statusStyle = ""
    let statusText = ""
    let statusIcon = null

    // Usar el valor exacto de status de la API
    if (video.status === 0) {
      statusStyle = "bg-yellow-900/30 text-yellow-500 border border-yellow-700"
      statusText = "En proceso"
      statusIcon = <Clock size={12} className="mr-1" />
    } else if (video.status === 1) {
      statusStyle = "bg-green-900/30 text-green-500 border border-green-700"
      statusText = "Aprobado"
      statusIcon = <Check size={12} className="mr-1" />
    } else if (video.status === 2) {
      statusStyle = "bg-red-900/30 text-red-500 border border-red-700"
      statusText = "Rechazado"
      statusIcon = <X size={12} className="mr-1" />
    }

    // Verificar si el video cumple con el mínimo de vistas
    const hasSufficientViews = (video.views || 0) >= 2000

    return (
      <div
        key={`video-mobile-${index}-${video.id}`}
        className="bg-[#0c0c0c] border border-[#1c1c1c] rounded-md p-3 mb-3"
      >
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Campaña:</p>
              <p className="text-white">{video.campaign || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Creador:</p>
              <p className="text-white">{video.creator || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Vistas:</p>
              <p className={`${!hasSufficientViews ? "text-yellow-500" : "text-white"}`}>
                {video.views?.toLocaleString() || "0"}
                {!hasSufficientViews && <span className="block text-xs">Mínimo 2000 vistas</span>}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total a pagar:</p>
              <p className="text-white font-medium">
                {hasSufficientViews ? (video.total_to_pay || video.price).toFixed(2) : "$0.00"}
                {!hasSufficientViews && <span className="block text-yellow-500 text-xs">Pendiente de vistas</span>}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Estado:</p>
              <button
                onClick={() => handleVerificationToggle(video.id)}
                className={`px-2 py-1 rounded text-xs flex items-center ${statusStyle}`}
              >
                {statusIcon} {statusText}
              </button>
            </div>
            <div className="col-span-2 mt-2">
              <a
                href={video.video_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7c3aed] flex items-center text-sm hover:underline"
              >
                Ver video <ExternalLink size={14} className="ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 flex justify-center items-center h-[50vh]">
        <div className="text-white flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-[#7c3aed] rounded-full mb-3"></div>
          Cargando datos...
        </div>
      </div>
    )
  }

  const videoTableHeaders = ["CAMPAÑA", "CUENTAS", "VIDEO", "VISTAS", "TOTAL A PAGAR", "ESTADO"]

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded mb-6 p-3 text-red-400">
          <p>{error}</p>
          <button
            onClick={() => fetchDataFromApi(email || "")}
            className="mt-2 bg-red-700 hover:bg-red-600 text-white rounded px-3 py-1 text-sm"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {showingExampleData && (
        <div className="bg-blue-900/30 border border-blue-700 rounded mb-6 p-3 text-blue-400">
          <p>La API no ha devuelto videos para mostrar. Se están mostrando videos de ejemplo.</p>
        </div>
      )}

      <div className="bg-[#0c0c0c] border border-[#1c1c1c] rounded mb-6 md:mb-8 overflow-hidden">
        <div className="flex justify-between p-3 md:p-4 font-medium">
          <span className="text-white text-sm sm:text-base">Balance general</span>
          <span className="text-white text-sm sm:text-base font-bold">{balance.toFixed(2)} US$</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="border-b border-[#1c1c1c]">
          <div className="flex">
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "videos" ? "text-white border-b-2 border-[#7c3aed]" : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("videos")}
            >
              Videos
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "depositos"
                  ? "text-white border-b-2 border-[#7c3aed]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("depositos")}
            >
              Depósitos
            </button>
          </div>
        </div>
      </div>

      {activeTab === "videos" && (
        <>
          <div className="hidden md:block bg-[#0c0c0c] border border-[#1c1c1c] rounded">
            <table className="w-full">
              <thead className="border-b border-[#1c1c1c] text-left text-xs text-gray-500">
                <tr>
                  {videoTableHeaders.map((header, i) => (
                    <th
                      key={`header-${i}`}
                      className={`px-4 py-3 ${header === "VISTAS" || header === "TOTAL A PAGAR" ? "text-right" : "text-left"}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-white">
                {videos.length > 0 ? (
                  videos.map((video, i) => {
                    let statusStyle = ""
                    let statusText = ""
                    let statusIcon = null

                    // Usar el valor exacto de status de la API
                    if (video.status === 0) {
                      statusStyle = "bg-yellow-900/30 text-yellow-500 border border-yellow-700"
                      statusText = "En proceso"
                      statusIcon = <Clock size={16} className="mr-1" />
                    } else if (video.status === 1) {
                      statusStyle = "bg-green-900/30 text-green-500 border border-green-700"
                      statusText = "Aprobado"
                      statusIcon = <Check size={16} className="mr-1" />
                    } else if (video.status === 2) {
                      statusStyle = "bg-red-900/30 text-red-500 border border-red-700"
                      statusText = "Rechazado"
                      statusIcon = <X size={16} className="mr-1" />
                    }

                    // Verificar si el video cumple con el mínimo de vistas
                    const hasSufficientViews = (video.views || 0) >= 2000

                    return (
                      <tr key={`video-row-${i}-${video.id}`} className="border-b border-[#1c1c1c]">
                        <td className="px-4 py-3">{video.campaign || "N/A"}</td>
                        <td className="px-4 py-3">{video.creator || "N/A"}</td>
                        <td className="px-4 py-3">
                          <a
                            href={video.video_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#7c3aed] flex items-center hover:underline"
                          >
                            Ver video <ExternalLink size={16} className="ml-1" />
                          </a>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={(video.views ?? 0) < 2000 ? "text-yellow-500" : ""}>
                            {video.views?.toLocaleString() ?? "0"}
                          </span>
                          {(video.views ?? 0) < 2000 && (
                            <span className="block text-xs text-yellow-500">Mínimo 2000 vistas</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium">
                            {hasSufficientViews ? (video.total_to_pay || video.price).toFixed(2) : "$0.00"}
                            {!hasSufficientViews && (
                              <span className="block text-yellow-500 text-xs">* Pendiente de vistas</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={video.status === 2 ? () => handleVerificationToggle(video.id) : undefined}
                            className={`px-3 py-1 rounded text-sm flex items-center
                         ${statusStyle}
                         ${video.status !== 2 ? "cursor-default pointer-events-none" : "hover:opacity-90 cursor-pointer"}`}
                          >
                            {statusIcon} {statusText}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center">
                      No hay videos disponibles para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden">
            {videos.length > 0 ? (
              videos.map((video, i) => renderMobileVideoCard(video, i))
            ) : (
              <div className="bg-[#0c0c0c] border border-[#1c1c1c] rounded p-4 text-center text-white">
                No hay videos disponibles para mostrar.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "depositos" && (
        <>
          <div className="hidden md:block bg-[#0c0c0c] border border-[#1c1c1c] rounded">
            <table className="w-full">
              <thead className="border-b border-[#1c1c1c] text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">IMPORTE</th>
                  <th className="px-4 py-3 text-left">TASA</th>
                  <th className="px-4 py-3 text-left">IMPORTE NETO</th>
                  <th className="px-4 py-3 text-left">ESTADO</th>
                  <th className="px-4 py-3 text-left">TIPO DE CRÉDITO</th>
                  <th className="px-4 py-3 text-left">FECHA DE PUBLICACIÓN</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {deposits.length > 0 ? (
                  deposits.map((deposit, i) => (
                    <tr key={`deposit-row-${i}-${deposit.id}`} className="border-b border-[#1c1c1c]">
                      <td className="px-4 py-3">${deposit.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">{deposit.rate}</td>
                      <td className="px-4 py-3">${deposit.netAmount.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded text-sm inline-block
                          ${
                            deposit.status === "completado"
                              ? "bg-green-900/30 text-green-500 border border-green-700"
                              : "bg-yellow-900/30 text-yellow-500 border border-yellow-700"
                          }`}
                        >
                          {deposit.status === "completado" ? "Completado" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{deposit.creditType}</td>
                      <td className="px-4 py-3">{deposit.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center">
                      No hay depósitos disponibles para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden">
            {deposits.length > 0 ? (
              deposits.map((deposit, i) => (
                <div
                  key={`deposit-mobile-${i}-${deposit.id}`}
                  className="bg-[#0c0c0c] border border-[#1c1c1c] rounded-md p-3 mb-3"
                >
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Importe:</p>
                        <p className="text-white">${deposit.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tasa:</p>
                        <p className="text-white">{deposit.rate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Importe Neto:</p>
                        <p className="text-white">${deposit.netAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Estado:</p>
                        <span
                          className={`px-2 py-1 rounded text-xs inline-block
                          ${
                            deposit.status === "completado"
                              ? "bg-green-900/30 text-green-500 border border-green-700"
                              : "bg-yellow-900/30 text-yellow-500 border border-yellow-700"
                          }`}
                        >
                          {deposit.status === "completado" ? "Completado" : "Pendiente"}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500">Tipo de Crédito:</p>
                        <p className="text-white">{deposit.creditType}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fecha:</p>
                        <p className="text-white">{deposit.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#0c0c0c] border border-[#1c1c1c] rounded p-4 text-center text-white">
                No hay depósitos disponibles para mostrar.
              </div>
            )}
          </div>
        </>
      )}

      {/* Sección de verificación de cuentas de TikTok */}
      {showTiktokVerificationSection && (
        <div className="bg-[#0c0c0c] border border-[#1c1c1c] rounded-lg mt-8 mb-6 p-5">
          <h2 className="text-xl font-medium mb-2">Verifica tus cuentas de TikTok</h2>

          <p className="text-gray-400 mb-3">
            Para poder procesar los pagos, es importante que verifiquemos que tu eres el dueño de la cuenta de TikTok
            para optar para la monetización.
          </p>

          <div className="flex items-center mb-3">
            <AlertTriangle className="text-yellow-500 mr-2" size={18} />
            <p className="text-yellow-500 text-sm">Este paso es obligatorio para recibir pagos.</p>
          </div>

          {pendingTiktokAccounts.length > 0 && (
            <>
              <div className="mb-3">
                <p className="text-white mb-2">Cuentas pendientes por verificar:</p>
                <div className="flex flex-wrap gap-2">
                  {pendingTiktokAccounts.map((account) => (
                    <span
                      key={account.id}
                      className="inline-block bg-[#161616] text-white rounded-full px-3 py-1 text-sm"
                    >
                      {account.username}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium py-2 px-4 rounded-md mt-2"
            onClick={handleNavigateToAccountsVerification}
          >
            Verificar Cuentas de TikTok
          </button>
        </div>
      )}

      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-75" onClick={handleCloseRejectionModal}></div>

          <div className="relative bg-[#0c0c0c] rounded-lg w-11/12 max-w-md mx-auto p-5 text-white border border-[#1c1c1c]">
            <button
              onClick={handleCloseRejectionModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <h3 className="text-xl font-semibold mb-6">Tu video no ha sido aceptado</h3>
              <p className="text-gray-400 mb-2">MOTIVO:</p>

              {selectedVideo?.status_note ? (
                <div className="flex justify-center mb-6">
                  <div className="mr-3 mt-1">{/* Aquí puedes poner un icono si lo deseas */}</div>
                  <p className="text-sm text-red-400 whitespace-pre-line text-left max-w-xs">
                    {selectedVideo.status_note}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic mb-6">Sin motivo especificado.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileBalance
