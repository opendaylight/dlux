#! /bin/bash

#put me in the same folder as the boostrapper please

echo "Generating resources content"
echo
# This is using relative path, the build will break once the files are moved.
mkdir -p ./src/main/resources/index
mkdir -p ./src/main/resources/dlux/src/app
mkdir -p ./src/main/resources/dlux/vendor
mkdir -p ./src/main/resources/dlux/assets
cp ../../build/index.html ./src/main/resources/index/
cp ../../build/src/main.js ./src/main/resources/dlux/src/main.js
cp ../../build/src/app/app.controller.js ./src/main/resources/dlux/src/app/app.controller.js
cp ../../build/src/app/app.module.js ./src/main/resources/dlux/src/app/app.module.js
cp ../../build/src/app/routingConfig.js ./src/main/resources/dlux/src/app/routingConfig.js
cp -r ../../build/vendor/* ./src/main/resources/dlux/vendor/
cp -r ../../build/assets/* ./src/main/resources/dlux/assets/
rm -rf ./src/main/resources/dlux/assets/yang2xml
echo "resources content generated"

#echo "Editing index.html"
#echo
#sed -i 's/src\/main.js/main.js/g' build/index.html

#echo "Edit main.js"
#sed -i "s/baseUrl : 'src'/baseUrl : '.'/g" build/main.js
#sed -i "s/\.\.\///g" build/main.js
#sed -i 's/app\/app.module/app.module/g' build/main.js

#echo "Replace all app/app.module to ../app.module"
#echo
#find build/ -name '*.js' -type f -exec sed -i 's/app\/app.module/app.module/g' {} \;

#echo "Replace all app/app.controller to ../app.controller"
#echo
#find build/ -name '*.js' -type f -exec sed -i 's/app\/app.controller/app.controller/g' {} \;

#echo "Rebase the relative path for all files"
#echo
#find build/ -name '*.js' -type f -exec sed -i "s/app\/routingConfig/routingConfig/g" {} \; #routingConfig
#find build/ -name '*.js' -type f -exec sed -i "s/app\//src\/app\//g" {} \; #app to src/app
#find build/ -name '*.js' -type f -exec sed -i "s/common\//src\/common\//g" {} \; # common to src/common
#find build/ -name '*.js' -type f -exec sed -i "s/src\/src\/common/src\/common/g" {} \; #fix for template
