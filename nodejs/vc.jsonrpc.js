var najax = require('./najax');process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
/**
 * Create an instance of vcJsonRpc
 *
 * @constructor
 * @this {vcJsonRpc}
 * @param {string} endpoint Relative or absolute URL to which requests are sent, must be defined.
 */
function vcJsonRpc(endpoint, errorHandler, successHandler) {

    if ( typeof endpoint === 'undefined' )
        throw("endpoint not defined");
    if ( typeof(endpoint) !== 'string' )
        throw("endpoint not a string");
    this._endpoint = endpoint;
    this._endpointServer = this.extractEndpointServer(this._endpoint);
    this._mockEnabled = true;
    this._options = {};
    this._header = {};
    this._cert = null;
    this._key = null;
    this._stash_cert = null;
    this._stash_key = null;
    this._options.beforeSend = null;
    this._version = '2.0';
    this._profile = false;
    this._profileLog = {};
    this._type = 'POST';
    this._id = 1;
    if ( typeof(errorHandler) === 'function' ) {
        this._errorHandler = errorHandler;
    } else {
        this._errorHandler = null;
    }
    if ( typeof(successHandler) === 'function' ) {
        this._successHandler = successHandler;
    } else {
        this._successHandler = null;
    }
    // make visible for node client
    this.mockAjax = vcMockAjax;
    this._generateId = function() {
        return (this._id)++;
    };
    this._jqueryLoaded = true;
    try {
        if (typeof jQuery === 'undefined')
            this._jqueryLoaded = false;
    } catch(err) {
        this._jqueryLoaded = false;
    }

    //  live edge members
    this._liveEdgeId = null;
    this._liveEnterpriseId = null;
    this._liveEdgeCallbacks = {};
    this._liveEdgeInterval = null;
    this._liveEdgeRefreshIntervalMSec = 2000;
    this._liveEdgeToken = null;
    this._liveEdgeUrl = null;
    this._liveEdgeServer = null;
    this._liveEdgeConnEventCallback = null;

    this._liveEdgeReadyCallback = null;/* deprecated */
    this._liveEdgeStatusCallback = null;/* deprecated */
}

vcJsonRpc.prototype._liveConnectionEvent = {
    "LIVE_EDGE_ENTRY" : 1,
    "LIVE_EDGE_EXIT" : 2,
    "LIVE_EDGE_STATUS" : 3,
    "LIVE_EDGE_POLL_ERROR" : 4
};

vcJsonRpc.prototype.getEndpointServer = function() {
    return this._endpointServer;
}

vcJsonRpc.prototype.setProfile= function(sense) {
    this._profile = sense;
    return this._profile;
}

vcJsonRpc.prototype.extractEndpointServer = function(endpoint) {
    if ( (endpoint != null) && (typeof(endpoint) === 'string' ) )
    {
        var index = endpoint.lastIndexOf("/");
        if ( index > 0 ) {
            index = endpoint.lastIndexOf("/", index-1);
            if ( index > -1 ) {
                return endpoint.substr(0,index);
            }
        }
    }
    return "";
}

var _mockAjax = null;
/**
 * Register a mock function to over-ride the server call on method invocation.
 *
 * @param {json} mock	A JSON data structure that identifies a method name,
 *                      and the data to be
 *                      returned from the mock call.  The JSON data structure has
 *                      the following attributes.<br><br>
 *                      { method: 'mymethod', responseTime: 1000, responseData: [json]}
 *                      <br><br>or<br><br>
 *                      { method: 'mymethod', responseTime: 1000, response: [function]}
 *                      <br><br>or<br><br>
 *                      { method: 'mymethod', responseTime: 1000, url: file.json}
 *                      <br><br>
 *                      The <i>responseTime</i> attribute is specified in msec and is optional,
 *                      it defaults to 250 ms. To define a random wait time, use a Javascript
 *                      expression like:  Math.random().  The JSON returned by the mock
 *                      call can be hardcoded as <i>responseData</i>, or an anonymous function
 *                      can be defined using the  <i>response</i> attribute.  The response
 *                      function is passed the params to the method call, and should set
 *                      <i>this.responseData</i> with the desired response.  Alternatively,
 *                      mock JSON can be configured as resources downloadable
 *                      from the web. Define an url to be accessed and downloaded to retrieve.
 *                      the mock JSON.
 */
