package org.opendaylight.dlux.bootstrapper.implementation;
/**
* Copyright (c) 2014 Inocybe Technologies, and others. All rights reserved.
*
* This program and the accompanying materials are made available under the
* terms of the Eclipse Public License v1.0 which accompanies this distribution,
* and is available at http://www.eclipse.org/legal/epl-v10.html
*/

import javax.servlet.ServletException;

import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.opendaylight.dlux.bootstrapper.IDluxBootstrapperRegistration;

public class DluxBootstrapper implements IDluxBootstrapperRegistration {

    @Override
    public void addModule(String bundleName, String url, String requiredJs, String angularJs){
        // TODO
        System.out.println("Adding "+ bundleName + " with url " + url );
        System.out.println("requiredJs: " + requiredJs + " angularJs: " + angularJs);
    }
    public void onUnbindService(HttpService srv) {
        System.out.println("service unbound");
    }

    public void onBindService(HttpService srv) throws ServletException, NamespaceException {
        if (srv == null) {
            System.out.println("HttpService is null");
        } else {
            System.out.println("HttpService is not null");
            srv.registerServlet("/helloworld", new DluxCoreServlet(), null, null);
        }
    }
}
