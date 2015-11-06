define(['common/general/common.general.module'], function(general) {

  // Filter to return only valid ports (like id != 0)
  general.filter('noRootPorts', function () {
    return function (input) {
      if (!input) {
        return;
      }
      return input.filter(function(port) {
        return port.nodeconnector.id !== "0" ? port : null;
      });
    };
  });

  general.filter('shorten', function() {
    return function(input, length, placeHolder) {
      placeHolder = placeHolder ? placeHolder : '...';
      if(!input || input.length <= length){
        return input;
      }
      else{
        var lastPartLength = Math.floor(length/2), firstPartLength = length - lastPartLength;
        return input.substring(0, firstPartLength) + placeHolder + input.substring(input.length - lastPartLength);
      }
      
    };
  });


});
