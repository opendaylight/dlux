define(['common/navigation/navigation.module'], function(nav) {

  nav.register.factory('MDSalRestangular', function(Restangular, ENV) {
              return Restangular.withConfig(function(RestangularConfig) {
                  RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
              });
          });

  nav.register.factory('ADSalRestangular', function(Restangular, ENV) {
      return Restangular.withConfig(function(RestangularConfig) {
          RestangularConfig.setBaseUrl(ENV.getBaseURL("AD_SAL"));
      });
  });

  nav.register.factory('pollSvc', function(MDSalRestangular,ADSalRestangular) {
      var svc = {
          mdsalbase: function() {
              return MDSalRestangular.one('restconf').one('operational');
          },
          adsalbase: function() {
              return ADSalRestangular.one('controller').one('nb').one('v2');
          },
          yanguibase:function(){
              return MDSalRestangular.one('apidoc').one('apis');
          },
          data : null
      };

      svc.makePoll = function(timeout) {
          this.startPoll("opendaylight-inventory:nodes","nodes",timeout);
          this.startPoll("network-topology:network-topology/topology/flow%3A1","topology",timeout);
          this.startPoll("connectionmanager/nodes","connection_manager",timeout);
          this.startPoll("flowprogrammer/default","flow",timeout);
          this.startPoll("containermanager/containers","container",timeout);
          this.startPoll("staticroute/default/routes","network",timeout);
          this.startPoll("","yangui",timeout);
          this.startPoll("","yangvisualizer",timeout);
      };

      svc.startPoll = function(url,typename,timeout){
          setTimeout(function() {
              if(typename==="nodes" || typename==="topology"){
                  restObj = svc.mdsalbase().one(url).get();
              }
              else if(typename==="yangui" || typename==="yangvisualizer"){
                  restObj = svc.yanguibase().get();
              }
              else{
                  restObj = svc.adsalbase().one(url).get();
              }
              restObj.then(function(){
                  jQuery("li[ng-type='"+typename+"']").show();
                  svc.startPoll(url,typename,timeout!==undefined?timeout*2:5000);
              },function() {
                  jQuery("li[ng-type='"+typename+"']").hide();
                  svc.startPoll(url,typename,timeout!==undefined?timeout*2:5000);
              });

          }, timeout!==undefined?timeout:5000);


      };

      return svc;
  });

});
