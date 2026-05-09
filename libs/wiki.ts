import { log } from "@/libs/axiom-logger";

const USER_AGENT = 'CrateMole/1.0 (https://github.com/theWhisk/unwave-record-companion)';
const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const WIKI_REST = 'https://en.wikipedia.org/api/rest_v1';

function serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            cause: error.cause instanceof Error ? serializeError(error.cause) : error.cause,
        };
    }
    return { raw: String(error) };
}

export interface WikiSearchResult {
    results: Array<{ title: string }>;
}

export interface WikiSummary {
    extract: string;
}

export async function searchWiki(query: string): Promise<WikiSearchResult> {
    try {
        const params = new URLSearchParams({
            action: 'query',
            list: 'search',
            srsearch: query,
            srlimit: '5',
            srprop: '',
            format: 'json',
            origin: '*',
        });
        const response = await fetch(`${WIKI_API}?${params}`, {
            headers: { 'User-Agent': USER_AGENT },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return { results: data.query?.search ?? [] };
    } catch (error) {
        log.error('wiki search failed', { error: serializeError(error) });
        throw new Error('Error searching Wikipedia');
    }
}

export async function getWikiSummary(title: string): Promise<WikiSummary> {
    try {
        const response = await fetch(`${WIKI_REST}/page/summary/${encodeURIComponent(title)}`, {
            headers: { 'User-Agent': USER_AGENT },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return { extract: data.extract ?? '' };
    } catch (error) {
        log.error('wiki summary lookup failed', { error: serializeError(error) });
        throw new Error('Error searching Wikipedia');
    }
}
