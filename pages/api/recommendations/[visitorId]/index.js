import db from "../../../../utils/firebase"

// Fetch recommendations for visitor
export default async function handler(req, res) {

    // Extract visitor ID
    const { visitorId } = req.query

    // Retrieve the visitor's history
    let historySnapshot = await db.ref('visitors/' + visitorId + '/history').once("value")

    // If the history is empty, return empty array as response
    if (!historySnapshot.hasChildren()) {
        res.status(200).json({ data: [] })
        return
    }

    // Create a new array to store recommendations
    let recommendations = []

    // Extract history items
    let history = historySnapshot.val()

    if(history) {
        // For each history item, retrieve the product details and add it to the recommendations array
        for (let i=0; i<Object.keys(history).length; i++) {

            let recommendation = Object.values(history)[i]
            let productSnapshot = await db.ref('products/' + recommendation.productId).once('value')
            recommendations.push(productSnapshot.val())
    
        }
    }

    
    res.status(200).json({ data: recommendations })

}
