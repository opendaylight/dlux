#!/bin/bash

SCRIPT_DIR=$(cd $(dirname "$0") && pwd)
PROJECT_DIR=$(cd $SCRIPT_DIR/.. && pwd)


# curl https://raw.github.com/creationix/nvm/master/install.sh | sh

get_version() {
    local version=$1
    [ -z "$version" ] && version=v0.10
    local ver=$(nvm ls-remote | sed -r -e "s/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]//g" -e 's/(^\s+|\s+$)//g' | grep $version | tail -1)
    [ -z "$ver" ] && {
        echo "No version matching '$version'"
        exit 1
    }
    echo "$ver"
}


install_node() {
    local version=$(get_version $1)
    nvm install $version
}

set_default() {
    local version=$(get_version $1)
    nvm alias default $version
}

install_and_default() {
    local version=$(get_version $1)
    install_node $version
    set_default $version
}

install_deps() {
    npm install -g bower grunt-cli
    cd $PROJECT_DIR
    npm install
}

cmd=$1
shift

[ ! -r ~/.nvm/nvm.sh ] && {
    echo "Please install nvm first. See top of script"
    exit 0
}

. ~/.nvm/nvm.sh

case $cmd in
    get_version)
        get_version $1
    ;;
    install_node)
        install_node $1
    ;;
    install_and_default)
        install_and_default $1
    ;;
    install_deps)
        install_deps
    ;;
esac