function vcMockAjax(mock) {
    if ( _mockAjax == null )
        _mockAjax = new Object();
    if ( typeof mock.method === 'string' )
        _mockAjax[mock.method] = mock;
}

function vcGetMockAjax(method) {
    if ( (_mockAjax != null) && (typeof method === 'string') ) {
        if ( method in _mockAjax )
            return _mockAjax[method];
    }
    return null;
}

/**
 * Get a globally scoped object wrapping the handler
 * function and data to be called after the execution of
 * a mock function.
 *
 * @param {function} handler A success or error function to be called after the
 *                           user's mock function returns, and the mock function wait
 *                           timeout expires.
 * @param {json} data Data returned from user's mock function, to be passed onto
 *                             the handler on timer expiration.
 * @param {object} deferred JQuery deferred object
 * @param {boolean} isSuccess Boolean indicating whether to mock a succesfull or failed return
 * @return {object} Object containing the passed parameters for later use
 */
vcJsonRpc._getMockHandler = function(handler,data,deferred,isSuccess) {
    var obj = new Object();
    if ( typeof handler !== 'undefined' )
        obj._handler = handler;
    else
        obj._handler = null;
    if ( typeof data !== 'undefined' )
        obj._data = data;
    else
        obj._data = null;
    if ( typeof deferred !== 'undefined' )
        obj._deferred = deferred;
    else
        obj._deferred = null;
    if ( typeof isSuccess !== 'undefined' )
        obj._isSuccess = isSuccess;
    else
        obj._isSuccess = true;
    return obj;
};

/**
 * Run the success or error handler after expiration of a mock function timeout.
 *
 * @return {object} endpoint URL string
 */
vcJsonRpc._runMockHandler = function(obj) {
    if ( typeof obj !== 'undefined' ) {
        if ( obj._handler != null )
            obj._handler(obj._data);
        if ( obj._deferred != null )
        {
            if ( obj._isSuccess )
                obj._deferred.resolve(obj._data);
            else
                obj._deferred.reject(obj._data);
        }
        delete obj;
    }
};

/**
 * Disable mock data handling
 */
vcJsonRpc.prototype.disableMockHandler = function() {
    this._mockEnabled = false;
};

/**
 * Enable mock data handling
 */
vcJsonRpc.prototype.enableMockHandler = function() {
    this._mockEnabled = true;
};

/**
 * Is mock data handling enabled
 *
 * @return {boolean } True if mock handling is enabled.
 */
vcJsonRpc.prototype.isMockHandlerEnabled = function() {
    return this._mockEnabled;
};

/**
 * Return user defined JSON-RPC endpoint
 *
 * @return {string} endpoint URL string
 */
vcJsonRpc.prototype.getEndpoint = function() {
    return this._endpoint;
};

/**
 * Set the JSON-RPC endpoint. Invocations of the call() method are
 * delivered to this URL
 *
 * @param {string} endpoint URL string
 */
vcJsonRpc.prototype.setEndpoint = function(endpoint) {
    this._endpoint = endpoint;
};

/**
 *  Add headers to the NAJAX call
 */
vcJsonRpc.prototype.setHeaders = function(headers) {
    this._headers = headers;
};

vcJsonRpc.prototype.getHeaders = function() {
    return this._headers;
};

vcJsonRpc.prototype.setCert = function(cert) {
    this._cert = cert;
}

vcJsonRpc.prototype.setKey = function(key) {
    this._key = key;
}

vcJsonRpc.prototype.stashCertificate= function(cert) {
    this._stash_cert = this._cert;
    this._stash_key = this._key;
    this._cert = null;
    this._key = null;
}

vcJsonRpc.prototype.restoreCertificate= function(cert) {
    this._cert = this._stash_cert;
    this._key = this._stash_key;
    this._stash_cert = null;
    this._stash_key = null;
}

