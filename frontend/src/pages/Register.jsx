import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const fe = {};
    if (form.username.length < 3) fe.username = 'At least 3 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) fe.email = 'Valid email required';
    if (form.password.length < 8) fe.password = 'At least 8 characters';
    if (!form.firstName.trim()) fe.firstName = 'Required';
    if (!form.lastName.trim()) fe.lastName = 'Required';
    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      navigate('/products');
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
      setError(data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <h2 className="mb-3">Create customer account</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={onSubmit} noValidate>
          <div className="row g-2">
            <div className="col-md-6 mb-2">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
                value={form.username}
                onChange={onChange}
              />
              {fieldErrors.username && <div className="invalid-feedback">{fieldErrors.username}</div>}
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                value={form.email}
                onChange={onChange}
              />
              {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                value={form.password}
                onChange={onChange}
              />
              {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label" htmlFor="phone">
                Phone (optional)
              </label>
              <input id="phone" name="phone" className="form-control" value={form.phone} onChange={onChange} />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label" htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                className={`form-control ${fieldErrors.firstName ? 'is-invalid' : ''}`}
                value={form.firstName}
                onChange={onChange}
              />
              {fieldErrors.firstName && <div className="invalid-feedback">{fieldErrors.firstName}</div>}
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label" htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                className={`form-control ${fieldErrors.lastName ? 'is-invalid' : ''}`}
                value={form.lastName}
                onChange={onChange}
              />
              {fieldErrors.lastName && <div className="invalid-feedback">{fieldErrors.lastName}</div>}
            </div>
            <div className="col-12 mb-2">
              <label className="form-label" htmlFor="address">
                Address (optional)
              </label>
              <textarea id="address" name="address" className="form-control" rows={2} value={form.address} onChange={onChange} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
            {loading ? 'Creating…' : 'Register'}
          </button>
        </form>
        <p className="mt-3 small text-muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
