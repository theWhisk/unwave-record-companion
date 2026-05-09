'use client'

import Image from 'next/image';
import { ReleaseData } from '../search-service';
import StarRating from '@/components/StarRating';
import { Currency } from '@/types/currency';
import ConditionSlider from './ConditionSlider';

interface AlbumTileProps {
    findRecordResponse: ReleaseData
    selectedCurrency: Currency
  }

export default function AlbumTile(props: AlbumTileProps) {
    return (
        <><div className="card lg:card-side bg-base-100 shadow-xl">
            <figure>
                {<Image src={props.findRecordResponse.image} alt={`Album art for ${props.findRecordResponse.title}`} width={600} height={600} style={{width: '100%', height: 'auto'}}/>}
            </figure>

            <div className="card-body">
                <h2 className="card-title">{props.findRecordResponse.title}</h2>
                <p className="text-sm">by {props.findRecordResponse.artists}</p>
                <div className="stats">
                    <div className="stat">
                        <div className="stat-title">First released in</div>
                        <div className="stat-value text-indigo-800">{props.findRecordResponse.year}</div>
                    </div>
                </div>
                <ConditionSlider
                    conditionValues={props.findRecordResponse.originalPriceSuggestion}
                    selectedCurrency={props.selectedCurrency}
                />
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