/**
 *  Set default error handler
 */
vcJsonRpc.prototype.setErrorHandler = function(handler) {
    this._errorHandler = handler;
}

/**
 *  Get default error handler function
 */
vcJsonRpc.prototype.getErrorHandler = function() {
    return this._errorHandler;
}

/**
 *  Get default success handler function
 */
vcJsonRpc.prototype.getSuccessHandler = function() {
    return this._successHandler;
}

/**
 *  Set verb type
 */
vcJsonRpc.prototype.setType = function(type) {
    this._type = type;
}


/**
 * Create a JSON-RPC compliant method call
 *
 * @param {string} method, method name
 * @param {string} [params] parameters string
 * @return {string} json-rpc package, with method, params and id
 */
vcJsonRpc.prototype._makeRequest = function(method, params) {
    var data = {};
    data.jsonrpc = this._version;
    data.method = method;
    data.params = params;
    data.id = this._generateId();
    return JSON.stringify(data);
};

vcJsonRpc.prototype._extend = function(obj1, obj2) {
    for (var p in obj2) {
        if( obj2.hasOwnProperty(p)){
            obj1[p] = typeof obj2[p] === 'object' ? this._extend(obj1[p], obj2[p]) : obj2[p];
        }
    }
    return obj1;
};

vcJsonRpc.prototype._isArray = function(obj) {
    if ( typeof obj === 'undefined' )
        return false;
    if (obj.constructor === Array)
        return true;
    else
        return false;
};


/**
 * Get relevant data string from returned response
 *
 * @param {object} response, method name
 * @param {string} params, parameters string
 * @return {string} json-rpc package, with method, params and id
 */
vcJsonRpc.prototype._response = function(response) {
    if (typeof(response) === 'undefined') {
        return {"error":{"code": -32605, "message": "no response from server"}};
    } else {
        try {
            if ( typeof(response) === 'string' ) {
                response = eval ( '(' + response + ')' );
            } else
            if ( this._isArray(response) ) {
                if ( response.length == 0  )
                    return {"error":{"code": -32605, "message": "JSON-RPC missing response"}};
                response = response[0];
                if ( !"jsonrpc" in response )
                    return {"error":{"code": -32605, "message": "JSON-RPC missing version"}};
                if ( response.jsonrpc !== '2.0' )
                    return {"error":{"code": -32605, "message": "JSON-RPC version error"}};
                return response;
            }
            if ( !"jsonrpc" in response )
                return {"error":{"code": -32605, "message": "JSON-RPC missing version"}};
            if ( response.jsonrpc !== '2.0' )
                return {"error":{"code": -32605, "message": "JSON-RPC version error"}};
            return response;
        } catch (e) {
            return {
                "error":{
                    "code": -32605,
                    "message": "Internal Error",
                    "exception": e.message,
                    "response": response
                }
            };
        }
    }
};

vcJsonRpc.prototype._requestError = function(json, error)
{
    if ( typeof(error) === 'function' )
    {
        if (typeof(json.responseText) === 'string')
        {
            try {
                var response = eval ( '(' + json.responseText + ')' );
                if ( typeof(response) !== 'undefined' ) {
                    if ( response.error )
                        error(response.error);
                    error(response);
                    return;
                } else {
                    var response = this._response();
                    if ( response.error )
                        error(response.error);
                    else
                        error(response);
                }
            } catch(e) {
              var response = this._response();
              if ( response.error )
                 error(response.error);
              else
                 error(response);
            }
        } else {
            if ( json && json.hasOwnProperty("error") )
                return error(json.error);
            var response = this._response(json);
            if ( response.error )
                return error(response.error);
            else
                return error(response);
        }
    }
};

/**
 * Extract JSON-RPC payload from AJAX XMLHTTPResponse.  Use this
 * function when jQuery $.when().done() is used to process JSON-RPC results.
 * Normally neither success or error functions are passed to the vcJsonRpc.call()
 * method.<br>
 * For example:<br><br><code>
 * $.when( vco.call("getOperators",{}) ).done(function(d1){ payload = vco.<b>getResult</b>(d1); })
 *
 * </code>
 * @param {json} json, parameter passed to a $.when().done or .always() function
 * @return {json} json-rpc payload, as normally seen in a vcJsonRpc success or error function
 */
