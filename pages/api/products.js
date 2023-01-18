import db from "../../utils/firebase"

// Retrieve all products
export default async function handler(req, res) {

    let snapshot = await db.ref('products').once("value")

    res.status(200).json({ data: snapshot.val() })

}
