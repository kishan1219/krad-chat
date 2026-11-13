// @ts-nocheck
import React from "react"
import { Activity, UserPlus } from "react-feather"
import { Permissions } from "../../utility/Permissions"
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined'
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined'
import CurrencyRupeeOutlined from '@mui/icons-material/CurrencyRupeeOutlined'
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined'
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined'
import PermPhoneMsgIcon from '@mui/icons-material/PermPhoneMsg'
import StorageOutlined from '@mui/icons-material/StorageOutlined'
import WhatsApp from '@mui/icons-material/WhatsApp'
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined'
import SendOutlined from '@mui/icons-material/SendOutlined'
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined'
import SettingsSuggestOutlined from '@mui/icons-material/SettingsSuggestOutlined'

export default [
    // -------------------------------------------------------------------------
    // 1. DASHBOARD (Always first as requested)
    // -------------------------------------------------------------------------
    {
        header: "Overview"
    },
    {
        id: 'home',
        title: 'Dashboard',
        icon: <Activity size={18} />,
        navLink: '/dashboard',
        ...Permissions.dashboardView
    },

    // -------------------------------------------------------------------------
    // 2. USER MANAGEMENT (Second as requested)
    // -------------------------------------------------------------------------
    {
        header: "User Management"
    },
    {
        id: 'user',
        title: 'User Management',
        icon: <UserPlus size={18} />,
        navLink: '/users-list',
        ...Permissions.userList
    },
    {
        id: 'team-invitations',
        title: 'Invitations',
        icon: <UserPlus size={18} />,
        navLink: '/team-invitations',
        ...Permissions.userList
    },
    {
        id: 'master',
        title: 'Roles & Security',
        icon: <ManageAccountsOutlined size={20} />,
        children: [
            {
                id: 'role-list',
                title: 'Role Management',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/role-list',
                ...Permissions.roleList
            },
            {
                id: 'login-user-log',
                title: 'Login Audit Logs',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/login-user-log',
                ...Permissions.viewLoginLog
            },
            {
                id: 'overview',
                title: 'Admin Overview',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/overview',
                ...Permissions.adminOperation
            },
            {
                id: 'user-route',
                title: 'User Routing',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/get-user-route',
                ...Permissions.adminOperation
            },
            {
                id: 'documentation',
                title: 'API Documentation',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/api-documentation',
                ...Permissions.adminOperation
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 3. WHATSAPP CHATBOT (Simple keyword term for human interaction, with operations under it)
    // -------------------------------------------------------------------------
    {
        header: "WhatsApp Chatbot"
    },
    {
        id: 'whatsapp-automation-suite',
        title: 'WhatsApp Chatbot',
        icon: <SmartToyOutlined size={20} />,
        ...Permissions.whatsappSmsList,
        children: [
            {
                id: 'chat',
                title: 'Live Chat (Inbox)',
                icon: <WhatsApp size={16} />,
                navLink: '/chat',
                badge: 'light-success',
                badgeText: 'Live',
                ...Permissions.userDdlList
            },
            {
                id: 'whatsapp-workflows',
                title: 'Flow Builder',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-workflows',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-drip-sequences',
                title: 'Follow-up Sequences',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-drip-sequences',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-automation',
                title: 'Auto-replies',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-automation',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-chatbots-self-webhook',
                title: 'Webhook Triggers',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-chatbots-self-webhook',
                ...Permissions.whatsappSmsList
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 4. WHATSAPP MANAGEMENT
    // -------------------------------------------------------------------------
    {
        header: "WhatsApp Management"
    },
    {
        id: 'whatsapp-campaigns',
        title: 'WhatsApp Management',
        icon: <SendOutlined size={20} />,
        ...Permissions.whatsappSmsList,
        children: [
            {
                id: 'send-whatsapp',
                title: 'Send Direct Message',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/send-whatsapp',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-broadcasts',
                title: 'Bulk Broadcast Campaigns',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-broadcasts',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-message-template',
                title: 'Approved Message Templates',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-message-template',
                ...Permissions.whatsappTemplateList
            },
            {
                id: 'whatsapp-media',
                title: 'Media & File Assets',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-media',
                ...Permissions.whatsappTemplateList
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 5. CONTACTS & AUDIENCE
    // -------------------------------------------------------------------------
    {
        header: "Audience & Contacts"
    },
    {
        id: 'phone-book',
        title: 'Contacts',
        icon: <PermPhoneMsgIcon size={20} />,
        children: [
            {
                id: 'create-phone-book',
                title: 'All Contacts',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/group',
                ...Permissions.phoneList
            },
            {
                id: 'blacklist',
                title: 'Blocked Numbers',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/blacklist',
                ...Permissions.blacklist
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 6. STORE & ORDERS
    // -------------------------------------------------------------------------
    {
        header: "Catalog & Orders"
    },
    {
        id: 'whatsapp-commerce',
        title: 'Catalog & Orders',
        icon: <ShoppingCartOutlined size={20} />,
        ...Permissions.whatsappSmsList,
        children: [
            {
                id: 'whatsapp-catalog',
                title: 'Product Catalog',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-catalog',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-orders',
                title: 'Customer Orders',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-orders',
                ...Permissions.whatsappSmsList
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 7. ANALYTICS & REPORTS
    // -------------------------------------------------------------------------
    {
        header: "Analytics & Reports"
    },
    {
        id: 'reports',
        title: 'Reports & Analytics',
        icon: <AssessmentOutlined size={20} />,
        children: [
            {
                id: 'whatsapp-analytics-report',
                title: 'WhatsApp Analytics',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-analytics-report',
                ...Permissions.whatsappGetAnalyticsReport
            },
            {
                id: 'whatsapp-conversation-report',
                title: 'Conversation Metrics',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-conversation-report',
                ...Permissions.whatsappGetConversationAnalyticsReport
            },
            {
                id: 'whatsapp-template-report',
                title: 'Template Performance',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-template-report',
                ...Permissions.whatsappGetTemplateAnalyticsReport
            },
            {
                id: 'whatsapp-summary-report',
                title: 'Summary Reports',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-summary-report',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-message-report',
                title: 'Delivery Logs',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-message-report',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'campaign-report',
                title: 'Campaign Analytics',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/campaign-report',
                ...Permissions.adminOperation
            },
            {
                id: 'consumption-report',
                title: 'Credit Usage',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/consumption-report-by-view',
                ...Permissions.adminOperation
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 8. SETTINGS & GATEWAYS (Restored Super Admin settings & routes)
    // -------------------------------------------------------------------------
    {
        header: "Settings & Gateways"
    },
    {
        id: 'whatsapp-channels-config',
        title: 'Settings & Gateways',
        icon: <SettingsSuggestOutlined size={20} />,
        children: [
            {
                id: 'app-settings-page',
                title: 'App Settings',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/app-settings',
                ...Permissions.editProfile
            },
            {
                id: 'whatsapp-connections',
                title: 'Connect Phone Numbers',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-connections',
                ...Permissions.whatsappConfigList
            },
            {
                id: 'whatsapp-message-configuration',
                title: 'API Settings',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-message-configuration',
                ...Permissions.whatsappConfigList
            },
            {
                id: 'whatsapp-webhook-events',
                title: 'Webhook Event Logs',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-webhook-events',
                ...Permissions.whatsappConfigList
            },
            {
                id: 'whatsapp-QR-report',
                title: 'QR Code Links',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-qr-list',
                ...Permissions.whatsappListQRReport
            },
            {
                id: 'whatsapp-rate-card',
                title: 'Message Pricing',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/administration/wa-rate-card',
                ...Permissions.adminOperation
            },
            {
                id: 'primary-route',
                title: 'Primary Routes',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/primary-routes',
                ...Permissions.primaryList
            },
            {
                id: 'secondary-route',
                title: 'Secondary Routes',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/secondary-routes',
                ...Permissions.secondaryView
            },
            {
                id: 'dlr-list',
                title: 'DLR Return Codes',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/dlr-list',
                ...Permissions.dlrList
            },
            {
                id: 'get-kannel-status',
                title: 'Gateway Status',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/get-current-kennel-status',
                ...Permissions.currentKannelStatus
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 9. BILLING & ACCOUNT
    // -------------------------------------------------------------------------
    {
        header: "Billing & Account"
    },
    {
        id: 'credit-request',
        title: 'Wallet & Billing',
        icon: <CurrencyRupeeOutlined size={20} />,
        navLink: '/credit-request',
        ...Permissions.creditRequest
    },
    {
        id: 'notification',
        title: 'Notifications',
        icon: <NotificationsOutlined size={20} />,
        navLink: '/notification',
        ...Permissions.creditRequest
    }
]
