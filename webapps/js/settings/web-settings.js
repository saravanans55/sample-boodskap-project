var darkWebLogo = null;
var lightWebLogo = null;
var web_settings = {};

$(document).ready(function () {

    $("#dateFormat").html('')

    for(var key in DATE_TIME_FORMAT_LIST){
        $("#dateFormat").append('<option value="'+key+'">'+DATE_TIME_FORMAT_LIST[key]+'</option>')
    }

    loadSettings();



    setup();

    $("#themecolors").on("click", "a", function () {
        $("#themecolors li a").removeClass("working"),
            $(this).addClass("working")
    })


});

function resetToDefault() {
    web_settings = DEFAULT_SETTINGS.WEB;

    $("#themecolors li a").removeClass('working');
    if(web_settings.theme.skin === 'skin-default'){
        $(".light_theme").addClass('working')
    }else{
        $(".dark_theme").addClass('working')
    }
    changeSkin(web_settings.theme.skin);

    loadTimezone(web_settings.preference.timezone);
    $("#dateFormat").val(web_settings.preference.date_format);

    initLogo(web_settings);


}
function saveSettings() {

    web_settings.preference = {
        date_format : $("#dateFormat").val(),
        timezone :  $("#timeZone").val(),
        language :  $("#language").val()
    }


    $.ajax({
        url: '/settings/web/save',
        contentType: "application/json",
        data : JSON.stringify(web_settings),
        type: 'POST',
        success: function (result) {
            if(result.status){
                localStore('web_settings', web_settings);
                loadThemeUititles(web_settings)
                successMsg('Web Settings saved successfully')
            }
            else{
                errorMsg('Error in saving web settings')
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}

function loadSettings() {

    $.ajax({
        url: '/settings/web/get',
        contentType: "application/json",
        type: 'POST',
        success: function (result) {

            web_settings = DEFAULT_SETTINGS.WEB;

            if (result.status) {
                web_settings = result.result
            }

            $("#themecolors li a").removeClass('working');

            if(web_settings.theme.skin === 'skin-default'){
                $(".light_theme").addClass('working')
            }else{
                $(".dark_theme").addClass('working')
            }

            changeSkin(web_settings.theme.skin);

            $("#dateFormat").val(web_settings.preference.date_format);
            loadTimezone(web_settings.preference.timezone);

            initLogo(web_settings);

        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}

function initLogo(web_settings) {
    darkWebLogo = null;
    lightWebLogo = null;

    $(".imgLogo").html(' <label class="font-weight-normal">Light Theme Logo</label>\n' +
        '                            <input onchange="uploadLogo(this,\''+'lightWebLogo'+'\')" type="file" id="lightWebLogo" class="dropify"  data-max-height="41" data-max-width="161" />\n' +
        '                            <label class="font-weight-normal mt-2">Dark Theme Logo</label>\n' +
        '                            <input onchange="uploadLogo(this,\''+'darkWebLogo'+'\')"  type="file" id="darkWebLogo" class="dropify" data-max-height="41" data-max-width="161" />')

    darkWebLogo = $('#darkWebLogo').dropify({
        defaultFile: web_settings.theme.dark_logo,
        messages: {
            'remove':  '<i class="fa fa-close"></i>',
        },
        error: {
            'maxWidth': 'The image width is too big (160px max).',
            'maxHeight': 'The image height is too big (40px max).',
        },
        allowedFileExtensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp'],
    });
    lightWebLogo = $('#lightWebLogo').dropify({
        defaultFile : web_settings.theme.light_logo,
        messages: {
            'remove':  '<i class="fa fa-close"></i>',
        },
        error: {
            'maxWidth': 'The image width is too big (160px max).',
            'maxHeight': 'The image height is too big (40px max).',
        },
        allowedFileExtensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp'],
    });
``

}

function uploadLogo(obj,type) {

    var fileInput = document.getElementById(type);
    var files = fileInput.files;

    uploadFile(files[0],'logo',function (url) {
        if(url){
            if(type === 'lightWebLogo'){
                web_settings['theme']['light_logo'] = url;
            }
            if(type === 'darkWebLogo'){
                web_settings['theme']['dark_logo'] = url;
            }
        }
    })
}

function loadTimezone(val) {
    $("#timeZone").html('<option value="">loading...</option>')

    var timezoneList = moment.tz.names();
    for(var i=0;i<timezoneList.length;i++){
        $("#timeZone").html('');
        for(var i=0;i<timezoneList.length;i++){
            $("#timeZone").append('<option value="'+timezoneList[i]+'">'+timezoneList[i]+'</option>')
        }
        $("#timeZone").select2();
        $('select#timeZone').val(val).trigger('change');
    }
    /*$.ajax({
        url: '/js/timezone.json',
        contentType: "application/json",
        type: 'GET',
        success: function (result) {
            $("#timeZone").html('');
            for(var i=0;i<result.length;i++){
                $("#timeZone").append('<option value="'+result[i].offset+'">'+result[i].value+' '+result[i].text+'</option>')
            }
            $("#timeZone").select2();
            $('select#timeZone').val(val).trigger('change');


        },
        error: function (e) {
            $("#timeZone").html('<option value=""></option>')
        }
    });*/

}


function setup() {
    // var tmp = get('skin')
    // if (tmp && $.inArray(tmp, mySkins)) changeSkin(tmp)
    // Add the change skin listener
    $('[data-skin]').on('click', function (e) {
        if ($(this).hasClass('knob')) return
        e.preventDefault()
        web_settings['theme']['skin'] = $(this).data('skin');
        changeSkin($(this).data('skin'))
    })
}