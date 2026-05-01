import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../../components/ui/FormControls';
import api from '../../services/api';
import {
  FiArrowLeft, FiCamera, FiUpload, FiX, FiZap,
  FiCheckCircle, FiAlertTriangle, FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CropIdentifier() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);
  const camRef = useRef(null);

  const onFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const identify = async () => {
    if (!image) {
      toast.error(isUrdu ? 'پہلے تصویر اپ لوڈ کریں' : 'Please upload an image first');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('language', i18n.language);
      const res = await api.post('/crop-id', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.data);
      toast.success(isUrdu ? 'AI تجزیہ مکمل!' : 'AI analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-fade-in-up">
      <div>
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-3">
          <FiArrowLeft size={14} /> {isUrdu ? 'ٹولز پر واپس' : 'Back to Tools'}
        </Link>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">🌾</div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{isUrdu ? 'AI فصل کی شناخت' : 'AI Crop Identification'}</h1>
              <p className="text-purple-100 text-xs sm:text-sm mt-0.5 line-clamp-2">
                {isUrdu ? 'تصویر اپ لوڈ کریں — AI فصل کا نام، صحت اور بڑھنے کے ٹِپس بتائے گا' : 'Upload a photo — AI identifies the crop, health, and growing tips'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upload */}
        <Card title={isUrdu ? 'تصویر' : 'Crop Image'}>
          {preview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
              <button onClick={reset}
                className="absolute top-2 right-2 rtl:left-2 rtl:right-auto w-9 h-9 bg-black/50 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-black/70">
                <FiX size={15} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-purple-300 hover:bg-purple-50/30 transition">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiUpload size={26} />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {isUrdu ? 'پودے یا فصل کی تصویر اپ لوڈ کریں' : 'Upload a clear photo of any crop or plant'}
              </p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
                  <FiUpload size={14} /> {isUrdu ? 'اپ لوڈ' : 'Upload'}
                </button>
                <button onClick={() => camRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                  <FiCamera size={14} /> {isUrdu ? 'کیمرا' : 'Camera'}
                </button>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />

          {preview && (
            <Button onClick={identify} loading={loading} icon={FiZap} className="w-full mt-4">
              {loading
                ? (isUrdu ? 'AI تجزیہ ہو رہا ہے...' : 'AI analyzing...')
                : (isUrdu ? 'فصل پہچانیں' : 'Identify Crop')}
            </Button>
          )}
        </Card>

        {/* Result */}
        <Card title={isUrdu ? 'نتیجہ' : 'Result'}>
          {!result ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-sm">{isUrdu ? 'تصویر اپ لوڈ کریں اور تجزیہ کریں' : 'Upload an image to begin'}</p>
            </div>
          ) : result.cropName === 'Not a crop' || result.confidence === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">❌</div>
              <h3 className="font-bold text-gray-900 mb-1">{isUrdu ? 'فصل نہیں ملی' : 'No crop detected'}</h3>
              <p className="text-xs text-gray-500">{result.healthNotes}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-900">
                      {isUrdu ? result.cropNameUrdu || result.cropName : result.cropName}
                    </h3>
                    {result.scientificName && <p className="text-xs italic text-purple-700">{result.scientificName}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {result.category && (
                        <span className="text-[10px] bg-white text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase">
                          {result.category}
                        </span>
                      )}
                      {result.growthStage && (
                        <span className="text-[10px] bg-white text-purple-700 px-2 py-0.5 rounded-full font-bold capitalize">
                          {result.growthStage.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-purple-700">{result.confidence}%</div>
                    <div className="text-[10px] text-purple-600 uppercase">{isUrdu ? 'اعتماد' : 'Confidence'}</div>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border ${
                result.isHealthy ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'
              }`}>
                <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-2">
                  {result.isHealthy ? <FiCheckCircle className="text-green-600" /> : <FiAlertTriangle className="text-amber-600" />}
                  {isUrdu ? 'صحت' : 'Health Status'}
                </h4>
                <p className="text-sm text-gray-700">
                  {isUrdu && result.healthNotesUrdu ? result.healthNotesUrdu : result.healthNotes}
                </p>
              </div>

              {result.growingTips && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h4 className="font-semibold text-sm text-blue-900 mb-1.5 flex items-center gap-2">
                    <FiInfo size={14} /> {isUrdu ? 'بڑھنے کے ٹِپس' : 'Growing Tips'}
                  </h4>
                  <p className="text-sm text-blue-900 leading-relaxed">
                    {isUrdu && result.growingTipsUrdu ? result.growingTipsUrdu : result.growingTips}
                  </p>
                </div>
              )}

              {result.commonDiseases?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                    🦠 {isUrdu ? 'عام بیماریاں' : 'Common Diseases'}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.commonDiseases.map((d, i) => (
                      <span key={i} className="text-[11px] bg-red-50 text-red-700 px-2.5 py-1 rounded-lg font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Link to="/disease"
                className="block text-center bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                🔬 {isUrdu ? 'بیماری کی جانچ کریں' : 'Scan for Diseases'}
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
