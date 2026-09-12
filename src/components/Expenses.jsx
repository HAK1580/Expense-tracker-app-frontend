import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from '../api'; // Centralized Axios Instance

// ---------------------------------------------------------
// Shared Constants & Helpers
// ---------------------------------------------------------
const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'bills', label: 'Bills' },
  { value: 'others', label: 'Others' },
];

const TOAST_OPTIONS = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
};

const notifySuccess = (msg) => toast.success(msg, TOAST_OPTIONS);
const notifyError = (msg) => toast.error(msg, TOAST_OPTIONS);

const handleEnterAsNext = (e) => {
  if (e.key === 'Enter') e.preventDefault();
};

const SpinnerIcon = ({ className = 'w-4 fill-white animate-spin' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
    <path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z" />
  </svg>
);

// ---------------------------------------------------------
// AddExpenseForm
// ---------------------------------------------------------
const AddExpenseForm = ({ onAdded, variant = 'desktop', onDone }) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const isMobile = variant === 'mobile';

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await API.post('/api/expenses', data);
      onAdded(response.data);
      notifySuccess('Expense added successfully!');
      reset();
      onDone?.();
    } catch (err) {
      console.error('Failed to add expense:', err);
      notifyError('Could not add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = isMobile
    ? 'w-full text-gray-800 border border-gray-300 rounded-lg p-3 text-base outline-none focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50'
    : 'border p-2.5 bg-white border-gray-300 rounded-lg text-sm w-full outline-none focus:border-black disabled:opacity-50';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        {isMobile && <label className="text-sm font-semibold text-gray-700">What's it for?</label>}
        <input
          onKeyDown={handleEnterAsNext}
          autoComplete="off"
          disabled={loading}
          {...register('name', {
            required: 'Expense title is required',
            pattern: {
              value: /^(?:.*[a-zA-Z]){3,}.*$/,
              message: 'Enter a valid name (at least 3 letters)',
            },
          })}
          className={inputClass}
          placeholder={isMobile ? 'e.g. Grocery, Petrol, Lunch' : 'Title'}
          type="text"
        />
        {errors.name && <p className="text-red-500 font-medium text-xs mt-0.5">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        {isMobile && <label className="text-sm font-semibold text-gray-700">Amount (Rs)</label>}
        <div className="relative flex items-center">
          {isMobile && <span className="absolute left-3 text-gray-400 font-medium text-base">Rs</span>}
          <input
            onKeyDown={handleEnterAsNext}
            autoComplete="off"
            disabled={loading}
            {...register('price', {
              required: 'Amount cannot be empty',
              pattern: {
                value: /^\d+$/,
                message: 'Enter a valid amount',
              },
            })}
            className={isMobile ? `${inputClass} pl-10` : inputClass}
            placeholder={isMobile ? '0' : 'Amount'}
            type="number"
          />
        </div>
        {errors.price && <p className="text-red-500 font-medium text-xs mt-0.5">{errors.price.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        {isMobile && <label className="text-sm font-semibold text-gray-700">Category</label>}
        <select
          disabled={loading}
          {...register('category')}
          className={isMobile ? inputClass : `${inputClass} cursor-pointer`}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-black hover:bg-gray-800 cursor-pointer py-3.5 mt-2 rounded-xl font-semibold w-full text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <SpinnerIcon />}
        <span>{loading ? 'Adding...' : isMobile ? 'Save Expense' : '+ Add Expense'}</span>
      </button>
    </form>
  );
};

// ---------------------------------------------------------
// ExpenseRow
// ---------------------------------------------------------
const ExpenseRow = ({ expense, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const rowRef = useRef(null);
  const nameInputRef = useRef(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: expense.name,
      price: expense.price,
      category: expense.category,
    },
  });

  useEffect(() => {
    reset({
      name: expense.name,
      price: expense.price,
      category: expense.category,
    });
  }, [expense, reset]);

  useEffect(() => {
    if (isEditing) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditing]);

  const handleCancel = useCallback(() => {
    reset({
      name: expense.name,
      price: expense.price,
      category: expense.category,
    });
    setIsEditing(false);
  }, [expense, reset]);

  useEffect(() => {
    if (!isEditing) return;
    const handleClickOutside = (e) => {
      if (rowRef.current && !rowRef.current.contains(e.target)) {
        handleCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, handleCancel]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const response = await API.put(`/api/expenses/${expense._id}`, data);
      onUpdate(expense._id, response.data, Number(expense.price));
      notifySuccess('Expense updated!');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update expense:', err);
      notifyError('Could not update expense. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const { ref: nameRef, ...nameRegister } = register('name', { required: true });

  if (isEditing) {
    return (
      <form
        ref={rowRef}
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
        className="expense-box border rounded-xl p-3 bg-gray-50/80 border-gray-300 shadow-xs my-2 flex justify-between items-center gap-2 ring-1 ring-black/10"
      >
        <div className="flex flex-col gap-1">
          <input
            autoComplete="off"
            {...nameRegister}
            ref={(e) => {
              nameRef(e);
              nameInputRef.current = e;
            }}
            disabled={isSaving}
            className="font-bold text-gray-800 border-b border-gray-400 outline-none focus:border-black bg-transparent w-28 text-sm disabled:opacity-50"
          />
          <select
            {...register('category')}
            disabled={isSaving}
            className="text-xs text-gray-500 border-b border-gray-400 outline-none focus:border-black bg-transparent w-28 disabled:opacity-50"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <input
            autoComplete="off"
            {...register('price', { required: true, pattern: /^\d+$/ })}
            type="number"
            disabled={isSaving}
            className="font-bold text-red-600 text-sm border-b border-gray-400 outline-none focus:border-black bg-transparent w-16 text-right disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center hover:bg-red-200 transition-colors text-xs cursor-pointer"
            aria-label="Cancel"
          >
            ✕
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="w-6 h-6 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center hover:bg-green-200 transition-colors text-xs cursor-pointer"
            aria-label="Save"
          >
            {isSaving ? <SpinnerIcon className="w-3 h-3 fill-green-600 animate-spin" /> : '✓'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="expense-box border bg-white rounded-xl px-4 py-3 border-gray-200 my-2 flex justify-between items-center shadow-xs">
      <div className="flex flex-col">
        <h2 className="font-bold capitalize text-gray-800 text-sm md:text-base">{expense.name}</h2>
        <span className="text-xs text-gray-500 capitalize">{expense.category}</span>
      </div>
      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => onDelete(expense._id, Number(expense.price))}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            aria-label="Delete expense"
          >
            <img src="/delete.png" alt="Delete" className="w-4 h-4 object-contain" />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            aria-label="Edit expense"
          >
            <img src="/draw.png" alt="Edit" className="w-4 h-4 object-contain" />
          </button>
        </div>
        <span className="font-bold text-red-600 text-sm md:text-base">-Rs {expense.price}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// Main Expenses Component
// ---------------------------------------------------------
const Expenses = ({ balance, setBalance, setSpent, spent }) => {
  const [expenses, setExpenses] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await API.get('/api/expenses');
        if (isMounted) setExpenses(response.data);
      } catch (err) {
        console.error('Failed to load expenses:', err);
        notifyError('Could not load expenses.');
      } finally {
        if (isMounted) setIsLoadingList(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (_id, oldPrice) => {
    try {
      await API.delete(`/api/expenses/${_id}`);
      setExpenses((prev) => prev.filter((exp) => exp._id !== _id));
      setSpent((prev) => prev - oldPrice);
      setBalance((prev) => prev + oldPrice);
      notifySuccess('Expense deleted!');
    } catch (err) {
      console.error('Failed to delete expense:', err);
      notifyError('Could not delete expense. Please try again.');
    }
  };

  const handleUpdate = (_id, updatedExpense, oldPrice) => {
    const priceDiff = Number(updatedExpense.price) - oldPrice;
    setExpenses((prev) => prev.map((exp) => (exp._id === _id ? updatedExpense : exp)));
    setSpent((prev) => prev + priceDiff);
    setBalance((prev) => prev - priceDiff);
  };

  const handleAdded = (newExpense) => {
    const price = Number(newExpense.price);
    setExpenses((prev) => [...prev, newExpense]);
    setSpent((prev) => prev + price);
    setBalance((prev) => prev - price);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <ToastContainer {...TOAST_OPTIONS} />

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Desktop Sidebar Add Form */}
        <div className="hidden md:block md:col-span-4 bg-gray-50 border border-gray-200 rounded-2xl p-5 h-fit shadow-xs">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Add Expense</h2>
          <AddExpenseForm variant="desktop" onAdded={handleAdded} />
        </div>

        {/* Expense List Container */}
        <div className="col-span-1 md:col-span-8 bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-gray-800">Recent Expenses</h2>
            <button
              onClick={() => setPopup(true)}
              className="md:hidden bg-black text-white text-xs px-3 py-2 rounded-lg font-semibold active:scale-95 transition-transform"
            >
              + Add
            </button>
          </div>

          {isLoadingList ? (
            <div className="flex justify-center items-center py-16">
              <SpinnerIcon className="w-6 fill-gray-400 animate-spin" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="italic font-medium text-gray-400">No recent expenses found</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {expenses.map((e) => (
                <ExpenseRow
                  key={e._id}
                  expense={e}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Add Expense Modal */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-xl text-gray-800">Add Expense</h2>
              <button
                type="button"
                onClick={() => setPopup(false)}
                className="text-gray-400 hover:text-black font-bold text-xl px-2 cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              <AddExpenseForm
                variant="mobile"
                onAdded={handleAdded}
                onDone={() => setPopup(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;