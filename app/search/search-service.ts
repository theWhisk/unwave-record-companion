"use server"

import { revalidatePath } from "next/cache";
import { searchDiscogs, getDiscogsMasterRelease, getPriceSuggestion, getRating } from "@/libs/discogs";
import { getWikiSummary, searchWiki } from "@/libs/wiki";
import { Condition, ConditionValues, DiscogsMaster } from "@/types/discogs";

export interface ReleaseData {
    image: string;
    title: string;
    artists: string[];
    year: number; 
    noOfTracks: number;
    noForSale: number;
    originalPriceSuggestion: ConditionValues;
    latestPriceSuggestion: number;
    genres: string[];
    summary: string | null;
    rating: {
        count: number, 
        average: number
    } ;
}

export async function findRelease(query: string): Promise<ReleaseData> {

    console.log(`Finding release with query: ${query}`);

    const type = "release";
    const format = "vinyl,album";
    let originalPriceSuggestion: ConditionValues| null = null;
    let discogsMaster: DiscogsMaster | null = null;
    let imageUri: string | null = null;
    let ratingAverage: number | null = null;
    let ratingCount: number | null = null;
    let wikiSource: string | null = null;

    const searchResponse = await searchDiscogs(query, type, format);
    if (searchResponse.results.length === 0) throw new Error("No releases found");
    
    for (const result of searchResponse.results) {
        if (result.master_id) {
            discogsMaster = await getDiscogsMasterRelease(result.master_id);
            break;
        }
    }
    console.log("Search results found: ", searchResponse.results.length);

    if (!discogsMaster) {
        throw new Error("No valid master ID found in search results");
    }
    console.log("Discogs master: ", discogsMaster.id);

    if(discogsMaster.main_release){
        originalPriceSuggestion = await getPriceSuggestion(discogsMaster.main_release);
    } else {
        console.log("Error fetching main release price suggestion, no id returned from discogs.")
    }
    
    const discogsRatingResponse = await getRating(discogsMaster.main_release);
    if(discogsRatingResponse.rating!=undefined){
        ratingAverage = discogsRatingResponse.rating.average;
        ratingCount = discogsRatingResponse.rating.count
    } else {
        console.log("Error fetching rating, no ratings returned from discogs.");
    }

    if(discogsMaster.images[0]?.uri){
        imageUri = discogsMaster.images[0].uri
    } else {
         console.log("No image URI found");
    }

    try {
        const wikiResponse = await searchWiki(`${discogsMaster.title}, ${discogsMaster.artists[0].name}, album`);
        if (wikiResponse.results && wikiResponse.results.length > 0) {
            const wikiTitle = wikiResponse.results[0].title;
            wikiSource = (await getWikiSummary(wikiTitle)).extract;
        }
    } catch (error) {
        console.warn('Wikipedia lookup failed, continuing without summary:', error);
    }
   
    
    const findRecordResponse:ReleaseData = {
        image: imageUri,
        title: discogsMaster.title,
        artists: discogsMaster.artists.map(artist => artist.name),
        year: discogsMaster.year,
        noOfTracks: discogsMaster.tracklist.length,
        noForSale: discogsMaster.num_for_sale,
        originalPriceSuggestion: originalPriceSuggestion, // mainReleasePriceSuggestion,
        latestPriceSuggestion:0, // latestReleasePriceSuggestion,
        genres: discogsMaster.genres.concat(discogsMaster.styles),
        summary: wikiSource,
        rating: {count: ratingCount, average: ratingAverage},
    };

    revalidatePath("/");
    return findRecordResponse;
}