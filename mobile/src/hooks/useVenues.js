import { useCallback } from "react";
import * as venueApi from "../api/venueApi";
import useFetch from "./useFetch";
import usePaginatedList from "./usePaginatedList";

// Domain hooks: screens ask for "venues", not for URLs and pages.

// Public search. `filters` should be memoized (useMemo) by the caller.
export const useVenues = (filters) => {
    const fetchPage = useCallback((page) => venueApi.getVenues({ ...filters, page }), [filters]);
    return usePaginatedList(fetchPage);
};

// The signed-in owner's venues, in every status.
export const useMyVenues = () => {
    const fetchPage = useCallback((page) => venueApi.getMyVenues({ page }), []);
    return usePaginatedList(fetchPage);
};

export const useVenue = (id) => {
    const fetchVenue = useCallback(() => venueApi.getVenue(id), [id]);
    return useFetch(fetchVenue);
};
