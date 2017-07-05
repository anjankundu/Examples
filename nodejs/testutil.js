// load standard node libs
var os = require("os");
var fs = require('fs');
var util = require('util');
var read = require('read');

//
//
//  remember to 'ant build' first to create the vc.jsonrpc.js file
//
var __initialProperties = {};
var nodePath="./";
if ( typeof(process.env.NODE_PATH) !== 'undefined' )
    nodePath = process.env.NODE_PATH + "/";
var vcJsonRpc = require(nodePath + 'vc.jsonrpc');

// load third party libs
var async = require(nodePath + 'node_modules/async');

// set the target server
var vcoServer = "localhost";
if ( typeof(process.env.VCO_SERVER) !== 'undefined' )
    vcoServer = process.env.VCO_SERVER;

//  look for env variables set for QA output
var qaOutput = false;
if ( process.env.QA_OUTPUT == "true" )
    qaOutput = true;

var noBackend = false;
if ( process.env.TESTUTIL_NOBACKEND == "true" )
    noBackend = true;

var singleStep = false;
if ( process.env.TESTUTIL_STEP == "true" )
    singleStep = true;

var outputDots = false;
if ( process.env.TESTUTIL_DOTS == "true" )
    outputDots = true;

var enableSwagger = false;
if (process.env.TESTUTIL_ENABLE_SWAGGER === "true")
    enableSwagger = true;

var waitStep = 0;
if ( typeof(process.env.TESTUTIL_WAIT) !== "undefined" )
    waitStep = parseInt(process.env.TESTUTIL_WAIT);

var qaFilePath="./"
if ( typeof(process.env.QA_PATH) !== 'undefined' )
    qaFilePath = process.env.QA_PATH + "/";

// versioning
var _currentEdgeSoftwareVersion = "2.0.0";
function getCurrentEdgeSoftwareVersion() {
    return _currentEdgeSoftwareVersion;
};

var jsonStrSpaces = typeof(process.env.VC_TESTUTIL_JSON_SPACING) === 'undefined' ? 2 :
                    (process.env.VC_TESTUTIL_JSON_SPACING ? parseInt(process.env.VC_TESTUTIL) : null)


// constants for expected results
var _any_ = "__anything__";
var _opt_ = "__optional__";
var _placeholder_ = "__placeholder__";
var _date_ = "__date__";
var _int_ = "__int__";
var _float_ = "__float__";
var _id_ = "__id__";
var _string_ = "__string__";
var _email1_ = "email1@velocloud.net";

//  client certificate and key
var cert = fs.readFileSync(nodePath + "edge.crt", "utf8");
var key = fs.readFileSync(nodePath + "edge.key", "utf8");

//  globals across all tests
var testSuiteName = "";
var testNamePrefix = "test-";
var verbose = false;

// test utility objects
var gc = null;
var test = "";
var lastId = 0;
var testCounter = 0;
var last = {};
var enterpriseRoles = null;
var success = 0;
var fail = 0;
var errorDetail = [];
var apiTestCounter = 0;
var _useTestName = false;

// per test variables
var testNumber = "";
var lastTestId = null;
var lastTestError = "";
var lastTestDescription = "";
var exact = false;
var expected = null;
var errorExpected = null;
var lastResult = {};

//  QA test output format
var csvOutput = {
        test_result_id : "",
        testcase_id : "",
        test_result : "",
        script_name : process.argv[1],
        errno : "",
        version_sut1 : "",
        version_sut2 : "",
        submitter : process.env.USER,
        testbed_name : "testutil",
        timestamp : "",
        related_testcase : "",
        runtime : "",
        archive_link : "",
        testcase_desc : "",
        error_desc : "",
        version_mst : "",
        rsrvd0 : "",
        rsrvd1 : "",
        rsrvd2 : "",
        rsrvd3 : "",
        rsrvd4 : "",
        rsrvd5 : "",
        rsrvd6 : "",
        rsrvd7 : "",
        rsrvd8 : "",
        rsrvd9 : ""
};

var qaFilename = null;
var vcoVersion = null;
var vcoBuildNumber = null;


// timing
var testTimer = new Date();
var elapsedTime = null;
function setElapsedTime() {
    var now = new Date();
    elapsedTime = now - testTimer;
    testTimer = now;
}

function getElapsedTime() {
    return elapsedTime;
}

