/*
 * Copyright (c) 2015 Cisco Systems, Inc. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

package org.opendaylight.dlux.loader;

import java.util.List;

/**
 * Copyright (c) 2014 Inocybe Technologies, and others. All rights reserved.
 *
 * <p>
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

public abstract class Module {
    /**
     * Name of the dlux module.
     */
    String moduleName;

    /**
     * url via the module can be accessed.
     */
    String url;

    /**
     * Location of resources to be registered.
     */
    String directory;

    /**
     * Name of the your requireJS module.
     */
    String requireJs;

    /**
     * Name of the angularJs module.
     */
    String angularJs;

    /**
     * List of external or internal css dependencies.
     */
    List<String> cssDependencies;


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

    public void setCssDependencies(List<String> cssDependencies) {
        this.cssDependencies = cssDependencies;
    }

    public String getRequireJs() {
        return requireJs;
    }

    public String getAngularJs() {
        return angularJs;
    }

    public List<String> getCssDependencies() {
        return cssDependencies;
    }
}
