process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
var https = require("https");
//
//  utility to login to VCO and retrieve the cookie needed for user authentiation
//
var functions = {};

//
//  data is a JSON object with the following attributes
//
//  {
//    userType: operator | msp | enterprise (default enterprise)
//    vcoServer : <vco server default localhost>,
//    username : <username to login>,
//    password : <password to login>,
//    port : <server port, default 443>   
//    verbose : true | false (default false)
//    headers : <cookie returned from login, to logout>
//  }
//
functions.login=function(data, callback) {

    var method = "doLogin.html";
    if ( data.userType == "operator" )
        method = "doOperatorLogin.html";

    if ( !data.hasOwnProperty("username") )
        data.username = null;
    if ( !data.hasOwnProperty("password") )
        data.password = null;

    var post_json = {"username":data.username,
                     "password":data.password};
    var post_data = JSON.stringify(post_json);
    var options = {
        "host": data.vcoServer || process.env.VCO_SERVER || "localhost",
        "port": data.port ? data.port : 443,
        "method": "POST",
        "path":"/login/" + method,
        "headers" : {
          'Content-Type': 'application/json;charset=utf-8',
          'Content-Length': post_data.length
        }
    }

    requestCallback = function(response) {

        var cookie = null;
        var str = ''
        response.on('data', function (chunk) {
          str += chunk;
        });

        response.on('end', function () {
            if ( data.verbose )
                console.log(str);
            var cookies = response.headers["set-cookie"];
            if ( cookies ) {
                for( var i=0; i<cookies.length; i++) {
                    if ( cookies[i].indexOf("velocloud.session") === 0 )
                    {
                        cookie = cookies[i];
                        if ( data.verbose )
                            console.log(cookie);
                        break;
                    }
                }
            }
            //callback(cookie);
            setTimeout(function() { callback(cookie); }, 250);
        });
    };

    var req = https.request(options, requestCallback);
    req.write(post_data);
    req.end();
};

functions.logout=function(data, callback) {

    var options = {
        "host": data.vcoServer ? data.vcoServer : "localhost",
        "port": data.port ? data.port : 443,
        "path":"/logout/",
        "headers":data.headers
    };

    requestCallback = function(response) {

        var str = ''
        var cookie = null;

        response.on('data', function (chunk) {
          str += chunk;
        });

        response.on('end', function () {

            if ( data.verbose )
               console.log(str);
            var cookies = response.headers["set-cookie"];
            if ( cookies ) {
                for( var i=0; i<cookies.length; i++) {
                    if ( cookies[i].indexOf("velocloud.session") == 0 )
                    {
                        cookie = cookies[i];
                        if ( data.verbose )
                            console.log(cookie);
                        break;
                    }
                }
            }
            //callback(cookie);
            setTimeout(function() { callback(cookie); }, 250);

        });

    };

    var req = https.request(options, requestCallback);
    req.end();
};

module.exports=functions;
