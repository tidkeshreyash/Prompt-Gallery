import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Gallery Page</div>} />
        <Route path="/admin" element={<div>Admin Login</div>} />
        <Route path="/admin/upload" element={<div>Upload Page</div>} />
        <Route path="/admin/gallery" element={<div>Admin Gallery</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App