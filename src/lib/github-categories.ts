import { GitHubProfile } from './github';

export interface Category {
    name: string;
    getValue: (profile: GitHubProfile) => number;
    icon: string;
}

export const GITHUB_CATEGORIES: Category[] = [
    {
        name: "Aura Points",
        getValue: (p) => p.aura_points,
        icon: "✨"
    },
    {
        name: "Total Stars",
        getValue: (p) => p.total_stars,
        icon: "⭐"
    },
    {
        name: "Followers",
        getValue: (p) => p.followers,
        icon: "👥"
    },
    {
        name: "Public Repos",
        getValue: (p) => p.public_repos,
        icon: "📚"
    },
    {
        name: "Total Forks",
        getValue: (p) => p.total_forks,
        icon: "🍴"
    },
    {
        name: "Languages",
        getValue: (p) => p.languages.length,
        icon: "💻"
    },
    {
        name: "Activity Score",
        getValue: (p) => p.activity_score,
        icon: "🔥"
    },
    {
        name: "Complex Projects",
        getValue: (p) => p.complex_project_score / 5,
        icon: "🧩"
    },
    {
        name: "Documentation",
        getValue: (p) => p.readme_score / 2,
        icon: "📝"
    },
    {
        name: "Est. Commits",
        getValue: (p) => Math.min(1000, p.estimated_commits),
        icon: "📊"
    }
];
