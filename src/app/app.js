
var endpoint_proto = 'http';
var endpoint_host = 'localhost';
var endpoint_port = '8080';
var endpoint_path = '/restconf';
//var endpoint_path = "/controller/web/devices";
var endpoint_base = endpoint_proto + '://' + endpoint_host + ':' + endpoint_port;
angular.module('console', [
        'templates-app', 'ngCookies',
        'templates-common',
        'ui.state',
        'ui.route',
        'ui.bootstrap',
        'pascalprecht.translate',
        'common.navigation',
        'common.breadcrumb',
        'common.topbar',
        'common.auth',
        'console.connection_manager',
        'console.container',
        'console.flow',
        'console.networking',
        'console.node',
        'console.topology',
        'console.yangui',
        //'console.user',
        'common.general', 
        'common.nbapi',
        'common.services',
        'common.filters',
        'common.topology',
        'ngGrid',
        'restangular',
        'ui.select2',
        'common.dlux.navigation',
        'common.yangUtils'
        //'console.span_ports'
    ])

	.config(function myAppConfig($httpProvider, $stateProvider, $urlRouterProvider, RestangularProvider, $translateProvider) {
      $httpProvider.defaults.withCredentials = true;
      RestangularProvider.setBaseUrl(endpoint_base + endpoint_path);
      $urlRouterProvider.otherwise('/node/index');
      $translateProvider.useStaticFilesLoader({
        prefix: 'assets/data/locale-',
        suffix: '.json'
      });
      $translateProvider.preferredLanguage('en_US');
	})

	.run(function run() {
	})

	.controller('AppCtrl', function AppCtrl($rootScope, $http, $scope, $state, $location, $window, $cookieStore, navigationFactory, Auth) {    
    $window.useMobile = 
      function() { 
       if( navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) ||
           navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) ||
           navigator.userAgent.match(/Windows Phone/i) ) {
         return true;
       }
       else {
         return false;
       } 
     };   
		$scope.$on('$stateChangeSuccess', function () {
			// for now, we are going to change the logo with static statements
			$scope.logo = "logo_";
			if($scope.isState('flow')) {
				$scope.logo += "flow";
			}
			else if($scope.isState('node')) {
				$scope.logo += "node";
			}
			else if($scope.isState('connection_manager')) {
				$scope.logo += "connection_manager";
			}
			else if($scope.isState('topology')) {
				$scope.logo += "topology";
			}
			else if($scope.isState('network')) {
				$scope.logo += "network";
			}
			else if($scope.isState('container')) {
				$scope.logo += "container";
			}

			$scope.init($scope.navList, 1);
		});

		$scope.getText = function(text) { // firefox use textContent while chrome use innerText...
			return text.innerText||text.textContent;
		};

		$rootScope.$on('$stateChangeStart', function(event, next, current){
			
			//if (!Auth.isAuthed()) {
				//$window.location.href = 'login.html';
			//}
			
			$scope.navList = navigationFactory.getNavigationData($window.useMobile());
		});

		$scope.isState = function(strState) {
			return $state.includes(strState);
		};

		$scope.reset_items = function(navList) {
			for(var i in navList)
			{
				if(!navList.hasOwnProperty(i)) {continue;}
				var item = navList[i];
				item['class'] = false;
		
				if('submenu' in item)
				{
					this.reset_items(item['submenu']);
				}
			}
		};
		$scope.init = function(navList , level) {
			$scope.reset_items(navList);
			var ret = false;
			var isOpen = false;
			for(var i in navList)
			{
				if(!navList.hasOwnProperty(i)) {continue;}
				var item = navList[i];

				item['icon'] = item['icon'] || false;//if there is no icon for this item, we set it as false, otherwise in recursive modes it will lookup the parent's scope and use that one's icon istrad
				item['class'] = item['class'] || false;//same as above
				item['submenu?'] = ('submenu' in item);//same as above
				item['badge'] = item['badge'] || false;//same as above
				item['label'] = item['label'] || false;//same as above
	 
				item['level-'+level] = true;//in printing out menu items, we use a partial recursively, but we have different needs for level-1 & level-2, etc items ... so we specify this data with each item
				for(var l = level - 1 ; l > 0 ; l--) {item['level-'+l] = false;}
				//why? because when we have "level-2"=true  then parent's "level-1" will also be true,
				//and mustache looks up the parent context's value as well, so the part between {{#level-1}}{{/level-1}} will be
				//executed even when we are printing level-2 menu items (i.e submenu) recursively
				//see views/layouts/partials/default/sidenav/items.mustache
				//maybe using something like handlebars with a little bit of logic is better here
				//or perhaps not using recursive partials, and a different partial for each other
				if(("index.html#" + $location.path()) == item['link'] || ($location.path() == "/" && item.title == "Dashboard"))
				{
					//item['class'] = 'active';
					$scope.title = item.page["title"];
					$scope.description = item.page["description"];
					if(item['submenu?']) {item['class'] += ' no-active-child';}//rare case, it means that this item has been directly selected, not a child of it, so it's not opened and take care of the caret using "no-active-child" class
		
					$scope.breadcrumbs['title'] = item['title'];//add the active page's title to breadcrumb object
					ret = true;//this item is active so we return true
				}//if current page
	 
				if(item['submenu?'])
				{
					//isOpen = $scope.init(item['submenu'] , level+1);
					if(isOpen)
					{
					
						//item['class'] = 'active open';//an item in the submenu of this item is active, so set this as "active" & "open"
			
						//make the array if it doesn't exist
						$scope.breadcrumbs['links'] = $scope.breadcrumbs['links'] || [];
						//add the parent of this active submenu item to the breadcrumbs list
						$scope.breadcrumbs['links'].push({'link': (item['link'] ? item['link']+'.html' : '#'), 'title':item['title']});
						
						ret = true;
					}
				}//it has submenu
	 
			}//for
		return ret;
		};

		$scope.isCollapse = false;
		$scope.breadcrumbs = {};
    });
