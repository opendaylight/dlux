# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2012 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
# Copyright 2012 OpenStack, LLC
#
# Copyright 2012 Nebula, Inc.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

"""
Installation script for the OpenStack Dashboard development virtualenv.
"""

import os
import subprocess
import sys


ROOT = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
VENV = os.path.join(ROOT, '.venv')
WITH_VENV = os.path.join(ROOT, 'tools', 'with_venv.sh')
PIP_REQUIRES = os.path.join(ROOT, 'requirements.txt')
TEST_REQUIRES = os.path.join(ROOT, 'test-requirements.txt')


def die(message, *args):
    print >> sys.stderr, message % args
    sys.exit(1)


def run_command(cmd, redirect_output=True, check_exit_code=True, cwd=ROOT,
                die_message=None):
    """
    Runs a command in an out-of-process shell, returning the
    output of that command.  Working directory is ROOT.
    """
    if redirect_output:
        stdout = subprocess.PIPE
    else:
        stdout = None

    proc = subprocess.Popen(cmd, cwd=cwd, stdout=stdout)
    output = proc.communicate()[0]
    if check_exit_code and proc.returncode != 0:
        if die_message is None:
            die('Command "%s" failed.\n%s', ' '.join(cmd), output)
        else:
            die(die_message)
    return output


HAS_EASY_INSTALL = bool(run_command(['which', 'easy_install'],
                                    check_exit_code=False).strip())
HAS_VIRTUALENV = bool(run_command(['which', 'virtualenv'],
                                  check_exit_code=False).strip())


def check_dependencies():
    """Make sure virtualenv is in the path."""

    print 'Checking dependencies...'
    if not HAS_VIRTUALENV:
        print 'Virtual environment not found.'
        # Try installing it via easy_install...
        if HAS_EASY_INSTALL:
            print 'Installing virtualenv via easy_install...',
            run_command(['easy_install', 'virtualenv'],
                        die_message='easy_install failed to install virtualenv'
                                    '\ndevelopment requires virtualenv, please'
                                    ' install it using your favorite tool')
            if not run_command(['which', 'virtualenv']):
                die('ERROR: virtualenv not found in path.\n\ndevelopment '
                    ' requires virtualenv, please install it using your'
                    ' favorite package management tool and ensure'
                    ' virtualenv is in your path')
            print 'virtualenv installation done.'
        else:
            die('easy_install not found.\n\nInstall easy_install'
                ' (python-setuptools in ubuntu) or virtualenv by hand,'
                ' then rerun.')
    print 'dependency check done.'


def create_virtualenv(venv=VENV):
    """Creates the virtual environment and installs PIP only into the
    virtual environment
    """
    print 'Creating venv...',
    run_command(['virtualenv', '-q', '--no-site-packages', VENV])
    print 'done.'
    print 'Installing pip in virtualenv...',
    if not run_command([WITH_VENV, 'easy_install', 'pip']).strip():
        die("Failed to install pip.")
    print 'done.'
    print 'Installing distribute in virtualenv...'
    pip_install('distribute>=0.6.24')
    print 'done.'


def pip_install(*args):
    args = [WITH_VENV, 'pip', 'install', '--upgrade'] + list(args)
    run_command(args, redirect_output=False)


def install_dependencies(venv=VENV):
    print "Installing dependencies..."
    print "(This may take several minutes, don't panic)"
    pip_install('-r', TEST_REQUIRES)
    pip_install('-r', PIP_REQUIRES)

    # Tell the virtual env how to "import dashboard"
    py = 'python%d.%d' % (sys.version_info[0], sys.version_info[1])
    pthfile = os.path.join(venv, "lib", py, "site-packages", "dashboard.pth")
    f = open(pthfile, 'w')
    f.write("%s\n" % ROOT)


def install_horizon():
    print 'Installing horizon module in development mode...'
    run_command([WITH_VENV, 'python', 'setup.py', 'develop'], cwd=ROOT)


def print_summary():
    summary = """
Horizon development environment setup is complete.

To activate the virtualenv for the extent of your current shell session you
can run:

$ source .venv/bin/activate
"""
    print summary


def main():
    check_dependencies()
    create_virtualenv()
    install_dependencies()
    install_horizon()
    print_summary()

if __name__ == '__main__':
    main()
