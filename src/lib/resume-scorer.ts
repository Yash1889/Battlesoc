// Resume Scorer - Calculate scores for resume metrics

import { ParsedResume, countActionVerbs, countTechKeywords, countMetrics } from './resume-parser';

export interface ResumeScores {
    experience: number;
    projects: number;
    skills: number;
    structure: number;
    keywords: number;
    total: number;
    ats: number;
}

function calculateExperienceScore(resume: ParsedResume): number {
    let score = 0;
    score += Math.min(10, resume.experienceRoles * 2);
    if (resume.hasRecency) score += 5;
    const expSection = resume.sections.find(s => s.title.toLowerCase() === 'experience');
    if (expSection) {
        score += Math.min(5, expSection.bullets.length);
    }
    return Math.min(20, score);
}

function calculateProjectScore(resume: ParsedResume): number {
    let score = 0;
    score += Math.min(8, resume.projectCount * 2);
    const metrics = countMetrics(resume.rawText);
    score += Math.min(6, metrics);
    const techCount = countTechKeywords(resume.rawText);
    score += Math.min(6, Math.floor(techCount / 2));
    return Math.min(20, score);
}

function calculateSkillsScore(resume: ParsedResume): number {
    let score = 0;
    score += Math.min(10, resume.skillsList.length);
    const modernTech = ['ai', 'ml', 'cloud', 'react', 'node', 'python', 'aws', 'docker', 'kubernetes'];
    const modernCount = resume.skillsList.filter(skill =>
        modernTech.some(tech => skill.toLowerCase().includes(tech))
    ).length;
    score += Math.min(10, modernCount * 2);
    return Math.min(20, score);
}

function calculateStructureScore(resume: ParsedResume): number {
    let score = 0;
    score += Math.min(8, resume.bulletPointCount);
    const keySections = ['experience', 'education', 'skills', 'projects', 'summary'];
    const foundSections = resume.sections.filter(s =>
        keySections.some(key => s.title.toLowerCase().includes(key))
    ).length;
    score += foundSections * 2;
    return Math.min(20, score);
}

function calculateKeywordScore(resume: ParsedResume): number {
    let score = 0;
    const actionCount = countActionVerbs(resume.rawText);
    score += Math.min(10, actionCount);
    const metricCount = countMetrics(resume.rawText);
    score += Math.min(10, metricCount * 2);
    return Math.min(20, score);
}

function calculateATSScore(resume: ParsedResume): number {
    let score = 0;
    const actionCount = countActionVerbs(resume.rawText);
    const techCount = countTechKeywords(resume.rawText);
    score += Math.min(30, (actionCount + techCount) * 1.5);
    const requiredSections = ['experience', 'education', 'skills'];
    const foundRequired = resume.sections.filter(s =>
        requiredSections.some(req => s.title.toLowerCase().includes(req))
    ).length;
    score += foundRequired * 6.67;
    const hasEmail = /@/.test(resume.rawText);
    const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resume.rawText);
    if (hasEmail) score += 5;
    if (hasPhone) score += 5;
    score += Math.min(20, resume.bulletPointCount * 2);
    score += Math.min(10, resume.certificationCount * 3);
    const hasTables = /\|.*\|/.test(resume.rawText);
    const hasComplexFormatting = resume.rawText.includes('│') || resume.rawText.includes('┃');
    if (!hasTables && !hasComplexFormatting) score += 10;
    return Math.min(100, Math.round(score));
}

export function scoreResume(resume: ParsedResume): ResumeScores {
    const experience = calculateExperienceScore(resume);
    const projects = calculateProjectScore(resume);
    const skills = calculateSkillsScore(resume);
    const structure = calculateStructureScore(resume);
    const keywords = calculateKeywordScore(resume);
    const total = experience + projects + skills + structure + keywords;
    const ats = calculateATSScore(resume);

    return {
        experience,
        projects,
        skills,
        structure,
        keywords,
        total,
        ats
    };
}

export interface ResumeComparison {
    winner: 'p1' | 'p2';
    p1Scores: ResumeScores;
    p2Scores: ResumeScores;
    breakdown: {
        metric: string;
        p1Value: number;
        p2Value: number;
        winner: 'p1' | 'p2';
        reason?: string;
    }[];
    p1Details: {
        experience: { roles: number; recency: boolean; bullets: number };
        projects: { count: number; metrics: number; techKeywords: number };
        skills: { total: number; modern: number };
        structure: { bullets: number; sections: number };
        keywords: { actionVerbs: number; metrics: number };
        ats: { keywords: number; sections: number; contact: boolean; bullets: number };
    };
    p2Details: {
        experience: { roles: number; recency: boolean; bullets: number };
        projects: { count: number; metrics: number; techKeywords: number };
        skills: { total: number; modern: number };
        structure: { bullets: number; sections: number };
        keywords: { actionVerbs: number; metrics: number };
        ats: { keywords: number; sections: number; contact: boolean; bullets: number };
    };
}

