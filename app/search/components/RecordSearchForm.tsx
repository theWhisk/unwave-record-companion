'use client';

import { ReleaseData, findRelease } from "@/app/search/search-service";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

interface LookUpFormProps {
    onRecordSearch: (findRecordResponse: ReleaseData) => void;
  }

  interface FormData {
    term: string;
  }

  export default function LookUpForm({onRecordSearch}: LookUpFormProps) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors }, setError } = useForm<FormData>({reValidateMode: 'onSubmit'});
  
    const onSubmit: SubmitHandler<FormData> = async (data) =>{

        if (!data.term.trim()) {
            setError("term", { type: "manual", message: "Search term is empty" });
            return;
        }

        setLoading(true);
        try {
            const response = await findRelease(data.term.trim());
            onRecordSearch(response);
        } catch (error) {
            setError("term", { type: "manual", message: "Couldn't find release" });
        }finally {
            setLoading(false);
        }
  
    };
  
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            
            <label htmlFor="search" className="label">
                <span className="label-text">Album Search</span>
                <span 
                    data-tooltip-id="tooltip" 
                    className="label-text-alt tooltip badge badge-secondary badge-outline" 
                    data-tooltip-content="Search by album title, artist, or both (eg. Abbey Road, or Abbey Road The Beatles)">
                        Help</span>
            </label>
            <div className="flex w-full space-x-2">
                <input 
                    id="search"
                    type="text" 
                    className="input input-bordered w-full" 
                    placeholder="Album name" 
                    {...register("term")} 
                />
                
                <button 
                    className="btn btn-primary flex items-center justify-center" 
                    type="submit"  
                >
                    {loading ? (
                        <span className="loading loading-spinner"></span>
                    ): (
                        <MagnifyingGlassIcon className="h-5 w-5" />
                    )}
                </button>
            </div>
                {errors.term && <p className="text-sm text-red-500">{errors.term.message}</p>}

        </form>
    );
  }