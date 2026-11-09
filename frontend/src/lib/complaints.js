import { BookOpen, CircleCheckBig, Inbox, Pin, ShieldCheck, ShowerHead, Soup, Wrench, Activity } from "lucide-react";

export const CATEGORIES = [
  { id: "Bathroom & Hygiene", label: "Bathroom & Hygiene", icon: ShowerHead, color: "#0ea5e9" },
  { id: "Anti-Ragging & Safety", label: "Anti-Ragging & Safety", icon: ShieldCheck, color: "#f43f5e" },
  { id: "Mess & Food Quality", label: "Mess & Food Quality", icon: Soup, color: "#f97316" },
  { id: "Academic Issues", label: "Academic Issues", icon: BookOpen, color: "#10b981" },
  { id: "Infrastructure/Maintenance", label: "Infrastructure / Maintenance", icon: Wrench, color: "#8b5cf6" },
  { id: "Other", label: "Other", icon: Pin, color: "#64748b" },
];

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const DEPARTMENTS = [
  "Maintenance Department",
  "Dean of Students Office",
  "Hostel & Mess Committee",
  "Academic Office",
  "General Administration",
];

export const STATUSES = ["Submitted", "In Progress", "Resolved"];

export const STATUS = {
  Submitted: {
    icon: Inbox,
    chip: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
    dot: "bg-sky-500",
    banner: "from-sky-50 to-white border-sky-200",
    text: "text-sky-700",
    desc: "Your complaint has been received and is awaiting review.",
  },
  "In Progress": {
    icon: Activity,
    chip: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    dot: "bg-amber-500",
    banner: "from-amber-50 to-white border-amber-200",
    text: "text-amber-700",
    desc: "The department is actively working on your complaint.",
  },
  Resolved: {
    icon: CircleCheckBig,
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    dot: "bg-emerald-500",
    banner: "from-emerald-50 to-white border-emerald-200",
    text: "text-emerald-700",
    desc: "Your complaint has been resolved.",
  },
};

export const statusOf = (s) => STATUS[s] || STATUS.Submitted;

export const HOSTEL_BLOCKS = ["1", "2", "3", "4", "5", "6"];
