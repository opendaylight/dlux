package org.opendaylight.dlux.home;
/**
* Copyright (c) 2014 Inocybe Technologies, and others. All rights reserved.
*
* This program and the accompanying materials are made available under the
* terms of the Eclipse Public License v1.0 which accompanies this distribution,
* and is available at http://www.eclipse.org/legal/epl-v10.html
*/
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
import org.opendaylight.dlux.bootstrapper.IDluxBootstrapperRegistration;

public class DluxHome {
    HttpService httpService;
    IDluxBootstrapperRegistration bootstrapper;
    //final static Logger logger = LoggerFactory.getLogger(DluxCore.class);

    public void onUnbindHttpService(final HttpService srv) {
        //logger.info("Http service unbound");
        this.httpService = null;
    }

    public void onBindHttpService(final HttpService srv) throws NamespaceException {
        if (srv == null) {
            //logger.error("HttpService is null");
        } else {
            //logger.info("HttpService injected");
            this.httpService = srv;
            if (bootstrapper != null) {
                registerCore();
            }
        }
    }

    public void onBindBootService(final IDluxBootstrapperRegistration bootstrapper) throws NamespaceException {
        if (bootstrapper == null) {
            //logger.error("bootstrapperService is null");
        } else {
            //logger.info("bootstrapperService injected");
            this.bootstrapper = bootstrapper;
            if (httpService != null) {
                registerCore();
            }
        }
    }

    public void onUnbindBootService(final IDluxBootstrapperRegistration bootstrapper) {
        //logger.info("Bootstrapper service unbound");
        this.bootstrapper = null;
    }

    public void registerCore() throws NamespaceException{
        if(httpService != null) {
            //logger.info("Registering resources for core");
            httpService.registerResources("/home", "/home", null);
        } else {
            //logger.error("httpService is null. Cannot register resources");
        }
        if (httpService != null && bootstrapper != null) {
            bootstrapper.addModule("home", "/home", "home", "console.home");
        } else {
            //logger.error("bootstrapper is null. Cannot add core module to bootstrapper");
        }
    }
}
