// Initialize app and store it to myApp variable for futher access to its methods

var myApp = new Framework7({
    modalTitle: "Iwash",
    material: true,
    dynamicNavbar: true,
    onAjaxStart: function(xhr){
        myApp.showIndicator();
    },
    onAjaxComplete: function(xhr){
        myApp.hideIndicator();
    }
});

var options = {};

// We need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

//var base_url = 'http://192.168.84.2/iwash';

// var  base_url = "http://192.168.1.44/iwash/";

var  base_url = "http://192.168.1.224/iwash/";

// var  base_url = "http://192.168.1.90/project/iwash/";

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

        checkConnection();

        // Following code will be executed for page with data-page attribute equal to "about"
        //myApp.alert('Here comes About page');
        //console.log("home page");

        setUpDate(page.name, '#calendar-from', '#calendar-to');

        var token= $$('meta[name="token"]').attr("content");
        var groupName= $$('meta[name="user_group"]').attr("content");
        //console.log("this is a token",token);
       console.log("this is home");
       var from_date = "";
       var to_date = "";
       var date = "";
       var data_date = [];

        var calendarFrom = myApp.calendar({
            input: '#calendar-from',
            dateFormat: 'M dd yyyy',
            onClose: function(){

                if(typeof(calendarFrom.value) != "undefined")
                {
                    var from_day = calendarFrom.value[0].getDate();
                    var from_month = calendarFrom.value[0].getMonth() + 1;
                    var from_year = calendarFrom.value[0].getFullYear();
                    from_date = from_year+"-"+from_month+"-"+from_day;
                    date = from_date+":"+to_date;
                    console.log("from date");
                    console.log(date);

                    localStorage.setItem(page.name, date);
                    getOrderDate(page, date,4);
                }
                else {
                    console.log("not null");
                }
                //getOrderDate(data);
            }
        });

        var calendarTo = myApp.calendar({
            input: '#calendar-to',
            dateFormat: 'M dd yyyy',
            onClose: function(){
                if(typeof(calendarTo.value) != "undefined")
                {
                    var to_day = calendarTo.value[0].getDate();
                    var to_month = calendarTo.value[0].getMonth() + 1;
                    var to_year = calendarTo.value[0].getFullYear();
                    to_date = to_year+"-"+to_month+"-"+to_day;
                    date = from_date+":"+to_date;
                    console.log("to date");
                    console.log(date);

                    localStorage.setItem(page.name, date);
                    getOrderDate(page, date, 4);
                }
                else {
                    console.log("empty this");
                }
            }
        });


// Pull to refresh content
        //$$(page.container).find('.page-content').append(listHTML);
        //var ptrContent = $$(page.container).find('.pull-to-refresh-content');
        var ptrContent = $$(page.container).find('.pull-to-refresh-content');
        //$$(page.container).find('.page-content').find('.list-block').append(listHTML);

