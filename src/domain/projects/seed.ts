import type { Project } from "./schema";

/*
 * Portfolio seed, transcribed from the "Projects" and "Experience" sections of the owner's CVs.
 * Case-study fields that the CV does not document are left empty and are simply not rendered;
 * the owner can complete them from the admin dashboard. No images are invented: projects without
 * an uploaded cover use a typographic cover generated from their title and category.
 */

const L = (ro: string, en: string) => ({ ro, en });
const E = L("", "");

type SeedProject = Omit<Project, "cover" | "gallery" | "attachments" | "id">;

const base = {
  status: "published",
  featured: false,
  description: E,
  objective: E,
  problem: E,
  role: E,
  contribution: E,
  process: E,
  results: E,
  liveUrl: "",
  repoUrl: "",
  docsUrl: "",
} as const;

const altium = (
  slug: string,
  sortOrder: number,
  title: [string, string],
  summary: [string, string],
): SeedProject => ({
  ...base,
  slug,
  sortOrder,
  category: "hardware",
  year: 2025,
  title: L(...title),
  summary: L(...summary),
  technologies: ["Altium Designer", "PCB Design"],
});

const seedProjectsData: SeedProject[] = [
  {
    ...base,
    slug: "ble-wireless-keyboard",
    featured: true,
    sortOrder: 10,
    category: "embedded",
    year: 2025,
    title: L("Tastatură wireless BLE – lucrare de diplomă", "BLE wireless keyboard – bachelor's thesis"),
    summary: L(
      "Tastatură wireless cu consum redus de energie, realizată complet: PCB în Altium, firmware ZMK, carcasă 3D în Fusion 360 și alimentare pe baterie proiectată pentru până la un an de autonomie.",
      "A low-power wireless keyboard built end to end: Altium PCB, ZMK firmware, a Fusion 360 3D-modelled enclosure and a battery system designed for up to one year of autonomy.",
    ),
    objective: L(
      "Proiectarea și realizarea unei tastaturi wireless Bluetooth Low Energy, cu autonomie îndelungată, ca lucrare de diplomă la Universitatea „Ștefan cel Mare” din Suceava.",
      "Design and build a Bluetooth Low Energy wireless keyboard with long battery life, as my bachelor's thesis at Ștefan cel Mare University of Suceava.",
    ),
    role: L("Autor – proiectare hardware, firmware și mecanică", "Author – hardware, firmware and mechanical design"),
    contribution: L(
      "Am proiectat arhitectura hardware și PCB-ul în Altium, optimizate pentru conectivitate BLE; am dezvoltat firmware-ul custom pe platforma ZMK; am modelat 3D carcasa în Fusion 360, cu un design ergonomic și estetic; am implementat și optimizat sistemul de alimentare pe baterie.",
      "I designed the hardware architecture and the PCB in Altium, optimised for BLE connectivity; developed the custom firmware on ZMK; modelled an ergonomic, aesthetic enclosure in Fusion 360; and implemented and optimised the battery power system.",
    ),
    process: L(
      "Dezvoltare iterativă, după o metodologie Agile, cu o abordare flexibilă pe parcursul etapelor de design și implementare.",
      "Iterative development following an Agile methodology, keeping the design and implementation phases flexible.",
    ),
    results: L(
      "Sistem de alimentare pe baterie proiectat pentru o autonomie de până la un an.",
      "Battery power system designed for up to one year of autonomy.",
    ),
    technologies: ["Altium Designer", "ZMK", "C", "Bluetooth Low Energy", "Fusion 360", "Power Management", "Git", "EMC", "Agile"],
  },
  {
    ...base,
    slug: "rfid-antenna-13-56-mhz",
    featured: true,
    sortOrder: 20,
    category: "rf",
    year: 2024,
    title: L("Antenă RFID pentru 13,56 MHz", "13.56 MHz RFID antenna"),
    summary: L(
      "Proiectarea, simularea și realizarea unei antene RFID în ANSYS, cu calculul inductanței, analiza impedanței pe diagrama Smith și validare prin teste în condiții reale.",
      "Design, simulation and build of an RFID antenna in ANSYS, including inductance calculation, Smith-chart impedance analysis and real-world validation.",
    ),
    objective: L(
      "Proiectarea, simularea și realizarea unei antene RFID funcționale pentru frecvența de 13,56 MHz.",
      "Design, simulate and build a working RFID antenna for 13.56 MHz.",
    ),
    process: L(
      "Proiectare și simulare în ANSYS, inclusiv calculul inductanței și analiza impedanței prin diagrama Smith. Performanța antenei a fost optimizată prin adăugarea unui strat suplimentar de carton, pentru îmbunătățirea câștigului și a eficienței radiației.",
      "Designed and simulated in ANSYS, including inductance calculation and impedance analysis on the Smith chart. Antenna performance was optimised by adding an extra cardboard layer to improve gain and radiation efficiency.",
    ),
    results: L(
      "Proiect validat prin teste de performanță în condiții reale.",
      "Validated through performance tests in real-world conditions.",
    ),
    technologies: ["Ansys HFSS", "RF Design", "Smith Chart", "Impedance Matching"],
  },
  {
    ...base,
    slug: "gmv-design-website",
    featured: true,
    sortOrder: 30,
    category: "web",
    year: 2024,
    title: L("Reconstruirea site-ului gmv.design", "gmv.design website rebuild"),
    summary: L(
      "Reconstruirea integrală a site-ului gmv.design în cadrul internship-ului la GMV Design, cu un stack modern, optimizare de performanță și SEO on-page.",
      "Complete rebuild of the gmv.design website during my internship at GMV Design, on a modern stack with performance optimisation and on-page SEO.",
    ),
    objective: L(
      "Un site modern, rapid și ușor de utilizat, care să ofere o experiență superioară vizitatorilor.",
      "A modern, fast and easy-to-use website delivering a better experience for visitors.",
    ),
    role: L("Intern – dezvoltare web", "Web development intern"),
    contribution: L(
      "Am implementat arhitectura front-end, am gestionat partea de backend și managementul API-urilor și am aplicat tehnici de optimizare a performanței și SEO on-page.",
      "I implemented the front-end architecture, handled the back end and API management, and applied performance optimisation and on-page SEO techniques.",
    ),
    technologies: ["Next.js", "React", "Tailwind CSS", "Node.js", "MySQL", "Figma", "Cypress", "Git"],
    liveUrl: "https://gmv.design/",
  },
  altium(
    "car-instrument-cluster",
    40,
    ["Ceasuri de bord pentru mașină", "Car instrument cluster"],
    [
      "Proiect de design și dezvoltare a circuitelor electronice pentru ceasurile de bord ale unei mașini, cu integrarea senzorilor de viteză și temperatură pentru monitorizarea funcționării vehiculului.",
      "Design and development of the electronic circuits for a car instrument cluster, integrating speed and temperature sensors to monitor vehicle operation.",
    ],
  ),
  altium(
    "temperature-control-system",
    50,
    ["Sistem de control al temperaturii", "Temperature control system"],
    [
      "Sistem electronic de monitorizare și reglare a temperaturii, cu senzori de temperatură și control al încălzirii, pentru aplicații industriale.",
      "An electronic system that monitors and regulates temperature using temperature sensors and heating control, for industrial applications.",
    ],
  ),
  altium(
    "e-bike-control-module",
    60,
    ["Modul de control pentru bicicletă electrică", "E-bike control module"],
    [
      "Modul electronic de control pentru biciclete electrice, cu gestionarea bateriilor și controlul vitezometrului, pentru performanță și eficiență energetică mai bune.",
      "An electronic control module for e-bikes, handling battery management and the speedometer, to improve performance and energy efficiency.",
    ],
  ),
  altium(
    "wireless-charger",
    70,
    ["Încărcător wireless", "Wireless charger"],
    [
      "Proiectarea și implementarea unui încărcător wireless inductiv pentru dispozitive mobile, ca soluție rapidă și eficientă de încărcare.",
      "Design and implementation of an inductive wireless charger for mobile devices, as a fast and efficient charging solution.",
    ],
  ),
  altium(
    "thermal-monitoring-system",
    80,
    ["Sistem de monitorizare termică", "Thermal monitoring system"],
    [
      "Sistem avansat de monitorizare termică pentru detectarea anomaliilor de temperatură ale echipamentelor electronice sau ale mediilor industriale.",
      "An advanced thermal monitoring system that detects temperature anomalies in electronic equipment or industrial environments.",
    ],
  ),
  altium(
    "fitness-band",
    90,
    ["Brățară fitness", "Fitness band"],
    [
      "Dispozitiv portabil pentru monitorizarea activității fizice și a stării de sănătate: ritm cardiac, pași și somn.",
      "A wearable device that tracks physical activity and health: heart rate, steps and sleep.",
    ],
  ),
  altium(
    "permafrost-monitoring-satellite",
    100,
    ["Satelit pentru monitorizarea permafrostului", "Permafrost monitoring satellite"],
    [
      "Sistem de monitorizare a solului înghețat permanent, cu senzori și tehnologii de satelit, pentru analiza schimbărilor din structura solului în regiunile polare.",
      "A permafrost monitoring system using sensors and satellite technologies to analyse changes in frozen-ground structure in polar regions.",
    ],
  ),
  altium(
    "ar-glasses",
    110,
    ["Ochelari de realitate augmentată (AR)", "Augmented reality (AR) glasses"],
    [
      "Sistem de ochelari AR pentru aplicații interactive, cu procesare de imagine și interfețe utilizator pentru realitate augmentată, în scopuri educative și comerciale.",
      "AR glasses for interactive applications, integrating image processing and user interfaces for augmented reality in education and commerce.",
    ],
  ),
  {
    ...base,
    slug: "arduino-conveyor-counter",
    sortOrder: 120,
    category: "embedded",
    year: 2023,
    title: L("Numărarea obiectelor pe o bandă transportoare", "Conveyor-belt object counter"),
    summary: L(
      "Sistem bazat pe Arduino care numără obiectele de pe o bandă transportoare cu un senzor infraroșu și afișează rezultatul pe un display OLED.",
      "An Arduino-based system that counts objects on a conveyor belt with an infrared sensor and shows the count on an OLED display.",
    ),
    process: L(
      "Sistemul folosește un Arduino, un display OLED, un buzzer și un senzor infraroșu: la fiecare trecere prin fața senzorului, un obiect este numărat și afișat pe display.",
      "The system uses an Arduino, an OLED display, a buzzer and an infrared sensor: each pass in front of the sensor counts one object and shows the total on the display.",
    ),
    technologies: ["Arduino", "C/C++", "IR Sensor", "OLED Display"],
  },
];

export const seedProjects: Project[] = seedProjectsData.map((project) => ({
  ...project,
  id: `seed-${project.slug}`,
  cover: null,
  gallery: [],
  attachments: [],
}));
