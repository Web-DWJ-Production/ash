// APP JS

var loginCtrl = {};

loginCtrl.login = function () {

    function parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };

    var body = {
        email: document.getElementById('login_email_input').value,
        password: document.getElementById('login_password_input').value
    }

    cinnabarisland.post('/api/auth', body, function (data) {
        loginCtrl.token = data.substring(1, data.length - 1);

        loginCtrl.user = parseJwt(loginCtrl.token);
        localStorage.setItem('SAUser', JSON.stringify(loginCtrl.user));
        localStorage.setItem('SAToken', loginCtrl.token);
        linksCtrl.redirectToEmployees();
    }, null, true);
}

var linksCtrl = {};

linksCtrl.redirectToEmployees = function () {
    var headers = {
        Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken')),
        ContentType: 'application/json'
    };

    cinnabarisland.get('/employees', function (data) {
        document.open();
        document.write(data);
        document.close();
    }, headers, true);
}


function EmployeesCtrl() {
    this.adminIf = new SparkIf(document.getElementById('employees-admin-component'), false);
    this.usrAdminIf = new SparkIf(document.getElementById('admin-usr-table'), false);
    this.usrCardIf = new SparkIf(document.getElementById('user-card'), false);
    this.homeIf = new SparkIf(document.getElementById('employees-home-component'), true);
    this.newUserIf = new SparkIf(document.getElementsByClassName('new-user-row')[0], false);
    this.users = null;
    this.usersFor = new SkFor(document.getElementById('users-template'), null, null);
    this.newAccount = { email: null, password: null, admin: false};
    this.usrCardBind = new SkBind(document.getElementById('user-card'), null);

    this.updateUser = function (email, password, admin, el) {
        var headers = {
            Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken'))
        };

        var that = this;
        var body = { email: email, password: password, admin: admin };
        cinnabarisland.put('/api/users/' + email, body, function (data) {
            that.getUsers();
            alert(email + " has been succesfully updated.")
        }, headers, true);
    }

    this.deleteUser = function (email) {
        var headers = {
            Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken'))
        };

        var that = this;
        cinnabarisland.delete('/api/users/' + email, function (data) {
            that.getUsers();
        }, headers, true);
    }

    this.postUser = function () {
        var headers = {
            Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken')),
            ContentType: 'application/json'
        };

        var that = this;
        var body = {
            email: this.newAccount.email,
            password: this.newAccount.password,
            admin: this.newAccount.admin
        }

        cinnabarisland.post('/api/users', body, function (data) { 
            that.getUsers();
            document.getElementById('new-acc-email').value = "";
            document.getElementById('new-acc-password').value = "";
            that.newAccount.admin = false;
            document.getElementById('new-acc-admin').innerHTML = "&#xE835;";
            that.newUserIf.viewable = false;
            that.newUserIf.reconcile();
        }, headers, true);
    }

    this.getUsers = function() {
        var headers = {
            Authorization: 'Bearer ' + (loginCtrl.token || localStorage.getItem('SAToken'))
        };

        var that = this;
        cinnabarisland.get('/api/users', function (data) {
            var json = JSON.parse(data);
            var temp = document.getElementById('users-template');
            var cln = temp.cloneNode(true);

            that.usersFor.arr = json;
            that.usersFor.reconcile();

        }, headers, true);
    }

    // INIT
}