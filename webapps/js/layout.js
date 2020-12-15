var PAGE_REFRESH = true;
$(document).ready(function () {

    // mqttConnect();
    // loadOnlineUsers();

    $("base").remove()

    // $(window).bind('beforeunload', function(e) {
    //     if(PAGE_REFRESH){
    //         return "Unloading this page may lose data. What do you want to do..."
    //         e.preventDefault();
    //     }
    //
    // });

    if(location.hash){
        var locName = location.hash.replace("#",'');
        $(".homeMenu").removeClass('active');
        $(".homeMenu a").removeClass('active');

        if(locName.includes("profile")){
            loadHeaderPage(locName);
        }else{
            loadMainPage(locName);
        }

    }

    //theme info
    // loadWebSettings();

    //fetch user info
    // getMyInfo();


    //Admin & Billing access users


});


function loadWebSettings() {


    if(localGet('web_settings') == null) {

        $.ajax({
            url: '/settings/web/get',
            contentType: "application/json",
            type: 'POST',
            success: function (result) {
                if (result.status) {
                    web_settings = result.result
                }else{
                    web_settings = DEFAULT_SETTINGS.WEB
                }
                localStore('web_settings',web_settings);
                loadThemeUititles()

            },
            error: function (e) {
                errorMsg('Something went wrong! Please try again later.')
            }
        });
    }else{
        loadThemeUititles()
    }

}

function loadThemeUititles() {
    var themeObj = localGet('web_settings');

    changeSkin(themeObj.theme.skin);

    $(".dark-logo").attr('src',themeObj.theme.light_logo)
    $(".light-logo").attr('src',themeObj.theme.dark_logo)

    DATE_TIME_FORMAT = DATE_TIME_FORMAT_LIST[themeObj.preference.date_format];
}


function changeSkin(cls) {

    $.each(mySkins, function (i) {
        $('body').removeClass(mySkins[i])
    })
    $('body').addClass(cls)

    return false
}



function mqttListen() {
    console.log(new Date + ' | MQTT Started to Subscribe');

    mqttSubscribe("/" + DOMAIN_KEY + "/log/#", 0);

    mqtt_client.onMessageArrived = function (message) {
        // var parsedData = JSON.parse(message.payloadString);
        // var topicName = message.destinationName;

        if(message.payloadString.includes("USER_STATUS_UPDATE")) {
            try {
                loadPage();
            }catch(e){}
            // loadOnlineUsers();
        }

        if(message.payloadString.includes("_CAMPAIGN_")) {
            try {
                loadPage();
            }catch(e){}
        }

        if(message.payloadString.includes("AMOUNT_CREDIT") || message.payloadString.includes("AMOUNT_DEBIT")) {
            loadWalletAmount()
        }
    };
}



