import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Gallery from './pages/Gallery'
import AdminLogin from './pages/AdminLogin'
import AdminUpload from './pages/AdminUpload'
import AdminGallery from './pages/AdminGallery'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/upload" element={
          <ProtectedRoute><AdminUpload /></ProtectedRoute>
        } />
        <Route path="/admin/gallery" element={
          <ProtectedRoute><AdminGallery /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App