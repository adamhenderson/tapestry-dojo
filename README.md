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
The project is built to become a Tapestry Library that you can eventually just put the jar on the classpath and the provider infrastructure will be there.

1. Create a normal T5.4 Web Application project
2. In your applications AppModule set the infrastructure provider: 

    ```java
    @Contribute(SymbolProvider.class)
	@ApplicationDefaults
	public static void setDefaults(MappedConfiguration<String, Object> configuration) {
		configuration.add(SymbolConstants.JAVASCRIPT_INFRASTRUCTURE_PROVIDER, "dojo");
	}
    ```
3. Download the dojotoolkit and place under [context]/js/ so you have dojo, dijit, dojox & utils all under [context]/js
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

##Things That Work
### Events

Event registration works

DOM events work:

```javascript
dom.onDocument("click","button",function(){...});
```

Custom events should also now work but the event names have been overridden with a version with the colons replaced with slashes (as colons are not allowed in dojo custom event names), however code should not need to change: 

```javascript
dom.onDocument(events.zone.update, function(event) {...});
```

Because dojo treats the event name string as a special string if it contains colons which tapestry has used to namespace the events like "t5:zone:update", so a new events.js module is supplied with slash separated event names: "t5/zone/update".

So long as you continue to reference the event names via the events object in your code rather than using direct strings things should still work. 

###Ajax
```javascript
dom.wrap("button1").on("click", null, function() {
    dom.ajaxRequest("/domtest:getdata", {
        success : function(rw, memo) {
            var d = dom.create("div", {
                innerHTML : "<em>" + rw.json.date + "</em>"
            });
            responses.prepend(d);
        }
    });
});
```

####Zones
Zones should now work, though not fully tested. 

###ElementWrapper
All the ElementWrapper methods all work as expected.

##Things Still To Do / Broken
1. The ModuleManager still seems to want to configure RequireJS through a 'var require = {...}' object - this object could be useful for configuring dojo is the 'require' variable could be changed to 'dojoConfig' and more control given to what goes into it. If I can find a way to override this all the config could be done in Java and maybe not require the user to create a dojoConfig.js file
2. Something is attempting to load up some of the bootstrap modules that has a requirement for jQuery, since the replaced core stack does not include jQuery it is failing so would like to find that code and disable it.
3. Would like to add support for using the dojo library from a CDN, negating the need for a download of dojo
4. Add more configuration options
5. Port the bootstrap module js files to dojo - need help here chaps
6. Have a go at integrating Intern for testing.
