var Utils = require("../modules/utils");
var Common = require("../modules/common");
var Tables = require("../modules/tables");
var Authentication = require("../modules/authentication");

var UIRoutes = function (app, router) {

    this.app = app;
    this.router = router;
    this.conf = app.conf;

    this.utils = new Utils(app);
    this.common = new Common(app);
    this.table = new Tables(app);
    this.authentication = new Authentication(app);

    this.init();

};
module.exports = UIRoutes;


UIRoutes.prototype.init = function () {

    const self = this;

    var sessionCheck = function (req, res, next) {
        var ndvrwebCookie = req.cookies ? req.cookies["ndvr_web"] : "";
        if (ndvrwebCookie) {
            self.authentication.startSession(req, function (status) {
                if (status) {
                    next();
                } else {
                    req.session['sessionObj'] = null;
                    res.clearCookie('ndvr_web')
                    res.redirect(self.app.conf.web.basepath + "/login");
                }
            })
        } else {
            res.redirect(self.app.conf.web.basepath + "/login");
        }
    };

    self.router.get('/', function (req, res) {
        res.redirect(self.app.conf.web.basepath + '/login');
    });

    self.router.get('/login', function (req, res) {

        var sessionObj = req.session ? req.session['sessionObj']:"";

        if (sessionObj) {
            res.redirect(self.app.conf.web.basepath + '/main');
        } else {
            res.render('login.html', {
                layout: false,
                config: self.app.conf.settings,
                basePath: self.app.conf.web.basepath
            });
        }
    });


    //After Login pages

    self.router.get('/main', sessionCheck, function (req, res) {

        res.render('home/home.html', {
            layout: '',
            sessionObj: req.session['sessionObj'],
            config: self.app.conf,
            basePath: self.app.conf.web.basepath
        });
    });

    self.router.get('/home', sessionCheck, function (req, res) {

        res.render('home/home.html', {
            layout: false,
            sessionObj: req.session['sessionObj'],
            config: self.app.conf,
            basePath: self.app.conf.web.basepath
        });
    });


    self.router.get('/profile', sessionCheck, function (req, res) {

        res.render('home/profile.html', {
            layout: false,
            sessionObj: req.session['sessionObj'],
            config: self.app.conf,
            basePath: self.app.conf.web.basepath
        });
    });


    self.router.get('/notifications', sessionCheck, function (req, res) {

        res.render('home/notifications.html', {
            layout: false,
            sessionObj: req.session['sessionObj'],
            config: self.app.conf,
            basePath: self.app.conf.web.basepath
        });
    });


    self.app.use(self.app.conf.web.basepath, self.router);
};
