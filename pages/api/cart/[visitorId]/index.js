import db from "../../../../utils/firebase"

// Fetch cart contents for visitor
export default async function handler(req, res) {

    // Extract the visitor ID
    let { visitorId } = req.query

    // Retrieve the cart of the given visitor ID
    let cartSnapshot = await db.ref('visitors/' + visitorId + '/cart').once("value")

    // If the cart is empty, return empty array
    if (!cartSnapshot.hasChildren()) {
        res.status(200).json({ data: [] })
        return
    }

    // Create a new array to store products
    let products = []

    // Retrieve the cart items from the visitor's cart
    let cartItems = cartSnapshot.val()


    if (cartItems) {
        // For each cart item, retrieve the product's details and store it in the products array
        for (let i = 0; i < Object.keys(cartItems).length; i++) {
            let product = Object.values(cartItems)[i]
            let productSnapshot = await db.ref('products/' + product.productId).once('value')
            products.push(productSnapshot.val())
        }
    }

    res.status(200).json({ data: products })
}
