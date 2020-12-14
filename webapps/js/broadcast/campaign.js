var campaignTable = null;

var current_campaign_id = null;
var campaign_list = [];
$(document).ready(function () {
    loadPage();
    loadWalletAmount();

});

function loadPage() {

    if (campaignTable) {
        campaignTable.destroy();
        $("#campaignTable").html("");
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
            mData: 'campaign_nam',
            sTitle: 'Campaign Name',
            // sWidth: '20%',
            orderable: false,
            mRender: function (data, type, row) {

                return data;
            }
        },
        {
            mData: 'feed_type',
            sTitle: 'Mode',
            orderable: false,
            mRender: function (data, type, row) {
                return renderMode(data);
            }
        },
        {
            mData: 'broadcast_type',
            sTitle: 'Broadcast Type',
            orderable: false,
            mRender: function (data, type, row) {

                return data === 1 ? '<strong class="text-primary">ADHOC</strong>' : '<strong class="text-primary">SCHEDULED</strong>';
            }
        },
        {
            mData: 'msg_count',
            sTitle: 'Count',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : NO_TEXT;
            }
        },
        {
            mData: 'status',
            sTitle: 'Status',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? '<span class="text-primary" style="text-transform: uppercase">'+data+'</span>' : NO_TEXT;
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
            mData: 'broadcast_millis',
            sTitle: 'Broadcast Time',
            mRender: function (data, type, row) {

                return moment(row['broadcast_millis']).format(DATE_TIME_FORMAT)+(row['timezone'] ? ' <span class="text-muted" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Timezone: '+row['timezone']+'"><i class="fa fa-globe"></i></span>':'');
            }
        }

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
        fixedHeader: false,
        responsive: false,
        paging: true,
        searching: true,
        aaSorting: [[6, 'desc']],
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
        "sAjaxSource": '/broadcast/listcampaign',
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

                queryParams.query['bool']['should'].push({"wildcard" : { "campaign_nam" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "body_content" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "subject" : "*"+searchText.toLowerCase()+"*" }})
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

                    campaign_list= resultData.data;

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

    campaignTable = $("#campaignTable").DataTable(tableOption);

    $('#campaignTable tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = campaignTable.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        } else {
            var obj = row.data();
            row.child(format(obj)).show();
            tr.addClass('shown');
            setTimeout(function () {
                loadCampaignMessages(obj._id)
            },100)

        }
    });
}


function format(obj) {

    var defaultAuth = true;

    var str = '<div class="row  mb-2 mt-2">' +
        '<div class="col-md-6">' +
        '<div class="table-responsive">' +
            '<table id="message_'+obj._id+'" class="display nowrap table table-hover table-bordered" cellspacing="0" width="100%">\n' +
            '</table>' +
        '</div>' +
        '</div> ' +
        '<div class="col-md-6"><div class=" bg-white p-2">' +
        (obj.subject ?  '<p class="mb-0"><label class="text-muted">Subject</label></p>' +
            '<p>'+obj.subject+'</p>' : '') +
        (obj.Content ? '<p class="mb-0"><label class="text-muted">Content</label></p>' +
        '<p style="white-space: break-spaces;">'+obj.body_content+'</p>' : '') +
        '<div id="pieChart_'+obj._id+'" style="height: 300px"></div>' +
        '</div> </div> ' +
        '</div>';
    return str;
}

var campaignMessages = {};

