var roleTable = null;

$(document).ready(function () {
   loadPage();
});


function loadPage() {

    if (roleTable) {
        roleTable.destroy();
        $("#roleTable").html("");
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
            mData: 'role_nam',
            sTitle: 'Role Name',
            sWidth: '25%',
            orderable: false,
            mRender: function (data, type, row) {

                return data;
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
                if(row['role_nam'] == 'Organization Admin'){
                    str = '';
                }
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
            "sSearch": "<i class='fa fa-search'></i>",
            "sProcessing": '<i class="fa fa-spinner fa-spin" style="color:#333"></i> Processing',
            "sEmptyTable" : "No data available!",
        },
        "bProcessing": true,
        "language": {
            // "emptyTable": "No data found!",
        },
        "bServerSide": true,
        "sAjaxSource": '/admin/list/roles',
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

                queryParams.query['bool']['should'].push({"wildcard" : { "role_nam" : "*"+searchText.toLowerCase()+"*" }})
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

                    role_list= resultData.data;

                    $(".totalCount").html(resultData.recordsFiltered);

                    setTimeout(function () {
                        $('[data-toggle="tooltip"]').tooltip()
                    },500)

                    resultData['draw'] = oSettings.iDraw;

                    fnCallback(resultData);
                }
            });
        }

    };

    roleTable = $("#roleTable").DataTable(tableOption);

    $('#roleTable tbody').on('click', 'td.details-control', function () {
    var tr = $(this).closest('tr');
    var row = roleTable.row(tr);

    if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
    } else {
        var obj = row.data();
        row.child(format(obj)).show();
        tr.addClass('shown');
        setTimeout(function () {
            renderRoleAuth(obj)
        },100)

    }
});
}


function format(obj) {

    var defaultAuth = true;

    if(obj.role_nam === 'Organization Admin'){
        defaultAuth = false;
    }

    var str = '<div class="row">' +
        '<div class="col-md-12 mb-2"> ' +
        (defaultAuth ? '<button class="btn btn-sm btn-primary pull-right" id="btn_'+obj._id+'" onclick="updateRoleAuth(\''+obj._id+'\')">Save Authorization</button>' : '<small>Note: Default role authorization update is restricted.</small>') +
        '</div><div class="col-md-12" style="">' +
        '<select multiple="" id="role_auth_'+obj._id+'" name="'+obj._id+'[]" style="width: 100%;border:1px solid #eee"></select>'+
        '</div> ' +
        '</div>';
    return str;
}

var current_role_id = null;
var role_list = [];


