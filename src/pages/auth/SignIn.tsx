"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { User } from "lucide-react"

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [particlesLoaded, setParticlesLoaded] = useState(false)
  const particlesContainer = useRef<HTMLDivElement>(null)
  const [particlesScriptLoaded, setParticlesScriptLoaded] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (isAuthenticated === "true") {
      navigate("/profile-saldo")
    }
     
    if (typeof window !== "undefined" && !(window as any).particlesJS) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
      script.async = true;
      script.onload = () => {
        setParticlesScriptLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setParticlesScriptLoaded(true);
    }

  }, [navigate])

  useEffect(() => {
    if (particlesScriptLoaded && typeof (window as any).particlesJS !== 'undefined') {
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          (window as any).particlesJS("particles-js", {
            particles: {
              number: {
                value: 100,
                density: {
                  enable: true,
                  value_area: 800,
                },
              },
              color: {
                value: ["#8b5cf6", "#a78bfa", "#c4b5fd"],
              },
              shape: {
                type: ["star", "circle", "triangle", "polygon"],
                stroke: {
                  width: 0,
                  color: "#000000",
                },
                polygon: {
                  nb_sides: 5,
                },
              },
              opacity: {
                value: 0.7,
                random: true,
                anim: {
                  enable: true,
                  speed: 1,
                  opacity_min: 0.1,
                  sync: false,
                },
              },
              size: {
                value: 4,
                random: true,
                anim: {
                  enable: true,
                  speed: 2,
                  size_min: 0.1,
                  sync: false,
                },
              },
              line_linked: {
                enable: true,
                distance: 150,
                color: "#8b5cf6",
                opacity: 0.3,
                width: 1,
              },
              move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                  enable: true,
                  rotateX: 600,
                  rotateY: 1200,
                },
              },
            },
            interactivity: {
              detect_on: "canvas",
              events: {
                onhover: {
                  enable: true,
                  mode: "bubble",
                },
                onclick: {
                  enable: true,
                  mode: "push",
                },
                resize: true,
              },
              modes: {
                grab: {
                  distance: 140,
                  line_linked: {
                    opacity: 1,
                  },
                },
                bubble: {
                  distance: 200,
                  size: 6,
                  duration: 2,
                  opacity: 0.8,
                  speed: 3,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
                push: {
                  particles_nb: 4,
                },
                remove: {
                  particles_nb: 2,
                },
              },
            },
            retina_detect: true,
          });
        } catch (error) {
        }
      }, 100);
    }
  }, [particlesScriptLoaded]);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setIsValidEmail(validateEmail(value))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidEmail) {
      setError("Por favor ingresa un correo electrónico válido")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const apiUrl = `https://contabl.net/nova/get-videos-to-pay?email=${encodeURIComponent(email)}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`)
      }

      const responseData = await response.json()

      if (responseData?.data?.length > 0) {
        localStorage.setItem("userEmail", email)
        localStorage.setItem("apiResponse", JSON.stringify(responseData))
        localStorage.setItem("isRegistering", "false")

        const extractUserId = (data: any): string => {
          const user = data.data[0]
          return user.user_id || user.id_user || user.id || ""
        }
        const userId = extractUserId(responseData)

        if (!userId) throw new Error("No se pudo obtener el ID de usuario.")

        const { sendVerificationCode } = await import("../../services/authService")
        await sendVerificationCode(userId, email)

        await new Promise((res) => setTimeout(res, 3000))

        const refreshedResponse = await fetch(apiUrl)
        const refreshedData = await refreshedResponse.json()
        localStorage.setItem("apiResponse", JSON.stringify(refreshedData))

        navigate("/verify-code")
      } else {
        setError("Correo electrónico no encontrado en el sistema.")
      }
    } catch (error: any) {
      setError(`Error al iniciar sesión: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="relative w-full h-screen flex justify-center items-center overflow-hidden bg-[#0c0c0c]">
      <div id="particles-js" ref={particlesContainer} className="absolute inset-0 z-0">
        {particlesLoaded && <ParticlesBackground containerRef={particlesContainer} />}
      </div>

      <div className="relative z-10 bg-[rgba(25,25,25,0.85)] backdrop-blur-md rounded-xl w-[90%] max-w-[450px] p-8 md:p-10 shadow-lg border border-[rgba(51,51,51,0.2)] overflow-hidden animate-fadeIn">
        <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#8b5cf6] to-[#c084fc]"></div>

        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">
            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] bg-clip-text text-transparent">K</span>
          </h1>
          <h2 className="text-white mt-4 text-xl sm:text-2xl font-bold">Iniciar sesión</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5 relative">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={18} />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Tu correo"
                className={`w-full py-3 pl-11 pr-3 bg-[#191919] text-white rounded-lg border ${
                  error ? "border-red-500" : "border-[#333]"
                } focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:ring-opacity-50 transition-all text-sm sm:text-base`}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>
            {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 relative overflow-hidden text-sm sm:text-base ${
              !isValidEmail || isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isValidEmail || isLoading}
          >
            {isLoading ? "Cargando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  )
}

function ParticlesBackground({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).particlesJS && containerRef.current) {
        (window as any).particlesJS("particles-js", {
          particles: {
            number: {
              value: 100,
              density: { enable: true, value_area: 800 },
            },
            color: { value: ["#8b5cf6", "#a78bfa", "#c4b5fd"] },
            shape: {
              type: ["star", "circle", "triangle", "polygon"],
              stroke: { width: 0, color: "#000000" },
              polygon: { nb_sides: 5 },
            },
            opacity: {
              value: 0.7,
              random: true,
              anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
            },
            size: {
              value: 4,
              random: true,
              anim: { enable: true, speed: 2, size_min: 0.1, sync: false },
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#8b5cf6",
              opacity: 0.3,
              width: 1,
            },
            move: {
              enable: true,
              speed: 2,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              bounce: false,
              attract: { enable: true, rotateX: 600, rotateY: 1200 },
            },
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: { enable: true, mode: "bubble" },
              onclick: { enable: true, mode: "push" },
              resize: true,
            },
            modes: {
              grab: { distance: 140, line_linked: { opacity: 1 } },
              bubble: {
                distance: 200,
                size: 6,
                duration: 2,
                opacity: 0.8,
                speed: 3,
              },
              repulse: { distance: 200, duration: 0.4 },
              push: { particles_nb: 4 },
              remove: { particles_nb: 2 },
            },
          },
          retina_detect: true,
        });
        clearInterval(interval); // solo una vez
      }
    }, 100); // chequea cada 100ms

    return () => clearInterval(interval);
  }, [containerRef]);

  return null;
}