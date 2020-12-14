var security_settings = {};
var api_key = '';
$(document).ready(function () {

    loadSettings();
    getAPIKey()
    $(".domainKey").html(DOMAIN_KEY)

});

function resetToDefault() {
    security_settings = DEFAULT_SETTINGS.SECURITY;

}


function saveSettings(flag) {

    security_settings = {
        mfa : flag,
    }

    $.ajax({
        url: '/settings/security/save',
        contentType: "application/json",
        data : JSON.stringify(security_settings),
        type: 'POST',
        success: function (result) {
            if(result.status){
                successMsg('Security Settings saved successfully')
            }
            else{
                errorMsg('Error in saving security settings')
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}

function loadSettings() {

    $.ajax({
        url: '/settings/security/get',
        contentType: "application/json",
        type: 'POST',
        success: function (result) {

            security_settings = DEFAULT_SETTINGS.SECURITY;

            if (result.status) {
                security_settings = result.result
            }

            $("input[name='mfa'][value=" + security_settings.mfa + "]"). prop('checked', true);

            $("#sms_webhook").val(security_settings.sms_webhook ? security_settings.sms_webhook : '');
            $("#voice_webhook").val(security_settings.voice_webhook ? security_settings.voice_webhook : '');
            $("#email_webhook").val(security_settings.email_webhook ? security_settings.email_webhook : '');


        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}


function generateAPIKey() {

    var api_Key = generateUUID();

    $.ajax({
        url: '/credentials/generate',
        contentType: "application/json",
        data : JSON.stringify({domainKey: DOMAIN_KEY, api_token: api_Key, apiKey: API_KEY}),
        type: 'POST',
        success: function (result) {

            if (result.status) {
                $(".apiKey").html('<b>'+api_Key+'</b> <a href="javascript:void(0)" class="ml-3" onclick="generateAPIKey()"><i class="fa fa-refresh"></i> Regenerate</a>');

            }else{
                errorMsg('Error in generating API Key')
            }


        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}


function getAPIKey() {
    $.ajax({
        url: '/credentials/get',
        contentType: "application/json",
        data : JSON.stringify({domainKey: DOMAIN_KEY}),
        type: 'POST',
        success: function (result) {

            if (result.status) {
                $(".apiKey").html('<b>'+result.result.api_token+'</b> <a href="javascript:void(0)" class="ml-3" onclick="generateAPIKey()"><i class="fa fa-refresh"></i> Regenerate</a>');
            }else{
                $(".apiKey").html('<a href="javascript:void(0)" onclick="generateAPIKey()">Click here to generate API Key</a>')
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}




function saveURLSettings() {

    security_settings = {
        mfa : $("input[name='mfa']:checked"). val() == 'true' ? true : false,
        sms_webhook : $("#sms_webhook").val(),
        voice_webhook : $("#voice_webhook").val(),
        email_webhook : $("#email_webhook").val(),
    }

    $.ajax({
        url: '/settings/security/save',
        contentType: "application/json",
        data : JSON.stringify(security_settings),
        type: 'POST',
        success: function (result) {
            if(result.status){
                successMsg('Webook URL Settings saved successfully')
            }
            else{
                errorMsg('Error in saving Webook URL settings')
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}
