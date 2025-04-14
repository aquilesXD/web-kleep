"use client"

import { useState } from "react"
import Sidebar from "../../components/layout/Sidebar";
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { RewardCard } from "./RewardCard";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")

  // Sample reward data
  const rewards = [
    {
      id: 1,
      avatar:
        "https://img-v2-prod.whop.com/EhTD3HTOhvFW-9uGE5QhWuqVLyunKFvKdz-Tdt2cvnM/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAxLTExL3VzZXJfNjgzOTk4OV83YThkMTQ5NS01YzIxLTRhMzYtYmIxMC1mMzNlODIxNmZiMmEucG5n",
      creator: "Whop UGC Creators",
      title: "Whop UGC (Faceless)",
      paidAmount: "1955.81",
      totalAmount: "6000",
      percentage: 38,
      type: "UGC",
      platform: "tiktok",
      rate: "4.00",
    },
    {
      id: 2,
      avatar:
        "https://img-v2-prod.whop.com/RZ8NrlZkDsIVv9iVU4zlsxxKti8Jbe4uEgVmwWbDSTs/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAxLTE2L3VzZXJfNjgzOTk4OV8xM2NhN2Q2Yy0yZjVjLTQyNWEtYWY4NC0xMzY0NGRjZjU1MGQuanBlZw",
      creator: "Graziosi Clips",
      title: "Dean Graziosi Clipping - $4 per 1K Views",
      paidAmount: "6600",
      totalAmount: "6069.25",
      percentage: 33,
      type: "UGC",
      platform: "tiktok",
      rate: "1.00",
    },
    {
      id: 3,
      avatar:
        "https://img-v2-prod.whop.com/BC5w06UzE8WxaoXV8YO8ha55b0ha9vfgFZ8CuB3m_AA/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAzLTAxL3VzZXJfNjgzOTk4OV9hNjJhZDNmNS1hMGI5LTQyZTMtYmIwNy05YWI0YzNlMWQ5MzYuanBlZw",
      creator: 'Lil Shxwn "Leave" Clipping',
      title: '"Leave" Feat. Yungeen Ace',
      paidAmount: "999.72",
      totalAmount: "1000",
      percentage: 99,
      type: "Recorte",
      platform: "tiktok",
      rate: "3.00",
    },
    {
      id: 4,
      avatar:
        "https://img-v2-prod.whop.com/_bbKBTiOD9z-wYV9n_wNRPWhu1r4sbmad35haYuzXEc/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAxLTI4L3VzZXJfNzM2MDk5Nl83N2IxOTRiNC0wZjdkLTQ3ZjAtOTFmZi01MTAyNGUxZTkzNGYucG5n",
      creator: "Jacob Levinrad Clips",
      title: "Jacob Levinrad Clips ($1 per 1k views)",
      paidAmount: "841.63",
      totalAmount: "7000",
      percentage: 12,
      type: "Recorte",
      platform: "tiktok",
      rate: "5.00",
    },
    {
      id: 5,
      avatar:
        "https://img-v2-prod.whop.com/2W74PpMmKbLVVK2y94JP_k_X6ofAypkP-uzdqd7uAxs/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI0LTEwLTE2L3VzZXJfMzc4NzE0Nl9lNTQ3NDg0Ny0wNGI0LTQ0ZjYtOWRjNi0xNmE5MTUzN2RiNmUuanBlZw",
      creator: "Whop University",
      title: "Whop YouTube Video",
      paidAmount: "672.88",
      totalAmount: "25000",
      percentage: 3,
      type: "UGC",
      platform: "tiktok",
      rate: "2.20",
    },
    {
      id: 6,
      avatar:
        "https://img-v2-prod.whop.com/kG597jx40jwdJaNX70kg4N0_2oG6cDSXrea-mYhmzy4/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAyLTI2L3VzZXJfNjMwOTk4NV8wYjAwMTMzNS02MjYyLTRhZTQtOGYzOC0wMzgxNWUyY2VmNjIucG5n",
      creator: "Sean Perry Clips",
      title: "Sean Perry",
      paidAmount: "445.39",
      totalAmount: "2500",
      percentage: 18,
      type: "Sin rostro",
      platform: "tiktok",
      rate: "50.00",
    },
    {
      id: 7,
      avatar:
        "https://img-v2-prod.whop.com/1mBXbNthOdI2DiLNZy6QbYpf4WdIpsjyzapcj-qxXRw/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI0LTEyLTMxL3VzZXJfMTU4NzMwOF84NDU3MmY1NC0yMDMwLTQ1ZGItYTI1NS1kYTcyZTU1ZWJkNGYucG5n",
      creator: "Rios to Riches",
      title: "Clip Rios & Earn $1 Per 1K Views",
      paidAmount: "393.39",
      totalAmount: "1000",
      percentage: 39,
      type: "UGC",
      platform: "tiktok",
      rate: "78.00",
      specialStyle: true,
    },
    {
      id: 8,
      avatar:
        "https://img-v2-prod.whop.com/_57AbOadxM5bdZJReazIUNHlzzntrlwsdgAdFs-x0Ms/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI0LTEyLTMwL3VzZXJfNjgxMDYxOF81NDY5OTAzNS03ZTQyLTQzNWUtOWJhZC00ZTBhODIwMjdkZTIud2VicA",
      creator: "AI Academy Clips",
      title: "AI Academy Clipping",
      paidAmount: "280.71",
      totalAmount: "2180",
      percentage: 9,
      type: "Sin rostro",
      platform: "tiktok",
      rate: "11.00",
    },
    {
      id: 9,
      avatar:
        "https://img-v2-prod.whop.com/LrJO0R8Ly5XoweQyp-sgHA7-85jzusXYEw8lbV0TEKs/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAxLTE0L3VzZXJfNjgzOTk4OV9iNzAxYjY2Ny01Mzk5LTQxY2ItYjg3My0wZTU4YTg0NGNmNTYucG5n",
      creator: "Saamir Clips",
      title: "Saamir Clips Payout",
      paidAmount: "745.96",
      totalAmount: "4250",
      percentage: 18,
      type: "UGC",
      platform: "tiktok",
      rate: "7.00",
    },
  ]

  return (
    <div className="min-h-screen bg-[#121212] px-4 pb-8 pl-20 lg:pl-24">
      <Sidebar />

      <div className="card bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
        

        <div className="card-body p-5">
          <h1 className="text-2xl font-bold text-white mb-1">💵 Recompensas por contenido</h1>
          <p className="text-sm text-gray-500 text-sm mb-6">Publica contenidos en las redes sociales y cobra por las visitas que generes!</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
      
            </div>

            <div className="text-right">
              <div className="inline-flex rounded-md shadow-sm">
                <button className="bg-[#1c1c1c] hover:bg-orange-600 text-white px-4 py-2 rounded-md">
                  Mas pagados
                </button>
                <button className="bg-[#1c1c1c] hover:bg-orange-600 text-white px-4 py-2 rounded-md">
                  CPM más alto
                </button>
                <button className="bg-[#1c1c1c] hover:bg-orange-600 text-white px-4 py-2 rounded-md">Mas Recientes</button>
              </div>
            </div>
          </div>

          <div className="text-right mb-4">
            <p className="text-sm text-gray-300">147 Resultados</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                className="bg-[#1c1c1c] text-gray-400 hover:bg-[#252525] relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#2a2a2a] disabled:opacity-50"
                disabled
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button className="bg-[#252525] text-white relative inline-flex items-center px-4 py-2 border border-[#2a2a2a]">
                1
              </button>
              <button className="bg-[#1c1c1c] text-gray-300 hover:bg-[#252525] relative inline-flex items-center px-4 py-2 border border-[#2a2a2a]">
                2
              </button>
              <button className="bg-[#1c1c1c] text-gray-300 hover:bg-[#252525] relative inline-flex items-center px-4 py-2 border border-[#2a2a2a]">
                3
              </button>
              <button className="bg-[#1c1c1c] text-gray-300 hover:bg-[#252525] relative inline-flex items-center px-4 py-2 border border-[#2a2a2a]">
                4
              </button>
              <button className="bg-[#1c1c1c] text-gray-300 hover:bg-[#252525] relative inline-flex items-center px-4 py-2 border border-[#2a2a2a]">
                5
              </button>

              <button className="bg-[#1c1c1c] text-gray-300 hover:bg-[#252525] relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#2a2a2a]">
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

