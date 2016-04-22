define(['app/yangui/yangui.module'], function(yangui) {

    yangui.register.service('DesignUtilsService', function(){

        var d = {};

        d.setDraggablePopups = function(){
            $( ".draggablePopup" ).draggable({
                opacity: 0.35,
                containment: "#page-wrapper",
                cancel: 'pre, input, textarea, span, select'
            });

            $(function() {
                $( ".resizable-se" ).resizable({ handles: 'se' });
                $( ".resizable-s" ).resizable({ handles: 's', minHeight: 200 });
            });
        };

        d.getHistoryPopUpWidth = function(){
            var getWidth = function(){
                return $('.topologyContainer.previewContainer.historyPopUp').width();
            };


            if ( getWidth() !== null ) {
                $('.topologyContainer.previewContainer.historyPopUp').css({'marginLeft':'-'+(getWidth()/2)+'px'});
            }
        };

        d.triggerWindowResize = function (timeout) {
            var t = timeout ? timeout : 1;

            setTimeout(function(){
                $(window).trigger('resize');
            }, t);


        };

        return d;

    });

});