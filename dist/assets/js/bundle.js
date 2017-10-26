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
/**
 * CERULEANCITY JS
 * CERULEANCITY is a light JavaScript Framework for data binding and common web interfaces. Compatible with most browsers.
 * 
 * DEPENDENCIES
 * 1. palletetownJS
 * 
 * Alex Goley
 */

// VARIABLES
var ceruleancity = {}; // Initialize the ceruleancity object.

// CLASSES
/**
 * 
 * @param { HTMLElement[] } mems - Members of the carousel. Each must share the same parent and have position set to absolute.
 * @param { number } milliseconds- Time to wait for each turn.
 * @param { Function } callback - Function to be called on each turn.
 * @param { boolean } auto - If true auto starts the carousel. Defaults to true.
 */
function CeruleanCarousel(mems, milliseconds, callback, auto) {
    this.members = mems;
    this.callback = callback;
    this.milliseconds = milliseconds;
    this.auto = auto;

    this.currId = 0; // currId: number
    this.originalOffsetLeft = this.members[0].offsetLeft;
    this.isRunning = false;

    // CAROUSEL FUNCTIONS
    this.start = function () {
        if (this.isRunning || this.blurred) {
            return;
        }
        if (!palletetown) {
            console.error('ceruleancity: missing dependency palletetown.js');
            return;
        }
        this.paused = false;
        this.isRunning = true;

        // Function to progress the carousel.
        var next = function () {

            if (that.paused || that.blurred) return; // Exit first if paused.

            var nextId = (that.currId == (that.members.length - 1)) ? 0 : (that.currId + 1);
            var currEl = that.members[that.currId];
            var nextEl = that.members[nextId];
            that.currId = nextId;

            // Position the next Element to be animated.
            nextEl.style.top = currEl.clientTop + 'px';
            nextEl.style.left = currEl.clientWidth + 'px';
            nextEl.style.display = 'inline';

            // Animate the current and next Elements.
            palletetown.move(currEl, 'left', null, 2); // Moves the current element out of its container.
            palletetown.move(nextEl, 'left', null, 2); // Moves the next element into the container.

            var me = that;
            setTimeout(function () {
                if (!me.paused && !me.blurred) {
                    if (me.callback) me.callback(me); // Pass the object into the callback.
                    next.apply(me);
                } else {
                    me.isRunning = false;
                    return;
                }
            }, me.milliseconds);
        }

        var that = this;
        if (that.callback) that.callback(that); // Pass the object into the callback.
        next.apply(that);
    }

    this.stop = function () {
        this.paused = true;
    }

    this.automatic = function () {
        var autostart = (typeof this.auto === 'undefined') ? true : this.auto;
        var that = this;
        if (autostart && !that.blurred) {
            // Auto start the carousel
            var me = that;
            setTimeout(function () {
                if (!me.blurred) {
                    that.start();
                }
            }, that.milliseconds)
        }
    }

    this.goTo = function (id, callback) {
        if (this.currId === id) return;

        var currEl = this.members[this.currId];
        var targetMember = this.members[id];

        // Don't do anything if the current element is moving.
        var x1 = currEl.style.left;
        var that = this;
        setTimeout(function () {
            var x2 = currEl.style.left;

            if (x1 != x2) {
                return;
            } else {
                that.stop();

                that.currId = id;

                targetMember.style.top = currEl.clientTop + 'px';
                targetMember.style.left = that.originalOffsetLeft + 'px';

                currEl.style.top = currEl.clientTop + 'px';
                currEl.style.left = currEl.clientWidth + 'px';

                callback(id);
                if (!that.blurred) {
                    that.automatic();
                }
            }
        }, 10);
    }

    // CAROUSEL ON INIT
    this.paused = (typeof this.auto === 'undefined') ? false : this.auto;
    var that = this;
    // Starts the carousel based on auto parameter.
    setTimeout(that.automatic(), that.milliseconds);

    var waitTime = (that.milliseconds * 2);
    // Handle window focus.
    window.onblur = function () { that.blurred = true; that.paused = true; }; // Stop on blur.
    window.onfocus = function () { that.blurred = false; that.automatic(); }; // Start on focus.
}

/**
 * 
 * @param { HTMLElement } element 
 * @param { boolean } viewable 
 */
function SparkIf(element, viewable, display) {
    if (!element) {
        console.debug('ceruleancity: SkIf failed, element doesnt exist.');
        return;        
    }

    this.element = element;
    this.viewable = viewable;
    this.display = display || this.element.style.display || this.element.style.display || 'initial';

    this.hide = function () {
        this.viewable = false;
        this.element.style.display = 'none';
    }

    this.show = function () {
        this.viewable = true;
        this.element.style.display = this.display;
    }

    this.reconcile = function () {
        if (this.viewable) {
            this.show();
        } else {
            this.hide();
        }
    }

    // init
    this.reconcile();
}

