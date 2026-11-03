import type { CvContent } from "./schema";

/*
 * Seed content, transcribed from the owner's own CV documents
 * (FlowCV resume 2026-10-05, Europass long and Europass short).
 *
 * Nothing here is invented. Where the source documents disagreed, the dated Europass (long)
 * version was used and the discrepancy is listed in docs/CONTENT-REVIEW.md for confirmation.
 *
 * This object is (a) the initial content inserted by supabase/seed.sql and (b) the read-only
 * fallback the public site renders when the database is not configured.
 */

const L = (ro: string, en: string) => ({ ro, en });

export const seedContent: CvContent = {
  profile: {
    fullName: "Ștefan-Emanuel Ciupitu",
    headline: L(
      "Inginer electronist · Masterand în Securitate Cibernetică",
      "Electronics Engineer · MSc Student in Cybersecurity",
    ),
    summary: L(
      "Inginer electronist și masterand în Securitate Cibernetică, cu experiență în proiectare PCB, sisteme embedded, rețelistică și dezvoltare web. Certificat în 22 de cursuri de securitate cibernetică, inclusiv 16 cursuri Fortinet.",
      "Electronics engineer and MSc student in Cybersecurity, with hands-on experience in PCB design, embedded systems, networking and web development. Certified in 22 cybersecurity courses, including 16 Fortinet courses.",
    ),
    about: L(
      "Sunt o persoană pasionată de tehnologie, electronică și securitate cibernetică, mereu interesată să învăț lucruri noi și să îmi dezvolt competențele tehnice. Sunt inginer electronist și student la master în Securitate Cibernetică, cu experiență în proiectare hardware, dezvoltare software, rețelistică și sisteme embedded. Sunt o persoană curioasă, perseverentă, atentă la detalii și orientată spre găsirea soluțiilor, iar proiectele practice reprezintă pentru mine o modalitate importantă de a transforma cunoștințele teoretice în experiență reală.",
      "I am passionate about technology, electronics and cybersecurity, and always keen to learn and to keep growing my technical skills. I am an electronics engineer and an MSc student in Cybersecurity, with experience in hardware design, software development, networking and embedded systems. I am curious, persistent, detail-oriented and solution-focused, and I see hands-on projects as the best way to turn theoretical knowledge into real experience.",
    ),
    valueProposition: L(
      "Combin proiectarea hardware cu securitatea cibernetică: de la PCB-uri și optimizare SI/PI pentru interfețe de mare viteză, până la configurarea rețelelor și administrarea soluțiilor Fortinet. Lucrez practic, cu accent pe testare, validare și calitate.",
      "I bring hardware design and cybersecurity together: from PCBs and SI/PI optimisation for high-speed interfaces to network configuration and Fortinet administration. I work hands-on, with a strong focus on testing, validation and quality.",
    ),
    location: L("Suceava, România", "Suceava, Romania"),
    photoAlt: L(
      "Portret profesional al lui Ștefan-Emanuel Ciupitu, în costum închis la culoare",
      "Professional portrait of Ștefan-Emanuel Ciupitu wearing a dark suit",
    ),
    focusAreas: [
      L("Proiectare PCB & interfețe de mare viteză", "PCB design & high-speed interfaces"),
      L("EMI/EMC & SI/PI", "EMI/EMC & SI/PI"),
      L("Securitate cibernetică & Fortinet", "Cybersecurity & Fortinet"),
      L("Firmware embedded & BLE", "Embedded firmware & BLE"),
      L("Rețelistică & fibră optică", "Networking & fibre optics"),
      L("Dezvoltare web (Next.js, React)", "Web development (Next.js, React)"),
    ],
  },

  contact: {
    email: "ciupitustefan12@gmail.com",
    phone: "+40 773 735 023",
    showPhone: false,
    showPhoneInPdf: false,
    linkedin: "https://www.linkedin.com/in/ciupitu-stefan-emanuel/",
    github: "https://github.com/CiupituStefan",
    youtube: "https://www.youtube.com/@ciupitustefan",
    otherLinks: [],
  },

  experience: [
    {
      id: "aumovio-usv-research",
      kind: "research",
      organization: "AUMOVIO × USV",
      organizationUrl: "",
      role: L("Asistent de cercetare – masterand", "Research Assistant (MSc student)"),
      location: L("Suceava, România", "Suceava, Romania"),
      start: "2026-01",
      end: "2026-06",
      summary: L(
        "Asigurarea implementării activităților de cercetare din cadrul unui proiect comun AUMOVIO și Universitatea „Ștefan cel Mare” din Suceava.",
        "Delivered research activities within a joint project between AUMOVIO and Ștefan cel Mare University of Suceava.",
      ),
      responsibilities: [
        L(
          "A1 – Ipoteze și modele conceptuale EMI/EMC pentru calificarea sistemelor integrate cu senzori și actuatoare în diverse configurații hardware.",
          "A1 – EMI/EMC hypotheses and conceptual models for qualifying integrated sensor and actuator systems across different hardware configurations.",
        ),
        L(
          "A2 – Modele conceptuale și proceduri de optimizare SI/PI în proiectarea PCB și a interposerelor pentru interfețe de comunicații și circuite de mare viteză.",
          "A2 – Conceptual models and SI/PI optimisation procedures for PCB and interposer design for communication interfaces and high-speed circuits.",
        ),
        L(
          "A3 – Formularea și verificarea ipotezelor, a modelelor conceptuale și a teoriilor privind comunicațiile prin interfețe de mare viteză.",
          "A3 – Formulating and verifying hypotheses, conceptual models and theories on communication over high-speed interfaces.",
        ),
      ],
      achievements: [
        L(
          "Coordonarea resursei umane implicate în activitatea de verificare a modelelor pentru comunicații de mare viteză.",
          "Coordinated the team working on the verification of models for high-speed communications.",
        ),
      ],
      skills: [
        "EMI/EMC",
        "SI/PI",
        "PCB Design",
        "PCB Optimization",
        "High-Speed Interfaces",
        "Interposer Design",
        "Hardware Design",
        "System Qualification",
        "Conceptual Modeling",
        "Research",
        "Data Analysis",
        "Hypothesis Testing",
        "Team Coordination",
        "Project Management",
      ],
    },
    {
      id: "usv-fortinet-practicum",
      kind: "internship",
      organization: "Universitatea „Ștefan cel Mare” din Suceava",
      organizationUrl: "",
      role: L(
        "Student practicant – Administrare soluții Fortinet",
        "Student Intern – Fortinet Solutions Administration",
      ),
      location: L("Suceava, România", "Suceava, Romania"),
      start: "2026-02",
      end: "2026-05",
      summary: L(
        "Cursuri teoretice și practice de securitate cibernetică și administrare a soluțiilor Fortinet, în cadrul programului universitar de practică.",
        "Theoretical and hands-on courses in cybersecurity and Fortinet solutions administration, as part of the university practicum programme.",
      ),
      responsibilities: [
        L(
          "Dezvoltarea competențelor de administrare FortiGate, FortiManager, FortiAnalyzer, FortiMail, FortiNAC, FortiSIEM, FortiSwitch și FortiWeb.",
          "Built administration skills across FortiGate, FortiManager, FortiAnalyzer, FortiMail, FortiNAC, FortiSIEM, FortiSwitch and FortiWeb.",
        ),
      ],
      achievements: [
        L(
          "Finalizarea a 16 cursuri de specialitate Fortinet, cu obținerea certificatelor aferente.",
          "Completed 16 specialised Fortinet courses and earned the corresponding certificates.",
        ),
      ],
      skills: [
        "FortiGate",
        "FortiManager",
        "FortiAnalyzer",
        "FortiMail",
        "FortiNAC",
        "FortiSIEM",
        "FortiSwitch",
        "FortiWeb",
        "FortiOS",
        "Network Security",
      ],
    },
    {
      id: "usv-cyber-practicum",
      kind: "internship",
      organization: "Universitatea „Ștefan cel Mare” din Suceava",
      organizationUrl: "",
      role: L("Student practicant – Securitate cibernetică", "Student Intern – Cybersecurity"),
      location: L("Suceava, România", "Suceava, Romania"),
      start: "2025-10",
      end: "2026-02",
      summary: L(
        "Cursuri teoretice și practice în domeniul securității cibernetice, puse la dispoziție în cadrul programului universitar.",
        "Theoretical and hands-on cybersecurity courses provided through the university programme.",
      ),
      responsibilities: [
        L(
          "Dezvoltarea competențelor în Cyber Threat Management, Endpoint Security, Network Defense și Ethical Hacking.",
          "Developed skills in Cyber Threat Management, Endpoint Security, Network Defense and Ethical Hacking.",
        ),
      ],
      achievements: [
        L(
          "Finalizarea a 6 cursuri, însumând 176 de ore, cu obținerea certificatelor aferente.",
          "Completed 6 courses totalling 176 hours and earned the corresponding certificates.",
        ),
      ],
      skills: ["Cyber Threat Management", "Endpoint Security", "Network Defense", "Ethical Hacking"],
    },
    {
      id: "daily-caffe",
      kind: "work",
      organization: "Daily Caffe",
      organizationUrl: "https://www.dailycaffe.ro/",
      role: L("Inginer electronist", "Electronics Engineer"),
      location: L("Suceava, România", "Suceava, Romania"),
      start: "2025-07",
      end: "2025-10",
      summary: L(
        "Supervizarea procesului end-to-end de recondiționare și implementare a automatelor de cafea, de la diagnoza hardware inițială până la validarea finală pentru livrare.",
        "Oversaw the end-to-end refurbishment and deployment of coffee vending machines, from initial hardware diagnostics to final validation before delivery.",
      ),
      responsibilities: [
        L(
          "Integrare hardware și mentenanță avansată: diagnoză și reparații la nivel de componentă pentru subansamble critice (cititoare de bancnote, pompe, boilere).",
          "Hardware integration and advanced maintenance: component-level diagnostics and repair of critical sub-assemblies (banknote readers, pumps, boilers).",
        ),
        L(
          "Integrarea completă a soluțiilor de plată (jetoniere, POS), inclusiv realizarea de cabluri custom.",
          "End-to-end integration of payment systems (coin mechanisms, POS terminals), including building custom cables.",
        ),
        L(
          "Deployment și configurare software: instalarea sistemelor de operare și flash-uirea firmware-ului, cu scripturi de configurare pe USB pentru setarea eficientă a parametrilor operaționali (ex.: prețuri).",
          "Software deployment and configuration: operating-system installation and firmware flashing, with USB configuration scripts for efficient set-up of operating parameters (e.g. prices).",
        ),
      ],
      achievements: [
        L(
          "Asigurarea calității: teste de validare finală care certifică funcționalitatea completă a echipamentelor — sisteme mecanice, termice și de plată.",
          "Quality assurance: ran final validation tests certifying full equipment functionality — mechanical, thermal and payment systems.",
        ),
      ],
      skills: [
        "Hardware Diagnostics",
        "Component-level Repair",
        "Hardware Integration",
        "Custom Cabling",
        "Software Deployment",
        "Firmware Flashing",
        "Scripting",
        "Payment Systems / POS",
        "Quality Assurance",
        "System Testing",
      ],
    },
    {
      id: "usv-bachelor-thesis",
      kind: "project",
      organization: "Universitatea „Ștefan cel Mare” din Suceava",
      organizationUrl: "",
      role: L(
        "Lucrare de diplomă – Tastatură wireless BLE",
        "Bachelor's thesis – BLE wireless keyboard",
      ),
      location: L("Suceava, România", "Suceava, Romania"),
      start: "2025-06",
      end: "2025-07",
      summary: L(
        "Proiectarea și realizarea completă a unei tastaturi wireless cu consum redus de energie: hardware, firmware, carcasă și alimentare.",
        "End-to-end design and build of a low-power wireless keyboard: hardware, firmware, enclosure and power supply.",
      ),
      responsibilities: [
        L(
          "Management de proiect: dezvoltare cu metodologie Agile, iterativă și flexibilă, pe tot parcursul designului și implementării.",
          "Project management: iterative, flexible Agile approach throughout design and implementation.",
        ),
        L(
          "Dezvoltare firmware: firmware custom pe platforma ZMK, specializată pentru dispozitive wireless Bluetooth Low Energy (BLE).",
          "Firmware development: custom firmware built on ZMK, a platform specialised for Bluetooth Low Energy (BLE) wireless devices.",
        ),
        L(
          "Proiectare hardware: arhitectura hardware și circuitul imprimat (PCB) în Altium, optimizate pentru conectivitate BLE.",
          "Hardware design: hardware architecture and printed circuit board (PCB) in Altium, optimised for BLE connectivity.",
        ),
        L(
          "Design mecanic: carcasă modelată 3D în Fusion 360, cu design ergonomic și estetic.",
          "Mechanical design: ergonomic, aesthetic enclosure modelled in 3D in Fusion 360.",
        ),
      ],
      achievements: [
        L(
          "Sistem de alimentare pe baterie implementat și optimizat, proiectat pentru o autonomie de până la un an.",
          "Implemented and optimised a battery power system designed for up to one year of autonomy.",
        ),
      ],
      skills: ["Altium", "Fusion 360", "Bluetooth Low Energy", "ZMK", "C", "Agile", "3D Modeling", "Power Management", "Git", "EMC"],
    },
    {
      id: "netcom-activ",
      kind: "internship",
      organization: "NETCOM ACTIV",
      organizationUrl: "https://netcom-activ.ro/",
      role: L("Intern – rețele și fibră optică", "Intern – Networks & Fibre Optics"),
      location: L("Suceava, România", "Suceava, Romania"),
      start: "2025-03",
      end: "2025-05",
      summary: L("", ""),
      responsibilities: [
        L(
          "Implementare și mentenanță infrastructuri de fibră optică: joncțiuni prin sudură de înaltă precizie (fusion splicing), cu atenuare minimă a semnalului.",
          "Fibre-optic infrastructure deployment and maintenance: high-precision fusion splicing with minimal signal attenuation.",
        ),
        L(
          "Configurare echipamente de rețea (CPE): punerea în funcțiune la client, cu configurarea avansată a routerelor și switch-urilor pentru conexiuni de date sigure, conform parametrilor tehnici ai proiectului.",
          "Network equipment (CPE) configuration: on-site commissioning, including advanced router and switch configuration to establish and secure data connections according to project specifications.",
        ),
        L(
          "Cablare structurată UTP/FTP: pozarea cablurilor și sertizarea conectorilor RJ45 conform standardelor, pentru rețele locale (LAN) fiabile.",
          "Structured UTP/FTP cabling: cable routing and RJ45 termination to standard, building reliable local area networks (LAN).",
        ),
      ],
      achievements: [
        L(
          "Validarea fiecărei etape a instalării, de la conectivitatea fizică la configurarea logică a rețelei.",
          "Validated every installation stage, from physical connectivity to logical network configuration.",
        ),
      ],
      skills: ["Fusion Splicing", "Fiber Optics", "Router Configuration", "Switch Configuration", "CPE", "Structured Cabling", "UTP/FTP", "RJ45", "LAN"],
    },
    {
      id: "sunday-river",
      kind: "exchange",
      organization: "Sunday River",
      organizationUrl: "https://www.sundayriver.com/",
      role: L("Participant Work and Travel USA", "Work and Travel USA participant"),
      location: L("Newry, Maine, SUA", "Newry, Maine, USA"),
      start: "2024-06",
      end: "2024-09",
      summary: L(
        "Program de schimb cultural și profesional, într-un mediu hotelier internațional și dinamic.",
        "Cultural and professional exchange programme in a dynamic, international hospitality environment.",
      ),
      responsibilities: [
        L(
          "Comunicare zilnică în limba engleză cu o clientelă și o echipă diverse din punct de vedere cultural.",
          "Daily communication in English with culturally diverse guests and colleagues.",
        ),
      ],
      achievements: [
        L(
          "Dezvoltarea competențelor de comunicare în limba engleză (nivel B2), multitasking, management al timpului și atenție la detalii.",
          "Strengthened English communication (B2), multitasking, time management and attention to detail.",
        ),
      ],
      skills: ["English Communication", "Cross-cultural Communication", "Multitasking", "Time Management", "Adaptability"],
    },
    {
      id: "gmv-design",
      kind: "internship",
      organization: "GMV Design",
      organizationUrl: "https://gmv.design/",
      role: L("Intern – dezvoltare web", "Web Development Intern"),
      location: L("Suceava, România", "Suceava, Romania"),
      start: "2024-03",
      end: "2024-05",
      summary: L(
        "Reconstruirea integrală a site-ului gmv.design cu un stack tehnologic modern, pentru performanță și o experiență de utilizare superioară.",
        "Rebuilt the gmv.design website from the ground up on a modern stack, for better performance and user experience.",
      ),
      responsibilities: [
        L("Implementarea arhitecturii front-end.", "Implemented the front-end architecture."),
        L(
          "Gestionarea părții de backend și a managementului API-urilor.",
          "Handled the back end and API management.",
        ),
      ],
      achievements: [
        L(
          "Aplicarea tehnicilor de optimizare a performanței și SEO on-page pentru o experiență rapidă și eficientă.",
          "Applied performance optimisation and on-page SEO techniques for a fast, efficient experience.",
        ),
      ],
      skills: ["Next.js", "React", "Tailwind CSS", "HTML/CSS", "Node.js", "MySQL", "Git", "Figma", "Cypress"],
    },
    {
      id: "aerostar",
      kind: "internship",
      organization: "Aerostar S.A.",
      organizationUrl: "https://www.aerostar.ro/",
      role: L("Intern – inginerie electronică", "Electronics Engineering Intern"),
      location: L("Bacău, România", "Bacău, Romania"),
      start: "2023-08",
      end: "2023-09",
      summary: L("", ""),
      responsibilities: [
        L(
          "Participare activă la procesele de testare și certificare pentru sisteme de radar secundar destinate produselor militare, conform standardelor de calitate din industria de apărare.",
          "Took an active part in testing and certification of secondary radar systems for military products, in line with defence-industry quality standards.",
        ),
        L(
          "Proiectarea de circuite imprimate (PCB) pentru aplicații specializate, în OrCAD.",
          "Designed printed circuit boards (PCBs) for specialised applications in OrCAD.",
        ),
        L(
          "Contribuție la procesul de fabricație a cablajelor de uz militar, în contextul industriei aerospațiale și de apărare.",
          "Contributed to manufacturing military-grade cable harnesses within the aerospace and defence industry.",
        ),
      ],
      achievements: [],
      skills: ["OrCAD", "PCB Design", "Radar Systems", "EMC", "Military Standards", "Cable Manufacturing", "System Testing", "Certification"],
    },
  ],

  education: [
    {
      id: "usv-master",
      institution: L(
        "Universitatea „Ștefan cel Mare” din Suceava",
        "Ștefan cel Mare University of Suceava",
      ),
      institutionUrl: "https://fiesc.usv.ro/",
      degree: L("Master", "Master's degree (MSc)"),
      field: L(
        "Inginerie electronică, telecomunicații și tehnologii informaționale",
        "Electronic Engineering, Telecommunications and Information Technologies",
      ),
      specialization: L("Securitate Cibernetică", "Cybersecurity"),
      location: L("Suceava, România", "Suceava, Romania"),
      start: "2025-09",
      end: "",
      ongoing: true,
      details: L("", ""),
    },
    {
      id: "usv-bachelor",
      institution: L(
        "Universitatea „Ștefan cel Mare” din Suceava",
        "Ștefan cel Mare University of Suceava",
      ),
      institutionUrl: "https://fiesc.usv.ro/",
      degree: L("Inginer licențiat", "Bachelor of Engineering (BEng)"),
      field: L(
        "Inginerie electronică, telecomunicații și tehnologii informaționale",
        "Electronic Engineering, Telecommunications and Information Technologies",
      ),
      specialization: L("Rețele și software de telecomunicații", "Telecommunications Networks and Software"),
      location: L("Suceava, România", "Suceava, Romania"),
      start: "2021-09",
      end: "2025-07",
      ongoing: false,
      details: L("", ""),
    },
    {
      id: "procopiu-highschool",
      institution: L("Liceul „Ștefan Procopiu” Vaslui", "“Ștefan Procopiu” High School, Vaslui"),
      institutionUrl: "",
      degree: L("Studii liceale", "High school education"),
      field: L("Profil Matematică-Informatică", "Mathematics & Computer Science track"),
      specialization: L("", ""),
      location: L("Vaslui, România", "Vaslui, Romania"),
      start: "",
      end: "",
      ongoing: false,
      details: L("", ""),
    },
  ],

  skills: [
    {
      id: "hardware",
      name: L("Hardware & PCB", "Hardware & PCB"),
      skills: [
        { name: L("Altium Designer", "Altium Designer"), level: "advanced", detail: L("", "") },
        {
          name: L("Design PCB, interposere & interfețe de mare viteză", "PCB, interposer & high-speed interface design"),
          level: "proficient",
          detail: L("", ""),
        },
        {
          name: L("Optimizare EMI/EMC & SI/PI", "EMI/EMC & SI/PI optimisation"),
          level: "proficient",
          detail: L("", ""),
        },
        { name: L("Fusion 360", "Fusion 360"), level: "proficient", detail: L("Modelare 3D", "3D modelling") },
        { name: L("OrCAD", "OrCAD"), level: "", detail: L("", "") },
        { name: L("Ansys (HFSS)", "Ansys (HFSS)"), level: "foundational", detail: L("", "") },
      ],
    },
    {
      id: "embedded",
      name: L("Embedded & wireless", "Embedded & wireless"),
      skills: [
        {
          name: L("Dezvoltare firmware", "Firmware development"),
          level: "proficient",
          detail: L("ZMK, C/C++", "ZMK, C/C++"),
        },
        {
          name: L("Bluetooth Low Energy (BLE) & wireless", "Bluetooth Low Energy (BLE) & wireless"),
          level: "proficient",
          detail: L("", ""),
        },
        { name: L("Sisteme embedded", "Embedded systems"), level: "foundational", detail: L("", "") },
        { name: L("C/C++", "C/C++"), level: "foundational", detail: L("", "") },
      ],
    },
    {
      id: "security-networking",
      name: L("Securitate cibernetică & rețelistică", "Cybersecurity & networking"),
      skills: [
        {
          name: L("Administrare Fortinet", "Fortinet administration"),
          level: "proficient",
          detail: L(
            "FortiGate, FortiManager, FortiAnalyzer, FortiSwitch, FortiOS, FortiWeb",
            "FortiGate, FortiManager, FortiAnalyzer, FortiSwitch, FortiOS, FortiWeb",
          ),
        },
        {
          name: L("Endpoint Security & Network Defense", "Endpoint Security & Network Defense"),
          level: "proficient",
          detail: L("", ""),
        },
        {
          name: L("Ethical Hacking & Threat Management", "Ethical Hacking & Threat Management"),
          level: "foundational",
          detail: L("", ""),
        },
        {
          name: L("Rețele: routere, switch-uri, CPE, cablare structurată", "Networking: routers, switches, CPE, structured cabling"),
          level: "",
          detail: L("", ""),
        },
        { name: L("Fibră optică – fusion splicing", "Fibre optics – fusion splicing"), level: "", detail: L("", "") },
      ],
    },
    {
      id: "software",
      name: L("Software & web", "Software & web"),
      skills: [
        {
          name: L("Scripting, configurare & deployment", "Scripting, configuration & deployment"),
          level: "proficient",
          detail: L("", ""),
        },
        { name: L("Git", "Git"), level: "proficient", detail: L("", "") },
        {
          name: L("Front-end", "Front-end"),
          level: "foundational",
          detail: L("Next.js, React, Tailwind CSS, HTML/CSS", "Next.js, React, Tailwind CSS, HTML/CSS"),
        },
        { name: L("Back-end", "Back-end"), level: "foundational", detail: L("Node.js", "Node.js") },
        { name: L("Baze de date", "Databases"), level: "foundational", detail: L("MySQL", "MySQL") },
        { name: L("Figma", "Figma"), level: "foundational", detail: L("", "") },
        { name: L("Office 365", "Office 365"), level: "advanced", detail: L("", "") },
      ],
    },
    {
      id: "quality-leadership",
      name: L("Calitate & coordonare", "Quality & coordination"),
      skills: [
        {
          name: L("Asigurarea calității (QA) & testare echipamente", "Quality assurance (QA) & equipment testing"),
          level: "proficient",
          detail: L("", ""),
        },
        {
          name: L("Coordonarea resursei umane & leadership", "Team coordination & leadership"),
          level: "proficient",
          detail: L("", ""),
        },
      ],
    },
  ],

  personalSkills: [
    L("Comunicare", "Communication"),
    L("Leadership", "Leadership"),
    L("Organizare", "Organisation"),
    L("Comunicare interculturală", "Cross-cultural communication"),
    L("Multitasking", "Multitasking"),
    L("Managementul timpului", "Time management"),
    L("Atenție la detalii", "Attention to detail"),
    L("Adaptabilitate", "Adaptability"),
    L("Curiozitate", "Curiosity"),
    L("Perseverență", "Persistence"),
    L("Orientare spre soluții", "Solution-oriented mindset"),
  ],

  languages: [
    {
      id: "ro",
      name: L("Română", "Romanian"),
      native: true,
      listening: "",
      reading: "",
      spokenInteraction: "",
      spokenProduction: "",
      writing: "",
    },
    {
      id: "en",
      name: L("Engleză", "English"),
      native: false,
      listening: "B2",
      reading: "B2",
      spokenInteraction: "B2",
      spokenProduction: "B2",
      writing: "B2",
    },
    {
      id: "fr",
      name: L("Franceză", "French"),
      native: false,
      listening: "A2",
      reading: "A2",
      spokenInteraction: "A2",
      spokenProduction: "A2",
      writing: "A2",
    },
  ],

  certifications: [
    ...(
      [
        "Technical Introduction to Cybersecurity",
        "Getting Started in Cybersecurity",
        "Introduction to the Threat Landscape",
        "Enterprise Firewall 7.6 Administrator",
        "FortiAnalyzer 7.6 Analyst",
        "FortiAnalyzer 7.4 Administrator",
        "FortiClient EMS 7.4 Administrator",
        "FortiGate 7.4 Administrator",
        "FortiGate 7.6 Operator",
        "FortiMail 7.4 Administrator",
        "FortiManager 7.6 Administrator",
        "FortiNAC-F 7.6 Administrator",
        "FortiOS 7.6 Administrator",
        "FortiSIEM 7.4 Analyst",
        "FortiSwitch 7.6 Administrator",
        "FortiWeb 7.4 Administrator",
      ] as const
    ).map((name) => ({
      id: `fortinet-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      name: L(name, name),
      issuer: "Fortinet",
      group: L("Fortinet", "Fortinet"),
      date: "",
      url: "",
    })),
    ...(["Cyber Threat Management", "Endpoint Security", "Network Defense", "Ethical Hacking"] as const).map(
      (name) => ({
        id: `cyber-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: L(name, name),
        issuer: "",
        group: L("Securitate cibernetică", "Cybersecurity"),
        date: "",
        url: "",
      }),
    ),
    {
      id: "ecdl",
      name: L("ECDL", "ECDL"),
      issuer: "",
      group: L("Competențe digitale", "Digital skills"),
      date: "",
      url: "",
    },
    {
      id: "digital-competence",
      name: L("Certificat Digital de Competență", "Digital Competence Certificate"),
      issuer: "",
      group: L("Competențe digitale", "Digital skills"),
      date: "",
      url: "",
    },
    {
      id: "professional-competence",
      name: L("Certificat de Competență Profesională", "Professional Competence Certificate"),
      issuer: "",
      group: L("Competențe profesionale", "Professional skills"),
      date: "",
      url: "",
    },
  ],

  courses: [
    {
      id: "dppd-2",
      name: L(
        "Program de formare psihopedagogică (DPPD) – Nivelul II",
        "Teacher Training Programme (DPPD) – Level II",
      ),
      provider: L("Universitatea „Ștefan cel Mare” din Suceava", "Ștefan cel Mare University of Suceava"),
      start: "2025-09",
      end: "",
      ongoing: true,
      description: L("", ""),
    },
    {
      id: "dppd-1",
      name: L(
        "Program de formare psihopedagogică (DPPD) – Nivelul I",
        "Teacher Training Programme (DPPD) – Level I",
      ),
      provider: L("Universitatea „Ștefan cel Mare” din Suceava", "Ștefan cel Mare University of Suceava"),
      start: "2021-09",
      end: "2024-07",
      ongoing: false,
      description: L(
        "Pedagogie, psihologia educației, didactica specialității, managementul clasei, evaluarea procesului educațional și proiectarea activităților didactice.",
        "Pedagogy, educational psychology, subject didactics, classroom management, assessment of the educational process and instructional design.",
      ),
    },
  ],

  volunteering: [
    {
      id: "fiesc-volunteer",
      organization: "FIESC – USV",
      organizationUrl: "https://fiesc.usv.ro/",
      role: L("Voluntar", "Volunteer"),
      location: L("Suceava, România", "Suceava, Romania"),
      start: "2022-09",
      end: "2025-07",
      description: L(
        "Implicare în organizarea târgurilor de cariere, a competițiilor de programare, a sesiunilor de teambuilding și a campionatelor de e-sports, dezvoltându-mi abilitățile de comunicare, leadership și organizare.",
        "Helped organise career fairs, programming contests, team-building sessions and e-sports championships, developing my communication, leadership and organisational skills.",
      ),
    },
  ],

  awards: [],

  otherInfo: [
    {
      id: "references",
      title: L("Referințe", "References"),
      description: L(
        "Referințe de la cadre didactice ale Universității „Ștefan cel Mare” din Suceava, disponibile la cerere.",
        "References from academic staff at Ștefan cel Mare University of Suceava are available on request.",
      ),
    },
  ],

  seo: {
    title: L(
      "Ștefan-Emanuel Ciupitu — Inginer electronist & securitate cibernetică",
      "Ștefan-Emanuel Ciupitu — Electronics Engineer & Cybersecurity",
    ),
    description: L(
      "CV online și portofoliu: proiectare PCB, EMI/EMC și SI/PI, sisteme embedded, rețelistică și securitate cibernetică (Fortinet).",
      "Online CV and portfolio: PCB design, EMI/EMC and SI/PI, embedded systems, networking and cybersecurity (Fortinet).",
    ),
  },
};
