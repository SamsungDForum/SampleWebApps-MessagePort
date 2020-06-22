var remoteLogger = require('./remoteLogger.js');
var messageManager = require('./messageManager.js');

function onMessageReceived(data) {
    remoteLogger.log('onMessageReceived', JSON.stringify(data));
    messageManager.sendMessage('confirmation', JSON.stringify(data));
}

function onRequest() {
    var messageManagerConfig = {
        remoteMessagePortName: 'CALLER_PORT',
        calleeAppId: 'sample0010.MessagePort',
        onMessageReceived: onMessageReceived
    };

    var reqAppControl = tizen.application.getCurrentApplication().getRequestedAppControl();
    var data;

    remoteLogger.log('onRequest');

    if (reqAppControl && reqAppControl.appControl.operation === 'http://tizen.org/appcontrol/operation/pick') {
        remoteLogger.log('AppControl operation is "pick"');

        data = reqAppControl.appControl.data;

        if (data[0].value[0] === 'CallerApp') {
            remoteLogger.log('Background service launched by frontend application');
            messageManager.init(messageManagerConfig);
            messageManager.sendMessage('ready', 'background service is ready');
        }
    }
}


module.exports = {
    onRequest: onRequest
};
