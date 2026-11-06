// @ts-nocheck
import { Activity, UserPlus } from "react-feather"
import { Permissions } from "../../utility/Permissions"
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined'
import BuildCircleOutlined from '@mui/icons-material/BuildCircleOutlined'
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined'
import CurrencyRupeeOutlined from '@mui/icons-material/CurrencyRupeeOutlined'
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined'
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined'
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined'
import PermPhoneMsgIcon from '@mui/icons-material/PermPhoneMsg'
import StorageOutlined from '@mui/icons-material/StorageOutlined'
import WhatsApp from '@mui/icons-material/WhatsApp'
import VpnKey from '@mui/icons-material/VpnKey'
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined'
import SendOutlined from '@mui/icons-material/SendOutlined'
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined'
import SettingsSuggestOutlined from '@mui/icons-material/SettingsSuggestOutlined'

const userData = JSON.parse(localStorage.getItem('kradChatData') || 'null')

export default [
    // -------------------------------------------------------------------------
    // 1. LIVE OPERATIONS
    // -------------------------------------------------------------------------
    {
        header: "Live Operations"
    },
    {
        id: 'chat',
        title: 'KRAD Live Chat',
        icon: <WhatsApp size={20} />,
        navLink: '/chat',
        badge: 'light-success',
        badgeText: 'Live',
        ...Permissions.userDdlList
    },
    {
        id: 'home',
        title: 'Dashboard',
        icon: <Activity size={18} />,
        navLink: '/dashboard',
        ...Permissions.dashboardView
    },

    // -------------------------------------------------------------------------
    // 2. WHATSAPP BUSINESS SUITE
    // -------------------------------------------------------------------------
    {
        header: "WhatsApp Business Suite"
    },
    {
        id: 'whatsapp-automation-suite',
        title: 'Flows & Automation',
        icon: <SmartToyOutlined size={20} />,
        ...Permissions.whatsappSmsList,
        children: [
            {
                id: 'whatsapp-workflows',
                title: 'Workflow Builder',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-workflows',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-automation',
                title: 'Chatbot Automation',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-automation',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-chatbots-self-webhook',
                title: 'Chatbot Webhooks',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-chatbots-self-webhook',
                ...Permissions.whatsappSmsList
            }
        ]
    },
    {
        id: 'whatsapp-campaigns',
        title: 'Broadcast & Campaigns',
        icon: <SendOutlined size={20} />,
        ...Permissions.whatsappSmsList,
        children: [
            {
                id: 'send-whatsapp',
                title: 'Send Message',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/send-whatsapp',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-broadcasts',
                title: 'Broadcasts & Consent',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-broadcasts',
                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-message-template',
                title: 'Message Templates',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-message-template',
                ...Permissions.whatsappTemplateList
            },
            {
                id: 'whatsapp-media',
                title: 'Media Library',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-media',
                ...Permissions.whatsappTemplateList
            }
        ]
    },
    {
        id: 'whatsapp-commerce',
        title: 'Commerce & Orders',
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
    {
        id: 'whatsapp-channels-config',
        title: 'Cloud API & Settings',
        icon: <SettingsSuggestOutlined size={20} />,
        ...Permissions.whatsappConfigList,
        children: [
            {
                id: 'whatsapp-connections',
                title: 'Business Connections',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-connections',
                ...Permissions.whatsappConfigList
            },
            {
                id: 'whatsapp-message-configuration',
                title: 'Cloud API Config',
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
                title: 'QR Code Generator',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-qr-list',
                ...Permissions.whatsappListQRReport
            },
            {
                id: 'whatsapp-rate-card',
                title: 'WhatsApp Rate Card',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/administration/wa-rate-card',
                ...Permissions.adminOperation
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 3. AUDIENCE & CRM
    // -------------------------------------------------------------------------
    {
        header: "Audience & Contacts"
    },
    {
        id: 'phone-book',
        title: 'Contact Groups',
        icon: <PermPhoneMsgIcon size={20} />,
        children: [
            {
                id: 'create-phone-book',
                title: 'Phone Book',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/group',
                ...Permissions.phoneList
            },
            {
                id: 'blacklist',
                title: 'Suppression List',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/blacklist',
                ...Permissions.blacklist
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 4. TEAM & ACCESS CONTROL
    // -------------------------------------------------------------------------
    {
        header: "Team & Administration"
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
        title: 'Team Invitations',
        icon: <UserPlus size={18} />,
        navLink: '/team-invitations',
        ...Permissions.userList
    },
    {
        id: 'master',
        title: 'System Access',
        icon: <ManageAccountsOutlined size={20} />,
        children: [
            {
                id: 'role-list',
                title: 'Roles & Permissions',
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
    // 5. ANALYTICS & INSIGHTS
    // -------------------------------------------------------------------------
    {
        header: "Analytics & Reports"
    },
    {
        id: 'reports',
        title: 'Analytics & Reports',
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
                title: 'Credit Consumption',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/consumption-report-by-view',
                ...Permissions.adminOperation
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 6. BILLING & INFRASTRUCTURE
    // -------------------------------------------------------------------------
    {
        header: "Billing & Infrastructure"
    },
    {
        id: 'credit-request',
        title: 'Wallet & Credits',
        icon: <CurrencyRupeeOutlined size={20} />,
        navLink: '/credit-request',
        ...Permissions.creditRequest
    },
    {
        id: 'routes',
        title: 'Gateway Routes',
        icon: <StorageOutlined size={20} />,
        children: [
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
                id: 'dlr list',
                title: 'DLR Return Codes',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/dlr-list',
                ...Permissions.dlrList
            },
            {
                id: 'get-kannel-status',
                title: 'Kannel Gateway Status',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/get-current-kennel-status',
                ...Permissions.currentKannelStatus
            }
        ]
    },
    {
        id: 'notification',
        title: 'Notifications',
        icon: <NotificationsOutlined size={20} />,
        navLink: '/notification',
        ...Permissions.creditRequest
    }
]
