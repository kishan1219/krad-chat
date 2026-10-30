// @ts-nocheck
import { Activity, Radio, UserPlus, Volume2 } from "react-feather"
import { Permissions } from "../../utility/Permissions"
// import PermPhoneMsgIcon from '@material-ui/icons/PermPhoneMsg'
// import { Permissions } from "../../utility/Permissions"
// import { FM } from "../../utility/helpers/common"
// import { Modules } from "../../utility/Const"
// import Contacts from '@material-ui/icons/Contacts'
// import Block from '@material-ui/icons/Block'
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined'
import BuildCircleOutlined from '@mui/icons-material/BuildCircleOutlined'
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined'
import CurrencyRupeeOutlined from '@mui/icons-material/CurrencyRupeeOutlined'
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined'
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined'
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined'
import PermPhoneMsgIcon from '@mui/icons-material/PermPhoneMsg'
import StorageOutlined from '@mui/icons-material/StorageOutlined'
import Message from '@mui/icons-material/Message'
import WhatsApp from '@mui/icons-material/WhatsApp'
import VpnKey from '@mui/icons-material/VpnKey'

const userData = JSON.parse(localStorage.getItem('kradChatData') || 'null')


export default [
    { id: 'team-invitations', title: 'Team Invitations', icon: <UserPlus size={12} />, navLink: '/team-invitations', ...Permissions.userList },
    // {
    //     header: "dashboard-menu"
    // },
    {
        id: 'home',
        title: 'Dashboard',
        icon: <Activity size={12} />,
        navLink: '/dashboard',
        ...Permissions.dashboardView
    },
    {
        id: 'user',
        title: 'User Management',
        icon: <UserPlus size={12} />,
        navLink: '/users-list',
        ...Permissions.userList
    },

    //voice message


    {
        id: 'messaging',
        title: 'Messaging',
        icon: <MarkEmailReadOutlined size={20} />,
        children: [
            // {
            //     id: 'send-sms',
            //     title: 'Send Sms',
            //     icon: <MessageCircle size={12} />,
            //     navLink: '/admin-send-sms',

            //     ...Permissions.smsList
            // },
            {
                id: 'send-sms',
                title: 'Send SMS',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/admin-send-sms',

                ...Permissions.smsList
            },
            {
                id: 'dlt-template-list',
                title: 'DLT Template',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/dlt-template-list',

                ...Permissions.dltList
            },
            {
                id: 'template-group-list',
                title: 'Template Group',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/template-group-list',

                ...Permissions.dltIsVisible
            },
            {
                id: 'sender-list',
                title: 'Sender ID',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/senderid-list',

                ...Permissions.senderList
            },
            {
                id: 'two-way-message',
                title: 'Two Way SMS',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/admin-send-two-ways-sms',

                ...Permissions.twoWay
            }
            // {
            //     id: 'campaign-list',
            //     title: 'Campaign List',
            //     icon: <ChevronRightOutlined size={12} />,
            //     navLink: '/all-campaign',

            //     ...Permissions.smsList
            // }
        ]
    },
    {
        id: 'voice-message',
        title: 'Voice Message',
        icon: <Volume2 size={20} />,
        ...Permissions.voiceSMS,
        children: [
            {
                id: 'voice-sms',
                title: 'Voice SMS',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/voice-sms',

                ...Permissions.voiceSMS
            },
            {
                id: 'voice-upload',
                title: 'Voice Upload',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/voice-upload',

                ...Permissions.voiceSMS
            },
            {
                id: 'voice-report',
                title: 'Voice Report',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/voice-report',

                ...Permissions.voiceSMS
            }
        ]
    },

    {
        id: 'whatsapp',
        title: 'Whatsapp',
        icon: <WhatsApp size={20} />,

        ...Permissions.whatsappSmsList,

        children: [
            { id: 'whatsapp-webhook-events', title: 'Webhook Events', icon: <ChevronRightOutlined size={12} />, navLink: '/whatsapp-webhook-events', ...Permissions.whatsappConfigList },
            { id: 'whatsapp-workflows', title: 'Workflow Builder', icon: <ChevronRightOutlined size={12} />, navLink: '/whatsapp-workflows', ...Permissions.whatsappSmsList },
            { id: 'whatsapp-connections', title: 'Business Connections', icon: <ChevronRightOutlined size={12} />, navLink: '/whatsapp-connections', ...Permissions.whatsappConfigList },
            { id: 'whatsapp-broadcasts', title: 'Broadcasts & Consent', icon: <ChevronRightOutlined size={12} />, navLink: '/whatsapp-broadcasts', ...Permissions.whatsappSmsList },
            { id: 'whatsapp-catalog', title: 'Product Catalog', icon: <ChevronRightOutlined size={12} />, navLink: '/whatsapp-catalog', ...Permissions.whatsappSmsList },
            { id: 'whatsapp-orders', title: 'Customer Orders', icon: <ChevronRightOutlined size={12} />, navLink: '/whatsapp-orders', ...Permissions.whatsappSmsList },
            { id: 'whatsapp-automation', title: 'Chatbot Automation', icon: <ChevronRightOutlined size={12} />, navLink: '/whatsapp-automation', ...Permissions.whatsappSmsList },
            // {
            //     id: 'send-sms',
            //     title: 'Send Sms',
            //     icon: <MessageCircle size={12} />,
            //     navLink: '/admin-send-sms',

            //     ...Permissions.smsList
            // },
            {
                id: 'send-whatsapp',
                title: 'Whatsapp Message',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/send-whatsapp',

                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-message-template',
                title: 'Whatsapp Template',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-message-template',

                ...Permissions.whatsappTemplateList
            },
            {
                id: 'whatsapp-message-configuration',
                title: 'Configuration',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-message-configuration',

                ...Permissions.whatsappConfigList
            },
            {
                id: 'whatsapp-message-report',
                title: 'Message Report',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-message-report',

                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-chatbots-self-webhook',
                title: 'Chatbot Response',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-chatbots-self-webhook',

                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-summary-report',
                title: 'Summary Report',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-summary-report',

                ...Permissions.whatsappSmsList
            },
            {
                id: 'whatsapp-analytics-report',
                title: 'Analytics Report',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-analytics-report',

                ...Permissions.whatsappGetAnalyticsReport
            },
            {
                id: 'whatsapp-conversation-report',
                title: 'Conversation Report',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-conversation-report',

                ...Permissions.whatsappGetConversationAnalyticsReport
            },
            {
                id: 'whatsapp-template-report',
                title: 'Template Report',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-template-report',

                ...Permissions.whatsappGetTemplateAnalyticsReport
            },
            {
                id: 'whatsapp-QR-report',
                title: 'QR List',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/wa-get-qr-list',

                ...Permissions.whatsappListQRReport
            },
            {
                id: 'whatsapp-media',
                title: 'Whatsapp Media',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/whatsapp-media',

                ...Permissions.whatsappTemplateList
            },
            {
                id: 'whatsapp-rate-card',
                title: 'Whatsapp Rate Card',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/administration/wa-rate-card',

                ...Permissions.adminOperation
            }
      
            // {
            //     id: 'campaign-list',
            //     title: 'Campaign List',
            //     icon: <ChevronRightOutlined size={12} />,
            //     navLink: '/all-campaign',

            //     ...Permissions.smsList
            // }
        ]
    },
    {
        id: 'phone-book',
        title: 'Phone Book',
        icon: <PermPhoneMsgIcon size={20} />,
        children: [
            {
                id: 'create-phone-book',
                title: 'Phone Book',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/group',

                ...Permissions.phoneList
            },
            {
                id: 'blacklist',
                title: 'BlackList',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/blacklist',
                ...Permissions.blacklist
            }
        ]
    },
    {
        id: 'reports',
        title: 'Reports',
        icon: <AssessmentOutlined size={20} />,
        children: [
            {
                id: 'campaign-report',
                title: 'All Campaign Report',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/campaign-report',

                ...Permissions.adminOperation
            },
            {
                id: 'reportss',
                title: 'All Reports',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/delivery-report',
                ...Permissions.reportAll
            },
            // {
            //     id: 'export-all-report',
            //     title: 'Export Report',
            //     icon: <ChevronRightOutlined size={15} />,
            //     navLink: '/export-all-report',
            //     ...Permissions.reportAll
            // },

            ...(userData?.allow_detail_report === 1 ? [
                {
                    id: 'detailed-report',
                    title: 'Detailed Report',
                    icon: <ChevronRightOutlined size={15} />,
                    navLink: '/detailed-report',
                    ...Permissions.reportAll
                }
            ] : []),
            ...(userData?.allow_detail_report === 1 ? [
                {
                    id: 'export-report',
                    title: 'Download Report',
                    icon: <ChevronRightOutlined size={15} />,
                    navLink: '/download-report',
                    ...Permissions.reportAll
                }
            ] : []),
            // {
            //     id: 'scheduled-campaign-report',
            //     title: 'Schedule Campaign',
            //     icon: <ChevronRightOutlined size={15} />,
            //     navLink: '/scheduled-campaign-report',

            //     ...Permissions.reportAll
            // },
            {
                id: 'message-campaign-report',
                title: 'Message Consumption',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/message-consumption-report',

                ...Permissions.reportAll
            },

            // {
            //     id: 'mobile-campaign-report',
            //     title: 'Mobile Report',
            //     icon: <ChevronRightOutlined size={15} />,
            //     navLink: '/report-by-mobile-number',

            //     ...Permissions.reportAll
            // },
            {
                id: 'report-by-time',
                title: 'Report By Time',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/report-by-30-sec',
                ...Permissions.adminOperation
            },
            {
                id: 'report-by-template-group',
                title: 'Report By Template Group',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/summary-report-by-template-group',
                ...Permissions.dltIsVisible
            },
            {
                id: 'month-wise-report',
                title: 'Month Wise Report',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/month-wise-report',
                ...Permissions.dltIsVisible
            }
        ]
    },
    {
        id: 'master',
        title: 'Master',
        icon: <BuildCircleOutlined size={20} />,
        children: [
            {
                id: 'notification-template',
                title: 'Notification Template',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/notification-template',
                ...Permissions.adminOperation
            },
            {
                id: 'invalid-number',
                title: 'Invalid Number',
                icon: <ChevronRightOutlined size={20} />,
                navLink: '/invalid-number',
                ...Permissions.invalidSeriesPermission

            },
            {
                id: 'role-list',
                title: 'Roles',
                icon: <ChevronRightOutlined size={20} />,
                navLink: '/role-list',
                ...Permissions.roleList

            },
            {
                id: 'country-list',
                title: 'Country',
                icon: <ChevronRightOutlined size={20} />,
                navLink: '/administration/country',
                ...Permissions.adminOperation

            }
        ]

    },
    {
        id: 'admin-operation',
        title: 'Admin Operations',
        icon: <ManageAccountsOutlined size={20} />,
        children: [
            {
                id: 'overview',
                title: 'Overview',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/overview',

                ...Permissions.adminOperation
            },
            {
                id: 'user-route',
                title: 'User Route',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/get-user-route',

                ...Permissions.adminOperation
            },
            {
                id: 'send-notification',
                title: 'Send Notification',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/server-info',

                ...Permissions.adminOperation
            },
            {
                id: 'manage-campaign',
                title: 'Manage Campaign',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/admin-manage-campaign',

                ...Permissions.adminOperation
            },
            {
                id: 'user-credit-report',
                title: 'User Credit Report',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/user-credit-report',

                ...Permissions.adminOperation
            },
            {
                id: 'daily-report',
                title: 'Daily Report',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/get-daily-report',

                ...Permissions.adminOperation
            },
            {
                id: 'consumption-report',
                title: 'Consumption Report',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/consumption-report-by-view',

                ...Permissions.adminOperation
            },
            {
                id: 'documentation',
                title: 'APIs',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/api-documentation',

                ...Permissions.adminOperation
            },
            {
                id: 'monthlyReport',
                title: 'User Monthly Report',
                icon: <ChevronRightOutlined size={15} />,
                navLink: '/user-monthly-report',

                ...Permissions.adminOperation
            }
        ]
    },
    {
        id: 'routes',
        title: 'Gateway',
        icon: <StorageOutlined size={20} />,
        children: [
            {
                id: 'primary-route',
                title: 'SMPP/Voice',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/primary-routes',

                ...Permissions.primaryList
            },
            {
                id: 'secondary-route',
                title: 'SMPP Secondary',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/secondary-routes',

                ...Permissions.secondaryView
            },
            {
                id: 'dlr list',
                title: 'Dlr Code',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/dlr-list',
                ...Permissions.dlrList
            },
            {
                id: 'get-kannel-status',
                title: 'Check Kannel Status',
                icon: <ChevronRightOutlined size={12} />,
                navLink: '/get-current-kennel-status',
                ...Permissions.currentKannelStatus
            }
        ]
    },
    // {
    //     id: 'notification-template',
    //     title: 'Notification Template',
    //     icon: <Airplay size={12} />,
    //     navLink: '/notification-template',
    //     ...Permissions.adminOperation
    // },
    {
        id: 'credit-request',
        title: 'Credit Request',
        icon: <CurrencyRupeeOutlined size={20} />,
        navLink: '/credit-request',
        ...Permissions.creditRequest

    },

    {
        id: 'notification',
        title: 'Notification',
        icon: <NotificationsOutlined size={20} />,
        navLink: '/notification',
        ...Permissions.creditRequest

    },
    {
        id: 'login-user-log',
        title: 'Login Log List',
        icon: <VpnKey size={12} />,
        navLink: '/login-user-log',
        ...Permissions.viewLoginLog

    },
    {
        id: 'chat',
        title: 'Whatsapp Chats',
        icon: <Message size={20} />,
        navLink: '/chat',
        ...Permissions.userDdlList

    }


]
