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


from horizon import tables as horizon_tables
from horizon import tabs as horizon_tabs
from horizon import workflows as horizon_workflows

from dlux.api import get_client
from dlux.dashboards.network.connections import tables
from dlux.dashboards.network.connections import workflows
from dlux.dashboards.network.connections import tabs


class IndexView(horizon_tables.DataTableView):
    template_name = "network/connections/index.html"
    table_class = tables.ConnectionsTable

    def get_data(self):
        client = get_client(self.request)
        data = client.connection_manager.list()
        return data


class CreateView(horizon_workflows.WorkflowView):
    workflow_class = workflows.CreateConnection
    template = "network/connections/create.html"


class DetailView(horizon_tabs.TabView):
    tab_group_class = tabs.DetailTabs
    template_name = 'network/connections/detail.html'
