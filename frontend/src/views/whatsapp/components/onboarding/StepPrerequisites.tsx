import React from 'react'

interface StepPrerequisitesProps {
    onNext: () => void
    onClose: () => void
}

export const StepPrerequisites: React.FC<StepPrerequisitesProps> = ({ onNext, onClose }) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                    Get started with WhatsApp's Business API
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    WhatsApp is one of the most popular communication applications in the world.
                    WhatsApp is a Facebook company and requires a Facebook account and Facebook
                    Business Manager to set up.
                </p>
            </div>

            <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">
                    What you will Need :-
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
                    <li>Access to Facebook Business Manager</li>
                    <li>A viable Phone Number for WhatsApp</li>
                    <li>Your business's legal address and details</li>
                    <li>Verify your Facebook Business</li>
                    <li>Please ensure you have full access to the WhatsApp Business account</li>
                    <li>Please ensure the ID that is being used belongs to the business that you manage</li>
                    <li>Please ensure the FB user ID has access to manage the WhatsApp account templates, phone numbers, generate QR code</li>
                </ol>
            </div>

            <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">
                    Create your WhatsApp Business Account
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                    To continue you need to access your Facebook business account, as well as:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
                    <li>Your company's legal name and address</li>
                    <li>A display name and short description</li>
                    <li>
                        A phone number you have access to, own by your business. Don't have one?{' '}
                        <span className="text-orange-500 font-semibold cursor-pointer">Contact Support</span>
                    </li>
                </ol>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    Close
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    className="px-6 py-2 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-sm transition-all"
                >
                    Next
                </button>
            </div>
        </div>
    )
}
