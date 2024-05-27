'use client'

import React, { useEffect, useState } from "react";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";


export default () => {
    const{
        placesService,
        placePredictions,
        getPlacePredictions,
        isPlacePredictionsLoading,
    } = usePlacesService({
        apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY
    });

    useEffect(() => {
        if (placePredictions.length){
            console.log(placePredictions);
        }
    }, [placePredictions]);

}

