(function() {
    $(window).on( "load", function(){
        console.log('loaded')
    });
})();
(function() {
    function addValues(a, b) {
        return a+b;
    }

    $(window).on( "load", function(){
        console.log(addValues(2,4));
    });

})();
