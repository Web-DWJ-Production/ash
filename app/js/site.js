var defaultEmail = 'info@strategic-analytix.com';
/* Home Page */
window.addEventListener('scroll', function(e) {
    palletetown.scrollcontrol(10, 'navbar-fixed-top', 'moved-header', true);    
});

var carousel = null;
var homeCarousel = document.getElementsByClassName('ceruleanCarousel');
if(homeCarousel != null && homeCarousel.length > 0){
    setCarousel();
    var carouselHeight = homeCarousel[0].clientHeight;
    var hideLoc = carouselHeight - (window.innerHeight * .70) - 44;
    window.addEventListener('scroll', function(e) {
        palletetown.scrollcontrol(hideLoc, 'scroll-anchor', 'hide-direction', false);    
    });    
}

/* Careers Page */
var carCtrl = carCtrl ? carCtrl : new CareersCtrl();
var jobList = new List('jobs', carCtrl.options, carCtrl.values);

/* Employees Page */
if(document.getElementsByClassName('employees-body') != null && document.getElementsByClassName('employees-body').length > 0){
    var eCtrl = ((document.getElementsByClassName('employees-body') != null && document.getElementsByClassName('employees-body').length > 0)|| !eCtrl) ? new EmployeesCtrl() : eCtrl;
    var user = JSON.parse(localStorage.getItem('SAUser'));
}


/* Email Form */
function EmailSend(formName){
    var formData = $('#'+formName).serializeArray();
    var errMsg = ValidateForm(formData);

    if(errMsg == ''){
        // Build Object
        var email = BuildForm(formData);
        cinnabarisland.post('/api/mail', email, function (data) {
            alert('Thank you for reaching out to use we will get back to you soon.');

            // Send Confirmation Email
            email.text ='Message Set To: ' + email.to +' (' + email.text +')';
            email.to = email.from;
            cinnabarisland.post('/api/mail', email, function (data) {
                // clear form
                document.getElementById(formName).reset();
            }, null, true);
            
        }, null, true);
    }
    else {
        alert('Unable to submit form:\n' + errMsg);
    }    
}

function ValidateForm(formData) {
    var msg = '';
    var emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    for(var i =0; i < formData.length; i++){
        var inputStg = null;
        if(formData[i].value == null || formData[i].value.length == 0){
            switch(formData[i].name){
                case 'msgName':
                    inputStg = "Name";
                    break;
                case 'msgEmail':
                    inputStg = "Email Address";                
                    break;
                case 'msgSubject':                
                    inputStg = "Subject";
                    break;
                case 'msgMessage':                
                    inputStg = "Message";
                    break;
                default:
                    break;
            } 
            msg += (msg.length > 0 ? '\n' : '') +"- Please enter a proper " + inputStg +" ";       
        }
        else if(formData[i].name == 'msgEmail' && !emailRegEx.test(formData[i].value)) {
            msg += (msg.length > 0 ? '\n' : '') +"- Please enter a valid Email Address (ex. 'test@testmail.com')";
        }
    }
    return msg;
}

function BuildForm(formData){
    var mailObj = { to:defaultEmail, subject:'', text:'', html:'', from:'' };
    var subjectInfo = '';
    for(var i =0; i < formData.length; i++){                
        switch(formData[i].name){
            case 'msgName':
                subjectInfo += (subjectInfo.length > 0 ? ', ' : '') +'Name: ' + formData[i].value;
                break;
            case 'msgEmail':
                mailObj.from = formData[i].value;
                subjectInfo += (subjectInfo.length > 0 ? ', ' : '') +'Email: ' + formData[i].value;          
                break;
            case 'msgSubject':                
                mailObj.subject = formData[i].value;
                break;
            case 'msgMessage':                
                mailObj.text = formData[i].value;
                break;
            default:
                break;
        }                         
    }
    mailObj.text += '\n\n' + subjectInfo;

    return mailObj;
}

/* Private Methods */
/* Employee */
function onAdminClick() {
    eCtrl.adminIf.viewable = true;
    eCtrl.homeIf.viewable = false;
    eCtrl.adminIf.reconcile();
    eCtrl.homeIf.reconcile();
    window.scroll(0, 0);
    if (!eCtrl.users) eCtrl.getUsers();
    eCtrl.usrAdminIf.viewable = user.admin;
    eCtrl.usrAdminIf.reconcile();
    eCtrl.usrCardIf.viewable = !user.admin;
    eCtrl.usrCardIf.reconcile();

    if (!user.admin) {
        eCtrl.usrCardBind.obj = user;
        eCtrl.usrCardBind.reconcile();
    }

}


function onHomeClick() {
    eCtrl.adminIf.viewable = false;
    eCtrl.homeIf.viewable = true;
    eCtrl.adminIf.reconcile();
    eCtrl.homeIf.reconcile();
    window.scroll(0, 0);
}

function onAddAccount() {
    eCtrl.newUserIf.viewable = true;
    eCtrl.newUserIf.reconcile();
}

function onCancelAccount() {
    eCtrl.newUserIf.viewable = false;
    eCtrl.newUserIf.reconcile();
}

function onNewAdminClick(event) {
    var e = document.getElementById('new-acc-admin');
    eCtrl.newAccount.admin = !eCtrl.newAccount.admin;
    if (eCtrl.newAccount.admin) {
        e.innerHTML = '&#xE834;';
    } else {
        e.innerHTML = '&#xE835;';
    }
}

