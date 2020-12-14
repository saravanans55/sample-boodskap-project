var versionTable = null;
var version_list = []
var FLAG=0;
var updateEnable=false
var APP_LOGO_ID=""
$(document).ready(function () {

$('#addministrationsLi ul').addClass('in')
    $('.version').addClass('active')
    loadCategoryListFn()
});
function loadPage(){
    loadCategoryListFn()

}

function loadCategoryListFn() {
    if (versionTable) {
        versionTable.destroy();
        $("#versionTable").html("");
    }
    var fields = [
   
        {
            mData: 'version_nam',
            className: 'unsort pl-30',
            title: "Category",

            sWidth: '20%',
            ordering:  false,
            render: function (data, type, row) {
                var str=data
                var string='<img style="width: 30px;height: 30px;border-radius: 50%;margin-right: 5px;" src="https://dev.boodskap.io/api/files/public/download/'+row['img']+'" alt="">'
                return string + data;
            }
        },
        {
            mData: 'brand_nam',
            title: "Brand",
            sWidth: '25%',
            ordering:  false,
            className: 'unsort',
            render: function (data) {
               
                return data ? data : '-';
            }
        },
        {
            title: "Updated By",
            sWidth: '20%',
            mData: 'last_updated_by',

            
            className: 'unsort',
            ordering:  false,
            render: function (data) {
                return data;
            }
        },
        {
            title:"Updated Time",
            sWidth: '20%',
            mData: 'last_update_ts',

            ordering:  true,
            className: ' sortingtable',
            render: function (data, type, row) {
                return row['last_update_ts'] ? moment(row['last_update_ts']).format(DATE_TIME_FORMAT) : '-';

            }
        },
        {
            title: "Action",
            sWidth: '10%',
            className: 'unsort',
            render: function (data, type, row) {
                var str = '<div class="btn-group">\n' +
                '<button type="button" class="btn btn-secondary btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n' +
                '<i class="fa fa-ellipsis-h"></i> ' +
                '</button>\n' +
                '<div class="dropdown-menu" x-placement="bottom-start" style="position: absolute; transform: translate3d(0px, 35px, 0px); top: 0px; right: 0px;left:auto; will-change: transform;">\n' +
                ' <a class="dropdown-item" href="javascript:void(0)" onclick="openModal(2,\''+row['_id']+'\')"><i class="fa fa-edit"></i> Edit</a>\n' +
                ' <a class="dropdown-item" href="javascript:void(0)" onclick="openModal(3,\''+row['_id']+'\')"><i class="fa fa-trash"></i> Delete</a>\n' +
                '</div>\n' +
                '</div>'
                var actions='<button class="btn btn-sm btn-secondary mr-2" onclick="openModal(2,\''+row['_id']+'\')"><i class="fa fa-pencil" aria-hidden="true"></i></button>'+
                '<button class="btn btn-sm btn-secondary" onclick="deleteAccount(\''+row['_id']+'\')"><i class="fa fa-trash" aria-hidden="true"></i></button>'
            return actions;

            }
        }   
    ];

    var queryParams = {
        query: {
            "bool": {
                "must": [],
                // "filter":{"range":{"stamp":{
                //     "gte":new Date(startDate.toISOString()).getTime(),
                //     "lte":new Date(endDate.toISOString()).getTime()
                // }}}
            }
        },
        sort: [{ "last_update_ts": { "order": "desc" } }],
    };

    version_list = [];
    var tableOption = {
        fixedHeader: false,
        responsive: true,
        paging: true,
        searching: true,
        aaSorting: [[3, 'desc']],
        "ordering": true,
        iDisplayLength: 10,
        lengthMenu: [[10, 50, 100], [10, 50, 100]],
        aoColumns: fields,
        "bProcessing": true,
        "language": {
            "emptyTable": "No data found!",
            "processing": '<i class="fa fa-spinner fa-spin" style="color:#333"></i> Processing'
        },
        "bServerSide": true,
        "sAjaxSource": API_URL+"/admin/version/list",
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {
            queryParams.query['bool']['must'] = [];
            queryParams.query['bool']['should'] = [];
            delete queryParams.query['bool']["minimum_should_match"];
            var keyName = fields[oSettings.aaSorting[0][0]]
            var sortingJson = {};
            sortingJson[keyName['mData']] = { "order": oSettings.aaSorting[0][1] };
            queryParams.sort = [sortingJson];
            queryParams['size'] = oSettings._iDisplayLength;
            queryParams['from'] = oSettings._iDisplayStart;
            var searchText = oSettings.oPreviousSearch.sSearch.trim();
            searchText=searchText.trim()
            if (searchText) {
                queryParams.query['bool']['should'].push({ "wildcard": { "version_nam": "*" + searchText + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "version_nam": "*" + searchText.toLowerCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "version_nam": "*" + searchText.toUpperCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "version_nam": "*" + capitalizeFLetter(searchText) + "*" } })
                queryParams.query['bool']["minimum_should_match"] = 1;
                queryParams.query['bool']['should'].push({
                "match_phrase": {
                "version_nam.keyword": "*" + searchText + "*"
                }
                })
                queryParams.query['bool']['should'].push({
                "match_phrase_prefix": {
                "version_nam.keyword": {
                "query": "*" + searchText + "*"
                }
                }
                })
              
            }
            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "headers": {
                    "Authorization": "Basic WVFIV0NXTFZXVToxZjcwNzMxNi1hYWFlLTRjMGUtOTg1OC0xNWE4MTBjNDk4Njc="
                },
                "url": sSource,
             
                "data": JSON.stringify(queryParams),
                success: function (data) {
                    var resultData = data.data;
                    version_list = resultData.data;
                    $('#deviceTypeCount').html(data.total)
                    resultData['draw'] = oSettings.iDraw;
                    fnCallback(resultData);
                }
            });
        },
        "initComplete": function (settings, json) {
        }
    };
    versionTable = $("#versionTable").DataTable(tableOption);
}

