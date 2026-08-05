// JSON.stringify does not escape "</script>", so embedding it via dangerouslySetInnerHTML
// lets a "</script><script>...</script>" value (e.g. a product/news title) break out of the
// JSON-LD block and inject a live script. Escaping "<" to its unicode form neutralizes that
// while staying valid inside a <script type="application/ld+json"> body.
export function stringifyJsonLd(data) {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}
