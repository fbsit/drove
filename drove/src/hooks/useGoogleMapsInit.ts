
import { useState, useEffect, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useToast } from '@/hooks/use-toast';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

type Library = 'drawing' | 'geometry' | 'places' | 'visualization';
type Libraries = Library[];

const libraries: Libraries = ['places'];

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export const GOOGLE_MAPS_OPTIONS = {
  id: 'google-map-script',
  googleMapsApiKey: GOOGLE_MAPS_API_KEY!,
  libraries,
  language: 'es',
  region: 'ES'
};

export const useGoogleMapsInit = () => {
  const { toast } = useToast();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isApiBlocked, setIsApiBlocked] = useState(false);
  const retryCount = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const hasShownToast = useRef(false);

  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_OPTIONS);

  const initializePlaces = async () => {
    try {
      // Comprobar si Google y Maps están definidos
      if (typeof window === 'undefined' || !window.google || !window.google.maps || !window.google.maps.places) {
        throw new Error('Servicio de lugares no disponible');
      }
      
      setIsReady(true);
      setError(null);
      retryCount.current = 0;
      
    } catch (err) {
      console.error('Error al inicializar Places API:', err);
      
      // Intentar detectar si es un error de referrer o de Google no definido
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage.includes('RefererNotAllowed') || 
          errorMessage.includes('MapsRequestError') || 
          (loadError && String(loadError).includes('RefererNotAllowed')) ||
          (loadError && String(loadError).includes('MapsRequestError')) ||
          !window.google ||
          !window.google.maps) {
        
        setIsApiBlocked(true);
        setError('Error de acceso a la API de Google Maps. Por favor, ingresa las direcciones manualmente.');
        
        if (!hasShownToast.current) {
          toast({
            variant: "default",
            title: "Google Maps no disponible",
            description: "El servicio de mapas no está disponible. Se utilizará un cálculo estimado para el precio.",
          });
          hasShownToast.current = true;
        }
        setIsInitializing(false);
        return;
      }
      
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        retryTimeoutRef.current = setTimeout(initializePlaces, RETRY_DELAY);
        return;
      }

      setError('El servicio de direcciones está temporalmente no disponible.');
      
      if (!hasShownToast.current) {
        toast({
          variant: "default",
          title: "Servicio no disponible",
          description: "Se utilizará un cálculo estimado para el precio.",
        });
        hasShownToast.current = true;
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    // Comprobamos si Google está definido globalmente
    if (typeof window !== 'undefined' && !window.google) {
      setIsApiBlocked(true);
      setError('La API de Google Maps no está disponible.');
      setIsInitializing(false);
      
      if (!hasShownToast.current) {
        toast({
          variant: "default",
          title: "Google Maps no disponible",
          description: "El servicio de mapas no está disponible. Se utilizará un cálculo estimado para el precio.",
        });
        hasShownToast.current = true;
      }
      return;
    }

    if (loadError) {
      console.error('Error al cargar Google Maps:', loadError);
      
      // Detectar si es un error de referrer
      if (String(loadError).includes('RefererNotAllowed') || String(loadError).includes('MapsRequestError')) {
        setIsApiBlocked(true);
        setError('Error de acceso a la API de Google Maps. Por favor, ingresa las direcciones manualmente.');
      } else {
        setError('Servicio de mapas no disponible temporalmente.');
      }
      
      if (!hasShownToast.current) {
        toast({
          variant: "default",
          title: "Google Maps no disponible",
          description: "El servicio de mapas no está disponible. Se utilizará un cálculo estimado para el precio.",
        });
        hasShownToast.current = true;
      }
      
      setIsInitializing(false);
      return;
    }

    if (!isLoaded) {
      return;
    }

    initializePlaces();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isLoaded, loadError, toast]);

  return { 
    isReady, 
    error, 
    isApiBlocked,
    isLoading: isInitializing || (!isLoaded && !loadError)
  };
};
