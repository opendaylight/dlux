This project was generated using the DLUX Maven Archetype. This is a sample project generated to kick start DLUX application creation. You should add/update JS/HTML/CSS files as per your own requirements. 

This README has the following sections:

* Details of project structure
* Build and deploy the application bundle
* Next Steps


==========================================================
## Details of application structure


The application code structure is generated using the **artifactId** property provided during creation of this application. 

For example, if the value of **artifactId** property was **network**, application name should be **network** and you should see two directories **network-module** and **network-bundle** along with a pom.xml file at the same location of this README file. We will use **network** as application name through out this README file.

Considering **network** as application name or value for **artifactId**, generated application directory structure should be as follow - 

* network-module
* network-bundle
* pom.xml
* README


### Module

Following the previous example, application module such as **network-module** is a maven sub-project, that contains all of your **Javascript** code. The strcture of module project should be as follow - 

	network-module
	---pom.xml
	---src
	   ---main
	      ---resources
	         ---network
	            ---network.controller.js
	            ---network.module.js
	            ---network.services.js
	            ---network.tpl.html
	            ---network-custom.css


The application's **angular module, controller and service name ** is also derived from **artifactId**. You should change them as per your own requirements.

### Bundle

Application bundle is a maven sub-project to hold **blueprint** configuration, that Karaf understands. This project depends on application module's resources. It generates a **Karaf bundle** that contains the **blueprint.xml** and **resources from module**. The structure of bundle project should be as following - 

	network-bundle
	---pom.xml
	---src
	   ---main
	      ---resources
	         ---OSGI-INF
	            ---blueprint
	               ---blueprint.xml
	               


The content of **blueprint.xml** use the sample angularJS module name and directory path as defined in bundle project above. If you make any changes in directory, file or angular module Name, make sure to update blueprint.xml accordingly.



================================================
## Build and deploy the application bundle


These steps outline how to manually build and deploy your application in Karaf.


1. In your application root directory, build both sub-projects module and bundle via running following command - 

    	mvn clean install
 
2. Go to the {artifactId}-bundle/target, you should see your application bundle jar.   	
    
3. Locate your ODL distribution. You can download ODL distribution or use distribution from Integration or DLUX repository (after running a mvn clean install from the respective project's root). The path for dlux distribution is dlux/distribution-dlux/target/assembly/bin.

4. Start karaf  via command ./karaf.

5. Install dlux core feature via command on karaf console - 

	 	feature:install odl-dlux-core

6. Access the DLUX on browser at http://localhost:8181/index.html and login with credentials admin/admin.

7. Copy your application's bundle jar to your ODL distribution deploy directory. Location for that directory for dlux distribution is dlux/distribution-dlux/target/assembly/deploy.

8. Refresh the browser page, you should see your application in left hand Navigation.


================================================
## Next Steps

1. Add your JS code in controller.js  and service.js file. 
2. Create more HTML template files as per your requirements.
3. Create controller and view mappings in module.js.
4. Add your application related custom CSS in custom.css.
5. Any static content such as Images, JS, CSS etc you will put under your application module resources, should be visible in browser with use of correct URL, because all the required wiring of URL with directory is already done in blueprint.xml

you can ask any questions at **dlux-dev@lists.opendaylight.org** 