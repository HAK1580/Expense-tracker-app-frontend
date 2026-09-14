import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// ---------------------------------------------------------
// Shared constants / helpers
// ---------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const EXPENSES_ENDPOINT = `${BASE_URL}/api/expenses`;

// Reads the token saved at login and builds the Authorization header
// expected by the backend's auth middleware.
const authConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'bills', label: 'Bills' },
  { value: 'others', label: 'Others' },
];

const TOAST_OPTIONS = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
};

const notifySuccess = (message) => toast.success(message, TOAST_OPTIONS);
const notifyError = (message) => toast.error(message, TOAST_OPTIONS);

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
const AddExpenseForm = ({ onAdded, variant, onDone }) => {
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
      const response = await axios.post(EXPENSES_ENDPOINT, data, authConfig());
      onAdded(response.data, Number(data.price));
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
              message: 'Enter a valid name',
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
        className={`bg-black ${loading ? 'opacity-90 bg-gray-900' : 'hover:bg-gray-800'} cursor-pointer py-3.5 mt-4 rounded-xl font-semibold w-full text-white shadow-md active:scale-95 transition-transform disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      >
        {loading && <SpinnerIcon />}
        <span className={loading ? 'text-gray-300' : ''}>
          {loading ? 'Adding...' : isMobile ? 'Save Expense' : '+ Add Expense'}
        </span>
      </button>
    </form>
  );
};

// ---------------------------------------------------------
// ExpenseRow
// ---------------------------------------------------------
const ExpenseRow = ({ expense, onDelete, onUpdate, variant }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const rowRef = React.useRef(null);
  const nameInputRef = React.useRef(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: expense.name,
      price: expense.price,
      category: expense.category,
    },
  });

  const { ref: nameRegisterRef, ...nameRegisterRest } = register('name', {
    required: true,
    pattern: /^(?:.*[a-zA-Z]){3,}.*$/,
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

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

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
      const response = await axios.put(`${EXPENSES_ENDPOINT}/${expense._id}`, data, authConfig());
      onUpdate(expense._id, response.data);
      notifySuccess('Expense updated!');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update expense:', err);
      notifyError('Could not update expense. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const rowClass =
    variant === 'mobile'
      ? 'expense-box border rounded-xl p-3 border-gray-200 bg-white shadow-sm my-2 flex justify-between items-center'
      : 'expense-box border bg-white rounded-lg px-4 py-3 border-gray-200 my-2 flex justify-between items-center';

  if (isEditing) {
    return (
      <form
        ref={rowRef}
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        className={`${rowClass} ring-2 ring-black/10 bg-gray-50/60`}
      >
        <div className="name-date flex flex-col gap-1">
          <input
            autoComplete="off"
            {...nameRegisterRest}
            ref={(el) => {
              nameRegisterRef(el);
              nameInputRef.current = el;
            }}
            disabled={isSaving}
            className="font-bold capitalize text-gray-800 border-b border-gray-300 outline-none focus:border-black bg-transparent w-24 text-sm disabled:opacity-50"
          />
          <select
            {...register('category')}
            disabled={isSaving}
            className="text-xs text-gray-500 capitalize border-b border-gray-300 outline-none focus:border-black bg-transparent w-24 disabled:opacity-50"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="expense-price-delete-btn flex gap-3 items-center">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="w-6 h-6 shrink-0 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center hover:bg-red-200 transition-colors text-xs disabled:opacity-50"
            aria-label="Cancel edit"
          >
            ✕
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="w-6 h-6 shrink-0 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center hover:bg-green-200 transition-colors text-xs disabled:opacity-50"
            aria-label="Save changes"
          >
            {isSaving ? <SpinnerIcon className="w-2.5 h-2.5 fill-green-600 animate-spin" /> : '✓'}
          </button>
          <input
            autoComplete="off"
            {...register('price', { required: true, pattern: /^\d+$/ })}
            type="number"
            disabled={isSaving}
            className="font-bold text-red-600 text-base border-b border-gray-300 outline-none focus:border-black bg-transparent w-16 text-right disabled:opacity-50"
          />
        </div>
      </form>
    );
  }

  return (
    <div className={rowClass}>
      <div className="name-date flex flex-col">
        <h1 className="font-bold capitalize text-gray-800">{expense.name}</h1>
        <h2 className="text-xs text-gray-500 capitalize">{expense.category}</h2>
      </div>
      <div className="expense-price-delete-btn flex gap-4 items-center">
        <div className="delete-edit-btns flex gap-1.5 items-center">
          {isSaving ? (
            <SpinnerIcon className="w-4 fill-gray-400 animate-spin" />
          ) : (
            <img
              onClick={() => onDelete(expense._id)}
              className="w-4 cursor-pointer"
              src="/delete.png"
              alt="Delete expense"
            />
          )}
          {isSaving ? (
            <SpinnerIcon className="w-4 fill-gray-400 animate-spin" />
          ) : (
            <img
              onClick={() => setIsEditing(true)}
              className="w-4 cursor-pointer"
              src="/draw.png"
              alt="Edit expense"
            />
          )}
        </div>
        <h1 className="font-bold text-red-600 text-base">-Rs {expense.price}</h1>
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
        const response = await axios.get(EXPENSES_ENDPOINT, authConfig());
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

  const handleDelete = async (_id) => {
    const expenseToDelete = expenses.find((expense) => expense._id === _id);

    try {
      await axios.delete(`${EXPENSES_ENDPOINT}/${_id}`, authConfig());
      setExpenses((prev) => prev.filter((expense) => expense._id !== _id));

      if (expenseToDelete) {
        const price = Number(expenseToDelete.price);
        // Deleting an expense gives the money back: spend goes down, balance goes up.
        const updatespend = Math.max(0, spent - price);
        const updatebalance = balance + price;

        localStorage.setItem("balance", updatebalance);
        localStorage.setItem("spend", updatespend);
        setSpent(updatespend);
        setBalance(updatebalance);
      }

      notifySuccess('Expense deleted!');
    } catch (err) {
      console.error('Failed to delete expense:', err);
      notifyError('Could not delete expense. Please try again.');
    }
  };

  const handleUpdate = (_id, updatedExpense) => {
    setExpenses((prev) => prev.map((exp) => (exp._id === _id ? updatedExpense : exp)));
  };

  const handleAdded = (newExpense, price) => {
    setExpenses((prev) => [...prev, newExpense]);
    const updatespend = spent + price;
    const updatebalance = Math.max(0, balance - price);

    localStorage.setItem("balance", updatebalance);
    localStorage.setItem("spend", updatespend);
    setSpent(updatespend);
    setBalance(updatebalance);
  };

  return (
    <div className="w-full">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* MOBILE VERSION */}
      <div className="mobile-version block md:hidden p-2 overflow-auto">
        <h1 className="font-semibold text-xl mb-4">Recent Expenses</h1>

        {isLoadingList && (
          <div className="flex justify-center items-center my-10">
            <SpinnerIcon className="w-6 fill-gray-400 animate-spin" />
          </div>
        )}

        {!isLoadingList &&
          expenses.map((e) => (
            <ExpenseRow key={e._id} expense={e} onDelete={handleDelete} onUpdate={handleUpdate} variant="mobile" />
          ))}

        {!isLoadingList && expenses.length === 0 && (
          <div className="no-recent-expenses my-10 flex justify-center items-center">
            <h1 className="italic font-semibold text-gray-400">No recent expenses</h1>
          </div>
        )}

        <button
          onClick={() => setPopup(true)}
          className="bg-black py-3.5 my-6 rounded-xl font-semibold w-full text-white shadow-md active:scale-95 transition-transform"
        >
          + Add Expense
        </button>

        {popup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="popup-box bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all">
              <div className="add-expense-cross-sign pb-3 border-b border-gray-100 flex justify-between items-center">
                <h1 className="font-bold text-xl text-gray-800">Add Expense</h1>
                <button
                  type="button"
                  onClick={() => setPopup(false)}
                  className="text-gray-400 hover:text-black font-bold text-xl px-2"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4">
                <AddExpenseForm variant="mobile" onAdded={handleAdded} onDone={() => setPopup(false)} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP VERSION */}
      <div className="desktop-version hidden md:block p-6">
        <div className="expense-box flex gap-8">
          <div className="add-expenses rounded-xl bg-gray-50 border border-gray-200 p-4 w-[35%]">
            <h1 className="font-bold text-lg mb-4">Add Expense</h1>
            <AddExpenseForm variant="desktop" onAdded={handleAdded} />
          </div>

          <div className="recent-expenses border-gray-200 rounded-xl border bg-gray-50 p-4 w-[65%]">
            <h1 className="font-bold text-lg mb-4">Recent Expenses</h1>

            {isLoadingList && (
              <div className="flex justify-center items-center my-20">
                <SpinnerIcon className="w-6 fill-gray-400 animate-spin" />
              </div>
            )}

            {!isLoadingList &&
              expenses.map((e) => (
                <ExpenseRow key={e._id} expense={e} onDelete={handleDelete} onUpdate={handleUpdate} variant="desktop" />
              ))}

            {!isLoadingList && expenses.length === 0 && (
              <div className="no-recent-expenses my-20 flex justify-center items-center">
                <h1 className="italic font-semibold text-gray-400">No recent expenses</h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;