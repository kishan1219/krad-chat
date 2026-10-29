// @ts-nocheck
import { lazy } from 'react'
import { Permissions } from '../../utility/Permissions'
import AllReports from '../../views/Report/tabs/AllReports'
const WhatsAppWorkspace = lazy(() => import('../../views/WhatsAppWorkspace'))
const PrimaryRoute = lazy(() => import('../../views/Primary/PrimaryRoute'))
const ViewPrimaryRoute = lazy(() => import('../../views/Primary/ViewPrimaryRoute'))
const DlrList = lazy(() => import('../../views/DLR/DlrList'))
const SecondaryList = lazy(() => import('../../views/Secondary/SecondaryList'))
const AppSetting = lazy(() => import('../../views/AppSetting/AppSetting'))
const Template = lazy(() => import('../../views/notificationTemp/TemplateList'))
const UserList = lazy(() => import('../../views/UserManagement/index'))
const UserLoginList = lazy(() => import('../../views/UserManagement/LoginLog'))
// const SmsList = lazy(() => import('../../views/sms/index'))
const SMSListing = lazy(() => import('../../views/sms/SMSListing'))
const DltTemplate = lazy(() => import('../../views/dltTemplate/index'))
const SenderList = lazy(() => import('../../views/Sender ID/index'))
const PhoneBookList = lazy(() => import('../../views/PhoneBook/PhoneBookList'))
const BlackList = lazy(() => import('../../views/PhoneBook/BlackList'))
const CreditRequest = lazy(() => import('../../views/CreditRequest/RequestList'))
const AllCampaign = lazy(() => import('../../views/compaign/CompaignList'))
const Delivery = lazy(() => import('../../views/Report/ReportList'))
const Schedule = lazy(() => import('../../views/Report/ScheduleReport'))
const MessageConsumption = lazy(() => import('../../views/Report/MessageConsumption'))
const MobileReport = lazy(() => import('../../views/Report/ReportByMobileNumber'))
const InvalidNumber = lazy(() => import('../../views/InvalidSeries/ListInvalidSeries'))
const UserRoute = lazy(() => import('../../views/AdminOperation/GetUserRoute'))
const Overview = lazy(() => import('../../views/AdminOperation/Overview'))
const Server = lazy(() => import('../../views/AdminOperation/ServerInfo'))
const Notification = lazy(() => import('../../views/notifications/NotificationList'))
const RoleList = lazy(() => import('../../views/role/RoleList'))
const ManageCampaign = lazy(() => import('../../views/AdminOperation/ManageCampaign'))
const CampaignReport = lazy(() => import('../../views/Report/CampaignReport'))
const ApiList = lazy(() => import('../../views/ApiDocument/ApiList'))
const EditProfile = lazy(() => import('../../views/AppSetting/tab/Profile'))
const TwoWay = lazy(() => import('../../views/sms/SendTwoSMS'))
const GenerateShortLink = lazy(() => import('../../views/sms/tab/GenerateShortLink'))
const TwoWayList = lazy(() => import('../../views/sms/tab/TwoWaySMSList'))
const AddWay = lazy(() => import('../../views/sms/tab/AddTwoWaySMS'))
const ResponsePage = lazy(() => import('../../views/sms/ResponseMessage'))
const Chat = lazy(() => import('../../views/Chat/index'))
const ReportByTime = lazy(() => import('../../views/Report/ReportByTime'))
const UserWiseCreditReport = lazy(() => import('../../views/AdminOperation/UserWiseCreditReport'))
const DailyReport = lazy(() => import('../../views/AdminOperation/DailyReport'))
const ConsumptionReportView = lazy(() => import('../../views/AdminOperation/ConsumptionReportView'))
const SendWhatsapp = lazy(() => import('../../views/whatsapp/Broadcasts'))
const WhatsappTemplate = lazy(() => import('../../views/whatsapp/MessageTemplate'))
const WhatsappConfig = lazy(() => import('../../views/whatsapp/Connections'))
const WhatsappReport = lazy(() => import('../../views/whatsapp/MessageReport'))
const WhatsappCustomTemplate = lazy(() => import('../../views/whatsapp/CustomTemplate'))
const ListAllApi = lazy(() => import('../../views/AdminOperation/APIs/index'))
const ShowCommands = lazy(() => import('../../views/Dashboards/ServerCommands'))
const VoiceUpload = lazy(() => import('../../views/voiceMessage/voice-upload/index'))
const VoiceSms = lazy(() => import('../../views/voiceMessage/voice-sms/index'))
const VoiceReport = lazy(() => import('../../views/voiceMessage/voice-report/VoiceSmsCampaignLists'))
const AllVoiceStatus = lazy(() => import('../../views/voiceMessage/voice-upload/GetAllVoice'))
const TemplateGroupList = lazy(() => import('../../views/dltTemplate/TemplateGroup/TemplateGroupList'))
const ReportTemplateGroupList = lazy(() => import('../../views/Report/ReportByTemplate'))
const KannelStatus = lazy(() => import('../../views/AdminOperation/KannelStatus'))
const WhatsappMedia = lazy(() => import('../../views/whatsapp/WhatsappMedia'))
const UserWise = lazy(() => import('../../views/AdminOperation/UserReport/MonthlyReportByUser'))
const MonthlyReport = lazy(() => import('../../views/Report/MonthlyReport'))
const CountryList = lazy(() => import('../../views/Country/CountryList'))
const WhatsappRateCard = lazy(() => import('../../views/whatsapp/WhatsappRateCard'))
const WAChat = lazy(() => import('../../views/whatsappChat/ChatLayout'))
const WhatsappAnalytics = lazy(() => import('../../views/whatsapp/WhatsappAnalytics'))
const WhatsappConversationAnalytics = lazy(() => import('../../views/whatsapp/WhatsappConversationAnalytics'))
const WhatsappTemplateAnalyticsReport = lazy(() => import('../../views/whatsapp/WhatsappTemplateAnalytics'))
const WhatsQr = lazy(() => import('../../views/whatsapp/WhatsappQRList'))
const WhatsappSummaryReportPage = lazy(() => import('../../views/whatsapp/WhatsappSummaryReportPage'))
const DetailedReportPage = lazy(() => import('../../views/Report/DetailedReport'))
const ExportAllReport = lazy(() => import('../../views/Report/ExportAllReport'))
const WhatsappChatbotsSelfWebhook = lazy(() => import('../../views/whatsapp/WhatsappChatbotsSelfWebhook'))

