package org.opendaylight.dlux.bootstrapper;

public interface IDluxBootstrapperRegistration {
    public void addModule(String bundleName, String url, String requiredJs, String angularJs);
}
