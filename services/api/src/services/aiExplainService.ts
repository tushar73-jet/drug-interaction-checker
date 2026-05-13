import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';
import logger from '../utils/logger';

/**
 * AI Explain Service — Research Assistant Pipeline
 * 
 * Step 1: Groq LLM decomposes the clinical question into 3-5 targeted search queries.
 * Step 2: Tavily searches medical literature for each query in parallel.
 * Step 3: Results are deduplicated by URL.
 * Step 4: Groq synthesizes a clinical explanation with inline source references.
 */

export interface Citation {
    title: string;
    url: string;
    snippet: string;
}

export interface ExplainResult {
    explanation: string;
    citations: Citation[];
}

// Lazy-initialise clients so the service fails gracefully if keys are missing.
const getGroqClient = (): Groq => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY environment variable is not set.');
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const getTavilyClient = () => {
    if (!process.env.TAVILY_API_KEY) {
        throw new Error('TAVILY_API_KEY environment variable is not set.');
    }
    return tavily({ apiKey: process.env.TAVILY_API_KEY });
};

// ---------------------------------------------------------------------------
// Step 1: Question Decomposition
// ---------------------------------------------------------------------------
async function decomposeQuestion(drug1: string, drug2: string, description: string): Promise<string[]> {
    const groq = getGroqClient();

    const prompt = `You are a clinical pharmacology research assistant.
Break the following drug interaction question into exactly 3 to 5 precise, distinct search queries optimised for retrieving peer-reviewed medical literature. Return ONLY a valid JSON array of strings, no additional text.

Interaction: "${drug1} and ${drug2} interaction"
Known risk: "${description}"

Return format: ["query1", "query2", "query3"]`;

    const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '[]';

    try {
        // Extract JSON array even if model wraps it in markdown code fences
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        const queries: string[] = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
        return Array.isArray(queries) ? queries.slice(0, 5) : [];
    } catch {
        logger.warn('Failed to parse Groq query decomposition, using fallback queries.', { raw });
        return [
            `${drug1} ${drug2} drug interaction mechanism`,
            `${drug1} ${drug2} clinical risk management`,
            `${drug1} ${drug2} pharmacology adverse effects`,
        ];
    }
}

// ---------------------------------------------------------------------------
// Step 2: Parallel Web Search via Tavily
// ---------------------------------------------------------------------------
async function searchMedicalLiterature(queries: string[]): Promise<Citation[]> {
    const client = getTavilyClient();

    const searchResults = await Promise.allSettled(
        queries.map(q =>
            client.search(q, {
                searchDepth: 'advanced',
                maxResults: 5,
                includeDomains: [
                    'pubmed.ncbi.nlm.nih.gov',
                    'fda.gov',
                    'nih.gov',
                    'nejm.org',
                    'bmj.com',
                    'thelancet.com',
                    'drugs.com',
                    'medscape.com',
                    'uptodate.com',
                    'clinicalpharmacology.com',
                ],
            })
        )
    );

    const allResults: Citation[] = [];
    for (const result of searchResults) {
        if (result.status === 'fulfilled' && result.value.results) {
            for (const r of result.value.results) {
                allResults.push({
                    title: r.title || 'Medical Source',
                    url: r.url,
                    snippet: r.content?.slice(0, 400) || '',
                });
            }
        }
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    return allResults.filter(r => {
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
    }).slice(0, 15); // Cap at 15 unique sources
}

// ---------------------------------------------------------------------------
// Step 3: Clinical Synthesis via Groq
// ---------------------------------------------------------------------------
async function synthesizeExplanation(
    drug1: string,
    drug2: string,
    description: string,
    sources: Citation[]
): Promise<string> {
    const groq = getGroqClient();

    const sourceContext = sources
        .map((s, i) => `[${i + 1}] ${s.title}\n${s.snippet}`)
        .join('\n\n');

    const prompt = `You are a clinical pharmacology assistant helping clinicians understand drug interactions. Write a clear, accurate, evidence-based explanation.

Drug Interaction: ${drug1} + ${drug2}
Known Risk: ${description}

Medical Literature Sources:
${sourceContext}

Write a structured clinical explanation (250-350 words) that includes:
1. The pharmacological mechanism of this interaction
2. The clinical significance and severity
3. Specific risks clinicians should monitor for
4. Any dosing or management considerations

Write in clear medical prose. Reference sources by number where relevant (e.g., "Studies show [1]..."). Do not use headers or bullet points — write as flowing clinical narrative.`;

    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Explanation unavailable.';
}

// ---------------------------------------------------------------------------
// Main Export: Full AI Explain Pipeline
// ---------------------------------------------------------------------------
export const explainInteraction = async (
    drug1: string,
    drug2: string,
    description: string
): Promise<ExplainResult> => {
    logger.info(`AI explain pipeline started for: ${drug1} + ${drug2}`);

    // Step 1: Decompose
    const queries = await decomposeQuestion(drug1, drug2, description);
    logger.info(`Generated ${queries.length} search queries`);

    // Step 2: Search
    const citations = await searchMedicalLiterature(queries);
    logger.info(`Retrieved ${citations.length} unique sources`);

    // Step 3: Synthesize
    const explanation = await synthesizeExplanation(drug1, drug2, description, citations);
    logger.info(`AI explanation synthesized (${explanation.length} chars)`);

    return { explanation, citations };
};
