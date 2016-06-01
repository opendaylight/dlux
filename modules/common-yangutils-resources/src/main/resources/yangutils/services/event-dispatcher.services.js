define([], function () {
    'use strict';

    function EventDispatcherService(){

        var service = {
            broadcastHandler: {},
            dispatch: dispatch,
            registerHandler: registerHandler
        };

        return service;

        // TODO: add service's description
        function registerHandler(source, bcCallback) {
            service.broadcastHandler[source] = bcCallback;
        }

        // TODO: add service's description
        function dispatch() {
            var args = Array.prototype.slice.call(arguments),
                argumentList = args.slice(1),
                handler = service.broadcastHandler[arguments[0]];

            if (handler) {
                handler(argumentList);
            }
        }
    }

    EventDispatcherService.$inject = [];

    return EventDispatcherService;

});
