package org.opendaylight.dlux.loader;
/**
* Copyright (c) 2014 Inocybe Technologies, and others. All rights reserved.
*
* This program and the accompanying materials are made available under the
* terms of the Eclipse Public License v1.0 which accompanies this distribution,
* and is available at http://www.eclipse.org/legal/epl-v10.html
*/
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.opendaylight.dlux.loader.IDluxLoaderRegistration;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;

public class DluxModule {

    private HttpService httpService;
    private IDluxLoaderRegistration loader;
    final static Logger logger = LoggerFactory.getLogger(DluxModule.class);

    private String moduleName = "";
    private String url = "";
    private String directory = "";
    private String requireJs = "";
    private String angularJs = "";

    public void setHttpService(HttpService httpService){
        this.httpService = httpService;
    }

    public void setLoader(IDluxLoaderRegistration loader){
        this.loader = loader;
    }

    public void setModuleName(String moduleName){
        this.moduleName = moduleName;
    }

    public void setUrl(String url){
        this.url = url;
    }

    public void setDirectory(String directory){
        this.directory = directory;
    }

    public void setRequireJs(String requireJs){
        this.requireJs = requireJs;
    }

    public void setAngularJs(String angularJs){
        this.angularJs = angularJs;
    }

    public void init() throws NamespaceException{

        if(httpService != null) {
            logger.info("Registering resources for %s",moduleName);
            httpService.registerResources(url, directory, null);
        } else {
            logger.error("httpService is null. Cannot register resources");
        }
        if (httpService != null && loader != null) {
            loader.addModule(moduleName, url, requireJs, angularJs);
        } else {
            logger.error("loader is null. Cannot add core module to loader");
        }
    }
}
