package org.opendaylight.dlux.web;

import org.osgi.util.tracker.ServiceTracker;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.framework.BundleActivator;
import org.osgi.service.http.HttpService;

public class Activator implements BundleActivator {
  private ServiceTracker httpTracker;

  public void start(BundleContext context) throws Exception {
    httpTracker = new ServiceTracker(context, HttpService.class.getName(), null) {
      public void removedService(ServiceReference reference, Object service) {

        try {
           ((HttpService) service).unregister("/dlux");
        } catch (IllegalArgumentException exception) {
           // Ignore; servlet registration probably failed earlier on...
        }
      }

      public Object addingService(ServiceReference reference) {
        // HTTP service is available, register our servlet...
        HttpService httpService = (HttpService) this.context.getService(reference);
        try {
          httpService.registerResources("/dlux", "/pages",  null);
        } catch (Exception exception) {
          exception.printStackTrace();
        }
        return httpService;
      }
    };
    httpTracker.open();
  }

  public void stop(BundleContext context) throws Exception {
    httpTracker.close();
  }
}