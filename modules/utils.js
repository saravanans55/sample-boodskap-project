var _ = require('underscore');
var useragent = require('user-agent');

var Utils = function (app) {

    this.app = app;


};
module.exports = Utils;


Utils.prototype.getEmailBody = function (content) {

    var header = '<div style=""><div style="text-align:center;border-bottom:2px solid #4e5467;padding: 10px"><small>A Product of Anyware</small><h5 style="font-weight: bold;letter-spacing: 5px;margin:0px;font-size: 1.2rem;color:#4b81c2;padding-left: 10px">Quality Check</h5></div>'
    var footer = '<div style="text-align:center;border-top:2px solid #4e5467; padding: 10px;background-color:#4e5467;color:#fff">&copy; 2020 All rights reserved. Powered by Boodskap Inc.,</div></div>'

    return header+'<div style="background-color: #eee;padding:20px;">' +
        '<div style="padding: 20px;background-color: #fff;border:1px solid #ddd;">'
        +content+'<p style="color:#666;margin: 20px 0px">Regards,<br><b>Quality Check</b></p></div></div>'+footer;
    
}
Utils.prototype.getTwilioAuth = function () {
    const self = this;
    let auth = self.app.conf.settings.twilio.account_sid+":"+self.app.conf.settings.twilio.auth_token;
    let buff = Buffer.from(auth);
    let base64data = buff.toString('base64');
    return "Basic " + base64data;

}
Utils.prototype.getHeaders = function (req) {
    return useragent.parse(req.headers['user-agent']);
}

Utils.prototype.s4 = function () {

    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

Utils.prototype.normalizePhoneNumber = function (phone) {
    //normalize string and remove all unnecessary characters
    phone = phone.replace(/[^\d]/g, "");

    return phone;
}

Utils.prototype.generateUUID = function () {

    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + this.s4() + this.s4();
};

Utils.prototype.sqlSingleQueryFormatter = function (data) {

    var resultObj = {
        total: 0,
        data: {},
        aggregations: {}
    }


    var result = data.records;


    var totalRecords = data.records.length;


    resultObj = {
        "total": totalRecords,
        "data": result
    }


    return resultObj;

}

Utils.prototype.sqlMultiQueryFormatter = function (data) {


    var resultObj = {
        total: 0,
        data: {},
    }

    var result = data.results;

    var arrayData = result[0].records;

    var totalRecords = result[1].records[0].total;


    resultObj = {
        "total": totalRecords,
        "data": {
            "recordsTotal": totalRecords,
            "recordsFiltered": totalRecords,
            "data": arrayData
        },
    }

    return resultObj;


};


Utils.prototype.dbQueryFormatter = function (data) {


    var resultObj = {
        total: 0,
        data: {},
        error: '',
        inserted: 0
    }

    var result = JSON.parse(data.jsonResult);

    if (result.error) {
        resultObj['error'] = result.error;
        return resultObj;
    } else if (result.data >= 0) {
        resultObj['inserted'] = 1;
        return resultObj;
    } else {

        var arrayData = result['data'].records;

        var totalRecords = result['total'] ? result['total'].records[0]['total'] : result['data'].records.length;


        resultObj = {
            "total": totalRecords,
            "data": {
                "recordsTotal": totalRecords,
                "recordsFiltered": totalRecords,
                "data": arrayData
            },
        }

        return resultObj;
    }

};

Utils.prototype.elasticQueryFormatter = function (data) {

    var resultObj = {
        total: 0,
        data: {},
        aggregations: {}
    }

    if (data.httpCode === 200) {

        var arrayData = JSON.parse(data.result);

        var totalRecords = arrayData.hits.total ? arrayData.hits.total.value : 0;
        var records = arrayData.hits.hits;

        var aggregations = arrayData.aggregations ? arrayData.aggregations : {};

        var count = 0;

        var tempData = []

        for (var i = 0; i < records.length; i++) {
            if( records[i]['_id'] != '_search') {
                records[i]['_source']['_id'] = records[i]['_id'];
                tempData.push(records[i]['_source']);
            }else{
                count++;
            }
        }

        totalRecords = totalRecords > 0 ? totalRecords-count : 0

        resultObj = {
            "total": totalRecords,
            "data": {
                "recordsTotal": totalRecords,
                "recordsFiltered": totalRecords,
                "data": _.pluck(records, '_source')
            },
            aggregations: aggregations
        }

        return resultObj;

    } else {

        return resultObj;
    }

};


Utils.prototype.getCallerIP = function (request) {
    var ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;

    ip = ip.split(',')[0];

    ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"

    return ip[0];
}

Utils.prototype.queryFormatter = function (data) {
    var resultObj = {
        total: 0,
        data: {},
        aggregations: {}
    }
    var arrayData = JSON.parse(data);
    arrayData = arrayData.result;
    arrayData = JSON.parse(arrayData);
    var totalRecords = arrayData.hits.total;
    var records = arrayData.hits.hits;
    var aggregations = arrayData.aggregations ? arrayData.aggregations : {};


    for (var i = 0; i < records.length; i++) {
        records[i]['_source']['_id'] = records[i]['_id'];
    }
    resultObj = {
        "total": totalRecords,
        "data": {
            "recordsTotal": totalRecords,
            "recordsFiltered": totalRecords,
            "data": _.pluck(records, '_source')
        },
        aggregations: aggregations
        // data : _.pluck(records, '_source')
    }

    return resultObj;
}


Utils.prototype.getErrorDesc = function (code) {

    var str = 'Not Available';
    for (var i = 0; i < ErrorCode.length; i++) {
        if ((code * 1) === (ErrorCode[i].code * 1)) {
            str = ErrorCode[i]['secondary_message'] ? ErrorCode[i]['secondary_message'] : ErrorCode[i]['message'];
            break;
        }
    }

    return str;
}

