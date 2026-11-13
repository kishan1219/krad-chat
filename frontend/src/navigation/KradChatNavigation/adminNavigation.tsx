// @ts-nocheck
import React from "react"
import { Activity, UserPlus, Settings, Smartphone } from "react-feather"
import { Permissions } from "../../utility/Permissions"
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined'
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined'
import CurrencyRupeeOutlined from '@mui/icons-material/CurrencyRupeeOutlined'
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined'
import PermPhoneMsgIcon from '@mui/icons-material/PermPhoneMsg'
import WhatsApp from '@mui/icons-material/WhatsApp'
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined'
import SendOutlined from '@mui/icons-material/SendOutlined'
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined'
import SettingsSuggestOutlined from '@mui/icons-material/SettingsSuggestOutlined'

export default [
    // -------------------------------------------------------------------------
    // 1. DASHBOARD (Always first)
    // -------------------------------------------------------------------------
    {
        id: 'home',
        title: 'Dashboard',
        icon: <Activity size={18} />,
        navLink: '/dashboard',
        ...Permissions.dashboardView
    },

    // -------------------------------------------------------------------------
    // 2. USER MANAGEMENT (Admin [0] and Reseller [1] only - Second in hierarchy)
    // -------------------------------------------------------------------------
    {
        id: 'user-management-group',
        title: 'User Management',
        icon: <UserPlus size={18} />,
        userTypes: [0, 1],
        children: [
            {
                id: 'users-list-item',
                title: 'User Accounts',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/users-list',
                userTypes: [0, 1],
                ...Permissions.userList
            },
            {
                id: 'team-invitations',
                title: 'Team Invitations',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/team-invitations',
                userTypes: [0],
                ...Permissions.adminOperation
            },
            {
                id: 'role-list',
                title: 'Role Permissions',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/role-list',
                userTypes: [0],
                ...Permissions.adminOperation
            },
            {
                id: 'login-user-log',
                title: 'Audit Logs',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/login-user-log',
                userTypes: [0],
                ...Permissions.adminOperation
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 3. WHATSAPP CLOUD API SETUP (Top-level & prominent for Admin, Reseller & Client)
    // -------------------------------------------------------------------------
    {
        id: 'whatsapp-configuration',
        title: 'WhatsApp Configuration',
        icon: <Smartphone size={18} />,
        navLink: '/whatsapp-connections',
        badge: 'light-success',
        badgeText: 'Setup',
        userTypes: [0, 1, 2, 3],
        ...Permissions.dashboardView
    },

    // -------------------------------------------------------------------------
    // 4. LIVE CHAT INBOX
    // -------------------------------------------------------------------------
    {
        id: 'chat',
        title: 'Live Chat',
        icon: <WhatsApp size={18} />,
        navLink: '/chat',
        badge: 'light-success',
        badgeText: 'Live',
        userTypes: [0, 1, 2, 3]
    },

    // -------------------------------------------------------------------------
    // 5. WHATSAPP CHATBOT (Simple keyword for human interaction + clear sub-operations)
    // -------------------------------------------------------------------------
    {
        id: 'whatsapp-automation-suite',
        title: 'WhatsApp Chatbot',
        icon: <SmartToyOutlined size={18} />,
        children: [
            {
                id: 'whatsapp-workflows',
                title: 'Flow Builder',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-workflows'
            },
            {
                id: 'whatsapp-automation',
                title: 'Auto Replies',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-automation'
            },
            {
                id: 'whatsapp-drip-sequences',
                title: 'Sequences',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-drip-sequences'
            },
            {
                id: 'whatsapp-chatbots-self-webhook',
                title: 'Webhooks',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-chatbots-self-webhook'
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 6. CAMPAIGNS & BROADCASTS
    // -------------------------------------------------------------------------
    {
        id: 'whatsapp-campaigns',
        title: 'Campaigns',
        icon: <SendOutlined size={18} />,
        children: [
            {
                id: 'send-whatsapp',
                title: 'Send Message',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/send-whatsapp'
            },
            {
                id: 'whatsapp-broadcasts',
                title: 'Broadcasts',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-broadcasts'
            },
            {
                id: 'whatsapp-message-template',
                title: 'Templates',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-message-template'
            },
            {
                id: 'whatsapp-media',
                title: 'Media Assets',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-media'
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 7. CONTACTS & AUDIENCE
    // -------------------------------------------------------------------------
    {
        id: 'phone-book',
        title: 'Contacts',
        icon: <PermPhoneMsgIcon size={18} />,
        children: [
            {
                id: 'create-phone-book',
                title: 'Contact List',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/group'
            },
            {
                id: 'blacklist',
                title: 'Blocked Numbers',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/blacklist'
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 8. CATALOG & ORDERS
    // -------------------------------------------------------------------------
    {
        id: 'whatsapp-commerce',
        title: 'Catalog & Orders',
        icon: <ShoppingCartOutlined size={18} />,
        children: [
            {
                id: 'whatsapp-catalog',
                title: 'Products',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-catalog'
            },
            {
                id: 'whatsapp-orders',
                title: 'Orders',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-orders'
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 9. REPORTS & ANALYTICS
    // -------------------------------------------------------------------------
    {
        id: 'reports',
        title: 'Reports & Analytics',
        icon: <AssessmentOutlined size={18} />,
        children: [
            {
                id: 'whatsapp-analytics-report',
                title: 'WhatsApp Analytics',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-analytics-report'
            },
            {
                id: 'whatsapp-message-report',
                title: 'Delivery Logs',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-message-report'
            },
            {
                id: 'whatsapp-conversation-report',
                title: 'Conversation Metrics',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-conversation-report'
            },
            {
                id: 'whatsapp-template-report',
                title: 'Template Performance',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-template-report'
            },
            {
                id: 'whatsapp-summary-report',
                title: 'Summary Reports',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-summary-report'
            },
            {
                id: 'campaign-report',
                title: 'Campaign Analytics',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/campaign-report',
                userTypes: [0]
            },
            {
                id: 'consumption-report',
                title: 'Credit Usage',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/consumption-report-by-view',
                userTypes: [0]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 10. WALLET & BILLING
    // -------------------------------------------------------------------------
    {
        id: 'credit-request',
        title: 'Wallet & Billing',
        icon: <CurrencyRupeeOutlined size={18} />,
        navLink: '/credit-request',
        userTypes: [0, 1, 2, 3]
    },

    // -------------------------------------------------------------------------
    // 11. ACCOUNT SETTINGS (For Reseller [1] and Client [2, 3])
    // -------------------------------------------------------------------------
    {
        id: 'child-account-settings',
        title: 'Account Settings',
        icon: <Settings size={18} />,
        navLink: '/app-settings',
        userTypes: [1, 2, 3]
    },

    // -------------------------------------------------------------------------
    // 12. SYSTEM ADMINISTRATION (Super Admin [0] ONLY)
    // -------------------------------------------------------------------------
    {
        header: "Administration",
        userTypes: [0]
    },
    {
        id: 'admin-system-settings',
        title: 'System & Gateways',
        icon: <SettingsSuggestOutlined size={18} />,
        userTypes: [0],
        children: [
            {
                id: 'app-settings-page',
                title: 'App Settings',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/app-settings',
                userTypes: [0]
            },
            {
                id: 'whatsapp-message-configuration',
                title: 'WhatsApp Configuration',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-message-configuration',
                userTypes: [0, 1, 2, 3]
            },
            {
                id: 'primary-route',
                title: 'Primary Routes',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/primary-routes',
                userTypes: [0]
            },
            {
                id: 'secondary-route',
                title: 'Secondary Routes',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/secondary-routes',
                userTypes: [0]
            },
            {
                id: 'whatsapp-rate-card',
                title: 'Message Pricing',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/administration/wa-rate-card',
                userTypes: [0]
            },
            {
                id: 'whatsapp-QR-report',
                title: 'QR Code Links',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-qr-list',
                userTypes: [0]
            },
            {
                id: 'whatsapp-webhook-events',
                title: 'Webhook Event Logs',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-webhook-events',
                userTypes: [0]
            },
            {
                id: 'dlr-list',
                title: 'DLR Return Codes',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/dlr-list',
                userTypes: [0]
            },
            {
                id: 'get-kannel-status',
                title: 'Gateway Status',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/get-current-kennel-status',
                userTypes: [0]
            },
            {
                id: 'documentation',
                title: 'API Documentation',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/api-documentation',
                userTypes: [0]
            }
        ]
    }
]