function loadCampaignMessages(id) {

    if (campaignMessages[id]) {
        campaignMessages[id].destroy();
        $("#message_"+id).html("");
    }

    var fields = [
        {
            mData: 'to_num',
            sTitle: 'To',
            orderable: false,
            mRender: function (data, type, row) {

                return '<a href="javascript:void(0)" onclick="openMsgStats(\''+data+'\',\''+row['sid']+'\')">'+data+'</a> <span class="text-muted pull-right" data-toggle="tooltip" data-placement="bottom" title="" data-html="true" data-original-title="'+(row['subject'] ? 'Subject: '+row['subject']+'<br>' :'')+'Content: '+row['body_content']+'"><i class="fa fa-file"></i></span>'
            }
        },
        {
            mData: 'sender',
            sTitle: 'Sender',
            orderable: false,
            mRender: function (data, type, row) {
                return data ? data : '-';
            }
        },
        {
            mData: 'status',
            sTitle: 'Status',
            orderable: false,
            mRender: function (data, type, row) {
                return data;
            }
        },
        {
            mData: 'last_updt_ts',
            sTitle: 'Last Updated Time',
            mRender: function (data, type, row) {

                return moment(data).format(DATE_TIME_FORMAT) +' <span class="text-muted" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Updated by, '+row['last_updt_by']+'"><i class="fa fa-info-circle"></i></span>';
            }
        }

    ];

    var queryParams = {
        query: {
            "bool": {
                "must": [],

            }
        },
        sort: [{"last_updt_ts": {"order": "desc"}}],
        aggs:{
            'status':{
                terms:{
                    field:'status',
                    size:10
                }
            }
        }
    };



    var tableOption = {
        fixedHeader: false,
        responsive: false,
        paging: true,
        searching: true,
        aaSorting: [[3, 'desc']],
        "ordering": true,
        iDisplayLength: 5,
        lengthMenu: [[5,10, 50, 100], [5,10, 50, 100]],
        aoColumns: fields,
        "oLanguage": {
            sSearchPlaceholder : 'Search',
            "sSearch": "<i class='fa fa-search'></i>",
            "sProcessing": '<i class="fa fa-spinner fa-spin" style="color:#333"></i> Processing',
            "sEmptyTable" : "No data available!",
        },
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": '/broadcast/campaign/reports',
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

                queryParams.query['bool']['should'].push({"wildcard" : { "to_num" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']['should'].push({"wildcard" : { "sender" : "*"+searchText.toLowerCase()+"*" }})
                queryParams.query['bool']["minimum_should_match"]=1;

            }
            queryParams.query['bool']['must'] = [{match:{campaign_id:id}}]


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "contentType": 'application/json',
                "type": "POST",
                "url": sSource,
                "data": JSON.stringify({query:queryParams}),
                success: function (data) {


                    var resultData = data.result.data;

                    setTimeout(function () {
                        $('[data-toggle="tooltip"]').tooltip()
                    },500)

                    resultData['draw'] = oSettings.iDraw;

                    loadPieChart(id,data.result.aggregations)

                    fnCallback(resultData);
                }
            });
        }

    };

    campaignMessages[id] = $("#message_"+id).DataTable(tableOption);
}

function loadPieChart(id,obj) {

    var buckets = obj.status.buckets;
    var legends = [];
    var resultData = [];

    for(var i=0;i<buckets.length;i++){
        legends.push(buckets[i].key)
        resultData.push({name:buckets[i].key,value:buckets[i].doc_count})
    }

    if(buckets.length > 0) {

        var pieChart = echarts.init(document.getElementById('pieChart_' + id));

// specify chart configuration item and data
        var option = {

            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                x: 'center',
                y: 'bottom',
                data: legends
            },
            toolbox: {
                show: true,
                feature: {

                    dataView: {show: false, readOnly: false},
                    magicType: {
                        show: true,
                        type: ['pie', 'funnel']
                    },
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            // color: ["#f62d51", "#dddddd","#ffbc34", "#7460ee","#009efb", "#2f3d4a","#90a4ae", "#55ce63"],
            calculable: true,
            series: [

                {
                    name: 'Status',
                    type: 'pie',
                    radius: [30, 110],
                    roseType: 'area',
                    sort: 'ascending',     // for funnel
                    data: resultData
                }
            ]
        };
        pieChart.setOption(option, true), $(function () {
            function resize() {
                setTimeout(function () {
                    pieChart.resize()
                }, 100)
            }

            $(window).on("resize", resize), $(".sidebartoggler").on("click", resize)
        });
    }else{
        $("#pieChart_"+id).html('<p class="text-center text-muted p-4">'+NO_TEXT+'</p>')
    }

}

function openMsgStats(num,sid) {
    $("#msgStats .modal-title").html(num);
    $(".msgHistory").html('<div class="col-md-12"><p class="text-center"><i class="fa fa-spinner fa-spin"></i> loading...</p></div>');

    $("#msgStats").modal('show')

    var query = {
        query: {
            "bool": {
                "must": [{match:{sid:sid}}],

            }
        },
        sort: [{"last_updt_ts": {"order": "asc"}}],
    }

    $.ajax({
        url: '/broadcast/campaign/messages-history',
        data: JSON.stringify({query:query}),
        contentType: "application/json",
        type: 'POST',
        success: function (result) {
            $(".msgHistory").html('');
            if (result.status) {

                if(result.result.total > 0){
                    var resultObj = result.result.data.data;
                    for(var i=0;i<resultObj.length;i++){
                        $(".msgHistory").append('<div class="col-md-12 mt-2 mb-2">' +
                            '<strong class="text-primary" style="text-transform: uppercase">'+resultObj[i].status+'</strong><br>' +
                            '<small><i class="fa fa-clock-o"></i> '+moment(resultObj[i].last_updt_ts).format(DATE_TIME_FORMAT)+'</small>' +
                            '</div>')
                    }
                }



            } else {
                errorMsg('No data available')
            }
        },
        error: function (e) {
            $(".msgHistory").html('');
            errorMsg('Something went wrong! Please try again later.')
        }
    });

}