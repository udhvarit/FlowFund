import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Tesseract from 'tesseract.js';
import {
  Camera,
  Upload,
  X,
  Loader2,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD', 'AED', 'SAR'];

export default function SubmitExpense() {
  const { company } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [receiptPreview, setReceiptPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    originalCurrency: company?.currencyCode || 'USD',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptUrl: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setReceiptPreview(ev.target.result);
    };
    reader.readAsDataURL(file);

    await processOCR(file);
  };

  const processOCR = async (file) => {
    setOcrProcessing(true);
    setOcrProgress(0);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });

      const text = result.data.text;
      const extractedData = extractReceiptData(text);
      
      if (extractedData.amount) {
        setFormData(prev => ({
          ...prev,
          amount: extractedData.amount.toString(),
          description: extractedData.description || prev.description,
          expenseDate: extractedData.date || prev.expenseDate
        }));
      }
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setOcrProcessing(false);
    }
  };

  const extractReceiptData = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    const amountPatterns = [
      /(?:total|amount|sum|due|paid)[:\s]*[$€£¥]?\s*(\d+[.,]\d{2})/i,
      /[$€£¥]\s*(\d+[.,]\d{2})/,
      /(\d+[.,]\d{2})\s*(?:USD|EUR|GBP)?/i
    ];

    let amount = null;
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        amount = parseFloat(match[1].replace(',', '.'));
        break;
      }
    }

    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
      /([A-Za-z]{3})\s+(\d{1,2}),?\s*(\d{4})/i
    ];

    let date = null;
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const d = new Date(text.match(pattern)[0]);
          if (!isNaN(d.getTime())) {
            date = d.toISOString().split('T')[0];
          }
        } catch {}
        break;
      }
    }

    const merchantPatterns = [
      /(?:from|at|store|merchant)[:\s]*([A-Za-z\s]+?)(?:\n|$)/i,
      /^([A-Za-z\s]+?)(?:\n|$)/
    ];

    let description = null;
    for (const pattern of merchantPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        description = match[1].trim();
        break;
      }
    }

    return { amount, date, description };
  };

  const removeReceipt = () => {
    setReceiptPreview(null);
    setFormData({ ...formData, receiptUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.expenseDate) newErrors.expenseDate = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post('/expenses', formData);
      navigate('/expenses');
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to submit expense' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Submit New Expense</h1>
        <p className="text-secondary-600 mt-1">Fill in the details below or scan a receipt</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-secondary-100">
          <Camera className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-secondary-900">Receipt Scanner (Optional)</h2>
        </div>

        <div className="mb-6">
          {receiptPreview ? (
            <div className="relative inline-block">
              <img
                src={receiptPreview}
                alt="Receipt preview"
                className="max-h-48 rounded-lg border border-secondary-200"
              />
              <button
                onClick={removeReceipt}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              {ocrProcessing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                  <p className="text-white text-sm">Processing... {ocrProgress}%</p>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
            >
              <Upload className="w-10 h-10 text-secondary-400 mx-auto mb-3" />
              <p className="text-secondary-600 font-medium">Click to upload receipt</p>
              <p className="text-sm text-secondary-400 mt-1">or drag and drop</p>
              <p className="text-xs text-secondary-400 mt-2">PNG, JPG up to 10MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {errors.submit && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{errors.submit}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.categoryId ? 'border-red-500' : 'border-secondary-300'
              }`}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                name="originalCurrency"
                value={formData.originalCurrency}
                onChange={handleInputChange}
                className="w-24 px-3 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.amount ? 'border-red-500' : 'border-secondary-300'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Expense Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.expenseDate ? 'border-red-500' : 'border-secondary-300'
                }`}
              />
            </div>
            {errors.expenseDate && (
              <p className="mt-1 text-sm text-red-500">{errors.expenseDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Company Currency
            </label>
            <div className="px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg text-secondary-600">
              {company?.currencyCode || 'USD'} (will be converted automatically)
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Description
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-secondary-400" />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Add a description for this expense..."
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100">
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="px-6 py-2.5 border border-secondary-300 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit Expense
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
