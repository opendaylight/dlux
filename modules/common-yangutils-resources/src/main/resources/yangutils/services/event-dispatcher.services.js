define([], function () {
    'use strict';

    function EventDispatcherService(){

        var service = {
            broadcastHandler: {},
            dispatch: dispatch,
            registerHandler: registerHandler,
        };

        return service;

        // TODO: add function's description
        function convertArgsToList(arg) {
            var argList = [],
                l = arg.length;

            for (var i = 0; i < l; i++) {
                argList.push(arg[i]);
            }

            return argList;
        }

        // TODO: add service's description
        function registerHandler(source, bcCallback) {
            service.broadcastHandler[source] = bcCallback;
        }

        // TODO: add service's description
        function dispatch() {
            var args = convertArgsToList(arguments),
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