// Add 'refresh' listener on it
        ptrContent.on('ptr:refresh', function (e) {
            // Emulate 2s loading
            setTimeout(function () {

                refreshData(date, page, 4);
                // When loading done, we need to reset it
                myApp.pullToRefreshDone();
            }, 2000);
        });

        $$('#signature-pad').hide();
        $$('.infinite-scroll-preloader').hide();

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) {
            dd = '0'+dd
        }
        if(mm<10) {
            mm = '0'+mm
        }
        today = yyyy+"-"+mm+"-"+dd;
        var date = today+":"+today;

        var date_local = localStorage.getItem(page.name);
        if(date_local == null) {
            getOrderDate(page, date, 4);
        }
        else {
            getOrderDate(page, date_local, 4);

        }

        //add infinite scroll
        $$(page.container).find('#id-reset').on('click', function(){
            //mainView.router.loadContent($$('#dashboard').html());
            console.log("reset data");
            localStorage.removeItem(page.name)
            setUpDate(page.name, '#calendar-from', '#calendar-to');
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();
            if(dd<10) {
                dd = '0'+dd
            }
            if(mm<10) {
                mm = '0'+mm
            }
            today = yyyy+"-"+mm+"-"+dd;
            date = today+":"+today;

            // $$('#calendar-from').val("");
            // $$('#calendar-to').val("");
            getOrderDate(page, date, 4);
            //resetData(page, token);

        });

        if(groupName === 'Delivery') {
            $$('#span-persons').hide();
            $$('#span-order').hide();
        }

        $$(document).on('click', '#id-add-customer', function(){
            console.log("add customer");
            mainView.router.loadContent($$('#id-customer-page').html());
        });
        $$(document).on('click', '#id-home', function(){
            mainView.router.loadContent($$('#dashboard').html());


        });

        //PLEASE MODIFY ME AFTER LIST ORDER
        $$(document).on('click', '#id-order-list',function(){
            //console.log("order list");
            mainView.router.loadContent($$('#id-page-order-list').html());

            //mainView.router.loadContent($$('#id-add-order-page').html());
        });

        $$(document).on('click','#id-logout', function(e){

            if(e.handled !== true) // This will prevent event triggering more then once
            {
                console.log("logout");
                myApp.confirm('Are you sure you want to logout?','<span class="icon bg-blue"><i class="material-icons">lock</i></span>Confirm Logout', function () {
                    navigator.app.exitApp();
                });
                e.handled = true;

            }

        });
    }

    if(page.name == 'customer-page') {
        console.log("this is customer page");
        var ptrContent = $$('.pull-to-refresh-content');
        getCustomer(ptrContent);
        // Pull to refresh content
        //var ptrContent = $$('.pull-to-refresh-content');

        // Add 'refresh' listener on it
        ptrContent.on('ptr:refresh', function (e) {
            // Emulate 2s loading
            setTimeout(function () {
                customerPullToRefresh(ptrContent);
                // When loading done, we need to reset it
                myApp.pullToRefreshDone();
            }, 2000);
        });

        // got to add customer page
        $$(document).on('click', '#id-floating-add-customer', function(){
            //console.log("add customer");
            mainView.router.loadContent($$('#id-add-customer-page').html())

        })


    }
    if(page.name == 'customer-page-add') {
        // Append option
        //myApp.smartSelectAddOption('.smart-select select', '<option value="jade">jade</option>');
        // Add new option as first selected option
        // Append option
        //get province
        var provinceID = "";
        var default_province = getProvince(provinceID);

        console.log("get first value province");
        console.log(default_province);

        $$('#form_entry_province').on('change', function() {
            //console.log('Form entry item was changed was changed!');

            //detect if picker is closed after a selection is made for additional actions:
            $$('.picker-modal').on('close', function() {
                //console.log('Picker closed after selecting an item!');
                //additional actions here
                //var cars = [];
                 $$('select[name="provinceID"] option:checked').each(function () {
                     console.log("get province clear cities");
                     provinceID = this.value;

                     getCities(provinceID);
                     //myApp.smartSelectAddOption('#id-smart-select-city select', '<option value="jade">fuck</option>');
                 });
            });
        });

        //cities picker
        $$('#form_entry_city').on('change', function(){
            $$('.picker-modal').on('close', function(){
                $$('select[name="cityID"] option:checked').each(function(){
                    // console.log("province id",provinceID);
                    // console.log("city id", this.value);
                    // console.log("you change city close me");
                    getBarangay(provinceID, this.value, "");
                });

            });
        });

        $$(document).on('click', '#id-create-customer',  function(){
            console.log("you click");
            var formData = myApp.formToData('#my-form');
            //alert(JSON.stringify(formData));
           //var data = JSON.stringify(formData);
            //console.log(data);

            addCustomer(formData);
        });

        $$('#profile-image').on('click', function(){
            console.log("image picture");
            myApp.modal({
                title:  '<span class="icon bg-blue"><i class="material-icons">camera_alt</i></span>Profile image',
                text: 'Select camera or album',
                buttons: [
                    {
                        text: 'CAMERA',
                        onClick: function() {
                            getImageFromCamera();
                        }
                    },
                    {
                        text: 'ALBUM',
                        onClick: function() {
                           getImageFromAlbum();
                        }
                    },
                ]
            });
        });

        //get image from camera
        function getImageFromCamera() {
            navigator.camera.getPicture(onSuccess, onFail, { quality: 25,
                destinationType: Camera.DestinationType.DATA_URL,
                targetWidth: 512,
                targetHeight: 512,
                //destinationType: Camera.PictureSourceType.PHOTOLIBRARY
            });

            function onSuccess(imageData) {
                var image = document.getElementById('my-profile');
                image.src = "data:image/jpeg;base64," + imageData;
                $$("#profile-value").val("data:image/jpeg;base64," + imageData);
            }

            function onFail(message) {
                alert('Failed because: ' + message);
            }
        }
        //get image from album
        function getImageFromAlbum() {
            navigator.camera.getPicture(onSuccess, onFailure, {
                destinationType: navigator.camera.DestinationType.DATA_URL,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                targetWidth: 512,
                targetHeight: 512,
            });
        }

        function onSuccess(imageURI) {
            var image = document.getElementById('my-profile');
            image.src = "data:image/jpeg;base64,"+imageURI;
            $$("#profile-value").val("data:image/jpeg;base64,"+imageURI);

        }

        function onFailure(message) {
            alert("Get image failed: " + message);
        }
    }

    if(page.name == "customer-detail") {
        var id = page.query.id;
        customer_details(id, page);
    }
    if(page.name == 'customer-edit-page') {
        console.log("customer edit page");

        //myApp.showPreloader('Fetching data.');
        var id = page.query.id;
        var token= $$('meta[name="token"]').attr("content");
        var url = base_url+"/api/customer-details/"+id;
        var customer_data = [];
        var profile = "";
        var provinceID = "";
        var cityID = "";
        var barangayID = "";
        $$.ajax({
            type: "GET",
            dataType: "json",
            //url: 'http://192.168.1.224/iwash/api/customer',
            url: url,
            headers: {
                'Authorization': token,
            },
            success: function (data) {

                var formData = {};
                $$.each(data.data, function(k,v){
                    var isRegular = (v.isRegular == "N") ? "no" : "yes";
                    profile = v.profile;
                    formData = {
                        'fname' : v.fname,
                        'mname' : v.mname,
                        'lname' : v.lname,
                        'gender': v.gender,
                        'suffix' : v.suffix,
                        'title' : v.title,
                        'contact' : v.contact,
                        'address' : v.address,
                        'bday' : v.bday,
                        'isRegular' : ['yes'],
                        'switch': ['yes'],
                    }

                    provinceID = v.provinceID;
                    cityID = v.cityID;
                    barangayID = v.barangayID;
                });
                var defaultImage = base_url+'/assets/img/users/noimage.gif';

                var picURL = profile ? profile : defaultImage;
                var image = document.getElementById('my-profile');
                image.src = picURL;
                $$("#profile-value").val(picURL);
                myApp.formFromData('#customer-edit-form', formData);

                var default_province = getProvince(provinceID);

                getCities(provinceID, cityID);
                getBarangay(provinceID, cityID, barangayID);

                $$('#form_entry_province').on('change', function() {

                    $$('.picker-modal').on('close', function() {
                        $$('select[name="provinceID"] option:checked').each(function () {
                            console.log("get province clear cities");
                            provinceID = this.value;

                            getCities(provinceID, cityID);
                        });
                    });
                });

                //cities picker
                $$('#form_entry_city').on('change', function(){
                    $$('.picker-modal').on('close', function(){
                        $$('select[name="cityID"] option:checked').each(function(){
                            getBarangay(provinceID, this.value, "");

                        });

                    });
                });
            }
        });

        $$('#profile-image').on('click', function(){
            myApp.modal({
                title:  '<span class="icon bg-blue"><i class="material-icons">camera_alt</i></span>Profile image',
                text: 'Select camera or album',
                buttons: [
                    {
                        text: 'CAMERA',
                        onClick: function() {
                            getImageFromCamera();
                        }
                    },
                    {
                        text: 'ALBUM',
                        onClick: function() {
                            getImageFromAlbum();
                        }
                    },
                ]
            });
        });

        //get image from camera
        function getImageFromCamera() {
            navigator.camera.getPicture(onSuccess, onFail, { quality: 25,
                destinationType: Camera.DestinationType.DATA_URL,
                targetWidth: 512,
                targetHeight: 512,
                //destinationType: Camera.PictureSourceType.PHOTOLIBRARY
            });

            function onSuccess(imageData) {
                var image = document.getElementById('my-profile');
                image.src = "data:image/jpeg;base64," + imageData;
                $$("#profile-value").val("data:image/jpeg;base64," + imageData);
            }

            function onFail(message) {
                alert('Failed because: ' + message);
            }
        }
        //get image from album
        function getImageFromAlbum() {
            navigator.camera.getPicture(onSuccess, onFailure, {
                destinationType: navigator.camera.DestinationType.DATA_URL,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                targetWidth: 512,
                targetHeight: 512,
            });
        }

        function onSuccess(imageURI) {
            var image = document.getElementById('my-profile');
            image.src = "data:image/jpeg;base64,"+imageURI;
            $$("#profile-value").val("data:image/jpeg;base64,"+imageURI);

        }

        function onFailure(message) {
            alert("Get image failed: " + message);
        }

        $$('#id-edit-customer').on('click', function(){
            var formData = myApp.formToData('#customer-edit-form');
            updateCustomer(formData, id);
        });
    }
    if(page.name == 'about') {
        console.log("this is about");

        var id = page.query.id;
        var url = base_url+"/api/order-details/"+id;
        var token= $$('meta[name="token"]').attr("content");
        var listHTML = '';
        var STATUS = "";
        var ORDER_ID = "";
        $$.ajax({
            type: "GET",
            dataType: "json",
            url: url,
            headers: {
                'Authorization': token,
            },
            success: function (data) {
                var order_details = [];
                var delivery_fee = 0, rate = 0, total_amount = 0;
                $$.each(data.data, function(k, v) {

                    listHTML = '<div class="list-block media-list mt-15 mb-0">';
                    listHTML += '<ul class="profile bg-white">';
                    listHTML += '<li>';
                    listHTML += '<div class="item-content">';

                    listHTML += '<div class="item-media py-15"><img src="http://192.168.1.224/iwash/assets/img/users/noimage.gif"></div>';
                    listHTML += '<div class="item-inner">';

                    listHTML += '<div class="item-title-row">';
                    listHTML += '<div class="item-title">'+ v.suffix+" "+ v.fname +" "+v.mname+" "+v.lname+'</div>';
                    listHTML += '</div>';
                    listHTML += '<div class="item-subtitle color-grey">'+ v.date +'</div>';

                    listHTML += '</div>';

                    listHTML += '</div>';
                    listHTML += '</li>';

                    listHTML += '</ul>';
                    listHTML += '</div>';

                    order_details = v.order_details;

                    delivery_fee = v.deliveryFee;
                    rate = v.rate;
                    total_amount = v.ttlAmount;

                    STATUS = v.status;
                    ORDER_ID = v.order_id;
                });

                if(STATUS == 1) {
                    var settingHtml = '<div class="speed-dial">' +
                        '<a href="#" class="floating-button color-red"><i class="material-icons">edit</i><i class="icon icon-close"></i></a>' +
                        '<div class="speed-dial-buttons">' +
                        '<a href="order-edit.html?id='+ORDER_ID+'" class="link color-black" ><i class="la la-edit"></i></a>' +
                        '<a href="javascript:delete_order('+ORDER_ID+');" class="link color-black" id="id-delete"><i class="la la-trash-o"></i></a>' +
                        '</div>' +
                        '</div>';
                    $$('#container-signpad').html("");
                    $$(page.container).find('.page-content').append(settingHtml);
                }

                $$.each(order_details, function(k, v) {
                    var UNIT = v.unit;
                    var REGULAR_RATE = v.regRate;
                    var QUANTITY = v.qty;
                    var AMOUNT = v.amount;
                    var str = v.serviceType;
                    str = str.replace(/ +/g, "");
                    var the_id = v.serviceID+str;

                    var table = $$('<div>').attr('class', "services inset")
                        .append($$('<div>').attr('class', "card-header")
                            .append($$('<span>').text(""+v.serviceType.capitalize()+""))
                        )
                        .append($$('<div>').attr('class', "card-content px-15")
                            .append($$('<table>').attr('id', 'order-table'+the_id)
                                .append($$('<tr>').attr('id', 'tr-head'+the_id))
                                .append($$('<tbody>'))
                            )
                        )
                            .append($$('<h4 class="px-15">Details</h4>'))
                            .append($$('<ul>')
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label color-grey').text("Quantity"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('placeholder', "Please input Quantity").attr('type', 'number').attr('value', QUANTITY).attr('readonly', true).attr('style', 'border:none')
                                                )
                                            )
                                        )
                                    )
                                )
                                //unit
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label color-grey').text("Unit"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('placeholder', "Unit").attr('value', UNIT).attr('readonly', true).attr('style', 'border:none'))
                                            )
                                        )
                                    )
                                )
                                //rate
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label color-grey').text("Rate"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('placeholder', "Rate").attr('value', REGULAR_RATE).attr('readonly', true).attr('style', 'border:none'))
                                            )
                                        )
                                    )
                                )
                                //amount
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content last')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label color-grey').text("Amount"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('placeholder', "Amount").attr('readonly', true).attr('style','border:none').attr('class', 'my-amount').attr('value', AMOUNT))
                                            )
                                        )
                                    )
                                )
                            );

                        $$(page.container).find('.page-content').find('#id-display-category').append(table);
                        v.categories.forEach(element => {
                            $$('#order-table'+the_id).find('#tr-head'+the_id).empty();
                            $$('#order-table'+the_id).find('#tr-head'+the_id)
                                .append($$('<th>').attr('class', 'text-align-left pl-0').text('Category'))
                                .append($$('<th>').attr('class', 'text-align-right pr-0').text('Quantity'));
                            var table = $$('#order-table'+the_id).find('tbody');
                            table.append($$('<tr>').attr('class', 'item')
                                .append($$('<td>').attr('class', "label-cell color-grey").text(element.category.capitalize()))
                                .append($$('<td>').attr('class', "numeric-cell")
                                    .append($$('<input>').attr('value', element.qty).attr('type',"number").attr('class', 'quantity').css('background-color','#EFEFEF').attr('style', 'border:none').attr('readonly', true)))
                            );
                        });
                        }
                    );
                var delivery_fee_html = '<div class="list-block inset total">'+
                                      '<ul>' +
                                        '<li class="item-content pr-15"><div class="pr-0 item-inner"><div class="item-title">Delivery Fee</div><div class="item-after">'+delivery_fee+'</div></div>' +
                                        '<li class="item-content pr-15"><div class="pr-0 item-inner total-amount"> <div class="item-title">Total</div><div class="item-after">'+total_amount+'</div></div>' +
                                        '</li>'+
                                      '</ul>';


                $$(page.container).find('.page-content').find('#delivery-list').append(delivery_fee_html);

                $$(page.container).find('.page-content').find('#signature-display').append(listHTML);


            },
            error: function (error) {
                console.log("error");
                console.log(error);
            }
        });


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
                myApp.alert('Please provide a signature first.','<span class="icon bg-blue"><i class="material-icons">edit</i></span>Signature');
                return null;
            }

            var data = signaturePad.toDataURL('image/jpeg');

            myApp.confirm('Please confirm order only after you have received all the items.','<span class="icon bg-blue"><i class="material-icons">check</i></span>Confirm Delivery', function () {
                update_order_details(id, data);
            });
        });


        document.getElementById('clear').addEventListener('click', function () {
            signaturePad.clear();
        });

        document.getElementById('back').addEventListener('click', function(){
            mainView.router.loadContent($$('#dashboard').html());
            //myApp.closeModal($$(".popup"),true);
        });
    }
    if(page.name == 'history-list'){
        //alert("hello index");
        console.log("history-list");
        //var base_url = 'http://192.168.1.224/iwash';
        //var url = base_url+"/api/order-history";
        var token= $$('meta[name="token"]').attr("content");
        var from_date = "";
        var to_date = "";
        var date = "";

        var calendarFrom = myApp.calendar({
            input: '#history-calendar-from',
            dateFormat: 'M dd yyyy',
            onClose: function(){

                if(typeof(calendarFrom.value) != "undefined")
                {
                    var from_day = calendarFrom.value[0].getDate();
                    var from_month = calendarFrom.value[0].getMonth() + 1;
                    var from_year = calendarFrom.value[0].getFullYear();
                    from_date = from_year+"-"+from_month+"-"+from_day;
                    date = from_date+":"+to_date;
                    console.log("from date history");
                    console.log(date);
                    //get history
                    localStorage.setItem(page.name, date);
                    getOrderDate(page, date, 5);
                }
                else {
                    console.log("not null");
                }
            }
        });

        var calendarTo = myApp.calendar({
            input: '#history-calendar-to',
            dateFormat: 'M dd yyyy',
            onClose: function(){
                if(typeof(calendarTo.value) != "undefined")
                {
                    var to_day = calendarTo.value[0].getDate();
                    var to_month = calendarTo.value[0].getMonth() + 1;
                    var to_year = calendarTo.value[0].getFullYear();
                    to_date = to_year+"-"+to_month+"-"+to_day;
                    date = from_date+":"+to_date;
                    console.log("to date history");
                    console.log(date);
                    //get history
                    localStorage.setItem(page.name, date);
                    getOrderDate(page, date, 5);
                }
                else {
                    console.log("empty this");
                }

            }
        });
        // set default data current day
        var ptrContent = $$(page.container).find('.pull-to-refresh-content');
        //$$(page.container).find('.page-content').find('.list-block').append(listHTML);

// Add 'refresh' listener on it
        ptrContent.on('ptr:refresh', function (e) {
            // Emulate 2s loading
            setTimeout(function () {
                //refreshData history
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth()+1; //January is 0!
                var yyyy = today.getFullYear();
                if(dd<10) {
                    dd = '0'+dd
                }
                if(mm<10) {
                    mm = '0'+mm
                }
                today = yyyy+"-"+mm+"-"+dd;
                var date = today+":"+today;

                var date_local = localStorage.getItem(page.name);
                if(date_local == null) {
                    //getOrderDate(page, date, 5);
                    var url = base_url+"/api/order-history";
                    //getDefaultHistoryList(page, token, url);
                    refreshDataHistory("", page, 5);
                }
                else {
                    getOrderDate(page, date_local, 5);

                }
                myApp.pullToRefreshDone();
            }, 2000);
        });

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) {
            dd = '0'+dd
        }
        if(mm<10) {
            mm = '0'+mm
        }
        today = yyyy+"-"+mm+"-"+dd;
        var date = today+":"+today;

        var date_local = localStorage.getItem(page.name);
        if(date_local == null) {
            //getOrderDate(page, date, 5);
            var url = base_url+"/api/order-history";
            getDefaultHistoryList(page, token, url);
        }
        else {
            getOrderDate(page, date_local, 5);

        }
    }
    $$(page.container).find('#history-id-reset').on('click', function(){
        setUpDate('#history-calendar-from', '#history-calendar-to');
        localStorage.removeItem(page.name);
        var token= $$('meta[name="token"]').attr("content");
        var url = base_url+"/api/order-history";
        getDefaultHistoryList(page, token, url);
    });

    $$("#id-history").on("click", function(){
        myApp.closeModal($$('.popover'), true);

        mainView.router.loadContent($$('#id-history-list').html());
    });
    if(page.name == "about-history"){
        console.log("about history");
        var id = page.query.id;
        console.log("this id of order : ", id);
        var url = base_url+"/api/order-details/"+id;
        var token= $$('meta[name="token"]').attr("content");
        $$.ajax({
            type: "GET",
            dataType: "json",
            url: url,
            headers: {
                'Authorization': token,
            },
            success: function (data) {
                console.log("about history details");
                var order_details = [];
                var delivery_fee = 0, rate = 0, total_amount = 0;
                var custsign = "";
                var remarks = "";
                $$.each(data.data, function(k, v) {
                    custsign = v.custsign;
                    var listHTML = '<div class="list-block media-list mt-15 mb-0">';
                    listHTML += '<ul class="profile bg-white">';

                    listHTML += '<li>';
                    listHTML += '<div class="item-content">';

                    listHTML += '<div class="item-media py-15"><img src="http://192.168.1.224/iwash/assets/img/users/noimage.gif"></div>';
                    listHTML += '<div class="item-inner">';

                    listHTML += '<div class="item-title-row">';
                    listHTML += '<div class="item-title">'+ v.suffix+" "+ v.fname +" "+v.mname+" "+v.lname+'</div>';
                    listHTML += '</div>';
                    listHTML += '<div class="item-subtitle color-grey">'+ v.date +'</div>';

                    listHTML += '</div>';

                    listHTML += '</div>';
                    listHTML += '</li>';

                    listHTML += '</ul>';

                    listHTML += '</div>';

                    $$(page.container).find('.page-content').find('#signature-display').append(listHTML);
                    order_details = v.order_details;

                    delivery_fee = v.deliveryFee;
                    rate = v.rate;
                    total_amount = v.ttlAmount;
                    remarks = v.remarks;
                });
                $$.each(order_details, function(k, v) {

                        var UNIT = v.unit;
                        var REGULAR_RATE = v.regRate;
                        var QUANTITY = v.qty;
                        var AMOUNT = v.amount;
                        var str = v.serviceType;
                        str = str.replace(/ +/g, "");
                        var the_id = v.serviceID+str;

                        var table = $$('<div>').attr('class', "services inset")
                            .append($$('<div>').attr('class', "card-header")
                                .append($$('<span>').text(v.serviceType.capitalize()+""))
                            )
                            .append($$('<div>').attr('class', "card-content px-15")
                                .append($$('<table>').attr('id', 'order-table'+the_id)
                                    .append($$('<tr>').attr('id', 'tr-head'+the_id))
                                    .append($$('<tbody>'))
                                )
                            )
                            //quantity
                            .append($$('<h4 class="px-15">Details</h4>'))
                            .append($$('<ul>')
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label color-grey').text("Quantity"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('type', 'number').attr('value', QUANTITY).attr('readonly', true).attr('style', 'border:none')
                                                )
                                            )
                                        )
                                    )
                                )
                                //unit
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label color-grey').text("Unit"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('value', UNIT).attr('readonly', true).attr('style', 'border:none'))
                                            )
                                        )
                                    )
                                )
                                //rate
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label color-grey').text("Rate"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('value', REGULAR_RATE).attr('readonly', true).attr('style', 'border:none'))
                                            )
                                        )
                                    )
                                )
                                //amount
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content last')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label color-grey').text("Amount"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('readonly', true).attr('style','border:none').attr('class', 'my-amount').attr('value', AMOUNT))
                                            )
                                        )
                                    )
                                )
                            );

                        $$(page.container).find('.page-content').find('#id-display-category').append(table);

                        v.categories.forEach(element => {
                            $$('#order-table'+the_id).find('#tr-head'+the_id).empty();
                            $$('#order-table'+the_id).find('#tr-head'+the_id)
                                .append($$('<th>').attr('class', 'text-align-left pl-0').text('Category'))
                                .append($$('<th>').attr('class', 'text-align-right pr-0').text('Quantity'));
                            var table = $$('#order-table'+the_id).find('tbody');
                            table.append($$('<tr>').attr('class', 'item')
                                .append($$('<td>').attr('class', "label-cell color-grey").text(element.category.capitalize()))
                                .append($$('<td>').attr('class', "numeric-cell")
                                    .append($$('<input>').attr('value', element.qty).attr('type',"number").attr('class', 'quantity').attr('readonly', true).css('background-color','#EFEFEF').attr('style', 'border:none')))

                            );
                        });

                    }
                );

                var delivery_fee_html = '<div class="list-block inset total">'+
                    '<ul>' +
                        '<li class="item-content pr-15"><div class="pr-0 item-inner"><div class="item-title">Delivery Fee</div><div class="item-after">'+delivery_fee+'</div></div>' +
                        '<li class="item-content pr-15"><div class="pr-0 item-inner total-amount"> <div class="item-title">Total</div><div class="item-after">'+total_amount+'</div></div>' +
                        '</li>'+
                    '</ul>'+
                    '</div>';

                var delivery_remark = '<div>Remarks<br>'+remarks+'</div>';

                var signatureimg = '<div class="wrapper pb-15"><img src="'+custsign+'" width="100%" height="250"/></div>';

                $$(page.container).find('.page-content').find('#container-signpad').append(signatureimg);
                $$(page.container).find('.page-content').find('#delivery-list').append(delivery_fee_html);
                $$(page.container).find('.page-content').find('#remark-content').append(delivery_remark);
                $$(page.container).find('.page-content').find('#signature-display').append(listHTML);
                
            },
            error: function (error) {
                console.log("error");
                console.log(error);
            }
        });
    }
    if(page.name == 'order-add-page') {
        myApp.showPreloader();
        localStorage.clear();

        var dynamic_services = "";
        //console.log("get customer");
        var branchName = $$('meta[name="branchName"]').attr("content");
        getServices("");
        $$('#id-branch').val(branchName);
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) {
            dd = '0'+dd
        }
        if(mm<10) {
            mm = '0'+mm
        }
        today = yyyy+"-"+mm+"-"+dd;
        $$('#id-date').val(today);
        getCustomerSmartSelect();
        var service_id = "";
        $$('#id-click-services').on('click', function(){
            dynamic_services = JSON.parse(localStorage.getItem("service_ids"));
        });
        $$('#form_entry_services').on('change', function() {
            $$('.picker-modal').on('close', function() {
                $$('select[name="serviceID"] option:checked').each(function () {

                    if(dynamic_services) {
                        for (var i = 0; i<dynamic_services.length; i++) {
                            if(dynamic_services[i] == this.value) {
                                myApp.alert("Already exist");
                                return false;
                            }
                        }
                        dynamic_services.push(this.value);
                        localStorage.setItem("service_ids", JSON.stringify(dynamic_services));
                    }
                    else {
                        var ids = [];
                        ids.push(this.value);
                        localStorage.setItem("service_ids", JSON.stringify(ids));
                    }
                    var service_type = $$('meta[name="service_types"]').attr("content");
                    var service_type = JSON.parse(service_type);
                    var UNIT = "";
                    var REGULAR_RATE = "";
                    var DISCOUNTED_RATE = "";
                    for(var i=0; i < service_type.length; i++) {
                        if(service_type[i].serviceID == this.value) {
                            UNIT = service_type[i].unit;
                            DISCOUNTED_RATE = service_type[i].discountedRate;
                            REGULAR_RATE = service_type[i].regRate;
                        }
                    }

                    var str = this.text;
                    str = str.replace(/ +/g, "");
                    var the_id = this.value+str;
                    var remove_more_id = "id-remove-more-"+this.value+str;
                    var id_container = "remove-"+remove_more_id;
                    var class_quantity = "quantity-"+this.value;
                    var class_amount = "amount-"+this.value;
                    var ul_id = "ul-class-"+this.value+str;
                    $$(page.container).find('.card-group')
                        .append($$('<div data-service-id="'+this.value+'">').attr('class', "data-table data-table-init card").attr('id', id_container)
                            .append($$('<div>').attr('class', "card-header")
                                .append($$('<span>').text(this.text.capitalize()).attr('name',this.value))
                                .append($$('<div>').attr('class', "data-table-links")
                                    .append($$('<a><i>').attr('class', "link icon-only").attr('class', "material-icons").attr('id', remove_more_id).text("clear"))
                                )
                            )
                            .append($$('<div>').attr('class', "card-content")
                                .append($$('<table>').attr('id', 'order-table'+the_id)
                                    .append($$('<tr>').attr('id', 'tr-head'+the_id))
                                    .append($$('<tbody>'))
                                )
                            )
                            //quantity
                            .append($$('<ul>').attr('id', ul_id)
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label').text("Quantity"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('placeholder', "0").attr('type', 'number').attr('class', class_quantity)
                                                )
                                            )
                                        )
                                    )
                                )
                                //unit
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label').text("UNIT"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('value', UNIT).attr('readonly', true).attr('class', 'readonly'))
                                            )
                                        )
                                    )
                                )
                                //rate
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label').text("RATE"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('value', REGULAR_RATE).attr('readonly', true).attr('class', 'readonly'))
                                            )
                                        )
                                    )
                                )
                                //amount
                                .append($$('<li>')
                                    .append($$('<div>').attr('class', 'item-content')
                                        .append($$('<div>').attr('class','item-inner')
                                            .append($$('<div>').attr('class','item-title label').text("AMOUNT"))
                                            .append($$('<div>').attr('class', 'item-input')
                                                .append($$('<input>').attr('readonly', true).attr('class', class_amount).attr('class', 'readonly'))
                                            )
                                        )
                                    )
                                )
                            )
                        );

                    //getCategories(this.value);
                    service_id = this.value;
                    var SERVICE_TYPE = this.text;
                    var service_ids = $$('meta[name="service_ids"]').attr("content");

                    var service_ids = JSON.parse(service_ids);
                    for(var i =0; i<service_ids.length; i++)
                    {
                        var id = "#id-remove-more-"+service_ids[i];
                        //var remove_id = "remove-id-remove-more-"+service_ids[i];
                        $$(id).on("click", function(){
                            console.log("remove");
                            var parent = $$(this).parent().parent().parent().attr("id");
                            var id = $$(this).attr('id');
                            //console.log("parent : ", parent);
                            //console.log("id : ", id);
                            if("remove-"+id == parent) {
                                var data_bind_service_id = $$(this).parent().parent().parent().data('service-id');
                                //update local storage
                                var local_service_ids  = JSON.parse(localStorage.getItem("service_ids"));
                                var filterServiceId = local_service_ids.filter(function(e) {return e !== data_bind_service_id} );
                                localStorage.setItem("service_ids", JSON.stringify(filterServiceId));
                                $$("#"+parent).remove();
                                calculateGrandTotal(service_ids);
                            }
                            return false;
                        });
                    }
                    getCategories(this.value, the_id);

                    $$("."+class_quantity).on('keyup', function(){
                        var rate = $$(this).closest('li').next('li').next('li').find('input').val();
                        var total = rate * this.value;
                        $$(this).closest('li').next('li').next('li').next('li').find('input').val(total);
                        var the_class = $$(this).next().attr('id');
                        calculateGrandTotal(service_ids);
                    });
                });
            });
        });

        $$('#id-button-form-add-order').on('click', function(){

            //check for table services id
            var service_ids = $$('meta[name="service_ids"]').attr("content");

            var service_ids = JSON.parse(service_ids);
            var data = [];
            var category_data = [];
            for(var i =0; i<service_ids.length; i++) {
                // console.log("the id");
                //console.log(service_ids[i]);
                //var data_bind_service_id = $$(this).closest('table').parent().parent().data('service-id');
                //get the service ids
                var the_id = $$('#remove-id-remove-more-'+service_ids[i]).attr('id');
                if (typeof the_id != 'undefined') {
                    //console.log("the id",the_id);
                    var ul = $$('#remove-id-remove-more-'+service_ids[i]+' > ul').attr('id');
                    var unit = $$('#'+ul+' li').next('li').find('input').val();
                    var quantity = $$('#'+ul+' li').find('input').val();
                    var rate = $$('#'+ul+' li').next('li').next('li').find('input').val();
                    var amount = $$('#'+ul+' li').next('li').next('li').next('li').find('input').val();
                    var data_bind = $$('#remove-id-remove-more-'+service_ids[i]).data('service-id');
                    //GET THE CATEGORY
                    var table_id = "#order-table"+service_ids[i];
                    // //console.log("the id", the_id);
                    $$(''+table_id+' > tbody > tr.item').each(function(index, element) {
                        var data_bind_table = $$(this).data('service-id');

                        var category_quantity = $$(this).find("input.quantity").val();
                        var category_id = $$(this).find("input.category_id").val();
                        category_data.push({
                            service_id : data_bind_table,
                            category_quantity: category_quantity,
                            category_id : category_id
                        });
                    });
                    data.push({
                        service_id : data_bind,
                        amount: amount,
                        unit : unit,
                        rate : rate,
                        quantity: quantity,
                    });
                }
            }
            if(data.length == 0) {
                myApp.alert("Please add services");
            }
            else {
                for(var i = 0; i < data.length; i++){
                    if(data[i].quantity == "") {
                        myApp.alert("Please add Quantity");
                        return false;
                    }
                }
                var customer_id = $$('#form_entry_customer').val();
                var grand_total = $$('#grand-total').val();
                var remarks = $$('#remarks').val();
                if(customer_id == "") {
                    myApp.alert("Please add Customer");
                    return false;
                }
                console.log(category_data);
               createOrder(data, grand_total, customer_id, remarks, category_data);
            }
        });

    }
    if(page.name == 'order-edit-page') {
        console.log("edit order");
        var order_id = page.query.id;
        console.log("order id fds", order_id);
        myApp.showPreloader('Checking connection.');
        getServices("");
        getOrderForEdit(order_id, page);
        checkCreateOrder(page);
        $$("#id-button-form-edit-order").on("click" , function () {
            console.log("this is edit");
            //check for table services id
            var service_ids = $$('meta[name="service_ids"]').attr("content");

            var service_ids = JSON.parse(service_ids);
            var data = [];
            var category_data = [];
            for(var i =0; i<service_ids.length; i++) {
                var the_id = $$('#remove-id-remove-more-'+service_ids[i]).attr('id');
                if (typeof the_id != 'undefined') {
                    var ul = $$('#remove-id-remove-more-'+service_ids[i]+' > ul').attr('id');
                    var unit = $$('#'+ul+' li').next('li').find('input').val();
                    var quantity = $$('#'+ul+' li').find('input').val();
                    var rate = $$('#'+ul+' li').next('li').next('li').find('input').val();
                    var amount = $$('#'+ul+' li').next('li').next('li').next('li').find('input').val();
                    var data_bind = $$('#remove-id-remove-more-'+service_ids[i]).data('service-id');
                    var table_id = "#order-table"+service_ids[i];
                    $$(''+table_id+' > tbody > tr.item').each(function(index, element) {
                        var data_bind_table = $$(this).data('service-id');
                        var category_quantity = $$(this).find("input.quantity").val();
                        var category_id = $$(this).find("input.category_id").val();
                        if(typeof category_id != 'undefined')
                        {
                            category_data.push({
                                service_id : data_bind,
                                category_quantity: category_quantity,
                                category_id : category_id
                            });
                        }
                    });
                    data.push({
                        service_id : data_bind,
                        amount: amount,
                        unit : unit,
                        rate : rate,
                        quantity: quantity,
                    });
                }
            }
            if(data.length == 0) {
                myApp.alert("Please add services");
            }
            else {
                for(var i = 0; i < data.length; i++){
                    if(data[i].quantity == "") {
                        myApp.alert("Please add Quantity");
                        return false;
                    }
                }
                var customer_id = $$('#form_entry_customer').val();
                var grand_total = $$('#grand-total').val();
                var remarks = $$('#remarks').val();
                if(customer_id == "") {
                    myApp.alert("Please add Customer");
                    return false;
                }
                var order_id = $$('#id-order').val();
                updateOrder(data, grand_total, customer_id, remarks, category_data, order_id);
            }
         });
    }
    if(page.name == 'order-list-page') {
        setUpDate(page.name, '#created-calendar-from', '#created-calendar-to');
        var from_date = "";
        var to_date = "";
        var date = "";
        var calendarFrom = myApp.calendar({
            input: '#created-calendar-from',
            dateFormat: 'M dd yyyy',
            onClose: function(){

                if(typeof(calendarFrom.value) != "undefined")
                {
                    var from_day = calendarFrom.value[0].getDate();
                    var from_month = calendarFrom.value[0].getMonth() + 1;
                    var from_year = calendarFrom.value[0].getFullYear();
                    from_date = from_year+"-"+from_month+"-"+from_day;
                    date = from_date+":"+to_date;
                    localStorage.setItem(page.name, date);
                    getOrderDate(page, date,1);
                }
                else {
                    console.log("not null");
                }
            }
        });
        var calendarTo = myApp.calendar({
            input: '#created-calendar-to',
            dateFormat: 'M dd yyyy',
            onClose: function(){
                if(typeof(calendarTo.value) != "undefined")
                {
                    var to_day = calendarTo.value[0].getDate();
                    var to_month = calendarTo.value[0].getMonth() + 1;
                    var to_year = calendarTo.value[0].getFullYear();
                    to_date = to_year+"-"+to_month+"-"+to_day;
                    date = from_date+":"+to_date;
                    //console.log("to date");
                    //console.log(date);
                    localStorage.setItem(page.name, date);
                    getOrderDate(page, date, 1);
                }
                else {
                    console.log("empty this");
                }
            }
        });

        if(date === "") {

            $$('#id-branch').val(branchName);
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();
            if(dd<10) {
                dd = '0'+dd
            }
            if(mm<10) {
                mm = '0'+mm
            }
            today = yyyy+"-"+mm+"-"+dd;
            var date = today+":"+today;

            var date_local = localStorage.getItem(page.name);
            if(date_local == null) {
                getOrderDate(page, date, 1);
            }
            else {
                getOrderDate(page, date_local, 1);
            }
        }
        var ptrContent = $$(page.container).find('.pull-to-refresh-content');
        ptrContent.on('ptr:refresh', function (e) {
            setTimeout(function () {
                var date_from = $$('#created-calendar-from').val();
                var date_to = $$('#created-calendar-to').val();
                date = date_from+":"+date_to;
                getOrderDate(page, date, 1);
                myApp.pullToRefreshDone();
            }, 2000);
        });

        $$(document).on('click', '#id-add-order', function(){
            mainView.router.loadContent($$('#id-add-order-page').html());
        });

        $$(document).on('click', '#created-id-reset', function(){

            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1;
            var yyyy = today.getFullYear();
            if(dd<10) {
                dd = '0'+dd
            }
            if(mm<10) {
                mm = '0'+mm
            }
            today = yyyy+"-"+mm+"-"+dd;
            date = today+":"+today;

            $$('#created-calendar-from').val(today);
            $$('#created-calendar-to').val(today);

            localStorage.removeItem(page.name);

            getOrderDate(page, date,1);

        });

    }
});

