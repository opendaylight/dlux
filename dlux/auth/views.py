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
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.views import login as django_login
from django.contrib.auth.views import logout_then_login as django_logout
from django.utils.functional import curry
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters

from dlux.auth.forms import Login
from dlux.auth.user import set_session_from_user


LOG = logging.getLogger(__name__)


@sensitive_post_parameters()
@csrf_protect
@never_cache
def login(request):
    """Logs a user in using the :class:`~openstack_auth.forms.Login` form."""
    # Get our initial region for the form.
    initial = {}
    current_controller = request.session.get('controller_endpoint', None)
    request_controller = request.GET.get('controller', None)
    controllers = dict(getattr(settings, "AVAILABLE_CONTROLLERS", []))
    if (request_controller in controllers and
            request_controller != current_controller):
        initial.update({'controller': request_controller})

    if request.method == "POST":
        form = curry(Login, request)
    else:
        form = curry(Login, initial=initial)

    extra_context = {'redirect_field_name': REDIRECT_FIELD_NAME}

    if request.is_ajax():
        template_name = 'auth/_login.html'
        extra_context['hide'] = True
    else:
        template_name = 'auth/login.html'

    res = django_login(request,
                       template_name=template_name,
                       authentication_form=form,
                       extra_context=extra_context)
    # Set the session data here because django's session key rotation
    # will erase it if we set it earlier.

    if request.user.is_authenticated():
        set_session_from_user(request, request.user)
        controllers = dict(Login.get_controller_choices())
        controller = request.user.controller
        controller_name = controllers.get(controller)
        request.session['controller_endpoint'] = controller
        request.session['controller_name'] = controller_name
    return res


def logout(request):
    msg = 'Logging out user "%(username)s".' % \
        {'username': request.user.username}
    LOG.info(msg)
    return django_logout(request)
