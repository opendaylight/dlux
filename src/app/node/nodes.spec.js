describe("Node Listing Screen", function() {
  var scope, state, nodeServiceMock, rootScope;
  beforeEach(angular.mock.module('ui.state'));
  beforeEach(angular.mock.module('console.node'));
  beforeEach(angular.mock.inject( function( $controller, $q, $state, $rootScope, $templateCache) {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    state = $state;
    $templateCache.put('node/root.tpl.html', '');
    $templateCache.put('node/index.tpl.html', '');
    $templateCache.put('node/detail.tpl.html', '');
    nodeServiceMock = {
      getAllNodes : function() {
        var deferred = $q.defer();
        deferred.resolve([{"node":"node1"}]);
        return deferred.promise;
      },
      getCurrentData : function() {
          return null;
      },
      getNode : function(id){
        var deferred = $q.defer();
        deferred.resolve({"node":[{"id":id}]});
        return deferred.promise;
      }
    };
  }));
  
  
  it("should call get Nodes", angular.mock.inject( function($controller) {
    spyOn(nodeServiceMock, 'getAllNodes').andCallThrough();
    $controller( 'allNodesCtrl', { $scope: scope, NodeInventorySvc:nodeServiceMock });
    state.transitionTo('node.index');
    rootScope.$digest();
    expect(state.current.name).toBe('node.index');
    expect(nodeServiceMock.getAllNodes).toHaveBeenCalled();
    expect(scope.data).toBe('node1');
  }));

  it("ensure node connector link works using existing Data", angular.mock.inject( function($controller, $q) {
      nodeServiceMock.getCurrentData = function() {
        var deferred = $q.defer();
        deferred.resolve([{"node":[{"id":2},{"id" :3}]}]);
        return deferred.promise;
      };
      var stateParams = { nodeId: 2 };
      spyOn(nodeServiceMock, 'getCurrentData').andCallThrough();
      $controller( 'nodeConnectorCtrl', { $scope: scope, $stateParams : stateParams, NodeInventorySvc:nodeServiceMock });
      state.transitionTo('node.detail');
      rootScope.$digest();
      expect(state.current.name).toBe('node.detail');
      expect(nodeServiceMock.getCurrentData).toHaveBeenCalled();
      expect(scope.data.id).toEqual(2);
  }));

  it("ensure node connector can be fetched separately", angular.mock.inject(function($controller) {
      var stateParams = { nodeId: 3 };
      spyOn(nodeServiceMock, 'getCurrentData').andCallThrough();
      spyOn(nodeServiceMock, 'getNode').andCallThrough();
      $controller( 'nodeConnectorCtrl', { $scope: scope, $stateParams : stateParams, NodeInventorySvc:nodeServiceMock });
      state.transitionTo('node.detail');
      rootScope.$digest();
      expect(state.current.name).toBe('node.detail');
      expect(nodeServiceMock.getNode).toHaveBeenCalled();
      expect(scope.data.id).toEqual(3);
  }));
});