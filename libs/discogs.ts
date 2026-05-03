import { log } from "next-axiom";
import { Condition, ConditionValues, DiscogsMaster, DiscogsPaginatedSearchResult, DiscogsRatingResponse } from "@/types/discogs";

export async function getDiscogsMasterRelease(masterId: number): Promise<DiscogsMaster> {
    const response = await fetch(`https://api.discogs.com/masters/${masterId.toString()}`, {
        headers: {
            Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`
        }
    });
    const result = await response.json();
    return result;
}

export async function searchDiscogs(query: string, type: string, format: string): Promise<DiscogsPaginatedSearchResult> {
    try {
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
        log.error('discogs search failed', { error });
        throw new Error("Error searching Discogs");
    }
}

export async function getPriceSuggestion(discogsId: number): Promise<ConditionValues> {
    if (!discogsId) throw new Error("No Discogs ID provided");

    try {
        const priceResponse = await fetch(`https://api.discogs.com/marketplace/price_suggestions/${discogsId.toString()}`, {
            headers: {
                Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`
            }
        });
        const result = await priceResponse.json();
        return result;
    } catch (error) {
        log.error('discogs price suggestion failed', { error });
        throw new Error("Error getting price suggestion");
    }
}

export async function getRating(discogsId: number): Promise<DiscogsRatingResponse> {
    if (!discogsId) throw new Error("No Discogs ID provided");

    try {
        const ratingResponse = await fetch(`https://api.discogs.com/releases/${discogsId.toString()}/rating`, {
            headers: {
                Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`
            }
        });
        const result = await ratingResponse.json();
        return result;
    } catch (error) {
        log.error('discogs rating fetch failed', { error });
        throw new Error("Error getting rating");
    }
}

function buildQuery(parameters: Record<string, any>): string {
    const urlSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(parameters)) {
        if (value !== undefined) {
            urlSearchParams.append(key, value);
        }
    }
    return urlSearchParams.toString();
}
