"use server"

import { revalidatePath } from "next/cache";
import { log, flushAxiom } from "@/libs/axiom-logger";
import { searchDiscogs, getDiscogsMasterRelease, getPriceSuggestion, getRating } from "@/libs/discogs";
import { getWikiSummary, searchWiki } from "@/libs/wiki";
import { ConditionValues, DiscogsMaster } from "@/types/discogs";

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
    };
}

export async function findRelease(query: string): Promise<ReleaseData> {
  try {
    log.info('findRelease started', { query });

    const type = "release";
    const format = "vinyl,album";
    let originalPriceSuggestion: ConditionValues | null = null;
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
    log.info('discogs search complete', { resultCount: searchResponse.results.length });

    if (!discogsMaster) {
        throw new Error("No valid master ID found in search results");
    }

    if (discogsMaster.main_release) {
        originalPriceSuggestion = await getPriceSuggestion(discogsMaster.main_release);
    } else {
        log.info('skipping price suggestion, no main_release', { masterId: discogsMaster.id });
    }

    const discogsRatingResponse = await getRating(discogsMaster.main_release);
    if (discogsRatingResponse.rating != undefined) {
        ratingAverage = discogsRatingResponse.rating.average;
        ratingCount = discogsRatingResponse.rating.count;
    } else {
        log.info('no rating returned from discogs', { releaseId: discogsMaster.main_release });
    }

    if (discogsMaster.images[0]?.uri) {
        imageUri = discogsMaster.images[0].uri;
    } else {
        log.info('no image uri found', { masterId: discogsMaster.id });
    }

    try {
        const wikiResponse = await searchWiki(`${discogsMaster.title}, ${discogsMaster.artists[0].name}, album`);
        if (wikiResponse.results && wikiResponse.results.length > 0) {
            const wikiTitle = wikiResponse.results[0].title;
            wikiSource = (await getWikiSummary(wikiTitle)).extract;
        }
    } catch (error) {
        log.warn('wikipedia lookup failed, continuing without summary', { error });
    }

    const findRecordResponse: ReleaseData = {
        image: imageUri,
        title: discogsMaster.title,
        artists: discogsMaster.artists.map(artist => artist.name),
        year: discogsMaster.year,
        noOfTracks: discogsMaster.tracklist.length,
        noForSale: discogsMaster.num_for_sale,
        originalPriceSuggestion: originalPriceSuggestion,
        latestPriceSuggestion: 0,
        genres: discogsMaster.genres.concat(discogsMaster.styles),
        summary: wikiSource,
        rating: { count: ratingCount, average: ratingAverage },
    };

    revalidatePath("/");
    log.info('findRelease complete', { title: discogsMaster.title });
    return findRecordResponse;
  } finally {
    await flushAxiom();
  }
}
