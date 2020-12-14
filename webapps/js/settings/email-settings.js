var email_settings = {};

$(document).ready(function () {

    loadSettings();
});



function resetToDefault() {
    email_settings = DEFAULT_SETTINGS.EMAIL;

    $("#from_email").val(email_settings.OUTGOING.from_email);
    $("#from_name").val(email_settings.OUTGOING.from_name);
    $("#header_temp").val(email_settings.OUTGOING.header);
    $("#footer_temp").val(email_settings.OUTGOING.footer);

    setPreview();

}

function setPreview() {
    $(".previewHeader").html($("#header_temp").val())
    $(".previewFooter").html($("#footer_temp").val())
}

function saveSettings() {

    email_settings['OUTGOING']['from_email'] = $("#from_email").val();
    email_settings['OUTGOING']['from_name'] = $("#from_name").val();
    email_settings['OUTGOING']['header'] = $("#header_temp").val();
    email_settings['OUTGOING']['footer'] = $("#footer_temp").val();


    $.ajax({
        url: '/settings/email/save',
        contentType: "application/json",
        data: JSON.stringify(email_settings),
        type: 'POST',
        success: function (result) {
            if (result.status) {
                setPreview();
                successMsg('Email Settings saved successfully')
            } else {
                errorMsg('Error in saving email settings')
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}

function loadSettings() {

    $.ajax({
        url: '/settings/email/get',
        contentType: "application/json",
        type: 'POST',
        success: function (result) {

            email_settings = DEFAULT_SETTINGS.EMAIL;

            if (result.status) {
                email_settings = result.result
            }
            $("#from_email").val(email_settings.OUTGOING.from_email);
            $("#from_name").val(email_settings.OUTGOING.from_name);
            $("#header_temp").val(email_settings.OUTGOING.header);
            $("#footer_temp").val(email_settings.OUTGOING.footer);

            setPreview();


        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}
