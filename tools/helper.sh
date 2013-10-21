#!/bin/bash

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
esac