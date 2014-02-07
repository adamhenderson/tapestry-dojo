package com.azudio.tapestry.dojo.modules;

import org.apache.tapestry5.SymbolConstants;
import org.apache.tapestry5.annotations.Path;
import org.apache.tapestry5.internal.InternalConstants;
import org.apache.tapestry5.internal.services.javascript.ModuleManagerImpl;
import org.apache.tapestry5.ioc.Configuration;
import org.apache.tapestry5.ioc.MappedConfiguration;
import org.apache.tapestry5.ioc.OrderedConfiguration;
import org.apache.tapestry5.ioc.Resource;
import org.apache.tapestry5.ioc.ServiceBinder;
import org.apache.tapestry5.ioc.annotations.Contribute;
import org.apache.tapestry5.ioc.annotations.Local;
import org.apache.tapestry5.ioc.annotations.Match;
import org.apache.tapestry5.ioc.annotations.Symbol;
import org.apache.tapestry5.ioc.services.FactoryDefaults;
import org.apache.tapestry5.ioc.services.ServiceOverride;
import org.apache.tapestry5.ioc.services.SymbolProvider;
import org.apache.tapestry5.services.ComponentClassResolver;
import org.apache.tapestry5.services.LibraryMapping;
import org.apache.tapestry5.services.compatibility.Compatibility;
import org.apache.tapestry5.services.javascript.ExtensibleJavaScriptStack;
import org.apache.tapestry5.services.javascript.JavaScriptModuleConfiguration;
import org.apache.tapestry5.services.javascript.JavaScriptStack;
import org.apache.tapestry5.services.javascript.JavaScriptStackSource;
import org.apache.tapestry5.services.javascript.ModuleManager;
import org.apache.tapestry5.services.javascript.StackExtension;
import org.apache.tapestry5.services.javascript.StackExtensionType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.azudio.tapestry.dojo.DojoModuleSymbols;
import com.azudio.tapestry.dojo.services.Dojo;

public class DojoModule {

	private static Logger log = LoggerFactory.getLogger(DojoModule.class);

	/**
	 * @param configuration
	 */
	@Contribute(SymbolProvider.class)
	@FactoryDefaults
	public static void setupDefaultPathToDojoLibrary(MappedConfiguration<String, String> configuration) {
		configuration.add(DojoModuleSymbols.DOJO_ROOT, "context:js/dojoConfig.js");
	}

	/**
	 * @param binder
	 */
	@SuppressWarnings("unchecked")
	public static void bind(ServiceBinder binder) {
		binder.bind(JavaScriptStack.class, ExtensibleJavaScriptStack.class).withMarker(Dojo.class).withId("DojoJavaScriptStack");
		binder.bind(ModuleManager.class, ModuleManagerImpl.class).withMarker(Dojo.class).withId("DojoModuleManager");
	}

	/**
	 * Overrides the "core" stack with the "dojo" {@link JavaScriptStack} if the provider is "dojo"
	 * 
	 * @param configuration
	 * @param dojoStack
	 * @param provider
	 */
	@Contribute(JavaScriptStackSource.class)
	public static void provideBuiltinJavaScriptStacks(MappedConfiguration<String, JavaScriptStack> configuration, @Dojo JavaScriptStack dojoStack, @Symbol(SymbolConstants.JAVASCRIPT_INFRASTRUCTURE_PROVIDER) String provider) {
		log.debug("Provider:" + provider);
		if (provider.equals("dojo")) {
			configuration.override(InternalConstants.CORE_STACK_NAME, dojoStack);
			log.debug("Overridden 'core'");
		}
	}

