// APP JS

var loginCtrl = {};

loginCtrl.login = function () {
    var body = {
        email: document.getElementById('login_email_input').value,
        password: document.getElementById('login_password_input').value
    }
    cinnabarisland.post('/api/auth', body, function (data) {
        loginCtrl.token = data.substring(1, data.length - 1);

        localStorage.setItem('SAToken', loginCtrl.token);
        linksCtrl.redirectToEmployees();
    }, null, true);
}

var linksCtrl = {};

linksCtrl.redirectToEmployees = function () {
    var headers = {
        Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken'))
    };

    cinnabarisland.get('/employees', function (data) {
        document.open();
        document.write(data);
        document.close();
    }, headers, true);
}
/**
 * CERULEANCITY JS
 * CERULEANCITY is a light JavaScript Framework for data binding and common web interfaces. Compatible with most browsers.
 * 
 * DEPENDENCIES
 * 1. palletetownJS
 * 
 * Alex Goley
 */

// VARIABLES
var ceruleancity = {}; // Initialize the ceruleancity object.

// CLASSES
class CeruleanCarousel {

    /**
     * 
     * @param { HTMLElement[] } mems - Members of the carousel. Each must share the same parent and have position set to absolute.
     * @param { number } milliseconds- Time to wait for each turn.
     * @param { Function } callback - Function to be called on each turn.
     * @param { boolean } auto - If true auto starts the carousel. Defaults to true.
     */
    constructor(mems, milliseconds, callback, auto) {
        this.members = mems;
        this.callback = callback;
        this.milliseconds = milliseconds;
        this.auto = auto;

        this.currId = 0; // currId: number
        this.paused = false; // paused: boolean
        this.originalOffsetLeft = this.members[0].offsetLeft;
        this.isRunning = false;

        var that = this;
        // Starts the carousel based on auto parameter.
        setTimeout(that.automatic(), milliseconds);

        var waitTime = (that.milliseconds * 2);
        // Handle window focus.
        window.onblur = function () { that.stop() }; // Stop on blur.
        window.onfocus = function () { setTimeout(that.automatic(), waitTime) }// Start on focus.
    }

    goTo(id) {
        this.stop();

        var currEl = this.members[this.currId];
        var targetMember = this.members[id];
        this.currId = id;
        
        targetMember.style.top = currEl.clientTop + 'px';
        targetMember.style.left = this.originalOffsetLeft + 'px';

        currEl.style.top = currEl.clientTop + 'px';
        currEl.style.left = currEl.clientWidth + 'px';
        
        this.automatic();
    }

    start() {
        if (this.isRunning) {
            return;
        } 
        if (!palletetown) {
            console.error('ceruleancity: missing dependency palletetown.js');
            return;
        }
        this.paused = false;
        this.isRunning = true;

        // Function to progress the carousel.
        var next = function () {

            var nextId = (that.currId == (that.members.length - 1)) ? 0 : (that.currId + 1);
            var currEl = that.members[that.currId];
            var nextEl = that.members[nextId];
            that.currId = nextId;

            // Position the next Element to be animated.
            nextEl.style.top = currEl.clientTop + 'px';
            nextEl.style.left = currEl.clientWidth + 'px';
            nextEl.style.display = 'inline';

            // Animate the current and next Elements.
            palletetown.move(currEl, 'left', null, 2); // Moves the current element out of its container.
            palletetown.move(nextEl, 'left', null, 2); // Moves the next element into the container.

            var me = that;
            setTimeout(function () {
                if (!me.paused) {
                    if (me.callback) me.callback(me); // Pass the object into the callback.
                    next.apply(me);
                } else {
                    me.isRunning = false;
                    return;
                }
            }, me.milliseconds);
        }

        var that = this;
        if (that.callback) that.callback(that); // Pass the object into the callback.
        next.apply(that);
    }

    stop() {
        this.paused = true;
    }

    automatic() {
        var autostart = (typeof this.auto === 'undefined') ? true : this.auto;
        var that = this;
        if (autostart) {
            // Auto start the carousel
            setTimeout(function () {
                that.start()
            }, that.milliseconds)
        }
    }
}


// FUNCTIONS
/**
 * CINNABARISLAND JS
 * CINNABARISLAND is a JavaScript Library for http calls. Compatible with most browsers.
 * 
 * Alex Goley
 */

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

    xhttp.open("POST", url, isAsync);    
    var isAsync = (typeof async === 'undefined') ? false : async;
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(body));
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
/**
 * PALLETETOWN JS
 * PallteTown is a JavaScript Library for animations. Compatible with most browsers.
 * 
 * Alex Goley
 * Kris Redding
 */
// Check Browser Version
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
var palletetown = {}; // initialize the palletetowm object.
palletetown.directions = ['up', 'down', 'left', 'right'];


// FUNCTIONS
/**
 * Moves an element relative to its container.
 * The specified element must have postition set to either relative, absolute, or fixed.
 * - Good for carousels
 * @todo add parameter for speed.
 * @param {string} identifier
 * @param {string} direction
 * @param {function} next - optional: Function to be called when done.
 * @param {number} step - optional: Step size for animation interval (controls speed).
 * @param {number} distance - optional: number of pixels to move, defualts to width or height of the parent element for horizontal or vertical movements respectively.
 * @param {number} index - optional: If a non unique identifier is passed use this as the index to use. Defualts to 0. 
 * @return {void}
 */
