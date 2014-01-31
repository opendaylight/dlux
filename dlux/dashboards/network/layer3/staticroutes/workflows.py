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


class SetStaticRouteDetailsAction(workflows.Action):
    name = forms.CharField(max_length=60, label=_('StaticRoute Name'))
    prefix = forms.CharField(max_length=60, label=_('IPvX Prefix'))
    next_hop = forms.CharField(max_length=20, label=('Next Hop IPvX Address'))

    class Meta:
        name = _('Details')


class SetStaticRouteDetails(workflows.Step):
    action_class = SetStaticRouteDetailsAction
    contributes = ['name', 'prefix', 'next_hop']


class CreateStaticRoute(workflows.Workflow):
    slug = 'create_staticroute'
    name = _("Create StaticRoute")
    finalize_button_name = _("Create")
    success_message = _('Created StaticRoute')
    failure_message = _('Unable to add StaticRoute.')
    success_url = "horizon:network:layer3:index"
    default_steps = (SetStaticRouteDetails,)

    def handle(self, request, context):
        client = api.get_client(request)
        try:
            client.staticroutes.create(**context)
            return True
        except Exception:
            return False
