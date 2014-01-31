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
from dlux.dashboards.network.nodes import tables


class ConnectorTab(tabs.TableTab):
    table_classes = (tables.ConnectorTable,)
    name = _("Connectors")
    slug = "connectors"
    template_name = "horizon/common/_detail_table.html"

    def get_connectortable_data(self):
        client = get_client(self.request)
        return client.nodes.list_connectors(**self.tab_group.kwargs)


class DetailTabs(tabs.TabGroup):
    slug = "access_security_tabs"
    tabs = (ConnectorTab,)
    sticky = True
