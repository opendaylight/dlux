define([], function (){
    'use strict';
    angular.module('app.yangui').controller('CollBoxCtrl', CollBoxCtrl);

    CollBoxCtrl.$inject = ['$scope', 'HistoryService'];

    // todo: comment the whole controller
    function CollBoxCtrl($scope, HistoryService) {

        $scope.collection = {
            name: '',
            group: '',
        };
        $scope.editBox = false;
        $scope.selectedRequest = null;

        $scope.addHistoryItemToColl = addHistoryItemToColl;
        $scope.moveHistoryItemToGroup = moveHistoryItemToGroup;

        $scope.$on('COLL_CLEAR_VAL_SET_REQ', collClearVal);

        function addHistoryItemToColl(){
            var elemToAdd = $scope.selectedRequest.clone();

            HistoryService.setNameAndGroup($scope.collection.name, $scope.collection.group, elemToAdd);
            $scope.saveElemToList(elemToAdd);

            if ($scope.editBox) {
                $scope.deleteRequestItem($scope.selectedRequest, 'collectionList');
            }

            $scope.hideCollBox();
        }

        function moveHistoryItemToGroup(elem) {
            var elemToMove = elem.clone();

            HistoryService.setNameAndGroup($scope.collection.name, $scope.collection.group, elemToMove);
            $scope.saveElemToList(elemToMove);
            $scope.deleteRequestItem(elem, 'collectionList');
            $scope.hideCollBox();
        }

        function collClearVal(e, req, edit){
            $scope.collection.name = edit ? req.name : '';
            $scope.collection.group = edit ? req.groupName : '';
            $scope.selectedRequest = req;
            $scope.editBox = edit;
        }

    }

});
