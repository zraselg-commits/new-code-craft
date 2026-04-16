import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import * as fs from "fs";
import * as path from "path";

const TEAM_FILE = path.join(process.cwd(), "scripts", "team-data.json");

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  avatarUrl?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}

const DEFAULT_TEAM: TeamMember[] = [
  { id: "1", name: "Rasel Ahmed", role: "Founder & Lead Developer", avatar: "RA", bio: "Full-stack developer and founder of Code Craft BD with 5+ years of experience in web development, AI & SEO.", github: "#", linkedin: "#", twitter: "#" },
  { id: "2", name: "Sakib Hasan", role: "UI/UX Designer", avatar: "SH", bio: "Creative designer specializing in modern web interfaces.", github: "#", linkedin: "#", twitter: "#" },
  { id: "3", name: "Nusrat Jahan", role: "SEO & Marketing Lead", avatar: "NJ", bio: "Digital marketing expert with expertise in SEO and content strategy.", github: "#", linkedin: "#", twitter: "#" },
  { id: "4", name: "Tanvir Islam", role: "Video & Creative Director", avatar: "TI", bio: "Video production and motion graphics specialist.", github: "#", linkedin: "#", twitter: "#" },
];

export function readTeam(): TeamMember[] {
  if (!fs.existsSync(TEAM_FILE)) return DEFAULT_TEAM;
  try { return JSON.parse(fs.readFileSync(TEAM_FILE, "utf-8")); }
  catch { return DEFAULT_TEAM; }
}

export function writeTeam(data: TeamMember[]) {
  fs.mkdirSync(path.dirname(TEAM_FILE), { recursive: true });
  fs.writeFileSync(TEAM_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  return NextResponse.json(readTeam());
}

export async function POST(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });
  const body = await req.json() as Partial<TeamMember>;
  const list = readTeam();
  const item: TeamMember = {
    id: Date.now().toString(),
    name: body.name ?? "",
    role: body.role ?? "",
    avatar: body.name?.substring(0, 2).toUpperCase() ?? "??",
    avatarUrl: body.avatarUrl,
    bio: body.bio,
    github: body.github,
    linkedin: body.linkedin,
    twitter: body.twitter,
  };
  list.push(item);
  writeTeam(list);
  return NextResponse.json(item, { status: 201 });
}
