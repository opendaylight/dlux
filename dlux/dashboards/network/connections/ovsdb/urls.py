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
from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa


from dlux.dashboards.network.connections.ovsdb import views


# Node sub urls
node_patterns = patterns(
    '',
    url(r'(?P<table>[^/]+)$', views.RowsView.as_view(),
        name='list'),
    url(r'(?P<table>[^/]+)/(?P<row>[^/]+)$', views.RowsView.as_view(),
        name='get'),
    url(r'^$', views.DetailView.as_view(), name='detail')
)

url_patterns = patterns(
    '',
    url(r'tables', views.TableDefsView.as_view(), name='defs')
)
