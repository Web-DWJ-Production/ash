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