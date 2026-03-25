jQuery(document).ready(function(){

    /**
     * Menu
    */
    const menuDesktop = jQuery( '.ebt-menu-main' );
    if ( menuDesktop.length > 0 ) {

        const menu = document.querySelector(".ebt-menu");
        const menuMain = menu.querySelector(".ebt-menu-main");
        const goBack = menu.querySelector(".ebt-go-back");
        const menuTrigger = document.querySelector(".ebt-mobile-menu-trigger");
        const closeMenu = menu.querySelector(".ebt-mobile-menu-close");
        let subMenu;

        menuMain.addEventListener("click", (e) =>{
            if ( !menu.classList.contains("active") ) {
                return;
            }
            if( e.target.closest(".ebt-menu-item-has-children") ) {
                const hasChildren = e.target.closest(".ebt-menu-item-has-children");
                showSubMenu(hasChildren);
            }
        });

        goBack.addEventListener("click",() =>{
            hideSubMenu();
        });

        menuTrigger.addEventListener("click",() =>{
            toggleMenu();
        });

        closeMenu.addEventListener("click",() =>{
            toggleMenu();
        });

        document.querySelector(".ebt-menu-overlay").addEventListener("click",() =>{
            toggleMenu();
        });

        function toggleMenu(){
            menu.classList.toggle("active");
            document.querySelector(".ebt-menu-overlay").classList.toggle("active");
        }

        function showSubMenu(hasChildren){
            subMenu = hasChildren.querySelector(".ebt-sub-menu");
            subMenu.classList.add("active");
            subMenu.style.animation = "slideLeft 0.5s ease forwards";
            const menuTitle = hasChildren.querySelector("i").parentNode.childNodes[0].textContent;
            menu.querySelector(".ebt-current-menu-title").innerHTML=menuTitle;
            menu.querySelector(".ebt-mobile-menu-head").classList.add("active");
        }

        function  hideSubMenu(){  
            subMenu.style.animation = "slideRight 0.5s ease forwards";
            setTimeout(() =>{
                subMenu.classList.remove("active");	
            },300); 
            menu.querySelector(".ebt-current-menu-title").innerHTML="";
            menu.querySelector(".ebt-mobile-menu-head").classList.remove("active");
        }

        window.onresize = function(){
            if( this.innerWidth > 991 ) {
                if( menu.classList.contains("active") ) {
                    toggleMenu();
                }
            }
        }

        var $target = jQuery('.ebt-header-item.ebt-item-center');
        var $target2 = jQuery('.ebt-header');

        // if ($target.length) {
        //     var offsetTop = $target.offset().top;
        //     jQuery(window).on('scroll resize', function() {
        //         var scrollTop = jQuery(window).scrollTop();
        //         var newOffsetTop = $target.offset().top;
        //         if (scrollTop > offsetTop + $target.outerHeight()) {
        //             $target.addClass('fixed-desktop');
        //         } else {
        //             $target.removeClass('fixed-desktop');
        //         }
        //     });
        // }

        if ($target2.length) {
            var offsetTop = $target2.offset().top;
            jQuery(window).on('scroll resize', function() {
                var scrollTop = jQuery(window).scrollTop();
                var newOffsetTop = $target2.offset().top;
                if (scrollTop > offsetTop + $target2.outerHeight()) {
                    $target2.addClass('fixed-desktop');
                } else {
                    $target2.removeClass('fixed-desktop');
                }
            });
        }

    }

    let footerBrand = jQuery( '.owl-footer-brand' );
    if ( footerBrand.length > 0 ) {
        jQuery( '.owl-footer-brand' ).owlCarousel({
            loop: true,
            margin: 10,
            nav: true,
            autoplay: true,
            autoplayTimeout: 3000,
            autoplayHoverPause: false,
            responsive: {
                0:{
                    items: 1
                },
                600:{
                    items: 3
                },
                1000:{
                    items: 4
                }
            }
        });
    }

    /**
     * Select
    */
    jQuery( 'body' ).on( 'change', 'select[data-attribute_name]', function(){
        let option_id = jQuery(this).attr( 'data-attribute_name' );
        let value_id = jQuery(this).find( 'option:selected' ).val();
        jQuery( '.eb-term-options[attribute="' + option_id + '"]' ).slideUp();
        jQuery( '.eb-term-options[attribute="' + option_id + '"][option="' + value_id + '"]' ).slideDown();
    });

    /**
     * Accordion
    */
    jQuery( 'body' ).on( 'click', '.eb-accordion-title', function(event){
        event.preventDefault();
        let accordion = jQuery(this).parent();
        
        if ( accordion.hasClass( 'active' ) ) {
            accordion.find( '.eb-accordtion-text' ).slideUp();
            accordion.removeClass( 'active' );
        } else {
            accordion.find( '.eb-accordtion-text' ).slideDown();
            jQuery( '.eb-accordion' ).removeClass( 'active' );
            accordion.addClass( 'active' );
        }

        jQuery( '.eb-accordion' ).not('.active').find( '.eb-accordtion-text' ).slideUp();
        
    });

    /**
     * Checkbox
    */
    jQuery('body').on( 'change', '.multiple input[type="checkbox"]', function() {
        let check = jQuery(this);
        let parent = check.parent();
        if ( check.is( ':checked') ) {
            parent.find( '.eb-quantity' ).attr( 'style', 'display: flex;' );
            parent.find( '.checkbox-label' ).attr( 'style', 'display: none;' );
            parent.find('input[type="number"]').val(1).trigger('change');
        } else {
            parent.find( '.eb-quantity' ).attr( 'style', 'display: none;' );
            parent.find( '.checkbox-label' ).attr( 'style', 'display: flex;' );
        }
    });

    /**
     * Quantity Plus
    */
    jQuery( '.eb-quantity .increment' ).on( 'click', function(event) {
        event.preventDefault();
        let input = jQuery(this).siblings( 'input' );
        let val = parseInt( input.val() ) || 1;
        input.val( val + 1 );
    });

    /**
     * Quantity Minus
    */
    jQuery( '.eb-quantity .decrement' ).on( 'click', function(event) {
        event.preventDefault();
        let parent = jQuery(this).parent().parent();
        let input = jQuery(this).siblings('input');
        let val = parseInt( input.val() ) || 1;
        if ( val > parseInt( input.attr('min' ) || 1) ) {
            let newVal = val - 1;
            input.val( newVal );
            if ( newVal === 0 ) {
                parent.find( 'input[type="checkbox"]' ).prop('checked', false ).trigger( 'change' );
            }
        }
    });

    /**
     * Filters Show/Hide
    */
   jQuery( 'body' ).on( 'click', '.eb-widget-title', function(event){
        event.preventDefault();
        jQuery(this).toggleClass( 'filter-active' );
        let widget = jQuery(this).parent();
        widget.find( '.eb-filter-content' ).slideToggle();
   });

    // jQuery( 'body' ).on( 'change', '.eb-filter-items input[type="checkbox"]', function(){
    //     jQuery( '.eb-filter-overlay' ).attr( 'style', 'display: flex;' );
    //     jQuery( '.eventobonito-filters' ).removeClass( 'eventobonito-filters-active' );
    //     jQuery( '.eb-filter-overlay-mobile' ).removeClass( 'eb-filter-overlay-mobile-active' );
    //     jQuery( '#ebFiltersForm' ).submit();
    // });

    jQuery( 'body' ).on( 'click', '.delete-filters, .eb-reset-url', function(){
        jQuery( '.eb-filter-overlay' ).attr( 'style', 'display: flex;' );
    });

    jQuery( 'body' ).on( 'click', '.apply-filters', function(){
        jQuery( '.eb-filter-overlay' ).attr( 'style', 'display: flex;' );
        jQuery( '.eventobonito-filters' ).removeClass( 'eventobonito-filters-active' );
        jQuery( '.eb-filter-overlay-mobile' ).removeClass( 'eb-filter-overlay-mobile-active' );
        jQuery( '#ebFiltersForm' ).submit();
    });

    jQuery( 'body' ).on( 'click', '.ab-filtered, .eb-filter-overlay-mobile, .eb-filters-close', function(){
        jQuery( '.eventobonito-filters' ).toggleClass( 'eventobonito-filters-active' );
        jQuery( '.eb-filter-overlay-mobile' ).toggleClass( 'eb-filter-overlay-mobile-active' );
    });

    jQuery( 'body' ).on( 'change', '.eb-addon-actions input', function(){
        let check = jQuery(this);
        if ( check.is( ':checked') ) {
            jQuery.notify( "Addon agregado al producto", {
                className: "success",
                autoHideDelay: 1000
            } );
        } else {
            jQuery.notify( "Addon removido del producto", {
                className: "success",
                autoHideDelay: 1000
            } );
        }
    });

});