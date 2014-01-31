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

from dlux.dashboards.network.nodes import views

urlpatterns = patterns(
    'dlux.dashboards.network.nodes.views',
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^(?P<node_type>[^/]+)/(?P<node_id>[^/]+)/$',
        views.DetailView.as_view(), name='detail')
)