//
//  utility functions
//
function setTestSuiteName(name) {
    testSuiteName = name;
}

function getTestSuiteName() {
    return testSuiteName;
}

function setTestNamePrefix(prefix) {
    testNamePrefix = prefix;
}

function setSwagger(val) {
  enableSwagger = typeof(val) !== 'boolean' ? true : val;
}

function getSwagger() {
  return enableSwagger;
}

function getTestNamePrefix() {
    return testNamePrefix;
}

function setApiTestCounter() {
    apiTestCounter = 0;
}

function setVerbose(sense) {
    if ( typeof(sense) !== 'boolean' )
        verbose = true;
    else
        verbose = sense;
}

function setSingleStep(val) {
    singleStep = val;
}

function setVcoVersion(callback) {
   vco_portal.call("systemProperty/getSystemProperty", {"name":"product.version"},
                   function successFn(systemProperty) {   
                       vcoVersion = systemProperty.value;
                          callback(null, null);
                   },   
                   function errorFn(err) {
                       console.log("error fetching vco version: " + err);
                          callback(null, null);
                   });
}

function setVcoBuildNumber(callback) {
   vco_portal.call("systemProperty/getSystemProperty", {"name":"product.build.portal.timestamp"}, 
                   function successFn(systemProperty) {   
                        var rawVcoBuildNumber = systemProperty.value;
                        // remove spaces and slashes from portal timestamp
                        vcoBuildNumber = rawVcoBuildNumber.split('/').join('').split(' ').join('');;
                        callback(null, null);
                   },   
                   function errorFn(err) {
                        console.log("error fetching vco build: " + err);
                        callback(null, null);
                   });
}

function getVcoVersion() {
    return (vcoVersion);
}

function getVcoBuildNumber() {
    return (vcoBuildNumber);
}

function setQaFilename() {
    var fullName = process.argv[1];
    var fullNameArray = fullName.split('/');
    var scriptName = fullNameArray[fullNameArray.length -1];

    qaFilename = qaFilePath + scriptName + "_" + getVcoBuildNumber() + "_" + Date.now();
}

function getLocalIpAddress() {
    var interfaces = os.networkInterfaces();
    for ( var interface in interfaces ) {
        if ( interface === "eth0" ) {
            var eth0 = interfaces[interface];
            for ( var i = 0; i < eth0.length; ++i ) {
                if ( eth0[i].family === 'IPv4' ) {
                    return eth0[i].address;
                }
            }
        }
    }

    return null;
}

// set VCO server
var vco_portal = null;
var vco_upload = null;
var vco_server = null;
var vco_portal_cert=true;
var vco_upload_cert=true;

function setPortalCert() {
    vco_portal_cert=true;
} 

function setPortalNoCert() {
    vco_portal_cert=false;
}

function setUploadCert() {
    vco_upload_cert=true;
} 

function setUploadNoCert() {
    vco_upload_cert=false;
}

function getVcoServer() {
    return vco_server;
}

function setNoCert() {
    setPortalNoCert();
    setUploadNoCert();
}

function fetchVcoVersion() {

    setVcoVersion(function(error, data) {
            setQaFilename();
    });

    setVcoBuildNumber(function(error, data) {
            setQaFilename();
    });
}

function setVcoServer(server) {
    vco_portal = new vcJsonRpc('https://' + server + '/portal/');
    vco_upload = new vcJsonRpc('https://' + server + '/upload/');

    vco_portal.setHeaders({'Cookie': null});
    vco_upload.setHeaders({'Cookie': null});

    vco_server = server; 

    if ( vco_portal_cert === true ) {
       vco_portal.setCert(cert);
       vco_portal.setKey(key);
    }

    if ( vco_upload_cert === true ) {
       vco_upload.setCert(cert);
       vco_upload.setKey(key);
   }
}

// get VCO portal
function getVcoPortal() {
    if ( vco_portal == null )
        setVcoServer(vcoServer);
    return vco_portal;
}

// get VCO upload
function getVcoUpload() {
    if ( vco_upload == null )
        setVcoServer(vcoServer);
    return vco_upload;
}

