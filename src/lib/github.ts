export interface GitHubProfile {
    login: string;
    name: string;
    avatar_url: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
    total_stars: number;
    total_forks: number;
    languages: string[];
    estimated_commits: number;
    complex_project_score: number;
    readme_score: number;
    activity_score: number;
    aura_points: number;
}

export async function getGitHubProfile(username: string): Promise<GitHubProfile> {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error("User not found");
    const user = await userRes.json();

    // Fetch repos (2 pages = 200 repos)
    const reposRes1 = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=1`);
    const reposRes2 = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=2`);
    const repos1 = await reposRes1.json();
    const repos2 = await reposRes2.json();
    const repos = [...repos1, ...repos2];

    const total_stars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
    const total_forks = repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0);

    const languageSet = new Set<string>();
    repos.forEach((repo: any) => {
        if (repo.language) languageSet.add(repo.language);
    });
    const languages = Array.from(languageSet);

    // Activity score
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
    const events = await eventsRes.json();
    const activity_score = Math.min(100, events.length * 2);

    const estimated_commits = repos.reduce((sum: number, repo: any) => sum + (repo.size || 0), 0);
    const complex_project_score = repos.filter((repo: any) => repo.stargazers_count > 10).length * 5;
    const readme_score = repos.filter((repo: any) => repo.has_wiki || repo.description).length * 2;

    // Aura formula: Stars * 3 + Followers * 2 + Forks * 1.5
    const aura_points = Math.round(
        (total_stars * 3) +
        (user.followers * 2) +
        (total_forks * 1.5) +
        complex_project_score +
        readme_score +
        activity_score
    );

    return {
        login: user.login,
        name: user.name || user.login,
        avatar_url: user.avatar_url,
        bio: user.bio || "",
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        created_at: user.created_at,
        total_stars,
        total_forks,
        languages,
        estimated_commits,
        complex_project_score,
        readme_score,
        activity_score,
        aura_points
    };
}