function getResumeDetails(resume: ParsedResume) {
    const expSection = resume.sections.find(s => s.title.toLowerCase() === 'experience');
    const keySections = ['experience', 'education', 'skills', 'projects', 'summary'];
    const foundSections = resume.sections.filter(s =>
        keySections.some(key => s.title.toLowerCase().includes(key))
    ).length;
    const modernTech = ['ai', 'ml', 'cloud', 'react', 'node', 'python', 'aws', 'docker', 'kubernetes'];
    const modernCount = resume.skillsList.filter(skill =>
        modernTech.some(tech => skill.toLowerCase().includes(tech))
    ).length;
    const hasContact = /@/.test(resume.rawText) || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resume.rawText);
    const requiredSections = ['experience', 'education', 'skills'];
    const foundRequired = resume.sections.filter(s =>
        requiredSections.some(req => s.title.toLowerCase().includes(req))
    ).length;

    return {
        experience: {
            roles: resume.experienceRoles,
            recency: resume.hasRecency,
            bullets: expSection?.bullets.length || 0
        },
        projects: {
            count: resume.projectCount,
            metrics: countMetrics(resume.rawText),
            techKeywords: countTechKeywords(resume.rawText)
        },
        skills: {
            total: resume.skillsList.length,
            modern: modernCount
        },
        structure: {
            bullets: resume.bulletPointCount,
            sections: foundSections
        },
        keywords: {
            actionVerbs: countActionVerbs(resume.rawText),
            metrics: countMetrics(resume.rawText)
        },
        ats: {
            keywords: countActionVerbs(resume.rawText) + countTechKeywords(resume.rawText),
            sections: foundRequired,
            contact: hasContact,
            bullets: resume.bulletPointCount
        }
    };
}

export function compareResumes(resume1: ParsedResume, resume2: ParsedResume): ResumeComparison {
    const p1Scores = scoreResume(resume1);
    const p2Scores = scoreResume(resume2);
    const p1Details = getResumeDetails(resume1);
    const p2Details = getResumeDetails(resume2);

    const breakdown = [
        {
            metric: 'Experience',
            p1Value: p1Scores.experience,
            p2Value: p2Scores.experience,
            winner: (p1Scores.experience >= p2Scores.experience ? 'p1' : 'p2') as 'p1' | 'p2',
            reason: p1Scores.experience >= p2Scores.experience
                ? `${p1Details.experience.roles} roles${p1Details.experience.recency ? ', recent exp' : ''}, ${p1Details.experience.bullets} bullets`
                : `${p2Details.experience.roles} roles${p2Details.experience.recency ? ', recent exp' : ''}, ${p2Details.experience.bullets} bullets`
        },
        {
            metric: 'Projects',
            p1Value: p1Scores.projects,
            p2Value: p2Scores.projects,
            winner: (p1Scores.projects >= p2Scores.projects ? 'p1' : 'p2') as 'p1' | 'p2',
            reason: p1Scores.projects >= p2Scores.projects
                ? `${p1Details.projects.count} projects, ${p1Details.projects.metrics} metrics, ${p1Details.projects.techKeywords} tech keywords`
                : `${p2Details.projects.count} projects, ${p2Details.projects.metrics} metrics, ${p2Details.projects.techKeywords} tech keywords`
        },
        {
            metric: 'Skills',
            p1Value: p1Scores.skills,
            p2Value: p2Scores.skills,
            winner: (p1Scores.skills >= p2Scores.skills ? 'p1' : 'p2') as 'p1' | 'p2',
            reason: p1Scores.skills >= p2Scores.skills
                ? `${p1Details.skills.total} skills (${p1Details.skills.modern} modern tech)`
                : `${p2Details.skills.total} skills (${p2Details.skills.modern} modern tech)`
        },
        {
            metric: 'Structure',
            p1Value: p1Scores.structure,
            p2Value: p2Scores.structure,
            winner: (p1Scores.structure >= p2Scores.structure ? 'p1' : 'p2') as 'p1' | 'p2',
            reason: p1Scores.structure >= p2Scores.structure
                ? `${p1Details.structure.bullets} bullets, ${p1Details.structure.sections}/5 key sections`
                : `${p2Details.structure.bullets} bullets, ${p2Details.structure.sections}/5 key sections`
        },
        {
            metric: 'Keywords',
            p1Value: p1Scores.keywords,
            p2Value: p2Scores.keywords,
            winner: (p1Scores.keywords >= p2Scores.keywords ? 'p1' : 'p2') as 'p1' | 'p2',
            reason: p1Scores.keywords >= p2Scores.keywords
                ? `${p1Details.keywords.actionVerbs} action verbs, ${p1Details.keywords.metrics} metrics`
                : `${p2Details.keywords.actionVerbs} action verbs, ${p2Details.keywords.metrics} metrics`
        },
        {
            metric: 'ATS Score',
            p1Value: p1Scores.ats,
            p2Value: p2Scores.ats,
            winner: (p1Scores.ats >= p2Scores.ats ? 'p1' : 'p2') as 'p1' | 'p2',
            reason: p1Scores.ats >= p2Scores.ats
                ? `${p1Details.ats.keywords} keywords, ${p1Details.ats.sections}/3 required sections, ${p1Details.ats.contact ? 'has' : 'no'} contact`
                : `${p2Details.ats.keywords} keywords, ${p2Details.ats.sections}/3 required sections, ${p2Details.ats.contact ? 'has' : 'no'} contact`
        }
    ];

    return {
        winner: p1Scores.ats >= p2Scores.ats ? 'p1' : 'p2',
        p1Scores,
        p2Scores,
        breakdown,
        p1Details,
        p2Details
    };
}
