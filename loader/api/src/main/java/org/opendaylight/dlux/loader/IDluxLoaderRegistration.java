package org.opendaylight.dlux.loader;

public interface IDluxLoaderRegistration {
    public void addModule(String bundleName, String url, String requiredJs, String angularJs);
}
