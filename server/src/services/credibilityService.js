import { fetchNewsData, fetchGoogleRss } from "./newsService.js";
import { extractClaims } from "./groqService.js";

export async function scoreCredibility(articleText, sourceTitle) {

    const claimResponse = await extractClaims(articleText);

    let claims = [];

    if (
        claimResponse &&
        claimResponse.output &&
        Array.isArray(claimResponse.output)
    ) {
        claims = claimResponse.output;
    }

    const query =
        sourceTitle || articleText.substring(0, 120);

    const related = await fetchNewsData(query);

    const fallback = await fetchGoogleRss(query);

    const evidenceCount =
        related.length + fallback.length;

    const matchedClaims = claims.filter(function(claim) {

        return (
            claim &&
            claim.text &&
            claim.text.length > 20
        );

    }).length;

    const crossAgreement = Math.min(
        1,
        evidenceCount / 8
    );

    const trustedDomains = [
        "reuters.com",
        "bbc.com",
        "apnews.com",
        "cnn.com"
    ];

    const trustedArticles = related.filter(function(item) {

        if (!item || !item.link) {
            return false;
        }

        return trustedDomains.some(function(domain) {
            return item.link.includes(domain);
        });

    });

    const reputation = Math.max(
        0.2,
        Math.min(
            1,
            trustedArticles.length / 3
        )
    );

    const score = Math.round(

        (
            (0.25 * crossAgreement) +
            (0.25 * reputation) +
            (0.25 * Math.min(1, matchedClaims / 6)) +
            (0.25 * 0.75)

        ) * 100

    );

    const confidence = Math.round(

        (
            (0.6 * reputation) +
            (0.4 * Math.min(1, evidenceCount / 12))

        ) * 100

    );

    return {

        credibility: score,

        confidence: confidence,

        reasons: [

            "Extracted " + claims.length + " claims from the article",

            "Found " + related.length + " related trusted-source articles",

            "Cross-source agreement score is " +
            (crossAgreement * 100).toFixed(0) +
            "%",

            "Reputation-weighted evidence quality is " +
            (reputation * 100).toFixed(0) +
            "%"

        ],

        evidence: {

            related: related.slice(0, 5),

            fallback: fallback.slice(0, 5)

        }

    };

}