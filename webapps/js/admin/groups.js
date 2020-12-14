var groupTable = null;

$(document).ready(function () {
   loadPage();


});


function loadPage() {

    if (groupTable) {
        groupTable.destroy();
        $("#groupTable").html("");
    }

    var fields = [
        {
            sTitle: 'Details',
            "className": 'details-control',
            "orderable": false,
            sWidth: '5%',
            "data": null,
            "defaultContent": ''
        },
        {
            mData: 'group_nam',
            sTitle: 'Group Name',
            sWidth: '25%',
            orderable: false,
            mRender: function (data, type, row) {

                return data +' <button class="btn btn-sm btn-secondary pull-right" onclick="openModal(4,\''+row['_id']+'\')"><i class="icon-people"></i></button>';
            }
        },
        {
            mData: 'description',
            sTitle: 'Description',
            sWidth: '30%',
            orderable: false,
            mRender: function (data, type, row) {

                return data;
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
            mData: 'create_ts',
            sTitle: 'Created Time',
            mRender: function (data, type, row) {

                return moment(data).format(DATE_TIME_FORMAT) +' <span class="text-muted"  data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Created by, '+row['created_by']+'"><i class="fa fa-info-circle"></i></span>';
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
    };



    var tableOption = {
        fixedHeader: true,
        responsive: false,
        paging: true,
        searching: true,
        aaSorting: [[3, 'desc']],
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        "oLanguage": {
            sSearchPlaceholder : 'Search by group name',
            "sSearch": "<i class='fa fa-search'></i>",
            "sProcessing": '<i class="fa fa-spinner fa-spin" style="color:#333"></i> Processing',
            "sEmptyTable" : "No data available!",
        },
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": '/admin/list/groups',
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

                queryParams.query['bool']['should'].push({"wildcard" : { "group_nam" : "*"+searchText.toLowerCase()+"*" }})
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
                    $(".totalCount").html(resultData.recordsFiltered)
                    group_list = resultData.data;
                    setTimeout(function () {
                        $('[data-toggle="tooltip"]').tooltip()
                    },500)

                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    groupTable = $("#groupTable").DataTable(tableOption);

    $('#groupTable tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = groupTable.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        } else {
            var obj = row.data();
            row.child(format(obj)).show();
            tr.addClass('shown');
            setTimeout(function () {
                loadGroupUsers(obj)
            },100)

        }
    });



}


function format(obj) {

    var str = '<div class="row">' +
        '<div class="col-md-12 mb-2"> ' +
        '<p class="mb-0">Total Count: <strong class="totalCount_'+obj._id+'"></strong></p>' +
        '<div class="table-responsive">' +
        '<table id="groupTable_'+obj._id+'" class="display nowrap table table-bordered nestedTable" cellspacing="0" width="100%">\n' +
        '</table>\n' +
        '</div>' +
        '</div> ' +
        '</div>';
    return str;
}

var groupObj = {};

function loadGroupUsers(obj) {

    if (groupObj[obj._id]) {
        groupObj[obj._id].destroy();
        $("#groupTable_"+obj._id).html("");
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
                    imgUrl = renderImgUrl(row['user_img']);
                }
                var img = '<img src="'+imgUrl+'" class="user_bg"/>'

                var str = '<span>'+renderUserStatus(row)+'</span>';

                return img+str;
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
            mData: 'create_ts',
            sTitle: 'Added Time',
            mRender: function (data, type, row) {

                return moment(data).format(DATE_TIME_FORMAT);
            }
        },
        {
            mData: 'action',
            sTitle: 'Action',
            orderable: false,
            sWidth: '5%',
            mRender: function (data, type, row) {

                return '<button class="btn btn-sm btn-secondary" onclick="unAssignUser(\''+row['group_id']+'\',\''+row['_id']+'\')"><i class="fa fa-unlink"></i></button>';
            }
        },

    ];

    var queryParams = {
        query: {
            "bool": {
                "must": [{match:{group_id:obj._id}}],

            }
        },
        sort: [{"create_ts": {"order": "desc"}}],
    };



    var tableOption = {
        fixedHeader: true,
        responsive: false,
        paging: true,
        searching: true,
        aaSorting: [[3, 'desc']],
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
        "sAjaxSource": '/admin/userlist/groups',
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

                    $(".totalCount_"+obj._id).html(resultData.recordsFiltered);

                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    groupObj[obj._id] = $("#groupTable_"+obj._id).DataTable(tableOption);

}


var current_group_id = null;
var current_group_obj = {};
var group_list = [];


function openModal(type, id) {

    current_group_id = id;

    if(type === 1){
        $("#groupModal .modal-title").html('Add New Group');
        $("#btnSubmit").html('Add');
        $("#groupName").removeAttr('disabled');
        $("#groupModal form").attr('onsubmit','createGroup()');
        $("#groupModal form")[0].reset();
        $("#groupModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    } else if(type === 2){
        $("#groupModal .modal-title").html('Update Group');
        $("#btnSubmit").html('Update');
        $("#groupName").attr('disabled','disabled');
        $("#groupModal form").attr('onsubmit','updateGroup()');
        $("#groupModal form")[0].reset();
        var obj ={};

        current_group_id = id;

        for(var i=0;i<group_list.length;i++){
            if(id === group_list[i]._id){
                obj = group_list[i];
            }
        }

        $("#groupName").val(obj.group_nam);
        $("#description").val(obj.description);

        $("#groupModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    } else if(type === 3){

        var obj ={};
        current_group_id = id;

        for(var i=0;i<group_list.length;i++){
            if(id === group_list[i]._id){
                obj = group_list[i];
            }
        }

        swal({
            title: "Are you sure?",
            text: "["+obj.group_nam+"] Group will be removed from the application",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        })
            .then(function (result) {
                if (result.value) {

                    $.ajax({
                        url: '/admin/delete/groups',
                        data: JSON.stringify({_id:current_group_id}),
                        contentType: "application/json",
                        type: 'POST',
                        success: function (result) {
                            if (result.status) {
                                loadPage();
                                successMsg("Group has been removed from the application.")

                            } else {
                                errorMsg('Error in removing group')
                            }
                        },
                        error: function (e) {
                            errorMsg('Something went wrong! Please try again later.')
                        }
                    });

                }
            });
    } else if(type === 4){

        current_group_obj ={};

        current_group_id = id;

        for(var i=0;i<group_list.length;i++){
            if(id === group_list[i]._id){
                current_group_obj = group_list[i];
            }
        }

        $(".groupName").html(current_group_obj.group_nam)

        // loadUsers();

        $("#userListModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    }

}

function createGroup() {

    buttonBlock('btnSubmit');

    var data = {
        group_nam : $.trim($("#groupName").val()),
        description : $("#description").val(),
        is_active : true,
        create_ts : new Date().getTime(),
        last_updt_ts : new Date().getTime(),
        created_by : SESSION_USER,
        last_updt_by : SESSION_USER
    }

    $.ajax({
        url: '/admin/add/groups',
        data: JSON.stringify({insertData:data}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            buttonUnBlock('btnSubmit','Add');
            if (result.status) {
                loadPage();
                $("#groupModal").modal('hide');
                successMsg("New group has been created successfully!")

            } else {
                errorMsg('Error in creating new group')
            }
        },
        error: function (e) {
            buttonUnBlock('btnSubmit','Add');
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}

function updateGroup() {
    buttonBlock('btnSubmit');
    var obj ={};

    for(var i=0;i<group_list.length;i++){
        if(current_group_id === group_list[i]._id){
            obj = group_list[i];
        }
    }

    var data = {
        group_nam : obj['group_nam'],
        description : $("#description").val(),
        is_active : obj['is_active'],
        create_ts : obj['create_ts'],
        last_updt_ts : new Date().getTime(),
        created_by : obj['created_by'],
        last_updt_by : SESSION_USER
    }

    $.ajax({
        url: '/admin/update/groups',
        data: JSON.stringify({updateData:data,_id:current_group_id}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            buttonUnBlock('btnSubmit','Update');
            if (result.status) {
                loadPage();
                $("#groupModal").modal('hide');
                successMsg("Group has been updated successfully!")

            } else {
                errorMsg('Error in updating role')
            }
        },
        error: function (e) {
            buttonUnBlock('btnSubmit','Update');
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}


var userTable = null;
var user_list = [];

function loadUsers() {

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
                    imgUrl = renderImgUrl(row['user_img']);
                }
                var img = '<img src="'+imgUrl+'" class="user_bg"/>'

                var tooltip = '<b>Employee Id</b><br>'+row['emp_id']+
                    '<br><b>Designation</b><br>'+row['designation']

                var str = '<span data-toggle="tooltip" data-placement="right" title="'+tooltip+'" data-html="true" >'+row['first_nam']+' '+row['last_nam']+'</span>';

                return img+str+'<br><small><i class="fa fa-user-secret"></i> '+row['role']+'</small>';
            }
        },
        {
            mData: 'email_id',
            sTitle: 'Email & Mobile #',
            orderable: false,
            mRender: function (data, type, row) {

                return '<a class="text-dark" href="mailto:'+data+'" target="_blank"><i class="icon-envelope"></i> '+data+'</a><br>' +
                    '<a class="text-dark" href="tel:'+row['formatted_mobile']+'" target="_blank"><i class="icon-phone"></i> '+row['formatted_mobile']+'</a>';
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

                return '<button class="btn btn-sm btn-secondary" onclick="assignUser(\''+row._id+'\')"><i class="icon-plus"></i> Add</button>';
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
    };



    var tableOption = {
        fixedHeader: true,
        responsive: false,
        paging: true,
        searching: true,
        aaSorting: [[2, 'desc']],
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

                    $(".totalUsersCount").html(resultData.recordsFiltered);

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

function assignUser(id) {

    var userObj = {};

    for(var i=0;i<user_list.length;i++){
        if(id === user_list[i]._id){
            userObj = user_list[i];
        }
    }

    checkAssignedUser(current_group_id, id ,function (status) {
        if(!status) {

            var data = {
                email_id: userObj.email_id,
                user_img: userObj.user_img,
                first_nam: userObj.first_nam,
                formatted_mobile: userObj.formatted_mobile,
                group_id: current_group_obj._id,
                last_nam: userObj.last_nam,
                mobile_no: userObj.mobile_no,
                create_ts: new Date().getTime(),
                created_by: SESSION_USER,
            }

            $.ajax({
                url: '/admin/adduser/groups',
                data: JSON.stringify({insertData: data}),
                contentType: "application/json",
                type: 'POST',
                success: function (result) {
                    if (result.status) {
                        loadGroupUsers({_id:current_group_id})
                        successMsg("User has been added successfully!")

                    } else {
                        errorMsg('Error in adding user to this group')
                    }
                },
                error: function (e) {
                    errorMsg('Something went wrong! Please try again later.')
                }
            });
        }else{
            warningMsg('User already exists in this group')
        }
    })

}

function checkAssignedUser(gid, uid, cbk) {

    var queryParams = {
        query :  {
            bool : {
                must : [{match:{group_id:gid}},{match:{email_id:uid}}]
            }
        },size:1
    }


    $.ajax({
        url: '/admin/userlist/groups',
        data: JSON.stringify({query:queryParams}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            if (result.status && result.result && result.result.total > 0) {
                cbk(true);

            } else {
                cbk(false);
            }
        },
        error: function (e) {
            cbk(false);
        }
    });


}

function unAssignUser(gid,id) {

    $.ajax({
        url: '/admin/deleteuser/groups',
        data: JSON.stringify({_id:id}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            if (result.status) {
                loadGroupUsers({_id:gid})
                successMsg("Successfully user has been removed from this group!")

            } else {
                errorMsg('Error in removing user from the group')
            }
        },
        error: function (e) {
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}