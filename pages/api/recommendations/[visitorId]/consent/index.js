import db from "../../../../../utils/firebase"

// Retrieve personalization consent
export default async function handler(req, res) {

    // Extract visitor ID
    let { visitorId } = req.query

    // Retrieve consent value
    let consent = await (await db.ref('consent/' + visitorId).once('value')).val()

    // Sanitise value
    if (!consent) consent = false 
    else consent = true

    res.status(200).json({ data: { consent } })

}
