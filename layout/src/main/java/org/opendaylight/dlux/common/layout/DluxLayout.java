package org.opendaylight.dlux.common.layout;
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

//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
import org.opendaylight.dlux.bootstrapper.IDluxBootstrapperRegistration;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;

public class DluxLayout {
    HttpService httpService;
    IDluxBootstrapperRegistration bootstrapper;
    //final static Logger logger = LoggerFactory.getLogger(DluxCore.class);

    // Module Information
    String moduleName = "layout";
    String url = "/layout";
    String directory = "/layout";
    String requireJs = "layout.module";
    String angularJs = "app.common.layout";

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

    public void readConfig() {
        Properties prop = new Properties();
        InputStream input = null;

        try {
            String filename = "config.properties";
            input = DluxLayout.class.getClassLoader().getResourceAsStream(filename);
            if(input==null){
                System.out.println("Sorry, unable to find " + filename + ". Using default values.");
                return;
            }
            //load a properties file from class path, inside static method
            prop.load(input);

            this.moduleName = prop.getProperty("name");
            this.url = prop.getProperty("url");
            this.directory = prop.getProperty("directory");
            this.requireJs = prop.getProperty("requirejs");
            this.angularJs = prop.getProperty("angularjs");

        } catch (IOException ex) {
            ex.printStackTrace();
        } finally{
            if(input!=null){
                try {
                    input.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public void registerCore() throws NamespaceException{
        readConfig();

        if(httpService != null) {
            //logger.info("Registering resources for core");
            httpService.registerResources(url, directory, null);
        } else {
            //logger.error("httpService is null. Cannot register resources");
        }
        if (httpService != null && bootstrapper != null) {
            bootstrapper.addModule(moduleName, url, requireJs, angularJs);
        } else {
            //logger.error("bootstrapper is null. Cannot add core module to bootstrapper");
        }
    }
}
