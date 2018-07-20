// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"static\\js\\functions.js":[function(require,module,exports) {
/*** Main Script ***/
var flightSearch = new FlightSearchAPI();
var params = {
    from: document.getElementById('from').value,
    to: document.getElementById('to').value
};
// Display All available airports
flightSearch.requestAPI('/airports/all', params, successCallback);

//------------------------------------------------------------------------------

/** API functions **/
function FlightSearchAPI() {
    this.endpoint = 'http://flights.eliashenrich.de/api.php';

    this.requestAPI = function (action, data, callback) {
        var url = this.endpoint + '?action=' + action;

        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
            var paramName = keys[i];
            var paramValue = data[keys[i]];

            url += "&" + paramName + "=" + paramValue;
        }

        var request = new XMLHttpRequest();

        request.onreadystatechange = function () {
            console.log("Status hat sich geändert", this.readyState);

            // Ist die Anfrage beendet?
            if (this.readyState === 4) {
                // Http-Statuscode prüfen
                if (this.status === 200) {
                    console.log("Anfrage erfolgreich: " + action);
                    console.log(this.responseText);

                    callback(this.responseText, action);
                }
            }
        };

        request.open('GET', url, true);
        request.send();
    };
}

function successCallback(data, action) {
    var response = JSON.parse(data);

    if (action == '/route/find') {
        for (var i = 0; i < response.length; i++) {
            var flug = response[i];

            console.log("Flug " + i);

            for (var j = 0; j < flug.length; j++) {
                var leg = flug[j];

                console.log("Leg " + j, leg);

                var airportFrom = leg.airportFrom.CityName;
                var airportTo = leg.airportTo.CityName;
                var latFrom = leg.airportFrom.PositionLat;
                var lonFrom = leg.airportFrom.PositionLon;
                var latTo = leg.airportTo.PositionLat;
                var lonTo = leg.airportTo.PositionLon;
                if (leg.schedule[j]) {
                    var depTime = leg.schedule[j].ScheduledDepartureTime;
                    var arrTime = leg.schedule[j].ScheduledArrivalTime;
                }

                addListItemRoute(airportFrom, latFrom, lonFrom, airportTo, latTo, lonTo, depTime, arrTime);
            }
        }
    }

    if (action == '/airports/all') {
        if (response) {
            var result = {};

            for (var i = 0; i < response.data.length; i++) {
                var obj = response.data[i];
                addListItemAirport(obj.Id, obj.CodeIATA, obj.CityName, obj.PositionLat, obj.PositionLon);
            }
        }
    }
}

//------------------------------------------------------------------------------

/*** General functions ***/
function showOverlay() {
    var params = {
        from: document.getElementById('from').value,
        to: document.getElementById('to').value
    };
    var start = mapAirportCodeToName(params.from);
    var startId = mapAirportCodeToId(params.from);
    var destination = mapAirportCodeToName(params.to);
    var destinationId = mapAirportCodeToId(params.to);
    var startLon = mapAirportCodeToLon(params.from);
    var startLat = mapAirportCodeToLat(params.from);
    var destinationLon = mapAirportCodeToLon(params.to);
    var destinationLat = mapAirportCodeToLat(params.to);
    params.from = startId;
    params.to = destinationId;
    //console.log("startLon"+startLon+"startLat"+startLat+"destinationLon"+destinationLon+"destinationLat"+destinationLat);

    // Get Routes between aiports
    flightSearch.requestAPI('/route/find', params, successCallback);
    return false;

    var element = document.getElementById('waitOverlayWrapper');
    element.style.display = "block";
    return false;
}

function hideOverlay() {
    var element = document.getElementById('waitOverlayWrapper');
    element.style.display = 'none';
}

function addListItemRoute(airportFrom, latFrom, lonFrom, airportTo, latTo, lonTo, departureTime, arrivalTime) {

    var listItem = document.getElementById('listDummyRoute');

    // Listenelement klonen und neu einfügen
    var newListItem = listItem.cloneNode(true);
    newListItem.setAttribute('id', '');
    newListItem.classList.remove('hidden');

    // Kindelement des neuen Knotens bearbeiten
    newListItem.getElementsByClassName('flightFrom')[0].innerText = airportFrom;
    newListItem.getElementsByClassName('latFrom')[0].innerText = latFrom;
    newListItem.getElementsByClassName('lonFrom')[0].innerText = lonFrom;
    newListItem.getElementsByClassName('flightTo')[0].innerText = airportTo;
    newListItem.getElementsByClassName('latTo')[0].innerText = latTo;
    newListItem.getElementsByClassName('lonTo')[0].innerText = lonTo;
    newListItem.getElementsByClassName('timeDeparture')[0].innerText = departureTime.substr(0, 5);
    newListItem.getElementsByClassName('timeArrival')[0].innerText = arrivalTime.substr(0, 5);

    document.getElementById('flightList').appendChild(newListItem);
}

function addListItemAirport(id, code, city, lat, lon) {

    var listItem = document.getElementById('listDummyAirport');

    // Listenelement klonen und neu einfügen
    var newListItem = listItem.cloneNode(true);
    newListItem.setAttribute('id', '');
    newListItem.classList.remove('hidden');

    // Kindelement des neuen Knotens bearbeiten
    newListItem.getElementsByClassName('airportId')[0].innerText = id;
    newListItem.getElementsByClassName('airportCode')[0].innerText = code;
    newListItem.getElementsByClassName('airportName')[0].innerText = city;
    newListItem.getElementsByClassName('airportLat')[0].innerText = lat;
    newListItem.getElementsByClassName('airportLon')[0].innerText = lon;

    document.getElementById('airportList').appendChild(newListItem);
}

function mapAirportCodeToName(code) {
    code = code + "";
    var result = "";

    var airportCodes = document.getElementsByClassName('airportCode');
    var airportNames = document.getElementsByClassName('airportName');

    for (var i = 1; i < airportCodes.length; i++) {
        if (airportCodes[i].innerText == code) {
            result = airportNames[i].innerText;
        }
    }
    return result;
}

function mapAirportCodeToId(code) {
    code = code + "";
    var result = null;

    var airportCodes = document.getElementsByClassName('airportCode');
    var airportId = document.getElementsByClassName('airportId');

    for (var i = 1; i < airportCodes.length; i++) {
        if (airportCodes[i].innerText == code) {
            result = airportId[i].innerText;
        }
    }
    return result;
}

function mapAirportCodeToLon(code) {
    code = code + "";
    var result = null;

    var airportCodes = document.getElementsByClassName('airportCode');
    var airportLon = document.getElementsByClassName('airportLon');

    for (var i = 1; i < airportCodes.length; i++) {
        if (airportCodes[i].innerText == code) {
            result = airportLon[i].innerText;
        }
    }
    return result;
}

function mapAirportCodeToLat(code) {
    code = code + "";
    var result = null;

    var airportCodes = document.getElementsByClassName('airportCode');
    var airportLat = document.getElementsByClassName('airportLat');

    for (var i = 1; i < airportCodes.length; i++) {
        if (airportCodes[i].innerText == code) {
            result = airportLat[i].innerText;
        }
    }
    return result;
}
},{}],"node_modules\\parcel-bundler\\src\\builtins\\hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '58266' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();

      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["node_modules\\parcel-bundler\\src\\builtins\\hmr-runtime.js","static\\js\\functions.js"], null)
//# sourceMappingURL=/functions.b6d6f25b.map