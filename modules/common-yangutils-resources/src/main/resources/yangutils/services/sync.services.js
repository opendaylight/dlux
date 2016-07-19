define([], function () {
    'use strict';

    function SyncService($timeout){

        var timeout = 180000,
            service = {
                generateObj: function () {
                    return new SyncObject();
                },
            };

        return service;

        /**
         * Base synchronization object
         * @constructor
         */
        function SyncObject() {
            this.runningRequests = [];
            this.reqId = 0;
            this.timeElapsed = 0;

            this.spawnRequest = function (digest) {
                var id = digest + (this.reqId++).toString();
                this.runningRequests.push(id);
                return id;
            };

            this.removeRequest = function (id) {
                var index = this.runningRequests.indexOf(id);

                if (index > -1) {
                    this.runningRequests.splice(index, 1);
                } else {
                }
            };

            this.waitFor = function (callback) {
                var t = 1000,
                    processes = this.runningRequests.length,
                    self = this;

                if (processes > 0 && self.timeElapsed < timeout) {
                    $timeout(function () {
                        self.timeElapsed = self.timeElapsed + t;
                        self.waitFor(callback);
                    }, t);
                } else {
                    callback();
                }
            };
        }
    }

    SyncService.$inject = ['$timeout'];

    return SyncService;

});
