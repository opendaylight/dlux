define(['app/yangman/yangman.module'], function (yangman) {
    'use strict';

    yangman.register.controller('RpcCtrl', RpcCtrl);

    RpcCtrl.$inject = ['$scope'];

    function RpcCtrl($scope){
        var yangRpc = this;

        // methods
        yangRpc.toggleExpanded = toggleExpanded;
        yangRpc.isActionMenu = isActionMenu;
        yangRpc.isNodeInfo = isNodeInfo;

        /**
         * Show hide node
         */
        function toggleExpanded() {
            $scope.node.expanded = !$scope.node.expanded;
        }

        /**
         * Show hide action menu
         * @returns {boolean|*}
         */
        function isActionMenu() {
            return $scope.node.getChildren('description', null, null, 'label').length > 0;
        }

        /**
         * Show hide node info
         * @returns {*}
         */
        function isNodeInfo(){
            return $scope.node.augmentationId;
        }
    }
});

