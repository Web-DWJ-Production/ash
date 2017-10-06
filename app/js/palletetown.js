/**
 * PALLETETOWN JS
 * PallteTown is a JavaScript Library for animations. Compatible with most browsers.
 * 
 * Alex Goley
 */

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
 * @param {number} distance - optional: number of pixels to move, defualts to width or height of the parent element for horizontal or vertical movements respectively.
 * @param {number} index - optional: If a non unique identifier is passed use this as the index to use. Defualts to 0. 
 * @return {void}
 */
palletetown.move = function (identifier, direction, next, distance, index) {

    var el = palletetown.getElementByIdentifier(identifier, index);
    if (!el) return;

    if (palletetown.directions.indexOf(direction) < 0) {
        console.error('palletetown: unrecognized direction %s', direction);
        return;
    }

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

    console.log("dist: %s", dist);

    var pos = ['up', 'down'].indexOf(direction) >= 0 ? palletetown.getElementPos(el, 'top') : palletetown.getElementPos(el, 'left');
    var id = setInterval(frame, 5);
    function frame() {
        if (dist == 0) {
            clearInterval(id);
        } else {
            pos = (['up', 'left'].indexOf(direction) >= 0) ? pos -= 1 : pos += 1;
            dist--;
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
    if (!e) onsole.error('palletetown: could not find an element with identifier %s and index %d', identifier, index);
    return e;
}

/**
 * Add/Remove Class based on location of Header
 * @param {number} threshold - threshold number of change vertical value
 * @param {string} identifier
 * @param {string} classname
 */

palletetown.scrollcontrol = function(threshold, identifier, classname){

    var el = palletetown.getElementByIdentifier(identifier, 0);
    var scrollHeight = event.currentTarget.scrollY;
    if (!el) return;

    if(scrollHeight > threshold){
        if(!el.className.includes(classname)){
            el.className += " " + classname;
        }
    }
    else {
        if(el.className.includes(classname)){
            el.classList.remove(classname);
        }
    }
}