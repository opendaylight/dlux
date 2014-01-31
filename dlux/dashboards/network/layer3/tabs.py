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

from horizon import tabs

from dlux.api import get_client
from dlux.dashboards.network.layer3.subnets.tables import SubnetsTable
from dlux.dashboards.network.layer3.staticroutes.tables \
    import StaticRoutesTable


class SubnetsTab(tabs.TableTab):
    table_classes = [SubnetsTable]
    name = _("Subnets")
    slug = "subnets"
    template_name = "horizon/common/_detail_table.html"

    def get_subnets_data(self):
        client = get_client(self.request)
        return client.subnets.list()


class StaticRoutesTab(tabs.TableTab):
    table_classes = [StaticRoutesTable]
    name = _("StaticRoutes")
    slug = "staticroutes"
    template_name = "horizon/common/_detail_table.html"

    def get_staticroutes_data(self):
        client = get_client(self.request)
        return client.staticroutes.list()


class NetworksTabs(tabs.TabGroup):
    slug = "networkstab"
    tabs = (SubnetsTab, StaticRoutesTab,)
    sticky = True