vcJsonRpc.prototype.getResult = function(json) {
    var response = this._response(json);
    if ( response && ("result" in response) )
        return response.result;
    return json;
};

vcJsonRpc.prototype._requestSuccess = function(json, success, error) {

    //  if no handlers, just return
    if ( (typeof(error) !== 'function') && (typeof(success) !== 'function') )
        return;

    var response = this._response(json);
    // JSON error calls error callback
    if ( response.error )
    {
        error(response.error);
    } else
    if ( typeof(success) === 'function' ) {
        if ( typeof(response.result) !== 'undefined' )
            success(response.result);
        else
            success(response);
    }
};

/**
 * Call a JSON-RPC method
 *
 * @param {string} method Method name
 * @param {json} [params] JSON parameters formatted according to the <a href="http://www.jsonrpc.org/specification#parameter_structures">JSON-RPC</a> specification.
 * @param {function} [onSuccess] Function to be called, with response payload, on call success.
 * @param {function} [onError] Function to be called, with error payload, on call failure. Failure
 *                             of a call can mean either that the server could not be reached, that
 *                             the server was reachable but the JSON-RPC invocation could not be
 *                             processed, or that the invocation was processed but resulted in an
 *                             error from the server.  In all three cases the onError handler will
 *                             be called.
 * @param {json} [options] JSON object defining any of the parameters valid for a jQuery.ajax() call.
 * @return {object} Returns the jQuery.promise() object generated by the underlying jQuery.ajax()
 *                  call. Note that if the method is mocked, no promise is returned.
 *
 */
vcJsonRpc.prototype.call = function(method,
                                    params,
                                    onSuccess,
                                    onError,
                                    options) {

    if ( typeof(method) === 'undefined' )
        throw("json-rpc method not defined");
    if ( typeof(params) === 'undefined' )
        throw("json-rpc parameters not defined");

    // shortcut if the method is mocked
    var mockData = vcGetMockAjax(method);
    if ( this.isMockHandlerEnabled() && mockData != null ) {
        var wait = 250;
        var url = null;
        var handler = onSuccess;
        var responseData = {};
        var isSuccess = true;

        if ( ("error" in mockData) && (mockData["error"] == true) ) {
            handler = onError;
            if ( "errorData" in mockData ) {
                responseData = mockData.errorData;
            }
            isSuccess = false;
        } else
        if ( "url" in mockData ) {
            url = mockData.url;
        } else
        if ( "response" in mockData ) {
            (mockData.response)(params);
            responseData = mockData.responseData;
        } else
        if ( "responseData" in mockData ) {
            responseData = mockData.responseData;
        }

        if ( typeof mockData.responseTime === 'number' ) {
            wait = mockData.responseTime;
        }

        var deferred = null;
        if ( this._jqueryLoaded ) {
            deferred = new $.Deferred();
            if ( url != null ) {
                $.get(url).done(
                    function(data) {
                      var json = data;
                      if ( typeof data === 'string' ) {
                          try {
                              json = JSON.parse(JSON.minify(data));
                          } catch (err) {
                              json = null;
                          }
                      }
                      var mh = vcJsonRpc._getMockHandler(handler, json, deferred, isSuccess);
                      setTimeout( function() { vcJsonRpc._runMockHandler(mh); }, wait );
                    }
                );
                return deferred.promise();
            }
        }
        var mh = vcJsonRpc._getMockHandler(handler, responseData, deferred, isSuccess);
        setTimeout( function() { vcJsonRpc._runMockHandler(mh); }, wait );

        if ( this._jqueryLoaded )
            return deferred.promise();
        return null;
    }

    // create jscon-rpc request package
    var request = this._makeRequest(method, params);

    // merge default and incoming options
    var mergedOptions = {};
    if ( typeof(onError) === 'function' ) {
         mergedOptions.error = onError;
    } else {
         if ( typeof(this.getErrorHandler()) === 'function' )
             mergedOptions.error = this.getErrorHandler();
         else
             mergedOptions.error = null;
    }
    if ( typeof(onSuccess) === 'function' ) {
         mergedOptions.success = onSuccess;
    } else {
         if ( typeof(this.getSuccessHandler()) === 'function' )
             mergedOptions.success= this.getSuccessHandler();
         else
             mergedOptions.success= null;
    }
    if ( typeof options !== 'undefined' ) {
        this._extend(mergedOptions, options);
    }

    // make the call
    if ( this._jqueryLoaded )
        return this._doJqueryAjaxCall(request, mergedOptions);
    else
        return this._doNajaxCall(request, mergedOptions);
};

