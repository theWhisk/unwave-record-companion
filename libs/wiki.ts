import wiki, { wikiSearchResult, wikiSummary } from "wikipedia";
import { log } from "@/libs/axiom-logger";

// Wikipedia API etiquette requires an identifying User-Agent; the library
// default is a generic string that gets 403'd from cloud IPs.
wiki.setUserAgent('CrateMole/1.0 (https://github.com/theWhisk/unwave-record-companion)');

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

export async function getWikiSummary(title: string): Promise<wikiSummary> {
    try {
        const summary = await wiki.summary(title);
        return summary;
    } catch (error) {
        log.error('wiki summary lookup failed', { error: serializeError(error) });
        throw new Error("Error searching Wikipedia");
    }
}

export async function searchWiki(query: string): Promise<wikiSearchResult> {
    try {
        const results = await wiki.search(query);
        return results;
    } catch (error) {
        log.error('wiki search failed', { error: serializeError(error) });
        throw new Error("Error searching Wikipedia");
    }
}
