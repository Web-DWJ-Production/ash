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
        item: '<li data-id="id" onclick="onCareerInfoClick(this)"><div class="position-container"><div class="position-section position-icon"></div><div class="position-section position-info"><div class="position-row"><span class="title"></span></div><div class="position-row flex-row"><div class="category"></div><div>Full-time</div><div class="position-skill">Skill Level: <span class="skillLevel"></span></div></div></div><div class="position-section position-details"><a class="cir-btn"><span>More Information</span></a></div></div></li>',
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
            title: 'Program Manager (PM)',
            category: 'Manager',
            skillLevel: 3,
            description: 'The Program Manager shall be responsible for the successful cost, schedule, and performance of the contract. Serves as the main point of contact for the Contracting Officer (CO), the Contracting Officer’s Representative (COR), the Government Program Manager, and the Contractor’s senior management. Directly contributes to program efforts in several areas, including cost management/avoidance, schedule estimation and tracking, contract performance management, risk management, requirements analysis, and quality assurance activities. Ensures proper performance of tasks necessary to ensure the most efficient and effective execution of the contract. The PM shall utilize expert communication skills needed to direct the skilled technical resources and report on the technical progress, issues, and problem areas, as well as write and review technical documents.',
            capabilities: [
                {text:'Work with the higher level program manager, if applicable, to provide effective and efficient management of the contractor’s effort'}, 
                {text:'Allocate resources (staffing, facilities, and budgets) on the contract'}, 
                {text:'Review and propose the Integrated Program Baseline (or resource loaded schedule) to the Government'},
                {text:'Review and approve all earned value, Estimate To Complete, Funds and Man-hour Expenditure Report, or other financial reports as appropriate'}, 
                {text:'Review risk and risk mitigation activities and allocate budgets for the same'}, 
                {text:'Prepare program status reviews and other formal reviews to be presented to the Government PM'},
                {text:'Review and allocate management reserve within contractual limits'}, 
                {text:'Ensure the timely recruitment and training of program staff – both direct and indirect'}, 
                {text:'Review all financial and technical reports before release to the Government'},
                {text:'Ensure cross-discipline integration within the contract to meet Government needs'}, 
                {text:'Communicate issues and solutions to the Government PM in a timely and transparent manner'}, 
                {text:'Ensure compliance with all regulatory and administrative requirements imposed by the contract in coordination with the Contractor’s contracts staff'},
                {text:'Assist the Government PM by providing input to statutory acquisition reports and responses to Congressional Questions for the Record (QFRs)'}, 
                {text:'Coordinate the preparation of Engineering Change Proposals (ECPs) and value engineering proposals to the Government PM'},
                {text:'Provide Contractor input to the Quality Assurance Surveillance Plan reviews or Award Fee reviews, as appropriate'}, 
                {text:'All tasks of the Level 2 PM not performed at Level 2 due to the size and/or complexity of the contract'},
                {text:'Communicate issues and solutions to the broader Government management structure as requested by senior Government leaders'}, 
                {text:'Provide guidance and direct tasking for Level 0, 1, and 2 program managers if any are assigned to the contract/program'},
                {text:'Rapidly assemble and execute focused cross-disciplinary Government/Contractor teams to address urgent or unexpected cost, schedule, or technical program/contract issues'}
            ],
            qualifications: [
                {text:'Fifteen (15) years of experience as a program or project manager in managing programs and contracts of similar scope, type, and complexity is required.'}, 
                {text:'Direct experience in managing multi-task contracts and subcontracts of various types and complexity, as well as experience in leading a multi-vendor environment is required.'},
                {text:'Shall be knowledgeable of the guidelines provided by the Federal Acquisition Regulation (FAR) and Defense Federal Acquisition Regulation Supplement (DFARS), DoD 5000 series, and ICD 801 policies. Must have demonstrated experience in conducting requirements analysis, resource allocation, project costing, deliverable tracking, schedule and financial data monitoring, and reporting.'}, 
                {text:'Must have at least three (3) years of demonstrated experience in the management and control of funds and resources using complex reporting mechanisms such as Earned Value Management. Must have a PMP or FAC-P/PM Senior Level in Program Management.'}
            ]
        },
        {
            id: 6,
            title: 'Scheduler (SCHED)',
            category: 'Scheduling',
            skillLevel: 1,
            description: 'Responsible for designing, developing, and maintaining detailed resource-loaded schedules for implementation, developmental and operational systems. Works with developmental and operational teams to develop detailed schedules and assists in keeping these schedules current. Uses or recommends automated tools such as MS Project, Primavera or program mandated software. Develops and or modifies project schedules and or the integration of multiple project schedules into an overall Master Program Schedule. Maintains the overall Master Program /Project Schedule. Links project schedules with the overarching program, Investment Portfolio, functional area and/or other Integrated Master Plans (IMPs). Provides hands-on development of layered schedules and IMPs that address how an acquisition project is progressing and how that project contributes to overarching requirements and objectives. Maintains status on linkages and dependencies with related projects.',
            capabilities: [
                {text:'Assist in maintaining and developing the environment for the overall Master Program/Project Schedule and or the integration of multiple project schedules into an overall Master Program Schedule'}, 
                {text:'Assist in defining and implementing schedule software (MS Project, Primavera, or specific program mandated software, etc.) management processes and procedures'}, 
                {text:'Implement schedule version control processes, policies and procedures'}
            ],
            qualifications: [
                {text:'Two (2) years of experience as a Scheduler in programs and contracts of similarscope, type, and complexity is required.'}, 
                {text:'Associate’s degree in a technical or business discipline from anaccredited college or university is required.'},
                {text:'Shall have one (1) year of demonstrated experience managinga schedule for an engineering program involving hardware and software development and multiple subcomponents.'}, 
                {text:'Experience may include: successful completion of an advanced level MS Project orPrimavera course and demonstrated experience with MS Project and or Primavera. Certification for theAssociation for the Advancement of Cost Engineering (AACE) and or Planning and SchedulingProfessional (PSP) certification are desired.'},
                {text:'Two (2) years of additional scheduling experience may be substituted for an Associate’s degree.'}
            ]
        },
        {
            id: 7,
            title: 'Scheduler (SCHED)',
            category: 'Scheduling',
            skillLevel: 2,
            description: 'Responsible for designing, developing, and maintaining detailed resource-loaded schedules for implementation, developmental and operational systems. Works with developmental and operational teams to develop detailed schedules and assists in keeping these schedules current. Uses or recommends automated tools such as MS Project, Primavera or program mandated software. Develops and or modifies project schedules and or the integration of multiple project schedules into an overall Master Program Schedule. Maintains the overall Master Program /Project Schedule. Links project schedules with the overarching program, Investment Portfolio, functional area and/or other Integrated Master Plans (IMPs). Provides hands-on development of layered schedules and IMPs that address how an acquisition project is progressing and how that project contributes to overarching requirements and objectives. Maintains status on linkages and dependencies with related projects.',
            capabilities: [
                {text:'Assist in maintaining and developing the environment for the overall Master Program/Project Schedule and or the integration of multiple project schedules into an overall Master Program Schedule'}, 
                {text:'Assist in defining and implementing schedule software (MS Project, Primavera, or specific program mandated software, etc.) management processes and procedures'}, 
                {text:'Implement schedule version control processes, policies and procedures'},
                {text:'Maintain the schedule product build, staging, testing, deployment and integration'}, 
                {text:'Define and implement schedule configuration management processes and procedures; such as creating product build scripts and procedures, and integrate those scripts with the schedule build process'}, 
                {text:'Develop schedule version control processes, policies and procedures and ensures that they are followed on development or operational schedule development and implementation projects'}
            ],
            qualifications: [
                {text:'Eight (8) years of experience as a Scheduler in programs and contracts of similar scope, type and complexity.'}, 
                {text:'Bachelor’s degree in a technical or business discipline from an accredited college or university is required.'},
                {text:'Shall have two (2) years of demonstrated experience managing a schedule for an engineering program involving hardware and software development and multiple sub components using MS Project or Primavera.'}, 
                {text:'Shall have successfully completed an advanced level MS Project or Primavera course and have demonstrated experience with MS Project and or Primavera.'},
                {text:'Certification in either the Association for the Advancement of Cost Engineering (AACE) and or Planning and Scheduling Professional (PSP) is desired.'}, 
                {text:'A Master’s degree may be substituted for two (2) years of experience reducing the requirement to six (6) years of experience. Four (4) years of additional scheduling experience may be substituted for a bachelor’s degree.'}
            ]
        },
        {
            id: 8,
            title: 'System Engineer (SE)',
            category: 'Engineering',
            skillLevel: 0,
            description: 'Analyzes user’s requirements, concept of operations documents, and high level system architectures to develop system requirements specifications. Analyzes system requirements and leads design and development activities. Guides users in formulating requirements, advises alternative approaches, and conducts feasibility studies. Provides technical leadership for the integration of requirements, design, and technology. Incorporates new plans, designs and systems into ongoing operations. Develops technical documentation. Develops system Architecture and system design documentation. Guides system development and implementation planning through assessment or preparation of system engineering management plans and system integration and test plans. Interacts with the Government regarding Systems Engineering technical considerations and for associated problems, issues or conflicts. Ultimate responsibility for the technical integrity of work performed and deliverables associated with the Systems Engineering area of responsibility. Communicates with other program personnel, government overseers, and senior executives.',
            capabilities: [
                {text:'Contribute to the development of sections of systems engineering documentation such as System Engineering Plans, Initial Capabilities Documents, Requirements specifications, and Interface Control Documents'}, 
                {text:'Manage system requirements and derived requirements to ensure the delivery of production systems that are compatible with the defined system architecture(s) – Department of Defense Architecture Framework (DoDAF), Service-oriented Architecture (SOA), etc'}, 
                {text:'Assist with the development of system requirements, functional requirements, and allocation of the same to individual hardware, software, facility, and personnel components'},
                {text:'Coordinate the resolution of action items from Configuration Control Board (CCB) meetings, design reviews, program reviews, and test reviews that require cross-discipline coordination'}
            ],
            qualifications: [
                {text:'Bachelor’s degree in System Engineering, Computer Science, Information Systems, Engineering Science, Engineering Management, or related discipline from an accredited college or university is required.'}, 
                {text:'Five (5) years of SE experience may be substituted for a bachelor’s degree.'},
                {text:'No demonstrated experience is required.'}
            ]
        },
        {
            id: 9,
            title: 'System Engineer (SE)',
            category: 'Engineering',
            skillLevel: 1,
            description: 'Analyzes user’s requirements, concept of operations documents, and high level system architectures to develop system requirements specifications. Analyzes system requirements and leads design and development activities. Guides users in formulating requirements, advises alternative approaches, and conducts feasibility studies. Provides technical leadership for the integration of requirements, design, and technology. Incorporates new plans, designs and systems into ongoing operations. Develops technical documentation. Develops system Architecture and system design documentation. Guides system development and implementation planning through assessment or preparation of system engineering management plans and system integration and test plans. Interacts with the Government regarding Systems Engineering technical considerations and for associated problems, issues or conflicts. Ultimate responsibility for the technical integrity of work performed and deliverables associated with the Systems Engineering area of responsibility. Communicates with other program personnel, government overseers, and senior executives.',
            capabilities: [
                {text:'Contribute to the development of sections of systems engineering documentation such as System Engineering Plans, Initial Capabilities Documents, Requirements specifications, and Interface Control Documents'}, 
                {text:'Manage system requirements and derived requirements to ensure the delivery of production systems that are compatible with the defined system architecture(s) – Department of Defense Architecture Framework (DoDAF), Service-oriented Architecture (SOA), etc'}, 
                {text:'Assist with the development of system requirements, functional requirements, and allocation of the same to individual hardware, software, facility, and personnel components'},
                {text:'Coordinate the resolution of action items from Configuration Control Board (CCB) meetings, design reviews, program reviews, and test reviews that require cross-discipline coordination'}, 
                {text:'Participate in an Integrated Product Team to design new capabilities based upon evaluation of all necessary development and operational considerations'}, 
                {text:'Participate in the development of system engineering documentation, such as System Engineering Plans, Initial Capabilities Documents, Requirements Specifications, and Interface Control Documents'},
                {text:'Participate in interface definition, design, and changes to the configuration between affected groups and individuals throughout the life cycle'}, 
                {text:'Allocate real-time process budgets and error budgets to systems and subsystem components'}, 
                {text:'Derive from the system requirements an understanding of stakeholder needs, functions that may be logically inferred and implied as essential to system effectiveness'},
                {text:'Derive lower-level requirements from higher-level allocated requirements that describe in detail the functions that a system component must fulfill, and ensure these requirements are complete, correct, unique, unambiguous, realizable, and verifiable'}, 
                {text:'Generate alternative system concepts, physical architectures, and design solutions'}, 
                {text:'Participate in establishing and gaining approval of the definition of a system or component under development (requirements, designs, interfaces, test procedures, etc.) that provides a common reference point for hardware and software developers'},
                {text:'Define the methods, processes, and evaluation criteria by which the systems, subsystems and work products are verified against their requirements in a written plan'}, 
                {text:'Develop system design solution that satisfies the system requirements and fulfills the functional analysis'}, 
                {text:'Develop derived requirements for Information Assurance Services (Confidentiality, Integrity, Non repudiation, and Availability); Basic Information Assurance Mechanisms (e.g., Identification, Authentication, Access Control, Accountability); and Security Mechanism Technology (Passwords, cryptography, discretionary access control, mandatory access control, hashing, key management, etc.)'},
                {text:'Review and provide input to program and contract work breakdown structure (WBS), work packages and the integrated master plan (IMP)'}
            ],
            qualifications: [
                {text:'Seven (7) years of experience as a SE in programs and contracts of similar scope, type and complexity is required.'}, 
                {text:'Bachelor’s degree in System Engineering, Computer Science, Information Systems, Engineering Science, Engineering Management, or related discipline from an accredited college or university is required.'},
                {text:'Five (5) years of additional SE experience may be substituted for a bachelor’s degree.'}
            ]
        },
        {
            id: 10,
            title: 'System Engineer (SE)',
            category: 'Enginerring',
            skillLevel: 2,
            description: 'Analyzes user’s requirements, concept of operations documents, and high level system architectures to develop system requirements specifications. Analyzes system requirements and leads design and development activities. Guides users in formulating requirements, advises alternative approaches, and conducts feasibility studies. Provides technical leadership for the integration of requirements, design, and technology. Incorporates new plans, designs and systems into ongoing operations. Develops technical documentation. Develops system Architecture and system design documentation. Guides system development and implementation planning through assessment or preparation of system engineering management plans and system integration and test plans. Interacts with the Government regarding Systems Engineering technical considerations and for associated problems, issues or conflicts. Ultimate responsibility for the technical integrity of work performed and deliverables associated with the Systems Engineering area of responsibility. Communicates with other program personnel, government overseers, and senior executives.',
            capabilities: [
                {text:'Contribute to the development of sections of systems engineering documentation such as System Engineering Plans, Initial Capabilities Documents, Requirements specifications, and Interface Control Documents'}, 
                {text:'Manage system requirements and derived requirements to ensure the delivery of production systems that are compatible with the defined system architecture(s) – Department of Defense Architecture Framework (DoDAF), Service-oriented Architecture (SOA), etc'}, 
                {text:'Assist with the development of system requirements, functional requirements, and allocation of the same to individual hardware, software, facility, and personnel components'},
                {text:'Coordinate the resolution of action items from Configuration Control Board (CCB) meetings, design reviews, program reviews, and test reviews that require cross-discipline coordination'}, 
                {text:'Participate in an Integrated Product Team to design new capabilities based upon evaluation of all necessary development and operational considerations'}, 
                {text:'Participate in the development of system engineering documentation, such as System Engineering Plans, Initial Capabilities Documents, Requirements Specifications, and Interface Control Documents'},
                {text:'Participate in interface definition, design, and changes to the configuration between affected groups and individuals throughout the life cycle'}, 
                {text:'Allocate real-time process budgets and error budgets to systems and subsystem components'}, 
                {text:'Derive from the system requirements an understanding of stakeholder needs, functions that may be logically inferred and implied as essential to system effectiveness'},
                {text:'Derive lower-level requirements from higher-level allocated requirements that describe in detail the functions that a system component must fulfill, and ensure these requirements are complete, correct, unique, unambiguous, realizable, and verifiable'}, 
                {text:'Generate alternative system concepts, physical architectures, and design solutions'}, 
                {text:'Participate in establishing and gaining approval of the definition of a system or component under development (requirements, designs, interfaces, test procedures, etc.) that provides a common reference point for hardware and software developers'},
                {text:'Define the methods, processes, and evaluation criteria by which the systems, subsystems and work products are verified against their requirements in a written plan'}, 
                {text:'Develop system design solution that satisfies the system requirements and fulfills the functional analysis'}, 
                {text:'Develop derived requirements for Information Assurance Services (Confidentiality, Integrity, Non repudiation, and Availability); Basic Information Assurance Mechanisms (e.g., Identification, Authentication, Access Control, Accountability); and Security Mechanism Technology (Passwords, cryptography, discretionary access control, mandatory access control, hashing, key management, etc.)'},
                {text:'Review and provide input to program and contract work breakdown structure (WBS), work packages and the integrated master plan (IMP)'}, 
                {text:'Provide technical direction for the development, engineering, interfacing, integration, and testing of specific components of complex hardware/software systems to include requirements elicitation, analysis and functional allocation, conducting systems requirements reviews, developing concepts of operation and interface standards, developing system architectures, and performing technical/nontechnical assessment and management as well as end-to-end flow analysis'}, 
                {text:'Implement comprehensive SOA solutions'},
                {text:'Implement operational view, technical standards view, and system and services view for architectures using applicable DoDAF standards'}, 
                {text:'Develop scenarios (threads) and an Operational Concept that describes the interactions between the system, the user, and the environment, that satisfies operational, support, maintenance, and disposal needs'}, 
                {text:'Review and/or approve system engineering documentation to ensure that processes and specifications meet system needs and are accurate, comprehensive, and complete'},
                {text:'Conduct quantitative analysis in non-functional system performance areas like Reliability, Maintainability, Vulnerability, Survivability, Produceability, etc.)'}, 
                {text:'Establish and follow a formal procedure for coordinating system integration activities among multiple teams, ensuring complete coverage of all interfaces'},
                {text:'Capture all interface designs in a common interface control format, and store interface data in a commonly accessible repository'}, 
                {text:'Prepare time-line analysis diagrams illustrating the flow of time-dependent functions'}, 
                {text:'Establish a process to formally and proactively control and manage changes to requirements, consider impacts prior to commitment to change, gain stakeholder buy-in, eliminate ambiguity, ensure traceability to source requirements, and track and settle open actions'},
                {text:'Assess each risk to the program and determine the probability of occurrence and quantified consequence of failure in accordance with an approved risk management plan'}, 
                {text:'Manage and ensure the technical integrity of the system baseline over time, continually updating it as various changes are imposed on the system during the lifecycle from development through deployment and operations & maintenance'},
                {text:'In conjunction with system stakeholders, plan the verification efforts of new and unproven designs early in the development life cycle to ensure compliance with established requirements'}, 
                {text:'Support the planning and test analysis of the DoD Certification/Accreditation Process (as well as other Government Certification and Accreditation (C&A) processes)'}, 
                {text:'Support the development and review of Joint Capability Integration Development System (JCIDS) documents (i.e., Initial Capability Document, Capabilities Description Document, IA Strategy)'}
            ],
            qualifications: [
                {text:'Fourteen (14) years of experience as a SE in programs and contracts of similar scope, type and complexity is required.'}, 
                {text:'Bachelor’s degree in System Engineering, Computer Science, Information Systems, Engineering Science, Engineering Management, or related discipline from an accredited college or university is required.'},
                {text:'Five (5) years of additional SE experience may be substituted for a bachelor’s degree.'}
            ]
        },
        {
            id: 11,
            title: 'System Engineer (SE)',
            category: 'Engineering',
            skillLevel: 3,
            description: 'Analyzes user’s requirements, concept of operations documents, and high level system architectures to develop system requirements specifications. Analyzes system requirements and leads design and development activities. Guides users in formulating requirements, advises alternative approaches, and conducts feasibility studies. Provides technical leadership for the integration of requirements, design, and technology. Incorporates new plans, designs and systems into ongoing operations. Develops technical documentation. Develops system Architecture and system design documentation. Guides system development and implementation planning through assessment or preparation of system engineering management plans and system integration and test plans. Interacts with the Government regarding Systems Engineering technical considerations and for associated problems, issues or conflicts. Ultimate responsibility for the technical integrity of work performed and deliverables associated with the Systems Engineering area of responsibility. Communicates with other program personnel, government overseers, and senior executives.',
            capabilities: [
                {text:'Contribute to the development of sections of systems engineering documentation such as System Engineering Plans, Initial Capabilities Documents, Requirements specifications, and Interface Control Documents'}, 
                {text:'Manage system requirements and derived requirements to ensure the delivery of production systems that are compatible with the defined system architecture(s) – Department of Defense Architecture Framework (DoDAF), Service-oriented Architecture (SOA), etc'}, 
                {text:'Assist with the development of system requirements, functional requirements, and allocation of the same to individual hardware, software, facility, and personnel components'},
                {text:'Coordinate the resolution of action items from Configuration Control Board (CCB) meetings, design reviews, program reviews, and test reviews that require cross-discipline coordination'}, 
                {text:'Participate in an Integrated Product Team to design new capabilities based upon evaluation of all necessary development and operational considerations'}, 
                {text:'Participate in the development of system engineering documentation, such as System Engineering Plans, Initial Capabilities Documents, Requirements Specifications, and Interface Control Documents'},
                {text:'Participate in interface definition, design, and changes to the configuration between affected groups and individuals throughout the life cycle'}, 
                {text:'Allocate real-time process budgets and error budgets to systems and subsystem components'}, 
                {text:'Derive from the system requirements an understanding of stakeholder needs, functions that may be logically inferred and implied as essential to system effectiveness'},
                {text:'Derive lower-level requirements from higher-level allocated requirements that describe in detail the functions that a system component must fulfill, and ensure these requirements are complete, correct, unique, unambiguous, realizable, and verifiable'}, 
                {text:'Generate alternative system concepts, physical architectures, and design solutions'}, 
                {text:'Participate in establishing and gaining approval of the definition of a system or component under development (requirements, designs, interfaces, test procedures, etc.) that provides a common reference point for hardware and software developers'},
                {text:'Define the methods, processes, and evaluation criteria by which the systems, subsystems and work products are verified against their requirements in a written plan'}, 
                {text:'Develop system design solution that satisfies the system requirements and fulfills the functional analysis'},
                {text:'Develop derived requirements for Information Assurance Services (Confidentiality, Integrity, Non repudiation, and Availability); Basic Information Assurance Mechanisms (e.g., Identification, Authentication, Access Control, Accountability); and Security Mechanism Technology (Passwords, cryptography, discretionary access control, mandatory access control, hashing, key management, etc.)'}, 
                {text:'Review and provide input to program and contract work breakdown structure (WBS), work packages and the integrated master plan (IMP)'},
                {text:'Provide technical direction for the development, engineering, interfacing, integration, and testing of specific components of complex hardware/software systems to include requirements elicitation, analysis and functional allocation, conducting systems requirements reviews, developing concepts of operation and interface standards, developing system architectures, and performing technical/nontechnical assessment and management as well as end-to-end flow analysis'}, 
                {text:'Implement comprehensive SOA solutions'},
                {text:'Implement operational view, technical standards view, and system and services view for architectures using applicable DoDAF standards'}, 
                {text:'Develop scenarios (threads) and an Operational Concept that describes the interactions between the system, the user, and the environment, that satisfies operational, support, maintenance, and disposal needs'},
                {text:'Review and/or approve system engineering documentation to ensure that processes and specifications meet system needs and are accurate, comprehensive, and complete'}, 
                {text:'Conduct quantitative analysis in non-functional system performance areas like Reliability, Maintainability, Vulnerability, Survivability, Produceability, etc.)'},
                {text:'Establish and follow a formal procedure for coordinating system integration activities among multiple teams, ensuring complete coverage of all interfaces'}, 
                {text:'Capture all interface designs in a common interface control format, and store interface data in a commonly accessible repository'},
                {text:'Prepare time-line analysis diagrams illustrating the flow of time-dependent functions'},
                {text:'Establish a process to formally and proactively control and manage changes to requirements, consider impacts prior to commitment to change, gain stakeholder buy-in, eliminate ambiguity, ensure traceability to source requirements, and track and settle open actions'}, 
                {text:'Assess each risk to the program and determine the probability of occurrence and quantified consequence of failure in accordance with an approved risk management plan'},
                {text:'Manage and ensure the technical integrity of the system baseline over time, continually updating it as various changes are imposed on the system during the lifecycle from development through deployment and operations & maintenance'}, 
                {text:'In conjunction with system stakeholders, plan the verification efforts of new and unproven designs early in the development life cycle to ensure compliance with established requirements'},
                {text:'Support the planning and test analysis of the DoD Certification/Accreditation Process (as well as other Government Certification and Accreditation (C&A) processes)'}, 
                {text:'Support the development and review of Joint Capability Integration Development System (JCIDS) documents (i.e., Initial Capability Document, Capabilities Description Document, IA Strategy)'},
                {text:'Provide technical direction for the development, engineering, interfacing, integration, and testing of all components of complex hardware/software systems to include requirements elicitation, analysis and functional allocation, conducting systems requirements reviews, developing concepts of operation and interface standards, developing system architectures, and performing technical/nontechnical assessment and management as well as end-to-end flow analysis'},
                {text:'Develop comprehensive SOA solutions'}, 
                {text:'Develop operational view, technical standards view, and system and services view for architectures using applicable DoDAF standards'},
                {text:'Conduct and/or approve end-to-end system trade analyses to optimize system operations over its life-cycle through the proper balance of non-functional system performance areas'}, 
                {text:'Improve standard integration strategies based upon rationale for previous decisions that resulted in improved integration performance'},
                {text:'Fully define interfaces in terms of origination, destination, stimulus, and data characteristics for software; and electrical and mechanical characteristics for hardware'}, 
                {text:'Use validated models, simulations, and prototyping to mitigate risk and reduce cost of system development'},
                {text:'Develop alternative courses of action, workarounds, and fall-back positions with a recommended course of action for each risk, and monitor and re-evaluate risks at appropriate milestones. Monitors risks using earned value management (EVM) data'},
                {text:'Maintain knowledge of current and evolving agency, national, and international standards applicable to the system development of interest. Apply and enforce use of suitable standards to ensure consistency and interoperability of developer hardware and software'}, 
                {text:'Ensure effective, periodic review and control of the evolving configuration of a system, both hardware and software components and associated documentation, during the life of the system'},
                {text:'Serve as a member of the CCB'}, 
                {text:'As a participant within an Analysis of Alternatives (AoA) effort, recommend a preferred solution based on selection criteria adjusted for reasonableness and validity of assumptions, technology limitations, environmental impact, and life-cycle costs'},
                {text:'Develop system design alternatives that consider life cycle cost, reuse, complexity, risk, system expansion, and growth'}
            ],
            qualifications: [
                {text:'Twenty (20) years of experience as a SE in programs and contracts of similar scope, type and complexity is required.'}, 
                {text:'Demonstrated experience in planning and leading Systems Engineering efforts is required.'},
                {text:'Bachelor’s degree in System Engineering, Computer Science, Information Systems, Engineering Science, Engineering Management, or related discipline from an accredited college or university is required.'}, 
                {text:'Five (5) years of additional SE experience may be substituted for a bachelor’s degree.'}
            ]
        },
        {
            id: 12,
            title: 'Technical Writer (TW)',
            category: 'Technical Writing',
            skillLevel: 0,
            description: 'Responsible for the preparation, review, revision, and maintenance of technical documents including software and systems engineering, system operations, testing, and user documentation. Writes and edits technical documentation for all of the project’s hardware and software to include installation, configuration and how-to documentation. Creates code documentation for software; produces implementation guides and end-user guides for capabilities; provides field, data definition, and data flow documentation and formats technical publications from pamphlets, technical drawings, and consultations with technical personnel and other available resources.',
            capabilities: [
                {text:'Understand basic concepts (to include basic grammar concepts), responsible for writing technical copy for various types of documents'}, 
                {text:'Assist in preparing and maintaining operations documentation, user guides and manuals and technical publications'}, 
                {text:'Gather technical information, prepares written text'},
                {text:'Maintain a current internal documentation library'}, 
                {text:'Use multiple word processing and presentation tools such as MS Word, PowerPoint, and Visio etc.'}
            ],
            qualifications: [
                {text:'Associate’s degree in a technical discipline from an accredited college or university is required.'}, 
                {text:'Two (2) years of TW experience may be substituted for an Associate’s degree.'},
                {text:'No demonstrated experience is required.'}
            ]
        },
        {
            id: 13,
            title: 'Technical Writer (TW)',
            category: 'Technical Writing',
            skillLevel: 1,
            description: 'Responsible for the preparation, review, revision, and maintenance of technical documents including software and systems engineering, system operations, testing, and user documentation. Writes and edits technical documentation for all of the project’s hardware and software to include installation, configuration and how-to documentation. Creates code documentation for software; produces implementation guides and end-user guides for capabilities; provides field, data definition, and data flow documentation and formats technical publications from pamphlets, technical drawings, and consultations with technical personnel and other available resources.',
            capabilities: [
                {text:'Understand basic concepts (to include basic grammar concepts), responsible for writing technical copy for various types of documents'}, 
                {text:'Assist in preparing and maintaining operations documentation, user guides and manuals and technical publications'}, 
                {text:'Gather technical information, prepares written text'},
                {text:'Maintain a current internal documentation library'}, 
                {text:'Use multiple word processing and presentation tools such as MS Word, PowerPoint, and Visio etc.'}, 
                {text:'Understand basic concepts and write technical copy for various types of documents for a program/project of similar complexity'},
                {text:'Prepare and maintain operations documentation, user guides and manuals and technical publications'}, 
                {text:'Prepare reports, responses, and briefings targeted to a wide range of audiences'}, 
                {text:'Work with developers to produce quality documentation and training materials'},
                {text:'Coordinate layout and design of documents'}, 
                {text:'Work on all phases of documentation'}
            ],
            qualifications: [
                {text:'Two (2) years of experience as a TW in programs and contracts of similar scope, type, and complexity is required.'}, 
                {text:'Associate’s degree in a technical discipline from an accredited college or university is required.'},
                {text:'Two (2) years of additional TW experience may be substituted for an Associate’s degree.'}
            ]
        },
        {
            id: 14,
            title: 'Technical Writer (TW)',
            category: 'Technical Writing',
            skillLevel: 2,
            description: 'Responsible for the preparation, review, revision, and maintenance of technical documents including software and systems engineering, system operations, testing, and user documentation. Writes and edits technical documentation for all of the project’s hardware and software to include installation, configuration and how-to documentation. Creates code documentation for software; produces implementation guides and end-user guides for capabilities; provides field, data definition, and data flow documentation and formats technical publications from pamphlets, technical drawings, and consultations with technical personnel and other available resources.',
            capabilities: [
                {text:'Understand basic concepts (to include basic grammar concepts), responsible for writing technical copy for various types of documents'}, 
                {text:'Assist in preparing and maintaining operations documentation, user guides and manuals and technical publications'}, 
                {text:'Gather technical information, prepares written text'},
                {text:'Maintain a current internal documentation library'}, 
                {text:'Use multiple word processing and presentation tools such as MS Word, PowerPoint, and Visio etc.'}, 
                {text:'Understand basic concepts and write technical copy for various types of documents for a program/project of similar complexity'},
                {text:'Prepare and maintain operations documentation, user guides and manuals and technical publications'}, 
                {text:'Prepare reports, responses, and briefings targeted to a wide range of audiences'}, 
                {text:'Work with developers to produce quality documentation and training materials'},
                {text:'Coordinate layout and design of documents'}, 
                {text:'Work on all phases of documentation'}, 
                {text:'Under general direction, write technical copy for various types of documents for a program/project of similar complexity'},
                {text:'Apply concepts for technical writing based on engineering drawings, technical information from engineering documentation, consultations with engineers and subject matter experts, and other available sources'},
                {text:'Produce defense acquisition documentation, user manuals, training manuals, and other documentation utilized by the end-user community of DoD electronic equipment and systems'}, 
                {text:'Interpret engineering and maintenance drawings, operational procedures to understand and blend large quantities of computer related information'}, 
                {text:'Research highly technical subject matter, organizes information from multiples sources, and express technical information in written form that is comprehensible to a wide audience of readers'},
                {text:'Produce technical documentation for Cryptologic programs or projects developing analytic tradecraft methodologies'}, 
                {text:'Apply technical manual standard NSA DS-89 to work products'}
            ],
            qualifications: [
                {text:'Six (6) years of experience as a TW in programs and contracts of similar scope, type, and complexity is required.'}, 
                {text:'Bachelor’s degree in a technical discipline from an accredited college or university is required.'},
                {text:'Four (4) years of additional TW experience may be substituted for a bachelor’s degree.'}
            ]
        },
        {
            id: 15,
            title: 'Technical Writer (TW)',
            category: 'Technical Writing',
            skillLevel: 3,
            description: 'Responsible for the preparation, review, revision, and maintenance of technical documents including software and systems engineering, system operations, testing, and user documentation. Writes and edits technical documentation for all of the project’s hardware and software to include installation, configuration and how-to documentation. Creates code documentation for software; produces implementation guides and end-user guides for capabilities; provides field, data definition, and data flow documentation and formats technical publications from pamphlets, technical drawings, and consultations with technical personnel and other available resources.',
            capabilities: [
                {text:'Understand basic concepts (to include basic grammar concepts), responsible for writing technical copy for various types of documents'}, 
                {text:'Assist in preparing and maintaining operations documentation, user guides and manuals and technical publications'}, 
                {text:'Gather technical information, prepares written text'},
                {text:'Maintain a current internal documentation library'}, 
                {text:'Use multiple word processing and presentation tools such as MS Word, PowerPoint, and Visio etc.'}, 
                {text:'Understand basic concepts and write technical copy for various types of documents for a program/project of similar complexity'},
                {text:'Prepare and maintain operations documentation, user guides and manuals and technical publications'}, 
                {text:'Prepare reports, responses, and briefings targeted to a wide range of audiences'}, 
                {text:'Work with developers to produce quality documentation and training materials'},
                {text:'Coordinate layout and design of documents'}, 
                {text:'Work on all phases of documentation'}, 
                {text:'Under general direction, write technical copy for various types of documents for a program/project of similar complexity'},
                {text:'Apply concepts for technical writing based on engineering drawings, technical information from engineering documentation, consultations with engineers and subject matter experts, and other available sources'}, 
                {text:'Produce defense acquisition documentation, user manuals, training manuals, and other documentation utilized by the end-user community of DoD electronic equipment and systems'},
                {text:'Interpret engineering and maintenance drawings, operational procedures to understand and blend large quantities of computer related information'}, 
                {text:'Research highly technical subject matter, organizes information from multiples sources, and express technical information in written form that is comprehensible to a wide audience of readers'}, 
                {text:'Produce technical documentation for Cryptologic programs or projects developing analytic tradecraft methodologies'},
                {text:'Apply technical manual standard NSA DS-89 to work products'}, 
                {text:'Work independently preparing and maintaining highly complex systems, programming and operations documentation, procedures and methods'},
                {text:'Provide expert oversight of technical writing and editing to all phases of acquisition and technical documentation for the Program, Project, or Contract'}, 
                {text:'Act as project leader for projects with complex or voluminous documentation and may provide or coordinate special documentation services as required'}, 
                {text:'Review work products of others for compliance with technical manual NSA Data Standard (DS)- 89'}

            ],
            qualifications: [
                {text:'Eight (8) years of experience as a TW in programs and contracts of similar scope,type, and complexity is required.'}, 
                {text:'Bachelor’s degree in a technical discipline from an accredited college or university is required.'},
                {text:'A Master’s degree may be substituted for two (2) years of experience, reducing the requirement to six (6) years of experience.'}, 
                {text:'Four (4) years of additional TW experience may be substituted for a bachelor’s degree.'}
            ]
        },
        {
            id: 16,
            title: 'Acquisition Professional',
            category: 'Acquisitions',
            skillLevel: 0,
            description: 'Provide acquisition support on functions of program management. Assist program managers in developing program documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams. Provide expertise on the myriad of factors that influence cost, schedule, performance, and risk. Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer. Provides assistance in analyzing and developing improved policies, plans, methods, procedures, and systems of acquisition management programs.',
            capabilities: [
                {text:'Prepare non-complex requisitions (for purchase orders and simplified acquisitions) in NSA’s financial management system (currently FACTS), or assist other requestors in the timely development, tracking and monitoring of requisitions through approval and certification cycles. For NSA awarded contracts, ensure that requisitions reach the recognized BA3 database.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is included (e.g. ensure recent quotes obtained; verify Section 508 information; ensure acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA). In addition, the following documentation may be included: Sole Source Justification, Small Business Dissolve Set Aside, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'}, 
                {text:'Prepare non-complex Military Interdepartmental Purchase Requests (MIPR) and Economy Act Orders (EAO), and requisitions associated with MIPRs and EAOs in NSA’s financial management system (currently FACTS).'},
                {text:'Assist Program and Project Managers in the maintenance of Spend Plans.'}, 
                {text:'Track financial execution performance information (commitments, obligations, and outlays).'}, 
                {text:'Provide financial status reports for program offices, budget center managers, contracting officers’ representatives, and expenditure center managers as tasked and recommending funding adjustments as appropriate.'}
            ],
            qualifications: [
                {text:'Two (2) years of demonstrated experience in acquisition, contracting, purchasing or finance required. In lieu of 2 years of experience, Project Management Institute PMP certification, or Contract Manager CPCM certification, or DAWIA Level I in any focus area or an undergraduate degree with a business focus is acceptable.'}, 
                {text:'Experience in NSA’s financial management system (currently FACTS) is preferred.'}
            ]
        },
        {
            id: 17,
            title: 'Acquisition Professional',
            category: 'Acquisitions',
            skillLevel: 1,
            description: 'Provide acquisition support on functions of program management. Assist program managers in developing program documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams. Provide expertise on the myriad of factors that influence cost, schedule, performance, and risk. Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer. Provides assistance in analyzing and developing improved policies, plans, methods, procedures, and systems of acquisition management programs.',
            capabilities: [
                {text:'Prepare non-complex requisitions (for purchase orders and simplified acquisitions) in NSA’s financial management system (currently FACTS), or assist other requestors in the timely development, tracking and monitoring of requisitions through approval and certification cycles. For NSA awarded contracts, ensure that requisitions reach the recognized BA3 database.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is included (e.g. ensure recent quotes obtained; verify Section 508 information; ensure acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA). In addition, the following documentation may be included: Sole Source Justification, Small Business Dissolve Set Aside, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'}, 
                {text:'Prepare non-complex Military Interdepartmental Purchase Requests (MIPR) and Economy Act Orders (EAO), and requisitions associated with MIPRs and EAOs in NSA’s financial management system (currently FACTS).'},
                {text:'Assist Program and Project Managers in the maintenance of Spend Plans.'}, 
                {text:'Track financial execution performance information (commitments, obligations, and outlays).'}, 
                {text:'Provide financial status reports for program offices, budget center managers, contracting officers representatives, and expenditure center managers as tasked and recommending funding adjustments as appropriate.'},
                {text:'Prepare complex requisition packages (for a contract award) in NSA’s financial management system (currently FACTS), or assist other requestors in the timely development, tracking and monitoring of requisitions through approval and certification cycles. For NSA awarded contracts, ensure that requisitions reach the recognized BA3 database.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is included (e.g. ensure recent quotes obtained; verify Section 508 information; ensure acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA) and CDRLs). In addition, the following documentation may be included: Sole Source Justification, Small Business Dissolve Set Aside, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'}, 
                {text:'Prepare complex Military Interdepartmental Purchase Requests (MIPR) and Economy Act Orders (EAO), and requisitions associated with MIPRs and EAOs in NSA’s financial management system (currently FACTS).'},
                {text:'Utilize established NSA acquisition and financial management policies, procedures, regulations and tools.'}, 
                {text:'Track financial execution performance information (commitments, obligations, and outlays).'}, 
                {text:'Provide financial status reports for program offices, budget center managers, contracting officers representatives, and expenditure center managers as tasked and recommend funding adjustments as appropriate.'},
                {text:'Support GPM’s in the identification and collection of Minimum Acquisition Requirements.'},
                {text:'Coordinate and schedule pre-acquisition meetings, to include IPTs.'}, 
                {text:'Assist program managers in developing program documentation, creating program schedules, and tracking program status.'}, 
                {text:'Provide support to GPMs to assure execution within the cost, schedule, and performance baselines.'},
                {text:'Provide assistance in analyzing and developing improved policies, plans, methods, procedures, and systems of acquisition management programs.'}
            ],
            qualifications: [
                {text:'Five (5) years of demonstrated combined experience in DoD acquisition management, program management, and/or contract management is required and a Bachelor’s Degree with a business focus is required. In lieu of a degree, Project Management Institute PMP certification, or Contract Manager CPCM certification, or DAWIA Level II in any focus area, and an additional three (3) years of directly related experience for a total of eight (8) years may be substituted.'}
            ]
        },
        {
            id: 18,
            title: 'Acquisition Professional',
            category: 'Acquisitions',
            skillLevel: 2,
            description: ' Provide acquisition support on functions of program management. Assist program managers in developing program documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams. Provide expertise on the myriad of factors that influence cost, schedule, performance, and risk. Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer. Provides assistance in analyzing and developing improved policies, plans, methods, procedures, and systems of acquisition management programs.',
            capabilities: [
                {text:'Prepare non-complex requisitions (for purchase orders and simplified acquisitions) in NSA’s financial management system (currently FACTS), or assist other requestors in the timely development, tracking and monitoring of requisitions through approval and certification cycles. For NSA awarded contracts, ensure that requisitions reach the recognized BA3 database.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is included (e.g. ensure recent quotes obtained; verify Section 508 information; ensure acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA). In addition, the following documentation may be included: Sole Source Justification, Small Business Dissolve Set Aside, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'}, 
                {text:'Prepare non-complex Military Interdepartmental Purchase Requests (MIPR) and Economy Act Orders (EAO), and requisitions associated with MIPRs and EAOs in NSA’s financial management system (currently FACTS).'},
                {text:'Assist Program and Project Managers in the maintenance of Spend Plans.'}, 
                {text:'Track financial execution performance information (commitments, obligations, and outlays).'}, 
                {text:'Provide financial status reports for program offices, budget center managers, contracting officers representatives, and expenditure center managers as tasked and recommending funding adjustments as appropriate.'},
                {text:'Prepare complex requisition packages (for a contract award) in NSA’s financial management system (currently FACTS), or assist other requestors in the timely development, tracking and monitoring of requisitions through approval and certification cycles. For NSA awarded contracts, ensure that requisitions reach the recognized BA3 database.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is included (e.g. ensure recent quotes obtained; verify Section 508 information; ensure acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA) and CDRLs). In addition, the following documentation may be included: Sole Source Justification, Small Business Dissolve Set Aside, Power/Space/Cooling Approval, and Baseline exemption Requests  (BERs).'}, 
                {text:'Prepare complex Military Interdepartmental Purchase Requests (MIPR) and Economy Act Orders (EAO), and requisitions associated with MIPRs and EAOs in NSA’s financial management system (currently FACTS).'},
                {text:'Utilize established NSA acquisition and financial management policies, procedures, regulations and tools.'}, 
                {text:'Track financial execution performance information (commitments, obligations, and outlays).'}, 
                {text:'Provide financial status reports for program offices, budget center managers, contracting officers representatives, and expenditure center managers as tasked and recommend funding adjustments as appropriate.'},
                {text:'Support GPM’s in the identification and collection of Minimum Acquisition Requirements.'}, 
                {text:'Coordinate and schedule pre-acquisition meetings, to include IPTs.'}, 
                {text:'Assist program managers in developing program documentation, creating program schedules, and tracking program status.'},
                {text:'Provide support to GPMs to assure execution within the cost, schedule, and performance baselines.'}, 
                {text:'Provide assistance in analyzing and developing improved policies, plans, methods, procedures, and systems of acquisition management programs.'}, 
                {text:'Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer. Work with government project  personnel and contracting, as appropriate, ensuring that all required documentation is completed and included (e.g. verify Section 508 information; acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA), CDRLs and Source Selection Plan and associated documents. In addition, the following  documentation may be included: Sole Source Justification, Small Business Dissolve Set Aside, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'},
                {text:'Assist program managers in developing program documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams.'}, 
                {text:'Utilize established NSA acquisition and financial management policies, procedures, regulations and tools.'}, 
                {text:'Track financial execution performance information (commitments, obligations, and outlays).'},
                {text:'Provide financial status reports for program offices, budget center managers, contracting officers representatives, and expenditure center managers as tasked and recommend funding adjustments as appropriate.'}, 
                {text:'Support GPM’s in the identification and collection of Minimum Acquisition Requirements.'}, 
                {text:'Coordinate and schedule pre-acquisition meetings, to include IPTs.'},
                {text:'Provide support to GPMs to assure execution within the cost, schedule, and performance baselines.'}, 
                {text:'Provide assistance in acquisition process improvement initiatives.'},
                {text:'Assist the Government Program Offices with responses to internal and external requests for information.'}, 
                {text:'Provide oversight and compliance review of acquisition documentation at all levels of preparation.'}, 
                {text:'Assist the Government with coordination and advice in the areas of acquisition and program management for Tier II Programs.'}
            ],
            qualifications: [
                {text:'Eight (8) years of demonstrated combined experience in DoD acquisition management, program management, and/or contract management, and a Bachelor’s Degree with a business focus is required. In lieu of a degree, Project Management Institute PMP certification, or Contract Manager CPCM certification, or DAWIA Level III in any focus area, and an additional three (3) years of directly related experience for a total of eleven (11) years may be substituted.'}
            ]
        },
        {
            id: 19,
            title: 'Acquisition Professional',
            category: 'Acquisitions',
            skillLevel: 3,
            description: 'Provide acquisition support on functions of program management. Assist program managers in developing program documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams. Provide expertise on the myriad of factors that influence cost, schedule, performance, and risk. Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer. Provides assistance in analyzing and developing improved policies, plans, methods, procedures, and systems of acquisition management programs.',
            capabilities: [
                {text:'Prepare non-complex requisitions (for purchase orders and simplified acquisitions) in NSA’s financial management system (currently FACTS), or assist other requestors in the timely development, tracking and monitoring of requisitions through approval and certification cycles. For NSA awarded contracts, ensure that requisitions reach the recognized BA3 database.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is included (e.g. ensure recent quotes obtained; verify Section 508 information; ensure acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA). In addition, the following documentation may be included: Sole Source Justification, Small Business Dissolve Set Aside, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'}, 
                {text:'Prepare non-complex Military Interdepartmental Purchase Requests (MIPR) and Economy Act Orders (EAO), and requisitions associated with MIPRs and EAOs in NSA’s financial management system (currently FACTS).'},
                {text:'Assist Program and Project Managers in the maintenance of Spend Plans.'}, 
                {text:'Track financial execution performance information (commitments, obligations, and outlays).'}, 
                {text:'Provide financial status reports for program offices, budget center managers, contracting officers representatives, and expenditure center managers as tasked and recommending funding adjustments as appropriate.'},
                {text:'Prepare complex requisition packages (for a contract award) in NSA’s financial management system (currently FACTS), or assist other requestors in the timely development, tracking and monitoring of requisitions through approval and certification cycles. For NSA awarded contracts, ensure that requisitions reach the recognized BA3 database.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is included (e.g. ensure recent quotes obtained; verify Section 508 information; ensure acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA) and CDRLs). In addition, the following documentation may be included: Sole Source Justification, Small Business Dissolve Set Aside, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'}, 
                {text:'Prepare complex Military Interdepartmental Purchase Requests (MIPR) and Economy Act Orders (EAO), and requisitions associated with MIPRs and EAOs in NSA’s financial management system (currently FACTS).'},
                {text:'Utilize established NSA acquisition and financial management policies, procedures, regulations and tools.'}, 
                {text:'Track financial execution performance information (commitments, obligations, and outlays).'}, 
                {text:'Provide financial status reports for program offices, budget center managers, contracting officers representatives, and expenditure center managers as tasked and recommend funding adjustments as appropriate.'},
                {text:'Support GPM’s in the identification and collection of Minimum Acquisition Requirements.'}, 
                {text:'Coordinate and schedule pre-acquisition meetings, to include IPTs.'},
                {text:'Assist program managers in developing program documentation, creating program schedules, and tracking program status.'}, 
                {text:'Provide support to GPMs to assure execution within the cost, schedule, and performance baselines.'}, 
                {text:'Provide assistance in analyzing and developing improved policies, plans, methods, procedures, and systems of acquisition management programs.'},
                {text:'Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is completed and included (e.g. verify Section 508 information; acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA), CDRLs and Source Selection Plan and associated documents. In addition, the following documentation may be included: Sole Source Justification, Small Business Dissolve Set Aside, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'}, 
                {text:'Assist program managers in developing program documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams.'},
                {text:'Utilize established NSA acquisition and financial management policies, procedures, regulations and tools.'}, 
                {text:'Track financial execution performance information (commitments, obligations, and outlays).'},
                {text:'Provide financial status reports for program offices, budget center managers, contracting officers representatives, and expenditure center managers as tasked and recommend funding adjustments as appropriate.'}, 
                {text:'Support GPM’s in the identification and collection of Minimum Acquisition Requirements.'}, 
                {text:'Coordinate and schedule pre-acquisition meetings, to include IPTs.'},
                {text:'Provide support to GPMs to assure execution within the cost, schedule, and performance baselines.'}, 
                {text:'Provide assistance in acquisition process improvement initiatives.'}, 
                {text:'Assist the Government Program Offices with responses to internal and external requests for information.'},
                {text:'Provide oversight and compliance review of acquisition documentation at all levels of preparation.'}, 
                {text:'Assist the Government with coordination and advice in the areas of acquisition and program management for Tier II Programs.'},
                {text:'Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is completed and included (e.g. verify Section 508 information; acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA), CDRLs and Source Selection Plan and associated documents. In addition, the following documentation may be included: Sole Source Justification, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'}, 
                {text:'Assist program managers in developing program and acquisition documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams (e.g. Test and Evaluation MasterPlan (TEMP), Initial Capabilities Document (ICD), Capabilities Development Document (CDD), Capabilities Production Document (CPD), Analysis of Alternatives (AOA).'},
                {text:'Utilize established NSA acquisition and financial management policies, procedures, regulations and tools.'}, 
                {text:'Support GPM in the identification and collection of Minimum Acquisition Requirements.'}, 
                {text:'Provide support to GPM to assure execution within the cost, schedule, and performance baselines.'},
                {text:'Provide assistance in acquisition process improvement initiatives.'},
                {text:'Assist the GPM with responses to internal and external requests for information.'}, 
                {text:'Provide oversight and compliance review of acquisition documentation at all levels of preparation.'}, 
                {text:'Assist the Government with coordination and advice in the areas of acquisition and program management for Tier I and Tier II Programs.'}
            ],
            qualifications: [
                {text:'Twelve (12) years of demonstrated combined experience in DoD acquisition management, program management, and/or contract management.'}, 
                {text:'A Bachelor’s Degree in an acquisition related field and professional certification at any level from a recognized institution is desired but not required. In lieu of the Bachelor’s degree, Project Management Institute PMP certification, or Contract Manager CPCM certification, or DAWIA Level III in any other focus area, and an additional three (3) years of directly related experience for a total of fifteen (15) years may be substituted.'}
            ]
        },
        {
            id: 20,
            title: 'Acquisition Professional – BA5 Front Office Source Selection',
            category: 'Acquisitions',
            skillLevel: 2,
            description: 'Provide acquisition support on functions of program management. Assist program managers in developing program documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams. Provide expertise on the myriad of factors that influence cost, schedule, performance, and risk. Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer. Provides assistance in analyzing and developing improved policies, plans, methods, procedures, and systems of acquisition management programs.',
            capabilities: [
                {text:'Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is completed and included (e.g. verify Section 508 information; acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA), CDRLs and Source Selection Plan and associated documents. In addition, the following documentation may be included: Sole Source Justification, Small Business Dissolve Set Aside, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'}, 
                {text:'Assist program managers in developing program documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams.'},
                {text:'Utilize established NSA acquisition and financial management policies, procedures, regulations and tools.'}, 
                {text:'Track financial execution performance information (commitments, obligations, and outlays).'}, 
                {text:'Provide financial status reports for program offices, budget center managers, contracting officers representatives, and expenditure center managers as tasked and recommend funding adjustments as appropriate.'},
                {text:'Support GPM’s in the identification and collection of Minimum Acquisition Requirements.'}, 
                {text:'Coordinate and schedule pre-acquisition meetings, to include IPTs.'}, 
                {text:'Provide support to GPMs to assure execution within the cost, schedule, and performance baselines.'},
                {text:'Provide assistance in acquisition process improvement initiatives.'}, 
                {text:'Assist the Government Program Offices with responses to internal and external requests for information.'}, 
                {text:'Provide oversight and compliance review of acquisition documentation at all levels of preparation.'},
                {text:'Assist the Government with coordination and advice in the areas of acquisition and program management for Tier II Programs.'}
            ],
            qualifications: [
                {text:'Eight (8) years of demonstrated combined experience in DoD acquisition management, program management, and/or contract management, and a Bachelor’s Degree with a business focus is required. In lieu of a degree, Project Management Institute PMP certification, or Contract Manager CPCM certification, or DAWIA Level III in any focus area, and an additional three (3) years of directly related experience for a total of eleven (11) years may be substituted.'}, 
                {text:'Unless otherwise specified in the description field Three (3) years of demonstrated experience is required for the domain items described below:'},
                {text:'Any hands-on Federal Government Source Selection experience to include Best Value/Low-Price Technically Acceptable, Best Value/ Trade-Off, and Sole Source acquisitions. Any hands-on Federal Government Source Selection experience to include providing solicitation documentation guidance, source selection documentation and strategy documentation.'}
            ]
        },
        {
            id: 21,
            title: 'Acquisition Professional – BA5 Front Office Source Selection',
            category: 'Acquisitions',
            skillLevel: 3,
            description: 'Provide acquisition support on functions of program management. Assist program managers in developing program documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams. Provide expertise on the myriad of factors that influence cost, schedule, performance, and risk. Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer. Provides assistance in analyzing and developing improved policies, plans, methods, procedures, and systems of acquisition management programs.',
            capabilities: [
                {text:'Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is completed and included (e.g. verify Section 508 information; acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA), CDRLs and Source Selection Plan and associated documents. In addition, the following documentation may be included: Sole Source Justification, Small Business Dissolve Set Aside, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'}, 
                {text:'Assist program managers in developing program documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams.'},
                {text:'Utilize established NSA acquisition and financial management policies, procedures, regulations and tools.'}, 
                {text:'Track financial execution performance information (commitments, obligations, and outlays).'}, 
                {text:'Provide financial status reports for program offices, budget center managers, contracting officers representatives, and expenditure center managers as tasked and recommend funding adjustments as appropriate.'},
                {text:'Support GPM’s in the identification and collection of Minimum Acquisition Requirements.'}, 
                {text:'Coordinate and schedule pre-acquisition meetings, to include IPTs.'}, 
                {text:'Provide support to GPMs to assure execution within the cost, schedule, and performance baselines.'},
                {text:'Provide assistance in acquisition process improvement initiatives.'}, 
                {text:'Assist the Government Program Offices with responses to internal and external requests for information.'}, 
                {text:'Provide oversight and compliance review of acquisition documentation at all levels of preparation.'},
                {text:'Assist the Government with coordination and advice in the areas of acquisition and program management for Tier II Programs.'}, 
                {text:'Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is completed and included (e.g. verify Section 508 information; acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA), CDRLs and Source Selection Plan and associated documents. In addition, the following documentation may be included: Sole Source Justification, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'},
                {text:'Assist program managers in developing program and acquisition documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams (e.g. Test and Evaluation Master Plan (TEMP), Initial Capabilities Document (ICD), Capabilities Development Document (CDD), Capabilities Production Document (CPD), Analysis of Alternatives (AOA).'}, 
                {text:'Utilize established NSA acquisition and financial management policies, procedures, regulations and tools.'}, 
                {text:'Support GPM in the identification and collection of Minimum Acquisition Requirements.'},,
                {text:'Provide support to GPM to assure execution within the cost, schedule, and performance baselines.'}, 
                {text:'Provide assistance in acquisition process improvement initiatives.'}, 
                {text:'Assist the GPM with responses to internal and external requests for information.'},
                {text:'Provide oversight and compliance review of acquisition documentation at all levels of preparation.'}, 
                {text:'Assist the Government with coordination and advice in the areas of acquisition and program management for Tier I and Tier II Programs.'}
            ],
            qualifications: [
                {text:'Twelve (12) years of demonstrated combined experience in DoD acquisition management, program management, and/or contract management.'}, 
                {text:'A Bachelor’s Degree in an acquisition related field and professional certification at any level from a recognized institution is desired but not required. In lieu of the Bachelor’s degree, Project Management Institute PMP certification, or Contract Manager CPCM certification, or DAWIA Level III in any other focus area, and an additional three (3) years of directly related experience for a total of fifteen (15) years may be substituted.'}
            ]
        },
        {
            id: 22,
            title: 'Acquisition Professional Lead',
            category: 'Acquisitions',
            skillLevel: 3,
            description: 'Provide acquisition support on functions of program management. Assist program managers in developing program documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams. Provide expertise on the myriad of factors that influence cost, schedule, performance, and risk. Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer. Provides assistance in analyzing and developing improved policies, plans, methods, procedures, and systems of acquisition management programs.',
            capabilities: [
                {text:'Advise in the interpretation and tailoring of DoD/NSA acquisition regulations/memorandums, and ensure affordable, supportable and effective systems are delivered to the customer.'}, 
                {text:'Work with government project personnel and contracting, as appropriate, ensuring that all required documentation is completed and included (e.g. verify Section 508 information; acquisition security form and/or Contract Security Classification Specification (DD254) completed and submitted to Security; review the Competition in Contracting Act justification (CICA), CDRLs and Source Selection Plan and associated documents. In addition, the following documentation may be included: Sole Source Justification, Power/Space/Cooling Approval, and Baseline exemption Requests (BERs).'}, 
                {text:'Assist program managers in developing program and acquisition documentation, creating program schedules, tracking program status, evaluating operational and technical alternatives, performing risk assessment and managing integrated product teams (e.g. Test and Evaluation Master Plan (TEMP), Initial Capabilities Document (ICD), Capabilities Development Document (CDD), Capabilities Production Document (CPD), Analysis of Alternatives (AOA).'},
                {text:'Utilize established NSA acquisition and financial management policies, procedures, regulations and tools.'}, 
                {text:'Support GPM in the identification and collection of Minimum Acquisition Requirements.'}, 
                {text:'Provide support to GPM to assure execution within the cost, schedule, and performance baselines.'},
                {text:'Provide assistance in acquisition process improvement initiatives.'}, 
                {text:'Assist the GPM with responses to internal and external requests for information.'}, 
                {text:'Provide oversight and compliance review of acquisition documentation at all levels of preparation.'},
                {text:'Assist the Government with coordination and advice in the areas of acquisition and program management for Tier I and Tier II Programs.'}
            ],
            qualifications: [
                {text:'Twelve (12) years of demonstrated combined experience in DoD acquisition management, program management, and/or contract management.'}, 
                {text:'A Bachelor’s Degree in an acquisition related field and professional certification at any level from a recognized institution is desired but not required. In lieu of the Bachelor’s degree, Project Management Institute PMP certification, or Contract Manager CPCM certification, or DAWIA Level III in any other focus area, and an additional three (3) years of directly related experience for a total of fifteen (15) years may be substituted.'}
            ]
        },
        {
            id: 23,
            title: 'Data Management Specialist',
            category: 'Data Management',
            skillLevel: 2,
            description: 'Implement and supervise data management procedures for both classified and unclassified program and project information as defined by the Program Data Manager; Utilize available automated data management tools to support data management activities; Ensure adequate version control, storage, and retention of program and project data and documentation as directed by the Program Data Manager; Support the Program Data Manager in the conduct of all data management activities.',
            capabilities: [
                {text:'Monitors and maintains the databases and restructures if needed, including confirming the validity of the data contained in the file databases.'}, 
                {text:'Assists in the creation of structures and standards for use and maintenance of the databases, including enabling information to be pulled through various reports, ability to organize data through various methods, communication links to users, availability to user friendly options, etc.'}, 
                {text:'Ensures database access and connectivity support by collaborating with end users.'},
                {text:'Assists in the implementation of database maintenance and security procedures including adding and removing users, and administering quotas.'}, 
                {text:'Assist in defining database design and management standards and documenting new and existing systems and procedures.'}, 
                {text:'Assist in the creation and maintaining databases used to support Acquisition oversight functions. Collaborates with users to ensure that the Database meets their requirements.'},
                {text:'Communicates to all users any updates to file databases.'}, 
                {text:'Assists in the implementation of operating methods to improve processing, distribution, data flow, collection and database editing procedures.'}, 
                {text:'Troubleshoot problems concerning database records and communicate this information to users.'}
            ],
            qualifications: [
                {text:'Seven (7) years of demonstrated experience in Data Management; knowledge of document management processes and software; knowledge of how to create, implement, and maintain data file structures, knowledge of the use of system utilities to troubleshoot faulty database information.'}, 
                {text:'A Bachelor’s Degree in information systems with a concentration in database administration or other business acquisition, contract management, or program management related field is required.'},
                {text:'Clear understanding of the DoD 5000 acquisition process, C4ISR/DoDAF documentation requirements, NSA record keeping and archiving processes, and system engineering is highly desirable.'}
            ]
        },
        {
            id: 24,
            title: 'Financial Analyst',
            category: 'Analyst',
            skillLevel: 0,
            description: 'Assist in the creation of the program and budget; justify the resources (manpower and funding) to support the strategic plans of the President, DoD, Intelligence Community, and the Agency. Assist in the defense and execution of the appropriated, unexpired resources to support the day-to-day mission activities; perform statistical and graphical analysis on various aspects of resources management such as on the rate of execution of funding, fill-rates of authorized positions, workforce skills, size and cost, and success in obtaining appropriations for new program requests. Advise management on the regulatory aspects of resources management to avoid violations such as anti-deficiency and misappropriation of resources.',
            capabilities: [
                {text:'Assist with the compilation and reporting of programs and budgets, preparing financial presentations and other materials to support the NSA and DoD programming and budgeting processes.'}, 
                {text:'Assist with preparation of program and budget information for submission to the Office of the Director, National Intelligence (ODNI), Office of the Secretary of Defense (OSD) and Congress.'}, 
                {text:'Assist in the preparation of capabilities requests, point papers, briefing charts, spreadsheets, memos, and other documents within prescribed timelines for review and analysis.'},
                {text:'Assist with the interpretation of requests for data and facts; acquire, analyze, and prepare presentations of program and budget data for use in program decision-making.'}, 
                {text:'Assist with the analysis of funded requirements combined with the execution history and assist in the analysis and reporting of planned versus actual requirements and funding.'}
            ],
            qualifications: [
                {text:'Two (2) years of DoD or commercial experience in purchasing or finance required. Experience in the preparation of reports that reflect programs/project status in areas of cost, schedule and performance.'}, 
                {text:'Experience in budget planning, budget preparation and budget execution for acquisition programs. FACTS experience is preferred. In lieu of 2 years of experience, an undergraduate degree with a business focus is acceptable.'}
            ]
        },
        {
            id: 25,
            title: 'Financial Analyst',
            category: 'Analyst',
            skillLevel: 1,
            description: 'Assist in the creation of the program and budget; justify the resources (manpower and funding) to support the strategic plans of the President, DoD, Intelligence Community, and the Agency. Assist in the defense and execution of the appropriated, unexpired resources to support the day-to-day mission activities; perform statistical and graphical analysis on various aspects of resources management such as on the rate of execution of funding, fill-rates of authorized positions, workforce skills, size and cost, and success in obtaining appropriations for new program requests. Advise management on the regulatory aspects of resources management to avoid violations such as anti-deficiency and misappropriation of resources.',
            capabilities: [
                {text:'Assist with the compilation and reporting of programs and budgets, preparing financial presentations and other materials to support the NSA and DoD programming and budgeting processes.'}, 
                {text:'Assist with preparation of program and budget information for submission to the Office of the Director, National Intelligence (ODNI), Office of the Secretary of Defense (OSD) and Congress.'}, 
                {text:'Assist in the preparation of capabilities requests, point papers, briefing charts, spreadsheets, memos, and other documents within prescribed timelines for review and analysis.'},
                {text:'Assist with the interpretation of requests for data and facts; acquire, analyze, and prepare presentations of program and budget data for use in program decision-making.'}, 
                {text:'Assist with the analysis of funded requirements combined with the execution history and assist in the analysis and reporting of planned versus actual requirements and funding.'}, 
                {text:'Compile and report on programs and budgets, prepare presentations and other materials to support the NSA and DoD programming and budgeting processes, and basis of estimates.'},
                {text:'Prepare program/project and budget information for Government submission to the Office of the Director, National Intelligence (ODNI), Office of the Secretary of Defense (OSD) and Congress.'}, 
                {text:'Prepare tasking requests, point papers, briefing charts, spreadsheets, memos, and other documents within prescribed timelines for Government review.'}, 
                {text:'Assist in the development and maintenance of funding profiles for programs, projects, or contracts.'},
                {text:'Assist in the creation of budget or financial planning for an organization, organizational unit, program, or expenditure/cost center to identify potential variances.'}, 
                {text:'Assist in monitoring expenses against budgets.'}
            ],
            qualifications: [
                {text:'Five (5) years of DoD or commercial experience in purchasing or finance and a Bachelor’s Degree with a business focus is required.'}, 
                {text:'Experience in the preparation of reports that reflect programs/project status in areas of cost, schedule and performance. '},
                {text:'Experience in budget planning, budget preparation and budget execution for acquisition programs. FACTS experience is preferred. In lieu of a degree, Certified Defense Financial Manager (CDFM), or DAWIA Level II in Business/Financial Management and three (3) years of directly related experience for a total of eight (8) years may be substituted.'}
            ]
        },
        {
            id: 26,
            title: 'Financial Analyst',
            category: 'Analyst',
            skillLevel: 2,
            description: 'Assist in the creation of the program and budget; justify the resources (manpower and funding) to support the strategic plans of the President, DoD, Intelligence Community, and the Agency. Assist in the defense and execution of the appropriated, unexpired resources to support the day-to-day mission activities; perform statistical and graphical analysis on various aspects of resources management such as on the rate of execution of funding, fill-rates of authorized positions, workforce skills, size and cost, and success in obtaining appropriations for new program requests. Advise management on the regulatory aspects of resources management to avoid violations such as anti-deficiency and misappropriation of resources.',
            capabilities: [
                {text:'Assist with the compilation and reporting of programs and budgets, preparing financial presentations and other materials to support the NSA and DoD programming and budgeting processes.'}, 
                {text:'Assist with preparation of program and budget information for submission to the Office of the Director, National Intelligence (ODNI), Office of the Secretary of Defense (OSD) and Congress.'}, 
                {text:'Assist in the preparation of capabilities requests, point papers, briefing charts, spreadsheets, memos, and other documents within prescribed timelines for review and analysis.'},
                {text:'Assist with the interpretation of requests for data and facts; acquire, analyze, and prepare presentations of program and budget data for use in program decision-making.'}, 
                {text:'Assist with the analysis of funded requirements combined with the execution history and assist in the analysis and reporting of planned versus actual requirements and funding'}, 
                {text:'Compile and report on programs and budgets, prepare presentations and other materials to support the NSA and DoD programming and budgeting processes, and basis of estimates.'},
                {text:'Prepare program/project and budget information for Government submission to the Office of the Director, National Intelligence (ODNI), Office of the Secretary of Defense (OSD) and Congress.'}, 
                {text:'Prepare tasking requests, point papers, briefing charts, spreadsheets, memos, and other documents within prescribed timelines for Government review.'}, 
                {text:'Assist in the development and maintenance of funding profiles for programs, projects, or contracts.'},
                {text:'Assist in the creation of budget or financial planning for an organization, organizational unit, program, or expenditure/cost center to identify potential variances.'}, 
                {text:'Assist in monitoring expenses against budgets.'}, 
                {text:'Assist Government with strategic business planning.'},
                {text:'Analyze financial data and transactions for appropriate use.'}
            ],
            qualifications: [
                {text:'Ten (10) years of DoD or commercial experience in purchasing or finance and a Bachelor’s Degree with a business focus is required.'}, 
                {text:'Experience in the preparation of reports that reflect programs/project status in areas of cost, schedule and performance. '},
                {text:'Experience in budget planning, budget preparation and budget execution for acquisition programs. FACTS experience is preferred. In lieu of a degree, Certified Defense Financial Manager (CDFM), or DAWIA Level III in Business/Financial Management, and three (3) years of directly related experience for a total of Thirteen (13) years may be substituted.'}
            ]
        }
    ];
}