vcJsonRpc.prototype._doJqueryAjaxCall = function(data, options) {

    var _callId = null;
    var _that = this;
    var dfdResult = $.Deferred();

    if (this._profile === true) {
        try {
            var _temp = JSON.parse(data);
            _callId = _temp.method + "." + _temp.id;
            this._profileLog[_callId] = new Date();
        } catch (exception) {
            console.log(exception);
        }
    }
    
    var headers = {};
    
    // NOTE: Needs to be removed once we clean up vcJsonRpc.call
    if (app && app.getState) {
        var clientPrivilegesVersion = app.getState('privilegesVersion');
        headers['x-vco-privileges-version'] = clientPrivilegesVersion;
    }
    
    $.ajax({
        type: this._type,
        dataType: 'json',
        contentType: 'application/json',
        // timeout: 60000, // @PANOS: ENABLE THIS VALUE FOR DEBUGGING.
        url: this._endpoint,
        data: data,
        beforeSend: options.beforeSend,
        cache: false,
        processData: false,
        headers: headers,
        error: function(response) {
            if (response != null && response.hasOwnProperty("status") &&
                response.status == 0) {
                response = {
                    "error": {
                        "code": response.status,
                        "message": response.statusText
                    }
                };
            }
            _that._requestError.call(_that,
                response,
                options.error);

            if (response && response.error && response.error.code === -32000) {
                // @20150203-1710 this is an interim patch to block further processing if the response was a -32000 "session timeout". Never resolve or reject the promise, which will give the app.handleError's location.href enough time to redirect to the login screen. if the promise is resolved or rejected, then the model/controller will get control of processing and may flash an error message.
                return;
            }

            dfdResult.reject(response);
        },
        success: function(response, textStatus, request) {
            if ((_that._profile === true) && (_callId !== null)) {
                var _endTime = new Date();
                var _startTime = _that._profileLog[_callId];
                console.log("[method profile] " + _callId + " = " +
                    (_endTime.getTime() - _startTime.getTime()) + " mSec");
                delete _that._profileLog[_callId];
            }
            _that._requestSuccess.call(_that,
                response,
                options.success,
                options.error);

            if (response && response.error && response.error.code === -32000) {
                // @20150203-1710 this is an interim patch to block further processing if the response was a -32000 "session timeout". Never resolve or reject the promise, which will give the app.handleError's location.href enough time to redirect to the login screen. if the promise is resolved or rejected, then the model/controller will get control of processing and may flash an error message.
                return;
            }

            dfdResult.resolve(response);
            
            // NOTE: Needs to be removed once we clean up vcJsonRpc.call
            if (request && request.getResponseHeader('x-vco-privileges-version')) {
                var serverPrivilegesVersion = request.getResponseHeader('x-vco-privileges-version');
                
                if (clientPrivilegesVersion && serverPrivilegesVersion && clientPrivilegesVersion !== serverPrivilegesVersion) {
                    if (app && response.meta && response.meta.privileges) {
                        var obj = {
                            privileges: response.meta.privileges,
                            version: serverPrivilegesVersion
                        };
                
                        $(app).trigger('privilegesChanged', obj);
                    }
                }
            }
        }
    });

    return dfdResult;
};

