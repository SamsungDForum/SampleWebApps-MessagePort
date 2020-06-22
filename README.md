# MessagePort

This application demonstrates the usage of `tizen.messageport` API. With this API it is possible to implement app-to-app communication.
In this example foreground application (sender application) communicates with its background service (target application):

1. When sender (foreground) application is initialized the local message port is created - for receiving the confirmations from target application.
2. When **send message** button is pressed the foreground application launches the background service and requests the remote message port - for sending the messages to target application (background service).
3. When background service is launched it creates its own local message port (for receiving the messages from sender application) and requests the remote message port (local message port in sender application) for sending the confirmations back to the sender application.
4. When target application receives a message from sender application it sends back the confirmation to the sender application.
5. Foreground application displays the confirmation and closes the background service.

So there are 2 message ports in both applications: *local* for receiving the messages and *remote* for sending the messages.  

**IMPORTANT!** Target application must be executed at least in background in order to establish a Message Port connection with it.


## How to use the application

Use TV remote controller to navigate. By pressing on the buttons user can send the messages to background service. Confirmations from background service are displayed on the screen.

The sender application needs to know the ID of target application. Make sure both applications have correct IDs defined.  

In this example Trusted Message Ports are used. The difference between trusted and regular is security: in case of trusted message port only applications that are signed with the same author certificate can communicate.  

There is `remoteLogger` tool for debugging the background service - see `remoteLogger.js` file. It sends the logs to the remote server over HTTP. `backgroundServiceConfig.json` contains the URI to the server - adjust it to fit your environment. As a server you can use **PreviewServer** application.


## Supported platforms

2016 and newer


### Privileges and metadata

The application needs the following privileges to be included in `config.xml`:

```xml
<tizen:privilege name="http://tizen.org/privilege/application.launch" />
<tizen:privilege name="http://tizen.org/privilege/appmanager.kill" />
```

- `application.launch` is needed for executing the target application (background service in this case).  
- `appmanager.kill` is needed for closing the background service.  

`tizen:service` section is also needed for background service usage. See `config.xml` for complete code.


### File structure

```
MessagePort/ - MessagePort sample app root folder
│
├── assets/ - resources used by this app
│   │
│   └── JosefinSans-Light.ttf - font used in application
│
├── css/ - styles used in the application
│   │
│   ├── main.css - styles specific for the application
│   └── style.css - style for application's template
│
├── js/ - scripts used in the application
│   │
│   ├── backgroundService - contains background service related files
│   │   │
│   │   ├── ajax.js - module for sending requests to server
│   │   ├── backgroundService.js - background service main execution file
│   │   ├── backgroundServiceConfig.json - background service configuration file, contains URI to remote server for sending logs from background service for debugging purposes. 
│   │   ├── messageManager.js - responsible for communication between background service and main app
│   │   └── remoteLogger.js - module for sending logs from background service to server
│   │
│   ├── init.js - script that runs before any other for setup purpose
│   ├── keyhandler.js - module responsible for handling keydown events
│   ├── logger.js - module allowing user to register logger instances
│   ├── main.js - main application script
│   ├── navigation.js - module responsible for handling in-app focus and navigation
│   └── utils.js - module with useful tools used through application
│
├── CHANGELOG.md - changes for each version of application
├── config.xml - application's configuration file
├── icon.png - application's icon
├── index.html - main document
└── README.md - this file
```


## Other resources

*  **MessagePort API**  
  https://developer.samsung.com/tv/develop/api-references/tizen-web-device-api-references/messageport-api  

*  **MessagePort Guide API**  
  https://developer.tizen.org/development/guides/web-application/application-management/application-data-exchange/message-port  


## Copyright and License

**Copyright 2019 Samsung Electronics, Inc.**

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
