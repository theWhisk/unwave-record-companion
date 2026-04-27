'use client'

import  React,  { useState } from "react";
import AlbumTile from "@/app/search/components/AlbumTile";
import LookUpForm from "@/app/search/components/RecordSearchForm";
import CameraButton from "@/app/search/components/CameraButton";
import { ReleaseData } from "./search-service";
import { CurrencySelector } from "@/components/CurrencySelector";
import { Currency, currencyOptions } from "@/types/currency";


export default function Search() {

  const [findRecordResponse, setRecordResponse] = useState<ReleaseData>();
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(Currency.USD);


  const handleRecordSearch = (findRecordResponse: ReleaseData) => {
      setRecordResponse(findRecordResponse);
      setSearchAttempted(true);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8 flex justify-end"> 
        <CurrencySelector onCurrencyChange={handleCurrencyChange} />
      </section>
      <section className="max-w-xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">Crate Mole</h1>
        This nifty little search is a companion for record collectors, to be used in the real world, just to allow you to dig those crates a little deeper.
        <LookUpForm onRecordSearch={handleRecordSearch} />
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-base-300" />
          <span className="text-sm text-base-content/50">or</span>
          <div className="flex-1 border-t border-base-300" />
        </div>
        <CameraButton onRecordSearch={handleRecordSearch} />
        {searchAttempted && (
          <AlbumTile 
            findRecordResponse={findRecordResponse} 
            selectedCurrency={selectedCurrency}/>
        )}
      </section>
    </main>
  );
}