vcJsonRpc.prototype._doNajaxCall = function(data, options) {

    var _that = this;
    if ( options.beforeSend )
        options.beforeSend.call(data);
    najax.post( {url:this._endpoint,
                 data: data,
                 headers: this._headers,
                 key: this._key,
                 cert: this._cert,
                 contentType:"xml",
                 success:function(response){
                                _that._requestSuccess.call(_that,
                                                           response,
                                                           options.success,
                                                           options.error);
                                },
                  error:function(response){
                                console.log("najax error");
                                _that._requestError.call(_that,
                                                         response,
                                                         options.error);
                                }
                 }
    );
};

//////////////////////////////////////////////////////////////////////
//
//  live edge support
//
vcJsonRpc.prototype.setLiveEdgeCallbacks = function(callbacks, reset) {
    var doReset = false;
    if ( typeof(reset) === 'boolean' ) {
        doReset = reset;
    }
    if ( doReset )
        this._liveEdgeCallbacks = {};
    if ( (typeof(callbacks) === 'object') && (callbacks != null) ) {
        for (var section in callbacks ) {
            var func = callbacks[section];
            if ( typeof(func) === 'function' )
                (this._liveEdgeCallbacks)[section] = func;
        }
    }
};

vcJsonRpc.prototype.setLiveEdgeCallback = function(name, func) {
    var obj = {};
    if ( (typeof(name) === 'string') && (typeof(func) === 'function') ) {
        obj[name] = func;
        this.setLiveEdgeCallbacks(obj, false);
    }
};

// actions is an array of {"action" : <action name>", "parameters" : <action params>} objects
vcJsonRpc.prototype.requestLiveEdgeActions = function(actions, successFn, errorFn) {
    if (this._liveEdgeId) {
        if (actions && Array.isArray(actions)) {
            var params = {};
            params.actions = actions;
            params.token = this._liveEdgeToken;
            return this._liveEdgeServer.call('liveMode/requestLiveActions', params, successFn, errorFn);
        } else {
            console.log("must specify actions as an array");
            if (errorFn && typeof(errorFn) == 'function')
                return setTimeout(function() {return errorFn("must specify an actions array");}, 0);
        }
    } else {
        console.log("must enter live mode first");
        if (errorFn && typeof(errorFn) == 'function')
            return setTimeout(function() {return errorFn("not in live mode");}, 0);
    }
};

vcJsonRpc.prototype.getLiveEdgeConnectionEventTypes = function() {
    return this._liveConnectionEvent;
};

vcJsonRpc.prototype.getLiveEdgeCallback = function(name) {
    if ( this._liveEdgeCallbacks.hasOwnProperty(name) )
        return this._liveEdgeCallbacks[name];
    return null;
};

vcJsonRpc.prototype.getLiveEdge = function() {
    return this._liveEdgeId;
};

vcJsonRpc.prototype._livePollError = function(err) {
    console.log("live edge poll error: " + JSON.stringify(err));
    if ( this._liveEdgeConnEventCallback ) {
        setTimeout(this._liveEdgeConnEventCallback.bind(undefined, {"event": this._liveConnectionEvent.LIVE_EDGE_POLL_ERROR, "value" : err}), 0);
    }
};

vcJsonRpc.prototype._livePollSuccess= function(response) {

    if ( response ) {
        if ( response.hasOwnProperty("data") ) {
            var data = response.data;
            for ( name in data ) {
                var fn = this.getLiveEdgeCallback(name);
                if ( fn != null ) {
                    var section = data[name];
                    //
                    // the first parameter to bind sets (this), which we will
                    // leave undefined, and the second, third, etc are the
                    // parameter arguments, which we use to pass data onto
                    // the callback function. Run the callback asynchronously
                    // so that we can get out of this loop without stalling.
                    //
                    setTimeout(fn.bind(undefined,section),0);
                }
           }
        }
        if ( response.hasOwnProperty("status") ) {
            if ( this._liveEdgeStatusCallback ) {
                setTimeout(this._liveEdgeStatusCallback.bind(undefined, response.status), 0);
            }
            if ( this._liveEdgeConnEventCallback ) {
                setTimeout(this._liveEdgeConnEventCallback.bind(undefined, {"event": this._liveConnectionEvent.LIVE_EDGE_STATUS, "value" : response.status}), 0);
            }
        }
    }
};

