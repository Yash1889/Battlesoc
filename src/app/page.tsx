import { Card } from "@/components/ui/card";
import { Sword, Github, Linkedin, FileText, Keyboard } from "lucide-react";
import Link from "next/link";

const battles = [
    {
        title: "GitHub Battle",
        description: "Compare GitHub profiles, repos, stars, and aura points",
        icon: Github,
        href: "/github",
        gradient: "from-purple-600 to-blue-600"
    },
    {
        title: "LinkedIn Battle",
        description: "AI-powered LinkedIn profile comparison and roast",
        icon: Linkedin,
        href: "/linkedin",
        gradient: "from-blue-600 to-cyan-600"
    },
    {
        title: "Resume Battle",
        description: "Compare resumes with ATS scoring and AI feedback",
        icon: FileText,
        href: "/resume",
        gradient: "from-green-600 to-teal-600"
    },
    {
        title: "Typing Race",
        description: "Test your typing speed with Monkeytype-style engine",
        icon: Keyboard,
        href: "/typing",
        gradient: "from-orange-600 to-red-600"
    }
];

export default function Home() {
    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                        BattleSoc
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        The Ultimate AI-Powered Battle Platform
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {battles.map((battle) => (
                        <Link key={battle.href} href={battle.href}>
                            <Card className="p-8 glass-card hover:scale-105 transition-transform duration-300 cursor-pointer group">
                                <div className="flex items-start gap-4">
                                    <div className={`p-4 rounded-xl bg-gradient-to-br ${battle.gradient} group-hover:animate-pulse-glow`}>
                                        <battle.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold mb-2">{battle.title}</h3>
                                        <p className="text-muted-foreground">{battle.description}</p>
                                    </div>
                                    <Sword className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
