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
from django import http
from django.views import generic

from dlux.api import get_client
from django.utils.translation import ugettext_lazy as _

import simplejson as json

from dlux.dashboards.network.connections.ovsdb import tables as table_defs


KEY = 0
VALUES = 1


def _clean_set(data):
    values = data[VALUES]
    clean_set = []
    for v in values:
        # If this is another k,v structure. Just use the value
        if type(v) is list and len(v) == 2:
            clean_set.append(v[VALUES])
        else:
            clean_set.append(v)

    # Return single items
    if len(clean_set) == 1:
        clean_set = clean_set[0]

    return clean_set


def _clean_map(data):
    values = data[VALUES]
    clean_map = {}
    for v in values:
        # If this is another k,v structure. Add to dict
        if type(v) is list and len(v) == 2:
            clean_map[v[KEY]] = v[VALUES]

    return clean_map


def _clean_rows(row):
    for k, v in row.items():
        if type(v) is list:
            if 'set' in v:
                row[k] = _clean_set(v)
            elif 'map' in v:
                row[k] = _clean_map(v)


def clean(data):
    """
    Cleans the JSON-RPC format from OVSDB to something that is easier to
    render. "set" becomes a list, "map" become a dict.

    """
    clean_data = []

    try:
        uuids = data.keys()
        rows = data.values()
    except AttributeError:
        for row in data:
            _clean_rows(row)
            clean_data.append(row)

    for i in range(len(uuids)):
        row = rows[i]
        _clean_rows(row)
        row["uuid"] = uuids[i]
        clean_data.append(row)

    return clean_data


class RowsView(generic.View):
    def get(self, request, node_type, node_id, table, row=None):
        client = get_client(request)

        if row is not None:
            result = client.ovsdb.get(node_type, node_id, table, row)
        else:
            result = client.ovsdb.list(node_type, node_id, table)

        tmp = table_defs.TABLES.get(table)
        if result["rows"] is not None:
            rows = clean(result["rows"])
            tmp["rows"] = rows

        return http.HttpResponse(
            json.dumps(result), content_type='application/json')


class TableDefsView(generic.View):
    def get(self, request):
        return http.HttpResponse(json.dumps(table_defs.TABLES),
                                 content_type='application/json')


class DetailView(generic.TemplateView):
    template_name = "network/connections/ovsdb.html"