// reset testutil state
function reset() {
    if ( vco_portal )
        vco_portal.setHeaders({'Cookie': null});
    if ( vco_upload )
        vco_upload.setHeaders({'Cookie': null});
    vco_upload = null;
    vco_portal = null;
    vco_portal_cert = true;
    vco_upload_cert = true;
    verbose = false;
    last = {};
    lastResult = {};
    _useTestName = false;
}

function getLiveServer(liveUrl) {
    return new vcJsonRpc('https://' + vco_server + liveUrl);
}

// get start clock
var now = -1;
function startClock() {
    if (now < 0)
        now = Date.now();
    return now;
}


// suite test runs
function execute(tests, callback) {
    startClock();
    return async.waterfall(
        tests,  
        function(err, lastTestResult) {
            if ( !qaOutput ) {
                var result = {"success"  : success , 
                              "failure" : fail,
                              "errors" : errorDetail,
                              "duration"  : (Date.now() - now)};
            }
            cleanup();
            return callback(null, result);
        });
}

//cleanup after a suite run
function cleanup() {
    testSuiteName = "";
    testCounter = 0;
    testNamePrefix = "";
    success = 0;
    fail = 0;
    now = -1;
    lastId = -1;
    test = "";
    exact = false;
    enterpriseRoles = [];
    last = [];
    errorDetail = [];
}

function testCleanup() {
     expected = null;
     errorExpected = null;
     exact = false;
     lastTestId = null;
     lastTestError = "";
     lastTestDescription = "";
}

// run a single test with default test/success/error methods
function runTest(vco, params) {
    var testName = arguments.callee.caller.name;
    return vco.call(getTest(), params, 
        function onSuccess(result) {
            successFn(result, testName);
        },
        function onFailure(result) {
            errorFn(result, testName);
        });
}

function runTestOn(vco, params) {
    var testName = arguments.callee.caller.name;
    return vco.call(getTest(), params, 
        function onSuccess(result) {
            successFn(result, testName);
        },
        function onFailure(result) {
            errorFn(result, testName);
        });
}

////////  VALIDATION ////////////////////////////////////////
//
// is valid date from string
//
function isValidDate(actual) {
    if ( actual == null )
        return true;
    if ( typeof(actual) === 'undefined' )
        return false;
    var timestamp=Date.parse(actual);
    if ( isNaN(timestamp) ) {
        if ( actual == '0000-00-00 00:00:00')
            return true;
        return false;
    }
    return true;
}

function isInteger(n) {
    if ( n == null )
        return true;
    if ( typeof(n) === 'undefined' )
        return false;
   return ( (typeof n==='number') && (n%1===0) );
}

function isFloat(n) {
    if ( n == null )
        return true;
    if ( typeof(n) === 'undefined' )
        return false;
   return ( typeof n==='number' );
}

function isId(n) {
   if ( isInteger(n) && n > 0 )
       return true;
   return false;
}

function isString(s) {
    if ( (s == null) || (typeof(s) === 'string') )
        return true;
    return false;
}

