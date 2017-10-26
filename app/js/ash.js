// APP JS

var loginCtrl = {};
loginCtrl.siginIf = new SparkIf(document.getElementById('signin-btn'), true, 'list-item');
loginCtrl.signoutIf = new SparkIf(document.getElementById('signout-btn'), false, 'list-item');
loginCtrl.token = localStorage.getItem('SAToken');

loginCtrl.reconcile = function () {

    if (loginCtrl.siginIf.reconcile && loginCtrl.signoutIf.reconcile) {
        if (loginCtrl.token) {
            loginCtrl.siginIf.viewable = false;
            loginCtrl.siginIf.reconcile();
            loginCtrl.signoutIf.viewable = true;
            loginCtrl.signoutIf.reconcile();
        } else {
            loginCtrl.siginIf.viewable = true;
            loginCtrl.siginIf.reconcile();
            loginCtrl.signoutIf.viewable = false;
            loginCtrl.signoutIf.reconcile();
        }
    }
}
loginCtrl.reconcile();

loginCtrl.login = function () {

    function parseJwt(token) {
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
        loginCtrl.reconcile();
    }, null, true);
}

loginCtrl.signout = function () {
    localStorage.clear();
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
    this.newAccount = { email: null, password: null, admin: false };
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

    this.getUsers = function () {
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
    this.positions = new SparkIf(document.getElementById('careers-all-pos'), true);
    this.info = new SparkIf(document.getElementById('careers-info'), false);
    this.infoFor = new SkBind(document.getElementById('careers-info-content'), null);   
    
    this.selectedCareer = {id: 0, title: null, category: null, skillLevel: -1, description: null, capabilities: [], qualifications: [] }

    this.getPosition = function(id){
        for(var i =0; i < this.values.length; i++){
            if(this.values[i].id == id){
                this.selectedCareer = this.values[i];
                break;
            }
        }

        this.infoFor.obj = this.selectedCareer;
        this.infoFor.reconcile();

        var capabilitiesFor = new SkFor(document.getElementById('capabilities-item'), this.selectedCareer.capabilities, "text");
        capabilitiesFor.reconcile();
        
        var qualificationsFor = new SkFor(document.getElementById('qualifications-item'), this.selectedCareer.qualifications, "text");
        qualificationsFor.reconcile();
    }

    this.options = {
        valueNames: [{ data: ['id'] }, 'title', 'category', 'skillLevel', 'description', 'capabilities', 'qualifications'],
        item: '<li data-id="id" onclick="onCareerInfoClick(this)"><div class="position-container"><div class="position-section position-icon"></div><div class="position-section position-info"><div class="position-row"><span class="title"></span></div><div class="position-row flex-row"><div class="category"></div><div>Full-time</div><div class="position-skill">Skill Level: <span class="skillLevel"></span></div></div></div><div class="position-section position-details"><a href="" class="cir-btn"><span>More Information</span></a></div></div></li>',
        page: 5,
        pagination: true
    }

    this.values = [
        {
            id: 1,
            title: 'Configuration Manager (CM)',
            category: 'Mangement',
            skillLevel: 0,
            description: 'Responsible for configuration management (CM) of developmental and operational systems. Works on developmental and operational teams to create and maintain configuration baselines (development, test, production, etc.) supporting developmental and operational systems. Uses or recommends automated CM tools to implement CM policies and procedures. Develops or modifies CM plans, policies, and procedures tailored to the complexity and scope of the developmental or operational system. Implement CM discipline for the entire life cycle of systems from initial requirements/capabilities baselines to system end-of-life. Perform change control and configuration audits.',
            capabilities: [
                {text:'Assist in implementing hardware and software version control processes, policies and procedures'}, 
                {text:'Assist in the use of configuration management tools (e.g. DOORS, Eclipse) to store, track, and manage configuration items'}, 
                {text:'Understand basic concepts, and assist in documenting hardware and software configuration management processes and procedures'}
            ],
            qualifications: [{text:'No demonstrated experience is required. Associate’s degree in a technical or business discipline from an accredited college or university is required. Two (2) years of CM experience may be substituted for an associate’s degree.'}]
        },
        {
            id: 2,
            title: 'Configuration Manager (CM)',
            category: 'Mangement',
            skillLevel: 1,
            description: 'Responsible for configuration management (CM) of developmental and operational systems. Works on developmental and operational teams to create and maintain configuration baselines (development, test, production, etc.) supporting developmental and operational systems. Uses or recommends automated CM tools to implement CM policies and procedures. Develops or modifies CM plans, policies, and procedures tailored to the complexity and scope of the developmental or operational system. Implement CM discipline for the entire life cycle of systems from initial requirements/capabilities baselines to system end-of-life. Perform change control and configuration audits.',
            capabilities: [
                {text:'Assist in implementing hardware and software version control processes, policies and procedures'}, 
                {text:'Assist in the use of configuration management tools (e.g. DOORS, Eclipse) to store, track, and manage configuration items'}, 
                {text:'Understand basic concepts, and assist in documenting hardware and software configuration management processes and procedures'},
                {text:'Understand basic concepts, assist in maintaining and developing the environment for hardware and software product build, staging, testing and integration'}, 
                {text:'Assist in defining and implementing hardware and software configuration management processes and procedures; such as creating product build scripts and procedures, and integrating those scripts with the hardware and software build process'}, 
                {text:'Implement hardware and software version control processes, policies and procedures'},
                {text:'Utilize configuration management tools (e.g. DOORS, Eclipse) to store, track, and manage configuration items'}
            ],
            qualifications: [
                {text:'Two (2) years of experience as a CM in programs and contracts of similar scope, type, and complexity is required.'},
                {text:'Associate’s degree in a technical or business discipline from an accredited college or university is required. Two (2) years of additional CM experience may be substituted for an associate’s degree.'}
            ]
        },
        {
            id: 3,
            title: 'Information Systems Security Engineer (ISSE)',
            category: 'Information Systems',
            skillLevel: 1,
            description: 'The Information Systems Security Engineer (ISSE) shall perform, or review, technical security assessments of computing environments to identify points of vulnerability, non-compliance with established Information Assurance (IA) standards and regulations, and recommend mitigation strategies. Validates and verifies system security requirements definitions and analysis and establishes system security designs. Designs, develops, implements and/or integrates IA and security systems and system components including those for networking, computing, and enclave environments to include those with multiple enclaves and with differing data protection/classification requirements. Builds IA into systems deployed to operational environments. Assists architects and systems developers in the identification and implementation of appropriate information security functionality to ensure uniform application of Agency security policy and enterprise solutions. Supports the building of security architectures. Enforce the design and implementation of trusted relations among external systems and architectures. Assesses and mitigates system security threats/risks throughout the program life cycle. Contributes to the security planning, assessment, risk analysis, risk management, certification and awareness activities for system and networking operations. Reviews certification and accreditation (C&A) documentation, providing feedback on completeness and compliance of its content. Applies system security engineering expertise in one or more of the following to : system security design process; engineering life cycle; information domain; cross domain solutions; commercial off-the-shelf and government off-the-shelf cryptography; identification; authentication; and authorization; system integration; risk management; intrusion detection; contingency planning; incident handling; configuration control; change management; auditing; certification and accreditation process; principles of IA (confidentiality, integrity, non-repudiation, availability, and access control); and security testing. Support security authorization activities in compliance with NSA/CSS Information System Certification and Accreditation Process (NISCAP) and DoD Information Assurance Certification and Accreditation Process (DIACAP) process, the NIST Risk Management Framework (RMF) process, and prescribed NSA/CSS business processes for security engineering.',
            capabilities: [
                {text:'Participate as a security engineering representative on engineering teams for the design, development, implementation and/or integration of secure networking, computing, and enclave environments'}, 
                {text:'Participate as a security engineering representative on engineering teams for the design, development, implementation and/or integration of IA architectures, systems, or system components'}, 
                {text:'Participate as the primary security engineering representative on engineering teams for the design, development, implementation, evaluation, and/or integration of secure networking, computing, and enclave environments'},
                {text:'Participate as the primary security engineering representative on engineering teams for the design, development, implementation, evaluation, and/or integration of IA architectures, systems, or system components'}, 
                {text:'Support the Government in the enforcement of the design and implementation of trusted relationships among external systems and architectures'}, 
                {text:'Apply knowledge of IA policy, procedures, and workforce structure to design, develop, and implement secure networking, computing, and enclave environments'},
                {text:'Support security planning, assessment, risk analysis, and risk management'}, 
                {text:'Identify overall security requirements for the proper handling of Government data'}, 
                {text:'Interact with the customer and other project team members'}
            ],
            qualifications: [
                {text:'Seven (7) years of experience as an ISSE on programs and contracts of similar scope, type, and complexity required.'},
                {text:'Bachelor’s degree in Computer Science, Information Assurance, Information Security System Engineering, or related discipline from an accredited college or university is required.'},
                {text:'DoD 8570 compliance with IASAE Level 2 is required.'},
                {text:'Four (4) years of ISSE experience may be substituted for a bachelor’s degree.'}
            ]
        },
        {
            id: 4,
            title: 'Information Systems Security Engineer (ISSE)',
            category: 'Information Systems',
            skillLevel: 2,
            description: 'The Information Systems Security Engineer (ISSE) shall perform, or review, technical security assessments of computing environments to identify points of vulnerability, non-compliance with established Information Assurance (IA) standards and regulations, and recommend mitigation strategies. Validates and verifies system security requirements definitions and analysis and establishes system security designs. Designs, develops, implements and/or integrates IA and security systems and system components including those for networking, computing, and enclave environments to include those with multiple enclaves and with differing data protection/classification requirements. Builds IA into systems deployed to operational environments. Assists architects and systems developers in the identification and implementation of appropriate information security functionality to ensure uniform application of Agency security policy and enterprise solutions. Supports the building of security architectures. Enforce the design and implementation of trusted relations among external systems and architectures. Assesses and mitigates system security threats/risks throughout the program life cycle. Contributes to the security planning, assessment, risk analysis, risk management, certification and awareness activities for system and networking operations. Reviews certification and accreditation (C&A) documentation, providing feedback on completeness and compliance of its content. Applies system security engineering expertise in one or more of the following to : system security design process; engineering life cycle; information domain; cross domain solutions; commercial off-the-shelf and government off-the-shelf cryptography; identification; authentication; and authorization; system integration; risk management; intrusion detection; contingency planning; incident handling; configuration control; change management; auditing; certification and accreditation process; principles of IA (confidentiality, integrity, non-repudiation, availability, and access control); and security testing. Support security authorization activities in compliance with NSA/CSS Information System Certification and Accreditation Process (NISCAP) and DoD Information Assurance Certification and Accreditation Process (DIACAP) process, the NIST Risk Management Framework (RMF) process, and prescribed NSA/CSS business processes for security engineering.',
            capabilities: [
                {text:'Participate as a security engineering representative on engineering teams for the design, development, implementation and/or integration of secure networking, computing, and enclave environments'}, 
                {text:'Participate as a security engineering representative on engineering teams for the design, development, implementation and/or integration of IA architectures, systems, or system components'}, 
                {text:'Participate as the primary security engineering representative on engineering teams for the design, development, implementation, evaluation, and/or integration of secure networking, computing, and enclave environments'},
                {text:'Participate as the primary security engineering representative on engineering teams for the design, development, implementation, evaluation, and/or integration of IA architectures, systems, or system components'}, 
                {text:'Support the Government in the enforcement of the design and implementation of trusted relationships among external systems and architectures'}, 
                {text:'Apply knowledge of IA policy, procedures, and workforce structure to design, develop, and implement secure networking, computing, and enclave environments'},
                {text:'Support security planning, assessment, risk analysis, and risk management'}, 
                {text:'Identify overall security requirements for the proper handling of Government data'}, 
                {text:'Interact with the customer and other project team members'},
                {text:'Perform system or network designs that encompass multiple enclaves, to include those with differing data protection/classification requirements'}, 
                {text:'Provide security planning, assessment, risk analysis, and risk management'},
                {text:'Recommend system-level solutions to resolve security requirements'}, 
                {text:'Support the Government in the enforcement of the design and implementation of trusted relationships among external systems and architectures'}
            ],
            qualifications: [
                {text:'Fourteen (14) years of experience as an ISSE on programs and contracts of similar scope, type, and complexity is required. Bachelor’s degree in Computer Science, Information Assurance, Information Security System Engineering, or related discipline from an accredited college or university is required.'}, 
                {text:'DoD 8570 compliance with IASAE Level 2 is required '},
                {text:'CISSP Certification is required'}, 
                {text:'Four (4) years of ISSE experience may be substituted for a bachelor’s degree CISSP Certification is required.'}              
            ]
        },
        {
            id: 5,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 6,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 7,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 8,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 9,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 10,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 11,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 12,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 13,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 14,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 15,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 16,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 17,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 18,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 19,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 20,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 21,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 22,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 23,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 24,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 25,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        },
        {
            id: 26,
            title: 'Position',
            category: 'Employee',
            skillLevel: 2,
            description: 'Description',
            capabilities: [
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'},
                {text:'ctest1'}, 
                {text:'ctest2'}, 
                {text:'ctest3'}
            ],
            qualifications: [
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'},
                {text:'qtest0'}, 
                {text:'qtest0'}
            ]
        }
    ];
}