	/**
	 * @param configuration
	 * @param compatibility
	 * @param provider
	 */
	@Contribute(JavaScriptStack.class)
	@Match("DojoJavaScriptStack")
	public static void setupDojoJavaScriptStack(OrderedConfiguration<StackExtension> configuration, Compatibility compatibility, @Symbol(SymbolConstants.JAVASCRIPT_INFRASTRUCTURE_PROVIDER) String provider) {
		log.debug("Provider:" + provider);
		if (provider.equals("dojo")) {

			printConfigurationMessage();

			configuration.add("dojoConfig", StackExtension.library("context:js/dojoConfig.js"));
			configuration.add("dojo", StackExtension.library("context:js/dojo/dojo.js"));

			// Add in all the other bits tapestry needs (except require.js)

			final String ROOT = "${tapestry.asset.root}";

			configuration.add("underscore-library", StackExtension.library(ROOT + "/underscore-1.5.2.js"));
			configuration.add("underscore-module", StackExtension.module("underscore"));

			configuration.add("jquery-library", StackExtension.library(ROOT + "/jquery-1.10.2.js"));
			configuration.add("jquery-noconflict", StackExtension.library(ROOT + "/jquery-noconflict.js"));
			add(configuration, StackExtensionType.MODULE, "jquery");

			add(configuration, StackExtensionType.STYLESHEET, "${" + SymbolConstants.BOOTSTRAP_ROOT + "}/css/bootstrap.css");
			// ,
			//
			// ROOT + "/tapestry.css",
			//
			// ROOT + "/exception-frame.css",
			//
			// ROOT + "/tapestry-console.css",
			//
			// ROOT + "/tree.css"
			// );
			log.debug("Contributions made to 'DojoJavaScriptStack'");
		}
	}

	private static void printConfigurationMessage() {
		log.debug("Tapestry Dojo Configuration");
		log.debug("1. In your AppModule add the DojoModule as a @SubModule(DojoModule.class)");
		log.debug("2. Create the folder in /WEB-INF/classes/META-INF/assets/dojo");
		log.debug("3. Create the folder in /WEB-INF/classes/META-INF/modules");
		log.debug("4. Copy dojo,dijit,dojox,util directories into into the /WEB-INF/classes/META-INF/modules directory");
		log.debug("5. Copy dojo.js from /WEB-INF/classes/META-INF/modules/dojo into /WEB-INF/classes/META-INF/assets/dojo");
		log.debug("6. Create a dojoConfig.js file in /WEB-INF/classes/META-INF/assets");
		log.debug("var dojoConfig = {\\R                baseUrl : \"/modules/\",\\R                packages : [ {\\R                    name : \"t5\",\\R                    location : \"/modules/t5\"\\R                }, {\\R                    name : \"underscore\",\\R                    location : \"/modules\",\\R                    main:\"underscore\"\\R                }, {\\R                    name : \"dojo\",\\R                    location : \"/modules/dojo\"\\R                },{\\R                    name : \"dijit\",\\R                    location : \"/modules/dijit\"\\R                }, {\\R                    name : \"util\",\\R                    location : \"/modules/util\"\\R                },{\\R                    name : \"dazole\",\\R                    location : \"/modules/dazole\"\\R                }, {\\R                    name : \"bootstrap\",\\R                    location : \"/modules/bootstrap\"\\R                } ]\\R            };");
	}

	private static void add(OrderedConfiguration<StackExtension> configuration, StackExtensionType type, String... paths) {
		for (String path : paths) {
			int slashx = path.lastIndexOf('/');
			String id = path.substring(slashx + 1);

			configuration.add(id, new StackExtension(type, path));
		}
	}

	@Contribute(ComponentClassResolver.class)
	public static void addTapestryDojoLibrary(Configuration<LibraryMapping> configuration) {
		configuration.add(new LibraryMapping("tapestrydojo", "com.azudio.tapestry.dojo"));
		log.debug("Contributions made to the ComponentClassResolver for tapestrydojo");
	}

	@Contribute(ServiceOverride.class)
	public static void setupApplicationServiceOverrides(MappedConfiguration<Class<?>, Object> configuration, @Local ModuleManager m, @Symbol(SymbolConstants.JAVASCRIPT_INFRASTRUCTURE_PROVIDER) String provider) {
		if (provider.equals("dojo")) {
			configuration.add(ModuleManager.class, m);
		}
	}

	/**
	 * @param configuration
	 * @param provider
	 * @param domDojo
	 */
	@Contribute(ModuleManager.class)
	@Match("DojoModuleManager")
	public static void setupFoundationFramework(MappedConfiguration<String, JavaScriptModuleConfiguration> configuration, @Symbol(SymbolConstants.JAVASCRIPT_INFRASTRUCTURE_PROVIDER) String provider, @Path("classpath:com/azudio/tapestry/dojo/resources/t5-core-dom-dojo.js") Resource domDojo) {
		log.debug("Provider:" + provider);
		if (provider.equals("dojo")) {
			configuration.add("t5/core/dom", new JavaScriptModuleConfiguration(domDojo));
			log.debug("Contributions made to the modulemanager");
		}
	}
}
