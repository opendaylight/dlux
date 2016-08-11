define(['app/yangman/models/baselist.model'], function (BaseListModel){
    'use strict';

    /**
     * Base history list object
     * @constructor
     * @param ParsingJsonService
     * @param RequestsService
     */
    function HistoryListModel(ParsingJsonService, RequestsService){

        BaseListModel.call(this, ParsingJsonService);

        /* jshint validthis: true */
        var self = this;
        self.list = [];
        self.dateGroups = [];
        self.selectedRequests = [];

        self.addRequestToList = addRequestToList;
        self.clear = clear;
        self.createEntry = createEntry;
        self.deleteRequestItem = deleteRequestItem;
        self.deselectReqs = deselectReqs;
        self.groupListByDate = groupListByDate;
        self.selectReqs = selectReqs;
        self.toggleReqSelection = toggleReqSelection;

        /**
         * Mark reqObj as selected
         * @param {boolean} onlyOneSelected boolean if only this object should be marked as selected
         * @param reqObj HistoryRequest object to be selected
         */
        function toggleReqSelection(onlyOneSelected, reqObj){
            if (onlyOneSelected){
                self.selectedRequests.forEach(function (req){
                    req.selected = false;
                });
                self.selectedRequests = [];
            }

            if (reqObj.selected && !onlyOneSelected){
                self.selectedRequests.splice(self.selectedRequests.indexOf(reqObj), 1);
            }

            reqObj.selected = (reqObj.selected && onlyOneSelected) || !reqObj.selected;
            if (reqObj.selected){
                self.selectedRequests.push(reqObj);
            }

        }

        /**
         * Round timestamp to day
         * @param timeStamp
         * @returns {number|*}
         */
        function roundTimestampToDate(timeStamp){
            timeStamp -= timeStamp % (24 * 60 * 60 * 1000);//subtract amount of time since midnight
            timeStamp += new Date().getTimezoneOffset() * 60 * 1000;//add on the timezone offset
            return timeStamp;
        }

        /**
         * Grouping by date to show date groups in yangman
         */
        function groupListByDate(){
            self.list.forEach(addToListDateGroup);

            function addToListDateGroup(elem){
                var groupName = roundTimestampToDate(elem.timestamp),
                    dateGroupArr = self.dateGroups.filter(function(group){
                        return group.name === groupName;
                    }),
                    dateGroup = null;

                if (dateGroupArr.length){
                    dateGroup = dateGroupArr[0];
                }
                else {
                    dateGroup = {
                        name: groupName,
                        longName: new Date(groupName).toDateString(),
                        requests: [],
                    };
                    self.dateGroups.push(dateGroup);
                }
                dateGroup.requests.push(elem);
            }
        }

        /**
         *
         * @param elem
         * @returns {HistoryRequest|*}
         */
        function createEntry(elem) {
            return RequestsService.createHistoryRequestFromElement(elem);
        }

        /**
         *
         * @param reqObj
         */
        function addRequestToList(reqObj){
            self.list.push(reqObj);
        }

        /**
         *
         * @param elem
         */
        function deleteRequestItem(elem){
            self.list.splice(self.list.indexOf(elem), 1);
        }

        function clear() {
            self.list = [];
            self.dateGroups = [];
            self.selectedRequests = [];
        }

        /**
         *
         * @returns {Array}
         */
        self.toJSON = function () {
            return self.list.map(function (elem) {
                return elem.toJSON();
            });
        };

        /**
         * Mark all history requests as deselected
         */
        function deselectReqs(){
            self.selectedRequests.forEach(function (request){
                request.selected = false;
            });
            self.selectedRequests = [];
        }

        /**
         * Mark all history as selected
         */
        function selectReqs(requestsList){
            requestsList.forEach(function (reqObj){
                reqObj.selected = true;
                self.selectedRequests.push(reqObj);
            });
        }
    }

    HistoryListModel.prototype = Object.create(BaseListModel.prototype);

    return HistoryListModel;

});
