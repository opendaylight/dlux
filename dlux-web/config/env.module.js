define(['angularAMD'], function(ng) {
    'use strict';

    var config = angular.module('config', [])
        .constant('ENV', {baseURL: '@@baseURL'});

    return config;
});