vcJsonRpc.prototype._liveEdgePoll= function() {

    if ( this._liveEdgeServer ) {
        var params = {};
        params.token = this._liveEdgeToken;
        this._liveEdgeServer.call("liveMode/readLiveData",
                                  params,
                                  this._livePollSuccess.bind(this),
                                  this._livePollError.bind(this));
    }
};

vcJsonRpc.prototype._beginLiveEdgePolling = function() {
    this._liveEdgeInterval = setInterval(this._liveEdgePoll.bind(this),
                                         this._liveEdgeRefreshIntervalMSec);
};

vcJsonRpc.prototype._enterLiveModeSuccess = function(response) {
    if ( response ) {
        if (response.hasOwnProperty("token"))
            this._liveEdgeToken = response.token;
        if (response.hasOwnProperty("url"))
           this._liveEdgeUrl = response.url;
        if (response.hasOwnProperty("refreshIntervalMs"))
            this._liveEdgeRefreshIntervalMSec = response.refreshIntervalMs;
        var endpoint = this.extractEndpointServer(this._liveEdgeUrl);
        if ( endpoint.length == 0 )
            endpoint = this.getEndpointServer() + this._liveEdgeUrl;
        else
            endpoint = this._liveEdgeUrl;
        this._liveEdgeServer = new vcJsonRpc(endpoint);
        this._beginLiveEdgePolling();
    }
    if ( this._liveEdgeReadyCallback && typeof (this._liveEdgeReadyCallback) == 'function' ) {
        console.log("calling live edge ready with true");
        this._liveEdgeReadyCallback(true);
    }
    if ( this._liveEdgeConnEventCallback ) {
        this._liveEdgeConnEventCallback({"event": this._liveConnectionEvent.LIVE_EDGE_ENTRY, "value" : true});
    }
};

vcJsonRpc.prototype._enterLiveModeError = function(err) {
    console.log("error on live mode entry: " + JSON.stringify(err));
    if (this._liveEdgeReadyCallback ) {
        console.log("calling live edge ready with false");
        this._liveEdgeReadyCallback(false);
    }
    if ( this._liveEdgeConnEventCallback ) {
        this._liveEdgeConnEventCallback({"event": this._liveConnectionEvent.LIVE_EDGE_ENTRY, "value" : false, "detail" : err});
    }
};

vcJsonRpc.prototype.enterLiveMode = function() {

    var params = { "id": this._liveEdgeId };

    if (this._liveEnterpriseId) {
       params.enterpriseId = this._liveEnterpriseId;
    }

    this.call("liveMode/enterLiveMode",
              params,
              this._enterLiveModeSuccess.bind(this),
              this._enterLiveModeError.bind(this));
};

vcJsonRpc.prototype.setLiveEdge = function(edge, callbacks, readyCallback, statusCallback) {

    if ( (edge == null) && (typeof(edge) === 'undefined') )
        return false;

    var id = null;
    var enterpriseId = null;
    if ( typeof(edge) === 'object' ) {
        if ( edge.hasOwnProperty("id") )
            id = edge.id;
        if ( edge.hasOwnProperty("enterpriseId") )
            enterpriseId = edge.enterpriseId;
    } else if ( typeof(edge) === 'number' ) {
        id = edge;
    } else if ( typeof(edge) === 'string' ) {
        var tid= parseInt(edge);
        if ( !isNaN(tid) )
            id = tid;
    }
    if ( id == null ) {
        console.log("edge ID not specified");
        return false;
    }
    //
    //  if already active, clear out the data associated with the old edge
    //
    if ( this._liveEdgeId != null )  {
        if ( this._liveEdgeId == id )
            return true;
        var resetCallbacks = false;
        if ( callbacks )
            resetCallbacks = true;
        this._clearLiveEdge(resetCallbacks);
    }
    this._liveEdgeId = id;
    this._liveEnterpriseId = enterpriseId;
    if (readyCallback) {
        this._liveEdgeReadyCallback = readyCallback;
    }

    if (statusCallback) {
        this._liveEdgeStatusCallback = statusCallback;
    }

    if ( (typeof(callbacks) === 'undefined') || (callbacks==null) )
        this.setLiveEdgeCallbacks(null, true);
    else
        this.setLiveEdgeCallbacks(callbacks, true);
    this.enterLiveMode();
    return true;
};

