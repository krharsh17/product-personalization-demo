import db from "../../../../utils/firebase"

// Clear the cart of the given visitor
export default async function handler(req, res) {

    // Extract visitor ID
    let { visitorId } = req.query

    // Clear the cart of the given visitor ID
    await db.ref('visitors/' + visitorId + '/cart').set({})

    res.status(200).json({ data: "Cart cleared!" })

}
