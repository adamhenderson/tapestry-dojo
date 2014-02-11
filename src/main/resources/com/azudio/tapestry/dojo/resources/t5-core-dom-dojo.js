console.log("tapestry 5 dom");
requirejs = {};
(function() {
	define([ "underscore", "./utils", "./events", "dojo/dom", "dojo/_base/event", "dojo/dom-attr", "dojo/query", "dojo/on", "dojo/dom-style", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/request/xhr", "dojo/NodeList-traverse", "dojo/NodeList-manipulate", "dojo/NodeList-data" ], function(_, utils, events, dom, event, attr, q, on, style, domClass, domConstruct, domGeom, xhr) {

		var ElementWrapper = null, EventWrapper = null, RequestWrapper = null, ResponseWrapper = null, activeAjaxCount, adjustAjaxCount, ajaxRequest, convertContent, createElement, exports = null, onevent, scanner, scanners, wrapElement;

		convertContent = function(content) {
			if (_.isString(content)) {
				return content;
			}
			if (_.isElement(content)) {
				return content;
			}
			if (content instanceof ElementWrapper) {
				return content.element;
			}
			throw new Error("Provided value <" + content + "> is not valid as DOM element content.");
		};
		EventWrapper = (function() {
			function EventWrapper(event, memo) {

				// console.log(event.memo);

				var name, _i, _len, _ref;

				this.nativeEvent = event;
				this.memo = memo;
				_ref = [ "type", "char", "key" ];
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					name = _ref[_i];
					this[name] = event[name];
				}
			}

			EventWrapper.prototype.stop = function() {
				this.nativeEvent.preventDefault();
				return this.nativeEvent.stopImmediatePropagation();
			};

			return EventWrapper;

		})();
		onevent = function(elements, eventNames, match, handler) {
			// debugger;
			console.debug("onevent", arguments);
			if (handler == null) {
				throw new Error("No event handler was provided.");
			}
			console.debug(handler.toString());
			var wrapped = function(e, memo) {
				console.debug("wrapped called");
				console.debug(arguments);

				var elementWrapper, eventWrapper, result;
				elementWrapper = new ElementWrapper(e.target);
				eventWrapper = new EventWrapper(e, memo);

				// console.debug(handler.toString());

				result = handler.call(elementWrapper, eventWrapper, memo);
				if (result === false) {
					eventWrapper.stop();
				}
			}

			var matchers = (match == null ? [] : match.split(","));
			var eventNamesArr = eventNames.split(" ");

			for (i = 0; i < eventNamesArr.length; i++) {
				var eventName = eventNamesArr[i].trim();
				for (j = 0; j < matchers.length; j++) {
					var match = matchers[j].trim();
					console.debug(elements, match + ":" + eventName);
					q(elements).on(match + ":" + eventName, wrapped);
				}
				if (matchers.length == 0) {
					q(elements).on(eventName, wrapped);
				}
			}

			console.debug("done");
		};
		ElementWrapper = (function() {
			function ElementWrapper(ele) {
				this.element = ele;
			}

			ElementWrapper.prototype.toString = function() {
				var markup;

				markup = this.element.outerHTML;
				return "ElementWrapper[" + (markup.substring(0, (markup.indexOf(">")) + 1)) + "]";
			};

			ElementWrapper.prototype.hide = function() {

				style.set(this.element, {
					display : "none"
				});
				return this;
			};

			ElementWrapper.prototype.show = function() {
				style.set(this.element, {
					display : ""
				});
				return this;
			};

			ElementWrapper.prototype.css = function(name, value) {
				if (arguments.length === 1) {
					return domClass.contains(this.element, name);
				}
				domClass.set(this.element, name, value);
				return this;
			};

			ElementWrapper.prototype.offset = function() {
				return domGeom.getMarginBoc(this.element);
			};

			ElementWrapper.prototype.remove = function() {
				domConstruct.destroy(this.element);
				return this;
			};

			ElementWrapper.prototype.attr = function(name, value) {

				var attributeName = 0, current;

				if (_.isObject(name)) {
					for (attributeName in name) {
						value = name[attributeName];
						this.attr(attributeName, value);
					}
					return this;
				}
				current = attr.get(this.element, name);
				if (arguments.length > 1) {
					if (value === null) {
						attr.removeAttr(this.element.name);
					} else {
						attr.set(this.element, name, value);
					}
				}
				if (_.isUndefined(current)) {
					current = null;
				}
				return current;
			};

			ElementWrapper.prototype.focus = function() {
				this.element.focus();
				return this;
			};

			ElementWrapper.prototype.hasClass = function(name) {
				return domClass.has(this.element, name);
			};

			ElementWrapper.prototype.removeClass = function(name) {
				domClass.remove(this.element, name);
				return this;
			};

			ElementWrapper.prototype.addClass = function(name) {
				domClass.add(this.element, name);
				return this;
			};

			ElementWrapper.prototype.update = function(content) {
				domConstruct.empty(this.element);
				if (content) {
					domConstruct.place(convertContent(content), this.element);
				}
				return this;
			};

			ElementWrapper.prototype.append = function(content) {
				domConstruct.place(convertContent(content), this.element);
				return this;
			};

			ElementWrapper.prototype.prepend = function(content) {
				domConstruct.place(convertContent(content), this.element, "first");
				return this;
			};

			ElementWrapper.prototype.insertBefore = function(content) {
				domConstruct.place(convertContent(content), this.element, "before");
				return this;
			};

			ElementWrapper.prototype.insertAfter = function(content) {
				domConstruct.place(convertContent(content), this.element, "after");
				return this;
			};

			ElementWrapper.prototype.findFirst = function(selector) {
				var match;

				match = q(this.element, selector);

				if (match.length) {
					return new ElementWrapper(match.first());
				} else {
					return null;
				}
			};

			ElementWrapper.prototype.find = function(selector) {
				var i, matches, _i, _ref, _results;

				matches = q(this.element, selector);
				_results = [];
				for (i = _i = 0, _ref = matches.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
					_results.push(new ElementWrapper(matches.eq(i)));
				}
				return _results;
			};

			ElementWrapper.prototype.findParent = function(selector) {
				var parents;

				parents = q(this.element).parents(selector);
				if (!parents.length) {
					return null;
				}
				return new ElementWrapper(parents.eq(0));
			};

			ElementWrapper.prototype.closest = function(selector) {
				var match;

				match = q(this.element).closest(selector);
				switch (false) {
				case match.length !== 0:
					return null;
				case match[0] !== this.element:
					return this;
				default:
					return new ElementWrapper(match);
				}
			};

			ElementWrapper.prototype.parent = function() {
				var parent;

				parent = q(this.element).parent();
				if (!parent.length) {
					return null;
				}
				return new ElementWrapper(parent);
			};

			ElementWrapper.prototype.children = function() {
				var children, i, _i, _ref, _results;

				children = q(this.element).children();
				_results = [];
				for (i = _i = 0, _ref = children.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
					_results.push(new ElementWrapper(children.eq(i)));
				}
				return _results;
			};

			ElementWrapper.prototype.visible = function() {
				return style.get(this.element, "display") !== "none";
			};

			ElementWrapper.prototype.deepVisible = function() {
				var cursor = this;
				while (cursor) {
					if (!cursor.visible()) {
						return false;
					}
					cursor = cursor.parent();
					if (cursor && cursor.element === document.body) {
						return true;
					}
				}
				return false;
			};

			ElementWrapper.prototype.trigger = function(eventName, memo) {

				var event;

				if (eventName == null) {
					throw new Error("Attempt to trigger event with null event name");
				}
				if (!((_.isNull(memo)) || (_.isObject(memo)) || (_.isUndefined(memo)))) {
					throw new Error("Event memo may be null or an object, but not a simple type.");
				}

				memo.bubbles = true;
				memo.cancelable = true;

				// Send event
				event = on.emit(this.element, eventName, memo);

				return event;

			};

			ElementWrapper.prototype.value = function(newValue) {
				var current;

				current = q(this.element).val();
				if (arguments.length > 0) {
					q(this.element).val(newValue);
				}
				return current;
			};

			ElementWrapper.prototype.checked = function() {
				return this.element.checked;
			};

			ElementWrapper.prototype.meta = function(name, value) {
				var current;

				current = q(this.element).data(name);
				if (arguments.length > 1) {
					q(this.elment).data(name, value);
				}
				return current;
			};

			ElementWrapper.prototype.on = function(events, match, handler) {
				exports.on(this.element, events, match, handler);
				return this;
			};

			ElementWrapper.prototype.text = function() {
				return this.element.text();
			};

			return ElementWrapper;

		})();
		RequestWrapper = (function() {
			function RequestWrapper(x) {
				this.x = x;
			}

			RequestWrapper.prototype.abort = function() {
				return this.x.abort();
			};

			return RequestWrapper;

		})();
		ResponseWrapper = (function() {
			function ResponseWrapper(x, data) {
				this.x = x;
				this.status = x.status;
				this.statusText = x.statusText;
				this.json = data;
				this.text = x.responseText;
			}

			ResponseWrapper.prototype.header = function(name) {
				return this.x.getResponseHeader(name);
			};

			return ResponseWrapper;

		})();

		activeAjaxCount = 0;

		adjustAjaxCount = function(delta) {
			activeAjaxCount += delta;
			return exports.body.attr("data-ajax-active", activeAjaxCount > 0);
		};

		ajaxRequest = function(url, options) {
			console.debug("ajaxRequest", arguments);

			var x, _ref;

			if (options == null) {
				options = {};
			}

			x = xhr(url, {
				method : ((_ref = options.method) != null ? _ref.toUpperCase() : void 0) || "POST",
				headers : {
					'Content-Type' : options.contentType
				},
				data : options.data
			}).then(function(data) {
				console.debug("Returned data:", data);

				adjustAjaxCount(-1);
				options.success && options.success(new ResponseWrapper(x, data));
			}, function(err) {

				alert("AN ERROR HAS OCCURRED!!!!");

				var message, text;

				adjustAjaxCount(-1);
				if (textStatus === "abort") {
					return;
				}
				message = "Request to " + err.url + " failed with status " + err.textStatus;
				text = err.statusText;
				if (!_.isEmpty(text)) {
					message += " -- " + text;
				}
				message += ".";
				if (options.failure) {
					options.failure(new ResponseWrapper(x), message);
				} else {
					throw new Error(message);
				}

			});

			adjustAjaxCount(+1);
			return new RequestWrapper(x);
		};
		scanners = null;
		scanner = function(selector, callback) {
			var scan;

			scan = function(root) {
				var el, _i, _len, _ref;

				_ref = root.find(selector);
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					el = _ref[_i];
					callback(el);
				}
			};
			scan(exports.body);
			if (scanners === null) {
				scanners = [];
				exports.body.on(events.zone.didUpdate, function() {
					var f, _i, _len;

					for (_i = 0, _len = scanners.length; _i < _len; _i++) {
						f = scanners[_i];
						f(this);
					}
				});
			}
			scanners.push(scan);
		};

		exports = wrapElement = function(element) {
			if (_.isString(element)) {
				element = document.getElementById(element);
				if (!element) {
					return null;
				}
			} else {
				if (!element) {
					throw new Error("Attempt to wrap a null DOM element");
				}
			}
			return new ElementWrapper(dom.byId(element));

		};

		createElement = function(elementName, attributes, body) {
			var element;

			if (_.isObject(elementName)) {
				body = attributes;
				attributes = elementName;
				elementName = null;
			}
			if (_.isString(attributes)) {
				body = attributes;
				attributes = null;
			}
			element = wrapElement(document.createElement(elementName || "div"));
			if (attributes) {
				element.attr(attributes);
			}
			if (body) {
				element.update(body);
			}
			return element;
		};

		_.extend(exports, {
			wrap : wrapElement,
			create : createElement,
			ajaxRequest : ajaxRequest,
			on : function(selector, events, match, handler) {

				if (handler == null) {
					handler = match;
					match = null;
				}
				var elements = q(selector);
				onevent(elements, events, match, handler);
			},
			onDocument : function(events, match, handler) {
				return exports.on(document, events, match, handler);
			},
			body : wrapElement(document.body),
			scanner : scanner
		});

		return exports;
	});

}).call(this);