function calculateGrandTotal(service_ids)
{
    var sum = 0;
    for(var i = 0; i < service_ids.length; i++) {
        var ul_id = "#ul-class-"+service_ids[i];
        //console.log(ul_id);
        if($$(ul_id).length) {

            var ul = $$('#remove-id-remove-more-'+service_ids[i]+' > ul').attr('id');
            var amount = $$('#'+ul+' li').next('li').next('li').next('li').find('input').val();
            //console.log("the amount", amount);
            sum += +amount;
        }
    }
    $$("#grand-total").val(sum);
}

function removeDuplicateUsingSet(arr){
    let unique_array = Array.from(new Set(arr))
    return unique_array
}
function update_order_details(id, signature)
{

    var url = base_url+"/api/order-details";
    var token= $$('meta[name="token"]').attr("content");
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
            mainView.router.loadContent($$('#dashboard').html());
        },
        error: function (error) {
            console.log(error);
        }
    });
}
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
});

$$('#login').on('click', function(){

    var username = $$('.login-screen input[name = "username"]').val();
    var password = $$('.login-screen input[name = "password"]').val();
    if(navigator.onLine){
        var data = {"username": username, "password": password };
        myApp.showPreloader('Checking connection');
        setTimeout(function () {
            $$.ajax({
                type: "POST",
                dataType: "json",
                url: base_url+"/api/login",
                data: data,
                success: function (data) {
                    $$('meta[name="token"]').attr("content", data.data.token);
                    $$('meta[name="user_group"]').attr("content", data.data.groupName);
                    $$('meta[name="branchName"]').attr("content", data.data.branchName);
                    localStorage.clear();

                    myApp.closeModal('.login-screen',true);
                    myApp.hidePreloader();
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


        }, 2000);

        //alert('online');
    } else {
        myApp.alert('Please check connection');
    }

});


function refreshData(date, page, status)
{
    console.log("this is date");
    console.log(date);
    if(date == "") {
        var url = base_url+"/api/order";
    }
    else {
        var url = base_url+"/api/order-date/"+date+":"+status;
    }


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


            $$(page.container).find('.page-content').find('.list-block').find('ul').empty();

            //var listHTML = '<div class = "list-block media-list">';
            var listHTML = '<ul>';
            $$.each(data.data, function(k, v) {
                /// do stuff
                //console.log("data for v");
                //console.log(v.branch_name);

                listHTML += '<li>';
                listHTML += '<a href="about.html?id='+ v.order_id +'" class="item-link item-content">';
                listHTML += '<div class="item-media"><span class="moname">Sep<span class="moday">23</span></span></div>';
                listHTML += '<div class = "item-inner">';
                listHTML += '<div class = "item-title-row">';
                listHTML += '<div class = "item-title">'+v.suffix+" "+ v.fname +" "+v.mname+" "+v.lname+'</div>';
                // listHTML += '<div class="item-after">'+v.date+'</div>';
                listHTML += '</div>';
                listHTML += '<div class="item-subtitle">'+ v.branch_name +'</div>';
                listHTML += '<div class="item-text">'+ v.service_type+'</div>';
                //listHTML += '<div class = "card-footer"><a href="about.html?id='+ v.order_id +'" class="link">View Details</a></div>';
                listHTML += '</div>';
                listHTML += '</a>';
                listHTML += '</li>';
            });

            listHTML += '</ul>';
            $$(page.container).find('.page-content').find('.list-block').append(listHTML);

        },
        error: function (error) {
            console.log("error");
            console.log(error);
        }
    });

}

