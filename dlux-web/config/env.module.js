define(['angularAMD'], function(ng) {
    'use strict';

    var config = angular.module('config', [])
        .constant('ENV', {

                baseURL: "@@baseURL",
                adSalPort: "@@adSalPort",
                mdSalPort : "@@mdSalPort",
                configEnv : "@@configEnv",
                getBaseURL : function(salType){
                    if(salType!==undefined){
                        var urlPrefix = "";
                        if(this.configEnv==="ENV_DEV"){
                            urlPrefix = this.baseURL;
                        }else{
                            urlPrefix = window.location.protocol+"//"+window.location.hostname+":";
                        }

                        if(salType==="AD_SAL"){
                            return urlPrefix + this.adSalPort;
                        }else if(salType==="MD_SAL"){
                            return  urlPrefix + this.mdSalPort;
                        }
                    }
                    //default behavior
                    return "";
                }
            });

    return config;
});