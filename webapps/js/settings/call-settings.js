var call_settings = {};

$(document).ready(function () {

    loadSettings();
});


function uploadMusicFile() {

    var fileInput = document.getElementById("uploadFile");

    var file = fileInput.files[0];

    var fName = file.name;

    if (fName.includes(".wav") || fName.includes(".mp3") || fName.includes(".wma") || fName.includes(".ogg") || fName.includes(".amr")) {
        uploadFile(file, 'music', function (url) {
            if (url) {
                call_settings['INCOMING'].wait_music = url;
                $(".musicBlock").html('<audio controls="" style="display: block;">\n' +
                    '                                    <!-- One or more source files, each referencing the same audio but in a different file format.\n' +
                    '                                    The browser will choose the first file which it is able to play. -->\n' +
                    '                                    <source src="' + url + '">\n' +
                    '                                    You will see this text if native audio playback is not supported.\n' +
                    '                                    <!-- You could use this fall-back feature to insert a JavaScript-based audio player. -->\n' +
                    '                                </audio>')
            } else {
                call_settings['INCOMING'].wait_music = DEFAULT_SETTINGS['CALL']['INCOMING'].wait_music;
                errorMsg('Error in music upload, assigning default music')
            }
        })
    } else {
        errorMsg("Invalid file format!")
        $("#uploadFile").val("")
    }


}

function resetToDefault() {
    call_settings = DEFAULT_SETTINGS.CALL;

    $(".musicBlock").html('<audio controls="" style="display: block;">\n' +
        '                                    <!-- One or more source files, each referencing the same audio but in a different file format.\n' +
        '                                    The browser will choose the first file which it is able to play. -->\n' +
        '                                    <source src="' + call_settings.INCOMING.wait_music + '">\n' +
        '                                    You will see this text if native audio playback is not supported.\n' +
        '                                    <!-- You could use this fall-back feature to insert a JavaScript-based audio player. -->\n' +
        '                                </audio>')
    $("#welcomeText").val(call_settings.INCOMING.welcome_text);

    $("#prefixMessage").val(call_settings.OUTGOING.prefix_text);


    $("#customer_retry").val(call_settings.COLD_CALL_CONNECT.customer_call_retry)
    $("#agent_call_timeout").val(call_settings.COLD_CALL_CONNECT.agent_call_timeout)

    $("input[name='ivrmenu'][value=" + call_settings.COLD_CALL_CONNECT.ivr + "]").prop('checked', true);

    toggleDiv(call_settings.COLD_CALL_CONNECT.ivr);

    $("#digit1").val(call_settings.COLD_CALL_CONNECT.digit1)
    $("#digit2").val(call_settings.COLD_CALL_CONNECT.digit2)
    $("#callAction1").val(call_settings.COLD_CALL_CONNECT.call_action1)
    $("#callAction2").val(call_settings.COLD_CALL_CONNECT.call_action2)
    $("#play_loop").val(call_settings.COLD_CALL_CONNECT.play_loop)
    $("#play_timeout").val(call_settings.COLD_CALL_CONNECT.play_timeout)

    $("#agent_not_available_message").val(call_settings.COLD_CALL_CONNECT.agent_not_available_message)

}


