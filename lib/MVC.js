 	(function(){
 		var MVC = {};
		var Observer = function() {
			this.callbacks = [];
		};
		Observer.prototype.add = function(callback) {
			this.callbacks.push(callback);
		};
		Observer.prototype.remove = function() {
			this.callbacks = [];
		};
		Observer.prototype.trigger = function() {

		};

		var Event = function(){
			this.events = {};
		};	
		Event.prototype.on = function(type, callback) {
			var events = this.events ? this.events : (this.events = {}); 
			if(!events[type]){
				observer = new Observer();
				events[type] = observer;
			}
			observer.add(callback);
		};
		Event.prototype.trigger = function(type) {
			if(!this.events[type]) throw new Error(type+"不存在");
			var args = [].slice.call(arguments, 1); 
			var callbacks = this.events[type].callbacks, len = callbacks.length;
			for(var i = 0; i < len; i++){
				return callbacks[i].apply(this, args)
			}
		};
		Event.prototype.off = function(type) {
			var events = this.events;
			if(!events[type]) return;
			return delete events[type];
		};	
		var extendProps = function(target, sources){
			sources = [].slice.call(arguments, 1);
			var len = sources.length; if(len == 0) return target;
			while(source = sources[--len]){
				for(var name in source){
					if(source.hasOwnProperty(name)){
						target[name] = source[name];
					}
				}
			}
			return target;
		};
		var extend = function(protoProps, staticProps){
			var parent = this;
			var subClass = function(){
				return parent.apply(this, arguments);
			};
			subClass.extend      = extend;
			subClass.extendProps = extendProps;              //扩展静态方法
			extendProps(subClass, staticProps);

			var F = function (argument) {
				this.constructor = subClass;
			};
			F.prototype = parent.prototype;
			subClass.prototype = new F()
			extendProps(subClass.prototype, protoProps);    //扩展原型方法
			return subClass;
		};
		var Class = function(){
			this.construct.apply(this, arguments);
			this.init.apply(this, arguments);
		};
		Class.prototype.init = function(){}
		Class.prototype.construct = function(){}
		Class.extend = extend;
		Class.extendProps = extendProps;
		
		var Model = Class.extend(extendProps({
			defaults  : {},
			construct: function(options){
				this.attrs = extendProps({}, options, this.defaults)
			},
			set: function(prop, value, switchObj){
				var attrs = this.attrs,
					self = this;
				if(typeof prop == "object"){
					switchObj = value;
					for(var item in prop){
						return setValue(item, prop[item], switchObj);
					}
				}else if(typeof prop == "string"){
					return setValue(prop, value, switchObj);
				}
				function setValue(prop, value, silent){
					if(!prop in attrs){
						throw new Errow(prop+"没有初始化");
					}
					var prevVal = attrs[prop];
					if(prevVal !== value && (!switchObj || !switchObj.silent)){
						attrs[prop] = value;
						return self.trigger.call(self, "change:"+prop, value);
					}
				}
			},
			unset:function(prop){

			},
			get: function(type){
				return this.attrs[type];
			}
			
		}, Event.prototype));


		var View       = Class.extend({
			construct: function(el){
				this.el  = el || document.body;
			},
			$el:function(){
				return $(this.el);
			}
		});

		var Controller = Class.extend({
			events: {"click #get a>li": function(){}},
			initEvents: function(){},
			construct: function(model){
				this.model = model;
			},
			data      : function(){},
			init: function(){

				this.data();
				this.initEvents();
				this.quickBindEvent();
			},
			listenChange: function(model, prop, callback){
				var self = this;
				self.model.on("change:"+prop, function(){
					callback.apply(self, arguments)
				});
			},
			quickBindEvent: function(){    //"click #aaa a": 
				var self = this, _event, events = this.events
				for(ev in events){
					var arrayEvent = ev.split(" "),
					    eventType = arrayEvent.shift() || "",
					    selector = arrayEvent.join(" ");
					(function(ev){
						$(selector).on(eventType, function(){
							var callback = events[ev];
							if(typeof callback == "function"){
								callback.apply(self, arguments);
							}else if(typeof callback == "string"){
								self[callback].apply(self, arguments);
							}else{
								throw new Error(callback+"参数不对")
							}
						});
					})(ev)
				}
			}

		}); 
		MVC.Model 	   = Model;
		MVC.Controller = Controller;
		MVC.View       = View;
		window.MVC = MVC;
	})()