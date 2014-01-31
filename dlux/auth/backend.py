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
import requests

from django.conf import settings

from dlux.auth.user import create_user_from_jsessionid
from dlux import exceptions

LOG = logging.getLogger(__name__)


class ControllerBackend(object):

    def get_user(self, user_id):
        if (hasattr(self, 'request') and
                user_id == self.request.session['user_id']):
            jsessionid = self.request.session['jsessionid']
            jsessionidsso = self.request.session['jsessionidsso']
            controller = self.request.session['controller_endpoint']
            user = create_user_from_jsessionid(user_id,
                                               jsessionid,
                                               jsessionidsso,
                                               controller)
            return user
        else:
            return None

    def authenticate(self, request=None, username=None, password=None,
                     controller_url=None):

        url = controller_url + settings.AUTH_PATH
        response = requests.get(url, auth=(username, password))

        if response.status_code == 401:
            LOG.warning('Authentication failure...')
            raise exceptions.AuthException('Invalid username or password. '
                                           'Please check your credentials '
                                           'and try again.')

        try:
            jsessionid = response.cookies.get('JSESSIONID')
            jsessionidsso = response.cookies.get('JSESSIONIDSSO')
            user = create_user_from_jsessionid(username=username,
                                               controller=controller_url,
                                               jsessionid=jsessionid,
                                               jsessionidsso=jsessionidsso,
                                               )
        except Exception as e:
            print(e)
            raise

        if request is not None:
            request.user = user

        return user
