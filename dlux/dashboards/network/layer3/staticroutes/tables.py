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

from horizon import tables
from dlux.api import get_client


class CreateStaticRouteLink(tables.LinkAction):
    name = "create_staticroute"
    verbose_name = _("Create StaticRoute")
    url = "horizon:network:layer3:staticroutes:create"
    classes = ("btn-launch", "ajax-modal")


class DeleteStaticRoute(tables.DeleteAction):
    data_type_singular = 'StaticRoute'
    data_type_plugar = 'StaticRoutes'

    def delete(self, request, obj_id):
        client = get_client(request)
        client.staticroutes.delete(obj_id)


class StaticRoutesTable(tables.DataTable):
    name = tables.Column(
        'name', verbose_name=_('Name'))
    prefix = tables.Column('prefix', verbose_name='IPv4 Prefix')
    next_hop = tables.Column('nextHop', verbose_name='Next Hop')

    class Meta:
        name = 'staticroutes'
        verbose_name = _('Static Routes')
        table_actions = (CreateStaticRouteLink, DeleteStaticRoute,)

    def get_object_id(self, datum):
        return datum.name
