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
from django.utils.translation import ugettext_lazy as _
from django.shortcuts import render_to_response

from horizon import tabs

from dlux.api import get_client
from dlux.dashboards.network.connections.ovsdb import tables as ovsdb_tables


class OVSDBTab(tabs.Tab):
    name = _("OVSDB")
    slug = "ovsdb"
    template_name = "network/connections/detail_ovsdb.html"

    def get_context_data(self, request):
        return {'table': ovsdb_tables.TABLES}


class OverviewTab(tabs.Tab):
    name = _("Overview")
    slug = "overview"
    template_name = "network/connections/detail_overview.html"

    def get_context_data(self, request):
        return {}


class DetailTabs(tabs.TabGroup):
    slug = "detail_tabs"
    tabs = (OverviewTab, OVSDBTab)
    sticky = True
