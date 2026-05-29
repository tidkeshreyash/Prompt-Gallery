import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase/client'

const SORTS = ['Trending', 'New', 'Top']

function ImageCard({ image, onCopy }) {
    const [copied, setCopied] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [imgLoaded, setImgLoaded] = useState(false)

    const handleCopy = async (e) => {
        e.stopPropagation()
        await navigator.clipboard.writeText(image.prompt)
        setCopied(true)
        onCopy(image.id)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div
            className="group relative bg-[#0f0f0f] rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="relative overflow-hidden">
                {!imgLoaded && (
                    <div className="w-full h-56 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] animate-pulse" />
                )}
                <img
                    src={image.image_url}
                    alt={image.category}
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute top-0'}`}
                    style={{ maxHeight: '280px' }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white/90 border border-white/10 uppercase tracking-wider">
                        {image.ai_tool}
                    </span>
                    {image.is_trending && (
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-orange-500/90 backdrop-blur-sm text-white uppercase tracking-wider">
                            🔥 Trending
                        </span>
                    )}
                </div>

                {image.copy_count > 0 && (
                    <div className="absolute top-3 right-3 text-[10px] font-medium px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white/60 border border-white/10">
                        {image.copy_count} copies
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="mb-3">
                    <span className="text-[11px] text-indigo-400 font-medium uppercase tracking-widest">
                        {image.category}
                    </span>
                </div>

                <p className={`text-sm text-white/60 leading-relaxed transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}>
                    {image.prompt}
                </p>

                {image.prompt.length > 100 && (
                    <button
                        className="text-xs text-indigo-400 mt-1 hover:text-indigo-300 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
                    >
                        {expanded ? 'Show less' : 'Show more'}
                    </button>
                )}

                <button
                    onClick={handleCopy}
                    className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
                        ${copied
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 hover:border-transparent'
                        }`}
                >
                    {copied ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            Copy Prompt
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default function Gallery() {
    const [images, setImages] = useState([])
    const [aiTools, setAiTools] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTool, setSelectedTool] = useState('All')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortBy, setSortBy] = useState('New')
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const searchTimeout = useRef(null)

    // fetch filter options once on mount
    useEffect(() => {
        fetchFilterOptions()
    }, [])

    // fetch images whenever filters change
    useEffect(() => {
        fetchImages()
    }, [selectedTool, selectedCategory, sortBy, search])

    const fetchFilterOptions = async () => {
        const { data } = await supabase.from('images').select('ai_tool, category')
        if (data) {
            const tools = [...new Set(data.map(d => d.ai_tool).filter(Boolean))].sort()
            const cats = [...new Set(data.map(d => d.category).filter(Boolean))].sort()
            setAiTools(tools)
            setCategories(cats)
        }
    }

    const fetchImages = async () => {
        setLoading(true)
        let query = supabase.from('images').select('*')

        if (selectedTool !== 'All') query = query.eq('ai_tool', selectedTool)
        if (selectedCategory !== 'All') query = query.eq('category', selectedCategory)
        if (search) query = query.ilike('prompt', `%${search}%`)

        if (sortBy === 'New') query = query.order('created_at', { ascending: false })
        else if (sortBy === 'Top') query = query.order('copy_count', { ascending: false })
        else if (sortBy === 'Trending') query = query.or('is_trending.eq.true,copy_count.gte.5').order('copy_count', { ascending: false })

        const { data, error } = await query
        if (!error) setImages(data || [])
        setLoading(false)
    }

    const handleCopy = async (id) => {
        await supabase.rpc('increment_copy_count', { image_id: id })
        setImages(prev => prev.map(img => img.id === id ? { ...img, copy_count: img.copy_count + 1 } : img))
    }

    const handleSearchInput = (val) => {
        setSearchInput(val)
        clearTimeout(searchTimeout.current)
        searchTimeout.current = setTimeout(() => setSearch(val), 400)
    }

    const activeFilters = (selectedTool !== 'All' ? 1 : 0) + (selectedCategory !== 'All' ? 1 : 0)

    return (
        <div className="min-h-screen bg-[#080808] text-white">

            <div className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

                    {/* Top row */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                                PromptGallery
                            </h1>
                            <p className="text-xs text-white/30 mt-0.5 hidden sm:block">Browse & copy AI image prompts</p>
                        </div>

                        <div className="relative flex-1 max-w-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search prompts..."
                                value={searchInput}
                                onChange={e => handleSearchInput(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Filters row */}
                    <div className="flex flex-wrap items-center gap-3">

                        {/* Sort tabs */}
                        <div className="flex bg-white/5 rounded-xl p-1 gap-0.5">
                            {SORTS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSortBy(s)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                                        ${sortBy === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white/70'}`}
                                >
                                    {s === 'Trending' ? '🔥 ' : s === 'New' ? '✨ ' : '⭐ '}{s}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-6 bg-white/10 hidden sm:block" />

                        {/* AI Tool filter — dynamic */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-white/30 font-medium hidden sm:block">Tool:</span>
                            <div className="flex gap-1.5 flex-wrap">
                                <button
                                    onClick={() => setSelectedTool('All')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
                                        ${selectedTool === 'All'
                                            ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                                            : 'bg-white/3 border-white/8 text-white/40 hover:text-white/70 hover:border-white/20'
                                        }`}
                                >
                                    All
                                </button>
                                {aiTools.map(tool => (
                                    <button
                                        key={tool}
                                        onClick={() => setSelectedTool(tool)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
                                            ${selectedTool === tool
                                                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                                                : 'bg-white/3 border-white/8 text-white/40 hover:text-white/70 hover:border-white/20'
                                            }`}
                                    >
                                        {tool}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full sm:w-px sm:h-6 bg-white/10" />

                        {/* Category filter — dynamic */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-white/30 font-medium hidden sm:block">Category:</span>
                            <div className="flex gap-1.5 flex-wrap">
                                <button
                                    onClick={() => setSelectedCategory('All')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
                                        ${selectedCategory === 'All'
                                            ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                                            : 'bg-white/3 border-white/8 text-white/40 hover:text-white/70 hover:border-white/20'
                                        }`}
                                >
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
                                            ${selectedCategory === cat
                                                ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                                                : 'bg-white/3 border-white/8 text-white/40 hover:text-white/70 hover:border-white/20'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeFilters > 0 && (
                            <button
                                onClick={() => { setSelectedTool('All'); setSelectedCategory('All') }}
                                className="ml-auto text-xs text-red-400/70 hover:text-red-400 transition-colors px-2 py-1"
                            >
                                Clear {activeFilters} filter{activeFilters > 1 ? 's' : ''}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {!loading && (
                    <p className="text-xs text-white/25 mb-6 font-medium">
                        {images.length} {images.length === 1 ? 'prompt' : 'prompts'} found
                    </p>
                )}

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="rounded-2xl overflow-hidden bg-[#0f0f0f] border border-white/5 animate-pulse">
                                <div className="h-56 bg-white/5" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-white/5 rounded-full w-1/3" />
                                    <div className="h-3 bg-white/5 rounded-full w-full" />
                                    <div className="h-3 bg-white/5 rounded-full w-2/3" />
                                    <div className="h-9 bg-white/5 rounded-xl mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && images.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="text-5xl mb-4">🎨</div>
                        <h3 className="text-lg font-semibold text-white/60 mb-2">No prompts found</h3>
                        <p className="text-sm text-white/30">Try adjusting your filters or search query</p>
                    </div>
                )}

                {!loading && images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {images.map(image => (
                            <ImageCard key={image.id} image={image} onCopy={handleCopy} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}