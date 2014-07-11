define(['common/filter/common.filters.module'], function(common) {

// Filter to return only valid ports (like id != 0)
  common.register.filter('noRootPorts', function () {
    return function (input) {
      if (!input) {
        return;
      }
      return input.filter(function(port) {
        return port.nodeconnector.id !== "0" ? port : null;
      });
    };
  });
});
