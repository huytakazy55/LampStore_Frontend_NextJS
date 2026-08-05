// Paged list endpoints return total count via the X-Total-Count response header; a few also
// echo it in the response body (bodyTotal). Until every backend endpoint reliably sends one of
// these, fall back to items.length — which undercounts whenever the list is actually paginated.
export function getTotalCount(response, items, bodyTotal) {
    if (bodyTotal !== undefined && bodyTotal !== null) return bodyTotal;
    const totalHeader = response.headers['x-total-count'];
    return totalHeader !== undefined ? Number(totalHeader) : items.length;
}