function refreshDataHistory(date, page, status)
{
    console.log("this is date");
    console.log(date);
    if(date == "") {
        var url = base_url+"/api/order-history";
    }
    else {
        var url = base_url+"/api/order-date/"+date+":"+status;
    }


    var token= $$('meta[name="token"]').attr("content");
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {
            $$(page.container).find('.page-content').find('.list-block').find('ul').empty();

            var listHTML = '<ul>';
            $$.each(data.data, function(k, v) {
                listHTML += '<li>';
                listHTML += '<a href="about-history.html?id='+ v.order_id +'" class="item-link item-content">';
                listHTML += '<div class="item-media"><span class="moname">Sep<span class="moday">23</span></span></div>';
                listHTML += '<div class = "item-inner">';
                listHTML += '<div class = "item-title-row">';
                listHTML += '<div class = "item-title">'+v.suffix+" "+ v.fname +" "+v.mname+" "+v.lname+'</div>';
                // listHTML += '<div class="item-after">'+v.date+'</div>';
                listHTML += '</div>';
                listHTML += '<div class="item-subtitle">'+ v.branch_name +'</div>';
                listHTML += '<div class="item-text">'+ v.service_type+'</div>';
                //listHTML += '<div class = "card-footer"><a href="about.html?id='+ v.order_id +'" class="link">View Details</a></div>';
                listHTML += '</div>';
                listHTML += '</a>';
                listHTML += '</li>';
            });

            listHTML += '</ul>';

            // $$(page.container).find('.page-content').append(listHTML);
            $$(page.container).find('.page-content').find('.list-block').append(listHTML);

        },
        error: function (error) {
            console.log("error");
            console.log(error);
        }
    });

}

