import db from "../../../../utils/firebase"

// Add products to cart
export default async function handler(req, res) {
    // Extract visitor ID
    let { visitorId } = req.query

    // Extract product ID
    const productId = req.body.productId

    // Create database object for the product
    const productObj = {
        timestamp: Date.now(),
        productId: productId
    }

    // Store the product object in history and cart
    await db.ref('visitors/' + visitorId + '/history/' + productId).set(productObj)
    await db.ref('visitors/' + visitorId + '/cart/' + productId).set(productObj)
    

    res.status(200).json({ data: "Product added to cart" })

}
