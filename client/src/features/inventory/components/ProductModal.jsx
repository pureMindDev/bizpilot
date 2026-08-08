import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import PlanLimitModal from '../../../components/common/PlanLimitModal';
import { useProducts } from '../../../contexts/ProductContext';
import { extractErrorMessage, getPlanLimitDetails } from '../../../utils/apiError';

export default function ProductModal({ open, onClose, product }) {
  const { addProduct, updateProduct, categories, suppliers } = useProducts();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);
  const [limitDetails, setLimitDetails] = useState(null);
  const isEdit = !!product;

  useEffect(() => {
    if (open) reset(product || { category: categories[0], supplier: suppliers[0] });
  }, [open, product]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data) => {
    setSaving(true);
    const payload = {
      ...data,
      costPrice: Number(data.costPrice),
      sellingPrice: Number(data.sellingPrice),
      stock: Number(data.stock),
      reorderLevel: Number(data.reorderLevel) || 15,
    };
    try {
      if (isEdit) {
        await updateProduct(product.id, payload);
        toast.success('Product updated');
      } else {
        payload.sku = `SKU-${Date.now().toString(36).toUpperCase()}`;
        await addProduct(payload);
        toast.success('Product added to inventory');
      }
      onClose();
    } catch (err) {
      const limit = getPlanLimitDetails(err);
      if (limit) {
        onClose();
        setLimitDetails(limit);
      } else {
        toast.error(extractErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit product' : 'Add new product'} subtitle={isEdit ? product?.name : 'Add a product to your inventory'} width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit(onSubmit)}>{isEdit ? 'Save changes' : 'Add product'}</Button>
        </>
      }>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label">Product name</label>
          <input className="form-input" placeholder="e.g. Golden Morn 900g" {...register('name', { required: 'Product name is required' })} />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" {...register('category', { required: true })}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <select className="form-select" {...register('supplier', { required: true })}>
              {suppliers.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Cost price (₦)</label>
            <input type="number" step="0.01" className="form-input" placeholder="0.00" {...register('costPrice', { required: 'Required', min: 0 })} />
            {errors.costPrice && <p className="form-error">{errors.costPrice.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Selling price (₦)</label>
            <input type="number" step="0.01" className="form-input" placeholder="0.00" {...register('sellingPrice', { required: 'Required', min: 0 })} />
            {errors.sellingPrice && <p className="form-error">{errors.sellingPrice.message}</p>}
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Stock quantity</label>
            <input type="number" className="form-input" placeholder="0" {...register('stock', { required: 'Required', min: 0 })} />
            {errors.stock && <p className="form-error">{errors.stock.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Reorder level</label>
            <input type="number" className="form-input" placeholder="15" {...register('reorderLevel')} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Barcode</label>
          <input className="form-input" placeholder="e.g. 6151000001" {...register('barcode')} />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Product image</label>
          <div style={{
            border: '1.5px dashed var(--border)', borderRadius: 10, padding: '20px 14px',
            textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13, cursor: 'pointer', background: 'var(--bg-hover)',
          }}>
            Click to upload or drag and drop an image (PNG, JPG)
          </div>
        </div>
      </form>
    </Modal>
    <PlanLimitModal details={limitDetails} onClose={() => setLimitDetails(null)} />
    </>
  );
}