function saveSettings() {

    call_settings['INCOMING']['welcome_text'] = $("#welcomeText").val();
    call_settings['OUTGOING']['prefix_text'] = $("#prefixMessage").val();


    call_settings['COLD_CALL_CONNECT']={
        agent_num:$("#agent_num").val(),
        customer_num:$("#customer_num").val(),
        ivr : $("input[name='ivrmenu']:checked").val() === "true" ? true : false,
        digit1:$("#digit1").val(),
        call_action1 : $("#callAction1").val(),
        digit2:$("#digit2").val(),
        call_action2 : $("#callAction2").val(),
        play_timeout : $("#play_timeout").val() ? Number($("#play_timeout").val()) : DEFAULT_SETTINGS.CALL.COLD_CALL_CONNECT.play_timeout,
        play_loop : $("#play_loop").val() ? Number($("#play_loop").val()) : DEFAULT_SETTINGS.CALL.COLD_CALL_CONNECT.play_loop,
        customer_call_retry : $("#customer_retry").val() ? Number($("#customer_retry").val()) : DEFAULT_SETTINGS.CALL.COLD_CALL_CONNECT.customer_call_retry,
        agent_call_timeout : $("#agent_call_timeout").val() ? Number($("#agent_call_timeout").val()) : DEFAULT_SETTINGS.CALL.COLD_CALL_CONNECT.agent_call_timeout,
        agent_not_available_message : $("#agent_not_available_message").val() ? $("#agent_not_available_message").val() : '',
    }



    $.ajax({
        url: '/settings/call/save',
        contentType: "application/json",
        data: JSON.stringify(call_settings),
        type: 'POST',
        success: function (result) {
            if (result.status) {
                successMsg('Call Settings saved successfully')
            } else {
                errorMsg('Error in saving call settings')
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}

function loadSettings() {

    $.ajax({
        url: '/settings/call/get',
        contentType: "application/json",
        type: 'POST',
        success: function (result) {

            call_settings = DEFAULT_SETTINGS.CALL;

            if (result.status) {
                call_settings = result.result
            }

            $(".musicBlock").html('<audio controls="" style="display: block;">\n' +
                '                                    <!-- One or more source files, each referencing the same audio but in a different file format.\n' +
                '                                    The browser will choose the first file which it is able to play. -->\n' +
                '                                    <source src="' + call_settings.INCOMING.wait_music + '">\n' +
                '                                    You will see this text if native audio playback is not supported.\n' +
                '                                    <!-- You could use this fall-back feature to insert a JavaScript-based audio player. -->\n' +
                '                                </audio>')
            $("#welcomeText").val(call_settings.INCOMING.welcome_text);

            $("#prefixMessage").val(call_settings.OUTGOING.prefix_text);


            $("#customer_retry").val(call_settings.COLD_CALL_CONNECT.customer_call_retry)
            $("#agent_call_timeout").val(call_settings.COLD_CALL_CONNECT.agent_call_timeout)

            $("input[name='ivrmenu'][value=" + call_settings.COLD_CALL_CONNECT.ivr + "]").prop('checked', true);

            toggleDiv(call_settings.COLD_CALL_CONNECT.ivr);

            $("#digit1").val(call_settings.COLD_CALL_CONNECT.digit1)
            $("#digit2").val(call_settings.COLD_CALL_CONNECT.digit2)
            $("#callAction1").val(call_settings.COLD_CALL_CONNECT.call_action1)
            $("#callAction2").val(call_settings.COLD_CALL_CONNECT.call_action2)
            $("#play_loop").val(call_settings.COLD_CALL_CONNECT.play_loop)
            $("#play_timeout").val(call_settings.COLD_CALL_CONNECT.play_timeout)

            $("#agent_not_available_message").val(call_settings.COLD_CALL_CONNECT.agent_not_available_message)

            // getPhoneNumbers();

        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}


function toggleDiv(type) {

    if (type === true) {
        $(".toggleDiv").css('display', 'block');
    } else {
        $(".toggleDiv").css('display', 'none');
    }

}

function getPhoneNumbers() {
    var queryParams = {
        query: {
            "bool": {
                "should": [{match:{num_action:'AGENT_CALLING'}},{match:{num_action:'CUSTOMER_CALLING'}}],
                minimum_should_match : 1

            }
        },
        sort: [{"create_ts": {"order": "desc"}}],
    };

    $("#customer_num").html('<option value="">--select--</option>')
    $("#agent_num").html('<option value="">--select--</option>')

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

                    if(val.num_action === 'AGENT_CALLING'){
                        $("#agent_num").append('<option value="'+val.phone_number+'">'+val.phone_number+'</option>')
                    }
                    if(val.num_action === 'CUSTOMER_CALLING'){
                        $("#customer_num").append('<option value="'+val.phone_number+'">'+val.phone_number+'</option>')
                    }
                }
                $("#agent_num").val(call_settings.COLD_CALL_CONNECT.agent_num ? call_settings.COLD_CALL_CONNECT.agent_num : '')
                $("#customer_num").val(call_settings.COLD_CALL_CONNECT.customer_num ? call_settings.COLD_CALL_CONNECT.customer_num : '')

            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')

        }
    });
}