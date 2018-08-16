// Initialize app and store it to myApp variable for futher access to its methods
var myApp = new Framework7({
    modalTitle: "Iwash",
    material: true,
    onAjaxStart: function(xhr){
        myApp.showIndicator();
    },
    onAjaxComplete: function(xhr){
        myApp.hideIndicator();
    }
});

// We need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var base_url = 'http://192.168.1.224/iwash';



// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page

});

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    //console.log("page init");

    var page = e.detail.page;

    if (page.name === 'home') {
        // Following code will be executed for page with data-page attribute equal to "about"
        //myApp.alert('Here comes About page');
        //console.log("home page");

        var token= $$('meta[name="token"]').attr("content");
        //console.log("this is a token",token);
       console.log("this is home");


// Pull to refresh content
        //$$(page.container).find('.page-content').append(listHTML);
        var ptrContent = $$(page.container).find('.pull-to-refresh-content');

// Add 'refresh' listener on it
        ptrContent.on('ptr:refresh', function (e) {
            // Emulate 2s loading
            setTimeout(function () {
                refreshData(page);
                // When loading done, we need to reset it
                myApp.pullToRefreshDone();
            }, 2000);
        });

        var url = "http://192.168.1.224/iwash/api/order";
        $$.ajax({
            type: "GET",
            dataType: "json",
            url: url,
            headers: {
                'Authorization': token,
            },
            success: function (data) {
                //console.log(data.data);
                var size = Object.keys(data.data).length;
                if(size == 0) {
                    $$('#signature-pad').hide();
                    $$('.infinite-scroll-preloader').hide();

                }
                else {

                    $$(page.container).find('#loader-here').hide();
                    $$('#signature-pad').hide();
                    //var listHTML = '';
                    var listHTML = '<div class = "list-block media-list">';
                    listHTML += '<ul>';
                    $$.each(data.data, function(k, v) {
                        /// do stuff
                        //console.log("data for v");
                        //console.log(v.branch_name);

                        listHTML += '<li>';
                        listHTML += '<a href="about.html?id='+ v.order_id +'" class="item-link item-content">';
                        listHTML += '<div class = "item-inner">';
                        listHTML += '<div class = "item-title-row">';
                        listHTML += '<div class = "item-title">'+v.suffix+" "+ v.fname +" "+v.mname+" "+v.lname+'</div>';
                        listHTML += '<div class="item-after">'+v.date+'</div>';
                        listHTML += '</div>';
                        listHTML += '<div class="item-subtitle"> Branch : '+ v.branch_name +'</div>';
                        listHTML += '<div class="item-text"> Service Type : '+ v.service_type+'</div>';
                        //listHTML += '<div class = "card-footer"><a href="about.html?id='+ v.order_id +'" class="link">View Details</a></div>';
                        listHTML += '</div>';
                        listHTML += '</a>';
                        listHTML += '</li>';

                        // $$(page.container).find('.page-content').append(listHTML);
                    });

                    listHTML += '</ul>';

                    $$(page.container).find('.page-content').append(listHTML);

                    $$('.infinite-scroll-preloader').hide();
                    $$('#signature-pad').hide();

                }



                // data.data.foreach(function(data){
                //     console.log(data);
                // });
            },
            error: function (error) {
                console.log("error");
                console.log(error);
            }
        });

        $$(page.container).find('.button').on('click', function () {
            //alert("hello");
            console.log("click loader");
            mainView.router.loadContent($$('#dashboard').html());

        });

        //add infinite scroll


    }
    if(page.name == 'about') {
        console.log("this is about");
        var id = page.query.id;
        var url = "http://192.168.1.224/iwash/api/order-details/"+id;
        var token= $$('meta[name="token"]').attr("content");
        $$.ajax({
            type: "GET",
            dataType: "json",
            url: url,
            headers: {
                'Authorization': token,
            },
            success: function (data) {
                //console.log(data.data);
                //var listHTML = '';
                var order_details = [];
                var delivery_fee = 0, rate = 0, total_amount = 0;
                $$.each(data.data, function(k, v) {
                    /// do stuff

                    //console.log(v.branch_name);
                    var listHTML = '<div class = "list-block cards-list">';
                    listHTML += '<ul>';
                    listHTML += '<li class = "card">';
                    listHTML += '<div class = "card-header">'+ v.suffix+" "+ v.fname +" "+v.mname+" "+v.lname+'</div>';
                    listHTML += '<div class = "card-content">';
                    listHTML += '<div class = "card-content-inner">'+"Service type: "+ v.service_type +'</div>';
                    listHTML += '</div>';
                    listHTML += '<div class = "card-footer">'+ v.date +'</div>';
                    listHTML += '</div>';
                    listHTML += '</li>';
                    listHTML += '</div>';
                    listHTML += '</ul>';
                    listHTML += '</div>';

                    $$(page.container).find('.page-content').find('#signature-display').append(listHTML);
                    order_details = v.order_details;

                    delivery_fee = v.deliveryFee;
                    rate = v.rate;
                    total_amount = v.ttlAmount;
                });


                var myList = myApp.virtualList('.list-block.virtual-list', {
                    // Array with items data
                    items: [

                    ],
                    // Template 7 template to render each item
                    template: '<li class="item-content">' +
                    '<div class="item-media"><img src="{{picture}}"></div>' +
                    '<div class="item-inner">' +
                    '<div class="item-title">{{title}}</div>' +
                    '</div>' +
                    '</li>'
                });

                $$.each(order_details, function(k, v){
                    //console.log(v.category);
                    if(v.qty == 0 ) {

                    }
                    else {
                        if(v.category == 'pants') {
                            myList.appendItem({
                                title: v.category +" : "+ v.qty,
                                picture: base_url+'/assets/img/mobile/'+v.category+'.png',
                            });
                        }
                        else if(v.category == 'underwears') {
                            myList.appendItem({
                                title: v.category +" : "+ v.qty,
                                picture: base_url+'/assets/img/mobile/'+v.category+'.png',
                            });
                        }

                        else if(v.category == 'dress') {
                            myList.appendItem({
                                title: v.category +" : "+ v.qty,
                                picture: base_url+'/assets/img/mobile/'+v.category+'.png',
                            });
                        }

                        else if(v.category == 'boxes') {
                            myList.appendItem({
                                title: v.category +" : "+ v.qty,
                                picture: base_url+'/assets/img/mobile/'+v.category+'.png',
                            });
                        }
                        else if(v.category == 'upperwears') {
                            myList.appendItem({
                                title: v.category +" : "+ v.qty,
                                picture: base_url+'/assets/img/mobile/'+v.category+'.png',
                            });
                        }
                        else {
                            myList.appendItem({
                                title: v.category +" : "+ v.qty,
                                picture: base_url+'/assets/img/mobile/shopping.png',
                            });
                        }

                    }}
                );
                // set delivery fee
                var delivery_fee_html = '<div class="list-block">'+
                                      '<ul>' +
                                        '<li class="item-content"> <div class="item-inner"> <div class="item-title"> Delivery Fee: '+delivery_fee+'</div></div>' +
                                        '<li class="item-content"> <div class="item-inner"> <div class="item-title"> Rate : '+rate+'</div></div>' +
                    '<li class="item-content"> <div class="item-inner"> <div class="item-title"> Total : '+total_amount+'</div></div>' +
                                        '</li>'+
                                      '</ul>';

                $$(page.container).find('.page-content').find('#delivery-list').append(delivery_fee_html);


            },
            error: function (error) {
                console.log("error");
                console.log(error);
            }
        });


       /* $$("#add-signature").on('click', function(){
            //alert("hello");
            myApp.popup($$(".popup"), true, true);
            //myApp.loginScreen();
        });

        $$('.open-about').on('click', function () {
            var clickedLink = this;
            myApp.popover('.popover-about', clickedLink);
        });

// Open Links popover
        $$('.open-links').on('click', function () {
            var clickedLink = this;
            myApp.popover('.popover-links', clickedLink);
        });*/

        var canvas = document.getElementById('signature-pad');

        // Adjust canvas coordinate space taking into account pixel ratio,
        // to make it look crisp on mobile devices.
        // This also causes canvas to be cleared.
        function resizeCanvas() {
            // When zoomed out to less than 100%, for some very strange reason,
            // some browsers report devicePixelRatio as less than 1
            // and only part of the canvas is cleared then.
            var ratio =  Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
        }

        window.onresize = resizeCanvas;
        resizeCanvas();

        var signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)' // necessary for saving image as JPEG; can be removed is only saving as PNG or SVG
        });



        document.getElementById('save-jpeg').addEventListener('click', function () {
            if (signaturePad.isEmpty()) {
                //return alert("Please provide a signature first.");
                myApp.alert('Please provide a signature first.');
                return null;
            }

            var data = signaturePad.toDataURL('image/jpeg');
            //console.log("the id");
            //console.log(id);
            //console.log(data);

            myApp.confirm('Are you sure?', function () {
                //myApp.alert('You clicked Ok button');
                update_order_details(id, data);
                console.log("this is data");
                console.log(data);
            });


            //window.open(data);
        });


        document.getElementById('clear').addEventListener('click', function () {
            signaturePad.clear();
        });

        document.getElementById('back').addEventListener('click', function(){
            mainView.router.loadContent($$('#dashboard').html());
            //myApp.closeModal($$(".popup"),true);
        });




    }
    if(page.name == 'index'){
        //alert("hello index");
        console.log("index");
    }
});

