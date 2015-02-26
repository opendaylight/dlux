package org.opendaylight.dlux.loader.implementation;
/**
* Copyright (c) 2014 Inocybe Technologies, and others. All rights reserved.
*
* This program and the accompanying materials are made available under the
* terms of the Eclipse Public License v1.0 which accompanies this distribution,
* and is available at http://www.eclipse.org/legal/epl-v10.html
*/

import javax.servlet.ServletException;

import com.google.common.base.Preconditions;
import org.opendaylight.dlux.loader.DluxModuleLoader;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

public class DluxLoader implements DluxModuleLoader {

    private DluxLoaderIndexServlet index;
    private static Logger logger = LoggerFactory.getLogger(DluxLoader.class);

    /**
     * List of modules registered with dlux
     */
    private Map<String, Module> modules = new HashMap<>();

    private String RESOURCE_URL = "/";

    private String RESOURCE_DIRECTORY = "/dlux";

    private String SERVLET_URL = "/index.html";

    @Override
    public void addModule(String bundleName, String url, String requiredJs, String angularJs){
        modules.put(bundleName, new Module(bundleName, url, requiredJs, angularJs));
    }

    @Override
    public void removeModule(String bundleName) {
        modules.remove(bundleName);
    }

    public Map<String, Module> getModules() {
        return modules;
    }

    public void onUnbindService(HttpService httpService) {
        httpService.unregister(SERVLET_URL);
        httpService.unregister(RESOURCE_URL);
        index = null;
    }

    public void onBindService(HttpService httpService) throws ServletException, NamespaceException {
        Preconditions.checkNotNull(httpService,
            "Unable to inject HttpService into DluxLoader. dlux modules won't work without httpService");

        index = new DluxLoaderIndexServlet(this);
        httpService.registerServlet(SERVLET_URL, index, null, null);
        httpService.registerResources(RESOURCE_URL, RESOURCE_DIRECTORY, null);
        logger.info("DluxLoader Service initialization complete.");
    }

}