// Wait for device API libraries to load
//
function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
    //alert("deviceready");
    //exitAppPopup();

}

function checkConnection()
{
    document.addEventListener("offline", onOffline, false);
}

function onOffline() {
    console.log('offline connection...........');
    alert("lost connection");
}
function onDeviceReady() {
    console.log("device ready");
    console.log(navigator.camera);
    document.addEventListener("backbutton", onBackKeyDown, false);

}
function onBackKeyDown() {
   var name = myApp.getCurrentView().activePage.name;
   if(name == 'about') {
       mainView.router.loadContent($$('#dashboard').html());
   }
   else if(name == 'home') {
       myFunction();
    }
}
function exitFromApp()
{
    navigator.app.exitApp();
    //window.close();

}
function myFunction() {

    var r = confirm("Do you want to logout!");
    if (r == true) {
        navigator.app.exitApp();

    } else {

    }
}

function getOrderDate(page, date, status)
{
    console.log("date");
    console.log(date);
    var url = base_url+"/api/order-date/"+date+":"+status;
    //var url = "http://localhost/iwash/api/order-date/2018-07-01:2018-08-08";
    var token= $$('meta[name="token"]').attr("content");

    Date.prototype.monthNames = [
        "January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"
    ];

    Date.prototype.getMonthName = function() {
        return this.monthNames[this.getMonth()];
    };
    Date.prototype.getShortMonthName = function () {
        return this.getMonthName().substr(0, 3);
    };

    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {
            //console.log("this is data");
            //console.log(data);
            $$(page.container).find('.page-content').find('#id-not-found').html("");
            $$(page.container).find('.page-content').find('ul').empty();
            if(data.data.length != 0) {


                //var listHTML = '<div class = "list-block media-list">';
                var listHTML = '<ul>';
                $$.each(data.data, function(k, v) {
                    var javascript_date = new Date(v.date);
                    console.log("THE DATE");
                    console.log(javascript_date.getShortMonthName());
                    var month = javascript_date.getShortMonthName();
                    var day = javascript_date.getDay();
                    console.log("GET DAY");
                    console.log(javascript_date.getDay());
                    listHTML += '<li>';
                    if(status == 5) {
                         listHTML += '<a href="about-history.html?id='+ v.order_id +'" class="item-link item-content">';
                    }
                    else {
                        listHTML += '<a href="about.html?id=' + v.order_id + '" class="item-link item-content">';
                    }
                    listHTML += '<div class="item-media"><span class="moname">'+month+'<span class="moday">'+day+'</span></span></div>';
                    listHTML += '<div class = "item-inner">';
                    listHTML += '<div class = "item-title-row">';
                    listHTML += '<div class = "item-title">'+v.suffix+" "+ v.fname +" "+v.mname+" "+v.lname+'</div>';
                    // listHTML += '<div class="item-after">'+v.date+'</div>';
                    listHTML += '</div>';
                    listHTML += '<div class="item-subtitle">'+ v.branch_name +'</div>';
                    listHTML += '</div>';
                    listHTML += '</a>';
                    listHTML += '</li>';

                });

                listHTML += '</ul>';

                $$(page.container).find('.page-content').find('.list-block').append(listHTML);
            }
            else {
                $$(page.container).find('.page-content').find('#id-not-found').html('');
                var listHTML = '<div id="id-not-found"><div class="empty-list text-align-center my-30 py-30 px-30">'
                                    +'<div class="mx-auto">' 
                                        +'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 480 480" style="enable-background:new 0 0 480 480;" xml:space="preserve" width="60px" height="60px" class=""><g><path style="fill:#FFDAAA;" d="M472,88H8v384h464V88z M192,136h96c8.837,0,16,7.163,16,16s-7.163,16-16,16h-96  c-8.837,0-16-7.163-16-16S183.163,136,192,136z M184,368V240l-33.944,33.944L184,240l33.944,33.944L184,240V368h112V240  l-33.944,33.944L296,240l33.944,33.944L296,240v128H184z" data-original="#FFDAAA" class=""/><g><path style="fill:#FFB655;" d="M472,88L424,8h-8v80H472z" data-original="#FFB655" class=""/><path style="fill:#FFB655;" d="M64,8h352v80H64V8z" data-original="#FFB655" class=""/><path style="fill:#FFB655;" d="M64,8h-8L8,88h56V8z" data-original="#FFB655" class=""/></g><path style="fill:#FFDAAA;" d="M192,168h96c8.837,0,16-7.163,16-16s-7.163-16-16-16h-96c-8.837,0-16,7.163-16,16  S183.163,168,192,168z" data-original="#FFDAAA" class=""/><g><path style="fill:#212121" d="M479.44,85.224c-0.088-0.232-0.184-0.44-0.288-0.664c-0.084-0.233-0.183-0.46-0.296-0.68l-48-80   C429.41,1.473,426.808,0.001,424,0H56c-2.808,0.001-5.41,1.473-6.856,3.88l-48,80c-0.113,0.22-0.212,0.447-0.296,0.68   c-0.104,0.216-0.2,0.432-0.288,0.664C0.212,86.109,0.022,87.049,0,88v384c0,4.418,3.582,8,8,8h464c4.418,0,8-3.582,8-8V88   C479.978,87.049,479.788,86.109,479.44,85.224L479.44,85.224z M457.872,80H424V23.552L457.872,80z M72,80V16h336v64H72z M56,23.552   V80H22.128L56,23.552z M464,464H16V96h448V464z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M352,360h-48V259.312l20.288,20.28c3.178,3.07,8.242,2.982,11.312-0.196   c2.995-3.1,2.995-8.016,0-11.116l-33.936-33.928c-3.12-3.128-8.186-3.135-11.314-0.014c-0.005,0.005-0.01,0.01-0.014,0.014   L256.4,268.28c-3.07,3.178-2.982,8.242,0.196,11.312c3.1,2.995,8.016,2.995,11.116,0L288,259.312V360h-96V259.312l20.288,20.28   c3.07,3.178,8.134,3.266,11.312,0.196c3.178-3.07,3.266-8.134,0.196-11.312c-0.064-0.067-0.13-0.132-0.196-0.196l-33.936-33.928   c-3.12-3.128-8.186-3.135-11.314-0.014c-0.005,0.005-0.01,0.01-0.014,0.014L144.4,268.28c-3.178,3.069-3.266,8.134-0.196,11.312   c3.069,3.178,8.134,3.266,11.312,0.196c0.067-0.064,0.132-0.13,0.196-0.196L176,259.312V360h-48c-4.418,0-8,3.582-8,8s3.582,8,8,8   h224c4.418,0,8-3.582,8-8S356.418,360,352,360L352,360z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M192,176h96c13.255,0,24-10.745,24-24s-10.745-24-24-24h-96c-13.255,0-24,10.745-24,24   S178.745,176,192,176z M192,144h96c4.418,0,8,3.582,8,8s-3.582,8-8,8h-96c-4.418,0-8-3.582-8-8S187.582,144,192,144z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M56,440h16v16H56V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M24,440h16v16H24V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M88,440h16v16H88V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M120,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path id="SVGCleanerId_0" style="fill:#212121" d="M152,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><g><path id="SVGCleanerId_0_1_" style="fill:#212121" d="M152,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/></g><path style="fill:#212121" d="M184,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M216,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M248,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M280,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M312,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M344,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M376,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M408,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/><path style="fill:#212121" d="M440,440h16v16h-16V440z" data-original="#231F20" class="active-path" data-old_color="#231F20"/></g></g></svg>'
                                        +'<h3>No list found</h3>'
                                        +'<p class="mx-auto" style="max-width:240px">There is no list at this moment, please try to fill up the dates to see past activity.</p>'
                                    +'</div>'
                                +'</div></div>';
                console.log("nothing to found");
                $$(page.container).find('.page-content').append(listHTML);
            }

        },
        error: function (error) {
            console.log("error");
            //console.log(error);
        }
    });

}