// validate results from a run
function validate(expect,actual,exact) { 

    //
    //  allow functions to look at the actual
    //
    if ( typeof(expect) === 'function' ) {
        delete last.functionMessage;
        expect.bind(last);
        return expect(actual, exact);
    }

    if ( Array.isArray(expect) ) {
        if ( !Array.isArray(actual) ) {
            ERRORLOG("NOT AN ARRAY actual type [" + typeof(actual) + "]");
            return false;
        }
        if (expect.length != actual.length ) {
            ERRORLOG("ARRAY LENGTH MISMATCH actual [" + actual.length + 
                     "] expected [" + expect.length + "]");
            return false;
        }
        for (var i=0; i<expect.length; i++)
        {
            if ( !validate(expect[i], actual[i], exact) )
                return false;
        }
        return true;
    } 

    for ( name in expect ) {
        if ( (name === _placeholder_) && (expect[name] === _any_) )
            return true;
        if ( expect[name] === _opt_ )
            continue;
        if (actual == null && expect != null) {
            ERRORLOG("NULL ATTRIBUTE expected [" + name + "]");
            return false;
        }
        if ( !actual.hasOwnProperty(name) ) {
            ERRORLOG("MISSING ATTRIBUTE expected [" + name + "]");
            return false;
        }
        if ( expect[name] === _any_ )
            continue;

        if ( expect[name] === _id_ ) {
            if ( !isId(actual[name]) ) {
                ERRORLOG("TYPE MISMATCH at [" + name + "]: expected [" + _id_ + 
                         "] actual [" + actual[name] + "]");
                return false;
            }
            continue;
        }
        if ( expect[name] ===  _date_ ) {
            if ( !isValidDate(actual[name]) ) {
                ERRORLOG("TYPE MISMATCH at [" + name + "]: expected [" + _date_ + 
                         "] actual [" + actual[name] + "]");
                return false;
            }
            continue;
        }
        if ( expect[name] ===  _int_ ) {
            if ( !isInteger(actual[name]) ) {
                ERRORLOG("TYPE MISMATCH at [" + name + "]: expected [" + _int_ + 
                         "] actual [" + actual[name] + "]");
                return false;
            }
            continue;
        }
        if ( expect[name] ===  _float_ ) {
            if ( !isFloat(actual[name]) ) {
                ERRORLOG("TYPE MISMATCH at [" + name + "]: expected [" + _float_ + 
                         "] actual [" + actual[name] + "]");
                return false;
            }
            continue;
        }
        if ( expect[name] ===  _string_ ) {
            if ( !isString(actual[name]) ) {
                ERRORLOG("TYPE MISMATCH at [" + name + "]: expected [" + _string_ + 
                         "] actual [" + actual[name] + "]");
                return false;
            }
            continue;
        }
        if ( typeof(expect[name]) !== typeof(actual[name]) ) {
            ERRORLOG("TYPEOF MISMATCH at [" + name + "]: expected [" + 
                     typeof(expect[name]) + "] actual [" + typeof(actual[name]) + "]");
            return false;
        }

        if ( Array.isArray(expect[name]) ) {
            // deep array compare
            if (!validate(expect[name], actual[name], exact)) {
               return false;
            }
            continue;
        }
        if (typeof(expect[name]) == 'object') {
            // deep compare
            if (!validate(expect[name], actual[name], exact)) {
               return false;
            }
            continue;
        } else if ( expect[name] != actual[name] ) {
            ERRORLOG("VALUE MISMATCH: at " + name + " expected [" + expect[name] +
                     "] actual [" + actual[name] + "]");
            return false;
        }
    }
    if ( exact ) {
        if ( ((actual === null) && (expect !== null)) ) {
            ERRORLOG("UNEXPECTED NULL ACTUAL: actual [" + actual + "]");
            return false;
        }
        if ( ((actual !== null) && (expect === null)) ) {
            ERRORLOG("UNEXPECTED NON-NULL ACTUAL: actual [" + actual + "]");
            return false;
        }
        for ( name in actual ) {
            if ( !expect.hasOwnProperty(name) ) {
               ERRORLOG("UNEXPECTED ACTUAL: actual [" + name + "]");
               return false;
            }
        }
    }
    return true;
}

function validateExternal(expected, actual, exact) {
    var result = validate(expected, actual, exact);
    if ( !result ) {
         // expected results, validate failed
         var expectedResult = " ";
         if ( typeof(expected) === 'function' ) {
             if ( last.hasOwnProperty("functionMessage" ) )
                 expectedResult += last.functionMessage;
             else
                 expectedResult += "[function]";
         } else {
             expectedResult += JSON.stringify(expected, null, jsonStrSpaces);
         }
         var actualResult = "actual  : " + JSON.stringify(actual, null, jsonStrSpaces);
         errorDetail.push({"testId:" : getTestId(),
                           "test" : test,
                           "expected" : expectedResult,
                           "actual" : actualResult});
         FAILLOG(getTestId(), test, expectedResult, actualResult);
         fail++;
    }
    return result;
}

/////////////  OUTPUT ////////////////
//
function writeQaHeader() {
    var outputHeader = "test_result_id,testcase_id,test_result,script_name,errno,version_sut1,version_sut2,submitter,testbed_name,timestamp,related_testcase,runtime,archive_link,testcase_desc,error_desc,version_mst,rsrvd0,rsrvd1,rsrvd2,rsrvd3,rsrvd4,rsrvd5,rsrvd6,rsrvd7,rsrvd8,rsrvd9";

    fs.writeFile(qaFilename, outputHeader + "\n", function (err) {
          if (err) throw err;
        });
}

