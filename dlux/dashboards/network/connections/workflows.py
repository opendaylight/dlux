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

import logging

from django.utils.translation import ugettext_lazy as _
from horizon import forms
from horizon import workflows

from dlux import api

LOG = logging.getLogger(__name__)


class SetConnectionDetailsAction(workflows.Action):
    node_id = forms.CharField(max_length=60, label=_('Node Identifier'))
    node_type = forms.CharField(max_length=20, initial='OF',
                                label=('Node Type'))

    ip_address = forms.CharField(max_length=60, label=_('IPvX Address'))
    port = forms.CharField(max_length=60, label=_('Port'))

    class Meta:
        name = _('Details')


class SetConnectionDetails(workflows.Step):
    action_class = SetConnectionDetailsAction
    contributes = ['node_id', 'ip_address', 'port', 'node_type']


class CreateConnection(workflows.Workflow):
    slug = 'create_connection'
    name = _("Create Connection")
    finalize_button_name = _("Create")
    success_message = _('Created connection')
    failure_message = _('Unable to add Connection.')
    success_url = "horizon:network:connections:index"
    default_steps = (SetConnectionDetails,)

    def handle(self, request, context):
        client = api.get_client(request)
        try:
            client.connection_manager.create(**context)
            return True
        except Exception:
            return False
