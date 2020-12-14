var countryList = [];
var countryObj = {};

$(document).ready(function () {
   loadPage();
    loadWalletAmount();
});


function loadPage() {

    $(".numberContent").html('<div class="col-12"><h5 class="p-5 text-center"><i class="fa fa-spinner"></i> Loading...</h5></div>');

    var queryParams = {
        query: {
            "bool": {
                "must": [],

            }
        },
        sort: [{"create_ts": {"order": "desc"}}],
    };

    $.ajax({
        url: '/admin/list/phonenumbers',
        data: JSON.stringify({query:queryParams}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            if (result.status && result.result.total > 0) {

                var resultData = result.result.data.data;

                $(".numberContent").html('')

                for(var i=0;i<resultData.length;i++){
                    var val = resultData[i];

                    var isSMSEnabled = val.capabilities.sms ? true : false;
                    var isVoiceEnabled = val.capabilities.voice ? true : false;

                    var str = '<span style="display: inline-block;position: absolute;top:0px;left: 0px" class="badge badge-success">Active</span>';
                    var blockStr = '';

                    if(new Date().getTime() >= val.expiry_ts){
                        str = '<span style="display: inline-block;position: absolute;top:0px;left: 0px" class="badge badge-danger">Expired</span>';
                        blockStr = '<div style="position:absolute;width:100%;height: 100%;z-index: 999;background-color: #4b81c2;opacity: 0.2;"></div>'
                    }

                    $(".numberContent").append('<div class="col-md-3">\n' +
                        '            <div class="card text-center" style="position: relative">\n' +
                        (val.is_trial ? str+blockStr : '')+
                        '                <div class="card-body">' +
                        '<div class="row"><div class="col-md-12">' +
                        '                    <h4 class="card-title">'+val.phone_number+'</h4>\n' +
                        '                    <p class="card-text">\n' +
                        '                        <strong>Capabilities</strong> <br>\n' +
                        (isSMSEnabled ? '<span style="display: inline-block;margin-right: 5px"><i class="icon-speech"></i> SMS</span>' : '') +
                        (isVoiceEnabled ? '<span style="display: inline-block;"><i class="icon-phone"></i> Voice</span>\n' : '') +
                        '<p><i class="fa fa-clock-o"></i> '+moment(val.create_ts).format(DATE_TIME_FORMAT)+' <span class="text-muted"  data-toggle="tooltip" ' +
                        'data-placement="bottom" title="" data-original-title="Created by, '+val['created_by']+'"><i class="fa fa-info-circle"></i></span></p>'+
                        '                    </p>\n' +
                        (val.is_trial ? '<small class="text-primary mt-4 mb-1" style="display: block">Expiry on, '+moment(val.expiry_ts).format(DATE_TIME_FORMAT)+'</small>' : '<a href="javascript:void(0)" class="btn btn-sm btn-primary" onclick="releaseNumber(\''+val._id+'\',\''+val.phone_number+'\',\''+val.sid+'\')">Release Number</a>\n') +
                        '                </div><div class="col-md-12 mt-2 bg-light pt-2">' +
                        '<ul class="icheck-list text-left" style="list-style: none;margin-left: 0px;padding: 0px">' +
                            '<li>\n' +
                                '<input type="radio" class="check" id="1_'+val._id+'" name="'+val._id+'" value="INCOMING_CALL" '+(isVoiceEnabled ? 'onclick="updateNumberFeature(\''+val._id+'\')"' : 'disabled')+'>\n' +
                                '<label for="1_'+val._id+'">Incoming Call</label>\n' +
                             '</li>' +
                            '<li>\n' +
                                '<input type="radio" class="check" id="2_'+val._id+'" name="'+val._id+'" value="OUTGOING_CALL" '+(isVoiceEnabled ? 'onclick="updateNumberFeature(\''+val._id+'\')"' : 'disabled')+'>\n' +
                                '<label for="2_'+val._id+'">Outgoing Call</label>\n' +
                             '</li>' +
                            '<li>\n' +
                                '<input type="radio" class="check" id="3_'+val._id+'" name="'+val._id+'"  value="CONFERENCE_CALL" '+(isVoiceEnabled ? 'onclick="updateNumberFeature(\''+val._id+'\')"' : 'disabled')+'>\n' +
                                '<label for="3_'+val._id+'">Conference Call</label>\n' +
                             '</li>' +
                            '<li>\n' +
                                '<input type="radio" class="check" id="4_'+val._id+'" name="'+val._id+'" value="INCOMING_SMS" '+(isSMSEnabled ? 'onclick="updateNumberFeature(\''+val._id+'\')"' : 'disabled')+'>\n' +
                                '<label for="4_'+val._id+'">Incoming SMS</label>\n' +
                            '</li>' +
                            '<li>\n' +
                                '<input type="radio" class="check" id="5_'+val._id+'" name="'+val._id+'" value="OUTGOING_SMS" '+(isSMSEnabled ? 'onclick="updateNumberFeature(\''+val._id+'\')"' : 'disabled')+'>\n' +
                                '<label for="5_'+val._id+'">Outgoing SMS</label>\n' +
                            '</li>' +
                            '<li>\n' +
                                '<input type="radio" class="check" id="6_'+val._id+'" name="'+val._id+'" value="AGENT_CALLING" '+(isVoiceEnabled ? 'onclick="updateNumberFeature(\''+val._id+'\')"' : 'disabled')+'>\n' +
                                '<label for="6_'+val._id+'">Agent Calling</label>\n' +
                            '</li>' +
                            '<li>\n' +
                                '<input type="radio" class="check" id="7_'+val._id+'" name="'+val._id+'" value="CUSTOMER_CALLING" '+(isVoiceEnabled ? 'onclick="updateNumberFeature(\''+val._id+'\')"' : 'disabled')+'>\n' +
                                '<label for="7_'+val._id+'">Customer Calling</label>\n' +
                            '</li>' +
                        '</ul>' +
                        '</div></div></div>\n' +
                        '            </div>\n' +
                        '        </div>')

                    if(val.num_action){
                        $("input[name='"+val._id+"'][value=" + val.num_action + "]"). prop('checked', true)
                    }

                }

                $('[data-toggle="tooltip"]').tooltip();

            } else {
                $(".numberContent").html('<div class="col-12"><h5 class="p-5 text-center">' +
                    'We don\'t see any phone numbers in your account.<br><br>' +
                    // '<button class="btn btn-sm btn-primary" onclick="openPhoneModal()"><i class="icon-plus"></i> Purchase Number</button><br><br>' +
                    'Click here to <a href="javascript:void(0)" class="" onclick="getTrailNumber()">Get Free Trial Number</a> for 5 days<br><small class="text-muted">* you can use this trial only once.</small>');

            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
            $(".numberContent").html('<div class="col-12"><h5 class="p-5 text-center">No data available!</h5></div>');

        }
    });

}

function updateNumberFeature(id) {

    var num_action = $("input[name='"+id+"']:checked").val();

    $.ajax({
        url: '/admin/updatefeature/phonenumbers',
        data: JSON.stringify({_id:id,num_action:num_action}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            if (result.status) {

            }else{
                errorMsg('Error in updating number feature')
            }
        },
        error: function (e) {
            $("#countryList").html('');
            errorMsg('Something went wrong! Please try again later.')

        }
    });
}

function openPhoneModal() {
    countryObj = {};
    numberList =[];
    $(".extraInfo").html('');
    $(".capabilities").html("")
    $(".canSend").html("")
    $(".searchHtml").html("")

    listCountries();
    $("#phoneModal").modal({
        backdrop: 'static',
        keyboard: false
    });
}

function listCountries() {
    var queryParams = {
        query: {
            "bool": {
                "must": [],

            }
        },
        sort: [{"create_ts": {"order": "desc"}}],
        size:200
    };

    $("#countryList").html('<option value="">loading.....</option>')

    $.ajax({
        url: '/admin/listcountries/phonenumbers',
        data: JSON.stringify({query: queryParams}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            $("#countryList").html('');
            if (result.status) {
                if(result.result.total > 0){
                    var resultData = result.result.data.data;
                    countryList = resultData;
                    for(var i=0;i<resultData.length;i++){
                        $("#countryList").append('<option value="'+resultData[i]['_id']+'">'+resultData[i]['country']+' (+'+resultData[i]['country_code']+') - '+resultData[i]['phone_num_type']+'</option>')
                    }
                }
                $("#countryList").select2({
                    dropdownParent: $('#phoneModal'),
                    sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
                });
                $('select#countryList').val('').trigger('change');


            }
        },
        error: function (e) {
            $("#countryList").html('');
            errorMsg('Something went wrong! Please try again later.')

        }
    });
}


function renderFeatures(val) {

    if(val) {
        var obj = {};

        for (var i = 0; i < countryList.length; i++) {
            if (countryList[i]._id === val) {
                obj = countryList[i]
            }
        }
        countryObj = obj;
        numberList = [];

        var str = '';

        if (obj.sms_enabled === 'Yes') {
            str += '<span style="display: inline-block;margin-right: 10px"><i class="icon-speech"></i> SMS</span>';
        }
        if (obj.voice_enabled === 'Yes') {
            str += '<span style="display: inline-block;margin-right: 10px"><i class="icon-phone"></i> Voice</span>';
        }
        $(".capabilities").html(str ? '<label>Capabilities</label><div>' + str + '</div>' : '')

        str = '';

        if (obj.domestic_sms_only === 'Yes') {
            str += '<li>Can send/receive sms to domestic numbers only</li>';
        }
        if (obj.domestic_voice_only === 'Yes') {
            str += '<li>Can send/receive calls to domestic numbers only</li>';
        }

        $(".canSend").html(str)

        str = '';
        $(".extraInfo").html('');
        if (obj.address_req === 'Yes') {
            $(".extraInfo").html('<p class="alert alert-warning">Some local authorities require you to provide an address before purchasing a phone number. Please <a href="mailto:support@boodskap.io">contact us</a> for more info</p>')
        }

        $(".searchHtml").html('<div class="col-md-7">' +
            ' <div class="form-group">\n' +
            '<input type="text" onkeypress="onlyNumber(this)" onkeyup="onlyNumber(this)" id="searchNumber" ' +
            ' class="form-control" placeholder="" aria-label="Search" aria-describedby="basic-addon2">\n' +
            '<small>Search by area code, prefix, or characters you want in your phone number.</small>' +
            '</div>' +
            '</div>' +
            '<div class="col-md-3"><button class="btn btn-block btn-primary searchBtn" onclick="getAvailableNumbers()"><i class="icon-magnifier"></i> Search</button></div>' +
            '<div class="col-md-2"></div>'+
            '<div class="col-md-12 bg-light">' +
            '<div class="totalNumbers mt-2"></div>' +
            '<div class="row availableList" style="height: 350px;overflow: auto;overflow-x: hidden"></div> ' +
            '</div>')
    }else{
        countryObj = {}
    }

}

var numberList = [];

function getAvailableNumbers() {

    if($("#countryList").val() === ""){
        showToast('error','Required Field','Country cannot be empty');
        return false
    }

    $(".totalNumbers").html('')
    $(".availableList").html('')

    $(".searchBtn").attr('disabled','disabled')
    $(".searchBtn").html('<i class="fa fa-spinner fa-spin"></i> Fetching numbers...')
    var data = {
        iso : countryObj.iso,
        search : $("#searchNumber").val(),
        phone_type : countryObj.phone_num_type.replace(" ",'')
    }

    $.ajax({
        url: '/admin/listnumbers/phonenumbers',
        data: JSON.stringify(data),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            $(".searchBtn").removeAttr('disabled')
            $(".searchBtn").html('<i class="icon-magnifier"></i> Search')
            if (result.status && result) {

                var resultData = result.result;
                numberList = resultData;

                var tprice = Number(countryObj.monthly_price) + (Number(countryObj.monthly_price) * Number($("#phoneAmount").val()))

                $(".totalNumbers").html('Total <strong>'+resultData.length+'</strong> Numbers Found,' +
                    '<div class="alert alert-info">After purchasing the number, You\'ll be charged <b>$'+tprice+'</b> immediately. Afterwards, ' +
                    'you\'ll be charged  <b>$'+tprice+' per month</b> in addition to the usage you incur on the Phone Number.</div>')

                for(var i=0;i<resultData.length;i++){
                    var val = resultData[i];
                    $(".availableList").append('<div class="col-md-4">' +
                        '<div class="card text-center ">\n' +
                        '                <div class="card-body">\n' +
                        '                    <h4 class="card-title">'+val.friendly_name+'</h4>\n' +
                        '                    <p class="card-text">\n' +
                        (val.locality ? '<span><i class="icon-location-pin"></i> '+val.locality+', '+val.region+'</span> <br>\n' : '') +
                        (tprice ? '<p class="text-primary mb-1" style="font-size: 16px;font-family: monospace">$'+tprice+' <small>per month</small></p>' : '')+
                        '                    </p>\n' +
                        '                    <a href="javascript:void(0)" class="btn btn-sm btn-primary buy_'+i+'" onclick="addPhoneNumber('+i+',\''+val.phone_number+'\')"><i class="fa fa-shopping-cart"></i> Buy</a>\n' +
                        '                </div>\n' +
                        '            </div>' +
                        '</div>')
                }

            } else {
                warningMsg('No numbers available in this search criteria')
            }
        },
        error: function (e) {
            $(".searchBtn").removeAttr('disabled')
            $(".searchBtn").html('<i class="icon-magnifier"></i> Search')
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}


function addPhoneNumber(index,id) {

    $(".buy_"+index).attr('disabled','disabled')
    $(".buy_"+index).html('<i class="fa fa-spinner fa-spin"></i> processing...')

    var obj = {}

    for(var i=0;i<numberList.length;i++){
        if(id === numberList[i].phone_number){
            obj = numberList[i];
        }
    }

    obj['create_ts'] = new Date().getTime()
    obj['created_by'] = SESSION_USER;

    obj['phone_type'] = countryObj.phone_num_type.replace(" ",'')
    obj['sms_enabled'] = obj.capabilities['SMS'];
    obj['voice_enabled'] = obj.capabilities.voice;
    obj['monthly_price'] = countryObj.monthly_price ? countryObj.monthly_price : 0;
    obj['inbound_voice_price'] = countryObj.inbound_voice_price ? countryObj.inbound_voice_price : 0;
    obj['inbound_sms_price'] = countryObj.inbound_sms_price ? countryObj.inbound_sms_price : 0;
    obj['inbound_voice_landline_price'] = countryObj.inbound_voice_landline_price ? countryObj.inbound_voice_landline_price : 0;
    obj['inbound_voice_mobile_price'] = countryObj.inbound_voice_mobile_price ? countryObj.inbound_voice_mobile_price : 0;

    for(var key in obj){
        if(_.isNull(obj[key])){
            delete obj[key];
        }
    }

    $.ajax({
        url: '/admin/add/phonenumbers',
        data: JSON.stringify(obj),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            $(".buy_"+index).removeAttr('disabled')
            $(".buy_"+index).html('<i class="fa fa-shopping-cart"></i> Buy')
            if (result.status) {
                loadPage();
                $("#phoneModal").modal('hide')
                successMsg(obj.phone_number +" has been purchased successfully")

            } else {
                errorMsg('Error in adding phone number')
            }
        },
        error: function (e) {
            $(".buy_"+index).removeAttr('disabled')
            $(".buy_"+index).html('<i class="fa fa-shopping-cart"></i> Buy')
            errorMsg('Something went wrong! Please try again later.')
        }
    });


}

function getTrailNumber() {

    $.blockUI({ message: "<p class='m-1'><i class='fa fa-spinner fa-spin'></i> Looking for trial numbers...</p>" });

    $.ajax({
        url: '/admin/trialnumber/phonenumbers',
        data: JSON.stringify({}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            $.unblockUI();
            if (result.status) {
                successMsg("Trial Phone number has been added to your application. "+result.response['phone_number']+" Number will be expiry on "+moment(result.response.response).format(DATE_TIME_FORMAT))
                setTimeout(function () {
                    loadPage();
                },500)

            } else {
                errorMsg(result.message)
            }
        },
        error: function (e) {
            $.unblockUI();
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}


function releaseNumber(id,num,sid) {

    swal({
        title: "Are you sure?",
        text: "["+num+"] will be released from the application",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
    })
        .then(function (result) {
            if (result.value) {
                $.blockUI({ message: "<p class='m-1'><i class='fa fa-spinner fa-spin'></i> Loading...</p>" });

                $.ajax({
                    url: '/admin/delete/phonenumbers',
                    data: JSON.stringify({_id:id,sid:sid,phone_number:num}),
                    contentType: "application/json",
                    type: 'POST',
                    success: function (result) {
                        $.unblockUI();
                        if (result.status) {
                            successMsg("Phone number has been released from the application.")
                            setTimeout(function () {
                                loadPage();
                            },500)


                        } else {
                            errorMsg('Error in releasing phone number')
                        }
                    },
                    error: function (e) {
                        $.unblockUI();
                        errorMsg('Something went wrong! Please try again later.')
                    }
                });

            }
        });

}
