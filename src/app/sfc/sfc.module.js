define([
  'app/routingConfig',
  'Restangular',
  'angular-translate-loader-static-files',
  'jquery-ui',
  'ui-bootstrap',
  'd3',
  'underscore-string',
  'ui-unique',
  'ui-sortable',
  'ngDragDrop',
  'xeditable',
  'angular-sanitize',
  'ui-select2'], function () {

  var sfc = angular.module('app.sfc', ['app.core', 'ui.router.state', 'restangular', 'ui.bootstrap', 'ui.unique', 'ui.sortable', 'ngDragDrop', 'xeditable', 'ngSanitize', 'ui.select2']);

  sfc.register = sfc;

  return sfc;
});