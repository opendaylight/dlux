package org.opendaylight.dlux.loader;
/**
* Copyright (c) 2014 Inocybe Technologies, and others. All rights reserved.
*
* This program and the accompanying materials are made available under the
* terms of the Eclipse Public License v1.0 which accompanies this distribution,
* and is available at http://www.eclipse.org/legal/epl-v10.html
*/

import com.google.common.base.Preconditions;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.osgi.service.http.HttpService;

/**
 * At startup of each karaf bundle, each UI module creates an instance of this class
 * via blueprint.
 * Initalize method gets called at loading of bundle.
 */

public class DluxModule {

    final static Logger logger = LoggerFactory.getLogger(DluxModule.class);

    /**
     * http Service is required to register resources for the specified url.
     */
    private HttpService httpService;
    /**
     * loader to enable this module with dlux
     */
    private DluxModuleLoader loader;

    /**
     * Name of the dlux module
     */
    private String moduleName;

    /**
     * url via the module can be accessed
     */
    private String url;

    /**
     * Location of resources to be registered
     */
    private String directory;

    /**
     * Name of the requireJS module
     */
    private String requireJs;

    /**
     * Name of the angularJs module
     */
    private String angularJs;

    public void setHttpService(HttpService httpService) {
        this.httpService = httpService;
    }

    public void setLoader(DluxModuleLoader loader) {
        this.loader = loader;
    }

    public void setModuleName(String moduleName) {
        this.moduleName = moduleName;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public void setDirectory(String directory) {
        this.directory = directory;
    }

    public void setRequireJs(String requireJs) {
        this.requireJs = requireJs;
    }

    public void setAngularJs(String angularJs) {
        this.angularJs = angularJs;
    }

    public void initialize() {
        Preconditions.checkNotNull(httpService, "Module can not start without http service");
        Preconditions.checkNotNull(url, "module url is missing. Module can not be instantiated");
        Preconditions.checkNotNull(directory, "resource directory is missing. Module can not be instantiated");

        logger.info("Registering resources for url {}", url);
        try {
            httpService.registerResources(url, directory, null);
        } catch (NamespaceException e) {
            logger.error("Exception occurred while registering resources with http service.", e);
        }

        if(loader != null) {
            Preconditions.checkNotNull(moduleName, "module name is missing. Module can not be registered with dlux");
            Preconditions.checkNotNull(requireJs, "requireJs module name is missing. Module can not be registered with dlux");
            Preconditions.checkNotNull(angularJs, "angularJs module name is missing. Module can not be registered with dlux");
            logger.info("Registering angularJS and requireJs modules for {}", moduleName);
            loader.addModule(moduleName, url, requireJs, angularJs);
        }
    }

    public void clean() {
        logger.info("Unregistering resources for url {}", url);

        httpService.unregister(url);

        if(loader != null) {
            loader.removeModule(moduleName);
        }
    }
}
