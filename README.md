tapestry-dojo
=============

An attempt to use the Dojo Toolkit as the Infrastructure Provider for Tapestry 5.4

DISCLAIMER: The code here is to be considered very experimental and in a rough state, that said it does work to a degree.

The main aim of this project is to see if it is possible to easily change the JavaScript Infrastructure Provider for Tapestry 5.4 to use the Dojo Toolkit, replacing the existing providors. Tapestry 5.4 is just still in beta so things may change.

Things I would like to achieve are:

1. Learn more about Tapestry 5.4 especially its JavaScript capabilities
2. Create a Dojo JavaScript Provider
3. Keep bootstrap (without all the plugins for now)

## Usage
The project is built to become a Tapestry Library that you can eventually just put on the classpath and the providor infrastructure will be there.

1. Create a normal T5.4 Web Application project
2. In you applications AppModule set the infrastructure providor: 

    ```java
    @Contribute(SymbolProvider.class)
	@ApplicationDefaults
	public static void setDefaults(MappedConfiguration<String, Object> configuration) {
		configuration.add(SymbolConstants.JAVASCRIPT_INFRASTRUCTURE_PROVIDER, "dojo");
	}
    ```
3. Download the dojotoolkit and place under [context]/js/ so you have dojo, dijit, dojox & utils all under js
4. Create a dojoConfig.js file under [context]/js/
    ```javascript
var dojoConfig = {

        baseUrl : "/js/dojo/",
        packages : [ {
            name : "t5",
            location : "/modules/t5"
	    }, {
		    name : "bootstrap",
		    location : "/modules/bootstrap"
	    }, {
		    name : "underscore",
		    location : "/modules",
		    main : "underscore"
	    }
		// , {
		// name : "YOUR-PACKAGE",
		// location : "/modules/YOUR-PACKAGE"
		// }
	    ]
    };
    ```

Your application should at least start up ok.

##Things Still To Do
1. The ModuleManager still seems to want to configure RequireJS through a 'var require = {...}' object
2. The dojo implementation of dom module is incomplete
3. ... and loads more!