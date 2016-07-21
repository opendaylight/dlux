define([], function () {
    'use strict';

    angular.module('app.yangman').service('YangmanDesignService', YangmanDesignService);

    function YangmanDesignService(){

        var service = {
            hideMainMenu: hideMainMenu,
            setDraggableLeftPanel: setDraggableLeftPanel,
            setModuleDetailHeight: setModuleDetailHeight,
            disableMdMenuItem: disableMdMenuItem,
            enableMdMenuItem: enableMdMenuItem,
        };

        return service;


        /**
         * Get button dom element from mdMenuItem ng-click $event
         * @param event
         */
        function getButtElemFromMdMenuItemEvent(event) {
            var elemSelAttempt = angular.element(event.toElement.parentElement).find('.md-button'),
                result = null;

            // if mdMenuItem was clicked, it should contain only one button
            if (elemSelAttempt.length === 1) {
                result = elemSelAttempt[0];
            }
            // if span or icon inside button was clicked, button element should be its parent
            else if (elemSelAttempt.length === 0) {
                result = angular.element(event.toElement.parentElement)[0];
            }

            if (result.nodeName === 'BUTTON') {
                return result;
            }
            else {
                return null;
            }
        }

        /**
         * Disable md menu item on which was clicked in event
         * Use to prevent accidentally doubleclicking or enterhitting
         * @param event - $event object from ng-click
         */
        function disableMdMenuItem(event) {
            var buttElem = getButtElemFromMdMenuItemEvent(event);
            if (buttElem) {
                buttElem.disabled = true;
            }
        }


        /**
         * Disable md menu item on which was clicked in event
         * Use to prevent accidentally doubleclicking or enterhitting
         * @param event - $event object from ng-click
         */
        function enableMdMenuItem(event) {
            var buttElem = getButtElemFromMdMenuItemEvent(event);
            if (buttElem) {
                buttElem.disabled = false;
            }
        }


        /**
         * Hide main menu
         */
        function hideMainMenu(){
            $('#wrapper').addClass('toggled');
        }

        /**
         * Sets Draggable Left Side
         * #left-panel
         */
        function setDraggableLeftPanel(){
            if (localStorage.getItem('yangman__left-panel-width') !== null) {
                $('#left-panel').width(localStorage.getItem('yangman__left-panel-width'));
            }

            $('.resizable-e').resizable({
                handles: 'e',
                minWidth: 300,
                stop: function(event, ui) {
                    if (typeof(Storage) !== "undefined") {
                        localStorage.setItem('yangman__left-panel-width', ui.size.width);
                    }
                },
                resize: function() {
                    setModuleDetailHeight();
                }
            });
        }

        /**
         * Set module detail height
         * .yangmanModule__module-detail .tabs
         */
        function setModuleDetailHeight() {
            var height = 'calc(100% - ' + $('.yangmanModule__module-detail h4').outerHeight(true) + 'px)';
            $('.yangmanModule__module-detail .tabs').css({ height: height });
        }

    }
});
