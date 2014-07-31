package org.opendaylight.controller.dlux.connection_manager.internal;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DluxConnectionManager implements BundleActivator {
	HttpService httpService;

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
    
    public void onBindBootService(final )
}