palletetown.move = function (identifier, direction, callback, step, distance, index) {
    var el = (identifier instanceof HTMLElement)? identifier : palletetown.getElementByIdentifier(identifier, index);
    if (!el) return;

    if (palletetown.directions.indexOf(direction) < 0) {
        console.error('palletetown: unrecognized direction %s', direction);
        return;
    }

    var stepSize = step? step: 1;

    var dist;
    if (distance) {
        if ((typeof distance) != 'number') {
            console.error('palletetown: distance must be of type number');
        }
        dist = distance;
    } else {
        dist = 0;
        // Calculate the distance neccesary to move the element off its parent.
        if (direction === 'up') dist += el.parentElement.offsetHeight;
        if (direction === 'left') dist += el.parentElement.offsetWidth;
        if (direction === 'down') dist += el.parentElement.offsetHeight;
        if (direction === 'right') dist += el.parentElement.offsetWidth;
    }

    var pos = ['up', 'down'].indexOf(direction) >= 0 ? palletetown.getElementPos(el, 'top') : palletetown.getElementPos(el, 'left');
    var id = setInterval(frame, 1);
    function frame() {
        if (dist == 0) {
            clearInterval(id);
            if (callback) callback();
        } else {
            var d = (stepSize <= dist)? stepSize : (stepSize - dist); 
            pos = (['up', 'left'].indexOf(direction) >= 0) ? pos -= d : pos += d;
            dist = (dist - stepSize);
            if (['up', 'down'].indexOf(direction) >= 0) el.style.top = pos + 'px';
            else el.style.left = pos + 'px';
        }
    }
}

palletetown.getElementPos = function (el, edge) {
    if (edge === 'top') return p = el.style.top? parseInt(el.style.top.substring(0, el.style.top.length - 2)) : 0;
    if (edge === 'left') return el.style.left? parseInt(el.style.left.substring(0, el.style.left.length - 2)) : 0;
}

/**
 * Does everything JavaScript can do to get an elememt from a string identifier and index.
 * @param {string} identifier - html id, class name, tag name, or name.
 * @return {HTMLElement}
 */
palletetown.getElementByIdentifier = function (identifier, index) {

    var e = document.getElementById(identifier);
    if (!e) e = document.getElementsByClassName(identifier)[(index || 0)];
    if (!e) e = document.getElementsByTagName(identifier)[(index || 0)];
    if (!e) console.error('palletetown: could not find an element with identifier %s and index %d', identifier, index);
    return e;
}

/**
 * Add/Remove Class based on location of Header
 * @param {number} threshold - threshold number of change vertical value
 * @param {string} identifier
 * @param {string} classname
 * @param {boolean} mobileDisable - if true will not call function is screen size is of mobile width
 */

palletetown.scrollcontrol = function(threshold, identifier, classname, mobileDisable){
    // Check if mobile width
    if(mobileDisable && window.innerWidth <= 640) return;
        
    var el = palletetown.getElementByIdentifier(identifier, 0);
    var scrollHeight = (browserChecks.isIE ? window.pageYOffset : window.scrollY);
        
    if (!el) return;

    if(scrollHeight > threshold){
        if(el.className.indexOf(classname) <= 0){
            el.className += " " + classname;
        }
    }
    else {
        if(el.className.indexOf(classname) > 0){
            el.classList.remove(classname);
        }
    }    
}
window.addEventListener('scroll', function(e) {
    palletetown.scrollcontrol(10, 'navbar-fixed-top', 'moved-header', true);
});

//var carousel = new CeruleanCarousel(document.getElementsByClassName('carousel-item'), 10000, adjust);
//carousel.start();

function adjust(me) {
    var carouselBtns = document.getElementsByClassName('carousel-btn');
    var carouselContent = document.getElementsByClassName('switch-content');

    var outgoingId = me.currId;
    var incomingId = (me.currId == (me.members.length - 1)) ? 0 : (me.currId + 1);

    carouselBtns[outgoingId].classList.remove('active-btn');
    carouselContent[outgoingId].classList.remove('active');

    carouselBtns[incomingId].classList.add('active-btn');
    carouselContent[incomingId].classList.add('active');
}

function go(id) {
    var carouselBtns = document.getElementsByClassName('carousel-btn');
    var carouselContent = document.getElementsByClassName('switch-content');
    
    for (var i = 0; i < carouselBtns.length; i++) {
        carouselBtns[i].classList.remove('active-btn');
        carouselContent[i].classList.remove('active');
    }

    carouselBtns[id].classList.add('active-btn');
    carouselContent[id].classList.add('active');

    carousel.goTo(id);
}

function directionalChange(dir){
    var carouselBtns = document.getElementsByClassName('carousel-btn');
    var activeLoc = 0;
    for (var i = 0; i < carouselBtns.length; i++) {
        if(carouselBtns[i].className.includes('active-btn')){
            activeLoc = i;
            break;
        }
    }

    var gotoLoc = 0;
    if(dir == 'next'){
        gotoLoc = (activeLoc +1 >= carouselBtns.length ? 0 : activeLoc +1);
    }
    else {
        gotoLoc = (activeLoc - 1 < 0 ? (carouselBtns.length-1) : activeLoc -1);
    }

    go(gotoLoc);

}
