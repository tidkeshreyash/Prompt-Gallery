import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

export function useOptions() {
    const [aiTools, setAiTools] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOptions()
    }, [])

    const fetchOptions = async () => {
        const { data } = await supabase
            .from('images')
            .select('ai_tool, category')

        if (data) {
            const tools = [...new Set(data.map(d => d.ai_tool).filter(Boolean))].sort()
            const cats = [...new Set(data.map(d => d.category).filter(Boolean))].sort()
            setAiTools(tools)
            setCategories(cats)
        }
        setLoading(false)
    }

    return { aiTools, categories, loading, refetch: fetchOptions }
}