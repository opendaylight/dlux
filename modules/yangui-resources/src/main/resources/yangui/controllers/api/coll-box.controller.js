define([], function() {
    angular.module('app.yangui').controller('collBoxCtrl', ['$scope','HistoryService',function ($scope, HistoryService) {

        $scope.collection = {
            name: '',
            group: ''
        };

        $scope.selectedRequest = null;
        $scope.editBox = false;

        $scope.addHistoryItemToColl = function(){
            var elemToAdd = $scope.selectedRequest.clone();

            HistoryService.setNameAndGroup($scope.collection.name, $scope.collection.group, elemToAdd);
            $scope.saveElemToList(elemToAdd);

            if ( $scope.editBox ) {
                $scope.deleteRequestItem($scope.selectedRequest, 'collectionList');
            }

            $scope.hideCollBox();
        };

        $scope.moveHistoryItemToGroup = function(elem, event){
            var elemToMove = elem.clone();

            HistoryService.setNameAndGroup($scope.collection.name, $scope.collection.group, elemToMove);
            $scope.saveElemToList(elemToMove);
            $scope.deleteRequestItem(elem, 'collectionList');
            $scope.hideCollBox();
        };

        $scope.$on('COLL_CLEAR_VAL_SET_REQ', function(e, req, edit){
            $scope.collection.name = edit ? req.name : '';
            $scope.collection.group = edit ? req.groupName : '';
            $scope.selectedRequest = req;
            $scope.editBox = edit;
        });

    }]);

});
