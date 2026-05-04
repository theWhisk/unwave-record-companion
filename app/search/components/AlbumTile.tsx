'use client'

import Image from 'next/image';
import { ReleaseData } from '../search-service';
import StarRating from '@/components/StarRating';
import { useCurrency } from '@/app/currency-provider';
import { Currency, currencyOptions } from '@/types/currency';
import { Condition } from '@/types/discogs';

interface AlbumTileProps {
    findRecordResponse: ReleaseData
    selectedCurrency: Currency
  }

export default function AlbumTile(props: AlbumTileProps) {

    const { rates } = useCurrency();
    
    const mintPrice = props.findRecordResponse.originalPriceSuggestion[Condition.Mint].value;
    const goodPrice = props.findRecordResponse.originalPriceSuggestion[Condition.VeryGood].value;

    const convertedMintPrice : number = (mintPrice * rates[props.selectedCurrency]);
    const convertedGoodPrice : number = (goodPrice * rates[props.selectedCurrency]);

    const currencySymbol = currencyOptions[props.selectedCurrency].symbol;

    return (
        <><div className="card lg:card-side bg-base-100 shadow-xl">
            <figure>
                {/* Album art */}
                {<Image src={props.findRecordResponse.image} alt={`Album art for ${props.findRecordResponse.title}`} width={600} height={600} style={{width: '100%', height: 'auto'}}/>}
            </figure>

            <div className="card-body">
                {/* Album details */}
                <h2 className="card-title">{props.findRecordResponse.title}</h2>
                <p className="text-sm">by {props.findRecordResponse.artists}</p>
                <div className="stats">
                    <div className="stat">
                        <div className="stat-title">First released in</div>
                        <div className="stat-value text-indigo-800">{props.findRecordResponse.year}</div>
                    </div>
                </div>
                <p className='text-center'>
                    <span className="text-lg font-bold">
                        {currencySymbol}{Math.round(convertedGoodPrice)}-{currencySymbol}{Math.round(convertedMintPrice)}
                    </span><br />
                    <span className='text-xs text-gray-500'>
                        For an original copy
                    </span>
                </p>
                <StarRating average={props.findRecordResponse.rating.average} count={props.findRecordResponse.rating.count} />

                <div className="flex flex-wrap justify-center gap-5">
                    {props.findRecordResponse.genres.map((genre, index) => (
                        <span className="badge badge-success gap-2" key={index}>{genre}</span>
                    ))}
                </div>
            </div>
        </div>
        <div className="mt-4">
            {props.findRecordResponse.summary && <p>{props.findRecordResponse.summary}</p>}
        </div></>
    
    )
}
