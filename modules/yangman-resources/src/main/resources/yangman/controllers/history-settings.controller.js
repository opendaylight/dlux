define([], function () {
    'use strict';

    angular.module('app.yangman').controller('HistorySettingsCtrl', HistorySettingsCtrl);

    HistorySettingsCtrl.$inject = ['$mdDialog', 'settingsObj'];

    function HistorySettingsCtrl($mdDialog, settingsObj) {
        var settingsCtrl = this;

        settingsCtrl.mySettingsObj = settingsObj.clone();

        settingsCtrl.cancel = cancel;
        settingsCtrl.save = save;
        settingsCtrl.saveReceivedChanged = saveReceivedChanged;

        /**
         *
         */
        function saveReceivedChanged() {
            if (!settingsCtrl.mySettingsObj.data.saveReceived) {
                settingsCtrl.mySettingsObj.data.fillWithReceived = false;

            }
        }


        function cancel() {
            $mdDialog.cancel();
        }

        function save() {
            settingsCtrl.mySettingsObj.saveToStorage();
            $mdDialog.hide(settingsCtrl.mySettingsObj);
        }

    }

    return HistorySettingsCtrl;

});
