define(['angularAMD'], function(ng) {
    'use strict';

    var config = angular.module('config', [])
        .constant('ENV', {baseURL: 'http://localhost:8080'});

    return config;
});