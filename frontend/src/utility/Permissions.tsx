/* Action = Permission, Resource = Group-Group */
export const Permissions = Object.freeze({
    // Dashboard
    dashboardView: {
        action: "dashboard-view",
        resource: "all"
    },
    viewLoginLog: {
        action: "view-login-log",
        resource: "all"
    },
    settingView: {
        action: "setting-view",
        resource: "all"
    },
    primaryList: {
        action: "primary-route-list",
        resource: "all"
    },
    primaryView: {
        action: "primary-route-view",
        resource: "all"
    },
    primaryCreate: {
        action: "primary-route-create",
        resource: "all"
    },
    primaryEdit: {
        action: "primary-route-edit",
        resource: "all"
    },
    primaryDelete: {
        action: "primary-route-delete",
        resource: "all"
    },
    checkPrimaryRouteConnection: {
        action: "check-primary-route-connection",
        resource: "all"
    },
    secondaryView: {
        action: "secondary-route-list",
        resource: "all"
    },

    ///////////////////////////////  DLR     ////////////////////////////////


    dlrList: {
        action: "dlrcode-list",
        resource: "all"
    },
    dlrDelete: {
        action: "dlrcode-delete",
        resource: "all"
    },
    dlrEdit: {
        action: "dlrcode-edit",
        resource: "all"
    },
    dlrCreate: {
        action: "dlrcode-create",
        resource: "all"
    },
    dlrView: {
        action: "dlrcode-view",
        resource: "all"
    },
    dlrAction: {
        action: "dlrcode-action",
        resource: "all"
    },


    ///////////////////////////  role list /////////////////

    roleList: {
        action: "role-list",
        resource: "all"
    },
    /////////////////////////// App setting////////////////////////
    appSettingView: {
        action: "app-setting",
        resource: "all"
    },
    assignRouteUser: {
        action: "assign-route-to-user",
        resource: "all"
    },

    ////////////////////////////////  User ////////////////////////////////
    userList: {
        action: "users-list",
        resource: "all"
    },
    userDdlList: {
        action: "user-ddl-list",
        resource: "all"
    },
    userAccessDocument: {
        action: "user-access-document",
        resource: "all"
    },
    userUploadDocument: {
        action: "upload-documents",
        resource: "all"
    },
    userAccountLog: {
        action: "user-account-log",
        resource: "all"
    },
    userCreditReserve: {
        action: "user-credit-reverse",
        resource: "all"
    },
    userCreditAdd: {
        action: "user-credit-add",
        resource: "all"
    },
    userRouteSetting: {
        action: "user-route-setting",
        resource: "all"
    },
    userApiKey: {
        action: "user-change-api-key",
        resource: "all"
    },
    userChangePassword: {
        action: "user-change-password",
        resource: "all"
    },
    userAction: {
        action: "user-action",
        resource: "all"
    },
    userDelete: {
        action: "user-delete",
        resource: "all"
    },
    userEdit: {
        action: "user-edit",
        resource: "all"
    },
    userCreate: {
        action: "user-create",
        resource: "all"
    },
    userView: {
        action: "user-view",
        resource: "all"
    },
    userRatioSet: {
        action: "set-user-ratio",
        resource: "all"
    },


    ////////////////////////////  Edit Profile /////////////////////////////
    editProfile: {
        action: "edit-profile",
        resource: "all"
    },
    smsList: {
        action: "send-sms",
        resource: "all"
    },
    twoWay: {
        action: "two-ways-sms",
        resource: "all"
    },
    dltList: {
        action: "dlt-template-list",
        resource: "all"
    },
    dltIsVisible: {
        action: "is-visible-dlt-template-group",
        resource: "all"
    },
    dltView: {
        action: "dlt-template-view",
        resource: "all"
    },
    dltCreate: {
        action: "dlt-template-create",
        resource: "all"
    },

    dltEdit: {
        action: "dlt-template-edit",
        resource: "all"
    },

    dltDelete: {
        action: "dlt-template-delete",
        resource: "all"
    },
    dltAction: {
        action: "dlt-template-action",
        resource: "all"
    },
    senderList: {
        action: "sender-id-list",
        resource: "all"
    },
    senderView: {
        action: "sender-id-view",
        resource: "all"
    },
    senderCreate: {
        action: "sender-id-create",
        resource: "all"
    },
    senderEdit: {
        action: "sender-id-edit",
        resource: "all"
    },
    senderDelete: {
        action: "sender-id-delete",
        resource: "all"
    },
    senderAction: {
        action: "sender-id-action",
        resource: "all"
    },

    ////////////////// Phone book /////////////////
    phoneList: {
        action: "phone-book-list",
        resource: "all"
    },
    phoneDelete: {
        action: "phone-book-delete",
        resource: "all"
    },
    phoneEdit: {
        action: "phone-book-edit",
        resource: "all"
    },
    phoneView: {
        action: "phone-book-view",
        resource: "all"
    },
    phoneCreate: {
        action: "phone-book-create",
        resource: "all"
    },

    /////////////// BlackList  ///////////////////

    blacklist: {
        action: "blacklist",
        resource: "all"
    },

    //////////////////// credit Request  ///////////////////
    creditRequest: {
        action: "credit-request",
        resource: "all"
    },

    //////////////////// Report //////////////////////////////
    reportAll: {
        action: "reports",
        resource: "all"
    },
    detailedReport: {
        action: "detailed-report",
        resource: "all"
    },

    ///////////////////// Invalid Series /////////////
    invalidSeriesPermission: {
        action: "invalid-series",
        resource: "all"
    },

    // Admin Operation
    adminOperation: {
        action: "admin-operation",
        resource: "all"
    },
    currentKannelStatus: {
        action: "kannel-status-page",
        resource: "all"
    },
    manageCampaignStatus: {
        action: "admin-manage-campaign-status",
        resource: "all"
    },

    /////////////////////////// update pending status /////////////////
    updatePendingStatus: {
        action: "update-pending-status",
        resource: "all"
    },
    //VOICE SMS permission
    voiceSMS: {
        action: "voice-sms",
        resource: "all"
    },
    voiceFileProcess: {
        action: "voice-file-process",
        resource: "all"
    },
    bulkVoiceFileAction: {
        action: "bulk-voice-file-action",
        resource: "all"
    },

    syncVoiceTemplateToVendor: {
        action: "sync-voice-template-to-vendor",
        resource: "all"
    },

    //voice upload
    voiceFileList: {
        action: "voice-file-list",
        resource: "all"
    },
    voiceUploadCreate: {
        action: "voice-upload-create",
        resource: "all"
    },
    voiceUploadView: {
        action: "voice-upload-view",
        resource: "all"
    },
    voiceUploadDelete: {
        action: "voice-upload-delete",
        resource: "all"
    },

    ///////////////////////////////////// Whatsapp SMS List ////////////////////////////
    whatsappSmsList: {
        action: "whatsapp-sms",
        resource: "all"
    },
    whatsappFileUpload: {
        action: "whatsapp-file-upload",
        resource: "all"
    },
   ///////////////////////////////////// Whatsapp Configuration //////////////////////////// 

    whatsappConfigList : {
        action: "whatsapp-configurations",
        resource: "all"
    },
    whatsappConfigDelete: {
        action: "whatsapp-configuration-delete",
        resource: "all"
    },
    whatsappConfigEdit: {
        action: "whatsapp-configuration-edit",
        resource: "all"
    },
    whatsappConfigView: {
        action: "whatsapp-configuration-view",
        resource: "all"
    },
    whatsappDebugButton: {
        action: "wa-debug-token",
        resource: "all"
    },
    whatsappSubscribeApps: {
        action: "wa-subscribed-apps",
        resource: "all"
    },
    whatsappConfigCreate: {
        action: "whatsapp-configuration-create",
        resource: "all"
    },

    ///////////////////////////////////// Whatsapp Template //////////////////////////// 

    whatsappTemplateList: {
        action: "whatsapp-template-list",
        resource: "all"
    },
    whatsappTemplateDelete: {
        action: "whatsapp-template-delete",
        resource: "all"
    },
    whatsappTemplateEdit: {
        action: "whatsapp-template-edit",
        resource: "all"
    },
    whatsappTemplateView: {
        action: "whatsapp-template-view",
        resource: "all"
    },
    whatsappTemplateCreate: {
        action: "whatsapp-template-create",
        resource: "all"
    },
    whatsappGetAnalyticsReport: {
        action: "whatsapp-get-analytics",
        resource: "all"
    },
    whatsappGetConversationAnalyticsReport: {
        action: "whatsapp-get-conversation-analytics",
        resource: "all"
    },
    whatsappGetTemplateAnalyticsReport: {
        action: "whatsapp-get-template-analytics",
        resource: "all"
    },
    whatsappListQRReport: {
        action: "whatsapp-qrcode-list",
        resource: "all"
    },
    whatsappCreateQRReport: {
        action: "whatsapp-qrcode-create",
        resource: "all"
    },
    whatsappDeleteQRReport: {
        action: "whatsapp-qrcode-delete",
        resource: "all"
    },

    ////////////////// Whatsapp charges///////////////////////////////////
    whatsappChargesList: {
        action: "whatsapp-sms-charge",
        resource: "all"
    },
    whatsappChargesCreate: {
        action: "whatsapp-sms-charge-create",
        resource: "all"
    }

})