function update_order_details(id, signature)
{
    var url = "http://192.168.1.224/iwash/api/order-details";
    var token= $$('meta[name="token"]').attr("content");
    //console.log("this is signature");
    //console.log(signature);
    var data = { order_id: id, signature: signature};
    $$.ajax({
        type: "POST",
        dataType: "json",
        url: url,
        headers: {
            'Authorization': token,
        },
        data: data,
        success: function (data) {
            //console.log(data);
            //console.log("token");
            //console.log(data.data.token);
            //myApp.alert('Success fully updated.');
            mainView.router.loadContent($$('#dashboard').html());

        },
        error: function (error) {
            console.log(error);

        }
    });
}

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //myApp.alert('Here comes About page');
});

$$('#login').on('click', function(){

    var username = $$('.login-screen input[name = "username"]').val();
    var password = $$('.login-screen input[name = "password"]').val();

    //alert(uname+pwd);
    //console.log("this data "+uname+pwd);

    var data = {"username": username, "password": password };

    //myApp.closeModal('.login-screen',true);
    //mainView.router.loadContent($$('#dashboard').html());
    $$.ajax({
        type: "POST",
        dataType: "json",
        url: "http://192.168.1.224/iwash/api/login",
        data: data,
        success: function (data) {
            //console.log(data);
            //console.log("token");
            //console.log(data.data.token);
            //app.addView('.view-main');


            $$('meta[name="token"]').attr("content", data.data.token);
            //var meta = $$('meta[name="token"]').attr("content");
            //console.log(meta);

            myApp.closeModal('.login-screen',true);
            mainView.router.loadContent($$('#dashboard').html());

        },
        error: function (error) {
            //console.log(error);
            var response_message = "";
            var message = JSON.parse(error.responseText);
            //console.log(message);
            // if(typeof message.error.username !== undefined) {
            if (typeof(message.error) != "undefined"){
                var username_error = (message.error.username) ? message.error.username : "";
                var password_error = (message.error.password) ? message.error.password : "";
                response_message = username_error +" "+ password_error;
            }
            else {
                response_message = message.message;
            }
            myApp.alert(response_message);
        }
    });



});

