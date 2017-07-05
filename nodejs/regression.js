var testutil = require('./testutil');
var login = require('./login.js');

testutil.setNoCert();
var vco = testutil.getVcoPortal();
testutil.setVerbose(false);
testutil.setTestSuiteName("regression");
testutil.setTestNamePrefix("regression");

var ipAddress = "54.20.3.2";

//
//  regression tests
//
function executeTests(executionCallback) {
    var now = Date.now();
    var unq = process.pid + "" + now;
    var counter = 1;
    testutil.execute([
        function insertOperator(callback) {
            //
            // login as the standard operator super to begin with
            //
            var loginData = {
                "username":"super@velocloud.net",
                "password":"vcadm!n",
                "userType":"operator",
                "vcoServer":testutil.getVcoServer()
            };
            login.login(loginData, function(cookie) {
                vco.setHeaders({'Cookie': cookie});
                testutil.last["operatorCookie"] = cookie;
                testutil.setTestDescription("create an operator for test context");
                testutil.setTest("operator/insertOperator");
                testutil.setExact(true);
                testutil.setExpected({"id":testutil.id,"rows":1});
                testutil.setGc(callback);
                vco.call(testutil.getTest(),
                  {"name":"operator"+unq},
                  testutil.successFn, testutil.errorFn);
            });
        },
        testutil.setupSwaggerProperties,
        function getOperator(arg, callback) {
            testutil.setTestDescription("check that operator was created");
            testutil.last["operatorId"] = testutil.getLastId();
            testutil.setTest("operator/getOperator");
            testutil.setExpected({"id":testutil.getLastId(),"name":"operator"+unq,"description":null});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": testutil.getLastId()}, testutil.successFn, testutil.errorFn);
        },
        function getOperatorError(arg, callback) {
            testutil.setTest("operator/getOperator");
            testutil.setErrorExpected(null);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"foo":"bar"}, testutil.successFn, testutil.errorFn);
        },
        function getOperatorIdError(arg, callback) {
            testutil.setTest("operator/getOperator");
            testutil.setExact(true);
            testutil.setExpected(null);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id":34343343}, testutil.successFn, testutil.errorFn);
        },
        function methodError(arg, callback) {
                testutil.setTest("method/error");
                testutil.setErrorExpected({"code":-32603,"message":"methodError"});
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {"id": 1}, testutil.successFn, testutil.errorFn);
        },
        function getDatabaseSizes(arg, callback) {
                testutil.setTest("system/getDatabaseSizes");
                testutil.setExact(true);
                testutil.setExpected(testutil.makeArray(6));
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {}, testutil.successFn, testutil.errorFn);
        },
        function getDatabaseTableStatistics(arg, callback) {
                testutil.setTest("system/getDatabaseTableStatistics");
                testutil.setExact(true);
                testutil.setExpected(testutil.makeArray(85));
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {}, testutil.successFn, testutil.errorFn);
        },
        function getReplicationStatus(arg, callback) {
                testutil.setTest("disasterRecovery/getReplicationStatus");
                testutil.setExact(false);
                testutil.setExpected(
                        {"drState":"UNCONFIGURED","failureDescription":null,"role":"STANDALONE",
                         "roleTimestamp":testutil.any,"lastDRProtectedTime":testutil.any,"stateTimestamp":testutil.any,
                         "activeAddress":null,"standbyList":null,"drVCOUser":null,"vcoUuid":testutil.any,"vcoIp":testutil.any
                        });
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {}, testutil.successFn, testutil.errorFn);
        },
        function getAnnounceUpgradeVCO(arg, callback) {
                testutil.setTest("softwareUpdate/getAnnounceUpgradeVCO");
                testutil.setExact(true);
                testutil.setExpected({"rows":0});
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {}, testutil.successFn, testutil.errorFn);
        },
        function announceUpgradeVCO(arg, callback) {
                testutil.setTest("softwareUpdate/announceUpgradeVCO");
                testutil.setExact(true);
                testutil.setExpected(null);
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {"message":"Upcoming VCO upgrade: 2017-02-25 19:00-21:00 UTC"}, testutil.successFn, testutil.errorFn);
        },
        function getAnnounceUpgradeVCO(arg, callback) {
                testutil.setTest("softwareUpdate/getAnnounceUpgradeVCO");
                testutil.setExact(false);
                testutil.setExpected({"rows":1});
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {}, testutil.successFn, testutil.errorFn);
        },
        function unannounceUpgradeVCO(arg, callback) {
                testutil.setTest("softwareUpdate/unannounceUpgradeVCO");
                testutil.setExact(true);
                testutil.setExpected(null);
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {}, testutil.successFn, testutil.errorFn);
        },
        function insertBannerMessage(arg, callback) {
                testutil.setTest("bannerMessage/insertBannerMessage");
                testutil.setExact(true);
                testutil.setExpected(null);
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {"message":"Test banner message","returnData":true},
                         testutil.successFn, testutil.errorFn);
        },
        function getBannerMessages(arg, callback) {
                testutil.last["bannerId"] = arg.id;
                testutil.last["bannerLogicalId"] = arg.logicalId;
                testutil.setTest("bannerMessage/getBannerMessages");
                testutil.setExact(true);
                testutil.setExpected(testutil.makeArray(1));
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {"networkId":1}, testutil.successFn, testutil.errorFn);
        },
        function enableBannerMessage(arg, callback) {
                testutil.setTest("bannerMessage/enableBannerMessage");
                testutil.setExact(true);
                testutil.setExpected(null);
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {"logicalId":testutil.last["bannerLogicalId"],
                         "_update":{"enabled":false}}, testutil.successFn, testutil.errorFn);
        },
        function getBannerMessages(arg, callback) {
                testutil.setTest("bannerMessage/getBannerMessages");
                testutil.setExact(true);
                testutil.setExpected(testutil.makeArray(0));
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {"networkId":1}, testutil.successFn, testutil.errorFn);
        },
        function deleteBannerMessage(arg, callback) {
                testutil.setTest("bannerMessage/deleteBannerMessage");
                testutil.setExact(true);
                testutil.setExpected(null);
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {"id":testutil.last["bannerId"]},
                         testutil.successFn, testutil.errorFn);
        },
        function fileSubscribe(arg, callback) {
                testutil.setTest("fileProcessingQueue/subscribeFile");
                testutil.setExact(true);
                testutil.setExpected({"id":testutil.id,"rows":1});
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {'name':'firewallArchiver', 'type':'FIREWALLLOGS'}, testutil.successFn, testutil.errorFn);
        },
        function getAvailableSubscribedFiles(arg, callback) {
                testutil.last["subscriberId"] = arg.id;
                testutil.setTest("fileProcessingQueue/getAvailableSubscribedFiles");
                testutil.setExact(true);
                testutil.setExpected([]);
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {'id':arg.id,'expireSecs':900}, testutil.successFn, testutil.errorFn);
        },
        function fileUnsubscribe(arg, callback) {
                testutil.setTest("fileProcessingQueue/unsubscribeFile");
                testutil.setExact(true);
                testutil.setExpected({"rows":1});
                testutil.setGc(callback);
                vco.call(testutil.getTest(), {"id":testutil.last["subscriberId"]}, testutil.successFn, testutil.errorFn);
        },
        function updateOperator(arg, callback) {
            testutil.setTest("operator/updateOperator");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": testutil.last["operatorId"],"_update":{"name":"operator1"+unq}}, testutil.successFn, testutil.errorFn);
        },
        function insertOperatorConfigurationAssociation(arg, callback) {
            testutil.setTest("operator/insertOperatorConfigurationAssociation");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"operatorId":testutil.last["operatorId"],"configurationId":1,"isDefault":true}, testutil.successFn, testutil.errorFn);
        },
        function getOperatorObjects(arg, callback) {
            testutil.setTest("enterpriseObject/getOperatorObjects");
            testutil.setExact(true);
            testutil.setExpected(testutil.makeArray(5));
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {}, testutil.successFn, testutil.errorFn);
        },
        function insertNetwork(arg, callback) {
            testutil.setTest("network/insertNetwork");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,
                                  "operatorId":testutil.last["operatorId"],
                                  "name":"network"+unq,
                                  "domain":null,
                                  "description":null});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"name":"network"+unq,
                                          "operatorId":testutil.last["operatorId"],
                                          "configurationId":1, "returnData": true},
                                          testutil.successFn, testutil.errorFn);
        },
        function updateEntityBatch(arg, callback) {
            testutil.last["networkId"] = testutil.getLastId();
            testutil.setExact(true);
            testutil.setTest("common/updateEntityBatch");
            testutil.setExpected({"rows":testutil.integer});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"entity":"network","data":[{"id":testutil.last["networkId"],"description":"fooo baar"}]},
                testutil.successFn,testutil.errorFn);
        },
        function getNetwork(arg, callback) {
            testutil.setTest("network/getNetwork");
            testutil.setExpected({"id":testutil.getLastId(),"name":"network"+unq,"description":"fooo baar","operatorId":testutil.last["operatorId"]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": testutil.last["networkId"]}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkDelegatedPrivileges(arg, callback) {
            testutil.setTest("role/getNetworkDelegatedPrivileges");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected(testutil.makeArray(39));
            vco.call(testutil.getTest(), {"networkId": testutil.last["networkId"],
                                          "userType":"OPERATOR",
                                          "fromUserType":"ENTERPRISE"},
                                          testutil.successFn, testutil.errorFn);
        },
        function getNetworkDelegatedPrivileges(arg, callback) {
            testutil.setTest("role/getNetworkDelegatedPrivileges");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected(testutil.makeArray(42));
            vco.call(testutil.getTest(), {"networkId": testutil.last["networkId"], "userType":"MSP"},
                                           testutil.successFn, testutil.errorFn);
        },
        function getNetworkObjects(arg, callback) {
            testutil.setTest("enterpriseObject/getNetworkObjects");
            testutil.setExact(true);
            testutil.setExpected(testutil.makeArray(5));
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId": testutil.last["networkId"]}, testutil.successFn, testutil.errorFn);
        },
        function updateNetwork(arg, callback) {
            testutil.setTest("network/updateNetwork");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": testutil.last["networkId"],"_update":{"name":"network1"+unq}}, testutil.successFn, testutil.errorFn);
        },
        function getOperatorNetworks(arg, callback) {
            testutil.setTest("operator/getOperatorNetworks");
            testutil.expected =[{"id":testutil.id,"operatorId":testutil.last["operatorId"],"name":"network1"+unq,"description":null}];
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"operatorId":testutil.last["operatorId"]}, testutil.successFn, testutil.errorFn);
        },
        function insertOperatorUser(arg, callback) {
            testutil.setTest("operatorUser/insertOperatorUser");
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"roleId":2,
               "networkId":testutil.last["networkId"],
               "firstName":"fred",
               "lastName":"mertz",
               "username":"user"+unq,
               "password":"secret"+unq,
               "email": "user"+unq+"@velocloud.net"},
               testutil.successFn, testutil.errorFn);
        },
        function doLogout(arg, callback) {
            //
            //  logout as original operator user
            //
            testutil.last["operatorUser"] = testutil.getLastId();
            var logoutData = {
                "vcoServer":testutil.getVcoServer(),
                "headers":vco.getHeaders()
            };
            login.logout(logoutData, function() {
              callback(null, null);
            });
        },
        function getOperatorUser(arg, callback) {
            //
            //  now login to the new network as the operator user created above
            //
            var loginData = {
                "username":"user"+unq,
                "password":"secret"+unq,
                "userType":"operator",
                "vcoServer":testutil.getVcoServer()
            };
            login.login(loginData, function(cookie) {
              vco.setHeaders({'Cookie': cookie});
              testutil.last["networkCookie"] = cookie;
              testutil.setTest("operatorUser/getOperatorUser");
              testutil.setExact(true);
              testutil.setExpected(
                {"id":testutil.id,
                 "created":testutil.date,
                 "operatorId":testutil.last["operatorId"],
                 "userType":"OPERATOR",
                 "username":"user"+unq,
                 "domain":null,
                 "password":"*****",
                 "firstName":"fred",
                 "lastName":"mertz",
                 "officePhone":null,
                 "mobilePhone":null,
                 "email":"user"+unq+"@velocloud.net",
                 "lastLogin":testutil.date,
                 "isNative":1,
                 "isActive":1,
                 "isLocked":0,
                 "disableSecondFactor":0,
                 "modified":testutil.date,
                 "roleId":testutil.id,
                 "roleName":testutil.str}
                );
              testutil.setGc(callback);
              vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"],
                                            "username":"user"+unq},
                                            testutil.successFn,
                                            testutil.errorFn);
             });
        },
        function getNetworkOperatorUsers(arg, callback) {
            testutil.setTest("network/getNetworkOperatorUsers");
            testutil.setGc(callback);
            testutil.setExpected([
              {"id":testutil.id,
               "created":testutil.date,
               "operatorId":testutil.last["operatorId"],
               "userType":"OPERATOR",
               "username":"user"+unq,
               "domain":null,
               "password":"*****",
               "firstName":"fred",
               "lastName":"mertz",
               "officePhone":null,
               "mobilePhone":null,
               "email":"user"+unq+"@velocloud.net",
               "lastLogin":testutil.date,
               "isNative":1,
               "isActive":1,
               "isLocked":0,
               "disableSecondFactor":0,
               "modified":testutil.date,
               "roleId":testutil.id,
               "roleName":testutil.str}
              ]);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"]}, testutil.successFn, testutil.errorFn);
        },
        function updateOperatorUserValidationFail(arg, callback) {
            var error = testutil.getSwagger() ?
              { code:-32603, message:'instance requires property "_update"' }  :
              { code:-32603, message:'[{"error":"UPDATE_OPERATOR_USER_0001","detail":"_update attribute missing to operatorUser/updateOperatorUser"}]'};
            testutil.setTest("operatorUser/updateOperatorUser");
            testutil.setExact(true);
            testutil.setErrorExpected(error);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"update":{"firstName":"george","password":"secret2","lastName":"foobar"},
                 "networkId":testutil.last["networkId"],"id":testutil.last["operatorUser"]}, testutil.successFn, testutil.errorFn);
        },
        function updateOperatorUser(arg, callback) {
            testutil.setTest("operatorUser/updateOperatorUser");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"_update":{"firstName":"george","password":"secret2","lastName":"foobar"},
                 "networkId":testutil.last["networkId"],"id":testutil.last["operatorUser"]}, testutil.successFn, testutil.errorFn);
        },
        function getOperatorUser(arg, callback) {
            testutil.setTest("operatorUser/getOperatorUser");
            testutil.setExact(true);
            testutil.setExpected({
                "id":testutil.last["operatorUser"],
                "created":testutil.date,
                "operatorId":testutil.id,
                "userType":"OPERATOR",
                "username":"user"+unq,
                "domain":null,
                "password":"*****",
                "firstName":"george",
                "lastName":"foobar",
                "officePhone":null,
                "mobilePhone":null,
                "email":"user"+unq+"@velocloud.net",
                "lastLogin":testutil.date,
                "isNative":1,
                "isActive":1,
                "isLocked":0,
                "disableSecondFactor":0,
                "modified":testutil.date,
                "roleId":2,
                "roleName":"Operator Superuser"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId": testutil.last["networkId"],
                                           "username":"user"+unq}, testutil.successFn, testutil.errorFn);
        },
        function updateOperatorUser(arg, callback) {
            testutil.setTest("operatorUser/updateOperatorUser");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"_update":{"roleId":1},"networkId":testutil.last["networkId"],"id":testutil.last["operatorUser"]},
                testutil.successFn, testutil.errorFn);
        },
        function getOperatorUser(arg, callback) {
            testutil.setTest("operatorUser/getOperatorUser");
            testutil.setExact(true);
            testutil.setExpected({
                "id":testutil.last["operatorUser"],
                "created":testutil.date,
                "operatorId":testutil.id,
                "userType":"OPERATOR",
                "username":"user"+unq,
                "domain":null,
                "password":"*****",
                "firstName":"george",
                "lastName":"foobar",
                "officePhone":null,
                "mobilePhone":null,
                "email":"user"+unq+"@velocloud.net",
                "lastLogin":testutil.date,
                "isNative":1,
                "isActive":1,
                "isLocked":0,
                "disableSecondFactor":0,
                "modified":testutil.date,
                "roleId":1,
                "roleName":"Operator Standard Admin"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId": testutil.last["networkId"],
                                           "username":"user"+unq}, testutil.successFn, testutil.errorFn);
        },
        function getOperatorUserPasswordResetEmail(arg, callback) {
            testutil.setTest('operatorUser/getOperatorUserPasswordResetEmail');
            testutil.setExact(true);
            testutil.setExpected(
                {"from":testutil.str,
                 "replyTo":testutil.str,
                 "subject":"Password Reset",
                 "resetPasswordURL":testutil.str,
                 "to": "user"+unq+"@velocloud.net",
                 "isActive": testutil.integer,
                 "message": testutil.str});
            testutil.setGc(callback);
            testutil.runTest(vco, {"operatorUserId":testutil.last["operatorUser"]});
        },
        function insertOperatorUser(arg, callback) {
            testutil.setTest("operatorUser/insertOperatorUser");
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"roleId":2,
               "networkId":testutil.last["networkId"],
               "firstName":"fred",
               "lastName":"mertz",
               "username":"operatorUser"+unq,
               "password":"secret"+unq,
               "email": "operatorUser"+unq+"@velocloud.net"},
               testutil.successFn, testutil.errorFn);
        },
        function deleteOperatorUser(arg, callback) {
            testutil.setTest("operatorUser/deleteOperatorUser");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId": testutil.last["networkId"],"firstName":"fred","id":testutil.getLastId()}, testutil.successFn, testutil.errorFn);
        },
        function gatewayProvision(arg, callback) {
            testutil.setTest("gateway/gatewayProvision");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"activationKey":testutil.str,"logicalId":testutil.str});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"ipAddress":ipAddress,"name":"gw"+unq,"dnsName":"dns"+unq,"networkId":testutil.last["networkId"]}, testutil.successFn, testutil.errorFn);
        },
        function getGateway1(arg, callback) {
            testutil.last["gatewayId"] = testutil.getLastId();
            testutil.setTest("gateway/getGateway");
            testutil.setExpected({"id":testutil.last["gatewayId"],"ipAddress":ipAddress,"dnsName":"dns"+unq,"name":"gw"+unq,"networkId":testutil.last["networkId"],"description":null});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId": testutil.last["networkId"],
                                          "id":testutil.last["gatewayId"]},
                                           testutil.successFn, testutil.errorFn);
        },
        function getGateway2(arg, callback) {
            var params = { "networkId":testutil.last["networkId"], "ipAddress":ipAddress };
            testutil.setTest("gateway/getGateway");
            testutil.setGc(callback);
            testutil.setErrorExpected({ code:-32603, message:"missing key parameter to gateway/getGateway" });
            vco.call(testutil.getTest(), params, testutil.successFn, testutil.errorFn);
        },
        function insertGatewayProperty(arg, callback) {
            testutil.setTest("gatewayProperty/insertGatewayProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows":1,"id":testutil.id});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"gatewayId": testutil.last["gatewayId"],
                                          "name":"foo-g", "value":"bar-g"}, testutil.successFn, testutil.errorFn);
        },
        function getGatewayProperty(arg, callback) {
            testutil.setTest("gatewayProperty/getGatewayProperty");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"created":testutil.date,"name":"foo-g","gatewayId":testutil.last["gatewayId"],"value":"bar-g","isPassword":0,"dataType":"STRING","description":null,"modified":testutil.date});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"gatewayId": testutil.last["gatewayId"],
                                          "name":"foo-g"}, testutil.successFn, testutil.errorFn);
        },
        function updateGatewayAttributes(arg, callback) {
            testutil.setTest("gateway/updateGatewayAttributes");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId": testutil.last["networkId"],
                                          "id":testutil.last["gatewayId"],
                                          "dnsName":"dns1"+unq,
                                          "site":{"name":"gw-site"+unq,"lat":44,"lon":-122}}, testutil.successFn, testutil.errorFn);
        },
        function getGateway(arg, callback) {
            testutil.setTest("gateway/getGateway");
            testutil.setErrorExpected({ "code":-32603, "message":"missing key parameter to gateway/getGateway" });
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId": testutil.last["networkId"],
                                          "dnsName":"dns1"+unq}, testutil.successFn, testutil.errorFn);
        },
        function deleteGateway(arg, callback) {
            testutil.setTest("gateway/deleteGateway");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id":testutil.last["gatewayId"],
                                          "networkId":testutil.last["networkId"]},
                                          testutil.successFn, testutil.errorFn);
        },
        function getUserTypeRoles(arg, callback) {
            testutil.setTest("role/getUserTypeRoles");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected(testutil.makeArray(2));
            vco.call(testutil.getTest(), {"networkId": testutil.last["networkId"],
                                          "userType":"OPERATOR"},
                                           testutil.successFn, testutil.errorFn);
        },
        function getCertificateAndCASummary(arg, callback) {
            testutil.setTest("pki/getCertificateAndCASummary");
            testutil.setExact(true);
            testutil.setExpected(
                {"edgeCertificates":[],
                 "gatewayCertificates":[],
                 "revocationList":null,
                 "revokedEdges":[],
                 "revokedGateways":[],
                 "certificateAuthorities":testutil.any});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterprisesCount(arg, callback) {
            testutil.setTest("network/getNetworkEnterprises");
            testutil.setExact(false);
            testutil.setExpected({"count":0});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"networkId":testutil.last["networkId"], _count:true},
                 testutil.successFn, testutil.errorFn);
        },
        function getNetworkConfigurations(arg, callback) {
            testutil.setEnterpriseRoles(arg);
            testutil.setTest("network/getNetworkConfigurations");
            testutil.setExact(true);
            testutil.setExpected(testutil.makeArray(1));
            testutil.setGc(callback);
            testutil.runTest(vco, {"networkId":testutil.last["networkId"]});
        },
        function insertEnterprise(arg, callback) {
            testutil.last["networkConfiguration"] = arg[0];
            testutil.setTest("enterprise/insertEnterprise");
            testutil.setExact(true);
            testutil.setExpected( {"id":testutil.id,"rows":1} );
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"name":"ent"+unq,
                                          "networkId":testutil.last["networkId"],
                                          "configurationId":testutil.last["networkConfiguration"].id,
                                          "user":{"username":"e1"+unq,"password":"password","returnData":true}},
                                          testutil.successFn, testutil.errorFn);
        },
        function getEnterprise(arg, callback) {
            testutil.last["enterpriseId"] = testutil.getLastId();
            testutil.setTest("enterprise/getEnterprise");
            testutil.setExact(true);
            testutil.setExpected(
               {"id":testutil.last["enterpriseId"],
                "created":testutil.date,
                "networkId":testutil.last["networkId"],
                "gatewayPoolId":null,
                "alertsEnabled":1,
                "operatorAlertsEnabled":1,
                "endpointPkiMode":"CERTIFICATE_DISABLED",
                "name":"ent"+unq,
                "domain":testutil.str,
                "prefix":testutil.str,
                "logicalId":testutil.str,
                "accountNumber":testutil.str,
                "description":null,
                "contactName":null,
                "contactPhone":null,
                "contactMobile":null,
                "contactEmail":null,
                "streetAddress":null,
                "streetAddress2":null,
                "city":null,
                "state":null,
                "postalCode":null,
                "country":null,
                "lat":testutil.any,
                "lon":testutil.any,
                "timezone":testutil.any,
                "locale":testutil.any,
                "modified":testutil.date});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"enterpriseId":testutil.getLastId()},
                 testutil.successFn, testutil.errorFn);
        },
        function getEnterprises(arg, callback) {
            testutil.setTest('enterprise/getEnterprises');
            testutil.setExact(true);
            testutil.setExpected([arg]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"ids":[testutil.last["enterpriseId"]]});
        },
        function getEnterprises(arg, callback) {
            testutil.setTest('enterprise/getEnterprises');
            testutil.setExact(true);
            testutil.setExpected(arg);
            testutil.setGc(callback);
            testutil.runTest(vco, {"ids":[arg[0].logicalId]});
        },
        function cloneEnterprise(arg, callback) {
            testutil.setTest('enterprise/cloneEnterprise');
            testutil.setExact(true);
            var name = "A Simple Cloned Enterprise";
            testutil.setExpected(
               {"id":testutil.id,
                "created":testutil.date,
                "networkId":testutil.last["networkId"],
                "gatewayPoolId":null,
                "alertsEnabled":1,
                "operatorAlertsEnabled":1,
                "endpointPkiMode":"CERTIFICATE_DISABLED",
                "name":name,
                "domain":testutil.str,
                "prefix":testutil.str,
                "logicalId":testutil.str,
                "accountNumber":testutil.str,
                "description":null,
                "contactName":null,
                "contactPhone":null,
                "contactMobile":null,
                "contactEmail":null,
                "streetAddress":null,
                "streetAddress2":null,
                "city":null,
                "state":null,
                "postalCode":null,
                "country":null,
                "lat":testutil.any,
                "lon":testutil.any,
                "timezone":testutil.any,
                "locale":testutil.any,
                "modified":testutil.date});
            testutil.setGc(callback);
            testutil.runTest(vco,
               {"id": testutil.last["enterpriseId"],
                "name": name,
                "user": {"username":"user1"+unq,"password":"password"}});
        },
        function deleteEnterprise(arg, callback) {
          testutil.setTest("enterprise/deleteEnterprise");
          testutil.setExpected({"rows" : 1});
          testutil.setGc(callback);
          vco.call(testutil.getTest(),
              {"networkId":testutil.last["networkId"],
               "enterpriseId": testutil.getLastId()},
               testutil.successFn, testutil.errorFn);
        },
        function cloneEnterprise(arg, callback) {
            testutil.setTest('enterprise/cloneEnterprise');
            testutil.setExact(true);
            var name = "An Enterprise Cloned with Overridden Attributes";
            testutil.setExpected(
               {"id":testutil.id,
                "created":testutil.date,
                "networkId":testutil.last["networkId"],
                "gatewayPoolId":null,
                "alertsEnabled":1,
                "operatorAlertsEnabled":1,
                "endpointPkiMode":"CERTIFICATE_OPTIONAL",
                "name":name,
                "domain":testutil.str,
                "prefix":testutil.str,
                "logicalId":testutil.str,
                "accountNumber":testutil.str,
                "description":testutil.str,
                "contactName":testutil.str,
                "contactPhone":testutil.str,
                "contactMobile":testutil.str,
                "contactEmail":testutil.email1,
                "streetAddress":testutil.str,
                "streetAddress2":testutil.str,
                "city":testutil.str,
                "state":testutil.str,
                "postalCode":testutil.str,
                "country":testutil.str,
                "lat":testutil.any,
                "lon":testutil.any,
                "timezone":testutil.any,
                "locale":testutil.any,
                "modified":testutil.date});
            testutil.setGc(callback);
            testutil.runTest(vco,
               {"id": testutil.last["enterpriseId"],
                "name": name,
                "user": {"username":"user2"+unq,"password":"password"},
                "networkId":testutil.last["networkId"],
                "alertsEnabled": 1,
                "operatorAlertsEnabled": 1,
                "endpointPkiMode": "CERTIFICATE_OPTIONAL",
                "domain": "abogusdomain.com",
                "prefix": "10.10.10.0/24",
                "logicalId": "aef79c97-e95f-4372-ae0e-bf4d134b01f5",
                "accountNumber": "VEL-EXP-BMF",
                "description": "A bogus description",
                "contactName": "Fre",
                "contactPhone": "1234567890",
                "contactMobile": "1234567890",
                "contactEmail": testutil.email1,
                "streetAddress": "123 Brown St",
                "streetAddress2": "Unit 4",
                "city": "Los Angeles",
                "state": "California",
                "postalCode": "90001",
                "country": "United States",
                "lat": 37.402866,
                "lon": -122.117332,
                "timezone": "America/Los_Angeles",
                "locale": "en-US",
                "enableEnterpriseDelegationToOperator": true,
                "enableEnterpriseUserManagementDelegationToOperator": true
              });
        },
        function isEnterpriseDelegatedToOperator(arg, callback) {
          testutil.last["clonedEnterpriseId"] = testutil.getLastId();
          testutil.setTest("role/isEnterpriseDelegatedToOperator");
          testutil.setExact(true);
          testutil.setExpected({"isDelegated": true});
          testutil.setGc(callback);
          testutil.runTest(vco,
              {"enterpriseId": testutil.last["clonedEnterpriseId"]});
        },
        function isEnterpriseUserManagementDelegatedToOperator(arg, callback) {
          testutil.setTest("role/isEnterpriseUserManagementDelegatedToOperator");
          testutil.setExact(true);
          testutil.setExpected({"isDelegated": true});
          testutil.setGc(callback);
          testutil.runTest(vco,
              {"enterpriseId": testutil.last["clonedEnterpriseId"]});
        },
        function insertEnterpriseAlertConfigurations(arg, callback) {
          testutil.setTest("enterprise/insertOrUpdateEnterpriseAlertConfigurations");
          testutil.setExpected({"enterpriseAlertConfigurations": testutil.makeArray(2)});
          testutil.setGc(callback);
          testutil.runTest(vco,
              {"enterpriseId": testutil.last["clonedEnterpriseId"],
               "enterpriseAlertConfigurations": [{
                 "alertDefinitionId": 1,
                 "enabled": true,
                 "name": "EDGE_DOWN",
                 "type": "EDGE_DOWN",
                 "definition": {"isOperatorOnly": false, "isSystemOnly": false}
               }, {
                 "alertDefinitionId": 2,
                 "enabled": true,
                 "name": "EDGE_UP",
                 "type": "EDGE_UP",
                 "definition": {"isOperatorOnly": false, "isSystemOnly": false}
               }]});
        },
        function insertOrUpdateCapability(arg, callback) {
          testutil.setTest("enterprise/insertOrUpdateEnterpriseCapability");
          testutil.setExpected({"id": testutil.id});
          testutil.setGc(callback);
          testutil.runTest(vco,
              {"enterpriseId": testutil.last["clonedEnterpriseId"],
               "name": "enableBGP",
               "value": true});
        },
        function insertOrUpdateCapability(arg, callback) {
          testutil.setTest("enterprise/insertOrUpdateEnterpriseCapability");
          testutil.setExpected({"id": testutil.id});
          testutil.setGc(callback);
          vco.call(testutil.getTest(),
              {"enterpriseId": testutil.last["clonedEnterpriseId"],
               "name": "enablePki",
               "value": true},
               testutil.successFn, testutil.errorFn);
        },
        function cloneEnterprise(arg, callback) {
            testutil.setTest('enterprise/cloneEnterprise');
            testutil.setExact(true);
            var name = "An Enterprise Cloned with Optional Objects";
            testutil.setExpected(
               {"id":testutil.id,
                "created":testutil.date,
                "networkId":testutil.last["networkId"],
                "gatewayPoolId": null,
                "alertsEnabled":1,
                "operatorAlertsEnabled":1,
                "endpointPkiMode":"CERTIFICATE_OPTIONAL",
                "name":name,
                "domain":testutil.str,
                "prefix":testutil.str,
                "logicalId":testutil.str,
                "accountNumber":testutil.str,
                "description":null,
                "contactName":null,
                "contactPhone":null,
                "contactMobile":null,
                "contactEmail":null,
                "streetAddress":null,
                "streetAddress2":null,
                "city":null,
                "state":null,
                "postalCode":null,
                "country":null,
                "lat":testutil.any,
                "lon":testutil.any,
                "timezone":testutil.any,
                "locale":testutil.any,
                "modified":testutil.date});
            testutil.setGc(callback);
            testutil.runTest(vco,
               {"id": testutil.last["clonedEnterpriseId"],
                "name": name,
                "user": {"username":"user3"+unq,"password":"password"},
                "with": ["alerts","capabilities","securityPolicy","routingPolicy"]});
        },
        function isEnterpriseDelegatedToOperator(arg, callback) {
          testutil.last["clonedEnterpriseId2"] = testutil.getLastId();
          testutil.setTest("role/isEnterpriseDelegatedToOperator");
          testutil.setExact(true);
          testutil.setExpected({"isDelegated": true});
          testutil.setGc(callback);
          testutil.runTest(vco,
              {"enterpriseId": testutil.last["clonedEnterpriseId2"]});
        },
        function isEnterpriseUserManagementDelegatedToOperator(arg, callback) {
          testutil.setTest("role/isEnterpriseUserManagementDelegatedToOperator");
          testutil.setExact(true);
          testutil.setExpected({"isDelegated": true});
          testutil.setGc(callback);
          testutil.runTest(vco,
              {"enterpriseId": testutil.last["clonedEnterpriseId2"]});
        },
        // Verify that related objects have been cloned properly
        function getEnterpriseAlertConfigurations(arg, callback) {
          testutil.setTest("enterprise/getEnterpriseAlertConfigurations");
          testutil.setExpected(testutil.makeArray(2));
          testutil.setGc(callback);
          testutil.runTest(vco,
            {"enterpriseId": testutil.last["clonedEnterpriseId2"]});
        },
        function getEnterpriseCapabilities(arg, callback) {
          // capabilities
          testutil.setTest("enterprise/getEnterpriseCapabilities");
          testutil.setExpected({"enablePki": true, "enableBGP": true});
          testutil.setExact(false);
          testutil.setGc(callback);
          testutil.runTest(vco,
            {"enterpriseId": testutil.last["clonedEnterpriseId2"]});
        },
        function getEnterpriseRouteConfiguration(arg, callback) {
          testutil.setTest("enterprise/getEnterpriseRouteConfiguration");
          testutil.setExpected({
            "enterpriseId": testutil.last["clonedEnterpriseId2"],
            "object": "ROUTING_CONFIGURATION",
            "name": "GLOBAL",
            "type": "DEFAULT",
            "data": {
              "edge": testutil.any,
              "hub": testutil.any,
              "partnerGateway": testutil.any,
              "routingPreference": testutil.any
            },
          });
          testutil.setGc(callback);
          testutil.runTest(vco,
            {"enterpriseId": testutil.last["clonedEnterpriseId2"]});
        },
        function deleteEnterprise(arg, callback) {
          testutil.setTest("enterprise/deleteEnterprise");
          testutil.setExpected({"rows" : 1});
          testutil.setGc(callback);
          testutil.runTest(vco,
              {"networkId":testutil.last["networkId"],
               "enterpriseId": testutil.last["clonedEnterpriseId2"]});
          delete testutil.last.clonedEnterpriseId2;
        },
        function deleteEnterprise(arg, callback) {
          testutil.setTest("enterprise/deleteEnterprise");
          testutil.setExpected({"rows" : 1});
          testutil.setGc(callback);
          testutil.runTest(vco,
              {"networkId":testutil.last["networkId"],
               "enterpriseId": testutil.last["clonedEnterpriseId"]});
          delete testutil.last.clonedEnterpriseId;
        },
        function cloneEnterprise(arg, callback) {
            testutil.setTest('enterprise/cloneEnterprise');
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":"missing enterprise admin user to cloneEnterprise"});
            testutil.setGc(callback);
            testutil.runTest(vco,
               {"id": testutil.last["enterpriseId"],
                "name": "Attempted Clone with a Missing User"});
        },
        function getEnterpriseEnterpriseProxy(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseEnterpriseProxy');
            testutil.setExact(true);
            testutil.setExpected(null);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"]});
        },
        function getEnterpriseSupportEmail(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseSupportEmail');
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":"missing email type to getEnterpriseSupportEmail"});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"]});
        },
        function getEnterpriseSupportEmail(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseSupportEmail');
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":"invalid enterprise support email type: invalid"});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"], "type":"invalid"});
        },
        function getEnterpriseSupportEmail(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseSupportEmail');
            testutil.setExact(true);
            testutil.setExpected({"from":testutil.str,
                                  "to":testutil.str,
                                  "replyTo":testutil.str,
                                  "subject":testutil.str,
                                  "cc":testutil.str,
                                  "bcc":testutil.str,
                                  "text":testutil.str,
                                  "recipientCount":testutil.integer});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"], "type":"Generic"});
        },
        function updateEnterprise(arg, callback) {
            testutil.setTest("enterprise/updateEnterprise");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
            {"enterpriseId":testutil.last["enterpriseId"],
             "_update":{"name":"ent1"+unq}},
             testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseWithUser(arg, callback) {
            testutil.setTest("enterprise/insertEnterprise");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"name":"entx"+unq,
                                          "networkId":testutil.last["networkId"],
                                          "configurationId":testutil.last["networkConfiguration"].id,
                                          "user":{"username":"userwith"+unq,"password":"password"}},
                                          testutil.successFn, testutil.errorFn);
        },
        function deleteEnterprise(arg, callback){
            testutil.setTest("enterprise/deleteEnterprise");
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"networkId":testutil.last["networkId"],
                 "enterpriseId": testutil.getLastId()},
                 testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseWithBlankName(arg, callback) {
            testutil.setTest("enterprise/insertEnterprise");
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":testutil.str});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"name":"",
               "networkId":testutil.last["networkId"],
               "user":{"username":"userwith"+unq,"password":"password"}},
               testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseWithNoName(arg, callback) {
            testutil.setTest("enterprise/insertEnterprise");
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":testutil.str});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {
                "networkId":testutil.last["networkId"],
                "user":{"username":"userwith"+unq,"password":"password"}},
                testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseConfig(arg, callback) {
            testutil.setTest("enterpriseConfig/getEnterpriseConfig");
            testutil.setExact(false);
            testutil.setExpected([{"enterpriseId":testutil.last["enterpriseId"]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"]}, testutil.successFn, testutil.errorFn);
        },
        function getMatchingEnterpriseConfigs(arg, callback) {
            testutil.setTest("enterpriseConfig/getMatchingEnterpriseConfigs");
            testutil.setExact(false);
            testutil.setExpected({"id" : testutil.id});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"networkId":testutil.last["networkId"],
                 "firstResultOnly" : true}, testutil.successFn, testutil.errorFn);
        },
        function cloneEnterpriseConfig(arg, callback) {
            testutil.last["enterpriseConfig"] = testutil.getLastId();
        	testutil.setTest("enterpriseConfig/cloneEnterpriseConfig");
            testutil.setExact(false);
            testutil.setExpected({});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": testutil.last["enterpriseConfig"], "networkId": testutil.last["networkId"]}, testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseConfigAfterClone(arg, callback){
            testutil.setTest("enterpriseConfig/getEnterpriseConfig");
            testutil.last["enterpriseConfig"] = testutil.getLastId();
            testutil.setExact(false);
            testutil.setExpected([{"id" : testutil.last["enterpriseConfig"], "networkId" : testutil.last["networkId"]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": testutil.last["enterpriseConfig"]}, testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseConfig(arg, callback){
            testutil.setTest("enterpriseConfig/deleteEnterpriseConfig");
            var idToDelete = testutil.last["enterpriseConfig"];
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId": testutil.last["networkId"],
                                          "id": idToDelete}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterprises(arg, callback) {
            testutil.setTest("network/getNetworkEnterprises");
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id,"name":"ent1"+unq,"networkId":testutil.last["networkId"]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"]}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterprises(arg, callback) {
            testutil.setTest("network/getNetworkEnterprises");
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.last["enterpriseId"],"name":"ent1"+unq,"networkId":testutil.last["networkId"]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"],"enterprises":[testutil.last["enterpriseId"]]}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterprises(arg, callback) {
            testutil.setTest("network/getNetworkEnterprises");
            testutil.setExact(true);
            testutil.setExpected([]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"],"enterprises":[0]}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterprises(arg, callback) {
            testutil.setTest("network/getNetworkEnterprises");
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.last["enterpriseId"],"name":"ent1"+unq,"networkId":testutil.last["networkId"]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"],"enterprises":[testutil.last["enterpriseId"],99999,88888]}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterprisesCount(arg, callback) {
            testutil.setTest("network/getNetworkEnterprises");
            testutil.setExact(false);
            testutil.setExpected({"count":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"networkId":testutil.last["networkId"], _count:true},
                 testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterprisesWithEdges(arg, callback) {
            testutil.setTest("network/getNetworkEnterprises");
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id,"name":"ent1"+unq,"networkId":testutil.last["networkId"],"edges":[]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"],"with":["edges"]}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterprisesWithEdgeCount(arg, callback) {
            testutil.setTest("network/getNetworkEnterprises");
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id,"name":"ent1"+unq,"networkId":testutil.last["networkId"],"edgeCount":0}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"],"with":["edgeCount"]}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterprisesWithEdgeUpdate(arg, callback) {
            testutil.setTest("network/getNetworkEnterprises");
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id,"name":"ent1"+unq,"networkId":testutil.last["networkId"]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"],"with":["edgeConfigUpdate"]},
                     testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseEvents(arg, callback) {
            testutil.setTest("event/insertEnterpriseEvents");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"event":"event"+unq,
               "eventTime":now,
               "enterpriseId":testutil.last["enterpriseId"]},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseEvents(arg, callback) {
            testutil.setTest("event/getEnterpriseEvents");
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":"user does not have privilege [READ:ENTERPRISE_EVENT] required to access [event/getEnterpriseEvents]"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"enterpriseId":testutil.last["enterpriseId"]},
               testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseEdgeCluster(arg, callback) {
            testutil.setTest("enterprise/insertEnterpriseEdgeCluster");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"name": "cluster"+unq,
                 "description": "description " + unq,
                 "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseEdgeClusterDuplicate(arg, callback) {
            testutil.last["clusterId"] = arg.id;
            testutil.setTest("enterprise/insertEnterpriseEdgeCluster");
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":"duplicate edge cluster name [cluster" + unq + "]"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"name": "cluster"+unq,
                 "description": "description " + unq,
                 "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function updateEnterpiseEdgeCluster(arg, callback) {
            testutil.setTest("enterprise/updateEnterpriseEdgeCluster");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,
                                  "name":"cluster updated "+unq,
                                  "description": "description updated " + unq,
                                  "enterpriseId":testutil.last["enterpriseId"]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id":testutil.last["clusterId"],
                 "_update": {"name": "cluster updated "+unq, "description": "description updated " + unq},
                 "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function updateEnterpiseEdgeClusterBadEdges(arg, callback) {
            testutil.setTest("enterprise/updateEnterpriseEdgeCluster");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,
                                  "name":"cluster updated "+unq,
                                  "description": "description updated " + unq,
                                  "enterpriseId":testutil.last["enterpriseId"]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id":testutil.last["clusterId"],
                 "addEdges":[9999999], "deleteEdges":[88888888],
                 "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseEdgeCluster(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseEdgeCluster");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": testutil.last["clusterId"],
                                          "enterpriseId":testutil.last["enterpriseId"]},
                                          testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseEdgeClusterBadEdgeId(arg, callback) {
            testutil.setTest("enterprise/insertEnterpriseEdgeCluster");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"edges": [999999999],
                 "name": "cluster"+unq,
                 "description": "description " + unq,
                 "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseEdgeCluster(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseEdgeCluster");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": arg.id,
                                          "enterpriseId":testutil.last["enterpriseId"]},
                                          testutil.successFn, testutil.errorFn);
        },
        function getNetworkGatewayPools(previous, callback) {
            testutil.setTest('network/getNetworkGatewayPools');
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"]},
              testutil.successFn, testutil.errorFn);
        },
        function insertNetworkEntepriseProxy(arg, callback) {
            testutil.last["gatewayPoolId"] = arg[0].id;
            testutil.setTest("network/insertNetworkEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"name": "proxy"+unq,
                 "networkId":testutil.last["networkId"],
                 "configurationId":testutil.last["networkConfiguration"].id,
                 "gatewayPoolId":testutil.last["gatewayPoolId"],
                 "defaultGatewayPoolId":testutil.last["gatewayPoolId"],
                 "proxyType":"MSP"},
                 testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProxy(arg, callback) {
            testutil.last["enterpriseProxyId"] = testutil.getLastId();
            testutil.setTest("enterpriseProxy/getEnterpriseProxy");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,"name":"proxy"+unq,"networkId":testutil.last["networkId"],"proxyType":"MSP"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseProxyId":testutil.last["enterpriseProxyId"]}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterpriseProxies(arg, callback) {
            testutil.setTest("network/getNetworkEnterpriseProxies");
            testutil.setExact(false);
            testutil.setExpected([
              {"id":testutil.id,
               "name":"proxy"+unq,
               "networkId":testutil.last["networkId"],
               "proxyType":"MSP"}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"id":testutil.last["networkId"]},
               testutil.successFn, testutil.errorFn);
        },
        function updateEnterpriseProxy(arg, callback) {
            testutil.setTest("enterpriseProxy/updateEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseProxyId":testutil.last["enterpriseProxyId"],"_update":{"name":"proxy1"+unq}}, testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseProxyEnterprise(arg, callback) {
            testutil.setTest("enterpriseProxy/insertEnterpriseProxyEnterprise");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"enterpriseProxyId":testutil.last["enterpriseProxyId"],
                 "name":"proxyent"+unq,
                 "configurationId":testutil.last["networkConfiguration"].id,
                 "networkId":testutil.last["networkId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProxyEnterprises(arg, callback) {
            testutil.setTest("enterpriseProxy/getEnterpriseProxyEnterprises");
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id,"name":"proxyent"+unq,"networkId":testutil.last["networkId"]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id":testutil.last["enterpriseProxyId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function deleteEnterprise(arg, callback){
            testutil.setTest("enterprise/deleteEnterprise");
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"enterpriseId": testutil.getLastId()},
                 testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseProxy(arg, callback) {
            testutil.setTest("network/deleteNetworkEnterpriseProxy");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id":testutil.last["enterpriseProxyId"]}, testutil.successFn, testutil.errorFn);
        },
        function insertSystemProperty(arg, callback) {
            testutil.setTest("systemProperty/insertSystemProperty");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"networkId":testutil.last["networkId"],
                 "name": "prop."+unq,
                 "value":"value"+unq,
                 "isPassword":true},
                 testutil.successFn, testutil.errorFn);
        },
        function getSystemProperty(arg, callback) {
            testutil.last["systemProperty"] = testutil.getLastId();
            testutil.setTest("systemProperty/getSystemProperty");
            testutil.setExpected({"id":testutil.last["systemProperty"],"name":"prop."+unq,"value":"value"+unq});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": testutil.last["systemProperty"],
                                          "networkId":testutil.last["networkId"]},
                                          testutil.successFn, testutil.errorFn);
        },
        function updateSystemProperty(arg, callback) {
            testutil.setTest("systemProperty/updateSystemProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": testutil.last["systemProperty"],
                                          "networkId":testutil.last["networkId"],
                                          "_update":{"value":"value1"+unq}}, testutil.successFn, testutil.errorFn);
        },
        function getSystemProperty(arg, callback) {
            testutil.last["systemProperty"] = testutil.getLastId();
            testutil.setTest("systemProperty/getSystemProperty");
            testutil.setExpected({"id":testutil.last["systemProperty"],"name":"prop."+unq,"value":"value1"+unq});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"name": "prop."+unq}, testutil.successFn, testutil.errorFn);
        },
        function deleteSystemProperty(arg, callback) {
            testutil.setTest("systemProperty/deleteSystemProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id":testutil.last["systemProperty"],
                                          "networkId":testutil.last["networkId"],
                                          "name":"prop."+unq}, testutil.successFn, testutil.errorFn);
        },
        function insertOrUpdateSystemProperty(arg, callback) {
            testutil.setTest("systemProperty/insertOrUpdateSystemProperty");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"networkId":testutil.last["networkId"],
                 "name": "prop."+unq,
                 "value":"value"+unq,
                 "isPassword":true},
                 testutil.successFn, testutil.errorFn);
        },
        function insertOrUpdateSystemPropertyWithExisting(arg, callback) {
            testutil.last["systemProperty"] = testutil.getLastId();
            testutil.setTest("systemProperty/insertOrUpdateSystemProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"networkId":testutil.last["networkId"],
                 "name": "prop."+unq,
                 "value":"value"+unq,
                 "isPassword":false},
                 testutil.successFn, testutil.errorFn);
        },
        function deleteSystemProperty(arg, callback) {
            testutil.setTest("systemProperty/deleteSystemProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id":testutil.last["systemProperty"],
                                          "networkId":testutil.last["networkId"],
                                          "name":"prop."+unq}, testutil.successFn, testutil.errorFn);
        },
        function getSystemProperties(arg, callback) {
            testutil.setTest("systemProperty/getSystemProperties");
            testutil.setExpected([{"id":testutil.id,"name":testutil.str},
                                  {"id":testutil.id,"name":testutil.str}
                                 ]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"group":"session.operator"}, testutil.successFn, testutil.errorFn);
        },
        function getSystemProperties(arg, callback) {
            testutil.setTest("systemProperty/getSystemProperties");
            testutil.setExact(true);
            testutil.setExpected({"product.name":testutil.str});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"name":["product.name"],"normalize":true}, testutil.successFn, testutil.errorFn);
        },
        function getSystemPropertySessionSecret(arg, callback) {
            testutil.setTest("systemProperty/getSystemProperty");
            testutil.setExpected({"name":"session.secret"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"name": "session.secret"}, testutil.successFn, testutil.errorFn);
        },
        function updateSystemPropertySessionSecret(arg, callback) {
            testutil.last["session.secret"] = arg;
            testutil.setTest("systemProperty/updateSystemProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": arg.id,
                                          "_update":{"value":arg.value, "isPassword":true}}, testutil.successFn, testutil.errorFn);
        },
        function getSystemPropertySessionSecret(arg, callback) {
            testutil.setTest("systemProperty/getSystemProperty");
            testutil.setGc(callback);
            testutil.last["session.secret"].modified = testutil.date;
            testutil.last["session.secret"].isPassword = 1;
            testutil.setExact(true);
            testutil.setExpected(testutil.last["session.secret"]);
            vco.call(testutil.getTest(), {"name": "session.secret"}, testutil.successFn, testutil.errorFn);
        },
        function updateSystemPropertySessionSecret(arg, callback) {
            testutil.last["session.secret"] = arg;
            testutil.setTest("systemProperty/updateSystemProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": arg.id,
                                          "_update":{"value":arg.value, "isPassword":false}}, testutil.successFn, testutil.errorFn);
        },
        function getSystemPropertySessionSecret(arg, callback) {
            testutil.setTest("systemProperty/getSystemProperty");
            testutil.setGc(callback);
            testutil.last["session.secret"].isPassword = 0;
            testutil.last["session.secret"].modified = testutil.date;
            testutil.setExact(true);
            testutil.setExpected(testutil.last["session.secret"]);
            vco.call(testutil.getTest(), {"name": "session.secret"}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterprisesWithEdges(arg, callback) {
            testutil.setTest("network/getNetworkEnterprises");
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id,"name":"ent1"+unq,"networkId":testutil.last["networkId"],"edges":[]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"],"with":["edges"]}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterprisesWithEdgeCount(arg, callback) {
            testutil.setTest("network/getNetworkEnterprises");
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id,"name":"ent1"+unq,"networkId":testutil.last["networkId"],"edgeCount":0}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"],"with":["edgeCount"]}, testutil.successFn, testutil.errorFn);
        },
        //
        // ENTERPRISE USER ............................
        //
        function insertEnterpriseUser(arg, callback) {
            testutil.setTest("enterprise/insertEnterpriseUser");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            var loginData = {
                "username":"e1"+unq,
                "password":"password",
                "userType":"enterprise",
                "vcoServer":testutil.getVcoServer()
            };
            //
            //  here we're switching to an enterprise user (super)
            //
            login.login(loginData, function(cookie) {
                vco.setHeaders({'Cookie': cookie});
                testutil.last["enterpriseCookie"] = cookie;
                vco.call(testutil.getTest(),
                    {"id":testutil.last["enterpriseId"],
                     "roleId":14,
                     "password":"xxx",
                     "firstName":"fred",
                     "username":"user"+unq,
                     "email": "user" + unq + "@velocloud.net"},
                     testutil.successFn, testutil.errorFn);
            });
        },
        function getEnterpriseUser(arg, callback) {
            testutil.last["enterpriseUser"] = testutil.getLastId();
            testutil.setTest("enterpriseUser/getEnterpriseUser");
            testutil.setExact(true);
            testutil.setExpected(
                {"id":testutil.last["enterpriseUser"],
                 "enterpriseId":testutil.last["enterpriseId"],
                 "created":testutil.date,
                 "userType":"ENTERPRISE",
                 "username":"user"+unq,
                 "domain":null,
                 "password":"*****",
                 "firstName":"fred",
                 "lastName":null,
                 "officePhone":null,
                 "mobilePhone":null,
                 "email":"user"+unq+"@velocloud.net",
                 "isNative":1,
                 "isActive":1,
                 "isLocked":0,
                 "disableSecondFactor":0,
                 "lastLogin":testutil.date,
                 "modified":testutil.date,
                 "roleId":14,
                 "roleName":"Enterprise Superuser",
                 "networkId": null});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"username":"user"+unq}, testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseUserPasswordResetEmail(arg, callback) {
            testutil.setTest('enterpriseUser/getEnterpriseUserPasswordResetEmail');
            testutil.setExact(true);
            testutil.setExpected(
                {"from":testutil.str,
                 "replyTo":testutil.str,
                 "subject":"Password Reset",
                 "resetPasswordURL":testutil.str,
                 "to": "user"+unq+"@velocloud.net",
                 "isActive": testutil.integer,
                 "message": testutil.str});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseUserId":testutil.last["enterpriseUser"]});
        },
        function getEnterpriseEnterpriseProxy(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseEnterpriseProxy');
            testutil.setExact(true);
            testutil.setExpected(null);
            testutil.setGc(callback);
            testutil.runTest(vco, {});
        },
        //
        //  enterprise allocations ..............
        //
        function getEnterpriseSegments(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseNetworkSegments');
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id,"object":"NETWORK_SEGMENT","data":testutil.any}]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"]});
        },
        function insertEnterpriseSegment(arg, callback) {
            var error = testutil.getSwagger() ?
              { code:-32603, message:'["instance requires property \\"name\\"","instance requires property \\"type\\"","instance requires property \\"data\\""]' } :
              { code:-32603, message:'no configuration for segment provided on call to enterprise/insertEnterpriseNetworkSegment' };
            testutil.setTest('enterprise/insertEnterpriseNetworkSegment');
            testutil.setExact(true);
            testutil.setErrorExpected(error);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"]});
        },
        function insertEnterpriseNetworkSegment(arg, callback) {
            testutil.setTest('enterprise/insertEnterpriseNetworkSegment');
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,"object":"NETWORK_SEGMENT","type":"REGULAR",
                                  "data":{"segmentId":1,"delegateToEnterprise":true,"delegateToEnterpriseProxy":true}});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"name":"test","type":"REGULAR","data":{}});
        },
        function getEnterpriseSegments(arg, callback) {
            testutil.last["segmentId"] = arg.id;
            testutil.setTest('enterprise/getEnterpriseNetworkSegments');
            testutil.setExact();
            testutil.setExpected([{"id":testutil.id,"object":"NETWORK_SEGMENT","data":testutil.any},
                                  {"id":testutil.id,"object":"NETWORK_SEGMENT","data":testutil.any}]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"]});
        },
        function updateEnterpriseNetworkSegmentBad(arg, callback) {
            testutil.setTest('enterprise/updateEnterpriseNetworkSegment');
            testutil.setExact(true);
            testutil.setErrorExpected({"code": -32603,"message": "cannot change segment ID on update from [1] to [101]"});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],
                                   "id":testutil.last["segmentId"],
                                   "_update":{"name":"test changed","type":"CDE","data":{"segmentId":101}}});
        },
        function updateEnterpriseNetworkSegment(arg, callback) {
            testutil.setTest('enterprise/updateEnterpriseNetworkSegment');
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],
                                   "id":testutil.last["segmentId"],
                                   "_update":{"name":"test changed","type":"CDE","data":{"segmentId":1}}});
        },
        function getEnterpriseSegments(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseNetworkSegments');
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id,"object":"NETWORK_SEGMENT","data":testutil.any},
                                  {"id":testutil.id,"object":"NETWORK_SEGMENT","name":"test changed","data":testutil.any}]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"]});
        },
        function getEnterpriseSegments(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseNetworkSegments');
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id,"object":"NETWORK_SEGMENT","data":testutil.any},
                                  {"id":testutil.id,"object":"NETWORK_SEGMENT","name":"test changed","data":testutil.any}]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"with":["profileCount","edgeUsage","configuration"]});
        },
        function deleteEnterpriseSegment(arg, callback) {
            testutil.setTest('enterprise/deleteEnterpriseNetworkSegment');
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"id": testutil.last["segmentId"]});
        },
        function getEnterpriseSegments(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseNetworkSegments');
            testutil.setExact(false);
            testutil.setExpected([{"id":testutil.id,"object":"NETWORK_SEGMENT","data":testutil.any}]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"]});
        },
        function getEnterpriseAllocations(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseNetworkAllocations');
            testutil.setExact();
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"]});
        },
        function getEnterpriseAllocationsWithEdges(arg, callback) {
            testutil.last["allocation"] = arg[0];
            testutil.setTest('enterprise/getEnterpriseNetworkAllocations');
            testutil.setExact(false);
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edges":[]},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edges":[]}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"with":["edges"]});
        },
        function getEnterpriseAllocationsWithEdgeCount(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseNetworkAllocations');
            testutil.setExact(false);
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edgeCount":0},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edgeCount":0}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"with":["edgeCount"]});
        },
        function cloneAllocation(arg, callback) {
            testutil.setTest('enterprise/cloneEnterpriseNetworkAllocation');
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"id":testutil.last["allocation"].id});
        },
        function getEnterpriseAllocations(arg, callback) {
            testutil.last["clonedAllocationId"] = arg.id;
            testutil.setTest('enterprise/getEnterpriseNetworkAllocations');
            testutil.setExact(false);
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"]});
        },
        function getEnterpriseAllocationsWithEdges(arg, callback) {
            testutil.setTest('enterprise/getEnterpriseNetworkAllocations');
            testutil.setExact(false);
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edges":[]},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edges":[]},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edges":[]}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"with":["edges"]});
        },
        function updateAllocation(arg, callback) {
            testutil.setTest('enterprise/updateEnterpriseNetworkAllocation');
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],
                                   "id":testutil.last["clonedAllocationId"],
                                   "_update":{"name":"something"}});
        },
        function deleteAllocation(arg, callback) {
            testutil.setTest('enterprise/deleteEnterpriseNetworkAllocation');
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"],
                                          "id":testutil.last["clonedAllocationId"]},
                testutil.successFn, testutil.errorFn);
        },
        //
        //  configurations ..............
        //
        function getEnterpriseConfigurations(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseConfigurations");
            testutil.setExact(true);
            testutil.setExpected(testutil.makeArray(2));
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"with":["modules"]});
        },
        function edgeProvision(arg, callback) {
            testutil.last["enterpriseConfigurations"] = arg;
            testutil.setTest("edge/edgeProvision");
            testutil.setExpected({"id":testutil.id,"activationKey":testutil.str});
            testutil.setExact(false);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"enterpriseId":testutil.last["enterpriseId"],
                 "configurationId":testutil.last["enterpriseConfigurations"][0].id,
                 "modelNumber":"edge500",
                 "name":"edge0"+unq,
                 "site":{"name":"site"+unq}},
                 testutil.successFn, testutil.errorFn);
        },
        function edgeProvision(arg, callback) {
            testutil.last["edgeId1"] = testutil.getLastId();
            testutil.setTest("edge/edgeProvision");
            testutil.setExpected({"id":testutil.id,"activationKey":testutil.str});
            testutil.setExact(false);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"enterpriseId":testutil.last["enterpriseId"],
                 "configurationId":testutil.last["enterpriseConfigurations"][0].id,
                 "modelNumber":"edge500",
                 "name":"edge1"+unq,
                 "site":{"name":"site"+unq}},
                 testutil.successFn, testutil.errorFn);
        },
        function getEdge(arg, callback) {
            testutil.setGc(callback);
            testutil.last["edgeId2"] = testutil.getLastId();
            testutil.setTest("edge/getEdge");
            testutil.setExpected({"deviceId":null,"logicalId":testutil.str,"activationKey":arg.activationKey,"enterpriseId":testutil.last["enterpriseId"],"name":"edge1"+unq,"description":null});
            testutil.setExact(false);
    	    vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id": testutil.getLastId()}, testutil.successFn, testutil.errorFn);
        },
        function getEdges(arg, callback) {
            testutil.setTest("edge/getEdges");
            testutil.setExpected([{"id":testutil.last["edgeId1"],"enterpriseId":testutil.last["enterpriseId"]},{"id":testutil.getLastId(),"enterpriseId":testutil.last["enterpriseId"]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "ids": [testutil.last["edgeId1"],testutil.last["edgeId2"]]}, testutil.successFn, testutil.errorFn);
        },
        function getAggregates(arg, callback) {
            testutil.setTest("monitoring/getAggregates");
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":"user type [ENTERPRISE_USER] not allowed to method [monitoring/getAggregates]"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {}, testutil.successFn, testutil.errorFn);
        },
        function updateEdge(arg, callback) {
            testutil.setTest("edge/updateEdge");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.getLastId(),"_update":{"name":"edge1"+unq}}, testutil.successFn, testutil.errorFn);
        },
        function getEdge(arg, callback) {
            testutil.setTest("edge/getEdge");
            testutil.setExpected({"enterpriseId":testutil.last["enterpriseId"],"name":"edge1"+unq,"description":null});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id": testutil.getLastId()}, testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseEdges(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseEdges");
            testutil.setExpected([{"id":testutil.id,"enterpriseId":testutil.last["enterpriseId"]},{"id":testutil.id,"enterpriseId":testutil.last["enterpriseId"]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"enterpriseId": testutil.last["enterpriseId"]},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseEdges(arg, callback) {
            arg[0]["configuration"] = {"enterprise":testutil.any};
            arg[1]["configuration"] = {"enterprise":testutil.any};
            testutil.setTest("enterprise/getEnterpriseEdges");
            testutil.setExpected(arg);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"enterpriseId": testutil.last["enterpriseId"],
               "with":["configuration"]},
               testutil.successFn, testutil.errorFn);
        },
        function getEdgeAssignedAllocation(arg, callback) {
            testutil.setTest("edge/getEdgeAssignedAllocation");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id, "data":testutil.any, "object":"NETWORK_ALLOCATION"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "edgeId": testutil.last["edgeId1"]},
                                           testutil.successFn, testutil.errorFn);
        },
        function insertEdgeProperty(arg, callback) {
            testutil.setTest("edgeProperty/insertEdgeProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows":1,"id":testutil.id});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "edgeId": testutil.last["edgeId1"],
                                          "name":"foo", "value":"bar"}, testutil.successFn, testutil.errorFn);
        },
        function getEdgeProperty(arg, callback) {
            testutil.setTest("edgeProperty/getEdgeProperty");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"created":testutil.date,"name":"foo","edgeId":testutil.last["edgeId1"],"value":"bar","isPassword":0,"dataType":"STRING","description":null,"modified":testutil.date});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "edgeId": testutil.last["edgeId1"],
                                          "name":"foo"}, testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseEdgeCluster(arg, callback) {
            testutil.setTest("enterprise/insertEnterpriseEdgeCluster");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"],
                                  "members": [{"id":testutil.id, "type":"edgeHubClusterMember"},{"id":testutil.id, "type":"edgeHubClusterMember"}]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"name": "cluster"+unq,
                 "description": "description " + unq,
                 "enterpriseId":testutil.last["enterpriseId"],
                 "edges":[testutil.last["edgeId1"], testutil.last["edgeId2"]]},
                 testutil.successFn, testutil.errorFn);
        },
        function updateEnterpriseEdgeClusterDelete(arg, callback) {
            testutil.last["edgeClusterId"] = arg.id;
            testutil.setTest("enterprise/updateEnterpriseEdgeCluster");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"],
                                  "members": [{"id":testutil.id, "type":"edgeHubClusterMember"}]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "enterpriseId":testutil.last["enterpriseId"],
                 "deleteEdges":[testutil.last["edgeId1"]]},
                 testutil.successFn, testutil.errorFn);
        },
        function updateEnterpriseEdgeClusterInsert(arg, callback) {
            testutil.setTest("enterprise/updateEnterpriseEdgeCluster");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"],
                                  "members": [{"id":testutil.id, "type":"edgeHubClusterMember"}]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "enterpriseId":testutil.last["enterpriseId"],
                 "addEdges":[testutil.last["edgeId1"]],
                 "deleteEdges":[testutil.last["edgeId2"]]},
                 testutil.successFn, testutil.errorFn);
        },
        function updateEnterpriseEdgeClusterInsert(arg, callback) {
            testutil.setTest("enterprise/updateEnterpriseEdgeCluster");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"],
                                  "members": [{"id":testutil.id, "type":"edgeHubClusterMember"},{"id":testutil.id, "type":"edgeHubClusterMember"}]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "enterpriseId":testutil.last["enterpriseId"],
                 "addEdges":[testutil.last["edgeId2"]]},
                 testutil.successFn, testutil.errorFn);
        },
        function updateEnterpriseEdgeClusterInsert(arg, callback) {
            testutil.setTest("enterprise/updateEnterpriseEdgeCluster");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"],
                                  "members": [{"id":testutil.id, "type":"edgeHubClusterMember"},
                                              {"id":testutil.id, "type":"edgeHubClusterMember"}]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "enterpriseId":testutil.last["enterpriseId"],
                 "addEdges":[testutil.last["edgeId2"]]},
                 testutil.successFn, testutil.errorFn);
        },
        function enableClusterForEdgeHubMissingConfiguration(arg, callback) {
            testutil.setTest("enterprise/enableClusterForEdgeHub");
            testutil.setExact(false);
            testutil.setErrorExpected({"code": -32603, "message": "invalid or missing configurationId to enableClusterForEdgeHub: null"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function enableClusterForEdgeHubMissingModule(arg, callback) {
            testutil.setTest("enterprise/enableClusterForEdgeHub");
            testutil.setExact(false);
            testutil.setErrorExpected({"code": -32603, "message": "invalid or missing moduleId to enableClusterForEdgeHub: null"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "enterpriseId":testutil.last["enterpriseId"],
                 "configurationId":testutil.last["enterpriseConfigurations"][0].id},
                 testutil.successFn, testutil.errorFn);
        },
        function getConfiguration(arg, callback) {
            testutil.setTest("configuration/getConfiguration");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.last["enterpriseConfigurations"][0].id});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.last["enterpriseConfigurations"][0].id, "with":["modules"]},
                                          testutil.successFn, testutil.errorFn);
        },
        function enableClusterForEdgeHub(arg, callback) {
            testutil.last["configuration"] = arg;
            testutil.setTest("enterprise/enableClusterForEdgeHub");
            testutil.setExact(false);
            var expectedData = {};
            expectedData[testutil.last["enterpriseConfigurations"][0].id] = {};
            expectedData[testutil.last["enterpriseConfigurations"][0].id].roles =
                { "edgeHub": true, "edgeToEdgeBridge": false, "backHaulEdge": false };
            testutil.setExpected({"id":testutil.id,
                                  "data": expectedData,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"],
                                  "members": [{"id":testutil.id, "type":"edgeHubClusterMember"},
                                              {"id":testutil.id, "type":"edgeHubClusterMember"}]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "enterpriseId":testutil.last["enterpriseId"],
                 "configurationId":arg.id,
                 "moduleId":arg.modules[0].id},
                 testutil.successFn, testutil.errorFn);
        },
        function disableClusterForEdgeHub(arg, callback) {
            testutil.setTest("enterprise/disableClusterForEdgeHub");
            testutil.setExact(false);
            testutil.setExpected({"id":testutil.id,
                                  "data": {},
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"],
                                  "members": [{"id":testutil.id, "type":"edgeHubClusterMember"},
                                              {"id":testutil.id, "type":"edgeHubClusterMember"}]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "enterpriseId":testutil.last["enterpriseId"],
                 "configurationId":testutil.last["configuration"].id,
                 "moduleId":testutil.last["configuration"].modules[0].id},
                 testutil.successFn, testutil.errorFn);
        },
        function enableClusterForBackHaul(arg, callback) {
            testutil.setTest("enterprise/enableClusterForBackHaul");
            testutil.setExact(false);
            var expectedData = {};
            expectedData[testutil.last["enterpriseConfigurations"][0].id] = {};
            expectedData[testutil.last["enterpriseConfigurations"][0].id].roles =
                { "edgeHub": true, "edgeToEdgeBridge": false, "backHaulEdge": true};
            testutil.setExpected({"id":testutil.id,
                                  "data": expectedData,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"],
                                  "members": [{"id":testutil.id, "type":"edgeHubClusterMember"},
                                              {"id":testutil.id, "type":"edgeHubClusterMember"}]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "enterpriseId":testutil.last["enterpriseId"],
                 "configurationId":testutil.last["configuration"].id,
                 "moduleId":testutil.last["configuration"].modules[0].id},
                 testutil.successFn, testutil.errorFn);
        },
        function disableClusterForBackHaul(arg, callback) {
            testutil.setTest("enterprise/disableClusterForBackHaul");
            testutil.setExact(false);
            var expectedData = {};
            expectedData[testutil.last["enterpriseConfigurations"][0].id] = {};
            expectedData[testutil.last["enterpriseConfigurations"][0].id].roles =
                { "edgeHub": true, "edgeToEdgeBridge": false, "backHaulEdge": false};
            testutil.setExpected({"id":testutil.id,
                                  "data": expectedData,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"],
                                  "members": [{"id":testutil.id, "type":"edgeHubClusterMember"},
                                              {"id":testutil.id, "type":"edgeHubClusterMember"}]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "configurationId":testutil.last["configuration"].id,
                 "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function enableClusterForEdgeToEdgeBridge(arg, callback) {
            testutil.setTest("enterprise/enableClusterForEdgeToEdgeBridge");
            testutil.setExact(false);
            var expectedData = {};
            expectedData[testutil.last["enterpriseConfigurations"][0].id] = {};
            expectedData[testutil.last["enterpriseConfigurations"][0].id].roles =
                { "edgeHub": true, "edgeToEdgeBridge": true, "backHaulEdge": false};
            testutil.setExpected({"id":testutil.id,
                                  "data": expectedData,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"],
                                  "members": [{"id":testutil.id, "type":"edgeHubClusterMember"},
                                              {"id":testutil.id, "type":"edgeHubClusterMember"}]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "enterpriseId":testutil.last["enterpriseId"],
                 "configurationId":testutil.last["configuration"].id,
                 "moduleId":testutil.last["configuration"].modules[0].id},
                 testutil.successFn, testutil.errorFn);
        },
        function disableClusterForEdgeToEdgeBridge(arg, callback) {
            testutil.setTest("enterprise/disableClusterForEdgeToEdgeBridge");
            testutil.setExact(false);
            var expectedData = {};
            expectedData[testutil.last["enterpriseConfigurations"][0].id] = {};
            expectedData[testutil.last["enterpriseConfigurations"][0].id].roles =
                { "edgeHub": true, "edgeToEdgeBridge": false, "backHaulEdge": false};
            testutil.setExpected({"id":testutil.id,
                                  "data": expectedData,
                                  "name":"cluster"+unq,
                                  "enterpriseId":testutil.last["enterpriseId"],
                                  "members": [{"id":testutil.id, "type":"edgeHubClusterMember"},
                                              {"id":testutil.id, "type":"edgeHubClusterMember"}]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"id": testutil.last["edgeClusterId"],
                 "configurationId":testutil.last["configuration"].id,
                 "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseEdgeCluster(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseEdgeCluster");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": testutil.last["edgeClusterId"],
                                          "enterpriseId":testutil.last["enterpriseId"]},
                                          testutil.successFn, testutil.errorFn);
        },
        function deleteEdges1(arg, callback) {
            testutil.setTest("edge/deleteEdge");
            testutil.setExact(true);
            testutil.setExpected({ rows:1 });
            testutil.setGc(callback);
            vco.call(testutil.getTest(), { "enterpriseId":testutil.last["enterpriseId"], "id":testutil.last["edgeId1"] }, testutil.successFn, testutil.errorFn);
        },
        function deleteEdges2(arg, callback) {
            testutil.setTest("edge/deleteEdge");
            testutil.setExact(true);
            testutil.setExpected({ rows:1 });
            testutil.setGc(callback);
            vco.call(testutil.getTest(), { "enterpriseId":testutil.last["enterpriseId"], "id":testutil.last["edgeId2"] }, testutil.successFn, testutil.errorFn);
        },
        function insertSite(arg, callback) {
            testutil.setTest("site/insertSite");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "name": "site"+unq}, testutil.successFn, testutil.errorFn);
        },
        function deleteSite(arg, callback) {
            testutil.setTest("site/deleteSite");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "name": "site"+unq}, testutil.successFn, testutil.errorFn);
        },
        function insertSite(arg, callback) {
            testutil.setTest("site/insertSite");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "name": "site"+unq}, testutil.successFn, testutil.errorFn);
        },
        function getSite(arg, callback) {
            testutil.setTest("site/getSite");
            testutil.setExpected({"id":testutil.getLastId()});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id": testutil.getLastId()}, testutil.successFn, testutil.errorFn);
        },
        function updateSite(arg, callback) {
            testutil.setTest("site/updateSite");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id": testutil.getLastId(),"_update":{"name":"site1"+unq}}, testutil.successFn, testutil.errorFn);
        },
        function deleteSite(arg, callback) {
            testutil.setTest("site/deleteSite");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.getLastId(),"name":"site1"+unq}, testutil.successFn, testutil.errorFn);
        },
        function edgeProvision(arg, callback) {
            testutil.setTest("edge/edgeProvision");
            testutil.setExpected({"id":testutil.id,"activationKey":testutil.str});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"enterpriseId":testutil.last["enterpriseId"],
                 "configurationId":testutil.last["enterpriseConfigurations"][0].id,
                 "modelNumber":"edge500",
                 "site":{"name":"site"+unq}},
                 testutil.successFn, testutil.errorFn);
        },
        function deleteEdge(arg, callback) {
            testutil.setTest("edge/deleteEdge");
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.getLastId()},
                                          testutil.successFn, testutil.errorFn);
        },
        function insertConfiguration(arg, callback) {
            testutil.setTest("configuration/insertConfiguration");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "name": "config"+unq}, testutil.successFn, testutil.errorFn);
        },
        function getConfiguration(arg, callback) {
            testutil.setTest("configuration/getConfiguration");
            testutil.setExpected({"id":testutil.getLastId(),"name":"config"+unq});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.getLastId()}, testutil.successFn, testutil.errorFn);
        },
        function insertConfigurationModule(arg, callback) {
            testutil.last["configurationId"] = testutil.getLastId();
            testutil.setTest("configuration/insertConfigurationModule");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "configurationId":testutil.getLastId(),"name": "QOS","data":{"some":"json"}}, testutil.successFn, testutil.errorFn);
        },
        function getConfigurationModule(arg, callback) {
            testutil.setTest("configuration/getConfigurationModule");
            testutil.setExpected({"id":testutil.getLastId(),"name":"QOS","data":{"some":"json"}});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.getLastId()}, testutil.successFn, testutil.errorFn);
        },
        function updateConfigurationModule(arg, callback) {
            testutil.setTest("configuration/updateConfigurationModule");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id": testutil.getLastId(),"_update":{"name":"QOS","data":{"other":"json"}}}, testutil.successFn, testutil.errorFn);
        },
        function getConfigurationModule(arg, callback) {
            testutil.last["configurationModuleId"] = testutil.getLastId();
            testutil.setTest("configuration/getConfigurationModule");
            testutil.setExpected({"id":testutil.getLastId(),"name":"QOS","data":{"other":"json"}});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.getLastId()}, testutil.successFn, testutil.errorFn);
        },
        function updateConfiguration(arg, callback) {
            testutil.setTestDescription("cannot update a configuration that is not associated with an enterprise, in enterprise context");
            testutil.setLastId(testutil.last["configurationId"]);
            testutil.setTest("configuration/updateConfiguration");
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":"invalid enterprise context"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id": testutil.getLastId(),"_update":{"name":"config1"+unq}}, testutil.successFn, testutil.errorFn);
        },
        function updateConfiguration(arg, callback) {
            testutil.setLastId(testutil.last["configurationId"]);
            testutil.setTest("configuration/updateConfiguration");
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":"invalid enterprise context"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id": testutil.getLastId(),"_update":{"name":"config1"+unq}}, testutil.successFn, testutil.errorFn);
        },
        function deleteConfiguration(arg, callback) {
            testutil.setTest("configuration/deleteConfiguration");
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.getLastId(),"name":"config"+unq}, testutil.successFn, testutil.errorFn);
        },
        function getConfigurationModule(arg, callback) {
            testutil.setTest("configuration/getConfigurationModule");
            testutil.setExact(true);
            testutil.setExpected(null);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.last["configurationModuleId"]}, testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseUserNoUser(arg, callback) {
            testutil.setTest("enterprise/insertEnterpriseUser");
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":testutil.str});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id":testutil.last["enterpriseId"],"roleId":14,"password":"xxx","firstName":"fred","username":null}, testutil.successFn, testutil.errorFn);
        },
        function updateEnterpriseUser(arg, callback) {
            testutil.setTest("enterpriseUser/updateEnterpriseUser");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {
                 "_update":{"firstName":"george"},
                 "id": testutil.last["enterpriseUser"]},
                 testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseUser(arg, callback) {
            testutil.setTest("enterpriseUser/getEnterpriseUser");
            testutil.setExpected({"username":"user"+unq,"firstName":"george"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {
                "username":"user"+unq},
                testutil.successFn,
                testutil.errorFn);
        },
        function updateEnterpriseUser(arg, callback) {
            testutil.setTest("enterpriseUser/updateEnterpriseUser");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"_update":{"roleId":13},
                                          "id":testutil.getLastId()},
                                          testutil.successFn, testutil.errorFn);
        },
        function updateEnterpriseUser(arg, callback) {
            testutil.setTest("enterpriseUser/updateEnterpriseUser");
            testutil.setExact(true);
            var error = { code:-32603, message:testutil.getSwagger() ? 'instance requires property "_update"' : 'no id or username passed to updateEnterpriseUser' };
            testutil.setErrorExpected(error);
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {}, testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseUser(arg, callback) {
            testutil.setTest("enterpriseUser/getEnterpriseUser");
            testutil.setExpected({"username":"user"+unq,"firstName":"george","roleId":13});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {
                "username":"user"+unq},
                testutil.successFn, testutil.errorFn);
        },
        //
        //  enterprise allocations ..............
        //
        function getEnterpriseAllocations(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseNetworkAllocations");
            testutil.setExact();
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"]});
        },
        function getEnterpriseAllocationsWithEdges(arg, callback) {
            testutil.last["allocation"] = arg[0];
            testutil.setTest("enterprise/getEnterpriseNetworkAllocations");
            testutil.setExact(false);
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edges":[]},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edges":[]}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"with":["edges"]});
        },
        function getEnterpriseAllocationsWithEdgeCount(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseNetworkAllocations");
            testutil.setExact(false);
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edgeCount":0},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edgeCount":0}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"with":["edgeCount"]});
        },
        function getEnterpriseAllocationsByZone(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseNetworkAllocations");
            testutil.setExact(false);
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":{"zone":"","spaces":testutil.makeArray(2)},"edgeCount":0}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"zone":"","with":["edgeCount"]});
        },
        function getEnterpriseAllocationsByZone(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseNetworkAllocations");
            testutil.setExact(false);
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":{"zone":"vpn","spaces":testutil.makeArray(2)}}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"zone":"vpn"});
        },
        //
        //  configurations
        //
        function insertEnterpriseConfiguration(arg, callback) {
            testutil.setTest("enterprise/insertEnterpriseConfiguration");
            testutil.setExact(true);
            testutil.setExpected({"rows":1,"id":testutil.id});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],"configuration":{"name":"config"+unq,"description":"test","effective":now, "modules":[{"name":"QOS","data":{"some":"json"}},{"name":"firewall","data":{"other":"json"}}]}}, testutil.successFn, testutil.errorFn);
        },
        function getConfigurationWithModules(arg, callback) {
            testutil.last["configurationId"] = testutil.getLastId();
            testutil.setTest("configuration/getConfiguration");
            testutil.setExpected({"name":"config"+unq,
                                  "modules":testutil.any});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.last["configurationId"],"with":["modules"]}, testutil.successFn, testutil.errorFn);
        },
        function getConfigurationModule(arg, callback) {
            if ( arg.hasOwnProperty("modules") ) {
                testutil.last["cm"] = arg.modules[0].id;
            }
            testutil.setTest("configuration/getConfigurationModule");
            testutil.setExpected({"id":testutil.last["cm"]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.last["cm"]}, testutil.successFn, testutil.errorFn);
        },
        function deleteConfigurationWithModules(arg, callback) {
            testutil.setTest("configuration/deleteConfiguration");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.last["configurationId"]}, testutil.successFn, testutil.errorFn);
        },
        function deleteCascadedModule(arg, callback) {
            testutil.setTest("configuration/deleteConfigurationModule");
            testutil.setExact(true);
            testutil.setExpected({"rows":0});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"enterpriseId":testutil.last["enterpriseId"],
                                          "id":testutil.last["cm"]}, testutil.successFn, testutil.errorFn);
        },
        //
        //  allocations
        //
        function cloneAllocation(arg, callback) {
            testutil.setTest("enterprise/cloneEnterpriseNetworkAllocation");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"id":testutil.last["allocation"].id});
        },
        function getEnterpriseAllocations(arg, callback) {
            testutil.last["clonedAllocationId"] = arg.id;
            testutil.setTest("enterprise/getEnterpriseNetworkAllocations");
            testutil.setExact(false);
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"]});
        },
        function getEnterpriseAllocationsWithEdges(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseNetworkAllocations");
            testutil.setExact(false);
            testutil.setExpected([
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edges":[]},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edges":[]},
                {"id":testutil.id,"object":"NETWORK_ALLOCATION","data":testutil.any,"edges":[]}
                                 ]);
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],"with":["edges"]});
        },
        function updateAllocation(arg, callback) {
            testutil.setTest("enterprise/updateEnterpriseNetworkAllocation");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],
                                   "id":testutil.last["clonedAllocationId"],
                                   "_update":{"name":"something"}});
        },
        function deleteAllocation(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseNetworkAllocation");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            testutil.runTest(vco, {"enterpriseId":testutil.last["enterpriseId"],
                                   "id":testutil.last["clonedAllocationId"]});
        },
        function encodeEnterpriseKey(arg, callback) {
            testutil.setTest("enterprise/encodeEnterpriseKey");
            testutil.setExpected({"key":testutil.str});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"key":"secret"+unq},
                testutil.successFn, testutil.errorFn);
        },
        function decodeEnterpriseKey(arg, callback) {
            testutil.setTest("enterprise/decodeEnterpriseKey");
            testutil.setExpected({"key":"secret"+unq});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"key":arg.key},
                testutil.successFn, testutil.errorFn);
        },
        function decodeEnterpriseKeyClear(arg, callback) {
            testutil.setTest("enterprise/decodeEnterpriseKey");
            testutil.setExpected({"key":arg.key});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"key":arg.key},
                testutil.successFn, testutil.errorFn);
        },
        function getUserEnterprises(arg, callback) {
            testutil.setTest("enterpriseUser/getUserEnterprises");
            testutil.setExpected(
                [{"id":testutil.id,"name":"ent1"+unq,
                  "networkId":testutil.last["networkId"]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"id":testutil.last["enterpriseUser"]},
               testutil.successFn,
               testutil.errorFn);
        },
        function deleteEnterpriseUser(arg, callback) {
            testutil.setTest("enterpriseUser/deleteEnterpriseUser");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"firstName":"george",
               "id":testutil.last["enterpriseUser"]},
               testutil.successFn, testutil.errorFn);
        },
        //
        //  client devices
        //    macAddress	VARCHAR(20),
	//    ipAddress		VARCHAR(40),
	//    hostName		VARCHAR(255),
	//    os		VARCHAR(255),
	//    osVersion		VARCHAR(255),
	//    deviceType	VARCHAR(255),
	//    deviceModel	VARCHAR(255),
	//    lastContact	TIMESTAMP,
	//    modified		TIMESTAMP,
        //
        function insertClientDevice(arg, callback) {
            testutil.setTest("clientDevice/insertClientDevice");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            vco.call(testutil.getTest(),
                {"macAddress": "18:18:18:20:20:20",
                 "ipAddress": "172.168.2.1",
                 "hostName": "host"+unq,
                 "os": 2,
                 "enterpriseId":testutil.last["enterpriseId"],
                 "osVersion": "Lion X",
                 "deviceType": "Desktop/Laptop",
                 "lastContact": new Date()},
                 testutil.successFn, testutil.errorFn);
        },
        function getClientDevice(arg, callback) {
            testutil.last["clientDeviceId"] = testutil.getLastId();
            testutil.setTest("clientDevice/getClientDevice");
            testutil.setGc(callback);
            testutil.setExact(false);
            testutil.setExpected(
                {"id":testutil.getLastId(),
                 "created":testutil.date,
                 "macAddress":"18:18:18:20:20:20",
                 "ipAddress":"172.168.2.1",
                 "hostName":"host"+unq,
                 "os":2,
                 "osVersion":"Lion X",
                 "deviceType":"Desktop/Laptop",
                 "lastContact":testutil.date,
                 "modified":testutil.date});
            vco.call(testutil.getTest(),
                {"id": testutil.last["clientDeviceId"],
                 "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function getClientInvalidDevice(arg, callback) {
            testutil.setTest("clientDevice/getClientDevice");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected(null);
            vco.call(testutil.getTest(),
                {"id": 10000001},
                 testutil.successFn, testutil.errorFn);
        },
        function getClientDeviceWrongEnterprise(arg, callback) {
            vco.setHeaders({'Cookie': testutil.last["networkCookie"]});
            testutil.setTest("clientDevice/getClientDevice");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":"user does not have privilege [READ:CLIENT_DEVICE] required to access [clientDevice/getClientDevice]"});
            vco.call(testutil.getTest(),
                {"id": testutil.last["clientDeviceId"],
                 "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function updateClientDevice(arg, callback) {
            vco.setHeaders({'Cookie': testutil.last["enterpriseCookie"]});
            testutil.setTest("clientDevice/updateClientDevice");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            vco.call(testutil.getTest(),
                {"id": testutil.last["clientDeviceId"],
                 "_update":{"ipAddress":"172.168.2.2"}},
                 testutil.successFn, testutil.errorFn);
        },
        function getClientDevice(arg, callback) {
            testutil.setTest("clientDevice/getClientDevice");
            testutil.setGc(callback);
            testutil.setExact(false);
            testutil.setExpected(
                {"id":testutil.getLastId(),
                 "created":testutil.date,
                 "macAddress":"18:18:18:20:20:20",
                 "ipAddress":"172.168.2.2",
                 "hostName":"host"+unq,
                 "os":2,
                 "osVersion":"Lion X",
                 "deviceType":"Desktop/Laptop",
                 "lastContact":testutil.date,
                 "modified":testutil.date});
            vco.call(testutil.getTest(),
                {"id": testutil.last["clientDeviceId"], "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function deleteClientDevice(arg, callback) {
            testutil.setTest("clientDevice/deleteClientDevice");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            vco.call(testutil.getTest(),
                {"id": testutil.last["clientDeviceId"]},
                 testutil.successFn, testutil.errorFn);
        },
        //
        //  client users
        //
	//    enterpriseId	BIGINT,
	//    role		VARCHAR(255),
	//    username		VARCHAR(255),
	//    password		VARCHAR(255),
	//    domain		VARCHAR(255),
	//    emailAddress	VARCHAR(255),
	//    officePhone	VARCHAR(255),
	//    mobilePhone	VARCHAR(255),
	//    firstName		VARCHAR(255),
	//    lastName		VARCHAR(255),
	//    lastContact	TIMESTAMP,
	//    modified		TIMESTAMP,
        //
        function insertClientUser(arg, callback) {
            testutil.setTest("clientUser/insertClientUser");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            vco.call(testutil.getTest(),
                {"enterpriseId":testutil.last["enterpriseId"],
                 "role": "role"+unq,
                 "username": "user"+unq,
                 "lastContact": new Date()},
                 testutil.successFn, testutil.errorFn);
        },
        function getClientUser(arg, callback) {
            testutil.last["clientUserId"] = testutil.getLastId();
            testutil.setTest("clientUser/getClientUser");
            testutil.setGc(callback);
            testutil.setExact(false);
            testutil.setExpected(
                {"id":testutil.getLastId(),
                 "created":testutil.date,
                 "role": "role"+unq,
                 "username": "user"+unq,
                 "lastContact":testutil.date,
                 "modified":testutil.date});
            vco.call(testutil.getTest(),
                {"id": testutil.last["clientUserId"], "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function updateClientUser(arg, callback) {
            testutil.setTest("clientUser/updateClientUser");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            vco.call(testutil.getTest(),
                {"id": testutil.last["clientUserId"],
                 "_update":{"role":"ROLE"+unq,"lastContact":new Date()}},
                 testutil.successFn, testutil.errorFn);
        },
        function getClientUser(arg, callback) {
            testutil.last["clientUserId"] = testutil.getLastId();
            testutil.setTest("clientUser/getClientUser");
            testutil.setGc(callback);
            testutil.setExact(false);
            testutil.setExpected(
                {"id":testutil.getLastId(),
                 "created":testutil.date,
                 "role": "ROLE"+unq,
                 "username": "user"+unq,
                 "lastContact":testutil.date,
                 "modified":testutil.date});
            vco.call(testutil.getTest(),
                {"id": testutil.last["clientUserId"], "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function getClientInvalidUser(arg, callback) {
            testutil.setTest("clientUser/getClientUser");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected(null);
            vco.call(testutil.getTest(),
                {"id": 10000001},
                 testutil.successFn, testutil.errorFn);
        },
        function deleteClientUser(arg, callback) {
            testutil.setTest("clientUser/deleteClientUser");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            vco.call(testutil.getTest(),
                {"id": testutil.last["clientUserId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function insertFirewallRule(arg, callback) {
            testutil.setTest("firewall/insertFirewallRule");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function insertEdgeFirewallLogs(arg, callback) {
            testutil.setTest("firewall/insertEdgeFirewallLogs");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseFirewallLogs(arg, callback) {
            testutil.setTest("firewall/getEnterpriseFirewallLogs");
            testutil.setExact(true);
            testutil.setExpected(null);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function insertFileProcessingQueue(arg, callback) {
            testutil.setTest("fileProcessingQueue/insertFileProcessingQueue");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function insertEdge(arg, callback) {
            testutil.setTest("edge/insertEdge");
            testutil.setExact(true);
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
                {"name": "edge0"+unq,
                 "enterpriseId":testutil.last["enterpriseId"]},
                 testutil.successFn, testutil.errorFn);
        },
        function insertLink(arg, callback) {
            testutil.last["edgeId"] = testutil.getLastId();
            testutil.setTest("link/insertLink");
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"enterpriseId":testutil.last["enterpriseId"],
               "interface":"wan1"+unq,
               "edgeId":testutil.getLastId()},
               testutil.successFn, testutil.errorFn);
        },
        function getLink(arg, callback) {
            testutil.setTest("link/getLink");
            testutil.setExpected(
              {"id":testutil.getLastId(),
               "interface":"wan1"+unq,
               "edgeId":testutil.last["edgeId"]});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"interface":"wan1"+unq,
               "id":testutil.getLastId()},
               testutil.successFn, testutil.errorFn);
        },
        function updateLink(arg, callback) {
            testutil.setTest("link/updateLink");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"_update":{"interface":"wan2"+unq},
               "id":testutil.getLastId()},
               testutil.successFn, testutil.errorFn);
        },
        function deleteLink(arg, callback) {
            testutil.setTest("link/deleteLink");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"id":testutil.getLastId(),
               "interface":"wan2"+unq},
               testutil.successFn, testutil.errorFn);
        },
        function getEdgeAdminPassword(arg, callback) {
            testutil.setTest("edge/getEdgeAdminPassword");
            testutil.setExpected({"username" : "admin", "password" : "admin"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId":testutil.last["enterpriseId"],
                "id":testutil.last["edgeId"]},
               testutil.successFn, testutil.errorFn);
        },
        function insertPendingAuthUpdate(arg, callback) {
            testutil.setTest("edge/updateEdgeAdminPassword");
            testutil.setExpected({"id":testutil.id});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"enterpriseId":testutil.last["enterpriseId"],
               "id":testutil.last["edgeId"],
               "username" : "foo", "password" : "bar"},
               testutil.successFn, testutil.errorFn);
        },
        function getPendingAuthUpdate(arg, callback) {
            var actionId = arg.id;
            testutil.setTest("edge/getEdgeAction");
            testutil.setExpected({"id": actionId, "action" : "setAdminPassword", "status" : 0,
                "actionData" : {"username" : "foo", "password" : "bar"}});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"enterpriseId":testutil.last["enterpriseId"],
               "id": actionId},
               testutil.successFn, testutil.errorFn);
        },
        function getEdgeAdminPassword(arg, callback) {
            testutil.setTest("edge/getEdgeAdminPassword");
            testutil.setExpected({"username" : "foo", "password" : "bar"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId":testutil.last["enterpriseId"],
                "id":testutil.last["edgeId"]},
               testutil.successFn, testutil.errorFn);
        },
        function insertPendingAuthUpdate(arg, callback) {
            testutil.setTest("edge/updateEdgeAdminPassword");
            testutil.setExpected({"id":testutil.id});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"enterpriseId":testutil.last["enterpriseId"],
               "id":testutil.last["edgeId"], "password" : "baz"},
               testutil.successFn, testutil.errorFn);
        },
        function getPendingAuthUpdate(arg, callback) {
            var actionId = arg.id;
            testutil.setTest("edge/getEdgeAction");
            testutil.setExpected({"id": actionId, "action" : "setAdminPassword", "status" : 0,
                "actionData" : {"username" : "foo", "password" : "baz"}});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"id": actionId},
               testutil.successFn, testutil.errorFn);
        },
        function getEdgeAdminPassword(arg, callback) {
            testutil.setTest("edge/getEdgeAdminPassword");
            testutil.setExpected({"username" : "foo", "password" : "baz"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId":testutil.last["enterpriseId"],
                "id":testutil.last["edgeId"]},
               testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseProperty(arg, callback) {
            testutil.setTest("enterpriseProperty/insertEnterpriseProperty");
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],
                "dataType":"STRING",
                "name":"foo.bar",
                "value":"bar",
                "isPassword":true},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseProperty");
            testutil.setExpected({"name":"foo.bar","value":"bar","isPassword":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],
                "name" : "foo.bar"},
                testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseProperty");
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":"invalid enterprise context on call to [enterprise/getEnterpriseProperty]"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : 999999999,
                "name" : "foo.bar"},
                testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperties(arg, callback) {
            testutil.setTest("enterpriseProperty/getEnterpriseProperties");
            testutil.setExpected(testutil.makeArray(18));
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"]},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperties(arg, callback) {
            testutil.setTest("enterpriseProperty/getEnterpriseProperties");
            testutil.setExpected([{"name":"foo.bar","value":"bar"}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],"group":"foo"}, testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperties(arg, callback) {
            testutil.setTest("enterpriseProperty/getEnterpriseProperties");
            testutil.setExpected({"foo.bar":"bar"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],"normalize":true,"group":"foo"}, testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperties(arg, callback) {
            testutil.setTest("enterpriseProperty/getEnterpriseProperties");
            testutil.setExpected([]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],"group":"bar"}, testutil.successFn, testutil.errorFn);
        },
        function getNetworkEnterpriseProperties(arg, callback) {
            testutil.setTest("network/getNetworkEnterpriseProperties");
            testutil.setExact(false);
            testutil.setExpected(
                [{"name":"foo.bar",
                  "value":"bar",
                  "enterpriseId":testutil.last["enterpriseId"]}]);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"networkId" : testutil.last["networkId"],"name":"foo.bar"},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterprisePropertiesNormalized(arg, callback) {
            testutil.setTest("enterpriseProperty/getEnterpriseProperties");
            testutil.setExact(false);
            testutil.setExpected({
                "foo.bar":"bar",
                "configuration.security":testutil.any,
                "edge.defaultAdminUsername": "admin",
                "edge.defaultAdminPassword": "admin",
                "vco.enterprise.authentication.twoFactor.enable": "false",
                "vco.enterprise.authentication.twoFactor.require": "false",
                "vco.enterprise.authentication.twoFactor.mode": testutil.any,
                "configuration.enterprise.edge.update":testutil.any
            });
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],"normalize":true},
               testutil.successFn, testutil.errorFn);
        },
        function insertOrUpdateEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/insertOrUpdateEnterpriseProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],
                "dataType":"STRING",
                "name":"foo.bar",
                "value":"barrr"},
               testutil.successFn, testutil.errorFn);
        },
        function insertOrUpdateEnterpriseProperty(arg, callback) {
            testutil.setTest("enterpriseProperty/insertEnterpriseProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows":1,"id":testutil.id});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId":testutil.last["enterpriseId"],
                "name":"xxx",
                "value":"yyy",
                "isPassword" : false},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterprisePropertiesNormalized(arg, callback) {
            testutil.setTest("enterpriseProperty/getEnterpriseProperties");
            testutil.setExact(false);
            testutil.setExpected({
                "foo.bar":"barrr",
                "xxx":"yyy",
                "configuration.security":testutil.any,
                "edge.defaultAdminUsername": "admin",
                "edge.defaultAdminPassword": "admin",
                "vco.enterprise.authentication.twoFactor.enable": "false",
                "vco.enterprise.authentication.twoFactor.require": "false",
                "vco.enterprise.authentication.twoFactor.mode": testutil.any,
                "configuration.enterprise.edge.update":testutil.any
            });
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],"normalize":true},
               testutil.successFn, testutil.errorFn);
        },
        function updateEnterpriseProperty(arg, callback) {
            testutil.setTest("enterpriseProperty/updateEnterpriseProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],
                "name":"foo.bar",
                "_update":{"value":"bar"}},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterprisePropertiesNormalized(arg, callback) {
            testutil.setTest("enterpriseProperty/getEnterpriseProperties");
            testutil.setExact(false);
            testutil.setExpected({
                "foo.bar":"bar",
                "xxx":"yyy",
                "configuration.security":testutil.any,
                "edge.defaultAdminUsername": "admin",
                "edge.defaultAdminPassword": "admin",
                "vco.enterprise.authentication.twoFactor.enable": "false",
                "vco.enterprise.authentication.twoFactor.require": "false",
                "vco.enterprise.authentication.twoFactor.mode": testutil.any,
                "configuration.enterprise.edge.update":testutil.any
            });
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],"normalize":true},
               testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseProperty");
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "foo.bar"},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseProperty");
            testutil.setExpected(null);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "foo.bar"},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperties(arg, callback) {
            testutil.setTest("enterpriseProperty/getEnterpriseProperties");
            testutil.setExact(false);
            testutil.setExpected(testutil.makeArray(18));
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"]},
               testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseProperty");
            testutil.setExpected({"rows" : 0});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "foo.bar"},
               testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseProperty");
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "xxx"},
               testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseProperty(arg, callback) {
            testutil.setTest("enterpriseProperty/insertEnterpriseProperty");
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],
                "name":"capability.foo", "value" : "true", "dataType": "BOOLEAN", "isPassword" : false},
               testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseProperty(arg, callback) {
            testutil.setTest("enterpriseProperty/insertEnterpriseProperty");
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],
                "name":"capability.bar", "value" : "true", "dataType": "STRING", "isPassword" : false},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseProperty");
            testutil.setExpected({"value" : "true"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "capability.foo"},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperties(arg, callback) {
            testutil.setTest("enterpriseProperty/getEnterpriseProperties");
            testutil.setExact(false);
            testutil.setExpected(testutil.makeArray(19));
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"]},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseCapabilities(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseCapabilities");
            testutil.setExact(false);
            testutil.setExpected({"foo" : true, "bar": "true"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"]}, testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseProperty");
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "capability.foo"},
               testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseCapability(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseCapability");
            testutil.setErrorExpected({"code":-32603,"message":"user type [ENTERPRISE_USER] not allowed to method [enterprise/deleteEnterpriseCapability]"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "bar"},
               testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseProperty");
            testutil.setExact(true);
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "capability.bar"},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseCapabilities(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseCapabilities");
            testutil.setExact(false);
            testutil.setExpected({"enableBGP":true});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"]}, testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseProperty");
            testutil.setExpected(null);
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "capability.foo"},
               testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseProperty");
            testutil.setExpected({"rows" : 0});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "capability.foo"},
               testutil.successFn, testutil.errorFn);
        },
        function getCertificateAndCASummary(arg, callback) {
            testutil.setTest("pki/getCertificateAndCASummary");
            testutil.setExact(true);
            testutil.setErrorExpected({"code":-32603,"message":"user type [ENTERPRISE_USER] not allowed to method [pki/getCertificateAndCASummary]"});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {}, testutil.successFn, testutil.errorFn);
        },
        function insertEnterpriseProperty(arg, callback) {
            testutil.setTest("enterpriseProperty/insertOrUpdateEnterpriseProperty");
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],
                "dataType":"JSON",
                "name":"enterprise.gateway.handoff",
                "value":{"type": "802.1Q", "cTag": 12},
                "isPassword":false},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseProperty");
            testutil.setExpected({"name":"enterprise.gateway.handoff","value":{"type": "802.1Q", "cTag": 12},"isPassword":0});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "enterprise.gateway.handoff"},
               testutil.successFn, testutil.errorFn);
        },
        function insertOrUpdateEnterpriseJSONProperty(arg, callback) {
            testutil.setTest("enterpriseProperty/insertOrUpdateEnterpriseProperty");
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"],
                "dataType":"JSON",
                "name":"json",
                "value":[{"some other":"json"}],
                "isPassword":false},
               testutil.successFn, testutil.errorFn);
        },
        function getEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/getEnterpriseProperty");
            testutil.setExpected({"name":"json","value":[{"some other":"json"}],"isPassword":0});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "json"},
               testutil.successFn, testutil.errorFn);
        },
        function deleteEnterpriseProperty(arg, callback) {
            testutil.setTest("enterprise/deleteEnterpriseProperty");
            testutil.setExpected({"rows" : 1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
               {"enterpriseId" : testutil.last["enterpriseId"], "name" : "json"},
               testutil.successFn, testutil.errorFn);
        },
        function insertLink(arg, callback) {
            testutil.setTest("link/insertLink");
            testutil.setExpected({"id":testutil.id,"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"enterpriseId":testutil.last["enterpriseId"],
               "interface":"wan1"+unq,
               "edgeId":testutil.last["edgeId"]},
                testutil.successFn, testutil.errorFn);
        },
        function deleteEdge(arg, callback) {
            testutil.setTest("edge/deleteEdge");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(),
              {"enterpriseId":testutil.last["enterpriseId"],
               "id":testutil.last["edgeId"]},
               testutil.successFn, testutil.errorFn);
        },
        function deleteLink(arg, callback) {
            testutil.setTest("link/deleteLink");
            testutil.setGc(callback);
            testutil.setExact(true);
            testutil.setExpected({"rows":0});
            vco.call(testutil.getTest(),
              {"enterpriseId":testutil.last["enterpriseId"],
               "id":testutil.getLastId()},
              testutil.successFn, testutil.errorFn);
        },
        function deleteEnterprise(arg, callback) {
            vco.setHeaders({'Cookie': testutil.last["networkCookie"]});
            testutil.setTest("enterprise/deleteEnterprise");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"networkId":testutil.last["networkId"],
                                          "enterpriseId":testutil.last["enterpriseId"],"name":"ent1"+unq},
                                          testutil.successFn, testutil.errorFn);
        },
        function deleteNetwork(arg, callback) {
            testutil.setTest("network/deleteNetwork");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id":testutil.last["networkId"],"name":"network1"+unq}, testutil.successFn, testutil.errorFn);
        },
        function deleteOperator(arg, callback) {
            testutil.setTest("operator/deleteOperator");
            testutil.setExact(true);
            testutil.setExpected({"rows":1});
            testutil.setGc(callback);
            vco.call(testutil.getTest(), {"id":testutil.last["operatorId"],"name":"operator1"+unq}, testutil.successFn, testutil.errorFn);
        }],
        function done(err, result) {
          return testutil.onTestComplete(err, result, executionCallback);
        });
}

// executeTests called by run.js - if going to use run.js, comment out the next line
//executeTests(function(err, result){console.log(result)});

exports.executeTests = executeTests;
