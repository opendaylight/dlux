package org.opendaylight.dlux.loader.implementation;

/**
 * Copyright (c) 2014 Inocybe Technologies, and others. All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

public class Module {
    private String bundleName;
    private String url;
    private String requiredJs;
    private String angularJs;
    public Module(String bundleName, String url, String requiredJs,
            String angularJs) {
        super();
        this.bundleName = bundleName;
        this.url = url;
        this.requiredJs = requiredJs;
        this.angularJs = angularJs;
    }
    public String getBundleName() {
        return bundleName;
    }
    public String getUrl() {
        return url;
    }
    public String getRequiredJs() {
        return requiredJs;
    }
    public String getAngularJs() {
        return angularJs;
    }
}
