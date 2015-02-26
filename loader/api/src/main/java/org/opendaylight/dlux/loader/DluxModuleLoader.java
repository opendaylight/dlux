package org.opendaylight.dlux.loader;

/**
 * Service to register module with dlux
 */
public interface DluxModuleLoader {

    public void addModule(String bundleName, String url, String requiredJs, String angularJs);

    public void removeModule(String bundleName);
}
