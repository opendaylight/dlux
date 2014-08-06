USAGE:

build dlux
cd bootstrapper/impl/
comment the modules and e var that are in /build/src/app.module.js
./move_resources.sh
cd ../
maven clean install
compile and execute Karaf (in the controller /controller/opendaylight/distribution/opendaylight-karaf/
feature:install http
bundle:install -s mvn:org.opendaylight.dlux/bootstrapper/1.0.0-SNAPSHOT
bundle:install -s mvn:org.opendaylight.dlux/bootstrapper.implementation/1.0.0-SNAPSHOT

