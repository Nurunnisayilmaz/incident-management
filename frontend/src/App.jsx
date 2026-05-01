import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { useThemeStore } from './store/useThemeStore';

function App() {
  const { theme } = useThemeStore();
  return (
    <div className="min-h-screen bg-base-200" data-theme={theme}>
      
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  )
}

export default App
