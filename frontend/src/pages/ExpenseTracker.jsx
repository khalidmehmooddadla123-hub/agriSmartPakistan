import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { expenseAPI } from '../services/api';
import { Input, Select, Button, Card, StatBox, Textarea } from '../components/ui/FormControls';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiDollarSign, FiPlus, FiTrash2, FiTrendingUp, FiTrendingDown, FiPackage, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'seed', label: 'Seed', labelUr: 'بیج', emoji: '🌱' },
  { value: 'fertilizer', label: 'Fertilizer', labelUr: 'کھاد', emoji: '🧪' },
  { value: 'pesticide', label: 'Pesticide', labelUr: 'کیڑے مار دوا', emoji: '🧫' },
  { value: 'labor', label: 'Labor', labelUr: 'مزدوری', emoji: '👷' },
  { value: 'irrigation', label: 'Irrigation', labelUr: 'آبپاشی', emoji: '💧' },
  { value: 'fuel', label: 'Fuel', labelUr: 'ایندھن', emoji: '⛽' },
  { value: 'machinery', label: 'Machinery', labelUr: 'مشینری', emoji: '🚜' },
  { value: 'transport', label: 'Transport', labelUr: 'نقل و حمل', emoji: '🚛' },
  { value: 'other', label: 'Other', labelUr: 'دیگر', emoji: '📋' }
];

const COLORS = ['#16a34a','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#6b7280'];

