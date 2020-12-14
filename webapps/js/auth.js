
var BASE_URI = $('#BASE_URL').val()
$(document).ready(function () {

    // particlesJS.load('blocks', 'plugins/particlesjs-config.json', function () {
    // });

});
var telePhone = null;
function openRegisterModal() {

    $("#registerModal form")[0].reset();
    var phoneNo = document.querySelector("#phoneNo");
    if (telePhone) {
        telePhone.destroy();
    }
    telePhone = window.intlTelInput(phoneNo, {
        preferredCountries: ['us', 'in', 'gb']
    });

    $("#registerModal").modal({
        backdrop: 'static',
        keyboard: false
    });

}
function toggleInput(){
    if($("#password").hasClass('show')){
        $("#password").removeClass('show');
        $("#password").attr('type','text');
        $(".btnshow").addClass('d-none')
        $(".btnhide").addClass('d-block')
        $(".btnshow").removeClass('d-block')
        $(".btnhide").removeClass('d-none')

    }else{
        $("#password").addClass('show');
        $("#password").attr('type','password');
        $(".btnShow").addClass('d-block')
        $(".btnhide").addClass('d-none')
        $(".btnshow").removeClass('d-none')
        $(".btnhide").removeClass('d-block')
    }
}
function openResetModal() {

    $("#resetModal form")[0].reset();
    $("#resetModal").modal({
        backdrop: 'static',
        keyboard: false
    });

}


function login() {

    var emailId = $.trim($("#emailId").val());
    var password = $.trim($("#password").val());

    $("#loginButton").attr('disabled', 'disabled');

    $("#loginButton").html('<i class="fa fa-spinner fa-spin"></i> Authenticating...');

    var obj = {
        username: emailId.toLowerCase(),
        password: password,
    }

    loginCall(obj, function (status, data) {
        if (status) {
            if (data.login) {
                document.location = $('#BASE_URL').val() + '/main';
            } else {
                $("#loginButton").removeAttr('disabled');
                $("#loginButton").html('Login')
                errorMsg(data.message);
            }
        } else {
            $("#loginButton").removeAttr('disabled');
            $("#loginButton").html('Login')
            errorMsg('Username and/or Password are incorrect, Please try again');
        }
    })
}

function loginCall(obj, cbk) {
    $.ajax({
        url: API_URL + "/login",
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify(obj),
        success: function (data) {
            cbk(true, data);
        },
        error: function (e) {
            cbk(false, null);
        }
    });

}

function resetPassword() {

    var emailId = $.trim($("#emailAddress").val());
    var obj = {
        emailId: emailId
    }

    $("#resetButton").attr('disabled', 'disabled');

    $("#resetButton").html('<i class="fa fa-spinner fa-spin"></i> processing...');

    passwordCall(obj, function (status, data) {
        $("#resetButton").removeAttr('disabled');
        $("#resetButton").html('Proceed')
        if (status) {

            $("#resetModal form")[0].reset();
            $("#resetModal").modal('hide');
            successMsg("You will get an reset password email shortly.")

        } else {
            errorMsg('Something went wrong, Please try again');
            // errorMsg('Authentication Failed. Incorrect Username/Password')
        }
    })
}

function passwordCall(obj, cbk) {
    $.ajax({
        url: "/resetpassword",
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify(obj),
        success: function (data) {
            //called when successful
            cbk(true, data);
        },
        error: function (e) {
            //called when there is an error
            //console.log(e.message);
            cbk(false, null);
        }
    });

}

function register() {

    var firstName = $.trim($("#firstName").val());
    var lastName = $.trim($("#lastName").val());
    var businessEmail = $.trim($("#businessEmail").val());
    var phoneNo = $("#phoneNo").val();

    $("#regButton").attr('disabled', 'disabled');

    $("#regButton").html('<i class="fa fa-spinner fa-spin"></i> Creating Account...');

    var obj = {
        first_nam: firstName,
        last_nam: lastName,
        email_id: businessEmail.toLowerCase(),
        mobile_no: $("#phoneNo").val(),
        country_code: telePhone.selectedCountryData.iso2,
        dial_code: telePhone.selectedCountryData.dialCode,
    }
    obj['formatted_mobile'] = '+' + obj['dial_code'] + obj['mobile_no'];


    registerCall(obj, function (status, data) {
        if (status) {
            $("#regButton").removeAttr('disabled');
            $("#regButton").html('Register');

            $("#registerModal form")[0].reset();
            $("#registerModal").modal('hide');
            successMsg("Account registered successfully. You will get an activation email shorty.")

        } else {
            $("#regButton").removeAttr('disabled');
            $("#regButton").html('Register')
            errorMsg('Error occurred, Please try again');
        }
    })
}

function registerCall(obj, cbk) {
    $.ajax({
        url: "/register",
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify(obj),
        success: function (data) {
            //called when successful
            cbk(data.status, data);
        },
        error: function (e) {
            //called when there is an error
            //console.log(e.message);
            cbk(false, null);
        }
    });

}

