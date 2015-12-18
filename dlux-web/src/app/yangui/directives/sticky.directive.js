define(['app/yangui/yangui.module'], function(yangui) {

    yangui.register.directive('sticky', ['$timeout', function($timeout){
        return {
            restrict: 'A',
            scope: {
                offset: '@',
            },
            link: function($scope, $elem, $attrs){
                $timeout(function(){
                    var offsetTop = $scope.offset || 0,
                        $window = angular.element(window),
                        doc = document.documentElement,
                        initialPositionStyle = $elem.css('position'),
                        stickyLine,
                        scrollTop,
                        randomNum = Math.floor((Math.random() * 1000) + 1),
                        $wrapper = $('<div class="sticky-element'+randomNum+'"></div>');


                    // Set the top offset
                    //
                    $elem.css('top', offsetTop+'px');


                    // Get the sticky line
                    //
                    function setInitial(){
                        $elem.addClass('not-sticky');
                        $elem.wrap($wrapper);
                        getStickyLine();
                        checkSticky();
                    }

                    function getStickyLine(){
                        //stickyLine = $elem[0].offsetTop - offsetTop;
                        stickyLine = $($elem).offset().top - offsetTop;
                    }

                    // Check if the window has passed the sticky line
                    //
                    function checkSticky(){
                        scrollTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
                        // $('.sticky-element'+randomNum).css('height', parseInt($elem.css('height')) === 0 ? 'auto' : $elem.css('height'));

                        if ( scrollTop >= stickyLine ){
                            $elem.css('position', 'fixed').removeClass('not-sticky').addClass('is-sticky');
                            $('.sticky-element'+randomNum).css('height', parseInt($elem.css('height')) === 0 ? 'auto' : $elem.css('height'));

                        } else {
                            $elem.css('position', initialPositionStyle).removeClass('is-sticky').addClass('not-sticky');
                            $('.sticky-element'+randomNum).css('height','auto');
                        }

                        var _ = $elem.hasClass('not-sticky') ? getStickyLine() : null;

                    }


                    // Handle the resize event
                    //
                    function resize(){
                        // $elem.css('position', initialPositionStyle);
                        // $timeout(setInitial);
                    }


                    // Attach our listeners
                    //
                    $window.on('scroll', checkSticky);
                    $window.on('resize', resize);
                    
                    setInitial();
                });
            },
        };
    }]);
});