function resetData(page, token)
{
    var url = base_url+"/api/order";
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {
            console.log("reset me");
            console.log(data);
            //console.log(data.data);
            var size = Object.keys(data.data).length;
            if(size == 0) {
                $$('#signature-pad').hide();
                $$('.infinite-scroll-preloader').hide();

            }
            else {

                $$(page.container).find('.page-content').find('#id-not-found').html("");
                $$(page.container).find('.page-content').find('.list-block').find('ul').empty();

                $$(page.container).find('#loader-here').hide();
                $$('#signature-pad').hide();
                //var listHTML = '';

                //var listHTML = '<div class = "list-block media-list">';
                var listHTML = '<ul>';
                $$.each(data.data, function(k, v) {

                    console.log(v);

                    listHTML += '<li>';
                    listHTML += '<a href="about.html?id='+ v.order_id +'" class="item-link item-content">';
                    listHTML += '<div class = "item-inner">';
                    listHTML += '<div class = "item-title-row">';
                    listHTML += '<div class = "item-title">'+v.suffix+" "+ v.fname +" "+v.mname+" "+v.lname+'</div>';
                    listHTML += '<div class="item-after">'+v.date+'</div>';
                    listHTML += '</div>';
                    listHTML += '<div class="item-subtitle">'+ v.branch_name +'</div>';
                    listHTML += '<div class="item-text"> Service Type : '+ v.service_type+'</div>';
                    listHTML += '</div>';
                    listHTML += '</a>';
                    listHTML += '</li>';

                });

                listHTML += '</ul>';

                $$(page.container).find('.page-content').find('.list-block').append(listHTML);

                $$('.infinite-scroll-preloader').hide();
                $$('#signature-pad').hide();

            }

        },
        error: function (error) {
            console.log("error");
            console.log(error);
        }
    });
}

function getDefaultHistoryList(page, token, url)
{

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

                $$(page.container).find('.page-content').find('.list-block').find('ul').empty();

                $$(page.container).find('#loader-here').hide();
                $$('#signature-pad').hide();
                //var listHTML = '';

                //var listHTML = '<div class = "list-block media-list">';
                var listHTML = '<ul>';
                $$.each(data.data, function(k, v) {

                    listHTML += '<li>';
                    listHTML += '<a href="about-history.html?id='+ v.order_id +'" class="item-link item-content">';
                    listHTML += '<div class="item-media"><span class="moname">Sep<span class="moday">23</span></span></div>';
                    listHTML += '<div class = "item-inner">';
                    listHTML += '<div class = "item-title-row">';
                    listHTML += '<div class = "item-title">'+v.suffix+" "+ v.fname +" "+v.mname+" "+v.lname+'</div>';
                    // listHTML += '<div class="item-after">'+v.date+'</div>';
                    listHTML += '</div>';
                    listHTML += '<div class="item-subtitle">'+ v.branch_name +'</div>';
                    listHTML += '<div class="item-text">'+ v.service_type+'</div>';
                    listHTML += '</div>';
                    listHTML += '</a>';
                    listHTML += '</li>';

                });

                listHTML += '</ul>';

                $$(page.container).find('.page-content').find('.list-block').append(listHTML);

                $$('.infinite-scroll-preloader').hide();
                $$('#signature-pad').hide();

            }

        },
        error: function (error) {
            console.log("error");
            console.log(error);
        }
    });
}

function customerPullToRefresh(ptrContent)
{

    ptrContent.find('ul').empty();
    getCustomer(ptrContent);

}

function getCustomer(ptrContent)
{

    var token= $$('meta[name="token"]').attr("content");

    var url = base_url+"/api/customer";
    $$.ajax({
        type: "GET",
        dataType: "json",
        //url: 'http://192.168.1.224/iwash/api/customer',
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {
            //console.log("this is data");
            //console.log(data.data);
            //data = $$.parseJSON(data);
            $$.each(data.data, function(k, v) {
                // console.log("append me");
                // console.log(k);
                // console.log(v);
                // Dummy Content
                //var songs = v.fname ;
                //var authors = ['Beatles', 'Queen', 'Michael Jackson', 'Red Hot Chili Peppers'];
                // Random image
                var defaultImage = base_url+'/assets/img/users/noimage.gif';
                //var picURL = v.profile;
                var picURL = v.profile ? v.profile : defaultImage;
                //var picURL = v.profile;
                // Random song
                var song = v.fname+" "+v.mname+" "+v.lname;
                // Random author
                var author = v.title;
                var itemHTML = '<li>' +
                    '<a href="customer-detail.html?id='+ v.custID +'"class="item-link item-content">'+
                    '<div class="item-media"><img src="' + picURL + '" width="44"/></div>' +
                    '<div class="item-inner">' +
                    '<div class="item-title-row">' +
                    '<div class="item-title">' + song + '</div>' +
                    '</div>' +
                    '<div class="item-subtitle"> +63 923 5410 912</div>' +
                    // '<div class="item-subtitle">' + author + '</div>' +
                    '</div>' +
                    '</a>' +
                    '</li>';
                // Prepend new list element
                ptrContent.find('ul').prepend(itemHTML);
            });


            //listHTML += '<a href="about-history.html?id='+ v.order_id +'" class="item-link item-content">';
           // $$(page.container).find('.page-content').find('.list-block').find('ul').append(itemHTML);

        }
    });
}

function getProvince(provinceID)
{


    console.log("THIS IS PROVINCE ID");
    console.log(provinceID);

    var default_province_id = 0;
    var token= $$('meta[name="token"]').attr("content");

    var url = base_url+"/api/province";
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {
            default_province_id = data.data[0].provinceID;
            console.log(default_province_id);
            $$.each(data.data, function(k, v) {
                if(provinceID == v.provinceID) {
                    myApp.smartSelectAddOption('#id-smart-select-province select', '<option value="' + v.provinceID + '" selected>' + v.province + '</option>');
                }
                else {
                    myApp.smartSelectAddOption('#id-smart-select-province select', '<option value="' + v.provinceID + '">' + v.province + '</option>');
                }
            });
            return default_province_id;
        }
    });
}

function getCities(provinceID, cityID)
{
    var token= $$('meta[name="token"]').attr("content");
    var url = base_url+"/api/cities/"+provinceID;
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {
            $$.each(data.data, function(k, v) {
                if(cityID == v.cityID) {
                    myApp.smartSelectAddOption('#id-smart-select-city select', '<option value="' + v.cityID + '" selected>' + v.city + '</option>');
                }
                else {
                    myApp.smartSelectAddOption('#id-smart-select-city select', '<option value="' + v.cityID + '">' + v.city + '</option>');
                }
            });
        }
    });
}
function getBarangay(provinceID, cityID, barangayID)
{
    console.log("provinceID",provinceID);
    console.log("city id",cityID);
    var token= $$('meta[name="token"]').attr("content");
    var url = base_url+"/api/barangays/"+provinceID+":"+cityID;
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {
            $$.each(data.data, function(k, v) {
                if(barangayID == v.barangayID) {
                    myApp.smartSelectAddOption('#id-smart-select-barangay select', '<option value="' + v.barangayID + '" selected>' + v.barangay + '</option>');
                }
                else {
                    myApp.smartSelectAddOption('#id-smart-select-barangay select', '<option value="' + v.barangayID + '">' + v.barangay + '</option>');
                }
            });
        }
    });
}
function addCustomer(data)
{
    var token= $$('meta[name="token"]').attr("content");
    var url = base_url+"/api/customer";
    myApp.showPreloader('Saving to server.');
    setTimeout(function () {
        $$.ajax({
            type: "POST",
            dataType: "json",
            url: url,
            headers: {
                'Authorization': token,
            },
            data: data,
            success: function (data) {
                myApp.hidePreloader();
                mainView.router.loadContent($$('#id-customer-page').html());
            },
            error: function(xhr){
                console.log("error creating customer");
                myApp.hidePreloader();
                console.log(xhr.responseText);
                var error = JSON.parse(xhr.responseText);
                myApp.alert(error.message, 'Error creating customer!');
            }
        });
    }, 2000);
}
function customer_details(id, page)
{
    var token= $$('meta[name="token"]').attr("content");
    var url = base_url+"/api/customer-details/"+id;
    $$.ajax({
        type: "GET",
        dataType: "json",
        //url: 'http://192.168.1.224/iwash/api/customer',
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {

            $$.each(data.data, function(k, v) {

                var picURL = 'http://192.168.1.224/iwash/assets/img/users/noimage.gif';
                // Random song
                var customer_name = v.suffix+" "+v.fname+" "+v.mname+" "+v.lname,
                province_name = v.province_name ? v.province_name : "",
                barangay_name = v.barangay_name ? v.barangay_name : "",
                city_name = v.city_name ? v.city_name : "",
                telephone = v.telephone ? v.telephone : "",
                contact = v.contact ? v.contact : "",
                address = v.address ? v.address : "",
                regular = (v.isRegular == 'Y') ? "YES" : "NO",
                picURL = v.profile ? v.profile : picURL,
                title = v.title ? v.title : "";

                // Random author
                var author = v.title;
                var itemHTML = '<div class="profile mt-5"><div class="item-media"><img src="'+picURL+'"></div></div>'+
                                '<div class="list-block media-list list-view mt-10 mb-0">'+
                                '<ul>'+
                                '<li>'+
                                    '<div class="item-content">'+
                                        '<div class="item-inner">'+
                                            '<div class="item-subtitle">Name</div>'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+customer_name+'</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '<li>'+
                                    '<div class="item-content">'+
                                        '<div class="item-inner">'+
                                            '<div class="item-subtitle">Birth date</div>'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+v.bday+'</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '<li>'+
                                    '<div class="item-content">'+
                                        '<div class="item-inner">'+
                                            '<div class="item-subtitle">Province</div>'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+province_name+'</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '<li>'+
                                    '<div class="item-content">'+
                                        '<div class="item-inner">'+
                                            '<div class="item-subtitle">Barangay</div>'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+barangay_name+'</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '<li>'+
                                    '<div class="item-content">'+
                                        '<div class="item-inner">'+
                                            '<div class="item-subtitle">City</div>'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+city_name+'</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '<li>'+
                                    '<div class="item-content">'+
                                        '<div class="item-inner">'+
                                            '<div class="item-subtitle">Address</div>'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+address+'</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '<li>'+
                                    '<div class="item-content">'+
                                        '<div class="item-inner">'+
                                            '<div class="item-subtitle">Telephone</div>'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+telephone+'</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '<li>'+
                                    '<div class="item-content">'+
                                        '<div class="item-inner">'+
                                            '<div class="item-subtitle">Contact</div>'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+contact+'</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '<li>'+
                                    '<div class="item-content">'+
                                        '<div class="item-inner">'+
                                            '<div class="item-subtitle">Regular</div>'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+regular+'</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                '</li>'+
                                '</ul>'+
                                '</div>'+
                                '</div>'+
                                '<div class="speed-dial">' +
                                    '<a href="#" class="floating-button color-red"><i class="material-icons">edit</i><i class="icon icon-close"></i></a>' +
                                    '<div class="speed-dial-buttons">' +
                                        '<a href="customer-edit.html?id='+v.custID+'" class="link color-black"><i class="la la-edit"></i></a>' +
                                        '<a href="javascript:delete_customer('+v.custID+');" class="link color-black" id="id-delete"><i class="la la-trash-o"></i></a>' +
                                    '</div>' +
                                '</div>';
                $$(page.container).find('.page-content').find('.content-block-inner').append(itemHTML);
            });

        }
    });
}

