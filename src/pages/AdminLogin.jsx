import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'yourpassword123'

export default function AdminLogin() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', password: '' })
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (form.username === ADMIN_USERNAME && form.password === ADMIN_PASSWORD) {
            localStorage.setItem('admin_auth', 'true')
            navigate('/admin/gallery')
        } else {
            setError('Invalid username or password')
        }
    }

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-white mb-1">Admin Login</h1>
                    <p className="text-sm text-white/30">PromptGallery dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Username</label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })}
                            placeholder="Enter username"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder="Enter password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50 transition-all"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-colors mt-2"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}