import { useEffect, useRef, useState } from 'react'
import Experience from './Experience/Experience'
import AuthScreen from './components/AuthScreen'
import useAuthStore from './store/useAuthStore'
import './styles/loader.css'

const App = () => {
  const canvasRef = useRef()
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  
  const { isAuthenticated } = useAuthStore()
  const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true'

  useEffect(() => {
    // Solo iniciar el juego si está autenticado o no se requiere auth
    if (!requireAuth || (requireAuth && isAuthenticated && gameStarted)) {
      const experience = new Experience(canvasRef.current)

      const handleProgress = (e) => setProgress(e.detail)
      const handleComplete = () => setLoading(false)

      window.addEventListener('resource-progress', handleProgress)
      window.addEventListener('resource-complete', handleComplete)

      return () => {
        window.removeEventListener('resource-progress', handleProgress)
        window.removeEventListener('resource-complete', handleComplete)
      }
    }
  }, [requireAuth, isAuthenticated, gameStarted])

  // Mostrar pantalla de autenticación si se requiere y no está autenticado
  if (requireAuth && (!isAuthenticated || !gameStarted)) {
    return <AuthScreen onStartGame={() => setGameStarted(true)} />
  }

  return (
    <>
      {loading && (
        <div id="loader-overlay">
          <div id="loader-bar" style={{ width: `${progress}%` }}></div>
          <div id="loader-text">Cargando... {progress}%</div>
        </div>
      )}
      <canvas ref={canvasRef} className="webgl" />
    </>
  )
}

export default App