function delete_customer(id){
    myApp.confirm('Are you sure you want to delete this customer?','<span class="icon bg-red"><i class="material-icons">delete</i></span>Delete Customer',function () {
        console.log("delete customer", id);
        var token= $$('meta[name="token"]').attr("content");

        var url = base_url+"/api/customer-delete/"+id;
        $$.ajax({
            type: "DELETE",
            //url: 'http://192.168.1.224/iwash/api/customer',
            url: url,
            headers: {
                'Authorization': token,
            },
            success: function (data) {
                //console.log(data);

                mainView.router.loadContent($$('#id-customer-page').html());
            },
            error: function(xhr) {
                console.log("error delete");
                console.log(xhr);
            }
        });
    });
}
function delete_order(id){
    myApp.confirm('Are you sure you want to delete this order?','<span class="icon bg-red"><i class="material-icons">delete</i></span>Delete Order', function () {
        myApp.showPreloader('Deleting data.');
        setTimeout(function () {
            console.log("delete customer", id);
            var token= $$('meta[name="token"]').attr("content");

            var url = base_url+"api/order-delete/"+id;
            $$.ajax({
                type: "DELETE",
                //url: 'http://192.168.1.224/iwash/api/customer',
                url: url,
                headers: {
                    'Authorization': token,
                },
                success: function (data) {
                    //console.log(data);
                    myApp.hidePreloader();
                    mainView.router.loadContent($$('#id-page-order-list').html());
                },
                error: function(xhr) {
                    myApp.hidePreloader();
                    console.log("error delete");
                    console.log(xhr);
                }
            });

        }, 2000);
    });
}
function updateCustomer(data, id) {
    myApp.confirm('Are you sure you want to update this customer?','<span class="icon bg-red"><i class="material-icons">restore_page</i></span>Update Customer', function () {
        var token= $$('meta[name="token"]').attr("content");
        var url = base_url+"/api/customer-update/"+id;
        $$.ajax({
            type: "PUT",
            url: url,
            headers: {
                'Authorization': token,
            },
            data: data,
            success: function (data) {
                mainView.router.loadContent($$('#id-customer-page').html());
            },
            error: function(xhr) {
                console.log("error delete");
                console.log(xhr);
                var error = JSON.parse(xhr.responseText);
                myApp.alert(error.message, 'Error Updating customer!');
            }
        });
    });
}

function getCustomerSmartSelect(custID)
{
    var token= $$('meta[name="token"]').attr("content");
    var url = base_url+"/api/customer";
    $$.ajax({
        type: "GET",
        dataType: "json",
        //url: 'http://192.168.1.224/iwash/api/customer',
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {
            //console.log("this is data");
            //console.log(data.data);
            //data = $$.parseJSON(data);
            $$.each(data.data, function(k, v) {
                if(v.custID == custID) {
                    //myApp.smartSelectAddOption('#id-smart-select-customer select selected', '<option value="' + v.custID + '">' + v.fname +" "+v.mname+" "+v.lname+ '</option>',0);
                    myApp.smartSelectAddOption('#id-smart-select-customer select', '<option value="' + v.custID + '">' + v.fname +" "+v.mname+" "+v.lname+ 'selected</option>',0);
                }
                else {
                    //console.log("NOT EQUEL");
                    myApp.smartSelectAddOption('#id-smart-select-customer select', '<option value="' + v.custID + '">' + v.fname +" "+v.mname+" "+v.lname+ '</option>');
                }

            });

        }
    });
}

function getServices(servinceID)
{
    var token= $$('meta[name="token"]').attr("content");

    var url = base_url+"/api/services";
    $$.ajax({
        type: "GET",
        dataType: "json",
        //url: 'http://192.168.1.224/iwash/api/customer',
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {
            //console.log("this is data");
            //console.log(data.data);
            //data = $$.parseJSON(data);
            var services_ids = [];
            $$.each(data.data, function(k, v) {
                var str = v.serviceType;
                str = str.replace(/ +/g, "");
                services_ids.push(v.serviceID+str);
                myApp.smartSelectAddOption('#id-smart-select-services select', '<option value="' + v.serviceID + '">' + v.serviceType +'</option>');
            });



            var data_service_ids = JSON.stringify(services_ids);
            var service_type_data = JSON.stringify(data.data);
            //console.log(data);
            $$('meta[name="service_ids"]').attr("content", data_service_ids);
            $$('meta[name="service_types"]').attr("content", service_type_data);
            myApp.hidePreloader();
        },
        error: function(exr){
            console.log("ERROR REQUEST");
        }
    });
}