export default function ExpenseTracker() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [season, setSeason] = useState('Rabi');
  const year = new Date().getFullYear();

  const [form, setForm] = useState({
    season: 'Rabi', category: 'seed', amountPKR: '', description: '',
    cropName: 'Wheat', date: new Date().toISOString().split('T')[0],
    isRevenue: false, quantityMaunds: '', pricePerMaund: '', areaAcres: 1
  });
  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [k]: v });
  };

  const load = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        expenseAPI.list({ season, year }),
        expenseAPI.summary({ season, year })
      ]);
      setExpenses(listRes.data.data || []);
      setSummary(sumRes.data.data);
    } catch (err) { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [season]);

  const handleSubmit = async () => {
    if (!form.amountPKR) {
      toast.error(isUrdu ? 'رقم درج کریں' : 'Enter amount');
      return;
    }
    try {
      const payload = { ...form, amountPKR: parseFloat(form.amountPKR), season };
      if (form.isRevenue) {
        payload.category = 'other';
        if (form.quantityMaunds) payload.quantityMaunds = parseFloat(form.quantityMaunds);
        if (form.pricePerMaund) payload.pricePerMaund = parseFloat(form.pricePerMaund);
      }
      await expenseAPI.create(payload);
      toast.success(isUrdu ? 'محفوظ ہو گیا' : 'Saved');
      setShowForm(false);
      setForm({ ...form, amountPKR: '', description: '', quantityMaunds: '', pricePerMaund: '' });
      load();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isUrdu ? 'حذف کریں؟' : 'Delete?')) return;
    await expenseAPI.delete(id);
    load();
  };

  const categoryData = Object.entries(summary?.byCategory || {}).map(([k, v]) => ({
    name: CATEGORIES.find(c => c.value === k)?.label || k,
    value: v
  }));

  const monthData = Object.entries(summary?.byMonth || {}).map(([k, v]) => ({
    month: k, expenses: v.expenses, revenue: v.revenue
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-5 sm:p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              💰 <span className="truncate">{isUrdu ? 'اخراجات ٹریکر' : 'Expense Tracker'}</span>
            </h1>
            <p className="text-red-100 text-xs sm:text-sm mt-1 line-clamp-2">
              {isUrdu ? 'ہر روپیہ ٹریک کریں اور اصل منافع دیکھیں' : 'Track every rupee, see real profit margins'}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} icon={FiPlus} variant="outline" className="bg-white text-red-600 hover:bg-red-50 border-white text-xs sm:text-sm shrink-0">
            {isUrdu ? 'ریکارڈ' : 'Add'}
          </Button>
        </div>
      </div>

      {/* Season Tabs */}
      <div className="flex gap-2">
        {['Rabi', 'Kharif'].map(s => (
          <button key={s} onClick={() => setSeason(s)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
              season === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}>
            {s === 'Rabi' ? (isUrdu ? 'ربیع (سرما)' : 'Rabi (Winter)') : (isUrdu ? 'خریف (گرما)' : 'Kharif (Summer)')} {year}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox
            label={isUrdu ? 'کل آمدنی' : 'Total Revenue'}
            value={`PKR ${(summary.totalRevenue / 1000).toFixed(1)}k`}
            color="green" icon={FiTrendingUp}
          />
          <StatBox
            label={isUrdu ? 'کل اخراجات' : 'Total Expenses'}
            value={`PKR ${(summary.totalExpenses / 1000).toFixed(1)}k`}
            color="red" icon={FiTrendingDown}
          />
          <StatBox
            label={isUrdu ? 'خالص منافع' : 'Net Profit'}
            value={`PKR ${(summary.profit / 1000).toFixed(1)}k`}
            subtitle={summary.profitMargin ? `${summary.profitMargin}% margin` : null}
            color={summary.profit >= 0 ? 'green' : 'red'} icon={FiDollarSign}
          />
          <StatBox
            label={isUrdu ? 'Break-even' : 'Break-even/Maund'}
            value={summary.breakEvenPerMaund ? `PKR ${summary.breakEvenPerMaund}` : '-'}
            subtitle={summary.totalMaunds ? `${summary.totalMaunds} maunds sold` : null}
            color="blue" icon={FiPackage}
          />
        </div>
      )}

      {/* Charts */}
      {summary && (categoryData.length > 0 || monthData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {categoryData.length > 0 && (
            <Card title={isUrdu ? 'زمرہ کے حساب سے اخراجات' : 'Expenses by Category'}>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `PKR ${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
          {monthData.length > 0 && (
            <Card title={isUrdu ? 'ماہانہ خلاصہ' : 'Monthly Breakdown'}>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={monthData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `PKR ${v.toLocaleString()}`} />
                  <Bar dataKey="expenses" fill="#ef4444" name={isUrdu ? 'اخراجات' : 'Expenses'} radius={[4,4,0,0]} />
                  <Bar dataKey="revenue" fill="#16a34a" name={isUrdu ? 'آمدنی' : 'Revenue'} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {/* Expense List */}
      <Card title={isUrdu ? 'تمام ریکارڈز' : 'All Records'}>
        {loading ? (
          <div className="text-center py-8 text-gray-400">{isUrdu ? 'لوڈ ہو رہا ہے' : 'Loading...'}</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FiDollarSign className="mx-auto mb-3 text-gray-300" size={48} />
            <p>{isUrdu ? 'ابھی کوئی ریکارڈ نہیں' : 'No records yet. Click "Add Record" to start.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {expenses.map(e => {
              const cat = CATEGORIES.find(c => c.value === e.category);
              return (
                <div key={e._id} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{e.isRevenue ? '💰' : cat?.emoji || '📋'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {e.isRevenue ? (isUrdu ? 'آمدنی' : 'Revenue') : (isUrdu && cat?.labelUr ? cat.labelUr : cat?.label)}
                        {e.description && <span className="text-gray-500"> — {e.description}</span>}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString()} • {e.cropName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-bold ${e.isRevenue ? 'text-green-600' : 'text-red-600'}`}>
                      {e.isRevenue ? '+' : '-'}PKR {e.amountPKR.toLocaleString()}
                    </span>
                    <button onClick={() => handleDelete(e._id)} className="text-gray-400 hover:text-red-600">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-gray-400 hover:text-gray-600">
              <FiX size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4">{isUrdu ? 'نیا ریکارڈ' : 'Add Record'}</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button onClick={() => setForm({ ...form, isRevenue: false })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${!form.isRevenue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                  📉 {isUrdu ? 'خرچ' : 'Expense'}
                </button>
                <button onClick={() => setForm({ ...form, isRevenue: true })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${form.isRevenue ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  📈 {isUrdu ? 'آمدنی' : 'Revenue'}
                </button>
              </div>

              {!form.isRevenue && (
                <Select label={isUrdu ? 'زمرہ' : 'Category'} value={form.category} onChange={set('category')}
                  options={CATEGORIES.map(c => ({ value: c.value, label: `${c.emoji} ${isUrdu ? c.labelUr : c.label}` }))} />
              )}

              <Input label={isUrdu ? 'رقم (PKR)' : 'Amount (PKR)'} type="number" min="0"
                value={form.amountPKR} onChange={set('amountPKR')} placeholder="5000" />

              <Select label={isUrdu ? 'فصل' : 'Crop'} value={form.cropName} onChange={set('cropName')}
                options={['Wheat','Rice','Cotton','Sugarcane','Maize','Potato','Tomato','Mango']} />

              <Input label={isUrdu ? 'تاریخ' : 'Date'} type="date" value={form.date} onChange={set('date')} />

              {form.isRevenue && (
                <div className="grid grid-cols-2 gap-3">
                  <Input label={isUrdu ? 'مقدار (من)' : 'Quantity (Maund)'} type="number"
                    value={form.quantityMaunds} onChange={set('quantityMaunds')} />
                  <Input label={isUrdu ? 'قیمت/من' : 'Price/Maund'} type="number"
                    value={form.pricePerMaund} onChange={set('pricePerMaund')} />
                </div>
              )}

              <Textarea label={isUrdu ? 'تفصیل (اختیاری)' : 'Description (optional)'}
                rows={2} value={form.description} onChange={set('description')} />

              <Button onClick={handleSubmit} className="w-full">
                {isUrdu ? 'محفوظ کریں' : 'Save Record'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
