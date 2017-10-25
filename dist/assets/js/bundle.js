// APP JS

var loginCtrl = {};

loginCtrl.login = function () {

    function parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };

    var body = {
        email: document.getElementById('login_email_input').value,
        password: document.getElementById('login_password_input').value
    }

    cinnabarisland.post('/api/auth', body, function (data) {
        loginCtrl.token = data.substring(1, data.length - 1);

        loginCtrl.user = parseJwt(loginCtrl.token);
        localStorage.setItem('SAUser', JSON.stringify(loginCtrl.user));
        localStorage.setItem('SAToken', loginCtrl.token);
        linksCtrl.redirectToEmployees();
    }, null, true);
}

var linksCtrl = {};

linksCtrl.redirectToEmployees = function () {
    var headers = {
        Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken')),
        ContentType: 'application/json'
    };

    cinnabarisland.get('/employees', function (data) {
        document.open();
        document.write(data);
        document.close();
    }, headers, true);
}


function EmployeesCtrl() {
    this.adminIf = new SparkIf(document.getElementById('employees-admin-component'), false);
    this.usrAdminIf = new SparkIf(document.getElementById('admin-usr-table'), false);
    this.usrCardIf = new SparkIf(document.getElementById('user-card'), false);
    this.homeIf = new SparkIf(document.getElementById('employees-home-component'), true);
    this.newUserIf = new SparkIf(document.getElementsByClassName('new-user-row')[0], false);
    this.users = null;
    this.usersFor = new SkFor(document.getElementById('users-template'), null, null);
    this.newAccount = { email: null, password: null, admin: false};
    this.usrCardBind = new SkBind(document.getElementById('user-card'), null);

    this.updateUser = function (email, password, admin, el) {
        var headers = {
            Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken'))
        };

        var that = this;
        var body = { email: email, password: password, admin: admin };
        cinnabarisland.put('/api/users/' + email, body, function (data) {
            that.getUsers();
            alert(email + " has been succesfully updated.")
        }, headers, true);
    }

    this.deleteUser = function (email) {
        var headers = {
            Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken'))
        };

        var that = this;
        cinnabarisland.delete('/api/users/' + email, function (data) {
            that.getUsers();
        }, headers, true);
    }

    this.postUser = function () {
        var headers = {
            Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken')),
            ContentType: 'application/json'
        };

        var that = this;
        var body = {
            email: this.newAccount.email,
            password: this.newAccount.password,
            admin: this.newAccount.admin
        }

        cinnabarisland.post('/api/users', body, function (data) { 
            that.getUsers();
            document.getElementById('new-acc-email').value = "";
            document.getElementById('new-acc-password').value = "";
            that.newAccount.admin = false;
            document.getElementById('new-acc-admin').innerHTML = "&#xE835;";
            that.newUserIf.viewable = false;
            that.newUserIf.reconcile();
        }, headers, true);
    }

    this.getUsers = function() {
        var headers = {
            Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken'))
        };

        var that = this;
        cinnabarisland.get('/api/users', function (data) {
            var json = JSON.parse(data);
            var temp = document.getElementById('users-template');
            var cln = temp.cloneNode(true);

            that.usersFor.arr = json;
            that.usersFor.reconcile();

        }, headers, true);
    }

    // INIT
}

