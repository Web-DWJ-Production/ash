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
