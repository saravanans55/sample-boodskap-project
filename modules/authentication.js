var Boodskap = require("./boodskap");
var Common = require("./common");
var Tables = require("./tables");
var Utils = require("./utils");

var Authentication = function (app) {

    this.app = app;
    this.logger = app.logger;
    this.conf = app.conf;
    this.table = new Tables(app);
    this.utils = new Utils(app);
    this.common = new Common(app)

};

module.exports = Authentication;

Authentication.prototype.startSession = function (req, cbk) {

    try{
        if(req.cookies['myweb_cookie']){
            let buff = Buffer.from(req.cookies['myweb_cookie'], 'base64').toString('ascii');
            let textObj = buff.toString('utf-8');

            var result = JSON.parse(textObj);
            req.session['sessionObj'] = result;
        }
        cbk(true);
    }catch (e){
        cbk(false);
    }
}
