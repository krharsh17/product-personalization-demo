import db from "../../../../../utils/firebase"

// Record personalization consent
export default async function handler(req, res) {

    // Extract visitor ID
    let { visitorId } = req.query

    // Extract consent input value
    const consent = req.body.consent

    // If the user has provided consent, store it in the database.
    // If the user has revoked consent, delete their consent and visitor
    // data from the database
    if (consent === true) {
        await db.ref('consent/' + visitorId).set({consent})
    } else {
        await db.ref('consent/' + visitorId).remove()
        await db.ref('visitors/' + visitorId).remove()
    }

    res.status(200).json({ data: "Consent registered" })

}
