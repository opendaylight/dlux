package org.opendaylight.controller.dlux.core;

import org.osgi.service.http.HttpService;

public class DluxHttpService {
	HttpService httpService;

	void setHttpService(HttpService hService) {
		this.httpService = hService;
	}
	
	HttpService getHttpService() {
		return this.httpService;
	}
	
	void registerResource() {
		
	}
}
