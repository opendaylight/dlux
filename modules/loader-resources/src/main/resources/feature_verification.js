/*
 * Copyright (c) 2014 Cisco Systems, Inc. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

function poll(url,typename,timeout) {
    setTimeout(function() {
        $.ajax({ url: window.location.origin+url,
            success:function(data){
                jQuery("li[ng-type='"+typename+"']").show();
            }, error: function(jqXHR, textStatus, errorThrown) {
                jQuery("li[ng-type='"+typename+"']").hide();}, dataType: "json",complete: poll(url,typename,timeout!==undefined?timeout*2:5000)
        });
    }, timeout!==undefined?timeout:5000);
}

poll("/restconf/operational/opendaylight-inventory:nodes","nodes");
poll("/restconf/operational/network-topology:network-topology/topology/flow%3A1","topology");
poll("/controller/nb/v2/connectionmanager/nodes","connection_manager");
poll("/controller/nb/v2/flowprogrammer/default","flow");
poll("/controller/nb/v2/containermanager/containers","container");
poll("/controller/nb/v2/staticroute/default/routes","network");
poll("/apidoc/apis","yangui");
