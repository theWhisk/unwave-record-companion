export interface DiscogsRatingResponse{
    rating: {
        count: number;
        average: number;
    }
}

export interface DiscogsPaginatedSearchResult {
    pagination: {
      page: number;
      pages: number;
      per_page: number;
      items: number;
      urls: Record<string, string>;
    };
    results: DiscogsItem[];
  }

export interface DiscogsItem {
    country: string;
    year: string;
    format: string[];
    label: string[];
    type: string;
    genre: string[];
    style: string[];
    id: number;
    barcode: string[];
    user_data: {
      in_wantlist: boolean;
      in_collection: boolean;
    };
    master_id: number;
    master_url: string;
    uri: string;
    catno: string;
    title: string;
    thumb: string;
    cover_image: string;
    resource_url: string;
    community: {
      want: number;
      have: number;
    };
    format_quantity: number;
    formats: DiscogsFormat[];
}
  
interface DiscogsFormat {
    name: string;
    qty: string;
    descriptions: string[];
}

interface Image {
    type: string;
    uri: string;
    resource_url: string;
    uri150: string;
    width: number;
    height: number;
}
  
interface Track {
    position: string;
    type_: string;
    title: string;
    extraartists: any[]; // Adjust this if more details on `extraartists` are needed
    duration: string;
}
  
interface Artist {
    name: string;
    anv: string;
    join: string;
    role: string;
    tracks: string;
    id: number;
    resource_url: string;
    thumbnail_url: string;
}
  
interface Video {
    uri: string;
    title: string;
    description: string | null;
    duration: number;
    embed: boolean;
}
  
export interface DiscogsMaster {
    id: number;
    main_release: number;
    most_recent_release: number;
    resource_url: string;
    uri: string;
    versions_url: string;
    main_release_url: string;
    most_recent_release_url: string;
    num_for_sale: number;
    lowest_price: number;
    images: Image[];
    genres: string[];
    styles: string[];
    year: number;
    tracklist: Track[];
    artists: Artist[];
    title: string;
    data_quality: string;
    videos: Video[];
}

export enum Condition {
    Mint = 'Mint (M)',
    NearMint = 'Near Mint (NM or M-)',
    VeryGoodPlus = 'Very Good Plus (VG+)',
    VeryGood = 'Very Good (VG)',
    GoodPlus = 'Good Plus (G+)',
    Good = 'Good (G)',
    Fair = 'Fair (F)',
    Poor = 'Poor (P)',
}

export type ConditionValues = {
    [condition in Condition]: {
        currency: string;
        value: number;
    };
};

export interface IdentifyResponse {
    query: string;
    condition: string | null;
}