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
  const [loading, setLoading] = useState(true);

  // Modal produto
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Checkout
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: "",
    address: "",
    payment: "pix",
    installments: 1,
  });
  const [finalTotal, setFinalTotal] = useState(0);

  // Carrega JSON de produtos
  useEffect(() => {
    // Substitua a URL abaixo pela URL do seu arquivo JSON no GitHub Pages
    // Exemplo: 'https://seunome.github.io/seu-repositorio/products.json'
    fetch("https://raw.githubusercontent.com/EnzoFerreira-lab/produtos/refs/heads/main/produtos.json")
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
    setSelectedProduct(null);
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
  const checkout = async (e) => {
    e.preventDefault();

    // Adiciona uma verificação para o carrinho vazio
    if (cart.length === 0) {
      setMessage("O carrinho está vazio. Adicione produtos para continuar.");
      return; // Interrompe a função aqui
    }

    if (!checkoutData.name || !checkoutData.address) {
      setMessage("Preencha todos os campos do checkout!");
      return;
    }
    setCheckoutLoading(true);
    setMessage("Processando...");
    try {
      await new Promise((res) => setTimeout(res, 1500));
      setMessage("Compra realizada com sucesso!");
      setFinalTotal(total);
      setCart([]);
      setCheckoutData({ ...checkoutData, name: "", address: "", payment: "pix", installments: 1 });
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
        <button onClick={() => setSidebarOpen(true)}>🛒 Carrinho ({cart.length})</button>
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
          <span>R$ {filters.price}</span>
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
                style={{
                  width: "100%",
                  maxHeight: "150px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
                onClick={() => setSelectedProduct(p)}
              />
              <h3>{p.name}</h3>
              <p>{p.category}</p>
              <p>R$ {p.price.toFixed(2)}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(p);
                }}
              >
                Comprar
              </button>
            </div>
          ))
        )}
      </main>

      {/* Modal do produto */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              style={{
                width: "100%",
                maxHeight: "200px",
                objectFit: "contain",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            />
            <h3>{selectedProduct.name}</h3>
            <p>{selectedProduct.category}</p>
            <p style={{ marginBottom: "1rem" }}>
              R$ {selectedProduct.price.toFixed(2)}
            </p>
            <button onClick={() => addToCart(selectedProduct)}>
              Adicionar ao Carrinho
            </button>
            <br />
            <button
              style={{ marginTop: "0.5rem", background: "#8d6e63" }}
              onClick={() => setSelectedProduct(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Sidebar do carrinho */}
      <aside className={`cartSidebar ${sidebarOpen ? "show" : ""}`}>
        <button onClick={() => setSidebarOpen(false)}>X</button>
        <h2>Seu Carrinho</h2>
        {cart.length === 0 && message === "Compra realizada com sucesso!" ? (
          <p>Total: R$ {finalTotal.toFixed(2)}</p>
        ) : (
          <p>Total: R$ {total.toFixed(2)}</p>
        )}
        <ul>
          {/* Se o carrinho estiver vazio, esta lista ficará vazia */}
          {cart.map((item) => (
            <li key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-thumb" />
              <div className="cart-info">
                <strong>{item.name}</strong>
                <span>{item.qty}x • R$ {(item.price * item.qty).toFixed(2)}</span>
              </div>
              <button onClick={() => removeFromCart(item.id)}>Remover</button>
            </li>
          ))}
        </ul>

        {/* O formulário agora é sempre visível */}
        <form className="checkout-form" onSubmit={checkout}>
            <input
              type="text"
              placeholder="Seu nome"
              value={checkoutData.name}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, name: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Endereço de entrega"
              value={checkoutData.address}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, address: e.target.value })
              }
              required
            />
            <select
              value={checkoutData.payment}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, payment: e.target.value })
              }
            >
              <option value="pix">PIX</option>
              <option value="cartao">Cartão de Crédito</option>
              <option value="boleto">Boleto</option>
            </select>
            
            {/* Lógica de parcelamento */}
            {checkoutData.payment === "cartao" && total > 200 && (
              <select
                value={checkoutData.installments}
                onChange={(e) =>
                  setCheckoutData({
                    ...checkoutData,
                    installments: Number(e.target.value),
                  })
                }
              >
                <option value={1}>1x de R$ {total.toFixed(2)}</option>
                <option value={2}>2x de R$ {(total / 2).toFixed(2)}</option>
                <option value={3}>3x de R$ {(total / 3).toFixed(2)}</option>
                <option value={4}>4x de R$ {(total / 4).toFixed(2)}</option>
                <option value={5}>5x de R$ {(total / 5).toFixed(2)}</option>
              </select>
            )}

            <button type="submit" disabled={checkoutLoading}>
              {checkoutLoading ? "Finalizando..." : "Finalizar Compra"}
            </button>
          </form>

        <p>{message}</p>
      </aside>
    </div>
  );
}