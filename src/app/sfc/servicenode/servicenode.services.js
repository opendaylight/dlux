define(['app/sfc/sfc.module'], function (sfc) {

  sfc.register.factory('ServiceNodeCtrlFunc', function ($rootScope) {
    var svc = {};

    svc.createGraphData = function (nodeArray, sfs) {
      var graphData = [];
      //foreach service node
      _.each(nodeArray, function (sn) {
        var nodeSffs = [];

        //get info about its service functions
        _.each(sn['service-function'], function (sfName) {
          var sf = _.findWhere(sfs, {name: sfName});

          if (angular.isDefined(sf)) {
            //add necessary graph info about SF
            sf.text = {x: -50, y: 20, align: "top"};
            sf.image = {url: "assets/images/Device_switch_3062_unknown_64.png", wh: "40", xy: "-20"};
            sf.tooltipHtml =
              "<p style='text-align: center;'>" +
              $rootScope.$eval(('"SFC_TOOLTIP_FUNCTION" | translate')) + ":" + "</p>" +
              $rootScope.$eval(('"SFC_TOOLTIP_NAME" | translate')) + ": " + sf.name + "<br/>" +
              $rootScope.$eval(('"SFC_TOOLTIP_IP" | translate')) + ": " + sf['ip-mgmt-address'] + "<br/>" +
              $rootScope.$eval(('"SFC_TOOLTIP_TYPE" | translate')) + ": " + sf.type + "<br/>";


            //assign sfs to service function forwarders
            var sff = _.findWhere(nodeSffs, {name: sf['service-function-forwarder']});
            //if forwarder exists, push sf into its children element
            if (angular.isDefined(sff)) {
              sff.children.push(sf);
            }
            //if not, create SFF and then push SF into it
            else {
              nodeSffs.push({
                "name": sf['service-function-forwarder'],
                "nodeType": "sff",
                "text": {x: -50, y: -80, align: "bottom"},
                "image": {url: "assets/images/GenericSoftswitch.png", wh: "50", xy: "-25"},
                "tooltipHtml": "<p style='text-align: center;'>" +
                  $rootScope.$eval(('"SFC_TOOLTIP_FORWARDER" | translate')) + ":" + "</p>" +
                  $rootScope.$eval(('"SFC_TOOLTIP_NAME" | translate')) + ": " + sf['service-function-forwarder'] + "<br/>",
                "children": []
              });
              nodeSffs[nodeSffs.length - 1].children.push(sf);
            }
          }
        });

        //create SN graphData
        var nodeData = {
          "name": sn['name'],
          "text": {x: -50, y: -80, align: "bottom"},
          "image": {url: "assets/images/ibm_FEP.png", wh: "60", xy: "-30"},
          "tooltipHtml": "<p style='text-align: center;'>" +
            $rootScope.$eval(('"SFC_TOOLTIP_NODE" | translate')) + ":" + "</p>" +
            $rootScope.$eval(('"SFC_TOOLTIP_NAME" | translate')) + ": " + sn[name] + "<br/>" +
            $rootScope.$eval(('"SFC_TOOLTIP_IP" | translate')) + ": " + sn['ip-mgmt-address'] + "<br/>",
          "children": nodeSffs
        };

        graphData.push(nodeData);
      });
      return graphData;
    };

    return svc;
  });

});

