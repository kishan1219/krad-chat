// ** Reducers Imports
import navbar from './navbar'
import layout from './layout'
import auth from './authentication'
import todo from '@src/views/examples/apps/todo/store'
import chat from '../views/Chat/store'
import users from '@src/views/examples/apps/user/store'
import email from '@src/views/examples/apps/email/store'
import kanban from '@src/views/examples/apps/kanban/store'
import invoice from '@src/views/examples/apps/invoice/store'
import calendar from '@src/views/examples/apps/calendar/store'
import ecommerce from '@src/views/examples/apps/ecommerce/store'
import dataTables from '@src/views/examples/tables/data-tables/store'
import permissions from '@src/views/examples/apps/roles-permissions/store'
import primary from './reducers/primaryRoute/index'
import dlr from './reducers/dlr'
import apps from './reducers/appSettingsRedux/index'
import secondary from './reducers/secondaryRoute/index'
import user from './reducers/userManagement/index'
import fileUpload from './reducers/uploadFile/index'
import ip from './reducers/ip'
import userCredit from './reducers/userCredit/index'
import smsList from './reducers/sms/index'
import dltList from './reducers/dlt/index'
import managerSender from './reducers/manageSender/index'
import blacklist from './reducers/blacklist/index'
import contactNumber from './reducers/contactNumber/index'
import contactGroup from './reducers/contactGroup/index'
import creditRequest from './reducers/creditRequest/index'
import campaign from './reducers/campaignList/index'
import dashboard from './reducers/dashboard/index'
import report from './reducers/report/index'
import invalid from './reducers/invalid/index'
import adminOps from './reducers/adminOps/index'
import notificationTemp from './reducers/notificationTemp'
import notification from './reducers/notification/index'
import role from './reducers/role/index'
import shortLink from './reducers/shortLink/index'
import twoWay from './reducers/TwoWay/index'
import whatsappConfig from './reducers/whatsappConfig'
import whatsappTemplate from './reducers/whatsappTemplate'
import apiList from './reducers/apis/index'
import voiceUpload from './reducers/voiceUpload'
import voiceSMS from './reducers/voiceSMS'
import group from './reducers/templateGroup/index'
import whatsappMessageSend from './reducers/whatsappMessageSend/index'
import whatsappReport from './reducers/whatsappReport/index'
import whatsappMedia from './reducers/whatsappMedia'
import userWiseReport from './reducers/userWiseReport'
import country from './reducers/country/index'
import whatsappThread from './reducers/whatsappThread/index'
import loadUserClick from './reducers/loadUserClick'
import whatsappQr from './reducers/whatsappQrRedux'
const rootReducer = {
    chat,
    auth,
    primary,
    dlr,
    apps,
    secondary,
    user,
    fileUpload,
    ip,
    userCredit,
    smsList,
    shortLink,
    dltList,
    twoWay,
    dashboard,
    managerSender,
    contactNumber,
    blacklist,
    notificationTemp,
    contactGroup,
    creditRequest,
    report,
    invalid,
    notification,
    adminOps,
    voiceUpload,
    voiceSMS,
    role,
    campaign,
    whatsappConfig,
    whatsappTemplate,
    apiList,
    group,
    whatsappMessageSend,
    whatsappReport,
    whatsappMedia,
    userWiseReport,
    country,
    whatsappThread,
    loadUserClick,
    whatsappQr,
    todo,
    email,
    users,
    kanban,
    navbar,
    layout,
    invoice,
    calendar,
    ecommerce,
    dataTables,
    permissions
}

export default rootReducer
