# Copyright 2014 Hewlett-Packard Development Company, L.P.
#
# Author: Endre Karlson <endre.karlson@hp.com>
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.
from django.conf.urls import include  # noqa
from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa

from dlux.dashboards.network.layer3 import views
from dlux.dashboards.network.layer3.staticroutes import urls \
    as staticroutes_urls
from dlux.dashboards.network.layer3.subnets import urls as subnet_urls

urlpatterns = patterns(
    '',
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'staticroutes/',
        include(staticroutes_urls, namespace='staticroutes')),
    url(r'subnets/', include(subnet_urls, namespace='subnets'))

)