vcJsonRpc.prototype.setLiveEdgeEx = function(edge, callbacks, connectionEventCallback) {

    if ( (edge == null) && (typeof(edge) === 'undefined') )
        return false;

    var id = null;
    var enterpriseId = null;
    if ( typeof(edge) === 'object' ) {
        if ( edge.hasOwnProperty("id") )
            id = edge.id;
        if ( edge.hasOwnProperty("enterpriseId") )
            enterpriseId = edge.enterpriseId;
    } else if ( typeof(edge) === 'number' ) {
        id = edge;
    } else if ( typeof(edge) === 'string' ) {
        var tid= parseInt(edge);
        if ( !isNaN(tid) )
            id = tid;
    }
    if ( id == null ) {
        console.log("edge ID not specified");
        return false;
    }
    //
    //  if already active, clear out the data associated with the old edge
    //
    if ( this._liveEdgeId != null )  {
        if ( this._liveEdgeId == id )
            return true;
        var resetCallbacks = false;
        if ( callbacks )
            resetCallbacks = true;
        this._clearLiveEdge(resetCallbacks);
    }
    this._liveEdgeId = id;
    this._liveEnterpriseId = enterpriseId;

    if ( connectionEventCallback && (typeof (connectionEventCallback) == 'function') ) {
        this._liveEdgeConnEventCallback = connectionEventCallback;
    }

    if ( (typeof(callbacks) === 'undefined') || (callbacks==null) )
        this.setLiveEdgeCallbacks(null, true);
    else
        this.setLiveEdgeCallbacks(callbacks, true);
    this.enterLiveMode();
    return true;
};

vcJsonRpc.prototype._exitLiveModeSuccess = function(response) {
    console.log("live mode exit: " + JSON.stringify(response));
    if ( this._liveEdgeConnEventCallback ) {
        this._liveEdgeConnEventCallback({"event": this._liveConnectionEvent.LIVE_EDGE_EXIT, "value" : true, "detail" : response});
    }
    this._clearLiveEdge(true);
};

vcJsonRpc.prototype._exitLiveModeError = function(err) {
    console.log("live mode exit error: " + JSON.stringify(err));
    if ( this._liveEdgeConnEventCallback ) {
        console.log("calling live edge connection event callback with LIVE_EDGE_EXIT, false, detail=", err);
        this._liveEdgeConnEventCallback({"event": this._liveConnectionEvent.LIVE_EDGE_EXIT, "value" : false, "detail" : err});
    }
    this._clearLiveEdge(true);
};

vcJsonRpc.prototype.exitLiveMode = function() {
    if ( this._liveEdgeServer ) {
        var params = {};
        params.token = this._liveEdgeToken;
        return this._liveEdgeServer.call(
              "liveMode/clientExitLiveMode",
              params,
              this._exitLiveModeSuccess.bind(this),
              this._exitLiveModeError.bind(this));
    }
};

vcJsonRpc.prototype._clearLiveEdge = function(resetCallbacks) {
    if ( this._liveEdgeInterval != null )
    {
        clearInterval(this._liveEdgeInterval);
        this._liveEdgeInterval = null;
    }
    this._liveEdgeId = null;
    if ( resetCallbacks )
        this._liveEdgeCallbacks = {};
    this._liveEdgeServer= null;
    this._liveEdgeToken = null;
    this._liveEdgeUrl = null;
    this._liveEdgeConnEventCallback = null;
    this._liveEdgeReadyCallback = null;
    this._liveEdgeStatusCallback = null;
};

vcJsonRpc.prototype.unsetLiveEdge = function() {
    // console.log("exit live mode called");
    return this.exitLiveMode();
};
module.exports=vcJsonRpc;
