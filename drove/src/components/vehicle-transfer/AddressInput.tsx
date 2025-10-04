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
  const onChangeRef = useRef(onChange);

  /* estado interno para el texto que escribe el usuario */
  const [text, setText] = useState(value.address);
  const [placeSelected, setPlaceSelected] = useState(false);

  /* carga la API una sola vez */
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: LIBRARIES,
  });

  /* sincroniza texto si el valor externo cambia */
  useEffect(() => {
    setText(value.address);
  }, [value.address]);

  /* mantiene onChange estable vía ref para evitar recrear listeners */
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /* --------- emite datos completos al padre --------- */
  const emitPlaceData = useCallback(
    (place?: google.maps.places.PlaceResult | null) => {
      if (!place?.geometry?.location) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || "";
      const components = place.address_components || [];
      const get = (type: string) => components.find((c) => c.types.includes(type))?.long_name || '';
      // City with robust fallbacks across countries
      const preferredTypes = [
        'locality',
        'postal_town',
        'administrative_area_level_3',
        'administrative_area_level_2',
        'sublocality_level_1',
        'sublocality',
        'neighborhood',
      ];
      let city = '';
      const cityComp1 = components.find(c => (c.types || []).some(t => preferredTypes.includes(t)));
      if (cityComp1) city = cityComp1.long_name || '';
      const state = get('administrative_area_level_1');
      // Country puede venir en diferentes posiciones; usa long_name si existe, si no short_name
      const countryComp = components.find((c) => c.types.includes('country')) as any;
      const country = countryComp?.long_name || countryComp?.short_name || '';
      const zip = get('postal_code') || get('postal_code_prefix') || '';

      if (!city) {
        // Heurística: tomar el token antes del CP/provincia si viene separado por comas
        const parts = address.split(',').map(s => s.trim());
        // Busca una parte que contenga el CP y usa la anterior como ciudad
        const idxZip = parts.findIndex(p => /\b\d{5}\b/.test(p));
        if (idxZip > 0) city = parts[idxZip - 1];
        else if (parts.length >= 2) city = parts[parts.length - 2];
      }

      // Último recurso: primer componente político que no sea state ni country
      if (!city) {
        const fallback = components.find(c =>
          c.long_name && c.long_name !== state && c.long_name !== country && (c.types || []).includes('political')
        );
        if (fallback) city = fallback.long_name;
      }

      // Si aún no hay ciudad, usa el primer componente legible
      if (!city && components.length > 0) {
        city = components[0].long_name || '';
      }

      const payload = { address, city, state, country, zip, lat, lng };
      onChangeRef.current(payload as any);
      setPlaceSelected(true);
      setText(address); // sincroniza el input con la dirección formateada
    },
    []
  );

  /* Autocomplete → place seleccionado */
  const handlePlaceChanged = useCallback(() => {
    emitPlaceData(acRef.current?.getPlace());
  }, [emitPlaceData]);

  /* inicializa Autocomplete una vez */
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !(window as any)?.google?.maps?.places) return;

    // Evita recrear Autocomplete si ya existe para este input
    if (!acRef.current) {
      acRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["geocode"],
          fields: ["formatted_address", "geometry", "address_components"],
        }
      );
      acRef.current.addListener("place_changed", handlePlaceChanged);
    }

    return () => {
      if (acRef.current) {
        window.google.maps.event.clearInstanceListeners(acRef.current);
        // no eliminamos la instancia para mantener el listener estable mientras el input viva
      }
    };
  }, [isLoaded, handlePlaceChanged]);

  /* input onChange SOLO actualiza el texto local */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    const typed = e.target.value || "";
    // Permitir borrar completamente el campo
    if (typed.trim() === "") {
      setPlaceSelected(false);
      onChangeRef.current({ address: "", city: "", lat: 0, lng: 0 } as any);
      return;
    }
    // Fallback: sin Google Places, propaga el texto como dirección simple mientras escribe
    if (!acRef.current) {
      onChangeRef.current({ address: typed.trim(), city: value.city || "", lat: value.lat || 0, lng: value.lng || 0 } as any);
    }
  };

  /* Tecla Enter/Tab: forzar emisión del place actual si existe */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === 'Tab') && acRef.current) {
      // Google actualiza el place async; usa microtask
      setTimeout(() => emitPlaceData(acRef.current?.getPlace()), 0);
    }
  };

  /* Blur: si hay un place válido, emitirlo; si no, fallback a texto */
  const handleBlur = () => {
    const place = acRef.current?.getPlace();
    if (place?.geometry?.location) {
      emitPlaceData(place);
      return;
    }
    if (!placeSelected) {
      const typed = (text || "").trim();
      if (typed) {
        onChangeRef.current({ address: typed, city: value.city || "", lat: value.lat || 0, lng: value.lng || 0 } as any);
      }
    }
  };

  return (
    <Input
      id={id}
      ref={inputRef}
      value={text}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      className="bg-transparent border-gray-700 text-white placeholder:text-white"
    />
  );
}
