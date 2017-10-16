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