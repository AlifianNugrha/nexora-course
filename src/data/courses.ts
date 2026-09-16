import frontend from "@/assets/course-frontend.jpg";
import backend from "@/assets/course-backend.jpg";
import mobile from "@/assets/course-mobile.jpg";
import uiux from "@/assets/course-uiux.jpg";
import devops from "@/assets/course-devops.jpg";

export type CourseCategory = "Front End" | "Back End" | "Mobile Dev" | "UI/UX" | "DevOps";

export type Course = {
  id: string;
  title: string;
  category: CourseCategory;
  level: "Pemula" | "Menengah" | "Lanjutan";
  duration: string;
  lessons: number;
  thumbnail: string;
  description: string;
  longDescription: string;
  instructor: string;
  syllabus: string[];
  isGated: boolean;
  materialLink: string;
  featured?: boolean;
};

export type Schedule = {
  id: string;
  courseId: string;
  date: string;
  time: string;
  topic: string;
  mentor: string;
};

export type Category = {
  slug: string;
  name: CourseCategory;
  tagline: string;
  description: string;
  thumbnail: string;
};

export const categories: Category[] = [
  {
    slug: "front-end",
    name: "Front End",
    tagline: "Bangun antarmuka web yang interaktif & responsif",
    description:
      "Pelajari HTML, CSS, JavaScript, dan framework modern seperti React untuk menciptakan pengalaman pengguna yang menawan.",
    thumbnail: frontend,
  },
  {
    slug: "back-end",
    name: "Back End",
    tagline: "Bangun server, API, dan logika di balik layar",
    description:
      "Kuasai server-side development: REST API, database, autentikasi, hingga arsitektur backend production-ready.",
    thumbnail: backend,
  },
  {
    slug: "mobile-dev",
    name: "Mobile Dev",
    tagline: "Bangun aplikasi mobile cross-platform",
    description:
      "Develop aplikasi Android & iOS dari satu codebase menggunakan React Native dan Flutter.",
    thumbnail: mobile,
  },
  {
    slug: "ui-ux",
    name: "UI/UX",
    tagline: "Desain produk digital yang fungsional & indah",
    description:
      "Dari research, wireframing, prototyping, hingga usability testing — proses desain end-to-end.",
    thumbnail: uiux,
  },
  {
    slug: "devops",
    name: "DevOps",
    tagline: "Otomasi infrastruktur, CI/CD, dan deployment",
    description:
      "Pelajari Docker, Kubernetes, CI/CD pipeline, dan praktik DevOps modern untuk skala production.",
    thumbnail: devops,
  },
];

