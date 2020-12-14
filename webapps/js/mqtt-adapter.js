var MQTT_STATUS = false;
var mqtt_client = null;

function connectionStatus() {
    return MQTT_STATUS;
}

function mqttConnect() {

    MQTT_STATUS = false;
    mqtt_client = null;


    var options = {
        useSSL: MQTT_CONFIG.ssl,
        timeout: 3,
        onSuccess: function () {
            MQTT_STATUS = true;
            console.log(new Date() + " | MQTT connection established");

            try {
                mqttListen();
            }
            catch(e){}

        },
        onFailure: function (message) {
            console.log(new Date() + " | MQTT Connection failed: " + message.errorMessage);
            mqttConnect();
        }
    };

    options['userName'] = MQTT_CLIENT_ID + '_' + API_TOKEN;
    options['password'] = API_KEY;

    var sessionClientId = MQTT_CLIENT_ID + '_' + new Date().getTime();

    if (MQTT_CONFIG.portNo) {
        mqtt_client = new Messaging.Client(MQTT_CONFIG.hostName, MQTT_CONFIG.portNo, sessionClientId);
    } else {
        mqtt_client = new Messaging.Client(MQTT_CONFIG.hostName, '', sessionClientId);
    }
    mqtt_client.connect(options);

    mqtt_client.onConnectionLost = function (responseObject) {
        MQTT_STATUS = false;
        console.log(new Date() + " | MQTT connection lost: " + responseObject.errorMessage);
        mqttConnect();

    }
}

function mqttPublish(payload, topic, qos) {
    const message = new Messaging.Message(payload);
    message.destinationName = topic;
    message.qos = qos;
    mqtt_client.send(message);
}

function mqttSubscribe(topic, qos) {
    mqtt_client.subscribe(topic, {qos: qos});
    console.log(new Date() + " | MQTT started to subscribe the topic: " + topic);
}

function mqttUnsubscribe(topic) {
    mqtt_client.unsubscribe(topic, {
        onSuccess: function () {
            console.log(new Date() + " | MQTT unsubscribed from the topic: " + topic);

        },
        onFailure: function (message) {
            console.log(new Date() + " | MQTT unsubscribed from the topic : " + topic + "was error");
        }
    }, function (error) {
    });

}