function writeQaOutput(result) {
    var outputString = "";
    var arr = [];
    for ( var name in result ) {
        arr.push(result[name]);
    }
    outputString = arr.join(",");

    if ( testCounter == 1) 
        writeQaHeader();

    fs.appendFile(qaFilename, outputString + "\n", function (err) {
          if (err) throw err;
        });
}


function SUCCESSLOG(id,test,testFn) {
    if ( !_useTestName ) {
        testFn = test;
    }
    if ( qaOutput ) {
        csvOutput.version_mst = vcoBuildNumber;
        csvOutput.runtime = getElapsedTime();
        csvOutput.test_result_id = testCounter;
        csvOutput.testcase_id = id;
        csvOutput.test_result = "PASS";
        csvOutput.testcase_desc = getTestDescription();
        csvOutput.error_desc = getTestError();
        csvOutput.timestamp = new Date();
        csvOutput.rsrvd0 = test;
        writeQaOutput(csvOutput);

    } else {
        if ( outputDots )
            process.stdout.write(".");
        else
            console.log("[" + id + ']        --success: ' + testFn);
            if ( verbose )
                console.log("        " + getTestDescription());
    }
}

function FAILLOG(id,test,expected,actual,testFn) {
    var errorString = expected + " : " + actual;
    // for qaOutput, replace commas in errorString with |
    // call ERRORLOG to setTestError
    if ( !testFn ) {
        testFn = test;
    } else if ( !_useTestName ) {
        testFn = test;
    }

    if ( qaOutput ) {  
        ERRORLOG(errorString.replace(/,/g," | "));
    } else {
        ERRORLOG(errorString);
    }
    if ( qaOutput ) {
        csvOutput.runtime = getElapsedTime();
        csvOutput.test_result_id = testCounter;
        csvOutput.testcase_id = id;
        csvOutput.test_result = "FAIL";
        csvOutput.testcase_desc = getTestDescription();
        csvOutput.error_desc = getTestError();
        csvOutput.timestamp = new Date();
        csvOutput.rsrvd0 = test;
        writeQaOutput(csvOutput);
    } else {
        console.log("\033[1;31m"); // red color start
        console.log("[" + id + ']        ***TEST ERROR***: ' + testFn);
        if ( verbose )
            console.log("        " + getTestDescription());
        console.log("\033[0m"); // color end
    }
}

function CONSOLELOG(str) {
    if ( !qaOutput )
        console.log(str);
}

function ERRORLOG(str) {
    if ( !qaOutput ) {
        console.log("*** " + str);
    } else {
        fs.appendFile('message.txt', str, function (err) {
                  if (err) throw err;
                });
    }
    setTestError(str);
}

//
//
//
function callGC(err, result) {
    if ( singleStep ) {
        read({ prompt: 'next (go):  '}, function(err, input) {
            if ( input == 'go' )
                singleStep = false;
            gc(err, result);
        });
    } else 
    if ( waitStep > 0 ) { 
        setTimeout(gc.bind(null, err, result), waitStep);
    } else {
        gc(err, result);
    }
}

//
//  success and error functions
//
function successFn(result, testFn) {
     setElapsedTime();
     testCounter++;
     apiTestCounter++;
     lastResult = result;
     if ( result && result.hasOwnProperty("id") )
         lastId = result.id;
     if ( expected ) {
         if ( validate(expected,result,exact) ) {
             SUCCESSLOG(getTestId(), test, testFn);
             success++;
         } else {
             // expected results, validate failed
             var expectedResult = " ";
             if ( typeof(expected) === 'function' ) {
                 if ( last.hasOwnProperty("functionMessage" ) )
                     expectedResult += last.functionMessage;
                 else
                     expectedResult += "[function]";
             } else {
                 expectedResult += JSON.stringify(expected, null, jsonStrSpaces);
             }
             var actualResult =  JSON.stringify(result, null, jsonStrSpaces);
             errorDetail.push({"testId:" : getTestId(),
                               "test" : test,
                               "expected" : expected,
                               "actual" : result});
             FAILLOG(getTestId(), test, expectedResult, actualResult,testFn);
             fail++;
         }
     } else {
         if ( errorExpected ) {
             //  we shouldn't be in successFn since error was expected 
             var expectedResult =  JSON.stringify(errorExpected, null, jsonStrSpaces);
             var actualResult =  JSON.stringify(result, null, jsonStrSpaces);
             errorDetail.push({"testId:" : getTestId(),
                               "test" : test,
                               "expected" : expected,
                               "actual" : result});
             FAILLOG(getTestId(),test,expectedResult, actualResult, testFn);
             fail++;
         } else {
             SUCCESSLOG(getTestId(),test, testFn);
             success++;
         }
     }
     testCleanup();
     callGC(null, result);
};

