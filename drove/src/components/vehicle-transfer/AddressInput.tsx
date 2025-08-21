import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { LatLngCity } from "@/types/lat-lng-city";

const LIBRARIES: ("places")[] = ["places"];

interface Props {
  /** Valor controlado que _solo_ tiene sentido cuando hay lat/lng válidos   */
  value: LatLngCity;
  /** ÚNICO callback: envía address, city, lat y lng cuando los tiene */
  onChange: (v: LatLngCity) => void;
  placeholder?: string;
  id?: string;
}

export default function AddressInput({
  value,
  onChange,
  placeholder,
  id = "address-input",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  /* estado interno para el texto que escribe el usuario */
  const [text, setText] = useState(value.address);

  /* carga la API una sola vez */
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: LIBRARIES,
  });

  /* --------- emite datos completos al padre --------- */
  const emitPlaceData = useCallback(
    (place?: google.maps.places.PlaceResult | null) => {
      if (!place?.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || "";
      const city =
        place.address_components?.find((c) => c.types.includes("locality"))
          ?.long_name ?? "";

      onChange({ address, city, lat, lng });
      setText(address); // sincroniza el input con la dirección formateada
    },
    [onChange]
  );

  /* Autocomplete → place seleccionado */
  const handlePlaceChanged = useCallback(() => {
    emitPlaceData(acRef.current?.getPlace());
  }, [emitPlaceData]);

  /* inicializa Autocomplete una vez */
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    acRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode"],
        fields: ["formatted_address", "geometry", "address_components"],
      }
    );

    acRef.current.addListener("place_changed", handlePlaceChanged);

    return () => {
      if (acRef.current)
        window.google.maps.event.clearInstanceListeners(acRef.current);
    };
  }, [isLoaded, handlePlaceChanged]);

  /* input onChange SOLO actualiza el texto local */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    /* Si el usuario presiona Enter tras escribir una dirección completa
       Google rellena el 'place' y podemos emitirlo */
    emitPlaceData(acRef.current?.getPlace());
  };

  return (
    <Input
      id={id}
      ref={inputRef}
      value={text}
      onChange={handleInputChange}
      placeholder={placeholder}
      className="bg-transparent border-gray-700 text-white placeholder:text-white"
    />
  );
}
