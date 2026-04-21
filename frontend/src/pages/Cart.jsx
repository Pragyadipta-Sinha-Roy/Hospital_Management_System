import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function formatMoney(v) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(v));
}

export default function Cart() {
  const { items, setQuantity, removeItem, total } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div>
        <h2>Cart</h2>
        <p className="text-muted">Your cart is empty.</p>
        <Link to="/products" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3">Cart</h2>
      <div className="table-wrap">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map(({ product, quantity }) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{formatMoney(product.price)}</td>
                <td style={{ maxWidth: '120px' }}>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    min={1}
                    max={product.stockQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(product.id, Number(e.target.value))}
                  />
                </td>
                <td>{formatMoney(Number(product.price) * quantity)}</td>
                <td>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(product.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <strong>Total: {formatMoney(total)}</strong>
        {user?.role === 'CUSTOMER' ? (
          <Link to="/checkout" className="btn btn-success">
            Checkout
          </Link>
        ) : (
          <span className="text-muted small">Log in as a customer to checkout.</span>
        )}
      </div>
    </div>
  );
}
