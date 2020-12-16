var StudentTable = null;
var student_list = [];
// var startDate = moment().subtract(6, 'days').startOf('day');
// var endDate = moment().endOf('day');
$(document).ready(function(){
    loadStudentList();
});

//Student Registration API
function studentRegistration(){

    var sname = $("#sname").val();
    var department = $("#department").val();
    var location = $("#location").val();

    //Validate
    if(sname === ""){

        alert("Student Name is Required!");

    }else if(department === ""){

        alert("Department is Required!");

    }else if(location === ""){

        alert("Location is Required!");

    }else{

        //Build Input Objects
        var inputObj = {
            sname : sname,
            location : location,
            department : department,
            created_ts : new Date().getTime()
        };

        //Call API
        $.ajax({
            url: BASE_PATH+"/student/insert",
            data: JSON.stringify(inputObj),
            contentType: "application/json",
            type: 'POST',
            success: function (result) {

                //Success -> Show Alert & Refresh the page
                successMsg("Registration Completed Successfully!");
                loadStudentList();
            },
            error: function (e) {

                //Error -> Show Error Alert & Reset the form
                errorMsg("Registration Failed!");
                window.location.reload();
            }
        });
    }
}

//Student List API
function loadStudentList() {

    if (StudentTable) {
        StudentTable.destroy();
        $("#student_table").html("");
    }

    var fields = [
        {
            mData: 'sname',
            sTitle: 'Student Name',
            sWidth: '20%',
            orderable: false,
            mRender: function (data, type, row) {
                return data;
            }
        },
        {
            mData: 'location',
            sTitle: 'Location',
            sWidth: '20%',
            orderable: false,
            mRender: function (data, type, row) {
                return data;
            }
        },

        {
            mData: 'department',
            sWidth: '20%',
            sTitle: 'Department',
            orderable: false,
            mRender: function (data, type, row) {
                return data;
            }
        },
        {
            mData: 'created_ts',
            sTitle: 'Created Time',
            "className": 'sortingtable',
            mRender: function (data, type, row) {
                return moment(data).format(DATE_TIME_FORMAT);
            }
        },
        {
            sTitle: 'Actions',
            orderable: false,
            mRender: function (data, type, row) {
                var actionsHtml = '<button class="btn btn-default" onclick="deleteStudent()"><i class="fa fa-trash"></i></button>';
                return actionsHtml;
            }
        }
    ];

    var queryParams = {
        query: {
            "bool": {
                "must": []
            }
        },
        sort: [{ "created_ts": { "order": "asc" } }]
    };

    student_list = [];

    var tableOption = {
        fixedHeader: false,
        responsive: false,
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
        "sAjaxSource": BASE_PATH+'/student/list',
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

            // queryParams.query['bool']['must'].push({ "match": { "acc_id":SESSION_OBJ.orgs[0]  } });

            var searchText = oSettings.oPreviousSearch.sSearch.trim();

            if (searchText) {
                queryParams.query['bool']['should'].push({ "wildcard": { "sname": "*" + searchText + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "sname": "*" + searchText.toLowerCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "sname": "*" + searchText.toUpperCase() + "*" } });
                queryParams.query['bool']['should'].push({ "wildcard": { "sname": "*" + capitalizeFLetter(searchText) + "*" } })
                queryParams.query['bool']["minimum_should_match"] = 1;
                queryParams.query['bool']['should'].push({
                    "match_phrase": {
                        "sname.keyword": "*" + searchText + "*"
                    }
                })
                queryParams.query['bool']['should'].push({
                    "match_phrase_prefix": {
                        "sname.keyword": {
                            "query": "*" + searchText + "*"
                        }
                    }
                });
            }

            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify({"query":queryParams}),
                success: function (data) {

                    var resultData = data.result.data;

                    student_list = resultData.data;

                    $(".totalCount").html(data.result.total)

                    resultData['draw'] = oSettings.iDraw;
                    fnCallback(resultData);
                }
            });
        },
        "initComplete": function (settings, json) {
        }
    };

    StudentTable = $("#student_table").DataTable(tableOption);
}