function SkFor(element, arr, name) {
    this.parent = element.parentNode;
    this.element = element;
    this.arr = arr;

    this.reconcile = function () {
        var clone = this.element.cloneNode(true);

        while (this.parent.firstChild) {
            this.parent.removeChild(this.parent.firstChild);
        }

        if (!this.arr) return;

        for (var i = 0; i < this.arr.length; i++) {
            var currNode = clone.cloneNode(clone);
            ceruleancity.fillNode(currNode, this.arr[i], name)
            this.parent.appendChild(currNode);
        }
    }
}

function SkBind(element, obj) {
    this.parent = element.parentNode;
    this.element = element;
    this.obj = obj;

    this.reconcile = function () {
        var clone = this.element.cloneNode(true);

        while (this.parent.firstChild) {
            this.parent.removeChild(this.parent.firstChild);
        }
        
        ceruleancity.fillNode(clone, this.obj, name);
        this.parent.appendChild(clone);
    }
}


// FUNCTIONS

ceruleancity.fillNode = function (template, data, name) {
    var finalHTML = template.innerHTML;

    if (typeof data === 'object') {

        for (var f in data) {
            finalHTML = ceruleancity.insert(finalHTML, f, data[f]);
        }
    }
    template.innerHTML = finalHTML;
}

ceruleancity.insert = function (html, name, value) {
    var res = html;

    if (typeof value === 'boolean') {
        var start = html.indexOf('{{if ' + name);
        var end = html.substring(start).indexOf('}}') + 2;
        var target = html.substring(start, (start + end));
        var insert;
        var matchStart;
        var matchEnd

        if (value) {
            matchStart = target.indexOf('(+') + 2;
            matchEnd = target.indexOf('+)');
            insert = target.substring(matchStart, matchEnd);
        } else {
            matchStart = target.indexOf('(-') + 2;
            matchEnd = target.indexOf('-)');
            insert = target.substring(matchStart, matchEnd);
        }

        res = html.substring(0, start) + insert + html.substring((start + end));
    }

    var regex = new RegExp("\{\{" + name + "\}\}", 'g');
    res = res.replace(regex, value);

    return res;
}
/**
 * CINNABARISLAND JS
 * CINNABARISLAND is a JavaScript Library for http calls. Compatible with most browsers.
 * 
 * Alex Goley
 */

// VARIABLES
var cinnabarisland = {}; // initialize the cinnabarisland object.

// FUNCTIONS
/**
 * Runs a get request.
 * @param {string} url - url to send the request.
 * @param {function} next - callback function to run with a response string.
 * @param {any} headers - optional: header object to use for th request.
 * @param {boolean} async - optional: flag to run asynchronous request. Defaults to false.
 */
cinnabarisland.get = function (url, next, headers, async) {
    var xhttp = cinnabarisland.getHTTPObject();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            next(this.responseText);
        }
    };

    var isAsync = (typeof async === 'undefined') ? false : async;    
    xhttp.open("GET", url, isAsync);    
    if (headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhttp.setRequestHeader(key, headers[key]);
            }
        }
    }
    xhttp.send();
}

/**
 * Runs a post request.
 * @param {string} url - url to send the request.
 * @param {Object} body - data to send in request body.
 * @param {function} next - callback function to run with a response string.
 * @param {any} headers - optional: header object to use for th request.
 * @param {boolean} async - optional: flag to run asynchronous request. Defaults to false.
 */
cinnabarisland.post = function (url, body, next, headers, async) {
    var xhttp = cinnabarisland.getHTTPObject();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            next(this.responseText);
        }
    };

    var isAsync = (typeof async === 'undefined') ? false : async;    
    xhttp.open("POST", url, isAsync);  
    if (headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhttp.setRequestHeader(key, headers[key]);
            }
        }
    }  
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(body));
}

cinnabarisland.put = function(url, body, next, headers, async) {
    var xhttp = cinnabarisland.getHTTPObject(); 
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            next(this.responseText);
        }
    };
       
    var isAsync = (typeof async === 'undefined') ? false : async;        
    xhttp.open('PUT', url, true);  
    if (headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhttp.setRequestHeader(key, headers[key]);
            }
        }
    }  
    xhttp.setRequestHeader("Content-type", "application/json");    
    xhttp.send(JSON.stringify(body));
}

