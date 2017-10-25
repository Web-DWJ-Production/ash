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



/* Private Methods */
function onCareerInfoClick(elem){
    // Get id
    var id = $(elem).attr("data-id");
    
    carCtrl.positions.viewable = false;
    carCtrl.info.viewable = true;
    carCtrl.positions.reconcile();
    carCtrl.info.reconcile();

    window.scroll(0, 0);
    carCtrl.getPosition(id);
}

function ReturnAllCareers() {
    carCtrl.positions.viewable = true;
    carCtrl.info.viewable = false;
    
    carCtrl.positions.reconcile();
    carCtrl.info.reconcile();

    window.scroll(0, 0);
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
