// Resume Parser - Extracts sections and metadata from resume text

export interface ResumeSection {
    title: string;
    content: string;
    bullets: string[];
}

export interface ParsedResume {
    rawText: string;
    sections: ResumeSection[];
    experienceRoles: number;
    projectCount: number;
    skillsList: string[];
    hasRecency: boolean; // mentions 2023-2025
    bulletPointCount: number;
    certificationCount: number;
}

const SECTION_KEYWORDS = {
    experience: ['experience', 'work history', 'employment', 'professional experience'],
    education: ['education', 'academic', 'qualification'],
    skills: ['skills', 'technical skills', 'competencies', 'technologies'],
    projects: ['projects', 'portfolio', 'work samples'],
    achievements: ['achievements', 'accomplishments', 'awards', 'honors'],
    summary: ['summary', 'objective', 'about', 'profile'],
    certifications: ['certifications', 'certificates', 'licenses']
};

const ACTION_VERBS = [
    'built', 'created', 'developed', 'designed', 'implemented', 'led', 'managed',
    'achieved', 'improved', 'increased', 'reduced', 'optimized', 'launched',
    'delivered', 'established', 'coordinated', 'spearheaded', 'initiated'
];

const TECH_KEYWORDS = [
    'ai', 'ml', 'machine learning', 'deep learning', 'neural network',
    'react', 'node', 'python', 'javascript', 'typescript', 'java', 'c++',
    'aws', 'gcp', 'azure', 'cloud', 'kubernetes', 'docker',
    'backend', 'frontend', 'full-stack', 'database', 'api', 'rest',
    'mongodb', 'postgresql', 'sql', 'nosql', 'redis',
    'git', 'ci/cd', 'devops', 'microservices', 'agile'
];

function detectSections(text: string): ResumeSection[] {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const sections: ResumeSection[] = [];
    let currentSection: ResumeSection | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        let foundSection = false;
        for (const [sectionType, keywords] of Object.entries(SECTION_KEYWORDS)) {
            if (keywords.some(kw => lowerLine.includes(kw))) {
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {
                    title: sectionType.charAt(0).toUpperCase() + sectionType.slice(1),
                    content: '',
                    bullets: []
                };
                foundSection = true;
                break;
            }
        }

        if (!foundSection && currentSection) {
            currentSection.content += line + '\n';
            if (line.match(/^[•\-\*]\s/) || line.match(/^\d+\.\s/)) {
                currentSection.bullets.push(line.replace(/^[•\-\*\d\.]\s+/, ''));
            }
        }
    }

    if (currentSection) {
        sections.push(currentSection);
    }

    return sections;
}

function countExperienceRoles(text: string): number {
    const yearPatterns = [
        /\b20\d{2}\s*-\s*20\d{2}\b/g,
        /\b20\d{2}\s*-\s*present\b/gi,
        /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+20\d{2}\b/gi
    ];

    let count = 0;
    yearPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) count += matches.length;
    });

    return Math.max(1, Math.floor(count / 2));
}

function countProjects(sections: ResumeSection[]): number {
    const projectSection = sections.find(s => s.title.toLowerCase() === 'projects');
    if (!projectSection) return 0;

    return Math.max(projectSection.bullets.length,
        projectSection.content.split('\n').filter(l => l.trim().length > 20).length);
}

function extractSkills(sections: ResumeSection[]): string[] {
    const skillsSection = sections.find(s => s.title.toLowerCase() === 'skills');
    if (!skillsSection) return [];

    const skillText = skillsSection.content;
    const skills = skillText.split(/[,;\n]/).map(s => s.trim()).filter(s => s.length > 0);

    return skills;
}

function hasRecency(text: string): boolean {
    return /\b(2023|2024|2025)\b/.test(text);
}

function countBulletPoints(sections: ResumeSection[]): number {
    return sections.reduce((sum, section) => sum + section.bullets.length, 0);
}

function countCertifications(sections: ResumeSection[]): number {
    const certSection = sections.find(s => s.title.toLowerCase() === 'certifications');
    if (!certSection) return 0;

    return Math.max(certSection.bullets.length,
        certSection.content.split('\n').filter(l => l.trim().length > 5).length);
}

export function parseResume(text: string): ParsedResume {
    const sections = detectSections(text);

    return {
        rawText: text,
        sections,
        experienceRoles: countExperienceRoles(text),
        projectCount: countProjects(sections),
        skillsList: extractSkills(sections),
        hasRecency: hasRecency(text),
        bulletPointCount: countBulletPoints(sections),
        certificationCount: countCertifications(sections)
    };
}

export function countActionVerbs(text: string): number {
    const lowerText = text.toLowerCase();
    return ACTION_VERBS.filter(verb => lowerText.includes(verb)).length;
}

export function countTechKeywords(text: string): number {
    const lowerText = text.toLowerCase();
    return TECH_KEYWORDS.filter(keyword => lowerText.includes(keyword)).length;
}

export function countMetrics(text: string): number {
    const metricPatterns = [
        /\b\d+%/g,
        /\b\d+x\b/gi,
        /\$\d+/g,
        /\b\d+\+\b/g,
        /increased.*\d+/gi,
        /reduced.*\d+/gi,
        /improved.*\d+/gi
    ];

    let count = 0;
    metricPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) count += matches.length;
    });

    return count;
}
