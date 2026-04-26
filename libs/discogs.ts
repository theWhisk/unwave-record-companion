import { Condition, ConditionValues, DiscogsMaster, DiscogsPaginatedSearchResult, DiscogsRatingResponse } from "@/types/discogs";

/**
 * Fetches the master release from the Discogs API, given a master ID.
 * @param masterId The master ID of the release to fetch.
 * @returns A promise that resolves with the fetched DiscogsMaster object.
 */
export async function getDiscogsMasterRelease(masterId: number): Promise<DiscogsMaster> {
    
    const response = await fetch(`https://api.discogs.com/masters/${masterId.toString()}`, {
        headers: {
            Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`
        }
    });
    const result = await response.json();
    return result;

}

/**
 * Performs a search on the Discogs database for records matching the specified criteria.
 * @param artist The name of the artist to search for.
 * @param title The title of the record to search for.
 * @param type The type of release to search for (e.g., "release").
 * @param format The format of the release to search for (e.g., "vinyl,album").
 * @returns A promise that resolves with a DiscogsPaginatedSearchResult containing the search results.
 */
export async function searchDiscogs(query: string, type: string, format: string): Promise<DiscogsPaginatedSearchResult> {
    try{
        const queryParams = {
            type: "release",
            format: "vinyl",
            q: query,
        }

        const queryString = buildQuery(queryParams);

        const searchResponse = await fetch(`https://api.discogs.com/database/search?${queryString}`, {
            headers: {
                Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`
            }
        });
        const results = await searchResponse.json();
        return results;
    } catch (error) {
        console.error(error);
        throw new Error("Error searching Discogs");
    }
}

export async function getPriceSuggestion(discogsId: number): Promise<ConditionValues> {
    if(!discogsId) throw new Error("No Discogs ID provided");

    try{
        console.log(`Getting price suggestion for Discogs ID: ${discogsId}`);
        const priceResponse = await fetch(`https://api.discogs.com/marketplace/price_suggestions/${discogsId.toString()}`, {
            headers: {
                Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`
            }
        });
        const result = await priceResponse.json();
        return result;
    } catch (error) {
        console.error(error);
        throw new Error("Error getting price suggestion");
    }
}

export async function getRating(discogsId: number): Promise<DiscogsRatingResponse> {

    if(!discogsId) throw new Error("No Discogs ID provided");

    try{
        console.log(`Getting rating for Discogs ID: ${discogsId}`);
        const ratingResponse = await fetch(`https://api.discogs.com/releases/${discogsId.toString()}/rating`, {
            headers: {
                Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`
            }
        });
        const result = await ratingResponse.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error(error);
        throw new Error("Error getting rating");
    }
}

//This helper method is used to build the search query takng a map of parameters as input.
function buildQuery(parameters: Record<string, any>): string{

    const urlSearchParams = new URLSearchParams();
    for(const [key, value] of Object.entries(parameters)){
        if (value !== undefined){
            urlSearchParams.append(key, value);
        }
    }

    return urlSearchParams.toString();
}
