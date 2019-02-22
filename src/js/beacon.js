/*
 * Copyright © 2019 HarborIO, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *  Thanks www.google-analytics.com/analytics_debug.js
 *
 */
(function () {
    var hbWindow = window, hbDocument = document, enableDebug = function (a) {
        var b = !!(a.hb_debug && a.hb_debug.trace);
        a.hb_debug = { trace : true };
        return b;
    }, restoreDebug = function (a, b) {
        a.hb_debug = { trace : b };
    };

    /**
     * Don't render until the document.visibilityState is not prerender (visible or hidden)
     */
    var isDocRendered = function (a) {
        if ("prerender" == hbDocument.visibilityState) return false;
        a();
        return true;
    }, createListener = function (a, b, c, d) {
        try {
            a.addEventListener ? a.addEventListener(b, c, !!d) : a.attachEvent && a.attachEvent("on" + b, c)
        } catch (e) {
            D(27)
        }
    }, createEventListener = function (d, e) {
        createListener(d, "visibilitychange", e, false);
        //try {
        //    d.addEventListener ? d.addEventListener("visibilitychange", e, false) : d.attachEvent && d.attachEvent("onvisibilitychange", e)
        //} catch (e) {
        //}
    }, waitForDocRendered = function (a) {
        var ranOnce = false, vcChangeEventListener = function () {
            if (!ranOnce && isDocRendered(a)) {
                ranOnce = true;
                var d = hbDocument, e = vcChangeEventListener;
                d.removeEventListener ? d.removeEventListener("visibilitychange", e, false) : d.detachEvent && d.detachEvent("onvisibilitychange", e);
            }
        };
        if (!isDocRendered(a)) {
            //createEventListener(hbDocument, vcChangeEventListener);
            createListener(hbDocument, "visibilitychange", vcChangeEventListener, false);
        }
    };

    /**
     * Functions for doing fancy logging
     *
     */
    var isArrayType = function (a) {
            return "[object Array]" == Object.prototype.toString.call(Object(a));
        }, isFunctionType = function (a) {
            return "function" == typeof a;
        }, isStringType = function (a) {
            return void 0 != a && -1 < (a.constructor + "").indexOf("String");
        }, startsWith = function (a, b) {
            return (isArrayType(a) || isStringType(a)) && (0 == a.indexOf(b));
        }, arrayContains = function (a, b) {
            return (isArrayType(a) && (-1 < a.indexOf(b)));
        };

    function formatAsString(a, b) {
        var c = b || 0;
        if (void 0 == a) return "" + a;
        if (isStringType(a)) return '"' + a + '"';
        if (isFunctionType(a)) return "[function]";
        if (isArrayType(a)) {
            if (3 < b) return "[...]";
            b = [];
            for (var d = 0; d < a.length; d++) b.push(formatAsString(a[d], c + 1));
            return "[" + b.join(", ") + "]"
        }
        if (a.constructor == Object) {
            if (3 < b) return "{...}";
            b = [];
            for (d in a) b.push(d + ": " + formatAsString(a[d], c + 1));
            return "{" + b.join(", ") + "}"
        }
        return "" + a
    }

    function Ha(a, b) {
        if (!isStringType(a)) return "";
        for (var c = a.split("%s"), d = 1; d < arguments.length; d++) c.splice(2 * d - 1, 0, formatAsString(arguments[d]));
        return c.join("")
    }

    var M = new function () {
        var a = window.console, b = a && "Firebug Lite" == a.provider;
        this.log = function (c, d, e) {
            if (a) {
                var f = Ha.apply(window, [].slice.call(arguments, 1));
                if (b) {
                    f = f.split("\n");
                    for (var ea = 0; ea < f.length; ea++) a[c](f[ea])
                } else if (a[c]) {
                    a[c](f);
                } else {
                    "group" == c && a.log(f)
                }
            }
        }
    };

    function logLog(a, b) {
        var c = [].slice.call(arguments);
        c.unshift("log");
        M.log.apply(M, c)
    }

    function logInfo(a, b) {
        var c = [].slice.call(arguments);
        c.unshift("info");
        M.log.apply(M, c)
    }

    function logWarn(a, b) {
        var c = [].slice.call(arguments);
        c.unshift("warn");
        M.log.apply(M, c)
    }

    function logError(a, b) {
        var c = [].slice.call(arguments);
        c.unshift("error");
        M.log.apply(M, c)
    }

    function logDebug(a, b) {
        var c = hbWindow.hb_debug;
        c && c.trace && (c = [].slice.call(arguments), c.unshift("log"), M.log.apply(M, c))
    }

    function logGroupBegin(a, b) {
        var c = [].slice.call(arguments);
        c.unshift("group");
        M.log.apply(M, c)
    }

    function logGroupEnd() {
        M.log.apply(M, ["groupEnd"])
    }

    /**
     * Functions for encoding some app status
     *
     * Works for up to D(64);
     */

    /**
     * Encode up to 64 unique commands
     * @param a
     */
    var ec = function (a) {
        this.EC = (("[object Array]" == Object.prototype.toString.call(Object(a))) && a) || [];
    };
    ec.prototype.set = function (a) {
        this.EC[a] = true;
    };
    ec.prototype.encode = function () {
        /**
         * 0-5 go into 0, 1-11 into 1
         * 1 << 64 % 6 yields 0b10000 which is 16
         * store up 64 things
         */
        for (var a = [], b = 0; b < this.EC.length; b++)
            this.EC[b] && (a[Math.floor(b / 6)] ^= 1 << b % 6);
        for (b = 0; b < a.length; b++)
            a[b] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(a[b] || 0);
        return a.join("") + "~";
    };

    var EC = new ec;

    function D(a) {
        EC.set(a)
    }

    var documentLocationHostname = function () {
            var a = String(hbDocument.location.hostname);
            //var a = "" + hbDocument.location.hostname;
            //return 0 == a.indexOf("www.") ? a.substring(4) : a
            return startsWith(a, "www.") ? a.substring(4) : a;
        }, parseExpectedArgs = function (a, b) {
            /**
             * - a: an array of keys that are all the possible values
             * - b: an array of the keys specified
             */

            // If length is 1 and it's not null and it is an object, return the object
            if (1 == b.length && null != b[0] && "object" === typeof b[0])
                return b[0];
            /**
             * Don't go beyond the length of the supported init fields
             */
            for (var c = {}, d = Math.min(a.length + 1, b.length), e = 0; e < d; e++) {
                /**
                 * Once you hit the object you know you are at the end
                 */
                if ("object" === typeof b[e]) {
                    for (var f in b[e]) {
                        /**
                         * Go field by field and drop it into c
                         */
                        b[e].hasOwnProperty(f) && (c[f] = b[e][f]);
                    }
                    /**
                     * You hit the object, you know you are at the end
                     */
                    break
                } else {
                    e < a.length ? c[a[e]] = b[e] : J("Unrecognized positional argument: " + b[e]);
                }
            }
            return c
        };

    function logCreateOptionErrors(a) {
        for (var b in a) {
            if (a.hasOwnProperty(b)) {
                if (!yc(b)) {
                    logWarn("Create config had an unknown parameter: %s", b)
                } else if (!arrayContains(validCreateOpts, b)) {
                    logWarn('This field cannot be set in a create method. Please use hb("set", %s, %s);', b, a[b])
                } else {
                    LogFieldError(b, a[b]);
                }
            }
        }
    }

    function logCreateOptionRequiredError(a) {
        for (var b = 0; b < mandatoryCreateOpts.length; b++) {
            if (!a.hasOwnProperty(mandatoryCreateOpts[b])) {
                logWarn('Create config is missing required parameter: %s', mandatoryCreateOpts[b]);
            }
        }
    }

    /**
     * Check the type of value associated with the key
     * @param a The key
     * @param b The value
     * @constructor
     */
    function LogFieldError(a, b) {
        if (void 0 == b) {
            switch (a) {
                case Ma:
                case HBapiKey:
                case HBappVersionId:
                case HBbeaconVersionId:
                    logWarn("Expected a value for required field: %s", a)
            }
        } else {
            switch (a) {
                case Ma:
                case Ra:
                case Va:
                case HBbeaconInstanceId:
                    isStringType(b) || logWarn("Expected a string value for field: %s. But found: %s.", a, typeof b);
                    break;
                case HBappVersionId:
                case HBbeaconVersionId:
                    (isStringType(b) && (0 < b.length)) || logWarn("Expected a non-empty string value for field: %s.", a);
                    break;
                //case Cb:
                //    !isNaN(parseFloat(b)) && isFinite(b) || logWarn("Expected a number value for the field: %s. But found: %s.", a, typeof b);
                //    break;
                //case Ab:
                //    isFinite(b) && !isNaN(parseInt(b, 10)) && -1 === String(b).indexOf(".") || logWarn("Expected an integer value for the field: %s. But found: %s.", a, b);
                //    break;
                case "forceSSL":
                    true !== b && false !== b && 1 !== b && 0 !== b && logWarn("Expected a boolean value for the field: %s. But found: %s.", a, typeof b);
                    break;
                //case Nb:
                //    isFunctionType(b) || logWarn("Expected a function for the field value: %s. But found: %s.", a, typeof b);
                //    break;
                case theName:
                    /^[a-zA-Z0-9_]+$/.test(b) || logError("Tracker name should only consist of alphanumeric characters.");
                    break;
                case HBapiKey:
                    validateApiKey.test(b) || logWarn("The API key should consist of 32 hex characters.");
                    break;
            }
            !/^contentGroup[0-9]+$/.test(a) && !/^dimension[0-9]+$/.test(a) ||
            isStringType(b) || logWarn("Expected a string value for field: %s. but found: %s.", a, typeof b);
            !/^metric[0-9]+$/.test(a) || !isNaN(parseFloat(b)) && isFinite(b) || logWarn("Expected a number value for field: %s. but found: %s.", a, typeof b)
        }
    }

    var transmitTheBeacon = function (a, b, c) {
        if (!window.JSON) return D(10), false;
        var d = hbWindow.XMLHttpRequest;
        if (!d) return D(11), false;
        var http = new d;
        if (!("withCredentials" in http)) return D(12), false;
        http.open("POST", "https://harbor-stream.hrbr.io/beacon", true);
        http.withCredentials = true;
        http.responseType = "json";
        http.setRequestHeader("Content-Type", "application/json");

        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                http.setRequestHeader(i, b[i]);
            }
        }

        if (!b.hasOwnProperty(HBbeaconMessageType)) {
            http.setRequestHeader(HBbeaconMessageType, a);
        }
        if (!b.hasOwnProperty(HBdataTimestamp)) {
            http.setRequestHeader(HBdataTimestamp, (new Date).getTime());
        }

        http.onreadystatechange = function () {
            Da = false;
            if (4 == http.readyState) {
                try {
                    /**
                     * status = 406, statusText = "Not Acceptable"
                     * responseText
                     * reponse is json because we set the responseType
                     * response.error.message,statusCode
                     */
                    ((201 != http.status) && (logWarn("Could not send to Harbor. Code %s %s.", http.status, http.statusText), true));

                    ((201 == http.status) && ("number" === typeof http.response) && (1 == http.response) && (logInfo("Successfully sent beacon."), true));

                    if ("object" === typeof http.response) {
                        var err = http.response && http.response.error;
                        (err && (logWarn("Problem sending beacon. Code: %s. Reason: %s.", err.statusCode ? err.statusCode : http.status, err.message || ""), true));
                    }
                } catch (ea) {
                    logError("Could not parse from Harbor. %s", ea.toString());
                }
                Da = true

                http = null
            }
        };

        try {
            var f = JSON.stringify(c);
            http.send(f);
        } catch(e) {
            return logError("Error stringifying data in beacon message. %s.", e), false;
        }
        return true
    }, fc = function (a, b, c) {
        logError("Error: type=%s method=%s message=%s account=%s", arguments);
    };

    var ef = function () {
        this.keys = [];
        this.values = {};
        this.u = {};
        this.debug = true;
    };
    ef.prototype.set = function (a, b, c) {
        this.debug && logDebug("  " + a + "=" + formatAsString(b) + (c ? " (temp)" : ""));
        this.keys.push(a);
        c ? this.u[":" + a] = b : this.values[":" + a] = b
    };
    ef.prototype.get = function (a) {
        return this.u.hasOwnProperty(":" + a) ? this.u[":" + a] : this.values[":" + a]
    };
    ef.prototype.map = function (a) {
        for (var b = 0; b < this.keys.length; b++) {
            var c = this.keys[b], d = this.get(c);
            d && a(c, d)
        }
    };

    /**
     *
     * @type {ef} Ka
     *
     * xc
     */
    var Ka = new ef, xc = [];

    var Fc = function (a) {
        if (hbWindow.top != O) return false;
        var b = hbWindow.external, c = b && b.onloadT;
        b && !b.isValidLoadTime && (c = void 0);
        2147483648 < c && (c = void 0);
        0 < c && b.setPageReadyTime();
        if (void 0 == c) return false;
        a[Eb] = c;
        return true
    }, gc = function (a) {
        var b = {};
        if (Ec(b) || Fc(b)) {
            var c = b[Eb];
            void 0 == c || Infinity == c || isNaN(c) || (0 < c
                ? (Y(b, Gb), Y(b, Jb), Y(b, Ib), Y(b, Fb), Y(b, Hb), Y(b, Kb), Y(b, Lb), Y(b, Ve), Y(b, We), Y(b, Xe), Y(b, Ye), va(function () {
                        a(b)
                    }, 10))
                : createListener(hbWindow, "load", function () {
                        gc(a)
                    }, false))
        }
    }, Ec = function(a) {
        var b = hbWindow.performance || hbWindow.webkitPerformance;
        b = b && b.timing;
        if (!b) return false;
        var c = b.navigationStart;
        if (0 == c) return false;
        a[Eb] = b.loadEventStart - c;
        a[Ve] = Z.loadTimestamp - c;
        a[We] = Z.initTimestamp - c;
        return true;
    };

    var yc = function (a) {
        var b = Ka.get(a);
        if (!b) {
            for (var c = 0; c < xc.length; c++) {
                var d = xc[c], e = d[0].exec(a);
                if (e) {
                    logDebug("Generating new model field for name: " + a);
                    b = d[1](e);
                    Ka.set(b.name, b);
                    break
                }
            }
        }
        return b
    }, zc = function (a, b, c, d) {
        LogFieldError(b, c);
        var e = yc(b);
        e && e.w ? e.w(a, b, c, d) : a.data.set(b, c, d);
        e || logInfo("Set called on unknown field: %s.", b)
    }, Cc = function (inName, inI) {
        logError("Ignored attempt to update read-only property: " + inI)
    }, Ac = function (n, i, def, v, w) {
        this.name = n;
        this.i = i;
        this.defaultValue = def;
        this.v = v;                 // This may be the property to read the value
        this.w = w;                 // This may be the property to write the value
    }, W = function (n, i, def, v, w) {
        n = new Ac(n, i, def, v, w);
        // Ka is an instance of ef, initially it is empty, but all the X and W
        // calls build up that list of "fields"
        // This set passes in:
        //  the stringID of the field, an Ac instance
        // The Ka adds to the id to its keys, and a dictionary to its values
        Ka.set(n.name, n);
        return n.name;
    }, X = function (n, i, def) {
        /**
         * Using X vs W means the variable is read-only
         * Can't do hb('set', 'beaconInstanceId', 'localhost');
         */
        return W(n, i, def, void 0, Cc);
    }, kd = function (a) {
        var b;
        Ka.map(function (c, d) {
            d.i == a && (b = d)
        });
        return b && b.name
    };

    /**
     * This gets created once inside the ad
     * It is stored in ad.a
     */
    var wc = function () {
        this.data = new ef;
        this.data.debug = true
    };
    wc.prototype.get = function (a) {
        var b = yc(a), c = this.data.get(a);
        b && void 0 == c && (c = isFunctionType(b.defaultValue) ? b.defaultValue() : b.defaultValue);
        return b && b.v ? b.v(this, a, c) : c;
    };
    wc.prototype.set = function (a, b, c) {
        if (a) {
            if ("object" == typeof a) {
                for (var d in a) a.hasOwnProperty(d) && zc(this, d, a[d], c);
            } else {
                zc(this, a, b, c);
            }
        }
    };

    /**
     * These are functions on wc
     * @param a is an instance of a wc: a.get or a.set
     * @param b
     * @returns {string}
     * @constructor
     */
    var getWcValueAsString = function (a, b) {
        a = a.get(b);
        return void 0 == a ? "" : "" + a
    }, getWcValueAsNumber = function (a, b) {
        a = a.get(b);
        return void 0 == a || "" === a ? 0 : 1 * a
    };

    var validateApiKey = /^[0-9a-f]{32}$/, xa = function (a) {
        return a ? a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "") : ""
    };

    var beaconObjectKey = isStringType(window.HarborBeaconObject) && xa(window.HarborBeaconObject) || "hb", $b = false;

    /**
     * Each call by W, X add to the global array stored inside of Ka
     *
     * This makes Ka.get(fieldName) possible which returns the Ac w/ .name, .i .defaultValue
     */

    W("forceSSL", void 0, void 0, function () {
        return $b
    }, function (a, b, c) {
        D(4);
        $b = !!c
    });

    var Ma = W("hitType", "t"), Ra = W("page", "dp", ""),
        Eb = W("l1", "plt"), Ve = W("l9", "_gst"), We = W("l10", "_gbt"),
        Va = W("title", "dt", function () {
            return hbDocument.title || void 0
        });

    //var HBbeaconMessageType = W("beaconMessageType");
    var HBbeaconMessageType = "beaconMessageType";
    var HBdataTimestamp = "dataTimestamp";
    var theName = X("name"),
        HBapiKey = X("apiKey"),
        HBappVersionId = X("appVersionId"),
        HBbeaconVersionId = X("beaconVersionId"),
        HBbeaconInstanceId = W("beaconInstanceId", void 0, void 0),
        //HBbeaconInstanceId = W("beaconInstanceId", "bid", documentLocationHostname),
        mandatoryCreateOpts = [HBapiKey, HBappVersionId, HBbeaconVersionId],
        validCreateOpts = [HBapiKey, HBappVersionId, HBbeaconVersionId, HBbeaconInstanceId, theName],
        createOptsOrdering = [HBapiKey, HBappVersionId, HBbeaconVersionId];
        //createOptsOrdering = [HBapiKey, HBappVersionId, HBbeaconVersionId, theName];

    function mapFns(a, b, c, d) {
        b[a] = function () {
            try {
                return d && D(d), c.apply(this, arguments)
            } catch (e) {
                throw fc("exc", a, e && e.name), e;
            }
        }
    };

    var Da = true, Tc = false, doNothingPlaceholder = function () {
    }, Xc = function (a) {
        return 0 == a.indexOf(".") ? a.substr(1) : a
    }, pe = function (a, b, c, d, e, f) {
        e = false;
        return true;
    }, oa = function (a, b, c, d) {
        var e = ie(a, b);
        if (e) {
            c = getWcValueAsString(a, c);
            //Xc(getWcValueAsString(a, cookieDomain))
            var f = "", ea = "", l = getWcValueAsString(a, HBapiKey);
            pe(c, e, f, ea, l, d) && (Tc = true);
        }
    }, Ae = function (a) {
            return encodeURIComponent ? encodeURIComponent(a).replace(/\(/g, "%28").replace(/\)/g, "%29") : a
    }, ie = function (a, b) {
        b = Ae(getWcValueAsString(a, b));
        return b;
    };

    /**
     *  This is only called from the ad to update it's ad.a array
     * @param a is an instance of a wc: a.get or a.get
     * @param b
     */
    var vd = function (a, b) {
        //var c = getWcValueAsString(a, cookieName);
        //SJMa.data.set(na, "_ga" == c ? "_gid" : c + "_gid");
        //var xyz = getWcValueAsNumber(a, "apiKey");
        //    xyz = getWcValueAsNumber(a, "cookieName");
        //var d = getWcValueAsString(a, wb) || documentLocationHostname();
    };

    /**
     * The ad appears to be the main beaconDataInstance that gets created by the create call
     *
     * It stores in it the createOptsOrdering and everything passed:
     * - name, apiKey
     *
     * @param a
     */
    var ad = function (a) {
        function b(a, b) {
            d.a.data.set(a, b)
        }

        var d = this;
        this.a = new wc;

        logDebug("Initializing beacon");
        /**
         * a is what is passed in via the create, so most of those fields are empty here
         *
         * b means store it inside the a which is the wc wrapper around the ef
         *
         * accessible as the ef: d.a.data.{get,set,map}
         */
        b(theName, a[theName]);

        b(HBapiKey, a[HBapiKey]);
        b(HBappVersionId, a[HBappVersionId]);
        b(HBbeaconVersionId, a[HBbeaconVersionId]);
        b(HBbeaconInstanceId, a[HBbeaconInstanceId]);

        /**
         * Store the doNothing function in the customTask
         * It's added to ef: d.a.data.{get,set,map}
         * - and it's added as a plugin to d.filters (stores just the task name)
         */
        //vd(this.a, a[HBbeaconInstanceId]);
        logCreateOptionErrors(a);
        logCreateOptionRequiredError(a);
        logDebug("Initialization complete\n\n")
    };

    ad.prototype.get = function (a) {
        isStringType(a) || logError("Please specify a field name to get it's value.");
        return this.a.get(a)
    };
    ad.prototype.set = function (a, b) {
        this.a.set(a, b)
    };
    var bd = {pageview: [Ra]};
    ad.prototype.sendtracker = function (a) {
        logDebug("Send start: " + (0 == Z.loadTimestamp ? -1 : (new Date).getTime() - Z.loadTimestamp));
        if (1 > arguments.length) logError("No hit type specified. Aborting hit."); else {
            if ("string" === typeof arguments[0]) {
                var b = arguments[0];
                var c = [].slice.call(arguments, 1)
            } else b = arguments[0] && arguments[0][Ma], c = arguments;
            b ? (c = parseExpectedArgs(bd[b] || [], c), c[Ma] = b, this.a.set(c, void 0, true), logDebug("Send finished: " + (0 == Z.loadTimestamp ? -1 : (new Date).getTime() - Z.loadTimestamp)), this.a.data.u = {}) : logError("No hit type specified. Aborting hit.")
        }
    };

    ad.prototype.send = function (a) {
        //var ss = enableDebug(hbWindow);
        //logDebug("Beacon start: " + (0 == Z.loadTimestamp ? -1 : (new Date).getTime() - Z.loadTimestamp));
        if (1 > arguments.length) {
            logError("No message type specified. Aborting beacon.");
        } else {

            var c = {
                apiKey:            this.get(HBapiKey),
                appVersionId:      this.get(HBappVersionId),
                beaconVersionId:   this.get(HBbeaconVersionId),
            };
            var bid = String(this.get(HBbeaconInstanceId));
            c[HBbeaconInstanceId] = bid && isStringType(bid) ? bid : void 0;

            if ("string" === typeof arguments[0]) {
                var b = arguments[0];
                var d = [].slice.call(arguments, 1)
            } else {
                b = arguments[0] && arguments[0][HBbeaconMessageType], c = arguments;
            }
            isArrayType(d) && (0 != d.length) ? d = d[0] : d = {}

            c[HBbeaconMessageType] = b && isStringType(b) ? b : void 0;

            b ? (transmitTheBeacon(b, c, d), logDebug("Beacon finished."), true) : logError("No message type specified. Aborting beacon.")
            //b ? (transmitTheBeacon(b, c, d), logDebug("Beacon finished: " + (0 == Z.loadTimestamp ? -1 : (new Date).getTime() - Z.loadTimestamp))) : logError("No message type specified. Aborting beacon.")
        }
        //restoreDebug(hbWindow, ss);
    };

    function nameHasDotOrColon(a) {
        return 0 <= a.indexOf(".") || 0 <= a.indexOf(":")
    };
    // TODO:
    //const BN_INDEX = 1, PN_INDEX = BN_INDEX+1, MN_INDEX = PN_INDEX+1, LN_INDEX = MN_INDEX+1;
    const BN_INDEX = 1, MN_INDEX = BN_INDEX+1, LN_INDEX = MN_INDEX+1;
    var qe = /^(?:(\w+)\.)?(\w+)$/, qorig = /^(?:(\w+)\.)?(?:(\w+):)?(\w+)$/, cmdLineParser = function (a) {
        this.originalArgs = a;                              // .originalArgs is the array of args [create, apikey, beacon
        if (isFunctionType(a[0])) {
            this.justFn = a[0];                             // .justFn is the invocation w/ just a callback
        } else {

            var b = qe.exec(a[0]);                          // [beaconName.][pluginName:]methodName
            if ((null != b) && (LN_INDEX == b.length)) {    // a.b:create becomes (a.b:create, a, b, create)
                (   this.beaconName = b[BN_INDEX] || "b0",  // What is before the period (optional)
                        this.methodName = b[MN_INDEX],          // What is after the period (required)
                        this.methodArgs = [].slice.call(a, 1),
                    ( this.cmdIsCreate = "create" == this.methodName )
                )
            }

            /**
             * .beaconName is the beacon, can't contain a "." or ":"
             */
            if (nameHasDotOrColon(this.beaconName)) throw logError('Target name and plugin names should not contain "." or ":"'), "abort";

            if (!this.methodName) throw logError("Invalid command: " + a), "abort";

            /**
             * .pluginName is a plugin, param a[1] which is now b must be a string (the plugin command)
             */
            // var p_cmd = a[1];
            // var p_fn  = a[2];
            //if (this.pluginName && (!isStringType(p_cmd) || "" == p_cmd || !isFunctionType(p_fn))) throw logError("Invalid provide command.", a), "abort";

            //if (this.pluginName && "b0" != this.beaconName) throw logError("Provide command should not be preceeded by a beacon name."), "abort";
        }
    }, cmdLineParserAsString = function(clp) {
        var s;
        if (clp.justFn) {
            s = "hb(Function)";
        } else {
            for (var d = [], e = 0; clp.originalArgs && e < clp.originalArgs.length; e++) d.push(formatAsString(clp.originalArgs[e]));
            s = "hb(" + d.join(", ") + ")"
        }

        return s;
    };

    var jf = {
        init: function () {
            /**
             * The commandQueue holds all the cmdLineParser results
             * @type {Array}
             */
            jf.commandQueue = []
        }
    };
    jf.init();
    jf.doCommand = function (a) {

        /**
         * Arguments is just an array of strings
         * @type {Array strings}
         *
         * b becomes an {Array of cmdLineParser}
         */
        var b = jf.processArgs.apply(jf, arguments);
        b = jf.commandQueue.concat(b);
        for (jf.commandQueue = []; 0 < b.length;) {
            /**
             * b[0] is now an instance of cmdLineParser
             */
            var c = b[0];
            c = cmdLineParserAsString(c);
            logGroupBegin("Running command: " + c);
            c = jf.executeIt(b[0]);
            logGroupEnd();
            /**
             * If executeIt returns true we will break out of the loop and put the unprocessed items back
             * on the commandQueue.  I think the shift should happen first, isn't the command done?
             */
            if (c) {
                logWarn('Command queue processing stopped with %s commands remaining, re-inserting at end of queue.', b.length);
                break;
            }
            b.shift();
            /**
             * Something was added while processing the current commands.
             */
            if (0 < jf.commandQueue.length) {
                logWarn('Command queue processing interrupted with %s commands remaining, re-inserting at end of queue.', b.length);
                break;
            }
        }
        /**
         * Is this a bug, putting our commands back on the queue (at the end, shouldn't the be on the front?
         */
        jf.commandQueue = jf.commandQueue.concat(b)
    };
    /**
     *
     * @param a
     * @returns {Array of cmdLineParser}
     */
    jf.processArgs = function (a) {
        for (var b = [], c = 0; c < arguments.length; c++) try {
            /**
             * arguments represents all the rows of commands
             * @type {cmdLineParser}
             */
            var clp = new cmdLineParser(arguments[c]);
            b.push(clp)
        } catch (l) {
            var e = arguments[c], ea = l;
            isArrayType(e) || isFunctionType(e) ? isArrayType(e) && !isStringType(e[0]) ? logError("First element of command array is not a string: %s", e) : logError("Command failure: %s", ea) : logError("Command is not an array or function: %s", ea)
        }
        return b
    };

    /**
     *
     *
     * @param clp is an instance of cmdLineParser
     * @returns {boolean}
     */
    jf.executeIt = function (clp) {
        try {
            if (clp.justFn) {
                clp.justFn.call(hbWindow, Z.valueForKey("b0"));
            } else {
                /**
                 * This is a create command, doesn't need/want the target
                 */
                if (clp.cmdIsCreate) {
                    if ("b0" != clp.beaconName) {
                        logWarn('Command ignored. Use "create" instead of "%s.create"', clp.beaconName);
                    } else {
                        var rv = Z.create.apply(Z, clp.methodArgs);
                        return (null === rv); // If we return true, we are dead
                    }
                } else {
                    /**
                     * beaconObjectTrackerData is the ad instance which contains all the configuration
                     */
                    var beaconObjectTrackerData = clp.beaconName == beaconObjectKey ? Z : Z.valueForKey(clp.beaconName);
                    if (beaconObjectTrackerData) {
                        beaconObjectTrackerData[clp.methodName] ? beaconObjectTrackerData[clp.methodName].apply(beaconObjectTrackerData, clp.methodArgs) : logWarn("Command %s not found.", clp.methodName);
                        return false; // Always, from non-create commands
                    }
                    else {
                        logWarn("Command %s ignored on unknown target %s.", clp.methodName, clp.beaconName);
                    }
                }
            }
        } catch (ea) {
            clp.justFn ? logError("Exception thrown from pushed function: %s", c) : clp.cmdIsCreate ? logError("Error calling create method: %s", clp.originalArgs) : logError('Called method "%s" threw exception: %s', clp.methodName, ea)
        }
    };

    var Z = function (a) {
        D(2);
        logGroupBegin("Executing Harbor Beacon commands.");
        jf.doCommand.apply(jf, [arguments]);
        logGroupEnd()
    };
    Z.initTimestamp = 0;
    Z.loadTimestamp = 0;
    // The answer to the ultimate question of life, the universe and everything is 42.
    Z.answer        = 42;
    Z.asObject      = {};
    Z.asArray       = [];
    /**
     *
     * @param a - the API Key
     * @returns {ad}
     */
    Z.create = function (a) {
        /**
         *
         * arguments: The order of these fields is significant, it is determined by:
         * - createOptsOrdering
         *
         * From the create you will get:
         *   arguments[0] is apiKey
         *   arguments[1] is appVersionId
         *   arguments[2] is beaconVersionId
         *   arguments[3] is name
         *   arguments[4] is fieldsObject which contains beaconInstanceId
         *
         */
        var b = parseExpectedArgs(createOptsOrdering, [].slice.call(arguments));
        b[theName] || (b[theName] = "b0");
        b[HBbeaconInstanceId] || (b[HBbeaconInstanceId] = documentLocationHostname());
        var c = "" + b[theName];
        if (Z.asObject[c]) return logWarn("Ignoring create request for duplicate beacon name."), Z.asObject[c];

        logInfo("Creating new beacon: " + c);
        b = new ad(b);
        Z.asObject[c] = b;
        Z.asArray.push(b);
        return b
    };
    Z.valueForKey = function (a) {
        return Z.asObject[a]
    };
    Z.getAll = function () {
        return Z.asArray.slice(0)
    };
    Z.initialize = function () {
        "hb" != beaconObjectKey && D(1);
        logGroupBegin("Initializing Harbor Beacon.");
        var a = hbWindow[beaconObjectKey];

        if (a && 42 == a.answer)
            logWarn("Beacon script already loaded. Abandoning initialization.");
        else {
            a && (42 != a.answer) && !a.q && logWarn("An existing object with the name '%s' found. Unexpected results can occur because of this.", beaconObjectKey);
        }

        if (!(a && (42 == a.answer))) {
            logInfo("Doing it");
            Z.loadTimestamp = a && a.l;
            Z.initTimestamp = 1 * new Date;
            Z.loaded = true;

            var b = hbWindow[beaconObjectKey] = Z;
            mapFns("create", b, b.create, 4);
            mapFns("getByName", b, b.O);
            mapFns("getAll", b, b.getAll);

            b = ad.prototype;
            mapFns("get", b, b.get, 5);
            mapFns("set", b, b.set, 6);
            //mapFns("sendtracker", b, b.sendtracker);
            mapFns("send", b, b.send, 7);

            b = wc.prototype;
            mapFns("get", b, b.get);
            mapFns("set", b, b.set);

            if ("https:" != hbDocument.location.protocol && !$b) {
                a:{
                    b = hbDocument.getElementsByTagName("script");
                    // We are allowing a match to /src/1.2.3/beacon.js or /src/1.2.3/beacon.js
                    var cdnre = /^http:\/\/cloud(?:\-staging)?.hrbr.io\/src\/(?:[0-9]\.[0-9]\.[0-9]\/)?beacon(?:_debug)?.js$/;
                    for (var c = 0; c < b.length && 100 > c; c++) {
                        var d = b[c].src;
                        if (d && (cdnre.test(d))) {
                            b = true;
                            break a
                        }
                    }
                    b = false
                }
                b && (logDebug("Harbor.js is secure, forcing SSL for all hits."), $b = true)
            }

            a = a && a.q;
            isArrayType(a) ? jf.doCommand.apply(Z, a) : D(3)
        }
        logGroupEnd()
    };

    logLog("\n _                _                \n| |              | |               \n| |___  __ _ _ __| |__   ___  _ __ \n|  _  |/ _` | '__| '_ \\ / _ \\| '__|\n| | | | (_| | |  | (_) | (_) | |   \n|_| |_|\\__,_|_|  |_,__/ \\___/|_|\n");
    logWarn("Running harbor_debug.js. This script is intended for testing and debugging only.");

    var beaconInitFn = Z.initialize, bo = hbWindow[beaconObjectKey];
    bo && bo.r ? beaconInitFn() : waitForDocRendered(beaconInitFn);

})(window);