function openModal(type, id) {

    current_role_id = id;

    if(type === 1){
        $("#roleModal .modal-title").html('Add New Role');
        $("#btnSubmit").html('Add');
        $("#roleName").removeAttr('disabled');
        $("#roleModal form").attr('onsubmit','createRole()');
        $("#roleModal form")[0].reset();
        $("#roleModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    } else if(type === 2){
        $("#roleModal .modal-title").html('Update Role');
        $("#btnSubmit").html('Update');
        $("#roleName").attr('disabled','disabled');
        $("#roleModal form").attr('onsubmit','updateRole()');
        $("#roleModal form")[0].reset();
        var obj ={};

        current_role_id = id;

        for(var i=0;i<role_list.length;i++){
            if(id === role_list[i]._id){
                obj = role_list[i];
            }
        }

        $("#roleName").val(obj.role_nam);
        $("#description").val(obj.description);

        $("#roleModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    } else if(type === 3){

        var obj ={};
        current_role_id = id;

        for(var i=0;i<role_list.length;i++){
            if(id === role_list[i]._id){
                obj = role_list[i];
            }
        }

        swal({
            title: "Are you sure?",
            text: "["+obj.role_nam+"] Role will be removed from the application",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        })
            .then(function (result) {
                if (result.value) {
                    
                    $.ajax({
                        url: '/admin/delete/roles',
                        data: JSON.stringify({_id:current_role_id}),
                        contentType: "application/json",
                        type: 'POST',
                        success: function (result) {
                            if (result.status) {
                                loadPage();
                                successMsg("Role has been removed from the application.")

                            } else {
                                errorMsg('Error in removing role')
                            }
                        },
                        error: function (e) {
                            errorMsg('Something went wrong! Please try again later.')
                        }
                    });

                }
            });
    }

}

function createRole() {

    buttonBlock('btnSubmit');

    var data = {
        role_nam : $.trim($("#roleName").val()),
        description : $("#description").val(),
        is_active : true,
        create_ts : new Date().getTime(),
        last_updt_ts : new Date().getTime(),
        created_by : SESSION_USER,
        last_updt_by : SESSION_USER
    }

    $.ajax({
        url: '/admin/add/roles',
        data: JSON.stringify({insertData:data}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            buttonUnBlock('btnSubmit','Add');
            if (result.status) {
                loadPage();
                $("#roleModal").modal('hide');
                successMsg("New role has been created successfully!")

            } else {
                errorMsg('Error in creating new role')
            }
        },
        error: function (e) {
            buttonUnBlock('btnSubmit','Add');
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}

function updateRole() {
    buttonBlock('btnSubmit');
    var obj ={};

    for(var i=0;i<role_list.length;i++){
        if(current_role_id === role_list[i]._id){
            obj = role_list[i];
        }
    }

    var data = {
        role_nam : obj['role_nam'],
        // role_nam : $.trim($("#roleName").val()),
        description : $("#description").val(),
        is_active : obj['is_active'],
        create_ts : obj['create_ts'],
        last_updt_ts : new Date().getTime(),
        created_by : obj['created_by'],
        last_updt_by : SESSION_USER
    }

    $.ajax({
        url: '/admin/update/roles',
        data: JSON.stringify({updateData:data,_id:current_role_id}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            buttonUnBlock('btnSubmit','Update');
            if (result.status) {
                loadPage();
                $("#roleModal").modal('hide');
                successMsg("Role has been updated successfully!")

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

function updateRoleAuth(id) {

    var obj ={};

    for(var i=0;i<role_list.length;i++){
        if(id === role_list[i]._id){
            obj = role_list[i];
        }
    }

    buttonBlock('btn_'+obj._id);

    var data = {
        role_nam : obj['role_nam'],
        auth : role_auth_obj[obj._id],
        description : obj['description'],
        is_active : obj['is_active'],
        create_ts : obj['create_ts'],
        last_updt_ts : new Date().getTime(),
        created_by : obj['created_by'],
        last_updt_by : SESSION_USER
    }

    $.ajax({
        url: '/admin/update/roles',
        data: JSON.stringify({updateData:data,_id:id}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            buttonUnBlock('btn_'+obj._id,'Save Authorization');
            if (result.status) {
                loadPage();
                successMsg("Authorization has been updated successfully!")
            } else {
                errorMsg('Error in updating role authorization')
            }
        },
        error: function (e) {
            buttonUnBlock('btn_'+obj._id,'Save Authorization');
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}

var role_auth_obj = {};

function renderRoleAuth(obj) {

    var auth_str = '';

    role_auth_obj[obj._id] = obj.auth ? obj.auth : [];

    var disableFlag = '';

    if(obj.role_nam === 'Organization Admin'){
        disableFlag = 'selected disabled'
    }

    for(var auth in ROLE_AUTH_LIST){
        auth_str+= '<optgroup label="'+auth+'">'
        for(var i=0;i<ROLE_AUTH_LIST[auth].length;i++){
            auth_str+='<option value="'+ROLE_AUTH_LIST[auth][i]+'" '+disableFlag+'>'+ROLE_AUTH_LIST[auth][i]+'</option>'
        }
        auth_str+='</optgroup>'
    }

    $('#role_auth_'+obj._id).html(auth_str);

    $('#role_auth_'+obj._id).multiSelect({
        selectableOptgroup: true,
        afterSelect: function(values,id){
            role_auth_obj[obj._id].push(values[0]);
            role_auth_obj[obj._id] = _.uniq(role_auth_obj[obj._id]);
        },
        afterDeselect: function(values){

            var tmp = [];

            for(var i=0;i<role_auth_obj[obj._id].length;i++){
                if(values[0] != role_auth_obj[obj._id][i]){
                    tmp.push(role_auth_obj[obj._id][i])
                }
            }
            role_auth_obj[obj._id] = tmp;
        }
    });
    $('#role_auth_'+obj._id).multiSelect('select',role_auth_obj[obj._id]);

}