var customerTable = null;

var current_customer_id = null;
var customer_list = [];
var telePhone = null
var phoneNo = document.querySelector("#phoneNo");
$(document).ready(function () {
    loadPage();

});

function loadPage() {

    if (customerTable) {
        customerTable.destroy();
        $("#customerTable").html("");
    }

    var fields = [
        {
            mData: 'first_nam',
            sTitle: 'Full Name',
            sWidth: '25%',
            orderable: false,
            mRender: function (data, type, row) {
                var imgUrl = DEFAULT_USR_IMG;

                var img = '<img src="'+imgUrl+'" class="user_bg"/>'

                var tooltip = '<b>Created Time</b><br>'+moment(row['create_ts']).format(DATE_TIME_FORMAT)+
                    '<br><b>Created By</b><br>'+row['created_by']

                var str = '<span data-toggle="tooltip" data-placement="right" title="'+tooltip+'" data-html="true" >'+row['first_nam']+' '+row['last_nam']+'</span>';

                return img+str;
            }
        },
        {
            mData: 'email_id',
            sTitle: 'Email Id',
            sWidth: '20%',
            orderable: false,
            mRender: function (data, type, row) {

                return '<a class="text-dark" href="mailto:'+data+'" target="_blank">'+data+'</a>';
            }
        },
        {
            mData: 'formatted_mobile',
            sTitle: 'Mobile #',
            sWidth: '20%',
            orderable: false,
            mRender: function (data, type, row) {

                return '<a class="text-dark" href="tel:'+data+'" target="_blank">'+data+'</a>';
            }
        },
        {
            mData: 'last_updt_ts',
            sTitle: 'Last Updated Time',
            mRender: function (data, type, row) {

                return moment(data).format(DATE_TIME_FORMAT) +' <span class="text-muted" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Updated by, '+row['last_updt_by']+'"><i class="fa fa-info-circle"></i></span>';
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
            sSearchPlaceholder : 'Search',
            "sSearch": "<i class='fa fa-search'></i>",
            "sProcessing": '<i class="fa fa-spinner fa-spin" style="color:#333"></i> Processing',
            "sEmptyTable" : "No data available!",
        },
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": '/admin/list/customers',
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

                    customer_list= resultData.data;

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

    customerTable = $("#customerTable").DataTable(tableOption);

}


function openModal(type, id) {

    if(type === 1){
        $("#userModal .modal-title").html('Add New Customer');
        $("#btnSubmit").html('Add');

        $("#userModal form").attr('onsubmit','addCustomer()');
        $("#userModal form")[0].reset();
        if(telePhone){
            telePhone.destroy();
        }

        telePhone = window.intlTelInput(phoneNo, {
            preferredCountries : ['us','in','gb']
            // any initialisation options go here
        });

        $("#userModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    }
    else if(type === 2){
        $("#userModal .modal-title").html('Update Customer');
        $("#btnSubmit").html('Update');
        $("#userModal form").attr('onsubmit','updateCustomer()');
        $("#userModal form")[0].reset();

        var obj ={};

        current_customer_id = id;

        for(var i=0;i<customer_list.length;i++){
            if(id === customer_list[i]._id){
                obj = customer_list[i];
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

        $("#firstName").val(obj.first_nam);
        $("#lastName").val(obj.last_nam);
        $("#emailId").val(obj.email_id);
        $("#phoneNo").val(obj.mobile_no);

        $("#userModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    }
    else if(type === 3){

        var obj ={};
        current_customer_id = id;

        for(var i=0;i<customer_list.length;i++){
            if(id === customer_list[i]._id){
                obj = customer_list[i];
            }
        }

        swal({
            title: "Are you sure?",
            text: "["+obj.first_nam+" "+obj.last_nam+"] Customer will be removed from the application",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        })
            .then(function (result) {
                if (result.value) {

                    $.ajax({
                        url: '/admin/delete/customers',
                        data: JSON.stringify({_id:current_customer_id}),
                        contentType: "application/json",
                        type: 'POST',
                        success: function (result) {
                            if (result.status) {
                                loadPage();
                                successMsg("Customer has been removed from the application.")

                            } else {
                                errorMsg('Error in removing customer')
                            }
                        },
                        error: function (e) {
                            errorMsg('Something went wrong! Please try again later.')
                        }
                    });

                }
            });
    }
    else if(type === 5){}
    else if(type === 6){}

}


function addCustomer() {

    buttonBlock('btnSubmit');

    var data = {
        first_nam : $.trim($("#firstName").val()),
        last_nam : $.trim($("#lastName").val()),
        email_id : $("#emailId").val(),
        mobile_no : $("#phoneNo").val(),
        country_code : telePhone.selectedCountryData.iso2,
        dial_code : telePhone.selectedCountryData.dialCode,
        create_ts : new Date().getTime(),
        last_updt_ts : new Date().getTime(),
        created_by : SESSION_USER,
        last_updt_by : SESSION_USER
    }

    data['formatted_mobile'] = '+'+data['dial_code']+data['mobile_no'];

    $.ajax({
        url: '/admin/add/customers',
        data: JSON.stringify({insertData:data}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            buttonUnBlock('btnSubmit','Add');
            if (result.status) {
                loadPage();
                $("#userModal").modal('hide');
                successMsg("New Customer has been added successfully.")

            } else {
                errorMsg('Error in creating new customer')
            }
        },
        error: function (e) {
            buttonUnBlock('btnSubmit','Add');
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}

function updateCustomer() {
    buttonBlock('btnSubmit');
    var obj ={};

    for(var i=0;i<customer_list.length;i++){
        if(current_customer_id === customer_list[i]._id){
            obj = customer_list[i];
        }
    }

    var data = {
        first_nam : $.trim($("#firstName").val()),
        last_nam : $.trim($("#lastName").val()),
        email_id : $("#emailId").val(),
        country_code : telePhone.selectedCountryData.iso2,
        dial_code : telePhone.selectedCountryData.dialCode,
        mobile_no : $("#phoneNo").val(),
        create_ts : obj['create_ts'],
        last_updt_ts : new Date().getTime(),
        created_by : obj['created_by'],
        last_updt_by : SESSION_USER
    }

    data['formatted_mobile'] = '+'+data['dial_code']+data['mobile_no'];

    $.ajax({
        url: '/admin/update/customers',
        data: JSON.stringify({updateData:data,_id:current_customer_id}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            buttonUnBlock('btnSubmit','Update');
            if (result.status) {
                loadPage();
                $("#userModal").modal('hide');
                successMsg("Customer information has been updated successfully!")

            } else {
                errorMsg('Error in updating customer information')
            }
        },
        error: function (e) {
            buttonUnBlock('btnSubmit','Update');
            errorMsg('Something went wrong! Please try again later.')
        }
    });
}