var request = require('request');
var moment = require('moment');
var async = require('async');
var _ = require('underscore');

var Utils = require("./utils")
var Tables = require("./tables");


var Boodskap = function (app, token) {
    this.API_URL = app.conf.settings.boodskap.apiUrl;
    this.DOMAIN_KEY = app.conf.settings.boodskap.domainKey;
    this.API_KEY = app.conf.settings.boodskap.apiKey;
    this.API_TOKEN = token ? token : this.DOMAIN_KEY + ":" + this.API_KEY;
    this.utils = new Utils(app);
    this.table = new Tables(app);
    this.app = app;


};
module.exports = Boodskap;

Boodskap.prototype.login = function (req, res) {

    const self = this;

    var username = req['body']['username'];
    var password = req['body']['password'];

    var data = {
        email: username,
        password: password,
        targetDomainKey: self.app.conf.settings.boodskap.domainKey
    }

    self.doLogin(data, function (status, result) {

        if (status) {

            var sessionObj = {
                sessionId: req.sessionID,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                userName: result.user.firstName + " " + result.user.lastName,
                userId: result.user.email,
                mobileNo: result.user.primaryPhone,
                session_user: result.user.firstName + " " + result.user.lastName + " [" + result.user.email + "]",
                token: result.token,
                role: result.user.roles[0],
                domain: result.domain,
                domainKey: result.domainKey,
                apiKey: result.apiKey,
            };

            req.session['sessionObj'] = sessionObj;

            res.json({ login: true, sessionObj:sessionObj});

        } else {

            self.clearSession(req)
            res.json({ login: false, message: 'Error in Authenticating with Platform API', error: result })
        }
    });


}

Boodskap.prototype.clearSession = function (req) {

    req.session['sessionObj'] = null;

}

Boodskap.prototype.doLogin = function (data, cbk) {

    const self = this;

    request.post({
        uri: self.API_URL + '/domain/login',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
    }, function (err, res, body) {

        if (!err) {

            if (res.statusCode === 200) {
                cbk(true, JSON.parse(res.body))
            } else if (res.statusCode === 417) {
                console.error(res.body)
                cbk(false, JSON.parse(res.body))
            } else {
                console.error(res.body)
                cbk(false, res.body)
            }
        } else {
            console.error(err)
            cbk(false, null)
        }

    });
};

Boodskap.prototype.logout = function (req, cbk) {

    const self = this;

    request.get({
        uri: self.API_URL + '/domain/logout/' + self.API_TOKEN,
        headers: { 'content-type': 'application/json' },
    }, function (err, res, body) {
        req.session.destroy();
        cbk(true);

    });
};

Boodskap.prototype.executeNamedRule = function (ruleName, args, cbk) {

    const self = this;

    var templateObj = {
        "sessionId": self.utils.generateUUID(),
        "namedrule": ruleName,
        "scriptArgs": args
    };
    request.post({
        uri: self.API_URL +"/call/v2/execute/rule/"+ self.API_TOKEN,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(templateObj),
    }, function (err, res, body) {

        if (!err) {

            if (res.statusCode === 200) {
                var resultData = JSON.parse(res.body);
                cbk(true, resultData)
            } else if (res.statusCode === 417) {
                cbk(false, JSON.parse(res.body))
            } else {
                self.logger.error("Error in named rule execute =>", res.body)
                cbk(false, res.body)
            }
        } else {
            self.logger.error("Error in named rule execute =>", err)
            cbk(false, null)
        }

    });
};


Boodskap.prototype.elasticSearch = function (rid, query, cbk) {

    const self = this;

    var obj = {
        "type": 'RECORD',
        "query": JSON.stringify(query)
    }

    if (rid) {
        obj['specId'] = rid;
    }

    request.post({
        uri: self.API_URL + '/elastic/search/query/' + self.API_TOKEN,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(obj),

    }, function (err, res, body) {

        if (!err) {

            if (res.statusCode === 200) {
                var resultObj = self.utils.elasticQueryFormatter(JSON.parse(res.body))
                cbk(true, resultObj)
            } else {
                self.logger.error("record search error in platform =>", res.body)
                cbk(false, JSON.parse(res.body))
            }
        } else {
            self.logger.error("record search error in platform =>", err)
            cbk(false, null)
        }

    });
};
Boodskap.prototype.elasticUpdate = function (rid, rkey, data, cbk) {

    const self = this;

    request.post({
        uri: self.API_URL + '/record/insert/static/' + self.API_TOKEN + '/' + rid + '/' + rkey,
        headers: { 'content-type': 'text/plain' },
        body: JSON.stringify(data),
    }, function (err, res, body) {

        if (!err) {

            if (res.statusCode === 200) {
                cbk(true, JSON.parse(res.body))
            } else {
                // self.logger.error("record update error in platform =>",res.body)
                cbk(false, JSON.parse(res.body))
            }
        } else {
            // self.logger.error("record update error in platform =>",err)
            cbk(false, null)
        }

    });
};
Boodskap.prototype.elasticDelete = function (rid, rkey, cbk) {

    const self = this;

    request.delete({
        uri: self.API_URL + '/record/delete/' + self.API_TOKEN +'/'+rid +'/'+rkey,
    }, function (err, res, body) {

        if(!err) {

            if (res.statusCode === 200) {
                cbk(true, JSON.parse(res.body))
            } else {
                self.logger.error("record delete error in platform =>",res.body)
                cbk(false,JSON.parse(res.body))
            }
        }else{
            self.logger.error("record delete error in platform =>",err)
            cbk(false,null)
        }

    });
};
Boodskap.prototype.elasticInsert = function (rid, data, cbk) {

    const self = this;

    request.post({
        uri: self.API_URL + '/record/insert/dynamic/' + self.API_TOKEN + '/' + rid,
        headers: { 'content-type': 'text/plain' },
        body: JSON.stringify(data),
    }, function (err, res, body) {

        if (!err) {

            if (res.statusCode === 200) {
                cbk(true, JSON.parse(res.body))
            } else {
                self.logger.error("record insert error in platform =>", res.body)
                cbk(false, JSON.parse(res.body))
            }
        } else {
            self.logger.error("record insert error in platform =>", err)
            cbk(false, null)
        }

    });
};
