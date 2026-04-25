import wiki, { wikiSearchResult, wikiSummary } from "wikipedia";

export async function getWikiSummary(title: string): Promise<wikiSummary> {
    try {  
        const summary = await wiki.summary(title);
        return summary;
    } catch (error) {
        console.error(error);
        throw new Error("Error searching Wikipedia");
    }
}

export async function searchWiki(query: string): Promise<wikiSearchResult> {
    try {
        const results = await wiki.search(query);
        return results;
    } catch (error) {
        console.error(error);
        throw new Error("Error searching Wikipedia");
    }
} 