function openModal(type,obj){
    if(type===1){
        $('#actionsModal').modal({
            backdrop: 'static',
            keyboard: false
            })
            $("#createDeviceTypeForm")[0].reset();
            $("#createDeviceTypeForm").attr('onsubmit', 'entityAddFn()')
            $('#submitBtn').html('Confirm')
            $('#submitBtn').prop('disabled', false)
    }

}
function deleteAccount(id){
    console.log(id)
    swal({
        title: "Are you sure?",
        text: "Version will be removed from the Domain",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
    })
        .then(function (result) {
            if (result.value) {
                var deleteObj = {
                    key: id,
                  
                };
                $.ajax({
                    url: API_URL+"/admin/version/delete",
                    data: JSON.stringify(deleteObj),
                    contentType: "application/json",
                    type: 'POST',
                    "headers": {
                        "Authorization": "Basic WVFIV0NXTFZXVToxZjcwNzMxNi1hYWFlLTRjMGUtOTg1OC0xNWE4MTBjNDk4Njc="
                    },
                    success: function (response) {
                        if (response.status) {



                            swal({
                                title: "Success",
                                text: "Version Deleted Successfully!",
                                type: "success",
                                confirmButtonClass: "btn-success",
                                confirmButtonText: "Ok"
                            })
                                .then(function (result) {
                                    if (result.value) {
                                        loadCategoryListFn();
                                    }
                                })
                        }
                    },
                    error: function (err) {
                    }
                })
            }
        })
}
function employeeFileUpload() {
    var fileInput = document.getElementById("empInputFile");
    var files = fileInput.files;
    var file = files[0];
console.log(files)
    var filename = files[0].name;
    var ext = filename.split(".");
    ext = ext[ext.length - 1].toLowerCase();
    if (ext === "xlsx") {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {

                    var resObj = JSON.parse(xhr.response);
                    successMsg('File uploaded Successfully!');
                    setTimeout(function () {
                        loadPlaceListFn()
                    }, 500)
                } else {
                    errorMsg('Something went wrong! Please try again later.')
                }
            }
        };
        xhr.open('POST', API_URL+'/file/import', true);
        var formData = new FormData();
        formData.append('file', file);
        // formData.append("AuthToken", "3d2bbd37-1341-4355-b45f-1a4d700c25c3");
        // formData.append("Content-Type", "application/x-www-form-urlencoded");
        // "Authorization": "Basic WVFIV0NXTFZXVToxZjcwNzMxNi1hYWFlLTRjMGUtOTg1OC0xNWE4MTBjNDk4Njc="
        xhr.setRequestHeader("Authorization", "Basic WVFIV0NXTFZXVToxZjcwNzMxNi1hYWFlLTRjMGUtOTg1OC0xNWE4MTBjNDk4Njc=");
        xhr.send(formData);
    } else {
        errorMsg('Something went wrong! Please try again later.')
    }
}        