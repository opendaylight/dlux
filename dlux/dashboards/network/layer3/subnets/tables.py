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


class CreateSubnetLink(tables.LinkAction):
    name = "create_subnet"
    verbose_name = _("Create Subnet")
    url = "horizon:network:layer3:subnets:create"
    classes = ("btn-launch", "ajax-modal")


class DeleteSubnet(tables.DeleteAction):
    data_type_singular = 'Subnet'
    data_type_plugar = 'Subnets'

    def delete(self, request, obj_id):
        client = get_client(request)
        client.subnet.delete(obj_id)


class SubnetsTable(tables.DataTable):
    name = tables.Column(
        'name', verbose_name=_('Name'))
    subnet = tables.Column('subnet', verbose_name=_('IPvX Prefix'))
    connectors = tables.Column('nodeConenctors', verbose_name=_('Connectors'))

    class Meta:
        name = 'subnets'
        verbose_name = _('Subnets')
        table_actions = (CreateSubnetLink, DeleteSubnet,)

    def get_object_id(self, datum):
        return datum.name
