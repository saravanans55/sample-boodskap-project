/*******************************
 * Import Required Modules
 ******************************/
const express = require('express');
const bodyParser = require('body-parser');
const layout = require('express-layout');
const path = require("path");
const app = express();
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const expressSession = require('express-session');
const compression = require('compression');
const cors = require('cors');
const fileupload = require("express-fileupload");
var router = express.Router()



/*******************************
 * API Access
 ****************************/
app.use(cors())

/*******************************
 * Require Configuration
 ****************************/
var conf = {};

try {
    conf = require(process.env.HOME + '/config/myweb-customer-web-config');
    console.log(new Date() + ' | My Web - Configuration Loaded From Config');
} catch (e) {
    console.log(new Date() + ' | Default Configuration Loaded');
    conf = require('./conf');
}


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.use(fileupload());


// compress all responses
app.use(compression())


//For Static Files
app.set('views', path.join(__dirname, 'views'));

var options = {
    maxAge: '1d',
    setHeaders: function (res, path, stat) {
        res.set('vary', 'Accept-Encoding');
        res.set('x-timestamp', Date.now());
    }
};

app.use(express.static(__dirname + '/webapps', controllerOptions));


app.use('/landing', express.static(__dirname + '/webapps/landing', options));
app.use('/dist', express.static(__dirname + '/webapps/dist', options));
app.use('/library', express.static(__dirname + '/webapps/library', options));
app.use('/css', express.static(__dirname + '/webapps/css', options));
app.use('/images', express.static(__dirname + '/webapps/images', options));
app.use('/plugins', express.static(__dirname + '/webapps/plugins', options));
app.use('/fonts', express.static(__dirname + '/webapps/fonts', options));


var controllerOptions = {
    maxAge: 0,
    setHeaders: function (res, path, stat) {
        res.set('vary', 'Accept-Encoding');
        res.set('x-timestamp', Date.now());
    }
};

app.use('/js', express.static(__dirname + '/webapps/js', controllerOptions));
app.use(conf.web.basepath,express.static(__dirname + '/webapps', controllerOptions));
//static url slugs
app.use(conf.web.basepath+'/a:',express.static(__dirname + '/webapps', controllerOptions));
app.use(conf.web.basepath+'/a:/b:',express.static(__dirname + '/webapps', controllerOptions));
app.use(conf.web.basepath+'/a:/b:/c:',express.static(__dirname + '/webapps', controllerOptions));
app.use(conf.web.basepath+'/a:/b:/c:/d:',express.static(__dirname + '/webapps', controllerOptions));
app.use(conf.web.basepath+'/a:/b:/c:/d:/e:',express.static(__dirname + '/webapps', controllerOptions));
app.use(conf.web.basepath+'/a:/b:/c:/d:/e:/f:',express.static(__dirname + '/webapps', controllerOptions));

app.use(layout());

app.use(cookieParser('NDVR-ADMIN'));

var sessionObj = {
    secret: 'NDVR-ADMIN',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 5 * 60 * 60 * 1000 //5 hours
    }
}
if (process.env.NODE_ENV === 'PROD') {
    app.set('trust proxy', 1) // trust first proxy
    sessionObj.cookie.secure = true // serve secure cookies
}
app.use(expressSession(sessionObj))


//For Template Engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set("view options", {layout: "layout.html"});


app.set('base', conf.web.basepath);


app.conf = conf;

var server = require('http').Server(app);

console.log('My Remote things Admin Server Node Listening on ' + conf['web']['port']);

server.listen(conf['web']['port']);


//Initializing the web & api routes
var UIRoutes = require('./routes/ui-routes');
new UIRoutes(app,router);

var APIRoutes = require('./routes/api-routes');
new APIRoutes(app,router);


process
    .on('uncaughtException', function (err) {
// handle the error safely
        console.error(err)
    })
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })








