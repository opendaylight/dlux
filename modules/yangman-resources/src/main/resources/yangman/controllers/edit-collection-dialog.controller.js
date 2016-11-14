define([], function () {
    'use strict';

    angular.module('app.yangman').controller('EditCollectionDialogCtrl', EditCollectionDialogCtrl);

    EditCollectionDialogCtrl.$inject = ['$mdDialog', 'collection', 'allCollections', 'duplicate'];

    function EditCollectionDialogCtrl($mdDialog, collection, allCollections, duplicate) {
        var vm = this;

        vm.collection = collection;
        vm.existingNames = [];
        vm.duplicate = duplicate;
        vm.collectionName = duplicate ? '' : vm.collection.name;

        vm.cancel = cancel;
        vm.save = save;

        init();

        /**
         * Load existing collection names
         */
        function init(){
            vm.existingNames = allCollections.map(function (item){
                return item.name;
            });
        }

        function cancel() {
            $mdDialog.cancel();
        }

        function save() {
            $mdDialog.hide([vm.collection.name, vm.collectionName]);
        }

    }

    return EditCollectionDialogCtrl;

});
