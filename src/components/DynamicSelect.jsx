import { useState } from 'react'

export default function DynamicSelect({ label, value, onChange, options, placeholder }) {
    const [addingNew, setAddingNew] = useState(false)
    const [newValue, setNewValue] = useState('')

    const handleSelect = (e) => {
        if (e.target.value === '__add_new__') {
            setAddingNew(true)
            onChange('')
        } else {
            setAddingNew(false)
            onChange(e.target.value)
        }
    }

    const handleNewConfirm = () => {
        if (newValue.trim()) {
            onChange(newValue.trim())
            setAddingNew(false)
            setNewValue('')
        }
    }

    const handleCancel = () => {
        setAddingNew(false)
        setNewValue('')
        onChange('')
    }

    return (
        <div>
            <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                {label}
            </label>

            {!addingNew ? (
                <select
                    value={value}
                    onChange={handleSelect}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                >
                    <option value="" className="bg-[#111]">{placeholder}</option>
                    {options.map(opt => (
                        <option key={opt} value={opt} className="bg-[#111]">{opt}</option>
                    ))}
                    <option value="__add_new__" className="bg-[#111] text-indigo-400">
                        + Add New
                    </option>
                </select>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleNewConfirm()}
                        placeholder={`Type new ${label.toLowerCase()}...`}
                        autoFocus
                        className="flex-1 bg-white/5 border border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                    />
                    <button
                        type="button"
                        onClick={handleNewConfirm}
                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-colors"
                    >
                        Add
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white/50 hover:text-white transition-colors border border-white/10"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    )
}