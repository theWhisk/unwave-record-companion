import { NextResponse } from "next/server";

let rates: { [currency: string]: number } | null = null;
let cacheTimestamp: number | null = null;

export async function GET(_req: Request) {
    const now = Date.now();
    
    if (rates && cacheTimestamp && now - cacheTimestamp < Number(process.env.EXCHANGE_RATE_CACHE_DURATION)) {
        console.log("Using cached exchange rates...");
        return NextResponse.json(
            rates, {status: 200})
    }

    try{
        console.log("Fetching exchange rates...");
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`);   
        rates = (await response.json()).conversion_rates;
        cacheTimestamp = now;
        return NextResponse.json(
            rates, {status: 200});
    } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        return NextResponse.json(
            {error: "Failed to fetch exchange rates"}, { status: 500 });
    }
}