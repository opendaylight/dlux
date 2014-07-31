/*
 * Copyright (c) 2014 Inocybe Technologies, and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

define(['angularAMD'], function() {
  var core = angular.module('app.core', []);

  core.config(function($controllerProvider, $compileProvider, $provide) {
    core.register = {
      controller: $controllerProvider.register,
      directive: $compileProvider.directive,
      factory : $provide.factory,
      service : $provide.service
    };
  });

  return core;

});
