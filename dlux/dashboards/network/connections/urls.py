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


from dlux.dashboards.network.connections import views
from dlux.dashboards.network.connections.ovsdb import urls as ovsdb_urls


urlpatterns = patterns(
    '',
    url(r'^index$', views.IndexView.as_view(), name='index'),
    url(r'^create$', views.CreateView.as_view(), name='create'),
    url(r'(?P<node_type>[^/]+)/(?P<node_id>[^/]+)/detail$',
        views.DetailView.as_view(), name='detail'),

    url(r'^ovsdb/', include(ovsdb_urls.url_patterns, namespace='ovsdb')),
    url(r'^(?P<node_type>[^/]+)/(?P<node_id>[^/]+)/ovsdb/',
        include(ovsdb_urls.node_patterns, namespace='ovsdb_tables'))
)