function onSaveClick() {
    eCtrl.newAccount.email = document.getElementById('new-acc-email').value;
    eCtrl.newAccount.password = document.getElementById('new-acc-password').value;
    eCtrl.postUser();
}

function onDeleteClick(email) {
    var r = confirm("Are you sure you want to delete " + email + "?");
    if (r == true) {
        eCtrl.deleteUser(email);
    }
}

function onUpdateAdminClick(email, admin, el) {
    var b = !JSON.parse(admin);
    eCtrl.updateUser(email, null, b);
}

function onResetPwdClick(email, el) {
    var cols = el.parentNode.parentNode.childNodes;
    for (var i = 0; i < cols.length; i++) {
        if (cols[i].classList && cols[i].classList.contains('hide-on-reset')) {
            cols[i].style.display = 'none';
        } else if (cols[i].classList && cols[i].classList.contains('show-on-reset')) {
            cols[i].style.display = 'inline-block';
        }
    }
}

function onCancelReset(el) {
    var cols = el.parentNode.parentNode.childNodes;
    for (var i = 0; i < cols.length; i++) {
        if (cols[i].classList && cols[i].classList.contains('hide-on-reset')) {
            cols[i].style.display = 'inline-block';
        } else if (cols[i].classList && cols[i].classList.contains('show-on-reset')) {
            cols[i].style.display = 'none';
        }
    }
}

function onSaveReset(email, el) {
    var cols = el.parentNode.parentNode.childNodes;
    var newpass, repeatpass;

    for (var i = 0; i < cols.length; i++) {
        if (cols[i].classList && cols[i].classList.contains('new-pwd-col-1')) {
            newpass = cols[i].childNodes[1].value;
        }
        if (cols[i].classList && cols[i].classList.contains('new-pwd-col-2')) {
            repeatpass = cols[i].childNodes[1].value;
        }
    }

    if (newpass == null || newpass == '') {
        alert('Password reset failed: passwords must not be empty.');
        return;
    }

    if (newpass != repeatpass) {
        alert('Password reset failed: passwords must match.');
        return;
    }

    eCtrl.updateUser(email, newpass, null);
}

function onNonAdminResetPwd(email, el) {
    var cols = el.parentNode.parentNode.childNodes;
    for (var i = 0; i < cols.length; i++) {
        if (cols[i].classList && cols[i].classList.contains('hide-on-reset')) {
            cols[i].style.display = 'none';
        } else if (cols[i].classList && cols[i].classList.contains('show-on-reset')) {
            cols[i].style.display = 'inline';
        }
    }
}

function onNonAdminCancelReset(el) {
    var cols = el.parentNode.parentNode.childNodes;
    for (var i = 0; i < cols.length; i++) {
        if (cols[i].classList && cols[i].classList.contains('hide-on-reset')) {
            cols[i].style.display = 'inline';
        } else if (cols[i].classList && cols[i].classList.contains('show-on-reset')) {
            cols[i].style.display = 'none';
        }
    }
}

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

/* Careers */
function onCareerInfoClick(elem){
    // Get id
    var id = $(elem).attr("data-id");
    
    carCtrl.positionContact.viewable = false;
    carCtrl.positions.viewable = false;
    carCtrl.info.viewable = true;

    carCtrl.positionContact.reconcile();
    carCtrl.positions.reconcile();
    carCtrl.info.reconcile();

    window.scroll(0, 0);
    carCtrl.getPosition(id);
}

function ReturnAllCareers() {
    carCtrl.positions.viewable = true;
    carCtrl.info.viewable = false;
    carCtrl.positionContact.viewable = false;
    
    carCtrl.positions.reconcile();
    carCtrl.info.reconcile();
    carCtrl.positionContact.reconcile();

    window.scroll(0, 0);
}

function PositionContact(){
    carCtrl.positionContact.viewable = true;
    carCtrl.positions.viewable = false;
    carCtrl.info.viewable = false;
    
    carCtrl.positionContact.reconcile();
    carCtrl.positions.reconcile();
    carCtrl.info.reconcile();

    window.scroll(0, 0);
    carCtrl.bindPositionContact();
}
function ReturnPosition(){
    carCtrl.positionContact.viewable = false;
    carCtrl.positions.viewable = false;
    carCtrl.info.viewable = true;

    carCtrl.positionContact.reconcile();
    carCtrl.positions.reconcile();
    carCtrl.info.reconcile();

    window.scroll(0, 0);
}

function setCarousel(){
    carousel = new CeruleanCarousel(document.getElementsByClassName('carousel-item'), 15000, adjust);    
}

function adjust(me) {
    if(homeCarousel != null && homeCarousel.length > 0){
        var carouselBtns = document.getElementsByClassName('carousel-btn');
        var carouselContent = document.getElementsByClassName('switch-content');

        var outgoingId = me.currId;
        var incomingId = (me.currId == (me.members.length - 1)) ? 0 : (me.currId + 1);

        carouselBtns[outgoingId].classList.remove('active-btn');
        carouselContent[outgoingId].classList.remove('active');

        carouselBtns[incomingId].classList.add('active-btn');
        carouselContent[incomingId].classList.add('active');   
    }
    else {
        carousel = null;
    }
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
