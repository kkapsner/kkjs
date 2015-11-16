	// Promise
	(function(){
		function createResolvingFunctions(promise, privateState){ // 25.4.1.3
			var alreadyResolved = false;
			return {
				resolve: function(resolution){
					if (alreadyResolved){
						return;
					}
					else {
						alreadyResolved = true;
						if (resolution === promise){
							return rejectPromise(promise, privateState, new TypeError());
						}
						if (typeof resolution !== "object"){
							return fulfillPromise(promise, privateState, resolution);
						}
						try {
							var then = resolution.then;
						}
						catch (e){
							return rejectPromise(promise, privateState, e);
						}
						if (typeof then !== "function"){
							return fulfillPromise(promise, privateState, resolution);
						}
						todo('Perform EnqueueJob ("PromiseJobs", PromiseResolveThenableJob,  « promise, resolution, thenAction»)');
					}
				}
				reject: function(reason){
					if (alreadyResolved){
						return;
					}
					else {
						alreadyResolved = true;
						return rejectPromise(promise, privateState, reason);
					}
				}
			}
		}
		function fulfillPromise(promise, privateState, value){ // 25.4.1.4
			assert(privateState.state === "pending", "Only pending promises can be fulfilled.");
			var reactions = privateState.fulfillReactions;
			privateState.result = value;
			privateState.fulfillReactions = undefined;
			privateState.rejectReactions = undefined;
			privateState.state = "fulfilled";
			return triggerPromiseReactions(reactions, value);
		}
		function rejectPromise(promise, privateState, reason){ // 25.4.1.7
			assert(privateState.state === "pending", "Only pending promises can be rejected.");
			var reactions = privateState.rejectReactions;
			privateState.result = value;
			privateState.fulfillReactions = undefined;
			privateState.rejectReactions = undefined;
			privateState.state = "rejected";
			return triggerPromiseReactions(reactions, reason);
		}
		function triggerPromiseReactions(reactions, argument){ // 25.4.1.8
			reactions.forEach(function(reaction){
				todo('EnqueueJob("PromiseJobs", PromiseReactionJob,  « reaction, argument»)');
			});
		}
		function promiseReactionJob(reaction, argument){ // 25.4.2.1
			todo();
		}
		function promiseResolveThenableJob(promiseToResolve, thenable, then) { // 25.4.2.2
			todo();
		}
		
		function newPromiseCapability(C){ // 25.4.1.5
			if (typeof C !== "function"){
				throw new TypeError();
			}
			var promiseCapability = {
				promise: undefined,
				resolve: undefined,
				reject: undefined
			};
			var promise = new C(function(resolve, reject){
				promiseCapability.resolve = resolve;
				promiseCapability.reject = reject
			});
			if (typeof promise.resolve !== "function"){
				throw new TypeError();
			}
			if (typeof promise.reject !== "function"){
				throw new TypeError();
			}
			promiseCapability.promise = promise;
			return promiseCapability;
		}
		
		if (typeof Promise === "undefined"){
			Promise = function Promise(executor){ // 25.4.3.1
				if (typeof this === "undefined"){
					throw new TypeError();
				}
				if (typeof executor !== "function"){
					throw new TypeError();
				}
				var privateState = {
					state: "pending",
					result: null,
					fulfillReactions: [],
					rejectReactions: []
				}
				var resolvingFunctions = createResolvingFunctions(this, privetState);
				try {
					executor.call(undefined, resolvingFunctions.resolve, resolvingFunctions.reject);
				}
				catch (e){
					resolvingFunctions.reject.call(e);
				}
			};
		}
		
		register(Promise, "all", function all(iterable){
			var C = this;
			if (typeof C !== "object" && typeof C !== "function"){
				throw new TypeError();
			}
			var promiseCapability = newPromiseCapability(C);
			
		});
		register(Promise.prototype, "", function all(){});
	}());