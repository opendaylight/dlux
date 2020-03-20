/*
 * Copyright (c) 2014, 2015 Inocybe Technologies, and others. All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

package org.opendaylight.dlux.loader;

/**
 * Service to register module with dlux.
 */
public interface DluxModuleLoader {

    void addModule(Module module);

    void removeModule(Module module);
}
