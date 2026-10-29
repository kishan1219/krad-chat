// @ts-nocheck
export default {
    login: "login",
    logout: "logout",
    signup: "sign-up",
    forgotPassword: "forgot-password",
    resetPassword: "update-password",
    verify_otp: "verify-otp",
    resend_otp: "resent-otp",

    ////////////////////////// Primary Routes////////////////////////////
    primary_route: "administration/primary-routes",
    add_primary_route: "administration/primary-route",
    edit_primary_route: "administration/primary-route/",
    delete_primary_route: "administration/primary-route/",
    read_primary_route: "administration/primary-route/",
    check_primary_route: "administration/check-primary-route-connection/",
    primary_route_action: "administration/primary-route-action",
    getVoiceSmsc: 'get-voice-smsc-id',
    getVoiceSmsc: 'get-voice-smsc-id',
    checkBalanceOfVoice: 'administration/check-voice-balance/',

    ///////////////////////////  Dlr Code ////////////////////////////////
    dlr_list: "administration/dlrcode-list",
    dlr_action: "administration/dlrcode-action",
    dlr_import: "administration/dlrcode-vender-import",
    read_dlr: "administration/dlrcode/",
    delete_dlr: "administration/dlrcode/",
    add_dlr: "administration/dlrcode",
    edit_dlr: "administration/dlrcode/",
    dlr_sample_file: "vandor-dlr-sample-file",


    //////////////////////////// Secondary Routes /////////////////////////
    secondary_route_action: "administration/secondary-route-action",
    delete_secondary_route: "administration/secondary-route/",
    edit_secondary_route: "administration/secondary-route/",
    add_secondary_route: "administration/secondary-route",
    secondary_route: "administration/secondary-routes",

    //////////////////////////// App Settings //////////////////////
    profile_change_password: "change-password",
    app_setting_admin: "get-app-setting",
    app_setting_client: "get-app-setting",
    app_setting_update: "administration/app-setting-update",
    edit_profile: "update-profile",
    update_self_password: "update-self-password",
    upload_document: "user-document",
    get_user_document: "user-documents",
    delete_document: "user-document/",
    child_login: "child-login",
    get_api_docs: "document-code-lang",
    user_wise_report: "administration/user-wise-monthly-reports",
    create_user_report: "administration/user-wise-monthly-report",
    update_user_report: "administration/user-wise-monthly-report/",

    ////////////////////////////  User //////////////////////////////
    load_user: "users",
    add_user: "user",
    edit_user: "user/",
    delete_user: "user/",
    read_user: "user/",
    user_action: "user-action",
    user_change_api: "user-change-api-key",
    enable_api_security: "enable-additional-security",
    load_user_child: "users-for-ddl",
    set_user_ratio: "administration/set-user-ratio",
    login_log_view: "view-login-log",
    user_wise_credit: "administration/user-wise-credit-info",
    set_webhook_url: "add-webhook-url",
    get_webhook_events: "get-webhook-events",
    get_webhook_info: "get-webhook-info/",

    /////////////////////////////// Upload Files  /////////////////////
    uploadFiles: "file-upload",
    wa_uploadFiles: "wa-campaign-file-upload",
    reset_password_by_user: "reset-user-password",

    ////////////////////////////////      IP        ////////////////////
    load_ip: "ip-white-list-for-apis",
    add_ip: "ip-white-list-for-api",
    delete_ip: "ip-white-list-for-api/",

    //////////////////////////////////    User Credit    ////////////////////////
    add_user_credit: "user-credit",
    user_credit_list: "user-credits",

    //////////////////////////////////    SMS    //////////////////////////////////
    load_sms: "campaign-list",
    add_sms: "send-sms",
    resendMessage: "resend-this-sms",

    ////////////////////////////////////  DLT Template   ///////////////////////////

    dlt_list: "dlt-templates",
    dlt_action: "administration/dlrcode-action",
    dlt_import: "dlt-templates-import",
    read_dlt: "administration/dlrcode/",
    delete_dlt: "dlt-template/",
    add_dlt: "dlt-template",
    edit_dlt: "dlt-template/",
    assign_dlt: "dlt-templates-assign-to-users",
    dlt_priority: "administration/change-dlt-template-priority",
    dlt_sample_file: "dlt-sample-file",

    ////////////////////////////////////  Template Group   ///////////////////////////
    assign_template_group_to_user: "dlt-templates-assign-to-group",
    delete_group: "dlt-template-group/",
    edit_group: "dlt-template-group/",
    add_group: "dlt-template-group",
    load_list: "dlt-template-groups",
    get_template_group_by_id: "dlt-template-group/",

    ////////////////////////////////////////   Sender IDS   //////////////////////////////////

    load_senderIds: "manage-sender-ids",
    add_senderIds: "manage-sender-id",
    edit_senderIds: "manage-sender-id/",
    delete_senderIds: "manage-sender-id/",
    action_senderIds: "sender-id-action",
    assign_senderIds: "assign-sender-id",

    ///////////////////////////////////////// Blacklist   ////////////////////////////////////

    load_blacklist: "blacklists",
    add_blacklist: "blacklist",
    delete_blacklist: "blacklist/",
    blacklist_action: "blacklist-action",
    blacklist_import: "blacklists-import",
    blacklist_sample_file: "black-list-sample-file",
    ///////////////////////////////////////// Contact Number /////////////////////////////

    load_contact_number: "contact-numbers",
    add_contact_number: "contact-number",
    delete_contact_number: "contact-number/",
    contact_number_import: "contact-numbers-import",

    ////////////////////////////////////////  Contact Group //////////////////////////////

    load_contact_group: "contact-groups",
    read_contact_group: "contact-group/",
    delete_contact_group: "contact-group/",
    edit_contact_group: "contact-group/",
    contact_group_sample_file: "group-sample-file",

    ///////////////////////////////////////  Credit Request  //////////////////////////////
    credit_request_list: "credit-requests",
    reply_credit_request: "credit-request-reply",
    add_credit_request: "credit-request",

    //////////////////////////////////////  campaign List    //////////////////////////////////
    load_campaign: "campaign-list",
    resend: "repush-campaign",
    campaign_info: "get-campaign-info/",
    start_stop: "change-campaign-status-to-stop",
    change_campaign_to_complete: "administration/change-campaign-status-to-complete/",
    get_all_details_of_campaign: "send-sms/",
    get_campaign_status: "get-campaign-current-status/",
    restart_campaign_status: "administration/reupdate-pending-status/",
    dlr_code_explanation: "get-dlr-explanation/",

    //////////////////////////////////////// Dashboard  ///////////////////////////////////////
    dashboard_list: "dashboard",
    server_commands: 'administration/server-commands',

    //////////////////////////////////////// Report     //////////////////////////////////////
    export_by_id: "report-export-by-id",
    export_by_sender: "report-export-by-sender-id",
    export_by_mobile: "report-export-by-mobile",
    delivery_report: "delivery-report",
    schedule_report: "scheduled-campaign-report",
    message_report: "msg-consumption-report",
    report_by_mobile_number: "report-by-mobile",
    report_by_time: "get-report-by-time-frame",
    report_log_export_by_camapign: "twoway-report-log-export-by-camapign",
    report_log_export_by_camapign_response: "twoway-report-response-export-by-camapign",
    template_summary_report: "summary-report-by-template-group",
    detailed_report: "detailed-report",
    export_by_detailed_report: "export-detailed-report",
    export_by_sms_detailed_report: "export-sms-report",
    export_by_user_id: "exports",
    check_export_status: "export-status/",
    download_export_of_sms: "download-export/",
    ////////////////////////////////////////  DLT Template  /////////////////////////////////////
    delete_invalid_series: "administration/invalid-series/",
    add_invalid_series: "administration/invalid-series",
    invalid_list: "administration/invalid-series-list",
    monthly_report: "month-wise-submission-report",

    /////////////////////////////////////////  Admin Operation //////////////////////////////////////
    assign_route: "administration/assign-route-to-user",
    get_user_route: "administration/get-user-route-info",
    user_priority: "administration/change-user-priority-for-send-sms",
    manage_campaign: "administration/manage-campaign",
    get_overview: "overview-report-by-user",
    push_server: "administration/informing-user-about-server",
    get_server_details: "server-info",
    daily_report: "administration/get-daily-report",
    consumption_report_view: "consumption-report-by-view",
    get_kennel_status: "administration/get-current-kannel-status",

    //////////////////////////////////////// Notification Template  /////////////////////////////////////
    load_temp: "administration/notification-templates",
    add_temp: "administration/notification-template",
    edit_temp: "administration/notification-template/",
    delete_temp: "administration/notification-template/",

    ////////////////////////////////////// Notification ////////////////////////////////
    load_notification: "notifications",
    get_notification: "notification/",
    read_notification: "notification-read/",
    read_all_notification: "user-notification-read-all",
    user_deleted_notification: "user-notification-delete",
    unread_notification: "unread-notification-count",
    delete_notification: "notification/",
    read_notification: "administration/notification-template/",

    ///////////////////////////////////// role //////////////////////////////////////////
    read_permission: "get-permissions",
    read_all_permissions: "get-all-permissions",
    delete_role: "role/",
    edit_role: "role/",
    add_role: "role",
    role_list: "roles",
    get_role_permission: "role/",

    //////////////////////////////////// country //////////////////////////////
    get_country: "countries",
    public_app_setting: "public-app-setting",

    ////////////////////////////////////  Two Way ////////////////////////////////

    load_two_sms: "two-ways-smses",
    add_way_sms: "two-ways-sms",
    edit_two_way: "two-ways-sms/",
    delete_two_way: "two-ways-sms/",
    read_two_way: "two-ways-sms/",
    two_way_response: "two-way-capture-record-log",
    two_way_click_log: "two-way-link-click-log",

    //////////////////////////////////////// web content ///////////////////////////
    get_web_content: "get-web-content/",
    take_response: "take-response",

    ///////////////////////////////////////// whatsappConfig //////////////////////////
    WhatsappConfig_list: "wa-account-configurations",
    read_WhatsappConfig: "wa-account-configuration/",
    delete_WhatsappConfig: "wa-account-configuration/",
    edit_WhatsappConfig: "wa-account-configuration/",
    add_WhatsappConfig: "wa-account-configuration",
    addCustomTemplate: "wa-template",
    fileUploadForWhatsapp: "wa-file-upload",
    send_whatsapp_message: "wa-send-message",
    load_whatsapp_report: "wa-campaigns",
    export_wa_report: "export-wa-report",
    whatsapp_summary_report: "get-wa-summery",
    get_whatsapp_report: "wa-send-message/",
    whatsapp_campaign_info: "wa-get-campaign-info/",
    wa_account_quality_check: "wa-account-quality-check/",
    wa_phone_number_request: "wa-phone-number-request-to-verify/",
    wa_phone_number_verified: "wa-phone-number-verify/",
    whatsapp_analytics: "get-analytics",
    whatsapp_conversation_analytics: "get-conversation-analytics",
    whatsapp_template_analytics: "get-template-analytics",
    get_Wa_campaign_status: 'wa-get-campaign-current-status/',
    wa_phone_number_register: 'wa-phone-number-register/',
    wa_subscribe_apps: 'wa-subscribed-apps/',
    wa_debug_token: "wa-debug-token/",
    wa_ecommerce_setting: "wa-set-commerce-settings/",
    get_all_timezones: "get-all-timezones",
    wa_calling: "wa-calling-setting-change/",
    get_whatsapp_call_setting: "wa-calling-setting-get/",
    export_wa_report_download: "get-wa-summery-download",
    whatsapp_chatbots_self_webhook: "wa-chatbots-self-webhook",
    wa_marketing_lite_api_status: "wa-marketing-lite-api-status/",
    onboard_partners_to_mm_lite: "onboard-partners-to-mm-lite/",


    ///////////////////////////////////////// whatsappTemplate //////////////////////////
    WhatsappTemplate_list: "wa-templates",
    add_WhatsappTemplate: "wa-template",
    edit_WhatsappTemplate: "wa-template/",
    delete_WhatsappTemplate: "wa-template/",
    read_WhatsappTemplate: "wa-template/",
    get_whatsapp_language: "wa-template-languages",
    wa_pull_template: "wa-pull-template",
    wa_pull_template_all: "wa-pull-all-template",
    wa_sample_file: "download-wa-sample-file/",
    wa_generate_payload: "wa-generate-payload/",
    wa_conversation_export: "export-wa-conversation",


    /////////////////////////////////////////  Whatsapp QR ///////////////////////////////////
    WhatsappQR_list: "wa-qrcodes",
    add_WhatsappQr: "wa-qrcode",
    sync_WhatsappQr: "wa-qrcodes-sync",
    delete_WhatsQr: "wa-qrcode/",

    ////////////////////////////////////////// APIS ////////////////////////////////////////

    api_list: 'administration/documents',
    add_api: 'administration/document',
    edit_api: 'administration/document/',
    delete_Api: 'administration/document/',
    read_Api: 'administration/document/',

    //////////////////////////////////////   sample file   ///////////////////////////////
    custom_sms_sample: 'custom-sms-campaign-file',
    normal_sms_sample: 'normal-sms-campaign-file',

    //upload voice
    voice_file_list: "voice-file-list",
    voice_upload: "voice-upload",
    get_uploaded_voice: "voice-upload/",
    delete_uploaded_voice: "voice-upload/",

    //voice sms
    voice_campaign_list: "voice-campaign-list",
    get_voice_campaign: "voice-sms/",
    get_voice_campaign_info: "get-voice-campaign-info/",
    voice_sms: "voice-sms",
    change_voice_campaign_status_to_stop: "change-voice-campaign-status-to-stop",
    resend_this_voice_sms: "resend-this-voice-sms",
    get_voice_campaign_current_status: "get-voice-campaign-current-status/",

    //voice process
    voice_file_process: "administration/voice-file-process",
    check_voice_file_status: "administration/check-voice-file-status/",
    load_all_voice_file: "administration/get-all-voice-file-by-status",
    bulk_voice_file_action: "administration/bulk-voice-file-action",
    manage_voice_campaign: "administration/manage-voice-campaign",
    exportVoiceCampaignById: "report-export-by-voice-sms-id ",
    sync_voice_template_to_vendor: "administration/sync-voice-template-to-vendor",

    // whatsapp media
    add_WhatsappMedia: "wa-file",
    delete_WhatsappMedia: "wa-file/",
    read_WhatsappMedia: "wa-file/",
    WhatsappMedia_list: "wa-files",
    upload_template_media: 'upload-wa-file',


    // whatsapp charges
    load_whatsapp_charges: "wa-charges",
    add_whatsapp_charges: "set-wa-charge",
    whatsapp_rate_card: "administration/wa-rate-card",

    // country crud
    country_list: "administration/all-countries",
    country_add: "administration/country",
    edit_country: "administration/country/",
    delete_country: "administration/country/",
    read_country: "administration/country/",

    //// whatsapp thread
    wa_thread_message: "wa-reply-thread-users",
    wa_thread_message_case_wise: "wa-reply-threads-case-wise",
    wa_download_file: "wa-download-reply-file",
    wa_send_message: "wa-send-reply-message",

    // busines category
    wa_business_category: "wa-business-category",
    wa_flow_signup: "wa-flow-signup"

}
