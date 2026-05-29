import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import { useOptions } from '../hooks/useOptions'
import DynamicSelect from '../components/DynamicSelect'

function EditModal({ image, onClose, onSave }) {
    const { aiTools, categories } = useOptions()
    const [form, setForm] = useState({
        prompt: image.prompt,
        ai_tool: image.ai_tool,
        category: image.category,
        is_trending: image.is_trending,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setForm({ ...form, [e.target.name]: val })
    }

    const handleSave = async () => {
        if (!form.prompt || !form.ai_tool || !form.category) {
            setError('All fields are required')
            return
        }
        setLoading(true)
        const { error: err } = await supabase
            .from('images')
            .update(form)
            .eq('id', image.id)
        if (err) {
            setError(err.message)
            setLoading(false)
            return
        }
        onSave({ ...image, ...form })
        onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">Edit Image</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <img
                    src={image.image_url}
                    alt="preview"
                    className="w-full h-40 object-cover rounded-xl mb-5 border border-white/10"
                />

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Prompt</label>
                        <textarea
                            name="prompt"
                            value={form.prompt}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50 resize-none transition-all"
                        />
                    </div>

                    <DynamicSelect
                        label="AI Tool"
                        value={form.ai_tool}
                        onChange={(val) => setForm({ ...form, ai_tool: val })}
                        options={aiTools}
                        placeholder="Select AI Tool"
                    />

                    <DynamicSelect
                        label="Category"
                        value={form.category}
                        onChange={(val) => setForm({ ...form, category: val })}
                        options={categories}
                        placeholder="Select Category"
                    />

                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-sm text-white font-medium">Mark as Trending 🔥</p>
                            <p className="text-xs text-white/30 mt-0.5">Manually pin this to trending</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_trending"
                                checked={form.is_trending}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                        </label>
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DeleteModal({ image, onClose, onDelete }) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        const fileName = image.image_url.split('/').pop()
        await supabase.storage.from('images').remove([fileName])
        await supabase.from('images').delete().eq('id', image.id)
        onDelete(image.id)
        onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Delete Image?</h2>
                <p className="text-sm text-white/40 mb-6">This will permanently delete the image and its prompt. This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white transition-all"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function AdminImageCard({ image, onEdit, onDelete }) {
    return (
        <div className="group relative bg-[#0f0f0f] rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all duration-300">
            <div className="relative overflow-hidden">
                <img
                    src={image.image_url}
                    alt={image.category}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white/80 border border-white/10 uppercase tracking-wider">
                        {image.ai_tool}
                    </span>
                    {image.is_trending && (
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-orange-500/90 text-white uppercase tracking-wider">
                            🔥 Trending
                        </span>
                    )}
                </div>

                <div className="absolute bottom-3 left-3 text-xs text-white/50 font-medium">
                    {image.copy_count} copies
                </div>

                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={() => onEdit(image)}
                        className="w-8 h-8 rounded-lg bg-indigo-600/90 backdrop-blur-sm hover:bg-indigo-500 flex items-center justify-center transition-colors shadow-lg"
                        title="Edit"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(image)}
                        className="w-8 h-8 rounded-lg bg-red-600/90 backdrop-blur-sm hover:bg-red-500 flex items-center justify-center transition-colors shadow-lg"
                        title="Delete"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-indigo-400 font-medium uppercase tracking-widest">{image.category}</span>
                    <span className="text-[10px] text-white/25">{new Date(image.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{image.prompt}</p>

                <div className="flex gap-2 mt-4 sm:hidden">
                    <button
                        onClick={() => onEdit(image)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(image)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminGallery() {
    const navigate = useNavigate()
    const { aiTools } = useOptions()
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [editImage, setEditImage] = useState(null)
    const [deleteImage, setDeleteImage] = useState(null)
    const [search, setSearch] = useState('')
    const [filterTool, setFilterTool] = useState('All')
    const [filterTrending, setFilterTrending] = useState(false)

    useEffect(() => {
        fetchImages()
    }, [])

    const fetchImages = async () => {
        setLoading(true)
        const { data } = await supabase.from('images').select('*').order('created_at', { ascending: false })
        setImages(data || [])
        setLoading(false)
    }

    const handleSave = (updatedImage) => {
        setImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img))
    }

    const handleDelete = (id) => {
        setImages(prev => prev.filter(img => img.id !== id))
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_auth')
        navigate('/admin')
    }

    const filtered = images.filter(img => {
        const matchSearch = search === '' || img.prompt.toLowerCase().includes(search.toLowerCase())
        const matchTool = filterTool === 'All' || img.ai_tool === filterTool
        const matchTrending = !filterTrending || img.is_trending
        return matchSearch && matchTool && matchTrending
    })

    const trendingCount = images.filter(i => i.is_trending).length

    return (
        <div className="min-h-screen bg-[#080808] text-white">

            <div className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-white">Admin Gallery</h1>
                            <p className="text-xs text-white/30 mt-0.5">{images.length} total images · {trendingCount} trending</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/admin/upload')}
                                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                <span className="hidden sm:inline">Upload New</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/30 rounded-xl text-sm font-semibold text-white/50 hover:text-red-400 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="relative flex-1 min-w-[200px] max-w-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search prompts..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>

                        <select
                            value={filterTool}
                            onChange={e => setFilterTool(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                        >
                            <option value="All" className="bg-[#111]">All Tools</option>
                            {aiTools.map(t => (
                                <option key={t} value={t} className="bg-[#111]">{t}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => setFilterTrending(!filterTrending)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all
                                ${filterTrending
                                    ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
                                }`}
                        >
                            🔥 Trending only
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {!loading && (
                    <p className="text-xs text-white/25 mb-6">
                        Showing {filtered.length} of {images.length} images
                    </p>
                )}

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="rounded-2xl overflow-hidden bg-[#0f0f0f] border border-white/5 animate-pulse">
                                <div className="h-48 bg-white/5" />
                                <div className="p-4 space-y-2">
                                    <div className="h-3 bg-white/5 rounded-full w-1/3" />
                                    <div className="h-3 bg-white/5 rounded-full w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-lg font-semibold text-white/60 mb-2">No images found</h3>
                        <p className="text-sm text-white/30 mb-6">
                            {images.length === 0 ? 'Upload your first image to get started' : 'Try adjusting your filters'}
                        </p>
                        {images.length === 0 && (
                            <button
                                onClick={() => navigate('/admin/upload')}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-colors"
                            >
                                Upload First Image
                            </button>
                        )}
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map(image => (
                            <AdminImageCard
                                key={image.id}
                                image={image}
                                onEdit={setEditImage}
                                onDelete={setDeleteImage}
                            />
                        ))}
                    </div>
                )}
            </div>

            {editImage && (
                <EditModal
                    image={editImage}
                    onClose={() => setEditImage(null)}
                    onSave={handleSave}
                />
            )}
            {deleteImage && (
                <DeleteModal
                    image={deleteImage}
                    onClose={() => setDeleteImage(null)}
                    onDelete={handleDelete}
                />
            )}
        </div>
    )
}