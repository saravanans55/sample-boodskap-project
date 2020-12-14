module.exports = {
    "web": {
        "port": 4001,
        "host": "0.0.0.0",
        "basepath": "/myweb"
    },
    "settings": {
        "appApiUrl" : "http://localhost:4001/myweb",
        "url": "http://localhost:4001/myweb",
        "boodskap": {
            "apiUrl": "https://dev.boodskap.io/api",
            "domainKey": "",
            "apiKey": "",
            "mqtt": {
                "hostName": 'dev.boodskap.io',
                "portNo": 443,
                "ssl": true
            }
        }
    }
}

