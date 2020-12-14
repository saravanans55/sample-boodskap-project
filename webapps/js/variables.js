//Server render variables
var BASE_PATH = $("#BASE_PATH").val();
var BASE_URL = $("#BASE_URL").val();

var SESSION_OBJ = JSON.parse($("#SESSION_OBJ").val());
$("#SESSION_OBJ").val("")
var MQTT_CONFIG = JSON.parse($("#MQTT_OBJ").val());
$("#MQTT_OBJ").val("")
var MQTT_CLIENT_ID = 'WEB';
var API_URL = $("#API_URL").val();
var API_TOKEN = SESSION_OBJ.token;
var DOMAIN_KEY = SESSION_OBJ.domainKey;
var API_KEY = SESSION_OBJ.apiKey;
var SESSION_USER = SESSION_OBJ.session_user;
var USER_INFO = {};
var API_BASE_PATH="https://dev.boodskap.io/api"

var STORAGE_TTL = 24; //hours
var DEFAULT_USR_IMG = 'images/user_bg.svg';

var DATE_TIME_FORMAT = 'MM/DD/YYYY hh:mm:ss a';

var DATE_TIME_FORMAT_LIST = {
    1: 'MM/DD/YYYY hh:mm:ss a',
    2: 'DD/MM/YYYY hh:mm:ss a',
    3: 'DD/MMM/YYYY hh:mm:ss a',
    4: 'MM/DD/YYYY HH:mm:ss',
    5: 'DD/MM/YYYY HH:mm:ss',
}

var NO_TEXT = 'Not Available';

var CALL_STATUS = {
    CALL_IN_PROGRESS : 'warning',
    COMPLETED : 'info',
    ACTIVE : 'success',
    IN_ACTIVE : 'danger'
};

var CALL_STATUS_TEXT = {
    CALL_IN_PROGRESS : 'Call In Progress',
    COMPLETED : 'Completed',
    ACTIVE : 'Ready to take call',
    IN_ACTIVE : 'Not Available',
};

var STATUS = {
    ONLINE: 'success',
    OFFLINE : 'danger',
    BUSY : 'info',
    AWAY : 'warning'
};

var STATUS_TEXT = {
    ONLINE: 'Online',
    OFFLINE : 'Offline',
    BUSY : 'Busy',
    AWAY : 'Away'
};


var TICKET_STATUS = {
    NOT_ASSIGNED: 'warning',
    ASSIGNED : 'info',
    OPENED : 'danger',
    COMPLETED : 'success'
};

var TICKET_STATUS_TEXT = {
    NOT_ASSIGNED: 'New',
    ASSIGNED : 'Pending',
    OPENED : 'In Progress',
    COMPLETED : 'Resolved'
};

var DEFAULT_SETTINGS = {
    WEB : {
        theme : {
            skin : 'skin-default',
            light_logo : 'images/konnect_light_logo.png',
            dark_logo : 'images/konnect_dark_logo.png',
        },
        preference : {
            date_format : 1,
            timezone : 'Asia/Kolkata',
            language : 'en'
        }
    },
    AGENT : {
        call_timeout : 20,
        after_call_wait : 3
    },
    CALL : {
        INCOMING :{
            wait_music : 'https://github.com/BoodskapPlatform/cdn/raw/master/music.mp3',
            welcome_text : 'Welcome to the Konnect Support System.',
        },
        OUTGOING :{
            prefix_text : 'Call from Konnect, '
        },
        COLD_CALL_CONNECT : {
            ivr : false,
            digit1:'Press 1, to connect with agent',
            call_action1 : 'connect',
            digit2:'Press 2, disconnect the call',
            call_action2 : 'disconnect',
            play_timeout : 25,
            play_loop : 2,
            customer_call_retry : 2,
            agent_call_timeout : 20,
            agent_not_available_message : 'Agent not available at this moment. We will connect with you later.',
        }
    },
    SMS : {
        INCOMING :{
            default_reply : 'This is an automated system. we won\'t monitor any reply.',
            unsubscribe_keywords : 'STOP, OPT-OUT, UNSUBSCRIBE'
        },
        OUTGOING :{
            prefix_text : '[Konnect] '
        },
        SMS_CALL_CONNECT : {
            reply_action_text : 'connect, yes, okay',
        }
    },
    EMAIL : {
        INCOMING :{
            default_status : 'NOT_ASSIGNED',
            assign_available_agent : true
        },
        OUTGOING :{
            from_name : 'Konnect',
            from_email : 'konnect@boodskap.io',
            header : '<div style="text-align:center;border-bottom:2px solid #4e5467;padding: 10px"><small>A Product of Anyware</small><h5 style="font-weight: bold;letter-spacing: 5px;margin:0px;font-size: 1.2rem;color:#4b81c2;padding-left: 10px">KONNECT</h5></div>',
            footer : '<p style="color:#666;margin: 50px 0px">Regards,<br><b>Konnect Anyware</b></p>' +
                '<div style="text-align:center;border-top:2px solid #4e5467; padding: 10px;background-color:#4e5467;color:#fff">' +
                '&copy; 2020 All rights reserved. Powered by Boodskap Inc.,</div>',
        },
    },
    SECURITY : {
        mfa : false,
        sms_webhook : '',
        voice_webhook : '',
        email_webhook : ''
    },
    URL : {},
}

var ROLE_AUTH_LIST = {
    Administration : [
        'View Roles',
        'Edit Roles',
        'View Users',
        'Edit Users',
        'View Groups',
        'Edit Groups',
        'View Customers',
        'Edit Customers',
        'View Phone Numbers',
        'Purchase Phone Numbers',
    ],
    Billing : [
        'Billing Overview',
        'Payment Methods',
        'Payment History'
    ],
    Dashboard : [
        'Admin View',
        'Agent View',
        'Broadcast View',
        'Meeting View',
        'Usage View',
    ],
    Broadcast : [
        'Create Campaigns & Broadcast',
        'View Messages',
        'View Templates',
        'Edit Templates',
    ],
    'IVR' : [
        'Incoming Calls',
        'Agent Call History',
        'Cold Call Connect',
        'SMS Call Connect',
    ],
    Meeting : [
        'View Meetings',
        'Schedule Meeting',
        'Voice Conference',
        'Video Conference',
    ],
    'IVR Configuration' : [
        'View IVR Menu',
        'Edit IVR Menu',
        'View IVR Form Builder',
        'Edit IVR Form Builder',
    ],
    'Configurations' : [
        'View Web Settings',
        'View URL Settings',
        'View Security Settings',
        'View Agent Settings',
        'View Call Settings',
        'View SMS Settings',
        'View Email Settings',
    ]
}


var mySkins = [
    "skin-default",
    "skin-green",
    "skin-red",
    "skin-blue",
    "skin-purple",
    "skin-megna",
    "skin-default-dark",
    "skin-green-dark",
    "skin-red-dark",
    "skin-blue-dark",
    "skin-purple-dark",
    "skin-megna-dark"
]