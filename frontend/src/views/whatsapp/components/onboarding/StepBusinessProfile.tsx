import React from 'react'

export const BUSINESS_CATEGORIES = [
    { value: 'OTHER', label: 'OTHER' },
    { value: 'AUTO', label: 'AUTO' },
    { value: 'BEAUTY', label: 'BEAUTY' },
    { value: 'APPAREL', label: 'APPAREL' },
    { value: 'EDU', label: 'EDU' },
    { value: 'ENTERTAIN', label: 'ENTERTAIN' },
    { value: 'EVENT_PLAN', label: 'EVENT_PLAN' },
    { value: 'FINANCE', label: 'FINANCE' },
    { value: 'FOOD_GROCERY', label: 'FOOD_GROCERY' },
    { value: 'HEALTH', label: 'HEALTH' },
    { value: 'HOTEL', label: 'HOTEL' },
    { value: 'NONPROFIT', label: 'NONPROFIT' },
    { value: 'PROF_SERVICES', label: 'PROF_SERVICES' },
    { value: 'RESTAURANT', label: 'RESTAURANT' },
    { value: 'RETAIL', label: 'RETAIL' },
    { value: 'TRAVEL', label: 'TRAVEL' }
]

interface StepBusinessProfileProps {
    name: string
    setName: (val: string) => void
    category: string
    setCategory: (val: string) => void
    enableAutoResponse: boolean
    setEnableAutoResponse: (val: boolean) => void
    autoResponseMessage: string
    setAutoResponseMessage: (val: string) => void
    onBack: () => void
    onNext: () => void
}

export const StepBusinessProfile: React.FC<StepBusinessProfileProps> = ({
    name,
    setName,
    category,
    setCategory,
    enableAutoResponse,
    setEnableAutoResponse,
    autoResponseMessage,
    setAutoResponseMessage,
    onBack,
    onNext
}) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-white mb-1.5">
                    Name
                </label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr Syed Majid Ali"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-white mb-1.5">
                    Business Category <span className="text-rose-500">*</span>
                </label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-orange-400 dark:border-orange-500/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                    <option value="" disabled>select</option>
                    {BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={enableAutoResponse}
                        onChange={(e) => setEnableAutoResponse(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                        Enable Auto Response
                    </span>
                </label>

                {enableAutoResponse && (
                    <div className="mt-3 pl-6">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                            Welcome Message:
                        </label>
                        <textarea
                            rows={3}
                            value={autoResponseMessage}
                            onChange={(e) => setAutoResponseMessage(e.target.value)}
                            placeholder="Enter the automated response for new customer conversations..."
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-sm transition-all"
                >
                    Continue
                </button>
            </div>
        </form>
    )
}
