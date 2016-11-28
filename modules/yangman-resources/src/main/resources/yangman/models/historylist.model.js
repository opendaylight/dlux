define(['app/yangman/models/baselist.model'], function (BaseListModel){
    'use strict';

    /**
     * Base history list object

     * @constructor
     * @param ParsingJsonService
     * @param RequestsService
     */
    function HistoryListModel($filter, ParsingJsonService, RequestsService){

        BaseListModel.call(this, $filter, ParsingJsonService);

        /* jshint validthis: true */
        var self = this;


        /**
         * Array of groups in which are requests from self.list groupped
         * @type {Array}
         */
        self.dateGroups = [];
        self.settings = null;

        self.addItemToList = addItemToList;
        self.clear = clear;
        self.createItem = createItem;
        self.deleteRequestItem = deleteRequestItem;
        self.deselectReqs = deselectReqs;
        self.selectReqs = selectReqs;
        self.toggleReqSelection = toggleReqSelection;
        self.getNewestRequest = getNewestRequest;
        self.setSettings = setSettings;

        /**
         *
         */
        function setSettings(settingsObj) {
            self.settings = settingsObj;
        }


        /**
         * Get request with max timestamp (was executed as the last)
         */
        function getNewestRequest() {
            return $filter('orderBy')(self.list, '-timestamp')[0];
        }

        /**
         * Mark reqObj as selected
         * @param {boolean} onlyOneSelected boolean if only this object should be marked as selected
         * @param reqObj HistoryRequest object to be selected
         */
        function toggleReqSelection(onlyOneSelected, reqObj){
            if (onlyOneSelected){
                self.selectedItems.forEach(function (req){
                    req.selected = false;
                });
                self.selectedItems = [];
            }

            if (reqObj.selected && !onlyOneSelected){
                self.selectedItems.splice(self.selectedItems.indexOf(reqObj), 1);
            }

            reqObj.selected = (reqObj.selected && onlyOneSelected) || !reqObj.selected;
            if (reqObj.selected){
                self.selectedItems.push(reqObj);
            }

        }

        /**
         * Round timestamp to day
         * @param timeStamp
         * @returns {number|*}
         */
        function roundTimestampToDate(timeStamp){
            timeStamp += new Date().getTimezoneOffset() * 60 * 1000;//add on the timezone offset
            timeStamp -= timeStamp % (24 * 60 * 60 * 1000);//subtract amount of time since midnight
            return timeStamp;
        }

        /**
         * Add element to date group
         * @param elem
         */
        function addElemToListDateGroup(elem){
            if (elem.timestamp){
                var groupName = roundTimestampToDate(elem.timestamp),
                    dateGroupArr = self.dateGroups.filter(function (group){
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

        function shiftElemFromListDateGroup(elem){
            if (elem.timestamp){
                var groupName = roundTimestampToDate(elem.timestamp),
                    dateGroupArr = self.dateGroups.filter(function (group){
                        return group.name === groupName;
                    }),
                    dateGroup = dateGroupArr[0];

                dateGroup.requests.shift();
            }
        }


        /**
         *
         * @param elem
         * @returns {HistoryRequest|*}
         */
        function createItem(elem) {
            return RequestsService.createHistoryRequestFromElement(elem);
        }

        /**
         *
         * @param reqObj
         */
        function addItemToList(reqObj){
            self.list.push(reqObj);
            addElemToListDateGroup(reqObj);

            if (self.list.length > self.settings.data.requestsCount) {
                shiftElemFromListDateGroup(self.list.shift());
            }
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
            self.selectedItems = [];
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
            self.selectedItems.forEach(function (request){
                request.selected = false;
            });
            self.selectedItems = [];
        }

        /**
         * Mark all history requests as selected
         */
        function selectReqs(requestsList){
            requestsList.forEach(function (reqObj){
                reqObj.selected = true;
                self.selectedItems.push(reqObj);
            });
        }
    }

    HistoryListModel.prototype = Object.create(BaseListModel.prototype);

    return HistoryListModel;

});
