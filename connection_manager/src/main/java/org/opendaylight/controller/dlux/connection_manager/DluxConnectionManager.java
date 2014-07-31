package org.opendaylight.controller.dlux.connection_manager;
/**
* Copyright (c) 2014 Inocybe Technologies, and others. All rights reserved.
*
* This program and the accompanying materials are made available under the
* terms of the Eclipse Public License v1.0 which accompanies this distribution,
* and is available at http://www.eclipse.org/legal/epl-v10.html
*/
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.opendaylight.dlux.bootstrapper.api.IDluxBootstrapperRegistration;

public class DluxConnectionManager implements BundleActivator {
	HttpService httpService;
	IDluxBootstrapperRegistration bootstrapper;

    @Override
    public void start(BundleContext context) throws Exception {
       System.out.println("DLUX bundle start");
    }

    @Override
    public void stop(BundleContext context) throws Exception {
    	//
    }

    public void onUnbindHttpService(final HttpService srv) {
        System.out.println("service unbound");
        this.httpService = null;
    }

    public void onBindHttpService(final HttpService srv) {
        if (srv == null) {
            System.out.println("HttpService is null");
        } else {
            System.out.println("HttpService is not null");
            this.httpService = srv;
            //srv.registerServlet("DluxCoreServlet", new DluxCoreServlet(), null, context);
        }
    }
    
    public void onBindBootService(final IDluxBootstrapperRegistration bootstrapper) {
        if (bootstrapper == null) {
            System.out.println("bootstrapperService is null");
        } else {
            System.out.println("bootstrapperService is not null");
            this.bootstrapper = bootstrapper;
        }
    }
    
    public void onUnbindBootService(final IDluxBootstrapperRegistration bootstrapper) {
        System.out.println("service unbound");
        this.bootstrapper = null;
    }
    
    public void registerConnection_manager() throws NamespaceException{
    	// MOVE to a class?
    	httpService.registerResources("/connection_manager", "/connection_manager", null);
    	//bootstrapper.addModule("connection_manager", "/connection_manager", "core.module", " app.nodes");
    }
}
