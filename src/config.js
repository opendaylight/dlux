/*
NOTE: Configure these values before doing any grunt task to build the application javascript.
These are available from the root scope and elsewhere.
*/
var endpoint_proto = 'http';
var endpoint_host = 'odl.cloudistic.me';
var endpoint_port = '8080';
var endpoint_path = '/controller/nb/v2';

var endpoint_base = endpoint_proto + '://' + endpoint_host + ':' + endpoint_port;

angular.element(document).ready(function () {
        dlux.value('config', {
                endpoint_base : endpoint_base,
                endpoint : endpoint_base + endpoint_path
            });
        dlux.config(['RestangularProvider', function(RestangularProvider) {
          RestangularProvider.setBaseUrl(endpoint_base + endpoint_path);
        }]);
        angular.bootstrap(document, ['dlux']);
    });
