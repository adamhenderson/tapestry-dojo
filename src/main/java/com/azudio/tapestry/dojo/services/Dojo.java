package com.azudio.tapestry.dojo.services;

import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

/**
 * Marker annotation for services that are provided by the Dojo module. Also, used as the marker annotation for the core {@link org.apache.tapestry5.services.javascript.JavaScriptStack}.
 */
@Target({ ElementType.PARAMETER, ElementType.FIELD, ElementType.METHOD })
@Retention(RUNTIME)
@Documented
public @interface Dojo {

}
