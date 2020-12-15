var BASE_PATH = $("#BASE_PATH").val();
$(document).ready(function () {
    $('.searchbar').css({'width':'40px','transition':'width 0.4s linear'})

    $(".currentYear").html(moment().format('YYYY'));

    $.ajaxSetup({
        // beforeSend: function(xhr, options) {
        //     if(options.dataType != "script"){
        //         console.log(options.url)
        //         if(options.url==='/login'){
        //             options.url = BASE_PATH + options.url;

        //         }else{
        //             options.url = API_URL + options.url;

        //         }
        //     }

        // }
    })

});

function logout() {
    Cookies.remove('myweb_cookie')
    document.location=BASE_PATH+'/login';
}


var s4 = function () {

    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

var generateUUID = function () {

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

function renderImgUrl(id) {

    return id; //API_URL+'/files/download/'+API_TOKEN+'/'+id;

}

function renderMode(type) {

    var str = '';

    if(type === 'sms'){
        str = '<i class="icon-speech"></i> SMS';
    }else if(type === 'voice'){
        str = '<i class="icon-phone"></i> VOICE';
    }else if(type === 'email'){
        str = '<i class="icon-envelope"></i> EMAIL';
    }

    return str

}

function showToast(type,title,msg) {
    $.toast({
        heading: title,
        text: msg,
        position: 'top-right',
        loaderBg:'#ffeb3b',
        icon: type,
        hideAfter: 3000,
        stack: 6

    });

}

function successMsg(msg) {

    swal({
        title: "Success",
        text: msg,
        type: "success",
        confirmButtonColor: '#4b81c2',
    });
}


function errorMsg(msg) {

    swal({
        title: "Error",
        text: msg,
        type: "error",
        confirmButtonColor: '#4b81c2',
    });
}


function warningMsg(msg) {

    swal({
        title: "Warning",
        text: msg,
        type: "warning",
        confirmButtonColor: '#fb9678',
    });
}

function renderUserStatus(obj) {
    var st = '';
    if(obj['status']){
        st = '<span class="bg-'+STATUS[obj['status']]+'" style="width: 8px;height: 8px;border-radius: 50%;content:\'\';display: inline-block;"></span>'
    }

    return st+' <a style="font-weight: 400" class="text-dark" href="#/profile/'+obj['email_id']+'" onclick="loadHeaderPage(\''+'/profile/'+obj['email_id']+'\')">'+ obj['first_nam']+' '+obj['last_nam'] +' <i class="fa fa-eye"></i></a>';
}

function buttonBlock(id) {

    $("#"+id).attr('disabled','disabled');
    $("#"+id).html('<i class="fa fa-spinner fa-spin"></i> processing');

}

function buttonUnBlock(id,text) {

    $("#"+id).removeAttr('disabled');
    $("#"+id).html(text);

}


function onlyNumber(obj) {
    var regex = /^[0-9]+$/;
    if (regex.test(obj.value) !== true) {
        obj.value = obj.value.replace(/[^0-9]+/, '');
    }
}



function localGet(name) {
    if (typeof (Storage) !== 'undefined') {

        const itemStr = localStorage.getItem(name)
        // if the item doesn't exist, return null
        if (!itemStr) {
            return null
        }
        const item = JSON.parse(itemStr)
        const now = new Date()
        // compare the expiry time of the item with the current time
        if (now.getTime() > item.expiry) {
            // If the item is expired, delete the item from storage
            // and return null
            localStorage.removeItem(name)
            return null
        }
        return item.value

    }
    else {
        errorMsg('Please use a modern browser to properly view this template!')
    }
}

function localStore(name, val) {
    if (typeof (Storage) !== 'undefined') {
        var obj = {
            value: val,
            expiry: new Date(moment().add(STORAGE_TTL,'hours')).getTime()
        }
        localStorage.setItem(name, JSON.stringify(obj))
    }
    else {
        errorMsg('Please use a modern browser to properly view this template!')
    }
}


function uploadFile(file,tag,cbk) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                var result = JSON.parse(xhr.response);
                cbk(API_URL + '/files/download/' + DOMAIN_KEY+":"+API_KEY + '/' + result.id)

            } else {
                cbk(null)
            }
        }else{
            cbk(null)
        }
    };
    xhr.open('POST', API_URL + '/files/upload/' + API_TOKEN, true);
    var formData = new FormData();
    formData.append("binfile", file, file.name);
    formData.append("mediaType", file.type);
    formData.append("tags", tag);
    formData.append("description", '');
    xhr.send(formData);
}
function searchToggle(){
$('#searchIcon').addClass('d-none')
$('#searchIcon').removeClass('d-inline-block')
$('#closeIcon').removeClass('d-none')
$('#closeIcon').addClass('d-inline-block')
    $('.searchbar').addClass('searchbarHover')
    $('.search_input').css({'width':'90%','padding':'10px'})

    $('.searchbar').css({'width':'350px','transition':'width 0.4s linear'})


}
function searchcloseToggle(){
    $('#searchIcon').removeClass('d-none')
    $('#searchIcon').addClass('d-inline-block')
    $('#closeIcon').addClass('d-none')
    $('.search_input').css({'width':'0','padding':'0px'})
    $('#closeIcon').removeClass('d-inline-block') 
    $('.searchbar').removeClass('searchbarHover')
    $('.searchbar').css('width','40px')
}
function capitalizeFLetter(word) {
    var wordArray = word.split(" ");
    var result = "";
    for (let i = 0; i < wordArray.length; i++) {
    const element = wordArray[i];
    result += element.charAt(0).toUpperCase() +
    element.slice(1) + " "
    }
    return result.slice(0, -1)
    }