function getCategories(serviceID, the_id)
{
    console.log("GET CATEGORIES");
    console.log("SERVICE ID", serviceID);
    console.log("THE ID", the_id);
    var token= $$('meta[name="token"]').attr("content");

    var url = base_url+"/api/categories/"+serviceID;
    $$.ajax({
        type: "GET",
        dataType: "json",
        //url: 'http://192.168.1.224/iwash/api/customer',
        url: url,
        headers: {
            'Authorization': token,
        },
        success: function (data) {

            console.log("the id of table", the_id);
            $$('#order-table'+the_id).find('#tr-head'+the_id).empty();
            $$('#order-table'+the_id).find('#tr-head'+the_id)
                .append($$('<th>').attr('class', 'numeric-cell').text('CATEGORY'))
                .append($$('<th>').attr('class', 'numeric-cell').text('QUANTITY'));
            var table = $$('#order-table'+the_id).find('tbody');

            $$.each(data.data, function(k, v) {
                //data-service-id="'+this.value+'">'
                console.log("categories value");
                console.log(v.category);
                console.log('--service id', serviceID);
                table.append($$('<tr data-service-id="'+serviceID+'">').attr('class', 'item')
                    .append($$('<td>').attr('class', "label-cell").text(v.category.capitalize()))
                    .append($$('<td>').attr('class', "numeric-cell")
                        .append($$('<input>').attr('type',"number").attr('class', 'quantity').css('background-color','#EFEFEF')))
                    .append($$('<td>').attr('class', "numeric-cell")
                        .append($$('<input>').attr('type',"hidden").attr('class', 'category_id').attr('value', v.clothesCatID)))

                );
            });


            var data_categories = JSON.stringify(data.data);
            $$('meta[name="categories"]').attr("content", data_categories);

        }
    });
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function createOrder(data, grand_total, customer_id, remarks, category_data)
{
    var token= $$('meta[name="token"]').attr("content");

    var url = base_url+"/api/create-order";

    myApp.showPreloader('Saving to server.');
    setTimeout(function () {
        $$.ajax({
            type: "POST",
            dataType: "json",
            url: url,
            headers: {
                'Authorization': token,
            },
            data: { data: data, customer_id: customer_id, grand_total: grand_total, remarks: remarks, category_data: category_data},
            success: function (data) {
                myApp.hidePreloader();

                mainView.router.loadContent($$('#id-page-order-list').html());
            },
            error: function(xhr){
                console.log("error creating customer");
                myApp.hidePreloader();
                console.log(xhr.responseText);
                var error = JSON.parse(xhr.responseText);
                myApp.alert(error.message, 'Error creating customer!');
            }
        });


    }, 2000);
}

function getOrderForEdit(order_id, page) {
    var url = base_url + "/api/order-details/" + order_id;
    var token = $$('meta[name="token"]').attr("content");

    setTimeout(function () {
        $$.ajax({
            type: "GET",
            dataType: "json",
            url: url,
            headers: {
                'Authorization': token,
            },
            success: function (data) {
                var order_details = [];
                var delivery_fee = 0, rate = 0, total_amount = 0;
                var dynamic_services = "";
                var branchName = $$('meta[name="branchName"]').attr("content");
                $$('#id-branch').val(branchName);
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth()+1; //January is 0!
                var yyyy = today.getFullYear();
                if(dd<10) {
                    dd = '0'+dd
                }
                if(mm<10) {
                    mm = '0'+mm
                }
                today = yyyy+"-"+mm+"-"+dd;
                $$('#id-date').val(today);
                $$.each(data.data, function (k, v) {
                    getCustomerSmartSelect(v.custID);

                    var ids = [];
                    v.order_details.forEach(element =>{
                        ids.push(element.serviceID);
                    });
                    localStorage.setItem("service_ids", JSON.stringify(ids));


                    var categories = [];
                    v.order_details.forEach(element =>{
                        var service_ids = $$('meta[name="service_ids"]').attr("content");
                        var service_ids = JSON.parse(service_ids);

                        createTableForServices(element.serviceID, element.serviceType, page, element.unit, element.rate, element.regRate, element.qty, element.amount, element.categories, service_ids);
                    });
                    var service_ids = $$('meta[name="service_ids"]').attr("content");
                    var service_ids = JSON.parse(service_ids);
                    for(var i =0; i<service_ids.length; i++)
                    {
                        var id = "#id-remove-more-"+service_ids[i];
                        $$(document).on("click", id, function(){
                            console.log("remove");
                            var parent = $$(this).parent().parent().parent().attr("id");
                            var id = $$(this).attr('id');
                            if("remove-"+id == parent) {
                                var data_bind_service_id = $$(this).parent().parent().parent().data('service-id');
                                console.log(data_bind_service_id);
                                console.log("remove me");
                                //update local storage
                                var local_service_ids  = JSON.parse(localStorage.getItem("service_ids"));
                                //console.log(local_service_ids);
                                var filterServiceId = local_service_ids.filter(function(e) {return e !== data_bind_service_id} );
                                localStorage.setItem("service_ids", JSON.stringify(filterServiceId));
                                //$$("#"+parent).remove();
                                var elem = document.getElementById(parent);
                                elem.remove();
                                calculateGrandTotal(service_ids);
                            }
                            return false;
                        });
                    }
                    //calculate grand total
                    calculateGrandTotal(service_ids);
                    $$('#remarks').val(v.remarks);
                    $$('#id-order').val(order_id);

                    $$('#id-my-preloader').hide();
                });
            },
            error: function(xhr) {
                $$('#id-my-preloader').hide();
                console.log("error get order");
                //console.log(xhr);
            }
        });

    }, 2000);

}
function createTableForServices(value, text, page, unit, rate, regRate, qty, amount, categories, service_ids)
{
    var str = text;
    str = str.replace(/ +/g, "");
    var the_id = value+str;
    var remove_more_id = "id-remove-more-"+value+str;
    var id_container = "remove-"+remove_more_id;
    var class_quantity = "quantity-"+value;
    var class_amount = "amount-"+value;
    var ul_id = "ul-class-"+value+str;

    var UNIT = unit;
    var REGULAR_RATE = rate;
    var DISCOUNTED_RATE = regRate;


    var table = $$('<div data-service-id="'+value+'">').attr('class', "data-table data-table-init card").attr('id', id_container)
        .append($$('<div>').attr('class', "card-header")
            .append($$('<span>').text(text.capitalize()).attr('name',value))
            .append($$('<div>').attr('class', "data-table-links")
                .append($$('<a>').attr('class', "link icon-only").attr('class', "la la-trash-o").attr('id', remove_more_id))
            )
        )
        .append($$('<div>').attr('class', "card-content")
            .append($$('<table>').attr('id', 'order-table'+the_id)
                .append($$('<tr>').attr('id', 'tr-head'+the_id))
                .append($$('<tbody>'))
            )
        )
        //quantity
        .append($$('<ul>').attr('id', ul_id)
            .append($$('<li>')
                .append($$('<div>').attr('class', 'item-content')
                    .append($$('<div>').attr('class','item-inner')
                        .append($$('<div>').attr('class','item-title label').text("Quantity"))
                        .append($$('<div>').attr('class', 'item-input')
                            .append($$('<input>').attr('type', 'number').attr('value', qty).attr('class', class_quantity))
                        ) 
                    )
                )
            )
            //unit
            .append($$('<li>')
                .append($$('<div>').attr('class', 'item-content')
                    .append($$('<div>').attr('class','item-inner')
                        .append($$('<div>').attr('class','item-title label').text("Unit"))
                        .append($$('<div>').attr('class', 'item-input')
                            .append($$('<input>').attr('value', UNIT).attr('readonly', true).attr('class', 'readonly'))
                        )
                    )
                )
            )
            //rate
            .append($$('<li>')
                .append($$('<div>').attr('class', 'item-content')
                    .append($$('<div>').attr('class','item-inner')
                        .append($$('<div>').attr('class','item-title label').text("Rate"))
                        .append($$('<div>').attr('class', 'item-input')
                            .append($$('<input>').attr('value', REGULAR_RATE).attr('readonly', true).attr('class', 'readonly'))
                        )
                    )
                )
            )
            //amount
            .append($$('<li>')
                .append($$('<div>').attr('class', 'item-content')
                    .append($$('<div>').attr('class','item-inner')
                        .append($$('<div>').attr('class','item-title label').text("Amount"))
                        .append($$('<div>').attr('class', 'item-input')
                            .append($$('<input>').attr('readonly', true).attr('class', 'my-amount').attr('value', amount).attr('class', 'readonly'))
                        )
                    )
                )
            )
        );


    $$(page.container).find('.page-content').find('#id-display-category').append(table);

    categories.forEach(element => {
        $$('#order-table'+the_id, document).find('#tr-head'+the_id).empty();
        $$('#order-table'+the_id, document).find('#tr-head'+the_id)
            .append($$('<th>').attr('class', 'numeric-cell').text('CATEGORY'))
            .append($$('<th>').attr('class', 'numeric-cell').text('QUANTITY'));
        var table = $$('#order-table'+the_id, document).find('tbody');
        table.append($$('<tr>').attr('class', 'item')
            .append($$('<td>').attr('class', "label-cell").text(element.category.capitalize()))
            .append($$('<td>').attr('class', "numeric-cell")
                .append($$('<input>').attr('value', element.qty).attr('type',"number").attr('class', 'quantity')))
            .append($$('<td>').attr('class', "numeric-cell")
                .append($$('<input>').attr('type',"hidden").attr('class', 'category_id').attr('value', element.clothesCatID)))

        );
    });


    $$("."+class_quantity).on('keyup', function(){

        //loop all services
        var rate = $$(this).closest('li').next('li').next('li').find('input').val();
        var total = rate * this.value;
        $$(this).closest('li').next('li').next('li').next('li').find('input').val(total);

        calculateGrandTotal(service_ids);
    });
}

function checkCreateOrder(page)
{
    var dynamic_services = "";
    $$('#id-click-services').on('click', function(){
        dynamic_services = JSON.parse(localStorage.getItem("service_ids"));
        console.log("on click");
        //console.log(dynamic_services);
    });

    //get service type
    $$('#form_entry_services').on('change', function() {

        //detect if picker is closed after a selection is made for additional actions:
        $$('.picker-modal').on('close', function() {
            //console.log('Picker closed after selecting an item!');
            //additional actions here
            //var cars = [];
            $$('select[name="serviceID"] option:checked').each(function () {

                if(dynamic_services) {
                    for (var i = 0; i<dynamic_services.length; i++) {
                        if(dynamic_services[i] == this.value) {
                            myApp.alert("Already exist");
                            return false;
                        }
                    }
                    dynamic_services.push(this.value);
                    localStorage.setItem("service_ids", JSON.stringify(dynamic_services));
                }
                else {
                    var ids = [];
                    ids.push(this.value);
                    localStorage.setItem("service_ids", JSON.stringify(ids));
                }
                //get services types
                var service_type = $$('meta[name="service_types"]').attr("content");
                var service_type = JSON.parse(service_type);
                //console.log("THE SERVICES TYPES");
                //console.log(service_type);
                var UNIT = "";
                var REGULAR_RATE = "";
                var DISCOUNTED_RATE = "";
                for(var i=0; i < service_type.length; i++) {
                    if(service_type[i].serviceID == this.value) {
                        UNIT = service_type[i].unit;
                        DISCOUNTED_RATE = service_type[i].discountedRate;
                        REGULAR_RATE = service_type[i].regRate;
                    }
                }

                var str = this.text;
                str = str.replace(/ +/g, "");
                var the_id = this.value+str;
                var remove_more_id = "id-remove-more-"+this.value+str;
                var id_container = "remove-"+remove_more_id;
                var class_quantity = "quantity-"+this.value;
                var class_amount = "amount-"+this.value;
                var ul_id = "ul-class-"+this.value+str;
                $$(page.container).find('.card-group')
                    .prepend($$('<div data-service-id="'+this.value+'">').attr('class', "data-table data-table-init card").attr('id', id_container)
                        .append($$('<div>').attr('class', "card-header")
                            .append($$('<span>').text(this.text.capitalize()).attr('name',this.value),'<div class="chip bg-green mr-auto ml-10"><div class="chip-label color-white">New</div></div>')
                            .append($$('<div>').attr('class', "data-table-links")
                                .append($$('<a>').attr('class', "link icon-only").attr('class', "material-icons").attr('id', remove_more_id).text('clear'))
                            )
                        )
                        .append($$('<div>').attr('class', "card-content")
                            .append($$('<table>').attr('id', 'order-table'+the_id)
                                .append($$('<tr>').attr('id', 'tr-head'+the_id))
                                .append($$('<tbody>'))
                            )
                        )
                        //quantity
                        .append($$('<ul>').attr('id', ul_id)
                            .append($$('<li>')
                                .append($$('<div>').attr('class', 'item-content')
                                    .append($$('<div>').attr('class','item-inner')
                                        .append($$('<div>').attr('class','item-title label').text("Quantity"))
                                        .append($$('<div>').attr('class', 'item-input')
                                            .append($$('<input>').attr('type', 'number').attr('class', class_quantity)
                                            )
                                        )
                                    )
                                )
                            )
                            //unit
                            .append($$('<li>')
                                .append($$('<div>').attr('class', 'item-content')
                                    .append($$('<div>').attr('class','item-inner')
                                        .append($$('<div>').attr('class','item-title label').text("Unit"))
                                        .append($$('<div>').attr('class', 'item-input')
                                            .append($$('<input>').attr('value', UNIT).attr('readonly', true).attr('class', 'readonly'))
                                        )
                                    )
                                )
                            )
                            //rate
                            .append($$('<li>')
                                .append($$('<div>').attr('class', 'item-content')
                                    .append($$('<div>').attr('class','item-inner')
                                        .append($$('<div>').attr('class','item-title label').text("Rate"))
                                        .append($$('<div>').attr('class', 'item-input')
                                            .append($$('<input>').attr('value', REGULAR_RATE).attr('readonly', true).attr('class', 'readonly'))
                                        )
                                    )
                                )
                            )
                            //amount
                            .append($$('<li>')
                                .append($$('<div>').attr('class', 'item-content')
                                    .append($$('<div>').attr('class','item-inner')
                                        .append($$('<div>').attr('class','item-title label').text("Amount"))
                                        .append($$('<div>').attr('class', 'item-input')
                                            .append($$('<input>').attr('readonly', true).attr('class', class_amount).attr('class', 'readonly'))
                                        )
                                    )
                                )
                            )
                        )
                    );

                //getCategories(this.value);
                service_id = this.value;
                var SERVICE_TYPE = this.text;
                var service_ids = $$('meta[name="service_ids"]').attr("content");

                var service_ids = JSON.parse(service_ids);
                for(var i =0; i<service_ids.length; i++)
                {
                    var id = "#id-remove-more-"+service_ids[i];
                    //var remove_id = "remove-id-remove-more-"+service_ids[i];
                    $$(id).on("click", function(){
                        console.log("remove");
                        var parent = $$(this).parent().parent().parent().attr("id");
                        var id = $$(this).attr('id');
                        //console.log("parent : ", parent);
                        //console.log("id : ", id);
                        if("remove-"+id == parent) {
                            var data_bind_service_id = $$(this).parent().parent().parent().data('service-id');
                            //update local storage
                            var local_service_ids  = JSON.parse(localStorage.getItem("service_ids"));
                            var filterServiceId = local_service_ids.filter(function(e) {return e !== data_bind_service_id} );
                            localStorage.setItem("service_ids", JSON.stringify(filterServiceId));
                            $$("#"+parent).remove();
                            calculateGrandTotal(service_ids);
                        }
                        return false;
                    });
                }

                //get categories
                getCategories(this.value, the_id);

                $$("."+class_quantity).on('keyup', function(){
                    //var grand_total = $$('#grand-total').val(432);
                    //loop all services
                    var rate = $$(this).closest('li').next('li').next('li').find('input').val();
                    var total = rate * this.value;
                    $$(this).closest('li').next('li').next('li').next('li').find('input').val(total);
                    //var result = +total + +grand_total;
                    //$$('#grand-total').val(result);
                    //var the_class = $$(this).parent().parent().parent().parent().parent().attr('id');
                    var the_class = $$(this).next().attr('id');
                    //console.log("the class", the_class);

                    //remove-id-remove-more-3regular
                    calculateGrandTotal(service_ids);
                });


            });
        });
    });
}

function setUpDate(page, from_id, to_id)
{

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10) {
        dd = '0'+dd
    }
    if(mm<10) {
        mm = '0'+mm
    }
    today = yyyy+"-"+mm+"-"+dd;
    //date = today+":"+today;

    $$(from_id).val(today);
    $$(to_id).val(today);
}

function updateOrder(data, grand_total, customer_id, remarks, category_data, order_id)
{
    var token= $$('meta[name="token"]').attr("content");

    var url = base_url+"/api/order-details-update";

    myApp.showPreloader('Saving to server.');
    setTimeout(function () {
        $$.ajax({
            type: "POST",
            dataType: "json",
            url: url,
            headers: {
                'Authorization': token,
            },
            data: { data: data, customer_id: customer_id, grand_total: grand_total, remarks: remarks, category_data: category_data, order_id: order_id},
            success: function (data) {
                myApp.hidePreloader();

                mainView.router.loadContent($$('#id-page-order-list').html());
            },
            error: function(xhr){
                console.log("error creating customer");
                myApp.hidePreloader();
                console.log(xhr.responseText);
                var error = JSON.parse(xhr.responseText);
                myApp.alert(error.message, 'Error creating customer!');
            }
        });
    }, 2000);
}