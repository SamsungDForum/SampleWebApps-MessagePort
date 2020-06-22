App = window.App || {};
App.Main = (function Main() {
    var logger = App.Logger.create({
        loggerEl: document.querySelector('.logsContainer'),
        loggerName: 'Main',
        logLevel: App.Logger.logLevels.ALL
    });

    var statusEl = document.querySelector('.status');

    // application ID of background service, needed to start the bg service
    var targetApplicationId = 'SampleBgSv.MsgBGSvc';

    // background service app context ID, needed to kill the bg service when exiting the app
    var bgServiceContextId = 0;

    // name of port for receiving messages
    var localMessagePortName = 'CALLER_PORT';

    // name of port for sending messages
    var remoteMessagePortName = 'BG_SERVICE_PORT';

    var isBgServiceLaunched = false;

    // port for receiving messages
    var localMsgPort = tizen.messageport.requestTrustedLocalMessagePort(localMessagePortName);

    // handler for incoming messages
    var listenerId;

    // port for sending messages
    var remoteMsgPort;

    var messageQueue = [];

    // the simplest message
    var simpleMessage = [
        {
            key: 'hello',
            value: 'Hello, World!'
        }
    ];

    // complex message - please notice that in case of nesting objects they need to be stringified
    var complexMessage = [
        { key: 'loggedIn', value: true },
        { key: 'data', value: ['dummy1', 'dummy2'] },
        { key: 'byteData', value: [12, 23, 34, 45, 56, 67, 78] },
        { key: 'bytesData', value: [[1, 2, 3, 255], [8, 9, 3, 4, 5]] }
    ];

    function getBgServiceContextId() {
        logger.log('getBgServiceContextId');

        tizen.application.getAppsContext(function (appcontexts) {
            bgServiceContextId = appcontexts
                .filter(function (appcontext) {
                    return appcontext.appId === targetApplicationId;
                })
                .map(function (appcontext) {
                    return appcontext.id;
                });
        });
    }

    function requestRemotePort() {
        logger.log('requestRemotePort');

        // get the port for sending messages
        try {
            remoteMsgPort = tizen.messageport.requestTrustedRemoteMessagePort(
                targetApplicationId,
                remoteMessagePortName
            );
            logger.log('remoteMsgPort received');
        } catch (error) {
            logger.error(error.message);
        }
    }

    function registerLocalPortListener() {
        logger.log('registerLocalPortListener');

        // register a handler for incoming messages
        listenerId = localMsgPort.addMessagePortListener(function (data) {
            logger.log('Received data: ', data);

            data.forEach(function (message) {
                var key = message.key;

                if (key === 'confirmation') {
                    print('confirmation: ' + message.value);
                } else if (key === 'ready') {
                    // background service is ready, we cen send messages
                    print('ready: ' + message.value);
                    isBgServiceLaunched = true;

                    while (messageQueue.length > 0) {
                        logger.log('messageQueue: ' + JSON.stringify(messageQueue[0]));
                        sendMessage(messageQueue.shift());
                    }
                }
            });
        });
    }

    function print(msg) {
        var logEl = document.createElement('p');
        logEl.innerHTML = msg;
        statusEl.appendChild(logEl);
        logEl.scrollIntoView();
    }

    function launchBgService() {
        logger.log('launchBgService');

        // block ENTER key to avoid multiple executions of background service
        App.KeyHandler.disableKeyHandler();

        tizen.application.launchAppControl(
            new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/pick',
                null,
                null,
                null,
                [new tizen.ApplicationControlData('caller', ['CallerApp'])]),
            targetApplicationId,
            function () {
                isBgServiceLaunched = true;
                bgServiceContextId = getBgServiceContextId();
                App.KeyHandler.enableKeyHandler();
                logger.log('Launching background service success');
            },
            function (e) {
                isBgServiceLaunched = false;
                App.KeyHandler.enableKeyHandler();
                logger.log('Launching background service [' + targetApplicationId + '] failed: ' + e.message);
            }
        );
    }

    function killBgService(callback) {
        logger.log('killBgService: ' + bgServiceContextId);

        function onKillSuccess() {
            logger.log('Background service killed');
            isBgServiceLaunched = false;
            callback();
        }

        function onKillError(error) {
            logger.log('Background service NOT killed: ', error);
            callback();
        }

        tizen.application.kill(bgServiceContextId, onKillSuccess, onKillError);
    }

    function sendMessage(msg) {
        logger.log('sendMessage', msg);

        if (!isBgServiceLaunched) {
            logger.log('Background service is NOT launched');
            messageQueue.push(msg);
            launchBgService();
        } else {
            logger.log('Background service is launched');

            try {
                requestRemotePort();
                // sends message using remote port and indicates the local port for eventual reply message
                remoteMsgPort.sendMessage(msg, localMsgPort);
                logger.log('Message sent');
            } catch (error) {
                logger.error('Error occured while sending message: ' + error);
            }
        }
    }

    function clearStatus() {
        statusEl.innerHTML = '';
    }

    function addButtonsHandlers() {
        var buttonsWithHandlers = [
            { elementSelector: '.send-a', handler: sendMessage.bind(null, simpleMessage) },
            { elementSelector: '.send-b', handler: sendMessage.bind(null, complexMessage) },
            { elementSelector: '.clear-status', handler: clearStatus }
        ];

        App.KeyHandler.addHandlersForButtons(buttonsWithHandlers);
    }

    App.Navigation.registerMenu({
        name: 'Basic',
        domEl: document.querySelector('#buttons')
    });

    window.onload = function () {
        addButtonsHandlers();
        registerLocalPortListener();

        // Register a key handler for EXIT button.
        // It is needed to manualy handle the EXIT because it is strongly recommended to kill background service
        // before exiting the application.
        App.KeyHandler.registerKeyHandler(10182, 'Exit', function () {
            logger.log('Exiting the app...');
            localMsgPort.removeMessagePortListener(listenerId);
            killBgService(tizen.application.getCurrentApplication().exit);
        });
    };
}());
