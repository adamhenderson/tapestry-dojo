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

##Things That Work
### Events

Event registration works (partially)

DOM events work:

```javascript
dom.onDocument("click","button",function(){...});
```

Custom events don't: 

```javascript
dom.onDocument(events.zone.refresh, function(event) {...});
```

This is because dojo treats the event name string as a special string if it contains colons which tapestry has used to namespace the events "t5:zone:update".

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
Zones currently don't work as they rely on the custom events being fired, until this is fixed they will continue to be broken. Tests have shown that if the event names are changed so that the colons are replaced with underscores '_' or slashes '/' the events will fire.

###ElementWrapper
All the ElementWrapper methods all work as expected.

##Things Still To Do / Broken
1. The ModuleManager still seems to want to configure RequireJS through a 'var require = {...}' object - this object could be useful for configuring dojo is the 'require' variable could be changed to 'dojoConfig' and more control given to what goes into it.
2. Something is attempting to load up some of the bootstrap modules that has a requirement for jQuery, since the replaced core stact does not include jQuery it is failing so would like to find that code and disable it.
