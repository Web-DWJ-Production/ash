// APP JS

var loginCtrl = {};

loginCtrl.login = function () {
    var body = {
        email: document.getElementById('login_email_input').value,
        password: document.getElementById('login_password_input').value
    }
    cinnabarisland.post('/api/auth', body, function (data) {
        loginCtrl.token = data.substring(1, data.length - 1);

        localStorage.setItem('SAToken', loginCtrl.token);
        linksCtrl.redirectToEmployees();
    }, null, true);
}

var linksCtrl = {};

linksCtrl.redirectToEmployees = function () {
    var headers = {
        Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken'))
    };

    cinnabarisland.get('/employees', function (data) {
        document.open();
        document.write(data);
        document.close();
    }, headers, true);
}


function EmployeesCtrl() {
    this.adminIf = new SparkIf(document.getElementById('employees-admin-component'), false);
    this.homeIf = new SparkIf(document.getElementById('employees-home-component'), true);
    this.users = null;


    this.getUsers = function() {
        var headers = {
            Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken'))
        };

        cinnabarisland.get('/api/users', function (data) {
            var json = JSON.parse(data);
            var temp = document.getElementById('users-template');
            var cln = temp.cloneNode(true);
            console.log(cln);
            
            

            for (var i = 0; i < json.length; i++) {
                temp.parentNode.appendChild(cln);
            }

        }, headers, true);
    }
}