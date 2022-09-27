import './App.css';
import {initializeApp} from "firebase/app";
import {getDatabase, ref, onValue, set} from "firebase/database";
import {useEffect, useState} from "react";
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro'

const firebaseConfig = {
    apiKey: "AIzaSyAWzi9dW28pQjiojfRuaEcSn6vXYT0iiio",
    authDomain: "product-personalization-43b45.firebaseapp.com",
    databaseURL: "https://product-personalization-43b45-default-rtdb.firebaseio.com",
    projectId: "product-personalization-43b45",
    storageBucket: "product-personalization-43b45.appspot.com",
    messagingSenderId: "567722322798",
    appId: "1:567722322798:web:87b010896da653ebf5af7f"
};

// Initialize firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(firebaseApp);

// Initialize an agent at application startup.
const fpPromise = FingerprintJS.load({
    apiKey: 'UBolKNn2WVRwxoeE4vYP',
    region: 'ap'
})

function App() {

    const [products, setProducts] = useState([])
    const [cart, setCart] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [visitorId, setVisitorId] = useState("")

    const fetchAllProducts = (onProductsFetched) => {
        onValue(ref(database, 'products'), snapshot => {
            onProductsFetched(snapshot.val())
        })
    }

    const fetchRecommendations = (onRecommendationsFetched) => {
        onValue(ref(database, 'visitors/' + visitorId + '/history'), historySnapshot => {
            let recommendations = []
            let recommendationsCount = 0
            historySnapshot.forEach(recommendationSnapshot => {
                recommendationsCount += 1

                onValue(ref(database, 'products/' + recommendationSnapshot.val().productId), productSnapshot => {
                    recommendations.push(productSnapshot.val())

                    if (recommendations.length === recommendationsCount)
                        onRecommendationsFetched(recommendations)
                })
            })
        })
    }

    const fetchCart = (onCartFetched) => {
        onValue(ref(database, 'visitors/' + visitorId + '/cart'), cartSnapshot => {
            let products = []
            let productsCount = 0
            cartSnapshot.forEach(cartItemSnapshot => {
                productsCount += 1

                onValue(ref(database, 'products/' + cartItemSnapshot.val().productId), productSnapshot => {
                    products.push(productSnapshot.val())

                    if (products.length === productsCount)
                        onCartFetched(products)
                })
            })
        })
    }

    const addProductToCart = (product) => {
        let productObj = {
            timestamp: Date.now(),
            productId: product.id
        }
        set(ref(database, 'visitors/' + visitorId + '/history/' + product.id), productObj)
            .then(() => {
                set(ref(database, 'visitors/' + visitorId + '/cart/' + product.id), productObj)
                    .then(() => console.log("Product added to cart"))
            });
    }

    const clearCart = (onCartCleared) => {
        set(ref(database, 'visitors/' + visitorId + '/cart'), {})
            .then(onCartCleared)
    }

    useEffect(() => {
        fpPromise
            .then(fp => fp.get())
            .then(result => setVisitorId(result.visitorId))

        fetchAllProducts((products) => {
            setProducts(products)
        })

    }, [])

    useEffect(() => {

        fetchRecommendations((recommendations) => {
            setRecommendations(recommendations || [])
        })

        fetchCart((products) => {
            setCart(products || [])
        })

    }, [visitorId])

    return (
        <div className="App">
            <div className={"StoreName"}>The Acme Store</div>
            {(cart.length !== 0 ? <div className="Cart">
                <h3>Your Cart</h3>
                <div className={"ProductsContainer"}>
                    {cart.map(product => <Product key={product.id} product={product}/>)}
                </div>
                <div className={"ProductsContainer"}>
                    {(cart.length !== 0 ?
                        <button className={"ClearCartButton"}
                                onClick={() => clearCart(() => {
                                    setCart([])
                                    alert("Cart cleared")
                                })}>Clear Cart</button>
                        : <div/>)}
                </div>
            </div> : <div/>)}
            {(recommendations.length !== 0 ? <div className="Recommendations">
                <h3>You might like these</h3>
                <div className={"ProductsContainer"}>
                    {recommendations.map(
                        product => <Product key={product.id} product={product}
                                            addToCart={() => {
                                                setCart([...cart, product])
                                                addProductToCart(product)
                                            }}/>)}
                </div>
            </div> : <div/>)}
            <div className="Products">
                <h3>All Products</h3>
                <div className={"ProductsContainer"}>
                    {products.map(
                        product => <Product key={product.id} product={product}
                                            addToCart={() => {
                                                setCart([...cart, product])
                                                addProductToCart(product)
                                            }}/>)}
                </div>
            </div>
        </div>
    );
}

const Product = ({product, addToCart}) => (
    <div className="Product">
        <img src={product.image} alt={product.title}/>
        <div className={"ProductTitle"}>{product.title}</div>
        <div className="BottomRow">
            <div>{"$" + product.price}</div>
            <div>
                {(addToCart !== undefined ?
                    <button type={"button"} className={"AddToCartButton"} onClick={addToCart}>Add To Cart</button>
                    : <div/>)}
            </div>
        </div>
    </div>
)

export default App;