$$('.form-to-data').on('click', function(){
    var formData = myApp.formToData('#my-form');
    var username = formData.username;
    var password = formData.password;
    var data = {"username": username, "password": password };
    //console.log("meta data");
    //var meta = $$('meta[name="token"]').attr("content");
    //console.log(meta);
    //alert(data);



     $$.ajax({
        type: "POST",
        dataType: "json",
        url: "http://192.168.1.224/iwash/api/login",
        data: data,
        success: function (data) {
           //console.log(data);
           //console.log("token");
           //console.log(data.data.token);
              //app.addView('.view-main');


            $$('meta[name="token"]').attr("content", data.data.token);
            //var meta = $$('meta[name="token"]').attr("content");
            //console.log(meta);


            mainView.router.loadContent($$('#dashboard').html());

        },
        error: function (error) {
             //console.log(error);
             var response_message = "";
             var message = JSON.parse(error.responseText);
            //console.log(message);
           // if(typeof message.error.username !== undefined) {
          if (typeof(message.error) != "undefined"){
                 var username_error = (message.error.username) ? message.error.username : "";
                   var password_error = (message.error.password) ? message.error.password : "";
                   response_message = username_error +" "+ password_error;
            }
            else {
                 response_message = message.message;
            }
             myApp.alert(response_message, "Iwash", function () {
                //app.closeModal('.login-screen');
             });
        }
    });
});


function refreshData(page)
{
    var url = "http://192.168.1.224/iwash/api/order";
    var token= $$('meta[name="token"]').attr("content");
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {
            //console.log(data.data);

            //$$(page.container).find('.page-content').find('.list-block media-list').empty();


                $$(page.container).find('.page-content').find('ul').empty();

                //var listHTML = '';
                var listHTML = '<div class = "list-block media-list">';
                listHTML += '<ul>';
                $$.each(data.data, function(k, v) {
                    /// do stuff
                    //console.log("data for v");
                    //console.log(v.branch_name);

                    listHTML += '<li>';
                    listHTML += '<a href="about.html?id='+ v.order_id +'" class="item-link item-content">';
                    listHTML += '<div class = "item-inner">';
                    listHTML += '<div class = "item-title-row">';
                    listHTML += '<div class = "item-title">'+v.suffix+" "+ v.fname +" "+v.mname+" "+v.lname+'</div>';
                    listHTML += '<div class="item-after">'+v.date+'</div>';
                    listHTML += '</div>';
                    listHTML += '<div class="item-subtitle"> Branch : '+ v.branch_name +'</div>';
                    listHTML += '<div class="item-text"> Service Type : '+ v.service_type+'</div>';
                    //listHTML += '<div class = "card-footer"><a href="about.html?id='+ v.order_id +'" class="link">View Details</a></div>';
                    listHTML += '</div>';
                    listHTML += '</a>';
                    listHTML += '</li>';

                   //$$(page.container).find('.page-content').append(listHTML);
                });

                listHTML += '</ul>';

                $$(page.container).find('.page-content').append(listHTML);

                $$('.infinite-scroll-preloader').hide();
                $$('#signature-pad').hide();




            // data.data.foreach(function(data){
            //     console.log(data);
            // });
        },
        error: function (error) {
            console.log("error");
            console.log(error);
        }
    });


}

