var nodePath="./";
if ( typeof(process.env.NODE_PATH) !== 'undefined' )
    nodePath = process.env.NODE_PATH + "/";
var testutil = require(nodePath + '/testutil');
var login = require(nodePath + "/login");

//
//  create vco object
//
testutil.setVerbose(false);
testutil.setNoCert();
var vco_portal = testutil.getVcoPortal();
var vco_upload = testutil.getVcoUpload();

testutil.setTestSuiteName("role");
testutil.setTestNamePrefix("test");

var now = (new Date()).getTime();
var unq = process.pid + "" + now;

var operatorLoginData = {
    "username":"super@velocloud.net",
    "password":"vcadm!n",
    "userType":"operator",
    "vcoServer":testutil.getVcoServer()
};

var enterpriseLoginData = {
    "name":"Enterprise Ltd",
    "username":"admin@enterprise.com",
    "password":"Enterprise123",
    "userType":"enterprise",
    "vcoServer":testutil.getVcoServer()
};

var enterpriseProxyLoginData = {
    "name":"Partner Ltd",
    "username":"admin@partner.com",
    "password":"Partner123",
    "proxyType":"MSP",
    "vcoServer":testutil.getVcoServer()
};

function executeTests(suiteCallback) {
    testutil.execute([

        function loginAsOperatorUserAndGetNetworkConfigurations(callback) {
            // Login as operator user
            login.login(operatorLoginData, function(cookie) {
                testutil.last["operatorCookie"] = cookie;
                vco_portal.setHeaders({'Cookie': cookie});
    
                // Get network configurations
                testutil.setTestDescription("Get network configurations");
                testutil.setTest('network/getNetworkConfigurations');
                testutil.setGc(callback);
                vco_portal.call(testutil.getTest(), {},
                    testutil.successFn, testutil.errorFn);
            });
        },
    
        function insertEnterprise(arg, callback) {
            // Create an enterprise without passing delegated flags
            configuration = arg[0];
            testutil.setTestDescription("Create an enterprise without passing delegated flags");
            testutil.setTest("enterprise/insertEnterprise");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "configurationId":configuration.id,
                "name":enterpriseLoginData["name"],
                "user":{"username":enterpriseLoginData["username"],
                "password":enterpriseLoginData["password"]}},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseDelegatedToOperator(arg, callback) {
            // Check EnterpriseDelegatedToOperator flag as operator user, should be false as no flags passed while creating
            testutil.last["enterpriseId"] = testutil.getLastId();
            testutil.setTestDescription("Check EnterpriseDelegatedToOperator flag as operator user, should be false as no flags passed while creating");
            testutil.setTest("role/isEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Check EnterpriseUserManagementDelegatedToOperator flag as operator user, should be false as no flags passed while creating
            testutil.setTestDescription("Check EnterpriseUserManagementDelegatedToOperator flag as operator user, should be false as no flags passed while creating");
            testutil.setTest("role/isEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function getEnterpriseDelegatedPrivileges(arg, callback) {
            // Get EnterpriseDelegatedPrivileges as operator user, should be blank
            testutil.setTestDescription("Get EnterpriseDelegatedPrivileges as operator user, should be blank");
            testutil.setTest("role/getEnterpriseDelegatedPrivileges");
            testutil.setExact(true);
            testutil.setExpected([]);
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseDelegatedToOperator(arg, callback) {
            // Set EnterpriseDelegatedToOperator flag as operator user, error message should be returned
            testutil.setTestDescription("Set EnterpriseDelegatedToOperator flag as operator user, error message should be returned");
            testutil.setTest("role/setEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setErrorExpected({
                "code":-32603,
                 "message":"user does not have privilege [UPDATE:ENTERPRISE_DELEGATION] required to access [role/setEnterpriseDelegatedToOperator]"});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"],
                "isDelegated":true},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Set EnterpriseUserManagementDelegatedToOperator flag as operator user, error message should be returned
            testutil.setTestDescription("Set EnterpriseUserManagementDelegatedToOperator flag as operator user, error message should be returned");
            testutil.setTest("role/setEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setErrorExpected({
                "code":-32603,
                 "message":"user does not have privilege [UPDATE:ENTERPRISE_DELEGATION] required to access [role/setEnterpriseUserManagementDelegatedToOperator]"});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"],
                "isDelegated":true},
                testutil.successFn, testutil.errorFn);
        },
    
        function deleteEnterprise(arg, callback) {
            // Delete the created enterprise
            testutil.setTestDescription("Delete the created enterprise");
            testutil.setTest("enterprise/deleteEnterprise");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function insertEnterprise(arg, callback) {
            // Create an enterprise with EnterpriseDelegatedToOperator and EnterpriseUserManagementDelegatedToOperato as true
            testutil.setTestDescription("Create an enterprise with EnterpriseDelegatedToOperator and EnterpriseUserManagementDelegatedToOperato as true");
            testutil.setTest("enterprise/insertEnterprise");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "configurationId":configuration.id,
                "name":enterpriseLoginData["name"],
                "user":{"username":enterpriseLoginData["username"],
                "password":enterpriseLoginData["password"]},
                "enableEnterpriseDelegationToOperator":true,
                "enableEnterpriseUserManagementDelegationToOperator":true},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseDelegatedToOperator(arg, callback) {
            // Check EnterpriseDelegatedToOperator flag as operator user, should be true
            testutil.last["enterpriseId"] = testutil.getLastId();
            testutil.setTestDescription("Check EnterpriseDelegatedToOperator flag as operator user, should be true");
            testutil.setTest("role/isEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Check EnterpriseUserManagementDelegatedToOperator flag as operator user, should be true
            testutil.setTestDescription("Check EnterpriseUserManagementDelegatedToOperator flag as operator user, should be true");
            testutil.setTest("role/isEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function getEnterpriseDelegatedPrivileges(arg, callback) {
            // Get EnterpriseDelegatedPrivileges as operator user, should be an array of size 18
            testutil.setTestDescription("Get EnterpriseDelegatedPrivileges as operator user, should be an array of size 18");
            testutil.setTest("role/getEnterpriseDelegatedPrivileges");
            testutil.setExact(false);
            testutil.setExpected(testutil.makeArray(18));
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function logoutAsOperatorUser(arg, callback) {
            // Logout as operator user
            var logoutData = {
                "vcoServer":testutil.getVcoServer(),
                "headers":vco_portal.getHeaders()
            }
            login.logout(logoutData, function(cookie) {
                vco_portal.setHeaders({'Cookie': null});
                callback(null, null);
            });
        },
    
        function loginAsEnterpriseUserAndGetEnterprise(arg, callback) {
            // Login as enterprise user
            login.login(enterpriseLoginData, function(cookie) {
                testutil.last["enterpriseCookie"] = cookie;
                vco_portal.setHeaders({'Cookie': cookie});

                // Get enterprise configurations for the enterprise created
                testutil.setTestDescription("Get enterprise configurations for the enterprise created");
                testutil.setTest('enterprise/getEnterprise');
                testutil.setGc(callback);
                vco_portal.call(testutil.getTest(), {},
                    testutil.successFn, testutil.errorFn);
            });
        },
    
        function setEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with value false
            testutil.setTestDescription("Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with value false");
            testutil.setTest("role/setEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":false},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with value 0
            testutil.setTestDescription("Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with value false");
            testutil.setTest("role/setEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":0},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseDelegatedToOperator(arg, callback) {
            // Set EnterpriseDelegatedToOperator flag as enterprise user with value false
            testutil.setTestDescription("Set EnterpriseDelegatedToOperator flag as enterprise user with value false");
            testutil.setTest("role/setEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":false},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseDelegatedToOperator(arg, callback) {
            // Set EnterpriseDelegatedToOperator flag as enterprise user with value 0
            testutil.setTestDescription("Set EnterpriseDelegatedToOperator flag as enterprise user with value 0");
            testutil.setTest("role/setEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":0},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseDelegatedToOperator(arg, callback) {
            // Check EnterpriseDelegatedToOperator flag set to false as enterprise user
            testutil.setTestDescription("Check EnterpriseDelegatedToOperator flag set to false as enterprise user");
            testutil.setTest("role/isEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Check EnterpriseUserManagementDelegatedToOperator flag set to false as enterprise user
            testutil.setTestDescription("Check EnterpriseUserManagementDelegatedToOperator flag set to false as enterprise user");
            testutil.setTest("role/isEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseDelegatedToOperator(arg, callback) {
            // Set EnterpriseDelegatedToOperator flag as enterprise user with value true
            testutil.setTestDescription("Set EnterpriseDelegatedToOperator flag as enterprise user with value true");
            testutil.setTest("role/setEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":true},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with value true
            testutil.setTestDescription("Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with value true");
            testutil.setTest("role/setEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":true},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseDelegatedToOperator(arg, callback) {
            // Set EnterpriseDelegatedToOperator flag as enterprise user with value 1
            testutil.setTestDescription("Set EnterpriseDelegatedToOperator flag as enterprise user with value 1");
            testutil.setTest("role/setEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":1},
                testutil.successFn, testutil.errorFn);
        },

        function setEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with value 1
            testutil.setTestDescription("Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with value 1");
            testutil.setTest("role/setEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":1},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseDelegatedToOperator(arg, callback) {
            // Check EnterpriseDelegatedToOperator flag set to true as enterprise user 
            testutil.setTestDescription("Check EnterpriseDelegatedToOperator flag set to true as enterprise user");
            testutil.setTest("role/isEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Check EnterpriseUserManagementDelegatedToOperator flag set to true as enterprise user
            testutil.setTestDescription("Check EnterpriseUserManagementDelegatedToOperator flag set to false as enterprise user");
            testutil.setTest("role/isEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseDelegatedToOperator(arg, callback) {
            // Check EnterpriseDelegatedToOperator flag as enterprise user with enterprise id
            testutil.setTestDescription("Check EnterpriseDelegatedToOperator flag as enterprise user with enterprise id");
            testutil.setTest("role/isEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },

        function isEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Check EnterpriseUserManagementDelegatedToOperator flag as enterprise user with enterprise id
            testutil.setTestDescription("Check EnterpriseUserManagementDelegatedToOperator flag as enterprise user with enterprise id");
            testutil.setTest("role/isEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseDelegatedToOperator(arg, callback) {
            // Set EnterpriseDelegatedToOperator flag as enterprise user with missing attribute, error message should be returned
            testutil.setTestDescription("Set EnterpriseDelegatedToOperator flag as enterprise user with missing attribute, error message should be returned");
            testutil.setTest("role/setEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setErrorExpected({
                "code":-32603,
                 "message":"delegation flag missing to setEnterpriseDelegatedToOperator"});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with missing attribute, error message should be returned
            testutil.setTestDescription("Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with missing attribute, error message should be returned");
            testutil.setTest("role/setEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setErrorExpected({
                "code":-32603,
                 "message":"delegation flag missing to setEnterpriseUserManagementDelegatedToOperator"});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseDelegatedToOperator(arg, callback) {
            // Set EnterpriseDelegatedToOperator flag as enterprise user with attribute as null, error message should be returned
            testutil.setTestDescription("Set EnterpriseDelegatedToOperator flag as enterprise user with attribute as null, error message should be returned");
            testutil.setTest("role/setEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setErrorExpected({
                "code":-32603,
                 "message":"delegation flag missing to setEnterpriseDelegatedToOperator"});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":null},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with attribute as null, error message should be returned
            testutil.setTestDescription("Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with attribute as null, error message should be returned");
            testutil.setTest("role/setEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setErrorExpected({
                "code":-32603,
                 "message":"delegation flag missing to setEnterpriseUserManagementDelegatedToOperator"});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":null},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseDelegatedToOperator(arg, callback) {
            // Set EnterpriseDelegatedToOperator flag as enterprise user with invalid attribute, error message should be returned
            testutil.setTestDescription("Set EnterpriseDelegatedToOperator flag as enterprise user with invalid attribute, error message should be returned");
            testutil.setTest("role/setEnterpriseDelegatedToOperator");
            testutil.setExact(true);
            testutil.setErrorExpected({
                "code":-32603,
                 "message":"delegation flag missing to setEnterpriseDelegatedToOperator"});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "junk":true},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseUserManagementDelegatedToOperator(arg, callback) {
            // Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with invalid attribute, error message should be returned
            testutil.setTestDescription("Set EnterpriseUserManagementDelegatedToOperator flag as enterprise user with invalid attribute, error message should be returned");
            testutil.setTest("role/setEnterpriseUserManagementDelegatedToOperator");
            testutil.setExact(true);
            testutil.setErrorExpected({
                "code":-32603,
                 "message":"delegation flag missing to setEnterpriseUserManagementDelegatedToOperator"});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "junk":true},
                testutil.successFn, testutil.errorFn);
        },
    
        function logoutAsEnterpriseUser(arg, callback) {
            // Logout as enterprise user
            var logoutData = {
                "vcoServer":testutil.getVcoServer(),
                "headers":vco_portal.getHeaders()
            }
            login.logout(logoutData, function(cookie) {
                vco_portal.setHeaders({'Cookie': null});
                callback(null, null);
            });
        },
    
        function loginAsOperatorUserAndDeleteEnterprise(arg, callback) {
            // Login as operator user
            login.login(operatorLoginData, function(cookie) {
                testutil.last["operatorCookie"] = cookie;
                vco_portal.setHeaders({'Cookie': cookie});
    
                // Delete the created enterprise
                testutil.setTestDescription("Delete the created enterprise");
                testutil.setTest("enterprise/deleteEnterprise");
                testutil.setExact(true);
                testutil.setExpected({"rows":1});
                testutil.setGc(callback);
                vco_portal.call(testutil.getTest(), {
                    "enterpriseId":testutil.last["enterpriseId"]},
                    testutil.successFn, testutil.errorFn);
            });
        },
    
        function insertProxy(arg, callback) {
            // Create an enterprise proxy without passing delegated flag
            testutil.setTestDescription("Create an enterprise proxy without passing delegated flag");
            testutil.setTest("network/insertNetworkEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "proxyType":enterpriseProxyLoginData["proxyType"],
                "networkId":1,
                "gatewayPoolIds":[1],
                "configurationId":configuration.id,
                "name":enterpriseProxyLoginData["name"],
                "user":{"username":enterpriseProxyLoginData["username"],
                "password":enterpriseProxyLoginData["password"]}},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseProxyDelegatedToOperator(arg, callback) {
            // Check EnterpriseProxyDelegatedToOperator flag as operator user, should be false as no flag passed while creating
            testutil.last["proxyId"] = testutil.getLastId();
            testutil.setTestDescription("Check EnterpriseProxyDelegatedToOperator flag as operator user, should be false as no flag passed while creating");
            testutil.setTest("role/isEnterpriseProxyDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseProxyId":testutil.last["proxyId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function getEnterpriseProxyDelegatedPrivileges(arg, callback) {
            // Get EnterpriseProxyDelegatedPrivileges as operator user, should be blank
            testutil.setTestDescription("Get EnterpriseProxyDelegatedPrivileges as operator user, should be blank");
            testutil.setTest("role/getEnterpriseProxyDelegatedPrivileges");
            testutil.setExact(true);
            testutil.setExpected([]);
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseProxyId":testutil.last["proxyId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseProxyDelegatedToOperator(arg, callback) {
            // Set EnterpriseProxyDelegatedToOperator flag as operator user, error message should be returned
            testutil.setTestDescription("Set EnterpriseProxyDelegatedToOperator flag as operator user, error message should be returned");
            testutil.setTest("role/setEnterpriseProxyDelegatedToOperator");
            testutil.setExact(true);
            testutil.setErrorExpected({
                "code":-32603,
                 "message":"user does not have privilege [UPDATE:ENTERPRISE_PROXY_DELEGATION] required to access [role/setEnterpriseProxyDelegatedToOperator]"});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseProxyId":testutil.last["proxyId"],
                "isDelegated":true},
                testutil.successFn, testutil.errorFn);
        },
    
        function deleteProxy(arg, callback) {
            // Delete the created enterprise proxy
            testutil.setTestDescription("Delete the created enterprise proxy");
            testutil.setTest("network/deleteNetworkEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "id":testutil.last["proxyId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function insertProxy(arg, callback) {
            // Create an enterprise proxy with EnterpriseProxyDelegatedToOperator as true
            testutil.setTestDescription("Create an enterprise proxy with EnterpriseProxyDelegatedToOperator as true");
            testutil.setTest("network/insertNetworkEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "proxyType":enterpriseProxyLoginData["proxyType"],
                "networkId":1,
                "gatewayPoolIds":[1],
                "configurationId":configuration.id,
                "name":enterpriseProxyLoginData["name"],
                "user":{"username":enterpriseProxyLoginData["username"],
                "password":enterpriseProxyLoginData["password"]},
                "enableProxyDelegationToOperator":true},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseProxyDelegatedToOperator(arg, callback) {
            // Check EnterpriseProxyDelegatedToOperator flag as operator user, should be true
            testutil.last["proxyId"] = testutil.getLastId();
            testutil.setTestDescription("Check EnterpriseProxyDelegatedToOperator flag as operator user, should be true");
            testutil.setTest("role/isEnterpriseProxyDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseProxyId":testutil.last["proxyId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function getEnterpriseProxyDelegatedPrivileges(arg, callback) {
            // Get EnterpriseProxyDelegatedPrivileges as operator user, should be an array of size 2
            testutil.setTestDescription("Get EnterpriseProxyDelegatedPrivileges as operator user, should be an array of size 2");
            testutil.setTest("role/getEnterpriseProxyDelegatedPrivileges");
            testutil.setExact(true);
            testutil.setExpected(testutil.makeArray(2));
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseProxyId":testutil.last["proxyId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function logoutAsOperatorUser(arg, callback) {
            // Logout as operator user
            var logoutData = {
                "vcoServer":testutil.getVcoServer(),
                "headers":vco_portal.getHeaders()
            }
            login.logout(logoutData, function(cookie) {
                vco_portal.setHeaders({'Cookie': null});
                callback(null, null);
            });
        },
    
        function loginAsProxyUserAndGetEnterpriseProxy(arg, callback) {
            // Login as enterprise proxy user
            login.login(enterpriseProxyLoginData, function(cookie) {
                testutil.last["enterpriseProxyCookie"] = cookie;
                vco_portal.setHeaders({'Cookie': cookie});

                // Get enterprise proxy configurations for the enterprise proxy created
                testutil.setTestDescription("Get enterprise proxy configurations for the enterprise proxy created");
                testutil.setTest('enterpriseProxy/getEnterpriseProxy');
                testutil.setGc(callback);
                vco_portal.call(testutil.getTest(), {},
                    testutil.successFn, testutil.errorFn);
            });
        },
    
        function setEnterpriseProxyDelegatedToOperator(arg, callback) {
            // Set EnterpriseProxyDelegatedToOperator flag as proxy user with value false
            testutil.setTestDescription("Set EnterpriseProxyDelegatedToOperator flag as proxy user with value false");
            testutil.setTest("role/setEnterpriseProxyDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":false},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseProxyDelegatedToOperator(arg, callback) {
            // Set EnterpriseProxyDelegatedToOperator flag as proxy user with value 0
            testutil.setTestDescription("Set EnterpriseProxyDelegatedToOperator flag as proxy user with value 0");
            testutil.setTest("role/setEnterpriseProxyDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":0},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseProxyDelegatedToOperator(arg, callback) {
            // Check EnterpriseProxyDelegatedToOperator flag set to false as proxy user
            testutil.setTestDescription("Check EnterpriseProxyDelegatedToOperator flag set to false as proxy user");
            testutil.setTest("role/isEnterpriseProxyDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseProxyDelegatedToOperator(arg, callback) {
            // Set EnterpriseProxyDelegatedToOperator flag as proxy user with value true
            testutil.setTestDescription("Set EnterpriseProxyDelegatedToOperator flag as proxy user with value true");
            testutil.setTest("role/setEnterpriseProxyDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":true},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseProxyDelegatedToOperator(arg, callback) {
            // Set EnterpriseProxyDelegatedToOperator flag as proxy user with value 1
            testutil.setTestDescription("Set EnterpriseProxyDelegatedToOperator flag as proxy user with value 1");
            testutil.setTest("role/setEnterpriseProxyDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "isDelegated":1},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseProxyDelegatedToOperator(arg, callback) {
            // Check EnterpriseProxyDelegatedToOperator flag set to true as proxy user
            testutil.setTestDescription("Check EnterpriseProxyDelegatedToOperator flag set to true as proxy user");
            testutil.setTest("role/isEnterpriseProxyDelegatedToOperator");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {},
                testutil.successFn, testutil.errorFn);
        },

        function insertProxyEnterprise(arg, callback) {
            // Create a proxy ennterprise without passing delegated flag
            testutil.setTestDescription("Create a proxy ennterprise without passing delegated flag");
            testutil.setTest("enterpriseProxy/insertEnterpriseProxyEnterprise");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "configurationId":configuration.id,
                "name":enterpriseLoginData["name"],
                "user":{"username":enterpriseLoginData["username"],
                "password":enterpriseLoginData["password"]}},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseDelegatedToEnterpriseProxy(arg, callback) {
            // Check EnterpriseDelegatedToEnterpriseProxy flag as proxy user, should be false as no flag passed while creating
            testutil.last["enterpriseId"] = testutil.getLastId();
            testutil.setTestDescription("Check EnterpriseDelegatedToEnterpriseProxy flag as proxy user, should be false as no flag passed while creating");
            testutil.setTest("role/isEnterpriseDelegatedToEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function deleteProxyEnterprise(arg, callback) {
            // Delete the created proxy enterprise
            testutil.setTestDescription("Delete the created proxy enterprise");
            testutil.setTest("enterprise/deleteEnterprise");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },

        function insertProxyEnterprise(arg, callback) {
            // Create a proxy ennterprise with EnterpriseDelegatedToEnterpriseProxy as true
            testutil.setTestDescription("Create a proxy ennterprise without passing delegated flag");
            testutil.setTest("enterpriseProxy/insertEnterpriseProxyEnterprise");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "configurationId":configuration.id,
                "name":enterpriseLoginData["name"],
                "user":{"username":enterpriseLoginData["username"],
                "password":enterpriseLoginData["password"]},
                "enableEnterpriseDelegationToProxy":true},
                testutil.successFn, testutil.errorFn);
        },
 
        function isEnterpriseDelegatedToEnterpriseProxy(arg, callback) {
            // Check EnterpriseDelegatedToEnterpriseProxy flag as proxy user, should be true
            testutil.last["enterpriseId"] = testutil.getLastId();
            testutil.setTestDescription("Check EnterpriseDelegatedToEnterpriseProxy flag as proxy user, should be true");
            testutil.setTest("role/isEnterpriseDelegatedToEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseId":testutil.last["enterpriseId"]},
                testutil.successFn, testutil.errorFn);
        },
    
        function logoutAsProxyUser(arg, callback) {
            // Logout as proxy user
            var logoutData = {
                "vcoServer":testutil.getVcoServer(),
                "headers":vco_portal.getHeaders()
            }
            login.logout(logoutData, function(cookie) {
                vco_portal.setHeaders({'Cookie': null});
                callback(null, null);
            });
        },
    
        function loginAsProxyEnterpriseUserAndGetEnterprise(arg, callback) {
            // Login as proxy enterprise user
            login.login(enterpriseLoginData, function(cookie) {
                testutil.last["enterpriseCookie"] = cookie;
                vco_portal.setHeaders({'Cookie': cookie});

                // Get enterprise configurations for the enterprise created
                testutil.setTestDescription("Get enterprise configurations for the enterprise created");
                testutil.setTest('enterprise/getEnterprise');
                testutil.setGc(callback);
                vco_portal.call(testutil.getTest(), {},
                    testutil.successFn, testutil.errorFn);
            });
        },
    
        function setEnterpriseDelegatedToEnterpriseProxy(arg, callback) {
            // Set EnterpriseDelegatedToEnterpriseProxy flag as enterprise proxy user with value false
            testutil.setTestDescription("Set EnterpriseDelegatedToEnterpriseProxy flag as enterprise proxy user with value false");
            testutil.setTest("role/setEnterpriseDelegatedToEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseProxyId":testutil.last["proxyId"],
                "isDelegated":false},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseDelegatedToEnterpriseProxy(arg, callback) {
            // Set EnterpriseDelegatedToEnterpriseProxy flag as enterprise proxy user with value 0
            testutil.setTestDescription("Set EnterpriseDelegatedToEnterpriseProxy flag as enterprise proxy user with value false");
            testutil.setTest("role/setEnterpriseDelegatedToEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseProxyId":testutil.last["proxyId"],
                "isDelegated":0},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseDelegatedToEnterpriseProxy(arg, callback) {
            // Check EnterpriseDelegatedToEnterpriseProxy flag set to false as proxy enterprise user
            testutil.last["enterpriseId"] = testutil.getLastId();
            testutil.setTestDescription("Check EnterpriseDelegatedToEnterpriseProxy flag set to false as proxy enterprise user");
            testutil.setTest("role/isEnterpriseDelegatedToEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":false});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseDelegatedToEnterpriseProxy(arg, callback) {
            // Set EnterpriseDelegatedToEnterpriseProxy flag as enterprise proxy user with value true
            testutil.setTestDescription("Set EnterpriseDelegatedToEnterpriseProxy flag as enterprise proxy user with value true");
            testutil.setTest("role/setEnterpriseDelegatedToEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseProxyId":testutil.last["proxyId"],
                "isDelegated":true},
                testutil.successFn, testutil.errorFn);
        },
    
        function setEnterpriseDelegatedToEnterpriseProxy(arg, callback) {
            // Set EnterpriseDelegatedToEnterpriseProxy flag as enterprise proxy user with value 1
            testutil.setTestDescription("Set EnterpriseDelegatedToEnterpriseProxy flag as enterprise proxy user with value 1");
            testutil.setTest("role/setEnterpriseDelegatedToEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {
                "enterpriseProxyId":testutil.last["proxyId"],
                "isDelegated":1},
                testutil.successFn, testutil.errorFn);
        },
    
        function isEnterpriseDelegatedToEnterpriseProxy(arg, callback) {
            // Check EnterpriseDelegatedToEnterpriseProxy flag set to true as proxy enterprise user
            testutil.last["enterpriseId"] = testutil.getLastId();
            testutil.setTestDescription("Check EnterpriseDelegatedToEnterpriseProxy flag set to true as proxy enterprise user");
            testutil.setTest("role/isEnterpriseDelegatedToEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"isDelegated":true});
            testutil.setGc(callback);
            vco_portal.call(testutil.getTest(), {},
                testutil.successFn, testutil.errorFn);
        },
    
        function logoutAsProxyEnterpriseUser(arg, callback) {
            // Logout as proxy enterprise user
            var logoutData = {
                "vcoServer":testutil.getVcoServer(),
                "headers":vco_portal.getHeaders()
            }
            login.logout(logoutData, function(cookie) {
                vco_portal.setHeaders({'Cookie': null});
                callback(null, null);
            });
        },
    
        function loginAsProxyUserAndDeleteProxyEnterprise(arg, callback) {
            // Login as proxy user
            login.login(enterpriseProxyLoginData, function(cookie) {
                testutil.last["enterpriseProxyCookie"] = cookie;
                vco_portal.setHeaders({'Cookie': cookie});

                // Delete the created proxy enterprise
                testutil.setTestDescription("Delete the created proxy enterprise");
                testutil.setTest("enterprise/deleteEnterprise");
                testutil.setExact(true);
                testutil.setExpected({"rows":1});
                testutil.setGc(callback);
                vco_portal.call(testutil.getTest(), {
                    "enterpriseId":testutil.last["enterpriseId"]},
                    testutil.successFn, testutil.errorFn);
            });
        },
    
        function logoutAsProxyUser(arg, callback) {
            // Logout as proxy user
            var logoutData = {
                "vcoServer":testutil.getVcoServer(),
                "headers":vco_portal.getHeaders()
            }
            login.logout(logoutData, function(cookie) {
                vco_portal.setHeaders({'Cookie': null});
                callback(null, null);
            });
        },
    
        function loginAsOperatorUserAndDeleteProxy(arg, callback) {
            // Login as operator user
            login.login(operatorLoginData, function(cookie) {
                testutil.last["operatorCookie"] = cookie;
                vco_portal.setHeaders({'Cookie': cookie});
    
                // Delete the created proxy
                testutil.setTestDescription("Delete the created enterprise proxy");
                testutil.setTest("network/deleteNetworkEnterpriseProxy");
                testutil.setExact(true);
                testutil.setExpected({"rows":1});
                testutil.setGc(callback);
                vco_portal.call(testutil.getTest(), {
                    "id":testutil.last["proxyId"]},
                    testutil.successFn, testutil.errorFn);
            });
        },

        function logoutAsOperatorUser(arg, callback) {
            // Logout as operator user
            var logoutData = {
                "vcoServer":testutil.getVcoServer(),
                "headers":vco_portal.getHeaders()
            }
            login.logout(logoutData, function(cookie) {
                vco_portal.setHeaders({'Cookie': null});
                callback(null, null);
            });
        }
    ], 
    function(err, result) {
        testutil.reset();
        suiteCallback(err, result);
    });
}

//executeTests(function(err, result){if (result) console.log(result)});
exports.executeTests=executeTests;
