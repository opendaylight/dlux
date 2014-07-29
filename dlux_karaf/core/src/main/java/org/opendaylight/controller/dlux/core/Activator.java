package org.opendaylight.controller.dlux.core;
/**
* Copyright (c) 2014 Inocybe Technologies, and others. All rights reserved.
*
* This program and the accompanying materials are made available under the
* terms of the Eclipse Public License v1.0 which accompanies this distribution,
* and is available at http://www.eclipse.org/legal/epl-v10.html
*/
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceEvent;
import org.osgi.framework.ServiceListener;
import org.osgi.framework.ServiceReference;
import org.osgi.framework.ServiceRegistration;
import org.osgi.service.http.HttpService;

public class Activator implements BundleActivator {
	private ServiceRegistration registration;

    @Override
    public void start(final BundleContext context) throws Exception {

        final DluxHttpService httpService = new DluxHttpService();

        ServiceListener servListener = new ServiceListener() {
            public void serviceChanged(ServiceEvent event) {
                ServiceReference sevRef = event.getServiceReference();
                switch(event.getType()) {
                case ServiceEvent.REGISTERED:
                {
                    HttpService hService = (HttpService)context.getService(sevRef);
                    httpService.setHttpService(hService);
                }
                break;
                default:
                    break;
                }
            }
        };

        String filter = "(objectclass=" + HttpService.class.getName() + ")";
        try {
            context.addServiceListener(servListener, filter);
            ServiceReference[] servRefList = context.getServiceReferences(HttpService.class.getName(), filter);
            for(int i = 0; servRefList != null && i < servRefList.length; i++) {
                servListener.serviceChanged(new ServiceEvent(ServiceEvent.REGISTERED,
                        servRefList[i]));
            }

        } catch (InvalidSyntaxException e) {
            e.printStackTrace();
        }


        while(httpService.getHttpService() == null) {
            System.out.println("feature service is null");
            Thread.sleep(100);
        }
        registration = context.registerService(
                DluxHttpService.class.getName(), httpService, null);
        
        //httpService.registerResource();
    }

    @Override
    public void stop(BundleContext context) throws Exception {
        // TODO Auto-generated method stub
    }
}
