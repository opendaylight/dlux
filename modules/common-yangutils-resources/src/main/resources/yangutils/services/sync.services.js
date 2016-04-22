define([], function () {
    'use strict';

    function SyncService($timeout){
        var timeout = 180000;

        var SyncObject = function () {
            this.runningRequests = [];
            this.reqId = 0;
            this.timeElapsed = 0;

            this.spawnRequest = function (digest) {
                var id = digest + (this.reqId++).toString();
                this.runningRequests.push(id);
                //console.debug('adding request ',id,' total running requests  = ',this.runningRequests);
                return id;
            };

            this.removeRequest = function (id) {
                var index = this.runningRequests.indexOf(id);

                if (index > -1) {
                    this.runningRequests.splice(index, 1);
                    //console.debug('removing request ',id,' remaining requests = ',this.runningRequests);
                } else {
                    console.warn('cannot remove request', id, 'from', this.runningRequests, 'index is', index);
                }
            };

            this.waitFor = function (callback) {
                var t = 1000,
                    processes = this.runningRequests.length,
                    self = this;

                if (processes > 0 && self.timeElapsed < timeout) {
                    // console.debug('waitin on',processes,'processes',this.runningRequests);
                    $timeout(function () {
                        self.timeElapsed = self.timeElapsed + t;
                        self.waitFor(callback);
                    }, t);
                } else {
                    callback();
                }
            };
        };

        return {
            generateObj: function () {
                return new SyncObject();
            }
        };
    }

    SyncService.$inject=['$timeout'];

    return SyncService;

});