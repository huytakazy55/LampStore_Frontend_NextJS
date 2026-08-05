// The .NET backend wraps collection responses as OData-style { $values: [...] } in some
// endpoints and returns a plain array in others. Every call site needs to handle both shapes.
export function unwrapValues(value) {
    return value?.$values || value || [];
}
