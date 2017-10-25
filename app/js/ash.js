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

function CareersCtrl() {
    this.options = {
        valueNames: ['id','title','category','skillLevel','description','capabilities','qualifications'],
        item:'<li><div class="position-container"><div class="position-section position-icon"></div><div class="position-section position-info"><div class="position-row"><span class="title"></span></div><div class="position-row flex-row"><div class="category"></div><div>Full-time</div><div class="position-skill">Skill Level: <span class="skillLevel"></span></div></div></div><div class="position-section position-details"><a href="" class="cir-btn"><span>More Information</span></a></div></div></li>'
    }
    this.values = [
        {
            id: 1,
            title:'Test Job Manager',
            category: 'Mangement',
            skillLevel:0,
            description:' This is a test Description',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        },
        {
            id: 2,
            title:'Test Job Manager',
            category: 'Mangement',
            skillLevel:1,
            description:' This is a test Description Job 1',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        },
        {
            id: 3,
            title:'Test Job Employee',
            category: 'Employee',
            skillLevel: 0,
            description:' This is a test Description Job 2',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        },
        {
            id: 4,
            title:'Test Job Employee',
            category: 'Employee',
            skillLevel: 1,
            description:' This is a test Description Job 2',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        },
        {
            id: 5,
            title:'Test Job Employee',
            category: 'Employee',
            skillLevel: 2,
            description:' This is a test Description Job 2',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        },
        {
            id: 6,
            title:'Test Job Engineer',
            category: 'Engineering',
            skillLevel: 2,
            description:' This is a test Description Job 2',
            capabilities:['ctest1', 'ctest2', 'ctest3'],
            qualifications:['qtest0', 'qtest1']
        }
    ];

    //this.jobList = new List('jobs', this.options, this.values);
    // INIT 
}