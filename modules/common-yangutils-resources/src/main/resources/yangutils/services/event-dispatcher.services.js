define([], function () {
    'use strict';

    function EventDispatcherService(){
        var eD = {};

        var convertArgsToList = function(arg) {
            var argList = [],
                l = arg.length,
                i = 0;

            for(i = 0; i < l; i++) {
                argList.push(arg[i]);
            }

            return argList;
        };

        eD.broadcastHandler = {};

        eD.registerHandler = function(source, bcCallback) {
            eD.broadcastHandler[source] = bcCallback;
        };

        eD.dispatch = function() {
            var args = convertArgsToList(arguments),
                argumentList = args.slice(1),
                handler = eD.broadcastHandler[arguments[0]];

            if(handler) {
                handler(argumentList);
            }
        };

        return eD;
    }

    EventDispatcherService.$inject=[];

    return EventDispatcherService;

});