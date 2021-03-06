/**
 * @fileoverview Tests for ECMA feature flags
 * @author Nicholas C. Zakas
 * @copyright 2014 Nicholas C. Zakas. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require("chai").assert,
    leche = require("leche"),
    path = require("path"),
    espree = require("../../espree"),
    shelljs = require("shelljs");

// var espree = require("esprima-fb");
//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

var FIXTURES_DIR = "./tests/fixtures/ecma-features",
    FIXTURES_MIX_DIR = "./tests/fixtures/ecma-features-mix";

var testFiles = shelljs.find(FIXTURES_DIR).filter(function(filename) {
    return filename.indexOf(".src.js") > -1;
}).map(function(filename) {
    return filename.substring(FIXTURES_DIR.length - 1, filename.length - 7);  // strip off ".src.js"
});

var moduleTestFiles = testFiles.filter(function(filename) {
    return !/jsx|globalReturn|invalid|not\-strict/.test(filename);
});

var mixFiles = shelljs.find(FIXTURES_MIX_DIR).filter(function(filename) {
    return filename.indexOf(".src.js") > -1;
}).map(function(filename) {
    return filename.substring(FIXTURES_MIX_DIR.length - 1, filename.length - 7);  // strip off ".src.js"
});

// console.dir(moduleTestFiles);
// return;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("ecmaFeatures", function() {

    var config;

    beforeEach(function() {
        config = {
                loc: true,
                range: true,
                ecmaFeatures: {}
            };
    });

    leche.withData(testFiles, function(filename) {
        // Uncomment and fill in filename to focus on a single file
        // var filename = "jsx/invalid-matching-placeholder-in-closing-tag";
        var feature = path.dirname(filename),
            code = shelljs.cat(path.resolve(FIXTURES_DIR, filename) + ".src.js");

        it("should parse correctly when " + feature + " is true", function() {
            config.ecmaFeatures[feature] = true;
            var expected = require(path.resolve(__dirname, "../../", FIXTURES_DIR, filename) + ".result.js");
            var result;

            try {
                result = espree.parse(code, config);
            } catch (ex) {

                // if the result is an error, create an error object so deepEqual works
                if (expected.message || expected.description) {

                    var expectedError = new Error(expected.message || expected.description);
                    Object.keys(expected).forEach(function(key) {
                        expectedError[key] = expected[key];
                    });
                    expected = expectedError;
                } else {
                    throw ex;
                }

                result = ex;    // if an error is thrown, match the error

            }
            assert.deepEqual(result, expected);
        });

        it("should throw an error when " + feature + " is false", function() {
            config.ecmaFeatures[feature] = false;

            assert.throws(function() {
                espree.parse(code, config);
            });

        });
    });

    describe("Modules", function() {

        leche.withData(moduleTestFiles, function(filename) {

            var code = shelljs.cat(path.resolve(FIXTURES_DIR, filename) + ".src.js");

            it("should parse correctly when sourceType is module", function() {
                var expected = require(path.resolve(__dirname, "../../", FIXTURES_DIR, filename) + ".result.js");
                var result;

                config.sourceType = "module";

                // set sourceType of program node to module
                if (expected.type === "Program") {
                    expected.sourceType = "module";
                }

                try {
                    result = espree.parse(code, config);
                } catch (ex) {

                    // if the result is an error, create an error object so deepEqual works
                    if (expected.message || expected.description) {

                        var expectedError = new Error(expected.message || expected.description);
                        Object.keys(expected).forEach(function(key) {
                            expectedError[key] = expected[key];
                        });
                        expected = expectedError;
                    } else {
                        throw ex;
                    }

                    result = ex;    // if an error is thrown, match the error

                }
                assert.deepEqual(result, expected);
            });

        });
    });



    leche.withData(mixFiles, function(filename) {

        var features = path.dirname(filename),
            code = shelljs.cat(path.resolve(FIXTURES_MIX_DIR, filename) + ".src.js");

        it("should parse correctly when " + features + " are true", function() {
            config.ecmaFeatures = require(path.resolve(__dirname, "../../", FIXTURES_MIX_DIR, filename) + ".config.js");

            var expected = require(path.resolve(__dirname, "../../", FIXTURES_MIX_DIR, filename) + ".result.js");
            var result;

            try {
                result = espree.parse(code, config);
            } catch (ex) {

                // if the result is an error, create an error object so deepEqual works
                if (expected.message) {
                    var expectedError = new Error(expected.message);
                    Object.keys(expected).forEach(function(key) {
                        expectedError[key] = expected[key];
                    });
                    expected = expectedError;
                }
                result = ex;    // if an error is thrown, match the error
            }

            assert.deepEqual(result, expected);
        });

    });


});