function activateAccount() {

    var pass = $.trim($("#rpassword").val());
    var cpass = $.trim($("#cpassword").val());
    var obj = JSON.parse($("#iData").val())

    if (cpass != pass) {
        errorMsg('Password & confirm password are not matched')
        return false;
    }

    $("#activateButton").attr('disabled', 'disabled');
    $("#activateButton").html('<i class="fa fa-spinner fa-spin"></i> Activating Account...');

    obj['password'] = pass;
    obj['id'] = $("#uuid").val();

    var t1 = setTimeout(function () {
        $("#activateButton").html('<i class="fa fa-spinner fa-spin"></i> Initializing Modules...');
    }, 3000);

    var t2 = setTimeout(function () {
        $("#activateButton").html('<i class="fa fa-spinner fa-spin"></i> Processing Modules...');
    }, 6000);

    var t3 = setTimeout(function () {
        $("#activateButton").html('<i class="fa fa-spinner fa-spin"></i> Processing final steps...');
    }, 10000);

    activateCall(obj, function (status, data) {

        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)

        if (status) {
            $("#activateButton").html('Activated');
            successMsg("Account Activated successfully!")

            setTimeout(function () {
                document.location = BASE_PATH;
            }, 500)

        } else {
            $("#activateButton").removeAttr('disabled');
            $("#activateButton").html('Activate');
            if (data.error && data.error.includes('USER_EXISTS')) {
                errorMsg('Email ID already registered with us!');
            } else {
                errorMsg('Error occurred, Please try again');
            }

        }
    })
}

function activateCall(obj, cbk) {
    $.ajax({
        url: "/activate",
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify(obj),
        success: function (data) {
            //called when successful
            cbk(data.status, data);
        },
        error: function (e) {
            //called when there is an error
            //console.log(e.message);
            cbk(false, null);
        }
    });

}

function activateUserAccount() {

    var pass = $.trim($("#rpassword").val());
    var cpass = $.trim($("#cpassword").val());
    var obj = JSON.parse($("#iData").val())

    if (cpass != pass) {
        errorMsg('Password & confirm password are not matched')
        return false;
    }

    $("#activateButton").attr('disabled', 'disabled');
    $("#activateButton").html('<i class="fa fa-spinner fa-spin"></i> Activating Account...');

    obj['password'] = pass;
    obj['id'] = $("#uuid").val();

    var t1 = setTimeout(function () {
        $("#activateButton").html('<i class="fa fa-spinner fa-spin"></i> Initializing Modules...');
    }, 3000);

    var t2 = setTimeout(function () {
        $("#activateButton").html('<i class="fa fa-spinner fa-spin"></i> Processing Modules...');
    }, 6000);

    var t3 = setTimeout(function () {
        $("#activateButton").html('<i class="fa fa-spinner fa-spin"></i> Processing final steps...');
    }, 10000);

    activateUserCall(obj, function (status, data) {

        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)

        if (status) {
            $("#activateButton").html('Activated');
            successMsg("Account Activated successfully!")

            setTimeout(function () {
                document.location = BASE_PATH;
            }, 500)

        } else {
            $("#activateButton").removeAttr('disabled');
            $("#activateButton").html('Activate');
            errorMsg('Error occurred, Please try again');

        }
    })
}

function activateUserCall(obj, cbk) {
    $.ajax({
        url: "/user/activate",
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify(obj),
        success: function (data) {
            //called when successful
            cbk(data.status, data);
        },
        error: function (e) {
            //called when there is an error
            //console.log(e.message);
            cbk(false, null);
        }
    });

}

function setPassword() {

    var pass = $.trim($("#rpassword").val());
    var cpass = $.trim($("#cpassword").val());
    var obj = JSON.parse($("#iData").val())

    if (cpass != pass) {
        errorMsg('Password & confirm password are not matched')
        return false;
    }

    $("#activateButton").attr('disabled', 'disabled');
    $("#activateButton").html('<i class="fa fa-spinner fa-spin"></i> processing...');

    obj['password'] = pass;
    obj['id'] = $("#uuid").val();

    $.ajax({
        url: "/setpassword",
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify(obj),
        success: function (data) {
            $("#activateButton").removeAttr('disabled');
            $("#activateButton").html('Activate');

            if (data.status) {
                successMsg('New password has been updated');
                setTimeout(function () {
                    document.location = BASE_PATH;
                }, 500)
            } else {
                errorMsg('Error occurred, Please try again later');

            }


        },
        error: function (e) {
            errorMsg('Something went wrong, Please try again later');
        }
    });

}

function verifyLogin() {

    var code = $("#verificationCode").val();

    $("#loginButton").attr('disabled', 'disabled');
    $("#loginButton").html('<i class="fa fa-spinner fa-spin"></i> processing...');


    $.ajax({
        url: "/verifylogin",
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify({ code: code }),
        success: function (data) {

            if (data.status) {
                document.location = BASE_PATH;
            } else {
                $("#loginButton").removeAttr('disabled');
                $("#loginButton").html('Activate');

                errorMsg('Invalid Verification Code');

            }

        },
        error: function (e) {
            $("#loginButton").removeAttr('disabled');
            $("#loginButton").html('Activate');

            errorMsg('Something went wrong, Please try again later');
        }
    });

}



$(".toggle-password").click(function () {
    $(this).toggleClass("fa-eye fa-eye-slash");
    var input = $($(this).attr("toggle"));
    if (input.attr("type") == "password") {
        input.attr("type", "text");
    } else {
        input.attr("type", "password");
    }
});