export const courses: Course[] = [
  // ========== FRONT END ==========
  {
    id: "c-fe-001",
    title: "Front End Web Development",
    category: "Front End",
    level: "Pemula",
    duration: "8 minggu",
    lessons: 24,
    thumbnail: frontend,
    description: "Bangun antarmuka web modern dengan HTML, CSS, JavaScript & React.",
    longDescription:
      "Mulai dari fondasi HTML semantik, CSS layout responsif, JavaScript modern, hingga membangun aplikasi interaktif dengan React.",
    instructor: "Andi Pratama",
    syllabus: [
      "HTML & Semantic Markup",
      "CSS Layout & Responsive",
      "JavaScript Modern (ES6+)",
      "DOM Manipulation",
      "React Fundamentals",
      "Deploy ke Production",
    ],
    isGated: true,
    materialLink: "https://example.com/material/frontend.pdf",
    featured: true,
  },
  {
    id: "c-fe-002",
    title: "React Lanjutan & State Management",
    category: "Front End",
    level: "Lanjutan",
    duration: "6 minggu",
    lessons: 18,
    thumbnail: frontend,
    description: "Kuasai React Hooks, Context, Redux, dan performance optimization.",
    longDescription:
      "Bedah dalam-dalam React: custom hooks, state management dengan Redux & Zustand, server state dengan TanStack Query, dan teknik optimisasi.",
    instructor: "Andi Pratama",
    syllabus: ["Advanced Hooks", "Context API", "Redux Toolkit", "TanStack Query", "React Performance", "Testing"],
    isGated: true,
    materialLink: "https://example.com/material/react-advanced.pdf",
  },
  {
    id: "c-fe-003",
    title: "TailwindCSS untuk Designer Developer",
    category: "Front End",
    level: "Menengah",
    duration: "4 minggu",
    lessons: 12,
    thumbnail: frontend,
    description: "Bangun UI cepat dan konsisten dengan utility-first CSS.",
    longDescription:
      "Pelajari filosofi utility-first, design tokens, custom theme, dan workflow dengan Tailwind untuk produk modern.",
    instructor: "Rina Kusuma",
    syllabus: ["Utility-first Mindset", "Design Tokens", "Custom Theme", "Responsive Patterns", "Animasi", "Component Library"],
    isGated: true,
    materialLink: "https://example.com/material/tailwind.pdf",
  },

  // ========== BACK END ==========
  {
    id: "c-be-001",
    title: "Back End dengan Node.js",
    category: "Back End",
    level: "Menengah",
    duration: "10 minggu",
    lessons: 30,
    thumbnail: backend,
    description: "Bangun REST API & sistem backend yang scalable dengan Node.js.",
    longDescription:
      "Arsitektur server, REST API, autentikasi, database relasional, hingga deployment production-ready dengan Node.js & Express.",
    instructor: "Bagus Wirawan",
    syllabus: ["Node.js & Express", "REST API Design", "PostgreSQL", "JWT & Auth", "Testing", "Deployment"],
    isGated: true,
    materialLink: "https://example.com/material/backend.pdf",
    featured: true,
  },
  {
    id: "c-be-002",
    title: "Database Design & SQL",
    category: "Back End",
    level: "Pemula",
    duration: "5 minggu",
    lessons: 15,
    thumbnail: backend,
    description: "Rancang skema database yang efisien dan kuasai SQL.",
    longDescription:
      "Belajar normalisasi, indexing, query optimization, dan best practice merancang database untuk aplikasi production.",
    instructor: "Bagus Wirawan",
    syllabus: ["Relational Model", "Normalisasi", "SQL Lanjutan", "Indexing", "Transaction", "Query Tuning"],
    isGated: true,
    materialLink: "https://example.com/material/database.pdf",
  },
  {
    id: "c-be-003",
    title: "GraphQL API Development",
    category: "Back End",
    level: "Lanjutan",
    duration: "6 minggu",
    lessons: 18,
    thumbnail: backend,
    description: "Bangun API fleksibel dengan GraphQL & Apollo Server.",
    longDescription:
      "Schema design, resolvers, subscriptions, dan integrasi GraphQL dengan database serta authentication.",
    instructor: "Bagus Wirawan",
    syllabus: ["Schema Design", "Resolvers", "Apollo Server", "Subscriptions", "Auth", "Performance"],
    isGated: true,
    materialLink: "https://example.com/material/graphql.pdf",
  },

  // ========== MOBILE DEV ==========
  {
    id: "c-mb-001",
    title: "Mobile Development React Native",
    category: "Mobile Dev",
    level: "Menengah",
    duration: "9 minggu",
    lessons: 28,
    thumbnail: mobile,
    description: "Bangun aplikasi mobile cross-platform Android & iOS.",
    longDescription:
      "Setup project, navigasi, state management, integrasi API, hingga publish ke Play Store & App Store dengan React Native.",
    instructor: "Yoga Saputra",
    syllabus: ["Setup React Native", "Navigasi", "State Management", "API Integration", "Native Modules", "Publish ke Store"],
    isGated: true,
    materialLink: "https://example.com/material/mobile.pdf",
  },
  {
    id: "c-mb-002",
    title: "Flutter untuk Pemula",
    category: "Mobile Dev",
    level: "Pemula",
    duration: "8 minggu",
    lessons: 24,
    thumbnail: mobile,
    description: "Build aplikasi mobile cantik dengan Dart & Flutter.",
    longDescription:
      "Dari Dart fundamentals, widget tree, state management dengan Provider/Riverpod, hingga publish aplikasi.",
    instructor: "Yoga Saputra",
    syllabus: ["Dart Basics", "Widgets", "Layout", "State Management", "Networking", "Deployment"],
    isGated: true,
    materialLink: "https://example.com/material/flutter.pdf",
  },

  // ========== UI/UX ==========
  {
    id: "c-ux-001",
    title: "UI/UX Design Fundamental",
    category: "UI/UX",
    level: "Pemula",
    duration: "6 minggu",
    lessons: 18,
    thumbnail: uiux,
    description: "Kuasai prinsip desain antarmuka & pengalaman pengguna.",
    longDescription:
      "Berpikir seperti desainer: research, wireframing, prototyping di Figma, hingga usability testing.",
    instructor: "Rina Kusuma",
    syllabus: ["Design Thinking", "User Research", "Wireframe", "Visual Hierarchy", "Figma", "Usability Testing"],
    isGated: true,
    materialLink: "https://example.com/material/uiux.pdf",
  },
  {
    id: "c-ux-002",
    title: "Design System dari Nol",
    category: "UI/UX",
    level: "Lanjutan",
    duration: "5 minggu",
    lessons: 15,
    thumbnail: uiux,
    description: "Bangun design system scalable untuk produk digital.",
    longDescription:
      "Tokens, komponen, dokumentasi, dan kolaborasi designer-developer untuk membangun design system yang dipakai banyak tim.",
    instructor: "Rina Kusuma",
    syllabus: ["Design Tokens", "Component Library", "Documentation", "Versioning", "Handoff", "Governance"],
    isGated: true,
    materialLink: "https://example.com/material/design-system.pdf",
  },

  // ========== DEVOPS ==========
  {
    id: "c-do-001",
    title: "DevOps Essentials",
    category: "DevOps",
    level: "Menengah",
    duration: "7 minggu",
    lessons: 20,
    thumbnail: devops,
    description: "CI/CD, Docker, Kubernetes, dan automasi infrastruktur.",
    longDescription:
      "Budaya & tooling DevOps: Git workflow, CI/CD, kontainer Docker, orkestrasi Kubernetes, hingga monitoring production.",
    instructor: "Maya Anindita",
    syllabus: ["Git Workflow", "CI/CD", "Docker", "Kubernetes", "Infrastructure as Code", "Monitoring"],
    isGated: true,
    materialLink: "https://example.com/material/devops.pdf",
    featured: true,
  },
  {
    id: "c-do-002",
    title: "Docker & Kubernetes Deep Dive",
    category: "DevOps",
    level: "Lanjutan",
    duration: "6 minggu",
    lessons: 18,
    thumbnail: devops,
    description: "Bedah dalam Docker, Compose, dan orkestrasi Kubernetes.",
    longDescription:
      "Multi-stage builds, networking, volumes, K8s deployments, services, ingress, dan helm charts untuk production.",
    instructor: "Maya Anindita",
    syllabus: ["Docker Lanjutan", "Compose", "K8s Deployments", "Services & Ingress", "Helm", "Observability"],
    isGated: true,
    materialLink: "https://example.com/material/k8s.pdf",
  },
];

