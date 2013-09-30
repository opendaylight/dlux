opendaylight-ui
===============

OpenDaylight SDN Controller - UI (AngularJS 100% Client Side)

Setting it up
------------
    # curl https://raw.github.com/creationix/nvm/master/install.sh | sh

    ...

    Cloning into '/root/.nvm'...
    remote: Counting objects: 602, done.
    remote: Compressing objects: 100% (396/396), done.
    remote: Total 602 (delta 296), reused 484 (delta 195)
    Receiving objects: 100% (602/602), 91.40 KiB, done.
    Resolving deltas: 100% (296/296), done.

    => Appending source string to /root/.profile
    => Close and reopen your terminal to start using NVM

    # nvm ls-remote
    v0.1.14 ... ...      ...
    ...
    ...     ... v0.10.17 ...
    ...     ... ...      ...

    # nvm install 0.10.17
    ######################################################################## 100.0%
    Now using node v0.10.17

    # nvm ls
    v0.10.7
    current:   v0.10.17

    # npm install -g grunt-cli
    # npm install -g bower

    # git clone http://github.com/ekarlso/opendaylight-ui
    # cd opendaylight-ui
    # npm install

#### Install and copy bower deps

    # grunt bower

Starting a webserver using the grunt command
--------------------------------------------
The below steps will also open a webbrowser towards the server on localhost.

None of the below tasks will perform minification except Production

#### Development Environment
Does not reload in the browser when you do changes but updates files on
changes.

    # grunt dev

#### Live Development Environment
This updates all the files and reloads the page in the browser for each each
time a file is changes (Recommended)

    # grunt live

#### Production Environment

    # grunt prod


OpenDaylight NB API Documentation
=================================

https://wiki.opendaylight.org/view/OpenDaylight_Controller:REST_Reference_and_Authentication