function CareersCtrl() {
    this.options = {
        valueNames: ['id','title','category','skillLevel','description','capabilities','qualifications'],
        item:'<li><div class="position-container"><div class="position-section position-icon"></div><div class="position-section position-info"><div class="position-row"><span class="title"></span></div><div class="position-row flex-row"><div class="category"></div><div>Full-time</div><div class="position-skill">Skill Level: <span class="skillLevel"></span></div></div></div><div class="position-section position-details"><a href="" class="cir-btn"><span>More Information</span></a></div></div></li>'
    }
    this.values = [
        {
            id: 1,
            title:'Test Job Manager',
            category: 'Mangement',
            skillLevel:0,
            description:' This is a test Description',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        },
        {
            id: 2,
            title:'Test Job Manager',
            category: 'Mangement',
            skillLevel:1,
            description:' This is a test Description Job 1',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        },
        {
            id: 3,
            title:'Test Job Employee',
            category: 'Employee',
            skillLevel: 0,
            description:' This is a test Description Job 2',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        },
        {
            id: 4,
            title:'Test Job Employee',
            category: 'Employee',
            skillLevel: 1,
            description:' This is a test Description Job 2',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        },
        {
            id: 5,
            title:'Test Job Employee',
            category: 'Employee',
            skillLevel: 2,
            description:' This is a test Description Job 2',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        },
        {
            id: 6,
            title:'Test Job Engineer',
            category: 'Engineering',
            skillLevel: 2,
            description:' This is a test Description Job 2',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        }
    ];

    //this.jobList = new List('jobs', this.options, this.values);
    // INIT 
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
/**
 * 
 * @param { HTMLElement[] } mems - Members of the carousel. Each must share the same parent and have position set to absolute.
 * @param { number } milliseconds- Time to wait for each turn.
 * @param { Function } callback - Function to be called on each turn.
 * @param { boolean } auto - If true auto starts the carousel. Defaults to true.
 */
function CeruleanCarousel(mems, milliseconds, callback, auto) {
    this.members = mems;
    this.callback = callback;
    this.milliseconds = milliseconds;
    this.auto = auto;

    this.currId = 0; // currId: number
    this.originalOffsetLeft = this.members[0].offsetLeft;
    this.isRunning = false;

    // CAROUSEL FUNCTIONS
    this.start = function () {
        if (this.isRunning || this.blurred) {
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

            if (that.paused || that.blurred) return; // Exit first if paused.

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
                if (!me.paused && !me.blurred) {
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

    this.stop = function () {
        this.paused = true;
    }

    this.automatic = function () {
        var autostart = (typeof this.auto === 'undefined') ? true : this.auto;
        var that = this;
        if (autostart && !that.blurred) {
            // Auto start the carousel
            var me = that;
            setTimeout(function () {
                if (!me.blurred) {
                    that.start();
                }
            }, that.milliseconds)
        }
    }

    this.goTo = function (id, callback) {
        if (this.currId === id) return;

        var currEl = this.members[this.currId];
        var targetMember = this.members[id];

        // Don't do anything if the current element is moving.
        var x1 = currEl.style.left;
        var that = this;
        setTimeout(function () {
            var x2 = currEl.style.left;

            if (x1 != x2) {
                return;
            } else {
                that.stop();

                that.currId = id;

                targetMember.style.top = currEl.clientTop + 'px';
                targetMember.style.left = that.originalOffsetLeft + 'px';

                currEl.style.top = currEl.clientTop + 'px';
                currEl.style.left = currEl.clientWidth + 'px';

                callback(id);
                if (!that.blurred) {
                    that.automatic();
                }
            }
        }, 10);
    }

    // CAROUSEL ON INIT
    this.paused = (typeof this.auto === 'undefined') ? false : this.auto;
    var that = this;
    // Starts the carousel based on auto parameter.
    setTimeout(that.automatic(), that.milliseconds);

    var waitTime = (that.milliseconds * 2);
    // Handle window focus.
    window.onblur = function () { that.blurred = true; that.paused = true; }; // Stop on blur.
    window.onfocus = function () { that.blurred = false; that.automatic(); }; // Start on focus.
}

/**
 * 
 * @param { HTMLElement } element 
 * @param { boolean } viewable 
 */
function SparkIf(element, viewable) {
    this.element = element;
    this.viewable = viewable;
    this.display = this.element.style.display ? this.element.style.display : 'inline';

    this.hide = function () {
        this.viewable = false;
        this.element.style.display = 'none';
    }

    this.show = function () {
        this.viewable = true;
        this.element.style.display = this.display;
    }

    this.reconcile = function () {
        if (this.viewable) {
            this.show();
        } else {
            this.hide();
        }
    }

    // init
    this.reconcile();
}

function SkFor(element, arr, name) {
    this.parent = element.parentNode;
    this.element = element;
    this.arr = arr;

    this.reconcile = function () {
        var clone = this.element.cloneNode(true);

        while (this.parent.firstChild) {
            this.parent.removeChild(this.parent.firstChild);
        }

        if (!this.arr) return;

        for (var i = 0; i < this.arr.length; i++) {
            var currNode = clone.cloneNode(clone);
            ceruleancity.fillNode(currNode, this.arr[i], name)
            this.parent.appendChild(currNode);
        }
    }
}

function SkBind(element, obj) {
    this.parent = element.parentNode;
    this.element = element;
    this.obj = obj;

    this.reconcile = function () {
        var clone = this.element.cloneNode(true);

        while (this.parent.firstChild) {
            this.parent.removeChild(this.parent.firstChild);
        }
        
        ceruleancity.fillNode(clone, this.obj, name);
        this.parent.appendChild(clone);
    }
}


// FUNCTIONS

ceruleancity.fillNode = function (template, data, name) {
    var finalHTML = template.innerHTML;

    if (typeof data === 'object') {

        for (var f in data) {
            finalHTML = ceruleancity.insert(finalHTML, f, data[f]);
        }
    }
    template.innerHTML = finalHTML;
}

ceruleancity.insert = function (html, name, value) {
    var res = html;

    if (typeof value === 'boolean') {
        var start = html.indexOf('{{if ' + name);
        var end = html.substring(start).indexOf('}}') + 2;
        var target = html.substring(start, (start + end));
        var insert;
        var matchStart;
        var matchEnd

        if (value) {
            matchStart = target.indexOf('(+') + 2;
            matchEnd = target.indexOf('+)');
            insert = target.substring(matchStart, matchEnd);
        } else {
            matchStart = target.indexOf('(-') + 2;
            matchEnd = target.indexOf('-)');
            insert = target.substring(matchStart, matchEnd);
        }

        res = html.substring(0, start) + insert + html.substring((start + end));
    }

    var regex = new RegExp("\{\{" + name + "\}\}", 'g');
    res = res.replace(regex, value);

    return res;
}
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
var carCtrl = carCtrl ? carCtrl : new CareersCtrl();
var jobList = new List('jobs', carCtrl.options, carCtrl.values);

window.addEventListener('scroll', function(e) {
    palletetown.scrollcontrol(10, 'navbar-fixed-top', 'moved-header', true);
});

var carousel = null;
if(document.getElementsByClassName('ceruleanCarousel') != null && document.getElementsByClassName('ceruleanCarousel').length > 0){
    setCarousel();
}

function setCarousel(){
    carousel = new CeruleanCarousel(document.getElementsByClassName('carousel-item'), 10000, adjust);    
}

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
    carousel.goTo(id, function(){
        var carouselBtns = document.getElementsByClassName('carousel-btn');
        var carouselContent = document.getElementsByClassName('switch-content');
        
        for (var i = 0; i < carouselBtns.length; i++) {
            carouselBtns[i].classList.remove('active-btn');
            carouselContent[i].classList.remove('active');
        }
    
        carouselBtns[id].classList.add('active-btn');
        carouselContent[id].classList.add('active');
    });
}

function directionalChange(dir){
    var carouselBtns = document.getElementsByClassName('carousel-btn');
    var activeLoc = 0;
    for (var i = 0; i < carouselBtns.length; i++) {
        if(carouselBtns[i].className.indexOf('active-btn') >= 0){
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
