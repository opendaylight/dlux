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

from django.contrib.auth.models import AnonymousUser
import requests

from dlux.settings import AUTH_PATH

LOG = logging.getLogger(__name__)


def set_session_from_user(request, user):
    request.session['jsessionid'] = user.jsessionid
    request.session['jsessionidsso'] = user.jsessionidsso
    request.session['user_id'] = user.id


def create_user_from_jsessionid(username, jsessionid,
                                jsessionidsso, controller):
    return User(username=username,
                jsessionid=jsessionid,
                jsessionidsso=jsessionidsso,
                enabled=True,
                controller=controller)


class User(AnonymousUser):
    def __init__(self, username=None, enabled=False,
                 jsessionid=None, jsessionidsso=None,
                 controller=None):
        self.id = username
        self.pk = username
        self.jsessionid = jsessionid
        self.jsessionidsso = jsessionidsso
        self.username = username
        self.enabled = enabled
        self.controller = controller

    def __unicode__(self):
        return self.username

    def __repr__(self):
        return '<%s: %s>' % (self.__class__.__name__, self.username)

    def check_jsessionid_is_valid(self):
        if self.jsessionid is None or self.jsessionidsso is None:
            return False
        else:
            auth_cookies = dict(JSESSIONID=self.jsessionid,
                                JSESSIONIDSSO=self.jsessionidsso)
            url = self.controller + AUTH_PATH
            response = requests.get(url, cookies=auth_cookies)

            if response.status_code == requests.codes.ok:
                return True
            else:
                return False

    def is_authenticated(self):
        return self.check_jsessionid_is_valid()

    def is_anonymous(self):
        return not self.is_authenticated()

    @property
    def is_active(self):
        return self.enabled

    def save(*args, **kw):
        pass

    def delete(*args, **kw):
        pass
