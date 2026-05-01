import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  FiCamera, FiUpload, FiSearch, FiAlertTriangle, FiCheckCircle,
  FiVolume2, FiVolumeX, FiSend, FiMessageCircle, FiX, FiChevronDown,
  FiMic, FiMicOff, FiZap, FiRefreshCw
} from 'react-icons/fi';
import api from '../services/api';
import useVoiceInput from '../hooks/useVoiceInput';

export default function DiseaseDetection() {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [speaking, setSpeaking] = useState(false);
  const speechRef = useRef(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const voice = useVoiceInput({
    language: i18n.language,
    onResult: (text) => setChatInput(text)
  });

  const crops = [
    { en: 'Wheat', ur: 'گندم', emoji: '🌾' },
    { en: 'Rice', ur: 'چاول', emoji: '🌾' },
    { en: 'Cotton', ur: 'کپاس', emoji: '🌿' },
    { en: 'Sugarcane', ur: 'گنا', emoji: '🎋' },
    { en: 'Tomato', ur: 'ٹماٹر', emoji: '🍅' },
    { en: 'Potato', ur: 'آلو', emoji: '🥔' },
    { en: 'Mango', ur: 'آم', emoji: '🥭' },
    { en: 'Onion', ur: 'پیاز', emoji: '🧅' },
  ];

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
  useEffect(() => () => { if (speechRef.current) window.speechSynthesis.cancel(); }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!image && !description) {
      toast.error(isUrdu ? 'تصویر یا علامات ضروری ہیں' : 'Image or symptoms required');
      return;
    }
    setScanning(true);
    setResult(null);
    try {
      const formData = new FormData();
      if (image) formData.append('image', image);
      if (description) formData.append('description', description);
      if (selectedCrop) formData.append('crop', selectedCrop);
      const res = await api.post('/disease/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Suppress the global axios error toast — we render off-topic inline.
        _silentToast: true
      });
      setResult(res.data.data);
      toast.success(isUrdu ? 'تشخیص مکمل!' : 'Diagnosis ready!');
    } catch (err) {
      const data = err.response?.data;
      if (data?.offTopic) {
        // Render off-topic as a structured result card, not a toast
        setResult({ offTopic: true, message: isUrdu ? data.messageUrdu : data.message, subject: data.subject });
      } else {
        toast.error(data?.message || 'Detection failed');
      }
    } finally { setScanning(false); }
  };

  const resetScan = () => {
    setImage(null); setImagePreview(null); setDescription(''); setResult(null);
  };

  const speakResult = (text, lang = 'ur') => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang === 'ur' ? 'ur' : 'en')) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    speechRef.current = utterance;
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getFullSpeechText = (lang) => {
    if (!result?.disease) return '';
    const d = result.disease;
    return lang === 'ur'
      ? `بیماری: ${d.nameUrdu}۔ فصل: ${d.cropUrdu}۔ علامات: ${d.symptomsUrdu}۔ وجہ: ${d.causeUrdu}۔ علاج: ${d.solutionUrdu}`
      : `Disease: ${d.name}. Crop: ${d.crop}. Symptoms: ${d.symptoms}. Cause: ${d.cause}. Solution: ${d.solution}`;
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await api.post('/disease/chat', {
        message: userMsg, language: i18n.language, history: chatMessages.slice(-10)
      });
      const data = res.data.data || {};
      setChatMessages(prev => [...prev, {
        role: 'bot',
        text: data.reply,
        offTopic: !!data.offTopic
      }]);
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'bot',
        text: isUrdu ? 'معذرت، دوبارہ کوشش کریں' : 'Sorry, please try again.'
      }]);
    } finally { setChatLoading(false); }
  };

  const severityColor = {
    high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' }
  };
  const severityLabel = {
    high: { en: 'Severe', ur: 'شدید' },
    medium: { en: 'Moderate', ur: 'معتدل' },
    low: { en: 'Mild', ur: 'ہلکا' }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-40 sm:w-56 h-40 sm:h-56 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="relative flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">
            🔬
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              {isUrdu ? 'بیماری اسکینر' : 'Disease Scanner'}
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-none">
              {isUrdu
                ? 'AI کے ذریعے فوری تشخیص — پاکستانی برانڈز کے ساتھ'
                : 'AI-powered diagnosis with Pakistan-specific treatments'}
            </p>
            <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
              <span className="text-[10px] sm:text-[11px] bg-white/15 backdrop-blur px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium">🧠 AI</span>
              <span className="text-[10px] sm:text-[11px] bg-white/15 backdrop-blur px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium">🖼 ML</span>
              <span className="text-[10px] sm:text-[11px] bg-white/15 backdrop-blur px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium">🇵🇰 Pakistan</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* LEFT: Scanner Form */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Step 1: Image */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 card-soft">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-xs font-bold">1</div>
              <h3 className="font-bold text-gray-900 text-sm">
                {isUrdu ? 'پتے کی تصویر' : 'Upload Leaf Image'}
              </h3>
            </div>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden group">
                <img src={imagePreview} alt="Scan" className="w-full h-56 object-cover" />
                <button onClick={() => { setImage(null); setImagePreview(null); setResult(null); }}
                  className="absolute top-2 right-2 rtl:left-2 rtl:right-auto w-9 h-9 bg-black/50 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-black/70 transition">
                  <FiX size={15} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 hover:bg-purple-50/30 transition-colors">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FiUpload size={22} />
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  {isUrdu ? 'تصویر اپ لوڈ کریں یا کیمرے سے لیں' : 'Upload image or take photo'}
                </p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition">
                    <FiUpload size={13} /> {isUrdu ? 'اپ لوڈ' : 'Upload'}
                  </button>
                  <button onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition">
                    <FiCamera size={13} /> {isUrdu ? 'کیمرا' : 'Camera'}
                  </button>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
          </div>

          {/* Step 2: Crop selection */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 card-soft">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-xs font-bold">2</div>
              <h3 className="font-bold text-gray-900 text-sm">
                {isUrdu ? 'فصل منتخب کریں' : 'Select Crop'} <span className="text-gray-400 font-normal text-xs">({isUrdu ? 'اختیاری' : 'optional'})</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {crops.map(c => (
                <button key={c.en} onClick={() => setSelectedCrop(selectedCrop === c.en ? '' : c.en)}
                  className={`py-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-0.5 ${
                    selectedCrop === c.en
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-100 bg-gray-50 hover:border-purple-200'
                  }`}>
                  <span className="text-lg">{c.emoji}</span>
                  <span className="text-[10px] font-semibold text-gray-700">{isUrdu ? c.ur : c.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 card-soft">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-xs font-bold">3</div>
              <h3 className="font-bold text-gray-900 text-sm">
                {isUrdu ? 'علامات بیان کریں' : 'Describe Symptoms'} <span className="text-gray-400 font-normal text-xs">({isUrdu ? 'اختیاری' : 'optional'})</span>
              </h3>
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none resize-none bg-gray-50"
              placeholder={isUrdu ? 'مثلاً: پتوں پر پیلے دھبے ہیں...' : 'e.g. Yellow spots on leaves with brown edges...'} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={handleScan} disabled={scanning || (!image && !description)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all">
              {scanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  {isUrdu ? 'اسکین ہو رہا ہے...' : 'Analyzing...'}
                </>
              ) : (
                <>
                  <FiZap size={16} />
                  {isUrdu ? 'اسکین کریں' : 'Scan Disease'}
                </>
              )}
            </button>
            {(result || image) && (
              <button onClick={resetScan}
                className="px-4 py-3.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
                title={isUrdu ? 'ری سیٹ' : 'Reset'}>
                <FiRefreshCw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Results Panel */}
        <div className="lg:col-span-3">
          {result?.offTopic ? (
            <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden card-soft animate-fade-in-up">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-5 sm:px-7 py-6 sm:py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl">🌾❌</div>
                <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2">
                  {isUrdu ? 'یہ زراعت سے متعلق نہیں' : 'Not an agriculture-related image'}
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed max-w-md mx-auto">
                  {result.message}
                </p>
                {result.subject && (
                  <p className="text-[11px] text-amber-700/80 mt-3">
                    {isUrdu ? 'تصویر میں دیکھا گیا:' : 'Detected in image:'} <span className="font-semibold">{result.subject}</span>
                  </p>
                )}
              </div>
              <div className="p-5 bg-white border-t border-amber-100 text-center">
                <p className="text-xs text-gray-500 mb-3">
                  {isUrdu
                    ? 'مثالیں: پتے کی تصویر، فصل کے کھیت، پھل، مٹی، یا کیڑے'
                    : 'Examples that work: a leaf photo, crop field, fruit, soil, or pest insect'}
                </p>
                <button onClick={resetScan}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                  <FiRefreshCw size={14} /> {isUrdu ? 'دوبارہ کوشش کریں' : 'Try Another Image'}
                </button>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Main result card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-soft">
                {/* Header strip */}
                <div className={`${severityColor[result.disease.severity]?.bg} border-b ${severityColor[result.disease.severity]?.border} px-5 py-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${severityColor[result.disease.severity]?.text}`}>
                          <span className={`w-2 h-2 rounded-full ${severityColor[result.disease.severity]?.dot} animate-pulse`} />
                          {isUrdu ? severityLabel[result.disease.severity].ur : severityLabel[result.disease.severity].en}
                        </span>
                        {result.source && (
                          <span className="text-[10px] bg-white/80 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
                            {result.source.includes('gemini') && result.source.includes('huggingface') ? '🧠 AI + ML' :
                             result.source === 'gemini' ? '🧠 AI' :
                             result.source.includes('huggingface') ? '🔬 ML' : '📚 KB'}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        {isUrdu ? result.disease.nameUrdu : result.disease.name}
                      </h2>
                      {result.disease.scientificName && (
                        <p className="text-xs italic text-gray-600 mt-0.5">{result.disease.scientificName}</p>
                      )}
                      <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                        🌱 {isUrdu ? result.disease.cropUrdu : result.disease.crop}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-gray-900">{result.confidence}%</div>
                      <div className="text-[10px] text-gray-500 uppercase">{isUrdu ? 'اعتماد' : 'Confidence'}</div>
                    </div>
                  </div>
                </div>

                {/* Listen buttons */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex gap-2">
                  <button onClick={() => speakResult(getFullSpeechText('ur'), 'ur')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      speaking ? 'bg-red-100 text-red-700' : 'bg-white hover:bg-green-50 text-green-700 border border-gray-200'
                    }`}>
                    {speaking ? <FiVolumeX size={13} /> : <FiVolume2 size={13} />}
                    {speaking ? (isUrdu ? 'بند کریں' : 'Stop') : 'اردو'}
                  </button>
                  <button onClick={() => speakResult(getFullSpeechText('en'), 'en')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      speaking ? 'bg-red-100 text-red-700' : 'bg-white hover:bg-blue-50 text-blue-700 border border-gray-200'
                    }`}>
                    {speaking ? <FiVolumeX size={13} /> : <FiVolume2 size={13} />}
                    {speaking ? (isUrdu ? 'بند کریں' : 'Stop') : 'English'}
                  </button>
                </div>

                {/* Content sections */}
                <div className="p-5 space-y-4">
                  {/* Symptoms */}
                  <section>
                    <h4 className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs">🔍</span>
                      {isUrdu ? 'علامات' : 'Symptoms'}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed pl-8 rtl:pr-8 rtl:pl-0">
                      {isUrdu ? result.disease.symptomsUrdu : result.disease.symptoms}
                    </p>
                  </section>

                  {/* Cause */}
                  <section className="pt-2 border-t border-gray-100">
                    <h4 className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-2">
                      <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-xs">
                        <FiAlertTriangle size={12} />
                      </span>
                      {isUrdu ? 'وجہ اور پھیلاؤ' : 'Cause & Spread'}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed pl-8 rtl:pr-8 rtl:pl-0">
                      {isUrdu ? result.disease.causeUrdu : result.disease.cause}
                    </p>
                  </section>

                  {/* Solution */}
                  <section className="pt-2 border-t border-gray-100">
                    <h4 className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-2">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xs">
                        <FiCheckCircle size={12} />
                      </span>
                      {isUrdu ? 'علاج اور حل' : 'Treatment & Solution'}
                    </h4>
                    <div className="pl-8 rtl:pr-8 rtl:pl-0">
                      <div className="bg-green-50 border border-green-100 rounded-xl p-3.5 text-sm text-green-900 whitespace-pre-line leading-relaxed">
                        {isUrdu ? result.disease.solutionUrdu : result.disease.solution}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center min-h-[400px] flex flex-col justify-center">
              <div className="text-7xl mb-4">🌿</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                {isUrdu ? 'تشخیص کا انتظار' : 'Ready to Diagnose'}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {isUrdu
                  ? 'بائیں طرف سے تصویر اپ لوڈ کریں یا علامات بیان کریں، اور "اسکین کریں" دبائیں'
                  : 'Upload a leaf image or describe symptoms on the left, then click "Scan Disease"'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rtl:left-4 sm:rtl:left-6 rtl:right-auto z-50">
        {chatOpen ? (
          <div className="bg-white rounded-2xl card-floating border border-gray-100 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] max-h-[80vh] sm:max-h-[520px] flex flex-col animate-fade-in-up overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm">🤖</div>
                <div>
                  <span className="font-bold text-sm">
                    {isUrdu ? 'زرعی مشیر' : 'Farming Assistant'}
                  </span>
                  <p className="text-[10px] text-green-100">AI-powered • Online</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center">
                <FiChevronDown size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/30" style={{ maxHeight: '340px', minHeight: '240px' }}>
              {chatMessages.length === 0 && (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-sm text-gray-500 mb-3">
                    {isUrdu ? 'فصل کی بیماری یا کھیتی کے بارے میں پوچھیں' : 'Ask about crops, diseases, or farming'}
                  </p>
                  <div className="space-y-1.5">
                    {[
                      isUrdu ? 'گندم پر زنگ کا علاج کیا ہے؟' : 'How to treat wheat rust?',
                      isUrdu ? 'ٹماٹر کے پتے مڑ رہے ہیں' : 'Tomato leaves curling',
                      isUrdu ? 'کپاس پر سفید مکھی کا حل' : 'Cotton whitefly solution'
                    ].map((q, i) => (
                      <button key={i} onClick={() => setChatInput(q)}
                        className="block w-full text-left rtl:text-right text-xs bg-white border border-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition">
                        💡 {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : msg.offTopic
                        ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-sm'
                        : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm card-soft'
                  }`}>
                    {msg.offTopic && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 mb-1">
                        🌾❌ {isUrdu ? 'غیر زرعی سوال' : 'Off-topic'}
                      </div>
                    )}
                    <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                    {msg.role === 'bot' && !msg.offTopic && (
                      <button onClick={() => speakResult(msg.text, i18n.language)}
                        className="mt-1.5 text-[10px] text-green-600 hover:text-green-800 flex items-center gap-1">
                        <FiVolume2 size={11} /> {isUrdu ? 'سنیں' : 'Listen'}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 rounded-bl-sm card-soft">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-3 bg-white">
              <form onSubmit={(e) => { e.preventDefault(); sendChat(); }} className="flex gap-2">
                <input
                  type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none bg-gray-50"
                  placeholder={voice.listening ? (isUrdu ? '🎤 سن رہا ہوں...' : '🎤 Listening...') : (isUrdu ? 'پوچھیں یا بولیں...' : 'Type or speak...')}
                />
                {voice.supported && (
                  <button type="button" onClick={() => voice.listening ? voice.stop() : voice.start()}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                      voice.listening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}>
                    {voice.listening ? <FiMicOff size={15} /> : <FiMic size={15} />}
                  </button>
                )}
                <button type="submit" disabled={chatLoading || !chatInput.trim()}
                  className="w-10 h-10 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center">
                  <FiSend size={15} />
                </button>
              </form>
              {voice.supported && (
                <p className="text-[9.5px] text-gray-400 mt-1.5 text-center">
                  🎤 {isUrdu ? 'اردو یا انگریزی میں بولیں' : 'Speak in Urdu or English'}
                </p>
              )}
            </div>
          </div>
        ) : (
          <button onClick={() => setChatOpen(true)}
            className="group w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl shadow-xl shadow-green-300 hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center">
            <FiMessageCircle size={22} />
            <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto w-3.5 h-3.5 bg-green-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto w-3.5 h-3.5 bg-green-500 rounded-full" />
          </button>
        )}
      </div>
    </div>
  );
}
