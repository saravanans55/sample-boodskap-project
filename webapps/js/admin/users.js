var userTable = null;

var current_user_id = null;
var user_list = [];
var roles_list = [];
var telePhone = null
var phoneNo = document.querySelector("#phoneNo");
$(document).ready(function () {
    loadPage();
    loadRoles();

    loadWalletAmount();

});

function loadRoles() {

    var queryParams = {
        query: {
            "bool": {
                "must": [],

            }
        },
        sort: [{"create_ts": {"order": "asc"}}],
    };

    $.ajax({
        url: '/admin/list/roles',
        data: JSON.stringify({query:queryParams}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            if (result.status) {
                roles_list = result.result.data.data;
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}


function loadPage() {

    if (userTable) {
        userTable.destroy();
        $("#userTable").html("");
    }

    var fields = [
        {
            mData: 'first_nam',
            sTitle: 'Full Name',
            sWidth: '20%',
            orderable: false,
            mRender: function (data, type, row) {
                var imgUrl = DEFAULT_USR_IMG;

                if(row['user_img']){
                    imgUrl = row['user_img']; //renderImgUrl(row['user_img']);
                }
                var img = '<img src="'+imgUrl+'" class="user_bg"/>'

                var tool = '';
                if(row['last_active_ts']){
                    tool += ' <span class="text-muted ml-1" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Last active time, '+moment(row['last_active_ts']).format(DATE_TIME_FORMAT)+'"><i class="fa fa-clock-o"></i></span>'
                }
                if(row['last_call_ts']){
                    tool += ' <span class="text-muted ml-1" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Last call time, '+moment(row['last_call_ts']).format(DATE_TIME_FORMAT)+'"><i class="fa fa-phone"></i></span>'
                }

                var act = '';
                if(!row['is_active']){
                    act = '<br><small class="text-danger"><i class="fa fa-close"></i> Not Activated</small>'
                }


                var tooltip = '<b>Employee Id</b><br>'+row['emp_id']+
                    '<br><b>Designation</b><br>'+row['designation']+
                    '<br><b>Created Time</b><br>'+moment(row['create_ts']).format(DATE_TIME_FORMAT)+
                    '<br><b>Created By</b><br>'+row['created_by']

                var str = '<span data-toggle="tooltip" data-placement="right" title="'+tooltip+'" data-html="true" >'+renderUserStatus(row)+'</span>';

                return img+str+tool+act;
            }
        },
        {
            mData: 'role',
            sTitle: 'Role',
            orderable: false,
            mRender: function (data, type, row) {

                return data;
            }
        },
        {
            mData: 'email_id',
            sTitle: 'Email Id',
            orderable: false,
            mRender: function (data, type, row) {

                return '<a class="text-dark" href="mailto:'+data+'" target="_blank">'+data+'</a>';
            }
        },
        {
            mData: 'formatted_mobile',
            sTitle: 'Mobile #',
            orderable: false,
            mRender: function (data, type, row) {

                return '<a class="text-dark" href="tel:'+data+'" target="_blank">'+data+'</a>';
            }
        },
        {
            mData: 'call_status',
            sTitle: 'Call Status',
            orderable: false,
            mRender: function (data, type, row) {

                return data ? '<span class="text-'+CALL_STATUS[data]+'">'+CALL_STATUS_TEXT[data]+'</span>' : NO_TEXT;
            }
        },
        {
            mData: 'last_updt_ts',
            sTitle: 'Last Updated Time',
            mRender: function (data, type, row) {

                return moment(data).format(DATE_TIME_FORMAT) +' <span class="text-muted" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Updated by, '+row['created_by']+'"><i class="fa fa-info-circle"></i></span>';
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '5%',
            mRender: function (data, type, row) {

                var str = '<div class="btn-group">\n' +
                    '<button type="button" class="btn btn-secondary btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n' +
                    '<i class="fa fa-ellipsis-h"></i> ' +
                    '</button>\n' +
                    '<div class="dropdown-menu" x-placement="bottom-start" style="position: absolute; transform: translate3d(0px, 35px, 0px); top: 0px; left: 0px; will-change: transform;">\n' +
                    ' <a class="dropdown-item" href="javascript:void(0)" onclick="openModal(4,\''+row['_id']+'\')"><i class="fa fa-refresh"></i> Reset Password</a>\n' +
                    ' <a class="dropdown-item" href="javascript:void(0)" onclick="openModal(2,\''+row['_id']+'\')"><i class="fa fa-edit"></i> Edit</a>\n' +
                    ' <a class="dropdown-item" href="javascript:void(0)" onclick="openModal(3,\''+row['_id']+'\')"><i class="fa fa-trash"></i> Delete</a>\n' +
                    '</div>\n' +
                    '</div>'
                return str;
            }
        },

    ];

    var queryParams = {
        query: {
            "bool": {
                "must": [],

            }
        },
        sort: [{"last_updt_ts": {"order": "desc"}}],
        aggs : {
            "status" :{
                "terms" : {
                    field : "status"
                }
            }
        }
    };



    var tableOption = {
        fixedHeader: true,
        responsive: false,
        paging: true,
        searching: true,
        aaSorting: [[5, 'desc']],
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        "oLanguage": {
            sSearchPlaceholder : 'Search',
            "sSearch": "<i class='fa fa-search'></i>",
            "sProcessing": '<i class="fa fa-spinner fa-spin" style="color:#333"></i> Processing',
            "sEmptyTable" : "No data available!",
        },
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": '/admin/list/users',
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            queryParams.query['bool']['must'] = [];
            queryParams.query['bool']['should'] = [];
            delete queryParams.query['bool']["minimum_should_match"];

            var keyName = fields[oSettings.aaSorting[0][0]]

            var sortingJson = {};
            sortingJson[keyName['mData']] = {"order": oSettings.aaSorting[0][1]};
            queryParams.sort = [sortingJson];

            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;

            var searchText = oSettings.oPreviousSearch.sSearch;

            if (searchText) {

                queryParams.query['bool']['should'].push({"wildcard" : { "first_nam" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "last_nam" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "email_id" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "mobile_no" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "call_status" : "*"+searchText.toUpperCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "emp_id" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "role" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "status" : "*"+searchText.toUpperCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "designation" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "description" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']["minimum_should_match"]=1;

            }



            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify({query:queryParams}),
                success: function (data) {


                    var resultData = data.result.data;

                    user_list= resultData.data;

                    $(".totalCount").html(resultData.recordsFiltered);

                    var aggs =data.result.aggregations.status.buckets;

                    var onCount,offCount = 0;
                    for(var i=0;i<aggs.length;i++){
                        if(aggs[i].key === 'ONLINE'){
                            onCount = aggs[i]['doc_count']
                        }
                        if(aggs[i].key === 'OFFLINE'){
                            offCount = aggs[i]['doc_count']
                        }
                    }

                    $("#userStats").sparkline([onCount,offCount], {
                        type: 'pie',
                        sliceColors: ['#00c292','#4b81c2']});

                    setTimeout(function () {
                        $('[data-toggle="tooltip"]').tooltip()
                    },500)
                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    userTable = $("#userTable").DataTable(tableOption);

}


function openModal(type, id) {

    current_role_id = id;

    if(type === 1){
        $("#userModal .modal-title").html('Add New User');
        $("#btnSubmit").html('Add');
        $("#emailId").removeAttr('disabled');
        $("#empId").removeAttr('disabled');

        $("#userModal form").attr('onsubmit','addUser()');
        $("#userModal form")[0].reset();
        if(telePhone){
            telePhone.destroy();
        }

        telePhone = window.intlTelInput(phoneNo, {
            preferredCountries : ['us','in','gb']
            // any initialisation options go here
        });
        $("#roleId").html('<option value=""></option>');

        for(var i=0;i<roles_list.length;i++){
            $("#roleId").append('<option value="'+roles_list[i]['role_nam']+'">'+roles_list[i]['role_nam']+'</option>');
        }

        $("#userModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    }
    else if(type === 2){
        $("#userModal .modal-title").html('Update User');
        $("#btnSubmit").html('Update');
        $("#empId").attr('disabled','disabled');
        $("#emailId").attr('disabled','disabled');
        $("#userModal form").attr('onsubmit','updateUser()');
        $("#userModal form")[0].reset();

        var obj ={};

        current_user_id = id;

        for(var i=0;i<user_list.length;i++){
            if(id === user_list[i]._id){
                obj = user_list[i];
            }
        }

        if(telePhone){
            telePhone.destroy();
        }
        telePhone = window.intlTelInput(phoneNo, {
            initialCountry : obj['country_code'],
            preferredCountries : ['us','in','gb']
            // any initialisation options go here
        });

        $("#roleId").html('<option value=""></option>');

        for(var i=0;i<roles_list.length;i++){
            $("#roleId").append('<option value="'+roles_list[i]['role_nam']+'">'+roles_list[i]['role_nam']+'</option>');
        }

        $("#firstName").val(obj.first_nam);
        $("#lastName").val(obj.last_nam);
        $("#empId").val(obj.emp_id);
        $("#roleId").val(obj.role);
        $("#designation").val(obj.designation);
        $("#emailId").val(obj.email_id);
        $("#phoneNo").val(obj.mobile_no);

        $("#userModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    }
    else if(type === 3){

        var obj ={};
        current_user_id = id;

        for(var i=0;i<user_list.length;i++){
            if(id === user_list[i]._id){
                obj = user_list[i];
            }
        }

        swal({
            title: "Are you sure?",
            text: "["+obj.first_nam+" "+obj.last_nam+"] User will be removed from the application",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        })
            .then(function (result) {
                if (result.value) {

                    $.ajax({
                        url: '/admin/delete/users',
                        data: JSON.stringify({_id:current_user_id}),
                        contentType: "application/json",
                        type: 'POST',
                        success: function (result) {
                            if (result.status) {
                                loadPage();
                                successMsg("User has been removed from the application.")

                            } else {
                                errorMsg('Error in removing user')
                            }
                        },
                        error: function (e) {
                            errorMsg('Something went wrong! Please try again later.')
                        }
                    });

                }
            });
    }
    else if(type === 4){
        var obj ={};
        current_user_id = id;

        for(var i=0;i<user_list.length;i++){
            if(id === user_list[i]._id){
                obj = user_list[i];
            }
        }
        $.ajax({
            url: '/admin/resetpassword/users',
            data: JSON.stringify(obj),
            contentType: "application/json",
            type: 'POST',
            success: function (result) {
                if (result.status) {
                    loadPage();
                    successMsg("User will get an reset password link via email.")

                } else {
                    errorMsg('Error in reseting password')
                }
            },
            error: function (e) {
                errorMsg('Something went wrong! Please try again later.')
            }
        });

    }
    else if(type === 5){}
    else if(type === 6){}

}


function addUser() {

    buttonBlock('btnSubmit');

    var data = {
        first_nam : $.trim($("#firstName").val()),
        last_nam : $.trim($("#lastName").val()),
        emp_id : $("#empId").val(),
        role : $("#roleId").val(),
        designation : $("#designation").val(),
        email_id : $("#emailId").val(),
        mobile_no : $("#phoneNo").val(),
        country_code : telePhone.selectedCountryData.iso2,
        dial_code : telePhone.selectedCountryData.dialCode,
        is_active : false,
        status: 'OFFLINE',
        call_status: 'IN_ACTIVE',
        create_ts : new Date().getTime(),
        last_updt_ts : new Date().getTime(),
        created_by : SESSION_USER,
        last_updt_by : SESSION_USER
    }

    data['formatted_mobile'] = '+'+data['dial_code']+data['mobile_no'];

    $.ajax({
        url: '/admin/add/users',
        data: JSON.stringify(data),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            buttonUnBlock('btnSubmit','Add');
            if (result.status) {
                loadPage();
                $("#userModal").modal('hide');
                successMsg("New users has been created successfully.User will get an activation email.")

            } else {
                if(result.message){
                    errorMsg(result.message)
                }else{
                    errorMsg('Error in creating new user')
                }
            }
        },
        error: function (e) {
            buttonUnBlock('btnSubmit','Add');
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}

function updateUser() {
    buttonBlock('btnSubmit');
    var obj ={};

    for(var i=0;i<user_list.length;i++){
        if(current_user_id === user_list[i]._id){
            obj = user_list[i];
        }
    }

    var data = {
        first_nam : $.trim($("#firstName").val()),
        last_nam : $.trim($("#lastName").val()),
        emp_id : $("#empId").val(),
        role : $("#roleId").val(),
        designation : $("#designation").val(),
        email_id : obj['email_id'],
        country_code : telePhone.selectedCountryData.iso2,
        dial_code : telePhone.selectedCountryData.dialCode,
        mobile_no : $("#phoneNo").val(),
        status: obj['status'],
        call_status: obj['call_status'],
        is_active : obj['is_active'],
        create_ts : obj['create_ts'],
        last_updt_ts : new Date().getTime(),
        created_by : obj['created_by'],
        user_img : obj['user_img'] ? obj['user_img'] : '',
        last_updt_by : SESSION_USER
    }

    data['formatted_mobile'] = '+'+data['dial_code']+data['mobile_no'];

    $.ajax({
        url: '/admin/update/users',
        data: JSON.stringify(data),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            buttonUnBlock('btnSubmit','Update');
            if (result.status) {
                loadPage();
                $("#userModal").modal('hide');
                successMsg("User information has been updated successfully!")

            } else {
                errorMsg('Error in updating user information')
            }
        },
        error: function (e) {
            buttonUnBlock('btnSubmit','Update');
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}