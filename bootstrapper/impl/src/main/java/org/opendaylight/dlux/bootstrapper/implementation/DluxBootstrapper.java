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

    private DluxBootstrapperServlet modules;
    private DluxBootstrapperIndexServlet index;

    @Override
    public void addModule(String bundleName, String url, String requiredJs, String angularJs){
        modules.addModule(bundleName, url, requiredJs, angularJs);
    }
    public void onUnbindService(HttpService srv) {
        modules = null;
        index = null;
    }

    public void onBindService(HttpService srv) throws ServletException, NamespaceException {
        if (srv == null) {
            System.out.println("Unable to inject HttpService into DluxBootstrapper.");
        } else {
            modules = new DluxBootstrapperServlet();
            index = new DluxBootstrapperIndexServlet();
            srv.registerServlet("/src/app/modules.js", modules, null, null);
            srv.registerServlet("/index.html", index, null, null);
            srv.registerResources("/", "/dlux", null);
        }
    }
}
