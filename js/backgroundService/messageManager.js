var localMsgPort;
var remoteMsgPort;
var isInitialized = false;
var remoteLogger = require('./remoteLogger.js');

function init(config) {
    remoteLogger.log('messageManager init');

    // port for receiving messages
    localMsgPort = tizen.messageport.requestTrustedLocalMessagePort('BG_SERVICE_PORT');

    // register a handler for incoming messages
    localMsgPort.addMessagePortListener(config.onMessageReceived);

    // port for sending messages
    try {
        remoteMsgPort = tizen.messageport.requestTrustedRemoteMessagePort(
            config.calleeAppId,
            config.remoteMessagePortName
        );
        remoteLogger.log('Remote port in background service requested successfully');
    } catch (error) {
        remoteLogger.log('Remote port in background service failed', error.message);
    }

    isInitialized = true;
}

function sendMessage(key, msg) {
    var messageData = {
        key: key,
        value: '[' + Date.now() + ']: Thanks! I received the message: ' + msg
    };

    remoteLogger.log('messageManager sendMessage', key, msg);

    remoteMsgPort.sendMessage([messageData]);
}

module.exports = {
    init: init,
    sendMessage: sendMessage,
    isInitialized: isInitialized
};
