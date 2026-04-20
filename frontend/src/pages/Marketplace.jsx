import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { marketplaceAPI } from '../services/api';
import { Input, Select, Button, Card, Textarea } from '../components/ui/FormControls';
import { FiShoppingCart, FiPlus, FiMapPin, FiPhone, FiMail, FiEye, FiX, FiSearch, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Marketplace() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [tab, setTab] = useState('browse');
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [filters, setFilters] = useState({ crop: '', province: '', search: '' });

  const [form, setForm] = useState({
    cropName: 'Wheat', title: '', description: '',
    quantity: '', unit: 'Maund', pricePerUnit: '',
    quality: 'standard', harvestDate: '', readyBy: '',
    contactPreference: 'all'
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'browse') {
        const res = await marketplaceAPI.list(filters);
        setListings(res.data.data || []);
      } else {
        const res = await marketplaceAPI.mine();
        setMyListings(res.data.data || []);
      }
    } catch (err) { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab, filters.crop, filters.province]);

  const handleSubmit = async () => {
    if (!form.title || !form.quantity || !form.pricePerUnit) {
      toast.error(isUrdu ? 'ضروری فیلڈز بھریں' : 'Fill required fields');
      return;
    }
    try {
      await marketplaceAPI.create({
        ...form,
        quantity: parseFloat(form.quantity),
        pricePerUnit: parseFloat(form.pricePerUnit)
      });
      toast.success(isUrdu ? 'فہرست شائع ہو گئی!' : 'Listing published!');
      setShowForm(false);
      setForm({ ...form, title: '', description: '', quantity: '', pricePerUnit: '' });
      setTab('mine');
      load();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isUrdu ? 'حذف کریں؟' : 'Delete listing?')) return;
    await marketplaceAPI.delete(id);
    load();
  };

  const handleInquire = async (id) => {
    try {
      await marketplaceAPI.inquire(id);
    } catch {}
  };

  const qualityBadge = {
    premium: { en: 'Premium', ur: 'پریمیم', color: 'bg-purple-100 text-purple-700' },
    standard: { en: 'Standard', ur: 'معیاری', color: 'bg-blue-100 text-blue-700' },
    regular: { en: 'Regular', ur: 'عام', color: 'bg-gray-100 text-gray-700' }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 sm:p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              🛒 <span className="truncate">{isUrdu ? 'کسان بازار' : 'Farmer Marketplace'}</span>
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm mt-1 line-clamp-2">
              {isUrdu ? 'براہ راست خریداروں کو فروخت کریں' : 'Sell directly to buyers — skip the middleman'}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} icon={FiPlus} variant="outline" className="bg-white text-purple-600 border-white hover:bg-purple-50 text-xs sm:text-sm shrink-0">
            {isUrdu ? 'نئی فہرست' : 'New Listing'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTab('browse')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition ${
            tab === 'browse' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}>
          <FiSearch size={16} /> {isUrdu ? 'براؤز کریں' : 'Browse'}
        </button>
        <button onClick={() => setTab('mine')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition ${
            tab === 'mine' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}>
          <FiPackage size={16} /> {isUrdu ? 'میری فہرستیں' : 'My Listings'}
        </button>
      </div>

      {/* Filters for Browse */}
      {tab === 'browse' && (
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            <Input icon={FiSearch} placeholder={isUrdu ? 'تلاش کریں' : 'Search...'}
              value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && load()} />
            <Select placeholder={isUrdu ? 'فصل' : 'Crop'}
              value={filters.crop} onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
              options={[
                { value: '', label: isUrdu ? 'تمام فصلیں' : 'All Crops' },
                'Wheat','Rice','Cotton','Sugarcane','Maize','Potato','Tomato','Onion','Mango'
              ]} />
            <Select
              value={filters.province} onChange={(e) => setFilters({ ...filters, province: e.target.value })}
              options={[
                { value: '', label: isUrdu ? 'تمام صوبے' : 'All Provinces' },
                'Punjab','Sindh','KPK','Balochistan'
              ]} />
          </div>
        </Card>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">{isUrdu ? 'لوڈ ہو رہا ہے' : 'Loading...'}</div>
      ) : (tab === 'browse' ? listings : myListings).length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl">
          <FiShoppingCart className="mx-auto mb-3 text-gray-300" size={64} />
          <p>{isUrdu ? 'کوئی فہرست نہیں' : 'No listings yet'}</p>
          {tab === 'mine' && (
            <Button onClick={() => setShowForm(true)} className="mt-4">
              {isUrdu ? 'پہلی فہرست بنائیں' : 'Create First Listing'}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(tab === 'browse' ? listings : myListings).map((l) => (
            <div key={l._id}
              className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">🌾</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${qualityBadge[l.quality]?.color}`}>
                    {isUrdu ? qualityBadge[l.quality]?.ur : qualityBadge[l.quality]?.en}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 mb-1 truncate">{l.title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                  <FiPackage size={12} /> {l.cropName}
                </p>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3">
                  <p className="text-2xl font-bold text-green-700">PKR {l.pricePerUnit?.toLocaleString()}</p>
                  <p className="text-xs text-green-600">per {l.unit}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    📦 {l.quantity} {l.unit} available
                  </p>
                </div>

                {l.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">{l.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <FiMapPin size={12} /> {l.city || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiEye size={12} /> {l.views || 0}
                  </span>
                </div>

                <div className="flex gap-2">
                  {tab === 'browse' ? (
                    <Button onClick={() => { setSelectedListing(l); handleInquire(l._id); }} className="w-full">
                      {isUrdu ? 'خریدار سے رابطہ' : 'Contact Seller'}
                    </Button>
                  ) : (
                    <Button onClick={() => handleDelete(l._id)} variant="danger" className="w-full">
                      {isUrdu ? 'حذف کریں' : 'Delete'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Listing Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-gray-400 hover:text-gray-600">
              <FiX size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4">{isUrdu ? 'نئی فہرست بنائیں' : 'Create New Listing'}</h3>
            <div className="space-y-4">
              <Select label={isUrdu ? 'فصل' : 'Crop'} value={form.cropName} onChange={set('cropName')}
                options={['Wheat','Rice','Cotton','Sugarcane','Maize','Potato','Tomato','Onion','Mango']} />
              <Input label={isUrdu ? 'عنوان' : 'Title'} value={form.title} onChange={set('title')}
                placeholder={isUrdu ? 'مثلاً: اعلی معیار کی گندم' : 'e.g. Premium Quality Wheat'} />
              <div className="grid grid-cols-3 gap-3">
                <Input label={isUrdu ? 'مقدار' : 'Quantity'} type="number" value={form.quantity} onChange={set('quantity')} />
                <Select label={isUrdu ? 'یونٹ' : 'Unit'} value={form.unit} onChange={set('unit')}
                  options={['Maund','KG','Ton','Quintal']} />
                <Input label={isUrdu ? 'قیمت/یونٹ' : 'Price/unit'} type="number" value={form.pricePerUnit} onChange={set('pricePerUnit')} />
              </div>
              <Select label={isUrdu ? 'معیار' : 'Quality'} value={form.quality} onChange={set('quality')}
                options={[
                  { value: 'premium', label: isUrdu ? 'پریمیم' : 'Premium' },
                  { value: 'standard', label: isUrdu ? 'معیاری' : 'Standard' },
                  { value: 'regular', label: isUrdu ? 'عام' : 'Regular' }
                ]} />
              <Textarea label={isUrdu ? 'تفصیل' : 'Description'} rows={3}
                value={form.description} onChange={set('description')}
                placeholder={isUrdu ? 'فصل کی معیار، مقام، وغیرہ' : 'Quality details, location info, etc.'} />
              <div className="grid grid-cols-2 gap-3">
                <Input label={isUrdu ? 'کٹائی کی تاریخ' : 'Harvest Date'} type="date" value={form.harvestDate} onChange={set('harvestDate')} />
                <Input label={isUrdu ? 'ڈلیوری کب' : 'Ready By'} type="date" value={form.readyBy} onChange={set('readyBy')} />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {isUrdu ? 'فہرست شائع کریں' : 'Publish Listing'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedListing(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setSelectedListing(null)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-gray-400">
              <FiX size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4">{isUrdu ? 'فروخت کنندہ سے رابطہ' : 'Contact Seller'}</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-bold text-gray-800">{selectedListing.sellerID?.fullName}</p>
                <p className="text-sm text-gray-500 mt-1">📍 {selectedListing.city}, {selectedListing.province}</p>
              </div>
              {selectedListing.sellerID?.phone && (
                <a href={`tel:${selectedListing.sellerID.phone}`}
                  className="flex items-center gap-3 bg-green-50 hover:bg-green-100 p-4 rounded-xl transition">
                  <FiPhone className="text-green-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">{isUrdu ? 'فون' : 'Phone'}</p>
                    <p className="font-bold text-green-700">{selectedListing.sellerID.phone}</p>
                  </div>
                </a>
              )}
              {selectedListing.sellerID?.email && (
                <a href={`mailto:${selectedListing.sellerID.email}`}
                  className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 p-4 rounded-xl transition">
                  <FiMail className="text-blue-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">{isUrdu ? 'ای میل' : 'Email'}</p>
                    <p className="font-bold text-blue-700">{selectedListing.sellerID.email}</p>
                  </div>
                </a>
              )}
              {selectedListing.sellerID?.phone && (
                <a href={`https://wa.me/${selectedListing.sellerID.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 bg-emerald-50 hover:bg-emerald-100 p-4 rounded-xl transition">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="text-xs text-gray-500">WhatsApp</p>
                    <p className="font-bold text-emerald-700">{isUrdu ? 'پیغام بھیجیں' : 'Send Message'}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
