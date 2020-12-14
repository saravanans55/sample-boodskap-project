var agent_settings = {};

$(document).ready(function () {

    loadSettings();

});

function resetToDefault() {
    agent_settings = DEFAULT_SETTINGS.AGENT;

    $("#agent_timeout").val(agent_settings.call_timeout);
    $("#agent_call_timeout").val(agent_settings.after_call_wait);

}


function saveSettings() {

    if($("#agent_timeout").val() === ''){
        errorMsg('Agent call timeout cannot be empty')
        return false;
    }
    if($("#agent_call_timeout").val() === ''){
        errorMsg('Agent after call wait timeout cannot be empty')
        return false;
    }

    agent_settings = {
        call_timeout : Number($("#agent_timeout").val()),
        after_call_wait :  Number($("#agent_call_timeout").val())
    }

    $.ajax({
        url: '/settings/agent/save',
        contentType: "application/json",
        data : JSON.stringify(agent_settings),
        type: 'POST',
        success: function (result) {
            if(result.status){
                successMsg('Agent Settings saved successfully')
            }
            else{
                errorMsg('Error in saving agent settings')
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}

function loadSettings() {

    $.ajax({
        url: '/settings/agent/get',
        contentType: "application/json",
        type: 'POST',
        success: function (result) {

            agent_settings = DEFAULT_SETTINGS.AGENT;

            if (result.status) {
                agent_settings = result.result
            }

            $("#agent_timeout").val(agent_settings.call_timeout);
            $("#agent_call_timeout").val(agent_settings.after_call_wait);


        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}
