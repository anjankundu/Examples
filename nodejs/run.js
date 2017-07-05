// simple test runner, that displays aggregate stats for multiple test suites

var nodePath="./";
if ( typeof(process.env.NODE_PATH) !== 'undefined' )
    nodePath = process.env.NODE_PATH + "/";
var async = require(nodePath + 'node_modules/async');
var util = require('util');

var qaOutput = false;
if ( process.env.QA_OUTPUT == "true" )
    qaOutput = true;

function CONSOLELOG(str) {
   if ( !qaOutput )
      console.log(str);
}

var suites = [];
var arguments = process.argv.slice(2);
for (var i=0; i<arguments.length; i++) {
    suites.push(arguments[i]);
    console.log("Found suite: " + arguments[i]);
}

var jsonStrSpaces = typeof(process.env.VC_TESTUTIL_JSON_SPACING) === 'undefined' ? 2 :
                    (process.env.VC_TESTUTIL_JSON_SPACING ? parseInt(process.env.VC_TESTUTIL) : null)

CONSOLELOG("**************************************");

var overall = {"success" : 0, 
               "failure" : 0,
               "errors" : [],
               "duration" : 0};

async.mapSeries(suites,
        function executeTest(suite, callback) {
            if (!qaOutput) {
                CONSOLELOG("");
            }
            CONSOLELOG('===Executing ' + suite + "===");
            var suiteObject = require("./" + suite);
            suiteObject.executeTests(callback);
        },
        function completionCallback(err, results) {
            if (err) {
                CONSOLELOG("Error executing tests: " + err);
                process.exit(1);
            } 
            CONSOLELOG("\n\n\n*****************************************");
            var errors = false;
            for (var idx in results) {
                try {
                    overall.success += results[idx].success;
                    overall.failure += results[idx].failure;
                    if (results[idx].failure > 0) {
                        overall.errors.push(suites[idx]);
                        errors = true;
                    }
                    overall.duration += results[idx].duration;
                } catch (exception) {};
                CONSOLELOG("****** Results for " + suites[idx] + "********\n" + stringify(results[idx]));
            }

            CONSOLELOG("\n\n\n*******************************");
            CONSOLELOG("****** Overall Results ********\n" + stringify(overall));
            if (errors) {
                process.exit(1);
            }
        });


function stringify(result) {
    try {
        var rr = "";
        if (!qaOutput && result.failure == 0) {
            rr += "\033[1;32m";  // green
        }
        rr += "success:       " + result.success + "\n";
        if (!qaOutput && result.failure == 0) {
            rr += "\033[0m";
        }
        if (!qaOutput && result.failure) {
            rr += "\033[1;31m"; // red
        }
        rr += "errors:        " + JSON.stringify(result.errors, null, jsonStrSpaces) + "\n";
        if (!qaOutput && result.failure) {
            rr += "\033[0m";
        }
        rr += "duration:      " + result.duration + " ms";

        return rr;
    } catch (exception) {};
    return "";
}