const userData = JSON.parse(localStorage.getItem('nrtData'))


const TeamInvitations = lazy(() => import('../../views/TeamInvitations'))
const WebhookEvents = lazy(() => import('../../views/whatsapp/WebhookEvents'))
const WorkflowBuilder = lazy(() => import('../../views/whatsapp/WorkflowBuilder'))
const WhatsappConnections = lazy(() => import('../../views/whatsapp/Connections'))
const NrtRoutes = [
    { path: '/whatsapp-workflows', element: <WorkflowBuilder />, meta: { ...Permissions.whatsappSmsList } },
    { path: '/whatsapp-broadcasts', element: <SendWhatsapp />, meta: { ...Permissions.whatsappSmsList } },
    { path: '/whatsapp-connections', element: <WhatsappConnections />, meta: { ...Permissions.whatsappConfigList } },
    { path: '/whatsapp-webhook-events', element: <WebhookEvents />, meta: { ...Permissions.whatsappConfigList } },
    { path: '/team-invitations', element: <TeamInvitations />, meta: { ...Permissions.userList } },
    { path: '/accept-invitation', element: <TeamInvitations acceptance />, meta: { layout: 'blank', publicRoute: true } },
    { path: '/whatsapp-catalog', element: <WhatsAppWorkspace initialTab='Catalog' />, meta: { ...Permissions.whatsappSmsList } },
    { path: '/whatsapp-orders', element: <WhatsAppWorkspace initialTab='Orders' />, meta: { ...Permissions.whatsappSmsList } },
    { path: '/whatsapp-automation', element: <WhatsAppWorkspace initialTab='Automation' />, meta: { ...Permissions.whatsappSmsList } },
    {
        path: '/whatsapp-workspace',
        element: <WhatsAppWorkspace />,
        meta: { ...Permissions.whatsappSmsList }
    },
    // {
    //     path: '/dashboard',
    //     element: <Dashboard />,
    //     meta: {
    //         ...Permissions.dashboardView
    //     }

    // },
    {
        path: '/primary-routes',
        // name: "primaryRoutes",
        element: <PrimaryRoute />,
        meta: {
            ...Permissions.primaryList
        }

    },
    // {
    //     path: '/primary-routes/view/:id',
    //     element: <ViewPrimaryRoute />,
    //     name: "privateRoutes",
    //     meta: {
    //         ...Permissions.privateView
    //     }
    // },

    ///////////////////////////////////   DLR   CODE /////////////////////////////
    {
        path: '/dlr-list',
        element: <DlrList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.dlrList
        }
    },

    ///////////////////////////////////  Secondary List ///////////////////////////
    {
        path: '/secondary-routes',
        element: <SecondaryList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.secondaryView
        }
    },

    /////////////////////////////////// App settings  ///////////////////////////////
    {
        path: '/app-settings',
        element: <AppSetting />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.editProfile
        }
    },
    {
        path: '/documents',
        element: <ApiList />,
        // name: "privateRoutes",
        // meta: {
        //     ...Permissions.dashboardView
        // }
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: false
        }
    },
    {
        path: '/edit-profile',
        element: <EditProfile />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.editProfile
        }
    },

    ///////////////////////////////////// Notification Template ///////////////////////////////
    {
        path: '/notification-template',
        element: <Template />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.assignRouteUser
        }
    },

    ///////////////////////////////////// Role List ///////////////////////////////////////
    {
        path: '/role-list',
        element: <RoleList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.roleList
        }
    },

    /////////////////////////////////////// Users   ////////////////////////////////////
    {
        path: '/users-list',
        element: <UserList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.userList
        }
    },
    {
        path: '/login-user-log',
        element: <UserLoginList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.viewLoginLog
        }
    },

    ////////////////////////////////////////   Send SMS   //////////////////////////////////////
    // {
    //     path: '/admin-send-sms',
    //     element: <SmsList />,
    //     // name: "privateRoutes",
    //     meta: {
    //         ...Permissions.smsList
    //     }
    // },
    {
        path: '/admin-send-sms',
        element: <SMSListing />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.smsList
        }
    },
    {
        path: '/admin-send-two-ways-sms',
        element: <TwoWay />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.twoWay
        }
    },
    {
        path: '/add-short-link-generate',
        element: <GenerateShortLink />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.twoWay
        }
    },
    {
        path: '/two-ways-sms',
        element: <TwoWayList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.twoWay
        }
    },
    {
        path: '/add-two-ways-sms',
        element: <AddWay />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.twoWay
        }
    },
    {
        path: '/add-two-ways-sms/:id',
        name: 'add.two.way',
        element: <AddWay />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.twoWay
        }
    },

    ////////////////////////////////////////   DLT Template  ///////////////////////////////////
    {
        path: '/dlt-template-list',
        element: <DltTemplate />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.dltList
        }
    },

    {
        path: '/template-group-list',
        element: <TemplateGroupList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.dltIsVisible
        }
    },

    /////////////////////////////////////////   Sender ID   ////////////////////////////////////
    {
        path: '/senderid-list',
        element: <SenderList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.senderList
        }
    },
    {
        path: '/2w/:sub_part/:token/:mobile_num',
        element: <ResponsePage />,
        // name: "privateRoutes",
        meta: {
            layout: 'blank',
            publicRoute: true,
            restricted: true
        }
    },

    //////////////////////////////////////// PhoneBook    ///////////////////////////////////////
    {
        path: '/group',
        element: <PhoneBookList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.phoneList
        }
    },

    ////////////////////////////////////////  Blacklist   ///////////////////////////////////////
    {
        path: '/blacklist',
        element: <BlackList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.blacklist
        }
    },

    ///////////////////////////////////////// Credit Request //////////////////////////////

    {
        path: '/credit-request',
        element: <CreditRequest />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.creditRequest
        }
    },

    //////////////////////////////////////// Campaign ////////////////////////////////////
    {
        path: '/all-campaign',
        element: <AllCampaign />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.smsList
        }
    },
    //////////////////////////////////////// Chat ////////////////////////////////////
    {
        path: '/chat',
        element: <Chat />,
        // name: "privateRoutes",
        meta: {
            appLayout: true,
            className: 'chat-application',
            ...Permissions.userDdlList
        }
    },

    //////////////////////////////////////  report   ///////////////////////////////////////
    {
        path: '/campaign-report',
        element: <CampaignReport />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.smsList
        }
    },
    {
        path: '/delivery-report',
        element: <AllReports />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.reportAll
        }

    },
    {
        path: '/download-report',
        element: <ExportAllReport />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.reportAll
        }

    },

    ...(userData?.allow_detail_report === 1 ? [
        {
            path: '/detailed-report',
            element: <DetailedReportPage />,
            // name: "privateRoutes",
            meta: {
                // ...Permissions.reportAll
                ...Permissions.reportAll
            }
        }
    ] : []),
    {
        path: '/summary-report-by-template-group',
        element: <ReportTemplateGroupList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.dltIsVisible
        }
    },
    {
        path: '/scheduled-campaign-report',
        element: <Schedule />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.reportAll
        }
    },
    {
        path: '/message-consumption-report',
        element: <MessageConsumption />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.reportAll
        }
    },
    {
        path: '/report-by-mobile-number',
        element: <MobileReport />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.reportAll
        }
    },
    {
        path: '/report-by-30-sec',
        element: <ReportByTime />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },

    ///////////////////////////////// Invalid number   ///////////////////////////
    {
        path: '/invalid-number',
        element: <InvalidNumber />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.invalidSeriesPermission
        }
    },

    ////////////////////////////////////  Admin Operation //////////////////////////
    {
        path: '/get-user-route',
        element: <UserRoute />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },
    {
        path: '/overview',
        element: <Overview />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },
    {
        path: '/server-info',
        element: <Server />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },
    {
        path: '/admin-manage-campaign',
        element: <ManageCampaign />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },
    {
        path: '/get-current-kennel-status',
        element: <KannelStatus />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.currentKannelStatus
        }
    },
    {
        path: '/user-credit-report',
        element: <UserWiseCreditReport />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },
    {
        path: '/get-daily-report',
        element: <DailyReport />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },
    {
        path: '/consumption-report-by-view',
        element: <ConsumptionReportView />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },

    {
        path: '/api-documentation',
        element: <ListAllApi />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },


    //////////////////////////////////  Notification  ///////////////////////////
    {
        path: '/notification',
        element: <Notification />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.creditRequest
        }
    },

    /////////////////////////////////  Whatsapp  ////////////////////////////////
    {
        path: '/send-whatsapp',
        element: <SendWhatsapp />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.whatsappSmsList
        }
    },
    {
        path: '/whatsapp-message-template',
        element: <WhatsappTemplate />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.whatsappTemplateList
        }
    },
    {
        path: '/whatsapp-message-configuration',
        element: <WhatsappConfig />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.whatsappConfigList
        }
    },
    {
        path: '/whatsapp-message-report',
        element: <WhatsappReport />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.whatsappSmsList
        }
    },
    {
        path: '/whatsapp-summary-report',
        element: <WhatsappSummaryReportPage />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.whatsappSmsList
        }
    },
    {
        path: '/custom-template',
        element: <WhatsappCustomTemplate />,
        // name: "customTemplate",
        meta: {
            ...Permissions.whatsappTemplateCreate
        }
    },
    {
        path: '/whatsapp-media',
        element: <WhatsappMedia />,
        // name: "customTemplate",
        meta: {
            ...Permissions.whatsappTemplateList
        }
    },
    {
        path: '/wa-get-analytics-report',
        element: <WhatsappAnalytics />,
        // name: "customTemplate",
        meta: {
            ...Permissions.whatsappGetAnalyticsReport
        }
    },
    {
        path: '/wa-get-conversation-report',
        element: <WhatsappConversationAnalytics />,
        // name: "customTemplate",
        meta: {
            ...Permissions.whatsappGetConversationAnalyticsReport
        }
    },
    {
        path: '/wa-get-template-report',
        element: <WhatsappTemplateAnalyticsReport />,
        // name: "customTemplate",
        meta: {
            ...Permissions.whatsappGetTemplateAnalyticsReport
        }
    },
    {
        path: '/wa-get-qr-list',
        element: <WhatsQr />,
        // name: "customTemplate",
        meta: {
            ...Permissions.whatsappListQRReport
        }
    },
    {
        path: '/wa-chatbots-self-webhook',
        element: <WhatsappChatbotsSelfWebhook />,
        meta: {
            ...Permissions.whatsappSmsList // Using whatsappSmsList permission as default for now
        }
    },

    ////////////////////////////////////   Server Commands   ///////////////////////////////

    {
        path: '/server-commands',
        element: <ShowCommands />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },
    ///////voice sms////////////////////////////////////

    {
        path: '/voice-upload',
        element: <VoiceUpload />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.voiceFileList
        }
    },
    {
        path: '/admin-all-voice-status',
        element: <AllVoiceStatus />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.voiceFileList
        }
    },
    {
        path: '/voice-sms',
        element: <VoiceSms />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.voiceSMS
        }
    },
    {
        path: '/voice-report',
        element: <VoiceReport />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.voiceSMS
        }
    },
    {
        path: '/user-monthly-report',
        element: <UserWise />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },

    {
        path: '/month-wise-report',
        element: <MonthlyReport />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.dltIsVisible
        }
    },
    {
        path: '/administration/country',
        element: <CountryList />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },
    {
        path: 'administration/wa-rate-card',
        element: <WhatsappRateCard />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    },
    {
        path: 'wa-chat',
        element: <WAChat />,
        // name: "privateRoutes",
        meta: {
            ...Permissions.adminOperation
        }
    }


]

export default NrtRoutes