function getNotes() {

    $.ajax({
        url: '/getNotes',
        data: JSON.stringify({}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            if (result.status) {
                $("#mymce").val(result.result)
            }
            tinymce.init({
                selector: "textarea#mymce",
                theme: "modern",
                height: 300,
                plugins: [
                    "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
                    "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
                    "save table contextmenu directionality emoticons template paste textcolor"
                ],
                toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons",

            });
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}

function loadWalletAmount() {

    $.ajax({
        url: '/getwalletamount',
        data: JSON.stringify({}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            if (result.amount) {
                $(".walletAmount").html(result.amount.toFixed(4))
            }else{
                $(".walletAmount").html('0')
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}

function creditAmount(domainKey,amount) {

    $.ajax({
        url: '/addcredit',
        data: JSON.stringify({domainKey:domainKey,amount:amount}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            if (result.status) {
                successMsg('Amount credited successfully')
            }else{
                errorMsg('Error in Amount credit')
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}

function saveNotes() {

    $.ajax({
        url: '/savenotes',
        data: JSON.stringify({notes:tinyMCE.get('mymce').getContent()}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            if (result.status) {
                successMsg('Notes saved successfully');
            }else{
                errorMsg('Error in saving notes');
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}

function resetNotes() {
    tinyMCE.get('mymce').setContent('');
}


function loadMainPage(url) {
    // $('#pageWrapper').block({ message: 'Processing...' });
    $.blockUI({ message: "<p class='m-1'><i class='fa fa-spinner fa-spin'></i> Loading...</p>" });

    var parentClassName = url.split("/")[1]+'Menu';
    var childClassName = url.split("/")[2];


    $.ajax({
        url: BASE_PATH + url,
        type: 'GET',
        contentType: "text/html",
        success: function (data, textStatus, xhr) {

            $("#sidebarnav li").removeClass('active')
            $("#sidebarnav li a").removeClass('active')

            $("."+parentClassName).addClass('active');
            $("."+parentClassName+" .has-arrow").addClass('active');
            if(childClassName) {
                $("." + childClassName).addClass('active');
                $("." + childClassName + " a").addClass('active');
            }

            $("#pageWrapper").html(data);
            $.unblockUI();
        },
        error: function (e) {
            $.unblockUI();
            if(e.status === 404){
                errorMsg('Page Not Found!');
            } else if(e.status === 401){
                errorMsg('Invalid Session Access!');
                document.location=BASE_PATH;
            }else{
                document.location=BASE_PATH;
                errorMsg('Something went wrong!');
            }


        }
    });

}



function loadHeaderPage(url) {

    $(".tooltip").css('display','none')
    // $('#pageWrapper').block({ message: 'Processing...' });
    $.blockUI({ message: "<p class='m-1'><i class='fa fa-spinner fa-spin'></i> Loading...</p>" });

    $.ajax({
        url: url,
        type: 'GET',
        contentType: "text/html",
        success: function (data, textStatus, xhr) {

            $("#sidebarnav li").removeClass('active')
            $("#sidebarnav li a").removeClass('active')

            $("#pageWrapper").html(data);
            $.unblockUI();
        },
        error: function (e) {
            $.unblockUI();
            if(e.status === 404){
                errorMsg('Page Not Found!');
            } else if(e.status === 401){
                errorMsg('Invalid Session Access!');
                document.location=BASE_PATH;
            }else{
                document.location=BASE_PATH;
                errorMsg('Something went wrong!');
            }


        }
    });

}

function loadOnlineUsers() {

    var queryParams = {
        query: {
            "bool": {
                "must": [{match:{is_active:true}}],
                should :[{match:{status:'ONLINE'}},{match:{status:'AWAY'}},{match:{status:'BUSY'}}],
                minimum_should_match:1
            }
        },
        sort: [{"last_updt_ts": {"order": "desc"}}],
        size:500
    };

    $(".onlineUsers").html('');

    $.ajax({
            url: '/admin/list/users',
            data: JSON.stringify({query:queryParams}),
            contentType: "application/json",
            type: 'POST',
            success: function (result) {
                if (result.status) {

                    var resultData = result.result.data.data;

                    for(var i=0;i<resultData.length;i++){

                        var obj = resultData[i];

                        var imgUrl = 'images/user_bg.svg';

                        if(obj['user_img']){
                            imgUrl = obj['user_img'];
                        }

                        var st = '<span class="bg-'+STATUS[obj['status']]+'" style="margin-right:5px;width: 10px;height: 10px;border-radius: 50%;content:\'\';display: inline-block;"></span>'

                        var tool = '';
                        if(obj['last_active_ts']){
                            tool += ' <small class="text-muted" title="Last Active Time"><i class="fa fa-clock-o"></i> '+moment(obj['last_active_ts']).format(DATE_TIME_FORMAT)+'</small>'
                        }
                        if(obj['last_call_ts']){
                            tool += ' <small class="text-muted" title="Last Call Time"><i class="fa fa-phone"></i> '+moment(obj['last_call_ts']).format(DATE_TIME_FORMAT)+'</small>'
                        }

                        var str = ' <li>' +
                            '<a href="javascript:void(0)"><img src="'+imgUrl+'" alt="user-img" class="img-circle"> ' +
                            '<span> '+st+obj['first_nam']+' '+obj['last_nam']+' '+
                            '<small class="text-'+CALL_STATUS[obj.call_status]+'">' +
                            CALL_STATUS_TEXT[obj.call_status]+'</small></span></a>' +
                            '</li>'

                        $(".onlineUsers").append(str);
                        setTimeout(function () {
                            $('[data-toggle="tooltip"]').tooltip()
                        },500)

                    }


                }
            },
            error: function (e) {
                errorMsg('Something went wrong! Please try again later.')
            }
        });
}


function getMyInfo() {

    $.ajax({
        url: '/getmyinfo',
        data: JSON.stringify(),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            if (result.status && result.result.total) {
                USER_INFO = result.result.data.data[0];
                if(USER_INFO.user_img){
                    $(".usrImg").attr('src',USER_INFO.user_img);
                }else{
                    $(".usrImg").attr('src',DEFAULT_USR_IMG);
                }
                changeUserStatus(USER_INFO['status'],false);
            }else{
                $(".usrImg").attr('src',DEFAULT_USR_IMG);
            }

        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}

function changeUserStatus(status,flag) {

    $(".userStatus").html('<span class="'+STATUS[status]+'bit"></span> <span class="'+STATUS[status]+'point"></span> ');
    $(".userStatusTooltip").attr('data-original-title',STATUS_TEXT[status]);

    if(flag) {
        USER_INFO['status'] = status;
        USER_INFO['last_updt_ts'] = new Date().getTime();
        USER_INFO['last_active_ts'] = new Date().getTime();

        var call_status = 'IN_ACTIVE';

        if(status === 'ONLINE'){
            call_status = 'ACTIVE';
        }

        $.ajax({
            url: '/updatestatus',
            data: JSON.stringify({status: status, call_status:call_status}),
            contentType: "application/json",
            type: 'POST',
            success: function (result) {
                if (!result.status) {
                    errorMsg('Error in updating user status')
                }
            },
            error: function (e) {
                errorMsg('Something went wrong! Please try again later.')
            }
        });
    }

}
