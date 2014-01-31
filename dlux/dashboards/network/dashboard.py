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

import horizon


class ConfigPanels(horizon.PanelGroup):
    name = _('Manage Configuration')
    slug = 'configuration'
    panels = ('layer3',)


class NodePanels(horizon.PanelGroup):
    name = _("Manage Nodes")
    slug = "node"
    panels = ('connections', 'nodes',)


class Network(horizon.Dashboard):
    name = _("Network")
    slug = "network"
    panels = (NodePanels, ConfigPanels)
    default_panel = "nodes"
    supports_tenants = True

horizon.register(Network)
