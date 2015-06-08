/*
 * Copyright (c) 2015 Cisco Systems, Inc. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

package org.opendaylight.dlux.loader;

import org.junit.Test;
import org.junit.Assert;
import org.opendaylight.dlux.loader.exception.DluxLoaderException;
import org.opendaylight.dlux.loader.implementation.DluxLoader;
import org.opendaylight.dlux.loader.implementation.DluxLoaderIndexServlet;

import java.util.Properties;


public class DluxLoaderIndexServletTest {

    private DluxLoader dluxLoader = new DluxLoader();

    @Test
    public void testLoadModulePropertyFile() throws DluxLoaderException {

        DluxLoaderIndexServlet indexServlet = new DluxLoaderIndexServlet(dluxLoader);
        Properties properties = indexServlet.getProp();
        String requireJS = properties.getProperty("requireJS");
        Assert.assertNotNull(requireJS);
        Assert.assertTrue(requireJS.contains("'angularAMD',"));
        String angularJS = properties.getProperty("angularJS");
        Assert.assertNotNull(angularJS);
        Assert.assertTrue(angularJS.contains("'ui.router',"));

    }

}
