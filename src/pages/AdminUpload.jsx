import { useState } from 'react'
import { supabase } from '../supabase/client'
import { useOptions } from '../hooks/useOptions'
import DynamicSelect from '../components/DynamicSelect'

const AI_TOOLS = ['Midjourney', 'Chat GPT', 'Stable Diffusion', 'Flux', 'Firefly', 'Other']

const CATEGORIES = [
    'Portrait', 'Landscape', 'Architecture', 'Fantasy',
    'Sci-Fi', 'Animals', 'Food', 'Abstract',
    'Style / Aesthetic', 'Style', 'Other'
]

export default function AdminUpload() {
    const { aiTools, categories } = useOptions()
    const [form, setForm] = useState({
        prompt: '',
        ai_tool: '',
        category: '',
    })
    const [imageFile, setImageFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const handleLogout = () => {
        localStorage.removeItem('admin_auth')
        navigate('/admin')
    }

    // handle text/select inputs
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setImageFile(file)
        setPreview(URL.createObjectURL(file))
    }

    // main submit function
    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg('')
        setSuccessMsg('')

        // basic validation
        if (!imageFile) return setErrorMsg('Please select an image')
        if (!form.prompt) return setErrorMsg('Please enter a prompt')
        if (!form.ai_tool) return setErrorMsg('Please select an AI tool')
        if (!form.category) return setErrorMsg('Please select a category')

        setLoading(true)

        try {
            // Step A — upload image to Supabase Storage
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, imageFile)

            if (uploadError) throw uploadError

            // Step B — get public URL of uploaded image
            const { data: urlData } = supabase.storage
                .from('images')
                .getPublicUrl(fileName)

            const imageUrl = urlData.publicUrl

            // Step C — save metadata to DB
            const { error: dbError } = await supabase.from('images').insert([
                {
                    image_url: imageUrl,
                    prompt: form.prompt,
                    ai_tool: form.ai_tool,
                    category: form.category,
                    copy_count: 0,
                    is_trending: false,
                }
            ])

            if (dbError) throw dbError

            // Step D — reset form on success
            setSuccessMsg('Image uploaded successfully!')
            setForm({ prompt: '', ai_tool: '', category: '' })
            setImageFile(null)
            setPreview(null)

        } catch (err) {
            setErrorMsg(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-xl mx-auto">

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

                {/* Header */}
                <h1 className="text-2xl font-bold mb-8">Upload New Image</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0 file:bg-gray-800 file:text-white
                hover:file:bg-gray-700 cursor-pointer"
                        />
                        {preview && (
                            <img
                                src={preview}
                                alt="preview"
                                className="mt-3 rounded-lg w-full max-h-64 object-cover"
                            />
                        )}
                    </div>

                    {/* Prompt */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Prompt</label>
                        <textarea
                            name="prompt"
                            value={form.prompt}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Enter the full prompt here..."
                            className="w-full bg-gray-800 rounded-lg px-4 py-3 text-sm
                text-white placeholder-gray-500 outline-none focus:ring-2
                focus:ring-indigo-500 resize-none"
                        />
                    </div>

                    {/* AI Tool */}
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

                    {/* Messages */}
                    {errorMsg && (
                        <p className="text-red-400 text-sm">{errorMsg}</p>
                    )}
                    {successMsg && (
                        <p className="text-green-400 text-sm">{successMsg}</p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900
              disabled:cursor-not-allowed rounded-lg py-3 text-sm font-semibold
              transition-colors"
                    >
                        {loading ? 'Uploading...' : 'Upload Image'}
                    </button>

                </form>
            </div>
        </div>
    )
}