import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPrinter, FiCheckCircle } from 'react-icons/fi';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { useSales } from '../../../contexts/SalesContext';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import { extractErrorMessage } from '../../../utils/apiError';

export default function CheckoutModal({ open, onClose }) {
  const { cart, paymentMethods, completeSale } = useSales();
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discountPct, setDiscountPct] = useState(0);
  const [customer, setCustomer] = useState('Walk-in Customer');
  const [completedSale, setCompletedSale] = useState(null);
  const [processing, setProcessing] = useState(false);

  const subtotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
  const discount = Math.round((subtotal * discountPct) / 100);
  const tax = Math.round((subtotal - discount) * 0.075);
  const total = subtotal - discount + tax;

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const sale = await completeSale({ paymentMethod, discount, customer });
      setCompletedSale(sale);
      toast.success('Sale completed successfully!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setCompletedSale(null);
    setDiscountPct(0);
    setPaymentMethod('Cash');
    setCustomer('Walk-in Customer');
    onClose();
  };

  if (completedSale) {
    return (
      <Modal open={open} onClose={handleClose} title="Receipt" subtitle={completedSale.id} width={400}
        footer={
          <>
            <Button variant="secondary" icon={FiPrinter} onClick={() => window.print()}>Print receipt</Button>
            <Button variant="primary" onClick={handleClose}>Done</Button>
          </>
        }>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--success-light, #DCFCE7)', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <FiCheckCircle size={24} />
          </div>
          <p style={{ fontWeight: 700, fontSize: 15 }}>Payment received</p>
          <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>{formatDateTime(completedSale.createdAt)}</p>
        </div>
        <div style={{ border: '1px dashed var(--border)', borderRadius: 10, padding: 14 }}>
          {completedSale.items.map((it) => (
            <div key={it.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>{it.qty} × {it.name}</span>
              <span className="mono">{formatCurrency(it.price * it.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px dashed var(--border)', margin: '8px 0' }} />
          <Row label="Subtotal" value={completedSale.subtotal} />
          {completedSale.discount > 0 && <Row label="Discount" value={-completedSale.discount} />}
          <Row label="Tax (7.5%)" value={completedSale.tax} />
          <div style={{ borderTop: '1px dashed var(--border)', margin: '8px 0' }} />
          <Row label="Total" value={completedSale.total} bold />
          <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--text-secondary)' }}>
            Paid via {completedSale.paymentMethod} · {completedSale.customer}
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Checkout" subtitle={`${cart.length} item${cart.length !== 1 ? 's' : ''} in cart`} width={440}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" loading={processing} disabled={cart.length === 0} onClick={handleConfirm}>
            Confirm payment — {formatCurrency(total)}
          </Button>
        </>
      }>
      <div className="form-group">
        <label className="form-label">Customer</label>
        <input className="form-input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Walk-in Customer" />
      </div>

      <div className="form-group">
        <label className="form-label">Payment method</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {paymentMethods.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPaymentMethod(m)}
              className="btn btn-sm"
              style={{
                flex: 1, justifyContent: 'center',
                background: paymentMethod === m ? 'var(--primary)' : 'var(--bg-hover)',
                color: paymentMethod === m ? '#fff' : 'var(--text-primary)',
                border: '1px solid ' + (paymentMethod === m ? 'var(--primary)' : 'var(--border)'),
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Discount (%)</label>
        <input type="number" min="0" max="100" className="form-input" value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} />
      </div>

      <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: 14, marginTop: 4 }}>
        <Row label="Subtotal" value={subtotal} />
        {discount > 0 && <Row label={`Discount (${discountPct}%)`} value={-discount} />}
        <Row label="Tax (7.5%)" value={tax} />
        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />
        <Row label="Total due" value={total} bold />
      </div>
    </Modal>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 14.5 : 13, fontWeight: bold ? 700 : 500, marginBottom: 6 }}>
      <span style={{ color: bold ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
      <span className="mono">{formatCurrency(value)}</span>
    </div>
  );
}
