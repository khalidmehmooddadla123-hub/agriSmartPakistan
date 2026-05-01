import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiImage, FiX, FiLoader } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

/**
 * Reusable image uploader.
 *
 * @param {Array<string>} value - existing image URLs
 * @param {function} onChange - called with array of URLs when changes
 * @param {number} max - max images (default 5)
 * @param {boolean} single - if true, only one image (avatar mode)
 */
export default function ImageUploader({ value = [], onChange, max = 5, single = false }) {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (single && files.length > 1) files.splice(1);
    if (!single && (value.length + files.length) > max) {
      toast.error(isUrdu ? `زیادہ سے زیادہ ${max} تصویریں` : `Maximum ${max} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const newUrls = [];
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(isUrdu ? `تصویر بہت بڑی ہے (5MB سے زیادہ)` : 'Image too large (max 5MB)');
          continue;
        }
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newUrls.push(res.data.data.url);
      }
      onChange(single ? newUrls : [...value, ...newUrls]);
      toast.success(isUrdu ? 'اپ لوڈ ہو گیا' : 'Uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = (idx) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  };

  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
  const fullUrl = (url) => url.startsWith('http') ? url : `${apiBase}${url}`;

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
            <img src={fullUrl(url)} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
            <button type="button" onClick={() => remove(i)}
              className="absolute top-1 right-1 rtl:left-1 rtl:right-auto w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <FiX size={12} />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button type="button" onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-green-600 disabled:opacity-50">
            {uploading ? <FiLoader className="animate-spin" size={20} /> : <FiImage size={20} />}
            <span className="text-[10px] font-semibold">
              {uploading
                ? (isUrdu ? 'اپ لوڈ' : 'Uploading')
                : single
                  ? (isUrdu ? 'تصویر' : 'Photo')
                  : `${value.length}/${max}`}
            </span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple={!single} onChange={handleSelect} className="hidden" />
      <p className="text-[10px] text-gray-400 mt-2">
        {isUrdu ? 'JPG, PNG, WEBP — زیادہ سے زیادہ 5MB' : 'JPG, PNG, WEBP — max 5MB each'}
      </p>
    </div>
  );
}
