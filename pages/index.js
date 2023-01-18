import { useEffect, useState } from "react";
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro'
import { useRouter } from 'next/router'

// Initialize an agent at application startup.
const fpPromise = FingerprintJS.load({
  apiKey: '<Your API Key Here>',
  region: 'ap'
})


export default function Home() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [visitorId, setVisitorId] = useState("")
  const [consent, setConsent] = useState(false)
  const router = useRouter()

  const fetchAllProducts = (onProductsFetched) => {
    fetch("/api/products")
      .then(res => res.json())
      .then(res => onProductsFetched(Object.values(res.data)))
  }

  const fetchRecommendations = (onRecommendationsFetched) => {

    if (visitorId) {
      fetch("/api/recommendations/" + visitorId)
        .then(res => res.json())
        .then(res => onRecommendationsFetched(Object.values(res.data)))
    } else {
      onRecommendationsFetched([])
    }
  }

  const fetchCart = (onCartFetched) => {
    if (visitorId) {
      fetch("/api/cart/" + visitorId)
        .then(res => res.json())
        .then(res => onCartFetched(Object.values(res.data)))
    } else {
      onCartFetched([])
    }
  }

  const fetchConsent = () => {
    if (visitorId) {
      fetch("/api/recommendations/" + visitorId + "/consent")
        .then(res => res.json())
        .then(res => setConsent(res.data.consent))
    }
  }

  const addProductToCart = (product) => {

    if (visitorId) {
      fetch("/api/cart/" + visitorId + "/add", {
        method: 'POST',
        headers: {
          Accept: 'application.json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: product.id }),
      })
    }

  }
  const clearCart = (onCartCleared) => {
    if (visitorId) {
      fetch("/api/cart/" + visitorId + "/clear")
        .then(res => res.json())
        .then(res => onCartCleared())
    } else {
      console.error("Cart could not be cleared")
    }

  }

  const registerPersonalizationConsent = (consent, onConsentRegistered) => {
    if (visitorId) {
      fetch("/api/recommendations/" + visitorId + "/consent/set", {
        method: 'POST',
        headers: {
          Accept: 'application.json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ consent }),
      }).then(() => onConsentRegistered())
    }
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

    fetchConsent()

  }, [visitorId])

  return (
    <div className="App">
      <div className={"StoreName"}>The Acme Store</div>
      {(cart.length !== 0 ? <div className="Cart">
        <h3>Your Cart</h3>
        <div className={"ProductsContainer"}>
          {cart.map(product => <Product key={product.id} product={product} />)}
        </div>
        <div className={"ProductsContainer"}>
          {(cart.length !== 0 ?
            <button className={"ClearCartButton"}
              onClick={() => clearCart(() => {
                setCart([])
                alert("Cart cleared")
              })}>Clear Cart</button>
            : <div />)}
        </div>
      </div> : <div />)}
      {(recommendations.length !== 0 ? <div className="Recommendations">
        <h3>You might like these</h3>
        <div className={"ProductsContainer"}>
          {recommendations.map(
            product => <Product key={product.id} product={product}
              addToCart={() => {
                setCart([...cart, product])
                addProductToCart(product)
              }} />)}
        </div>
      </div> : <div />)}
      <div className="Products">
        <h3>All Products</h3>
        <div className={"ProductsContainer"}>
          {products.map(
            product => <Product key={product.id} product={product}
              addToCart={() => {
                setCart([...cart, product])
                if (consent)
                  addProductToCart(product)
              }} />)}
        </div>
      </div>
      <div className={"ConsentForm"}>
        <label><input type="checkbox" checked={consent} onChange={
          (elem) => {
            setConsent(elem.target.checked)
            registerPersonalizationConsent(elem.target.checked, () => {
              router.reload(window.location.pathname)
            })
          }
        } />
          Enable recommendations</label>
      </div>
    </div>
  );
}

const Product = ({ product, addToCart }) => (
  <div className="Product">
    <img src={product.image} alt={product.title} />
    <div className={"ProductTitle"}>{product.title}</div>
    <div className="BottomRow">
      <div>{"$" + product.price}</div>
      <div>
        {(addToCart ?
          <button type={"button"} className={"AddToCartButton"} onClick={addToCart}>Add To Cart</button>
          : <div />)}
      </div>
    </div>
  </div>
)