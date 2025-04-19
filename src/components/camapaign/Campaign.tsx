import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import { CampaignSidebar } from "../layout/CampainSidebar";
import { Testimonial } from "./Testimonial";
import { FeatureCard } from "./FeatureCard";
import { AudienceCard } from "./AudienceCard";
import { CheckCircle } from "lucide-react";

export default function Campaign() {
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userEmail = localStorage.getItem("userEmail")

    // Verificar que tanto isAuthenticated como userEmail existan
    if (!isAuthenticated || !userEmail) {
      // Limpiar cualquier dato de sesión parcial
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("apiResponse")

      // Redirigir al inicio de sesión
      navigate("/signin")
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#121212]">
      <Sidebar />
      <div className="pl-20 lg:pl-24">
        <div className="flex flex-col lg:flex-row">
          <CampaignSidebar/>
          <main className="flex-1 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <div className="relative w-full max-h-[300px] overflow-hidden rounded-xl">
                  <img
                    src="https://img-v2-prod.whop.com/rEuqtdgmTyTyI2bULxNzKfor_PpwqFmSgZj4FyUWvx0/rs:fit:1280:720/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAxLTI2L3VzZXJfMjE3MzE2OF83NjA0ZmU3OC02MmYwLTQ1ZTctYjFjZS1jNmZlOGVhYzQ3MGQuanBlZw"
                    alt="Brez Scales Clips banner"
                    className="w-full object-cover rounded-xl"
                  />
                </div>

                <div className="mt-8 flex items-center justify-center">
                  <img
                    src="https://img-v2-prod.whop.com/6h3sfg_FqzkV8VtmHQ41wHmNYgK6xQepCrUU9lSl0wI/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAyLTExL3VzZXJfMjE3MzE2OF85NTc2MmVhOS1kZjdhLTQ2OWItODE5YS1lZGI5NTcwZGMwYzguanBlZw"
                    alt="Brez Scales Clips logo"
                    width={24}
                    height={24}
                    className="rounded-md mr-2 border border-white/40"
                  />
                  <span className="font-semibold text-lg text-white">Brez Scales Clips</span>
                </div>

                <div className="max-w-md mx-auto mt-6">
                  <h1 className="text-3xl font-bold leading-tight text-white">
                  Gana $5,000/mes Cliping Brez en tu teléfono
                  </h1>
                  <p className="mt-3 text-base text-gray-400">
                  Únase a nuestro equipo y reciba pagos por grabar videos desde cualquier lugar.
                  </p>
                  <button className="w-full mt-4 text-base py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md hidden">
                    Unete a
                  </button>

                  <div className="mt-6 bg-[#191919] p-6 rounded-lg">
                    <p className="font-semibold text-base text-white">Únase a 4190 personas</p>
                    <div className="flex justify-center -space-x-2 my-3">
                      {[...Array(11)].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-[#121212] bg-gray-500 overflow-hidden"
                        >
                          <img
                            src={`https://randomuser.me/api/portraits/men/${i + 1}.jpg`}
                            alt={`User ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-yellow-400 font-medium">4.5 stars (7) ⭐⭐⭐⭐⭐</p>
                  </div>
                </div>
              </div>

              {/* Testimonials Section */}
              <section className="mt-12">
                <div className="bg-[#191919] p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-center mb-6 text-white">Vea lo que dicen los demás</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Testimonial
                      name="Hamza salah"
                      avatar="https://img-v2-prod.whop.com/Q4wmi1XnAMtamRiVYv2VjWu1wtycEsb-xKw4s8mkNdU/rs:fill:48:48/el:1/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAzLTAxL3VzZXJfODI0ODA0MV9lYjIzMjE2Zi1mMDg1LTQxYTgtOWZiNC1jMGYzNjE3OTc5MzEuanBlZw"
                      rating={5}
                      text="Una buena comunidad conoció a algunos editores sólidos."
                      date="Escrito el 4 de marzo de 2025, 21 días después de la compra."
                    />
                    <Testimonial
                      name="Brandon Cherundolo"
                      avatar="https://img-v2-prod.whop.com/EEdRFm5pKsiLiTazX1tmvEFjbAKl7lvSf6IiYYODhPQ/rs:fill:48:48/el:1/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAxLTIxL3VzZXJfMTQxNzk3NF9hODYwZmEzMC01YTM4LTQ5ZWYtOThjMi0wODU4MTE4ZTcwMTQuanBlZw"
                      rating={5}
                      text="Esta es una forma legítima de ganar dinero. Acabo de ganar $15 publicando un par de videos para un desafío semanal. ¡Yo también llevo solo un mes haciendo esto!"
                      date="Escrito el 24 de enero de 2025, 11 días después de la compra."
                    />
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section className="mt-12">
                <h2 className="text-xl font-bold text-center mb-6 text-white">Esto es lo que obtendra</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FeatureCard
                    icon="https://img-v2-prod.whop.com/X6k_ozpYUY84nlanH6CyRTIRRP3VFwbJ0w593iHJm1o/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAzLTA2L3VzZXJfMjE3MzE2OF8wZjZiNjBkOS0zYTNiLTRjNjMtOTAxMS1lN2ZmMTE5ZGY5Y2IucG5n"
                    title="Comience Aqui"
                    description="Accede a contenido experto que te mantendrá informado."
                  />
                  <FeatureCard
                    icon="https://img-v2-prod.whop.com/ATB_o4SkpqQ17JObJR73qOPZ0S5Ml2Ghoj02uHuCnrM/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAzLTA2L3VzZXJfMjE3MzE2OF84NjNiNmE5Mi1mMDJmLTRhODctYjA1Ni1kNmJkYmU4ZjZhMGQucG5n"
                    title="Anuncios"
                    description="Recibe mis anuncios más importantes"
                  />
                  <FeatureCard
                    icon="https://img-v2-prod.whop.com/t2nsZ2c5fWimGc7zTteuJKtcNJc0bkH-NYL4gQNNAd8/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAzLTA2L3VzZXJfMjE3MzE2OF9lM2E4OGQ5NC0wODAzLTQ3MzUtODY1Zi0yMmQ3MjFmNjJkZmMucG5n"
                    title="Chat"
                    description="Chatea en tiempo real y conéctate con los demás miembros de nuestra comunidad."
                  />
                  <FeatureCard
                    icon="https://img-v2-prod.whop.com/VM0-qGNwL_UVkqmSBKggerYfYQFLfN_L3tg1zW6hbiE/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAzLTA2L3VzZXJfMjE3MzE2OF8yODcxNTY3My00M2U3LTRkNzgtYjljMy0wMjc4MWJiNDU4MTMucG5n"
                    title="Cursos"
                    description="Aprenda de un programa de cursos diseñado para ayudarle a crecer y alcanzar sus objetivos."
                  />
                  <FeatureCard
                    icon="https://img-v2-prod.whop.com/uxJX37zd8NkHDzEDKdt2kTVWBPv-63XskD3XC1c7Hrk/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAzLTA2L3VzZXJfMjE3MzE2OF9lYzVmNDAwYy00YmEwLTQxOWQtOGQ4Ny04MzZmNDNjYzY1NmEucG5n"
                    title="Recompensas"
                    description="¡Completa las tareas que publicamos y gana dinero en efectivo por ellas!"
                  />
                  <FeatureCard
                    icon="https://img-v2-prod.whop.com/D7irSMkDrHDiHYoR3voto4vvBNeN-n_hQFhjbboYQho/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAzLTA2L3VzZXJfMjE3MzE2OF8wOWZiOWEzNC01ZmQ1LTQwN2YtYWMzYy00ZTEyODg3YmIxYTYucG5n"
                    title="Preguntas"
                    description="Comparta sus pensamientos y conéctese con otras personas sobre temas que le interesen."
                  />
                </div>
              </section>

              {/* About Creator Section */}
              <section className="mt-12">
                <div className="bg-[#191919] p-6 rounded-lg">
                  <div className="max-w-md mx-auto text-center">
                    <h2 className="text-xl font-semibold mb-4 text-white">Saber más sobre mí</h2>
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                      <img
                        src="https://img-v2-prod.whop.com/ZNfyn20I686dk7hG_ol4kKA8F06b451-f4K3x-lpQFw/rs:fill:80:80/el:1/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAxLTI4L3VzZXJfMjc3MzQ5NF8yMmIyYTljYi03ODZjLTRmMGUtOTc2NC0xNTQyMTczMDJlM2EuanBlZw"
                        alt="Rezz profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Rezz</h3>
                    <p className="text-gray-400">@rezzashahabzadeh • Se unió en enero de 2024</p>
                    {/* <button className="mt-4 text-lg bg-[#2a2a2a] hover:bg-[#333] text-white py-2 px-4 rounded-md">
                      Ver Perfil
                    </button> */}

                    <div className="mt-6 relative">
                      {/* Textarea and button hidden */}
                    </div>
                  </div>
                </div>
              </section>

              {/* Target Audience Section */}
              <section className="mt-12">
                <h2 className="text-xl font-bold text-center mb-6 text-white">A quien va dirigido</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AudienceCard
                    title="Emprendedoras aspirantes"
                    description="Personas que quieran ganar dinero online en su tiempo libre sin inversión inicial."
                  />
                  <AudienceCard
                    title="Individuos ocupados"
                    description="Aquellos que buscan un trabajo lateral flexible que puedan administrar desde su teléfono, sin ningún equipo especial."
                  />
                  <AudienceCard
                    title="Estafadores del hambre"
                    description="Para aquellos ávidos de crecimiento, dispuestos a ganar 5.000 dólares o más lo antes posible, trabajando en sus propios términos, desde cualquier lugar."
                  />
                  <AudienceCard
                    title="Buscadoras de redes"
                    description="Para personas que desean conectarse con personas de alto nivel, conocer algunos de los nombres más famosos de Internet y establecer conexiones valiosas."
                  />
                </div>
              </section>

              {/* Pricing Section */}
              <section className="mt-12">
                <div className="bg-[#191919] p-6 rounded-lg">
                  <div className="max-w-md mx-auto text-center">
                    <h2 className="text-xl font-semibold mb-4 text-white">Precios</h2>
                    <div className="mb-4">
                      <img
                        src="https://img-v2-prod.whop.com/6h3sfg_FqzkV8VtmHQ41wHmNYgK6xQepCrUU9lSl0wI/rs:fill:80:80/el:1/dpr:2/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAyLTExL3VzZXJfMjE3MzE2OF85NTc2MmVhOS1kZjdhLTQ2OWItODE5YS1lZGI5NTcwZGMwYzguanBlZw"
                        alt="Brez Scales Clips logo"
                        width={60}
                        height={60}
                        className="rounded-xl mx-auto"
                      />
                      <h3 className="text-2xl font-bold mt-4 text-white">Únase a los clips de escalas Brez</h3>
                      <p className="text-lg font-semibold mt-2 text-white"> Gratis de por vida</p>
                      {/* <button className="w-4/5 py-6 text-lg mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                        Unete a
                      </button> */}

                      <div className="mt-6 bg-[#121212] rounded-lg">
                        <ul className="divide-y divide-[#2a2a2a] text-left">
                          <li className="p-4 flex items-start gap-3 text-gray-400">
                            <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>Acceso para empezar a ganar dinero desde el día 1 recortando vídeos</span>
                          </li>
                          <li className="p-4 flex items-start gap-3 text-gray-400">
                            <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>Aprende a crear vídeos virales que destaquen</span>
                          </li>
                          <li className="p-4 flex items-start gap-3 text-gray-400">
                            <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>Trabaja con tus marcas y creadores favoritos</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* More Testimonials Section */}
              <section className="mt-12 mb-16">
               <div className="bg-[#191919] p-6 rounded-lg">
                <h2 className="text-xl font-bold text-center mb-6 text-white">Reseñas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Testimonial
                    name="Hamza salah"
                    avatar="https://img-v2-prod.whop.com/Q4wmi1XnAMtamRiVYv2VjWu1wtycEsb-xKw4s8mkNdU/rs:fill:48:48/el:1/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAzLTAxL3VzZXJfODI0ODA0MV9lYjIzMjE2Zi1mMDg1LTQxYTgtOWZiNC1jMGYzNjE3OTc5MzEuanBlZw"
                    rating={5}
                    text="Una buena comunidad conoció a algunos editores sólidos."
                    date="Escrito el 4 de marzo de 2025, 21 días después de la compra."
                  />
                  <Testimonial
                    name="Brandon Cherundolo"
                    avatar="https://img-v2-prod.whop.com/EEdRFm5pKsiLiTazX1tmvEFjbAKl7lvSf6IiYYODhPQ/rs:fill:48:48/el:1/aHR0cHM6Ly9hc3NldHMud2hvcC5jb20vdXBsb2Fkcy8yMDI1LTAxLTIxL3VzZXJfMTQxNzk3NF9hODYwZmEzMC01YTM4LTQ5ZWYtOThjMi0wODU4MTE4ZTcwMTQuanBlZw"
                    rating={5}
                    text="Esta es una forma legítima de ganar dinero. Acabo de ganar $15 publicando un par de videos para un desafío semanal. ¡Yo también llevo solo un mes haciendo esto!"
                    date="Escrito el 24 de enero de 2025, 11 días después de la compra."
                  />
                </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
