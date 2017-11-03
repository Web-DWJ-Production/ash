/**
 * CINNABARISLAND JS
 * CINNABARISLAND is a JavaScript Library for http calls. Compatible with most browsers.
 * 
 * Alex Goley
 */
// Browser Check
var browserChecks = {
    // Opera 8.0+
    isOpera: false,
    // Firefox 1.0+
    isFirefox: false,
    // Safari 3.0+ "[object HTMLElementConstructor]" 
    isSafari:false,
    // Internet Explorer 6-11
    isIE:false,
    // Edge 20+
    isEdge:false,
    // Chrome 1+
    isChrome:false,    
    // Blink engine detection
    isBlink: false
};

browserChecks.isOpera= (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
browserChecks.isFirefox= typeof InstallTrigger !== 'undefined';
browserChecks.isSafari=/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
browserChecks.isIE=/*@cc_on!@*/false || !!document.documentMode;
browserChecks.isEdge=!browserChecks.isIE && !!window.StyleMedia;
browserChecks.isChrome=!!window.chrome && !!window.chrome.webstore;
browserChecks.isBlink= (browserChecks.isChrome || browserChecks.isOpera) && !!window.CSS;  


// VARIABLES
var cinnabarisland = {}; // initialize the cinnabarisland object.

// FUNCTIONS
/**
 * Runs a get request.
 * @param {string} url - url to send the request.
 * @param {function} next - callback function to run with a response string.
 * @param {any} headers - optional: header object to use for th request.
 * @param {boolean} async - optional: flag to run asynchronous request. Defaults to false.
 */
cinnabarisland.get = function (url, next, headers, async) {
    var xhttp = cinnabarisland.getHTTPObject();    
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            next(this.responseText);
        }
    };
    // IE prevent caching results by URI
    if(browserChecks.isIE){
        url = url + "?random="+Math.random();
    }
    
    var isAsync = (typeof async === 'undefined') ? false : async;    
    xhttp.open("GET", url, isAsync);    
    if (headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhttp.setRequestHeader(key, headers[key]);
            }
        }
    }
    xhttp.send();
}

/**
 * Runs a post request.
 * @param {string} url - url to send the request.
 * @param {Object} body - data to send in request body.
 * @param {function} next - callback function to run with a response string.
 * @param {any} headers - optional: header object to use for th request.
 * @param {boolean} async - optional: flag to run asynchronous request. Defaults to false.
 */
cinnabarisland.post = function (url, body, next, headers, async) {
    var xhttp = cinnabarisland.getHTTPObject();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            next(this.responseText);
        }
    };

    var isAsync = (typeof async === 'undefined') ? false : async;    
    xhttp.open("POST", url, isAsync);  
    if (headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhttp.setRequestHeader(key, headers[key]);
            }
        }
    }  
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(body));
}

cinnabarisland.put = function(url, body, next, headers, async) {
    var xhttp = cinnabarisland.getHTTPObject(); 
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            next(this.responseText);
        }
    };
       
    var isAsync = (typeof async === 'undefined') ? false : async;        
    xhttp.open('PUT', url, true);  
    if (headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhttp.setRequestHeader(key, headers[key]);
            }
        }
    }  
    xhttp.setRequestHeader("Content-type", "application/json");    
    xhttp.send(JSON.stringify(body));
}

/**
 * Send a DELETE Request.
 */
cinnabarisland.delete = function(url, next, headers, async) {
    var xhttp = cinnabarisland.getHTTPObject(); 
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            next(this.responseText);
        }
    };
       
    var isAsync = (typeof async === 'undefined') ? false : async;        
    xhttp.open('DELETE', url, true);  
    if (headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhttp.setRequestHeader(key, headers[key]);
            }
        }
    }  
    xhttp.send();
}

/**
 * @return a new HTTP Request object. 
 */
cinnabarisland.getHTTPObject = function () {
    if (window.XMLHttpRequest) {    
        // code for modern browsers
        return new XMLHttpRequest();
    } else {
        // code for old IE browsers
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}