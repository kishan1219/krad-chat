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

    // Step 1: Welcome Overview
    tour.addStep({
        id: 'welcome',
        title: '👋 Welcome to KRAD Chat!',
        text: 'Your enterprise WhatsApp Business Cloud platform. This quick guided tour walks you through the essential client workflow: uploading contacts, creating WhatsApp templates, sending broadcast campaigns, and managing live customer chats.',
        buttons: [
            {
                text: 'Skip Guide',
                classes: backBtnClass,
                action: () => {
                    localStorage.setItem('krad_tour_completed', 'true')
                    tour.complete()
                }
            },
            {
                text: 'Start Guide 🚀',
                classes: nextBtnClass,
                action: () => tour.next()
            }
        ]
    })

    // Step 2: Uploading Contacts & Audience
    tour.addStep({
        id: 'upload-contacts',
        title: '👥 Step 1: Upload & Organize Contacts',
        text: 'Navigate to Contacts > All Contacts to import customer phone numbers via CSV/Excel or add them individually. You can group contacts by VIPs, leads, or purchase history to run targeted campaigns.',
        attachTo: { element: '#phone-book', on: 'right' },
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            { text: 'Next: Templates ➔', classes: nextBtnClass, action: () => tour.next() }
        ]
    })

    // Step 3: Creating WhatsApp Templates
    tour.addStep({
        id: 'create-templates',
        title: '📝 Step 2: Create WhatsApp Message Templates',
        text: 'Under WhatsApp Management > Approved Message Templates, create Meta-approved WhatsApp templates with dynamic variables like {{1}} for customer names, rich header media (images/PDFs), and Quick Reply buttons.',
        attachTo: { element: '#whatsapp-campaigns', on: 'right' },
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            { text: 'Next: Broadcasts ➔', classes: nextBtnClass, action: () => tour.next() }
        ]
    })

    // Step 4: Sending Messages & Broadcasts
    tour.addStep({
        id: 'send-broadcasts',
        title: '🚀 Step 3: Send Messages & Launch Campaigns',
        text: 'Use "Send Direct Message" for 1-to-1 outreach, or "Bulk Broadcast Campaigns" to reach thousands of opt-in customers simultaneously with real-time delivery and read status tracking.',
        attachTo: { element: '#whatsapp-campaigns', on: 'right' },
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            { text: 'Next: Live Chat ➔', classes: nextBtnClass, action: () => tour.next() }
        ]
    })

    // Step 5: Live Chat & Human Takeover
    tour.addStep({
        id: 'live-chat',
        title: '💬 Step 4: Manage Inbound Live Chat',
        text: 'When customers reply, their conversations appear in Live Chat. Your agents can respond in real-time within the 24-hour service window, share media files, send pre-approved templates, or take over from the automated chatbot.',
        attachTo: { element: '#chat', on: 'right' },
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            { text: 'Next: Chatbots ➔', classes: nextBtnClass, action: () => tour.next() }
        ]
    })

    // Step 6: Chatbots & Visual Flow Builder
    tour.addStep({
        id: 'flow-builder',
        title: '🤖 Step 5: Visual Chatbot Flow Builder',
        text: 'Under WhatsApp Chatbot > Flow Builder, drag and drop interactive menus, buttons, and wait steps on an intuitive canvas to automate FAQs, order bookings, and lead qualification 24/7.',
        attachTo: { element: '#whatsapp-automation-suite', on: 'right' },
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            { text: 'Next: Numbers ➔', classes: nextBtnClass, action: () => tour.next() }
        ]
    })

    // Step 7: Connecting WhatsApp Phone Numbers
    tour.addStep({
        id: 'whatsapp-setup',
        title: '⚡ Step 6: Connect WhatsApp Phone Numbers',
        text: 'Go to Settings & Gateways > Connect Phone Numbers to link your official WhatsApp Business numbers in seconds with Meta 1-Click Embedded Signup.',
        attachTo: { element: '#whatsapp-channels-config', on: 'right' },
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            { text: 'Finish Guide 🎉', classes: nextBtnClass, action: () => tour.next() }
        ]
    })

    // Step 8: Complete
    tour.addStep({
        id: 'finish',
        title: '🎉 You are ready to start!',
        text: 'You have everything you need to begin sending messages, creating templates, and chatting with customers. Click the (?) Help Guide icon in the top navbar anytime to replay this walkthrough.',
        buttons: [
            { text: 'Back', classes: backBtnClass, action: () => tour.back() },
            {
                text: 'Launch Platform 🚀',
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
