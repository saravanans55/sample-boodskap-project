var sms_settings = {};

$(document).ready(function () {

    loadSettings();
});



function resetToDefault() {
    sms_settings = DEFAULT_SETTINGS.SMS;

    $("#replyText").val(sms_settings.INCOMING.default_reply);
    $("#unsubscribeText").val(sms_settings.INCOMING.unsubscribe_keywords);
    $("#prefixMessage").val(sms_settings.OUTGOING.prefix_text);
    $("#defaultActionText").val(sms_settings.SMS_CALL_CONNECT.reply_action_text);
    $("#outgoing_num").val('')
    $("#incoming_num").val('')


}


function saveSettings() {

    sms_settings['INCOMING']['default_reply'] = $("#replyText").val();
    sms_settings['INCOMING']['unsubscribe_keywords'] = $("#unsubscribeText").val();
    sms_settings['OUTGOING']['prefix_text'] = $("#prefixMessage").val();
    sms_settings['OUTGOING']['phone_num'] = $("#outgoing_num").val();
    sms_settings['SMS_CALL_CONNECT']['reply_action_text'] = $("#defaultActionText").val();
    sms_settings['SMS_CALL_CONNECT']['phone_num'] = $("#incoming_num").val();


    $.ajax({
        url: '/settings/sms/save',
        contentType: "application/json",
        data: JSON.stringify(sms_settings),
        type: 'POST',
        success: function (result) {
            if (result.status) {
                successMsg('SMS Settings saved successfully')
            } else {
                errorMsg('Error in saving sms settings')
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}

function loadSettings() {

    $.ajax({
        url: '/settings/sms/get',
        contentType: "application/json",
        type: 'POST',
        success: function (result) {

            sms_settings = DEFAULT_SETTINGS.SMS;

            if (result.status) {
                sms_settings = result.result
            }
            $("#replyText").val(sms_settings.INCOMING.default_reply);
            $("#unsubscribeText").val(sms_settings.INCOMING.unsubscribe_keywords);
            $("#prefixMessage").val(sms_settings.OUTGOING.prefix_text);
            $("#defaultActionText").val(sms_settings.SMS_CALL_CONNECT.reply_action_text);

            // getPhoneNumbers();
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}


function getPhoneNumbers() {
    var queryParams = {
        query: {
            "bool": {
                "should": [{match:{num_action:'OUTGOING_SMS'}},{match:{num_action:'INCOMING_SMS'}}],
                minimum_should_match : 1
            }
        },
        sort: [{"create_ts": {"order": "desc"}}],
    };

    $("#outgoing_num").html('<option value="">--select--</option>')
    $("#incoming_num").html('<option value="">--select--</option>')

    $.ajax({
        url: '/admin/list/phonenumbers',
        data: JSON.stringify({query: queryParams}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            if (result.status && result.result.total > 0) {

                var resultData = result.result.data.data;



                for(var i=0;i<resultData.length;i++){
                    var val = resultData[i];

                    if(val.num_action === 'OUTGOING_SMS'){
                        $("#outgoing_num").append('<option value="'+val.phone_number+'">'+val.phone_number+'</option>')
                    }
                    if(val.num_action === 'INCOMING_SMS'){
                        $("#incoming_num").append('<option value="'+val.phone_number+'">'+val.phone_number+'</option>')
                    }
                }
                $("#outgoing_num").val(sms_settings.OUTGOING.phone_num ? sms_settings.OUTGOING.phone_num : '')
                $("#incoming_num").val(sms_settings.SMS_CALL_CONNECT.phone_num ? call_settings.SMS_CALL_CONNECT.phone_num : '')

            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')

        }
    });
}