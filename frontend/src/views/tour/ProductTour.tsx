// @ts-nocheck
import React, { useEffect } from 'react'
import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'
import '@styles/react/libs/shepherd-tour/shepherd-tour.scss'

const backBtnClass = 'btn btn-sm btn-outline-secondary'
const nextBtnClass = 'btn btn-sm btn-primary'

export function createProductTour() {
    const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
            classes: 'krad-shepherd-theme shadow-lg rounded-3',
            scrollTo: { behavior: 'smooth', block: 'center' },
            cancelIcon: { enabled: true }
        }
    })

    // Step 1: Welcome Modal
    tour.addStep({
        id: 'welcome',
        title: '👋 Welcome to KRAD Chat!',
        text: 'Your enterprise WhatsApp Business Cloud platform. Let’s take a quick 1-minute walkthrough to discover Live Chat, Visual Chatbot Flows, Automated Drips, and 1-Click Meta Onboarding.',
        buttons: [
            {
                text: 'Skip Tour',
                classes: backBtnClass,
                action: () => {
                    localStorage.setItem('krad_tour_completed', 'true')
                    tour.complete()
                }
            },
            {
                text: 'Start Tour 🚀',
                classes: nextBtnClass,
                action: () => tour.next()
            }
        ]
    })

    // Step 2: KRAD Live Chat
    tour.addStep({
        id: 'live-chat',
        title: '💬 KRAD Live Chat Inbox',
        text: 'Real-time two-way WhatsApp customer messaging. Send approved templates, upload rich media, view customer conversation details, and seamlessly switch between bot automation and human takeover.',
        attachTo: { element: '#chat', on: 'right' },
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            { text: 'Next ➔', classes: nextBtnClass, action: () => tour.next() }
        ]
    })

    // Step 3: Chatbot Flows
    tour.addStep({
        id: 'chatbot-flows',
        title: '🤖 Chatbot Flows & Visual Canvas',
        text: 'Design multi-step WhatsApp chatbot conversational menus with interactive Quick Reply buttons, List Menus, Wait Delays, and Human Agent Handoff.',
        attachTo: { element: '#whatsapp-automation-suite', on: 'right' },
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            { text: 'Next ➔', classes: nextBtnClass, action: () => tour.next() }
        ]
    })

    // Step 4: Broadcasts & Drip Sequences
    tour.addStep({
        id: 'drip-sequences',
        title: '⏱️ Automated Drip Sequences',
        text: 'Schedule multi-day automated WhatsApp follow-ups triggered by keywords or new contact signups (e.g. Day 0 Welcome, Day 1 Check-In, Day 3 Offer).',
        attachTo: { element: '#whatsapp-campaigns', on: 'right' },
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            { text: 'Next ➔', classes: nextBtnClass, action: () => tour.next() }
        ]
    })

    // Step 5: Meta Cloud API & Embedded Signup
    tour.addStep({
        id: 'meta-signup',
        title: '⚡ Meta 1-Click Embedded Signup',
        text: 'Link your official WhatsApp Business numbers directly in 1 click using Facebook Login for Business with AES-256 encrypted access tokens.',
        attachTo: { element: '#whatsapp-channels-config', on: 'right' },
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            { text: 'Next ➔', classes: nextBtnClass, action: () => tour.next() }
        ]
    })

    // Step 6: Final Tour Step
    tour.addStep({
        id: 'finish',
        title: '🎉 You are all set!',
        text: 'You are ready to scale customer messaging with KRAD Chat. You can replay this tour anytime from the Help Guide icon in the top navbar.',
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            {
                text: 'Get Started 🚀',
                classes: nextBtnClass,
                action: () => {
                    localStorage.setItem('krad_tour_completed', 'true')
                    tour.complete()
                }
            }
        ]
    })

    return tour
}

export default function ProductTour() {
    useEffect(() => {
        // Auto-launch once if first-time user
        const completed = localStorage.getItem('krad_tour_completed')
        if (!completed) {
            const timer = setTimeout(() => {
                const tour = createProductTour()
                tour.start()
            }, 1200)
            return () => clearTimeout(timer)
        }
    }, [])

    return null
}
