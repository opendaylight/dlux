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
        self.listGroupedByDate = {};
        self.selectedRequests = [];

        self.addRequestToList = addRequestToList;
        self.clear = clear;
        self.createEntry = createEntry;
        self.deleteRequestItem = deleteRequestItem;
        self.getApiFunction = null;
        self.groupListByDate = groupListByDate;
        self.refresh = refresh;
        self.toggleReqSelection = toggleReqSelection;
        self.setGetApiFunction = setGetApiFunction;

        /**
         * Setter for getApiFunction
         * @param getApiFunction
         */
        function setGetApiFunction(getApiFunction){
            self.getApiFunction = getApiFunction;
        }


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
         * Grouping by date to show date groups in yangman
         */
        function groupListByDate(){
            self.list.forEach(addToListDateGroup);

            function addToListDateGroup(elem){
                var groupName = new Date(elem.timestamp).toDateString();
                if (!self.listGroupedByDate.hasOwnProperty(groupName)){
                    self.listGroupedByDate[groupName] = [];
                }
                self.listGroupedByDate[groupName].push(elem);
            }
        }

        /**
         *
         * @param elem
         * @returns {HistoryRequest|*}
         */
        function createEntry(elem) {
            return RequestsService.createHistoryRequestFromElement(elem, self.getApiFunction);
        }

        /**
         *
         * @param reqObj
         */
        function addRequestToList(reqObj){
            self.list.push(reqObj);
        }

        /**
         * Refresh each element using self.detApiFunction
         */
        function refresh() {
            self.list.forEach(function (elem) {
                elem.refresh(self.getApiFunction);
            });
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
            self.listGroupedByDate = {};
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
    }

    HistoryListModel.prototype = Object.create(BaseListModel.prototype);

    return HistoryListModel;

});
