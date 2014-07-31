package org.opendaylight.dlux.bootstrapper.implementation.internal;
/**
* Copyright (c) 2014 Inocybe Technologies, and others. All rights reserved.
*
* This program and the accompanying materials are made available under the
* terms of the Eclipse Public License v1.0 which accompanies this distribution,
* and is available at http://www.eclipse.org/legal/epl-v10.html
*/
import javax.servlet.ServletException;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.opendaylight.dlux.bootstrapper.api.IDluxBootstrapperRegistration;

public class DluxBoostrapper implements BundleActivator, IDluxBootstrapperRegistration {

    @Override
    public void start(BundleContext context) throws Exception {
       System.out.println("DLUX bundle start");
    }

    @Override
    public void stop(BundleContext context) throws Exception {
        // TODO Auto-generated method stub
    }
    @Override
    public void addModule(String bundleName, String url, String requiredJs, String angularJs){
        //TODO
    }
    public void onUnbindService(final HttpService srv) {
        System.out.println("service unbound");
    }

    public void onBindService(final HttpService srv) throws ServletException, NamespaceException {
        if (srv == null) {
            System.out.println("HttpService is null");
               srv.registerServlet("", new DluxCoreServlet(), null, null);
               //srv.registerResources("/module1", name, context);
        } else {
            System.out.println("HttpService is not null");
        }
    }
}
