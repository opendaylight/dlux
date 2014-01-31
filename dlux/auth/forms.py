# Copyright 2014 Hewlett-Packard Development Company, L.P.
#
# Authors: Endre Karlson <endre.karlson@hp.com>
#          Dave Tucker <dave.j.tucker@hp.com>
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

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.forms import AuthenticationForm
from django import forms
from django.utils.translation import ugettext_lazy as _
from django.views.decorators.debug import sensitive_variables

from dlux.exceptions import AuthException


LOG = logging.getLogger(__name__)


class Login(AuthenticationForm):
    """Form used for logging in a user.

    Inherits from the base ``django.contrib.auth.forms.AuthenticationForm``
    class for added security features.
    """
    controller = forms.ChoiceField(label=_("Controller"), required=False)
    username = forms.CharField(label=_("User Name"))
    password = forms.CharField(label=_("Password"),
                               widget=forms.PasswordInput(render_value=False))

    def __init__(self, *args, **kwargs):
        super(Login, self).__init__(*args, **kwargs)
        self.fields.keyOrder = ['username', 'password', 'controller']
        if getattr(settings,
                   'OPENSTACK_KEYSTONE_MULTIDOMAIN_SUPPORT',
                    False):
            #self.fields['domain'] = forms.CharField(label=_("Domain"),
            #                                        required=True)
            self.fields.keyOrder = ['username', 'password', 'controller']
        self.fields['controller'].choices = self.get_controller_choices()
        if len(self.fields['controller'].choices) == 1:
            initial = self.fields['controller'].choices[0][0]
            self.fields['controller'].initial = initial
            self.fields['controller'].widget = forms.widgets.HiddenInput()

    @staticmethod
    def get_controller_choices():
        default_ctrl = settings.DEFAULT_CONTROLLER
        return getattr(settings, 'AVAILABLE_CONTROLLERS', [default_ctrl])

    @sensitive_variables()
    def clean(self):
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        ctrl = self.cleaned_data.get('controller')

        if not (username and password):
            # Don't authenticate, just let the other validators handle it.
            return self.cleaned_data

        try:
            self.user_cache = authenticate(request=self.request,
                                           username=username,
                                           password=password,
                                           controller_url=ctrl)
            msg = 'Login successful for user "%(username)s".' % \
                {'username': username}
            LOG.info(msg)
        except AuthException as exc:
            msg = 'Login failed for user "%(username)s".' % \
                {'username': username}
            LOG.warning(msg)
            self.request.session.flush()
            raise forms.ValidationError(exc)
        self.check_for_test_cookie()
        return self.cleaned_data