/**
 * Send a DELETE Request.
 */
cinnabarisland.delete = function(url, next, headers, async) {
    var xhttp = cinnabarisland.getHTTPObject(); 
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            next(this.responseText);
        }
    };
       
    var isAsync = (typeof async === 'undefined') ? false : async;        
    xhttp.open('DELETE', url, true);  
    if (headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhttp.setRequestHeader(key, headers[key]);
            }
        }
    }  
    xhttp.send();
}

/**
 * @return a new HTTP Request object. 
 */
cinnabarisland.getHTTPObject = function () {
    if (window.XMLHttpRequest) {
        // code for modern browsers
        return new XMLHttpRequest();
    } else {
        // code for old IE browsers
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}
/**
 * PALLETETOWN JS
 * PallteTown is a JavaScript Library for animations. Compatible with most browsers.
 * 
 * Alex Goley
 * Kris Redding
 */
// Check Browser Version
var browserChecks = {
    // Opera 8.0+
    isOpera: false,
    // Firefox 1.0+
    isFirefox: false,
    // Safari 3.0+ "[object HTMLElementConstructor]" 
    isSafari:false,
    // Internet Explorer 6-11
    isIE:false,
    // Edge 20+
    isEdge:false,
    // Chrome 1+
    isChrome:false,    
    // Blink engine detection
    isBlink: false
};

browserChecks.isOpera= (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
browserChecks.isFirefox= typeof InstallTrigger !== 'undefined';
browserChecks.isSafari=/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
browserChecks.isIE=/*@cc_on!@*/false || !!document.documentMode;
browserChecks.isEdge=!browserChecks.isIE && !!window.StyleMedia;
browserChecks.isChrome=!!window.chrome && !!window.chrome.webstore;
browserChecks.isBlink= (browserChecks.isChrome || browserChecks.isOpera) && !!window.CSS;  

// VARIABLES
var palletetown = {}; // initialize the palletetowm object.
palletetown.directions = ['up', 'down', 'left', 'right'];


// FUNCTIONS
/**
 * Moves an element relative to its container.
 * The specified element must have postition set to either relative, absolute, or fixed.
 * - Good for carousels
 * @todo add parameter for speed.
 * @param {string} identifier
 * @param {string} direction
 * @param {function} next - optional: Function to be called when done.
 * @param {number} step - optional: Step size for animation interval (controls speed).
 * @param {number} distance - optional: number of pixels to move, defualts to width or height of the parent element for horizontal or vertical movements respectively.
 * @param {number} index - optional: If a non unique identifier is passed use this as the index to use. Defualts to 0. 
 * @return {void}
 */
palletetown.move = function (identifier, direction, callback, step, distance, index) {
    var el = (identifier instanceof HTMLElement)? identifier : palletetown.getElementByIdentifier(identifier, index);
    if (!el) return;

    if (palletetown.directions.indexOf(direction) < 0) {
        console.error('palletetown: unrecognized direction %s', direction);
        return;
    }

    var stepSize = step? step: 1;

    var dist;
    if (distance) {
        if ((typeof distance) != 'number') {
            console.error('palletetown: distance must be of type number');
        }
        dist = distance;
    } else {
        dist = 0;
        // Calculate the distance neccesary to move the element off its parent.
        if (direction === 'up') dist += el.parentElement.offsetHeight;
        if (direction === 'left') dist += el.parentElement.offsetWidth;
        if (direction === 'down') dist += el.parentElement.offsetHeight;
        if (direction === 'right') dist += el.parentElement.offsetWidth;
    }

    var pos = ['up', 'down'].indexOf(direction) >= 0 ? palletetown.getElementPos(el, 'top') : palletetown.getElementPos(el, 'left');
    var id = setInterval(frame, 1);
    function frame() {
        if (dist == 0) {
            clearInterval(id);
            if (callback) callback();
        } else {
            var d = (stepSize <= dist)? stepSize : (stepSize - dist); 
            pos = (['up', 'left'].indexOf(direction) >= 0) ? pos -= d : pos += d;
            dist = (dist - stepSize);
            if (['up', 'down'].indexOf(direction) >= 0) el.style.top = pos + 'px';
            else el.style.left = pos + 'px';
        }
    }
}

palletetown.getElementPos = function (el, edge) {
    if (edge === 'top') return p = el.style.top? parseInt(el.style.top.substring(0, el.style.top.length - 2)) : 0;
    if (edge === 'left') return el.style.left? parseInt(el.style.left.substring(0, el.style.left.length - 2)) : 0;
}

/**
 * Does everything JavaScript can do to get an elememt from a string identifier and index.
 * @param {string} identifier - html id, class name, tag name, or name.
 * @return {HTMLElement}
 */
palletetown.getElementByIdentifier = function (identifier, index) {

    var e = document.getElementById(identifier);
    if (!e) e = document.getElementsByClassName(identifier)[(index || 0)];
    if (!e) e = document.getElementsByTagName(identifier)[(index || 0)];
    if (!e) console.error('palletetown: could not find an element with identifier %s and index %d', identifier, index);
    return e;
}

/**
 * Add/Remove Class based on location of Header
 * @param {number} threshold - threshold number of change vertical value
 * @param {string} identifier
 * @param {string} classname
 * @param {boolean} mobileDisable - if true will not call function is screen size is of mobile width
 */

palletetown.scrollcontrol = function(threshold, identifier, classname, mobileDisable){
    // Check if mobile width
    if(mobileDisable && window.innerWidth <= 640) return;
        
    var el = palletetown.getElementByIdentifier(identifier, 0);
    var scrollHeight = (browserChecks.isIE ? window.pageYOffset : window.scrollY);
        
    if (!el) return;

    if(scrollHeight > threshold){
        if(el.className.indexOf(classname) <= 0){
            el.className += " " + classname;
        }
    }
    else {
        if(el.className.indexOf(classname) > 0){
            el.classList.remove(classname);
        }
    }    
}
/* Home Page */
window.addEventListener('scroll', function(e) {
    palletetown.scrollcontrol(10, 'navbar-fixed-top', 'moved-header', true);    
});

var carousel = null;
var homeCarousel = document.getElementsByClassName('ceruleanCarousel');
if(homeCarousel != null && homeCarousel.length > 0){
    setCarousel();
    var carouselHeight = homeCarousel[0].clientHeight;
    var hideLoc = carouselHeight - (window.innerHeight * .70) - 44;
    window.addEventListener('scroll', function(e) {
        palletetown.scrollcontrol(hideLoc, 'scroll-anchor', 'hide-direction', false);    
    });    
}

/* Careers Page */
var carCtrl = carCtrl ? carCtrl : new CareersCtrl();
var jobList = new List('jobs', carCtrl.options, carCtrl.values);



/* Private Methods */
function onCareerInfoClick(elem){
    // Get id
    var id = $(elem).attr("data-id");
    
    carCtrl.positions.viewable = false;
    carCtrl.info.viewable = true;
    carCtrl.positions.reconcile();
    carCtrl.info.reconcile();

    window.scroll(0, 0);
    carCtrl.getPosition(id);
}

function ReturnAllCareers() {
    carCtrl.positions.viewable = true;
    carCtrl.info.viewable = false;
    
    carCtrl.positions.reconcile();
    carCtrl.info.reconcile();

    window.scroll(0, 0);
}

function setCarousel(){
    carousel = new CeruleanCarousel(document.getElementsByClassName('carousel-item'), 10000, adjust);    
}

function adjust(me) {
    var carouselBtns = document.getElementsByClassName('carousel-btn');
    var carouselContent = document.getElementsByClassName('switch-content');

    var outgoingId = me.currId;
    var incomingId = (me.currId == (me.members.length - 1)) ? 0 : (me.currId + 1);

    carouselBtns[outgoingId].classList.remove('active-btn');
    carouselContent[outgoingId].classList.remove('active');

    carouselBtns[incomingId].classList.add('active-btn');
    carouselContent[incomingId].classList.add('active');
}

function go(id) {
    carousel.goTo(id, function(){
        var carouselBtns = document.getElementsByClassName('carousel-btn');
        var carouselContent = document.getElementsByClassName('switch-content');
        
        for (var i = 0; i < carouselBtns.length; i++) {
            carouselBtns[i].classList.remove('active-btn');
            carouselContent[i].classList.remove('active');
        }
    
        carouselBtns[id].classList.add('active-btn');
        carouselContent[id].classList.add('active');
    });
}

function directionalChange(dir){
    var carouselBtns = document.getElementsByClassName('carousel-btn');
    var activeLoc = 0;
    for (var i = 0; i < carouselBtns.length; i++) {
        if(carouselBtns[i].className.indexOf('active-btn') >= 0){
            activeLoc = i;
            break;
        }
    }

    var gotoLoc = 0;
    if(dir == 'next'){
        gotoLoc = (activeLoc +1 >= carouselBtns.length ? 0 : activeLoc +1);
    }
    else {
        gotoLoc = (activeLoc - 1 < 0 ? (carouselBtns.length-1) : activeLoc -1);
    }

    go(gotoLoc);

}
