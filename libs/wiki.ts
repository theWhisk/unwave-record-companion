import wiki, { wikiSearchResult, wikiSummary } from "wikipedia";
import { log } from "@/libs/axiom-logger";

export async function getWikiSummary(title: string): Promise<wikiSummary> {
    try {
        const summary = await wiki.summary(title);
        return summary;
    } catch (error) {
        log.error('wiki summary lookup failed', { error });
        throw new Error("Error searching Wikipedia");
    }
}

export async function searchWiki(query: string): Promise<wikiSearchResult> {
    try {
        const results = await wiki.search(query);
        return results;
    } catch (error) {
        log.error('wiki search failed', { error });
        throw new Error("Error searching Wikipedia");
    }
}