export const schedules: Schedule[] = [
  { id: "s-1", courseId: "c-fe-001", date: "2026-05-01", time: "14:00 WIB", topic: "HTML & CSS Dasar", mentor: "Andi Pratama" },
  { id: "s-2", courseId: "c-ux-001", date: "2026-05-02", time: "10:00 WIB", topic: "Design Thinking Workshop", mentor: "Rina Kusuma" },
  { id: "s-3", courseId: "c-be-001", date: "2026-05-03", time: "13:00 WIB", topic: "Setup Node.js & Express", mentor: "Bagus Wirawan" },
  { id: "s-4", courseId: "c-fe-001", date: "2026-05-05", time: "14:00 WIB", topic: "JavaScript Modern", mentor: "Andi Pratama" },
  { id: "s-5", courseId: "c-mb-001", date: "2026-05-06", time: "19:00 WIB", topic: "Setup React Native", mentor: "Yoga Saputra" },
  { id: "s-6", courseId: "c-do-001", date: "2026-05-07", time: "16:00 WIB", topic: "Pengantar Docker", mentor: "Maya Anindita" },
  { id: "s-7", courseId: "c-be-001", date: "2026-05-08", time: "13:00 WIB", topic: "REST API Design", mentor: "Bagus Wirawan" },
  { id: "s-8", courseId: "c-ux-001", date: "2026-05-10", time: "10:00 WIB", topic: "Wireframe di Figma", mentor: "Rina Kusuma" },
  { id: "s-9", courseId: "c-do-001", date: "2026-05-12", time: "16:00 WIB", topic: "CI/CD Pipeline", mentor: "Maya Anindita" },
  { id: "s-10", courseId: "c-fe-002", date: "2026-05-15", time: "14:00 WIB", topic: "Advanced Hooks", mentor: "Andi Pratama" },
  { id: "s-11", courseId: "c-mb-002", date: "2026-05-17", time: "19:00 WIB", topic: "Dart Basics", mentor: "Yoga Saputra" },
  { id: "s-12", courseId: "c-be-003", date: "2026-05-19", time: "13:00 WIB", topic: "GraphQL Schema", mentor: "Bagus Wirawan" },
];

export const getCourseById = (id: string) => courses.find((c) => c.id === id);
export const getSchedulesByCourse = (courseId: string) =>
  schedules.filter((s) => s.courseId === courseId);
export const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
export const getCoursesByCategory = (name: CourseCategory) =>
  courses.filter((c) => c.category === name);