function errorFn(err, testFn) {
     setElapsedTime();
     testCounter++;
     apiTestCounter++;
     if ( errorExpected ) {
         if ( validate(errorExpected, err, exact) ) {
             SUCCESSLOG(getTestId(), test, testFn);
             success++;
         } else {
             // error expected and validate failed
             var expectedResult = " ";
             if ( typeof(expected) === 'function' ) {
                 if ( last.hasOwnProperty("functionMessage" ) )
                     expectedResult += last.functionMessage;
                 else
                     expectedResult += "[function]";
             } else {
                 expectedResult += JSON.stringify(expected, null, jsonStrSpaces);
             }
             var actualResult =  JSON.stringify(err, null, jsonStrSpaces);
             FAILLOG(getTestId(), test, expectedResult, actualResult, testFn);
             fail++;
             errorDetail.push({
                 "testId:" : getTestId(),
                 "test" : test,
                 "expected" : expected,
                 "actual" : err});
         }
     } else {
         if ( expected ) {
             // expected result and should have succeeded
             var expectedResult =  JSON.stringify(expected, null, jsonStrSpaces);
             var actualResult =  JSON.stringify(err, null, jsonStrSpaces);
             FAILLOG(getTestId(), test, expectedResult, actualResult, testFn);
             errorDetail.push({
                 "testId:" : getTestId(),
                 "test" : test,
                 "expected" : expected,
                 "actual" : err});
         } else {
             // no expected result or expected error");
             var actualResult = JSON.stringify(err, null, jsonStrSpaces);
             FAILLOG(getTestId(), test, expected, actualResult, testFn);
             errorDetail.push({
                 "testId:" : getTestId(),
                 "test" : test,
                 "expected" : null,
                 "actual" : err});
         }
         fail++;
     }
     testCleanup();
     callGC(null, err);
};

function makeArrayItem() {
    var item = {};
    item[_placeholder_] = _any_;
    return item;
};

function makeArray(length, data) {
    var a = [];
    if ( typeof(data) === 'undefined' ) {
        data = {};
        data[_placeholder_] = _any_;
    }
    for (var i=0; i<length; i++) {
        a.push(data);
    }
    return a;
}

function setGc(newGc) {
    gc = newGc;
}  

function setExpected(newExpected) {
    expected = newExpected;    
}  

function setEnterpriseRoles(newEnterpriseRoles) {
    enterpriseRoles = newEnterpriseRoles;
}  

function setExact(newExact) {
    exact = newExact;
}

function setTest(newTest) {
    test = newTest;
}

function getTest() {
    return test;
}

function getLastId() {
    return lastId;
}

function setLastId(newLastId) {
    lastId = newLastId;
}

function getKey() {
    return key;
}

function getCert() {
    return cert;
}

function getLastResult() {
    return lastResult;
}

function setTestNumber(num) {
    testNumber = num;
}

function getTestNumber() {
    return testNumber;
}

function setTestId(testId) {
    lastTestId = testId;
}

function getTestId() {
    if ( lastTestId == null )
        return getTestSuiteName() + "-" + getTestNamePrefix() + "." + getTestNumber() + apiTestCounter;
    else
        return getTestSuiteName() + "-" + lastTestId + "." + getTestNumber() + apiTestCounter;
}

function setTestDescription(description) {
    lastTestDescription = description;
}

function getTestDescription() {
    return lastTestDescription;
}

function setTestError(error) {
    lastTestError = error;
}

function getTestError() {
    return lastTestError;
}

function setErrorExpected(newExpected) {
    errorExpected = newExpected;
}

function showTestName() {
    _useTestName = true;
}

function shallChangeSwaggerSettings() {
  var env = __initialProperties['vco.api.validation.swagger.enable'] === 'true';
  return getSwagger() !== env;
}

