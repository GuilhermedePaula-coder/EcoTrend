import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("eco_cart")) || []
  );
  const [filters, setFilters] = useState({ category: "all", price: 5000 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true); // loading produtos
  const [checkoutLoading, setCheckoutLoading] = useState(false); // loading checkout

  // Carrega JSON de produtos
  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Salva carrinho no localStorage
  useEffect(() => {
    localStorage.setItem("eco_cart", JSON.stringify(cart));
  }, [cart]);

  // Adiciona produto ao carrinho
  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === product.id);
      if (found) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  // Aplica filtros
  const filtered = products.filter(
    (p) =>
      (filters.category === "all" || p.category === filters.category) &&
      p.price <= filters.price
  );

  // Checkout simulado
  const checkout = async () => {
    setCheckoutLoading(true);
    setMessage("Processando...");
    try {
      await new Promise((res) => setTimeout(res, 1500)); // simula API
      setMessage("Compra realizada com sucesso!");
      setCart([]);
    } catch {
      setMessage("Erro ao processar compra.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div>
      <header>
        <h1>EcoTrend</h1>
        <button onClick={() => setSidebarOpen(true)}>🛒 Carrinho</button>
      </header>

      {/* Filtros */}
      <section id="filters">
        <label>
          Categoria:
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((f) => ({ ...f, category: e.target.value }))
            }
          >
            <option value="all">Todos</option>
            {[...new Set(products.map((p) => p.category))].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Preço até:
          <input
            type="range"
            min="0"
            max="5000"
            value={filters.price}
            onChange={(e) =>
              setFilters((f) => ({ ...f, price: Number(e.target.value) }))
            }
          />
          <span>{filters.price}</span>
        </label>
      </section>

      {/* Lista de produtos */}
      <main className="products">
        {loading ? (
          <div className="spinner">
            <div className="loader"></div>
          </div>
        ) : (
          filtered.map((p) => (
  <div className="product" key={p.id}>
    <img 
      src={p.image} 
      alt={p.name} 
      style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "8px" }}
    />
    <h3>{p.name}</h3>
    <p>{p.category}</p>
    <p>R$ {p.price.toFixed(2)}</p>
    <button onClick={() => addToCart(p)}>Adicionar</button>
  </div>
))
        )}
      </main>

      {/* Sidebar do carrinho */}
      <aside className={`cartSidebar ${sidebarOpen ? "show" : ""}`}>
        <button onClick={() => setSidebarOpen(false)}>X</button>
        <h2>Seu Carrinho</h2>
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              {item.name} ({item.qty}x) - R${" "}
              {(item.price * item.qty).toFixed(2)}
              <button onClick={() => removeFromCart(item.id)}>Remover</button>
            </li>
          ))}
        </ul>
        <p>Total: R$ {total.toFixed(2)}</p>
        <button onClick={checkout} disabled={checkoutLoading}>
          {checkoutLoading ? "Finalizando..." : "Finalizar Compra"}
        </button>
        <p>{message}</p>
      </aside>
    </div>
  );
}
