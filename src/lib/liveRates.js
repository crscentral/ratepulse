// Live rate-fetching layer. Currently calls a Supabase Edge Function
// (`fetch-live-rates`) that proxies to a rate-data provider (e.g. SerpApi's
// Google Hotels API). Until a provider API key is configured as a Supabase
// secret, the Edge Function returns { unavailable: true } and callers
// should fall back to seed data.
//
// See supabase/functions/fetch-live-rates/index.ts for the provider call,
// and the README for how to activate it once you have an API key.

import { supabase } from "./supabaseClient";
import { useRef, useState, useCallback } from "react";

export async function fetchLiveRates({ propertyId, hotelName, city }) {
  try {
    const { data, error } = await supabase.functions.invoke("fetch-live-rates", {
      body: { propertyId, hotelName, city },
    });
    if (error || !data || data.unavailable) {
      return { live: false, rates: null };
    }
    return { live: true, rates: data.rates };
  } catch (e) {
    return { live: false, rates: null };
  }
}

export async function fetchLiveParity({ hotelName, city }) {
  try {
    const { data, error } = await supabase.functions.invoke("fetch-parity-rates", {
      body: { hotelName, city },
    });
    if (error || !data || data.unavailable) {
      return { live: false, referenceRate: null, channels: null };
    }
    return { live: true, referenceRate: data.referenceRate, channels: data.channels };
  } catch (e) {
    return { live: false, referenceRate: null, channels: null };
  }
}

// Manual-refresh hook for Rate Parity — same pattern as useLiveRates: no
// automatic fetching, only calls the API when refresh() is invoked.
export function useLiveParity({ hotelName, city, fallback }) {
  const [state, setState] = useState({ live: false, channels: fallback, loading: false });
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const result = await fetchLiveParity({ hotelName, city });
    if (!mounted.current) return;
    setState({
      live: result.live,
      channels: result.live ? result.channels : fallback,
      referenceRate: result.referenceRate,
      loading: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelName, city]);

  return { ...state, refresh };
}

export function useLiveRates({ propertyId, hotelName, city, fallback }) {
  const [state, setState] = useState({ live: false, rates: fallback, lastUpdated: null, loading: false });
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const result = await fetchLiveRates({ propertyId, hotelName, city });
    if (!mounted.current) return;
    setState({
      live: result.live,
      rates: result.live ? result.rates : fallback,
      lastUpdated: new Date(),
      loading: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, hotelName, city]);

  return { ...state, refresh };
}