function setSwaggerValidation(val, callback) {
  if (!shallChangeSwaggerSettings()) return callback(null, null);
  var _update = { value:String(val) };
  
  return async.parallel([
      function(cb) {
        getVcoPortal().call('systemProperty/updateSystemProperty', { name:'vco.api.validation.swagger.enable',      _update:_update }, cb, cb);
      },
      function(cb) {
        getVcoPortal().call('systemProperty/updateSystemProperty', { name:'vco.api.validation.swagger.failOnError', _update:_update }, cb, cb);
      }
    ],
    function(err, data) {
      return callback(err, data);
    });
}

function onTestComplete(err, result, executionCallback) {
  var originalSwaggerValue = __initialProperties['vco.api.validation.swagger.enable'];
  
  if (shallChangeSwaggerSettings())
     setSwaggerValidation(originalSwaggerValue, onTestDone);
  else
     onTestDone();

  function onTestDone() {
    reset();
    executionCallback(err, result);
  }
}

function setupSwaggerProperties(arg, callback) {
  var params = { name:['vco.api.validation.swagger.enable', 'vco.api.validation.swagger.failOnError'], normalize:true };

  setTestDescription('get vco swagger properties');
  setTest('systemProperty/getSystemProperties');
  setExpected({});
  setGc(callback);

  return getVcoPortal().call('systemProperty/getSystemProperties', params,
    function onSuccess(result) {
      __initialProperties['vco.api.validation.swagger.enable']      = result['vco.api.validation.swagger.enable'];
      __initialProperties['vco.api.validation.swagger.failOnError'] = result['vco.api.validation.swagger.failOnError'];
      setSwaggerValidation(getSwagger() + '', successFn);
    },
    errorFn
  );
}

// Swagger related
exports.setSwagger = setSwagger;
exports.getSwagger = getSwagger;
exports.setSwaggerValidation = setSwaggerValidation;
exports.setupSwaggerProperties = setupSwaggerProperties;

// VCO refs
exports.setUploadNoCert = setUploadNoCert;
exports.fetchVcoVersion = fetchVcoVersion;
exports.setVcoServer = setVcoServer;
exports.getVcoServer = getVcoServer;
exports.getVcoPortal = getVcoPortal;
exports.getVcoUpload = getVcoUpload;
exports.getLiveServer = getLiveServer;

// test execute
exports.__initialProperties = __initialProperties;
exports.execute = execute;
exports.setGc = setGc;
exports.getCert = getCert;
exports.getKey = getKey;
exports.onTestComplete = onTestComplete;

exports.getCurrentEdgeSoftwareVersion = getCurrentEdgeSoftwareVersion;

// cert methods
exports.setNoCert = setNoCert;
exports.setUploadNoCert = setUploadNoCert;
exports.setPortalNoCert = setPortalNoCert;

//test methods
exports.successFn = successFn;
exports.errorFn = errorFn;
exports.runTest = runTest;
exports.setTest = setTest;
exports.getTest = getTest;
exports.setVerbose = setVerbose;
exports.setTestSuiteName = setTestSuiteName;
exports.getTestSuiteName = getTestSuiteName;
exports.setTestNamePrefix = setTestNamePrefix;
exports.getTestNamePrefix = getTestNamePrefix;
exports.setTestDescription = setTestDescription;
exports.getTestDescription = getTestDescription;
exports.setApiTestCounter = setApiTestCounter;
exports.setTestNumber = setTestNumber;
exports.getTestNumber = getTestNumber;
exports.setTestId = setTestId;
exports.getTestId = getTestId;
exports.getLastId = getLastId;
exports.setLastId = setLastId;
exports.setExact = setExact;
exports.makeArray = makeArray;
exports.setExpected = setExpected;
exports.setEnterpriseRoles = setEnterpriseRoles;
exports.getLastResult = getLastResult;
exports.setErrorExpected = setErrorExpected;
exports.validate = validateExternal;
exports.reset = reset;
exports.noBackend = noBackend;

// test vars
exports.last = last;
exports.item = makeArrayItem;
exports.arr = makeArray;
exports.any = _any_;
exports.opt = _opt_;
exports.date = _date_;
exports.integer = _int_;
exports.float = _float_;
exports.id = _id_;
exports.str= _string_;
exports.email1= _email1_;
exports.showTestName = showTestName;
exports.getLocalIpAddress = getLocalIpAddress;
exports.setSingleStep = setSingleStep;
exports.runTestOn = runTestOn;
