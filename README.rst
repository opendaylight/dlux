Setup
=====

This is a quick guide to setting up dlux.

Prerequisites
-------------

dlux is a web UI for talking to ODL. It is built ontop of the OpenStack Horizon
Framework for making dashboards / applications which is built on Django.

The documentation for Horizon is here:

http://docs.openstack.org/developer/horizon/

Installation prerequisites are:

   A functional OpenDaylight installation. dlux will
   connect to the ODL service here. ODL does *not* need to be
   on the same machine as your dlux interface, but its HTTP API
   must be accessible.

Installing the packages
-----------------------

dlux is a Django app written in Python and has a few installation
dependencies:

On a RHEL 6 system, you should install the following:

::

    yum install git python-devel swig openssl-devel mysql-devel libxml2-devel libxslt-devel gcc gcc-c++

The above should work well for similar RPM-based distributions. For
other distros or platforms, you will obviously need to convert as
appropriate.

Then, you'll want to use the ``easy_install`` utility to set up a few
other tools:

::

    easy_install pip
    easy_install nose

Install the Management UI
-------------------------

Begin by cloning the horizon and dlux repositories:

::

    git clone git://github.com/ekarlso/dlux-horizon.git dlux

Go into ``dlux-horizon`` and install a virtual environment for your setup::

    cd dlux-horizon
    virtualvenv .venv
    source .venv/bin/activate
    pip install -r requirements.txt -r test-requirements.txt

    cp dlux/local/local_settings.py.example dlux/local/local_settings.py

Open up the copied ``local_settings.py`` file in your preferred text
editor. You will want to customize several settings:

-  ``DEFAULT_CONTROLLER`` should point to the ODL Controller you
   configured. It normally runs on port http://x.x.x.x/8080.

Starting the app
----------------

If everything has gone according to plan, you should be able to run:

::

    python manage.py runserver

and have the application start on port 8000. The DLUX dashboard will
be located at http://localhost:8000

If you wish to access it remotely (i.e., not just from localhost), you
need to open port 8080 in iptables:

::

    iptables -I INPUT -p tcp --dport 8000 -j ACCEPT

and launch the server with ``0.0.0.0:8000`` on the end:

::

    python manage.py runserver 0.0.0.0:8000
