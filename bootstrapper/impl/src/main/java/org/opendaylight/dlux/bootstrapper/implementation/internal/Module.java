package org.opendaylight.dlux.bootstrapper.implementation.internal;

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
    public void setBundleName(String bundleName) {
        this.bundleName = bundleName;
    }
    public String getUrl() {
        return url;
    }
    public void setUrl(String url) {
        this.url = url;
    }
    public String getRequiredJs() {
        return requiredJs;
    }
    public void setRequiredJs(String requiredJs) {
        this.requiredJs = requiredJs;
    }
    public String getAngularJs() {
        return angularJs;
    }
    public void setAngularJs(String angularJs) {
        this.angularJs = angularJs;
    }
}
