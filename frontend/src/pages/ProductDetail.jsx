import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';

function formatMoney(v) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(v));
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/api/products/${id}`);
        if (!cancel) setProduct(data);
      } catch (e) {
        if (!cancel) setError(e.response?.data?.message || 'Product not found');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="alert alert-warning">
        {error || 'Not found'}{' '}
        <Link to="/products">Back to products</Link>
      </div>
    );
  }

  const maxQty = product.stockQuantity ?? 0;
  const canBuy = product.active && maxQty > 0;

  return (
    <div className="row">
      <div className="col-lg-8">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/products">Products</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>
        <h2>{product.name}</h2>
        <p className="text-muted mb-1">SKU: {product.sku}</p>
        <p className="lead">{formatMoney(product.price)}</p>
        <p>{product.description}</p>
        <p>
          <span className="badge bg-info text-dark">{product.category || 'Uncategorized'}</span>
        </p>
      </div>
      <div className="col-lg-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <p className="mb-2">
              Stock: <strong>{maxQty}</strong>
            </p>
            {!canBuy && <div className="alert alert-secondary py-2 small">Currently unavailable</div>}
            {canBuy && (
              <>
                <div className="input-group mb-3">
                  <span className="input-group-text">Qty</span>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    max={maxQty}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(maxQty, Number(e.target.value) || 1)))}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={() => {
                    addItem(product, qty);
                    setAdded(true);
                    setTimeout(() => setAdded(false), 2000);
                  }}
                >
                  Add to cart
                </button>
                {added && <p className="text-success small mt-2 mb-0">Added to cart.</p>}
                <Link className="btn btn-outline-secondary w-100 mt-2" to="/cart">
                  View cart
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
