import { useForm } from 'react-hook-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { expenseCategories } from '../../../data/options';
import { extractErrorMessage } from '../../../utils/apiError';

export default function ExpenseModal({ open, onClose, onSave, expense }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: expense || { category: expenseCategories[0], date: new Date().toISOString().slice(0, 10) },
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await onSave({ ...data, amount: Number(data.amount) });
      toast.success(expense ? 'Expense updated' : 'Expense recorded');
      reset();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={expense ? 'Edit expense' : 'Add expense'} width={440}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" loading={saving} onClick={handleSubmit(onSubmit)}>{expense ? 'Save changes' : 'Add expense'}</Button>
      </>}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" {...register('category', { required: true })}>
            {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-input" placeholder="e.g. Shop rent - August" {...register('description', { required: 'Description is required' })} />
          {errors.description && <p className="form-error">{errors.description.message}</p>}
        </div>
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Amount (₦)</label>
            <input type="number" step="0.01" className="form-input" placeholder="0.00" {...register('amount', { required: 'Required', min: 0 })} />
            {errors.amount && <p className="form-error">{errors.amount.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" {...register('date', { required: true })} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
