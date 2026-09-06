import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Phone, Star, Search, Filter, X, Scale, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix Leaflet's default icon path issues with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock vendors data with coordinates
const mockVendors = [
  { id: 'vendor_001', name: 'الکترو نیرو پارس', city: 'تهران', address: 'خیابان لاله‌زار جنوبی، پلاک ۱۲', lat: 35.6892, lng: 51.3890, rating: 4.8, phone: '021-12345678', type: 'تجهیزات خورشیدی', priceLevel: 'متوسط', services: ['نصب', 'پشتیبانی ۵ ساله', 'فروش اقساطی'] },
  { id: 'vendor_002', name: 'سولار سیستم البرز', city: 'کرج', address: 'میدان کرج، مجتمع تجاری البرز', lat: 35.8327, lng: 50.9915, rating: 4.5, phone: '026-87654321', type: 'پنل و اینورتر', priceLevel: 'اقتصادی', services: ['مشاوره رایگان', 'نصب در محل'] },
  { id: 'vendor_003', name: 'نیرو گستران مرکز', city: 'اصفهان', address: 'خیابان فردوسی، ساختمان نیرو', lat: 32.6539, lng: 51.6660, rating: 4.9, phone: '031-33334444', type: 'موتور برق و ژنراتور', priceLevel: 'پریمیوم', services: ['گارانتی ۱۰ ساله', 'خدمات ۲۴ ساعته'] },
  { id: 'vendor_004', name: 'تجهیزات انرژی نوین', city: 'تهران', address: 'خیابان جمهوری، پاساژ امجد', lat: 35.6961, lng: 51.4116, rating: 4.6, phone: '021-66667777', type: 'باتری و یو‌پی‌اس', priceLevel: 'متوسط', services: ['ارسال رایگان', 'نصب رایگان'] },
  { id: 'vendor_005', name: 'پارس سولار گستر', city: 'تبریز', address: 'خیابان امام، نرسیده به آبرسان', lat: 38.0734, lng: 46.2974, rating: 4.3, phone: '041-33332222', type: 'پنل خورشیدی', priceLevel: 'اقتصادی', services: ['پشتیبانی آنلاین', 'گارانتی ۳ ساله'] },
  { id: 'vendor_006', name: 'آفتاب تابان نوین', city: 'شیراز', address: 'بلوار زند، مجتمع پارس', lat: 29.6223, lng: 52.5366, rating: 4.7, phone: '071-32221111', type: 'سیستم‌های آف‌گرید', priceLevel: 'پریمیوم', services: ['طراحی اختصاصی', 'بازدید رایگان'] },
];

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);  
  const dLon = (lon2 - lon1) * (Math.PI / 180); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return Math.round(d);
}

export default function SellersList() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(5000); // basically no limit initially
  
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          setUserLocation([35.6892, 51.3890]);
        }
      );
    } else {
      setUserLocation([35.6892, 51.3890]);
    }
  }, []);

  if (!userLocation) {
    return <div className="p-8 text-center text-zinc-500">در حال یافتن موقعیت شما...</div>;
  }

  // Calculate distance for all vendors and filter
  const processedVendors = mockVendors.map(v => {
    const distance = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], v.lat, v.lng);
    return { ...v, distance };
  }).filter(v => {
    const matchesSearch = v.name.includes(searchTerm) || v.type.includes(searchTerm) || v.city.includes(searchTerm);
    const matchesRating = v.rating >= minRating;
    const matchesDistance = v.distance <= maxDistance;
    return matchesSearch && matchesRating && matchesDistance;
  }).sort((a, b) => a.distance - b.distance);

  const handleToggleCompare = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) return prev.filter(vid => vid !== id);
      if (prev.length >= 2) {
        alert("تنها ۲ تأمین‌کننده را می‌توانید برای مقایسه انتخاب کنید.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const compareVendors = mockVendors.filter(v => selectedForCompare.includes(v.id));

  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[calc(100vh-8rem)] flex flex-col sm:flex-row gap-4 sm:gap-6"
      >
        <div className="w-full sm:w-1/3 flex flex-col gap-4 order-2 sm:order-1 h-1/2 sm:h-full">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm shrink-0">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">لیست تأمین‌کنندگان</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">نزدیک‌ترین تأمین‌کنندگان تجهیزات انرژی</p>
            
            {/* Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute right-3 top-2.5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="جستجو (نام، شهر، زمینه...)" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pr-9 pl-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-zinc-500 mb-1">حداقل امتیاز</label>
                  <select 
                    value={minRating} 
                    onChange={e => setMinRating(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs outline-none"
                  >
                    <option value={0}>همه امتیازها</option>
                    <option value={4}>+۴ ستاره</option>
                    <option value={4.5}>+۴.۵ ستاره</option>
                    <option value={4.8}>+۴.۸ ستاره</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-zinc-500 mb-1">حداکثر فاصله</label>
                  <select 
                    value={maxDistance} 
                    onChange={e => setMaxDistance(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs outline-none"
                  >
                    <option value={5000}>همه فواصل</option>
                    <option value={20}>۲۰ کیلومتر</option>
                    <option value={50}>۵۰ کیلومتر</option>
                    <option value={200}>۲۰۰ کیلومتر</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {processedVendors.length === 0 ? (
              <div className="text-center p-6 text-sm text-zinc-500">موردی یافت نشد.</div>
            ) : processedVendors.map(vendor => (
              <div key={vendor.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 transition-colors shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{vendor.name}</h3>
                    <div className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400 inline-block mt-1">
                      {vendor.type}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded text-xs font-bold border border-amber-100 dark:border-amber-900/50">
                    <Star size={12} className="fill-amber-500" />
                    {vendor.rating}
                  </div>
                </div>
                
                <div className="text-xs text-zinc-500 flex flex-col gap-1.5 mt-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin size={14} className="shrink-0 mt-0.5 text-emerald-500" />
                    <span>{vendor.city}، {vendor.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <Navigation size={12} className="shrink-0" />
                    <span>فاصله: {vendor.distance} کیلومتر</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => handleToggleCompare(vendor.id)}
                    className={`flex-1 text-xs py-2 rounded-lg text-center font-bold transition-colors border flex items-center justify-center gap-1
                      ${selectedForCompare.includes(vendor.id) 
                        ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' 
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                      }`}
                  >
                    {selectedForCompare.includes(vendor.id) ? (
                      <><Check size={14} /> انتخاب شده</>
                    ) : (
                      <><Scale size={14} /> مقایسه</>
                    )}
                  </button>
                  <a 
                    href={`tel:${vendor.phone}`}
                    className="w-10 bg-green-50 text-green-600 flex items-center justify-center rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                    title="تماس"
                  >
                    <Phone size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-full sm:w-2/3 h-1/2 sm:h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden order-1 sm:order-2 z-0 relative">
          <MapContainer 
            center={userLocation} 
            zoom={11} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <Marker position={userLocation}>
              <Popup>موقعیت شما</Popup>
            </Marker>
            
            {processedVendors.map(vendor => (
              <Marker key={vendor.id} position={[vendor.lat, vendor.lng]}>
                <Popup>
                  <div className="text-right font-Vazirmatn" dir="rtl">
                    <strong className="block mb-1">{vendor.name}</strong>
                    <span className="text-xs text-gray-600 block mb-2">{vendor.type}</span>
                    <Link to={`/vendor/${vendor.id}`} className="text-blue-600 text-xs font-bold block">مشاهده فروشگاه &larr;</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </motion.div>

      {/* Floating Compare Button */}
      <AnimatePresence>
        {selectedForCompare.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-zinc-900 text-white px-6 py-3 rounded-full shadow-xl shadow-blue-900/20 flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-blue-400" />
              <span className="text-sm font-bold">{selectedForCompare.length} مورد برای مقایسه</span>
            </div>
            {selectedForCompare.length === 2 && (
              <button 
                onClick={() => setIsCompareModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
              >
                مشاهده مقایسه
              </button>
            )}
            <button 
              onClick={() => setSelectedForCompare([])}
              className="p-1 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {isCompareModalOpen && compareVendors.length === 2 && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                  <Scale className="text-blue-500" />
                  مقایسه تأمین‌کنندگان
                </h2>
                <button 
                  onClick={() => setIsCompareModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-3 gap-0 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  {/* Headers */}
                  <div className="col-span-1 bg-zinc-50 dark:bg-zinc-800/50 p-4 border-l border-b border-zinc-200 dark:border-zinc-800 font-medium text-sm text-zinc-500 flex items-center">
                    مشخصات
                  </div>
                  <div className="col-span-1 bg-white dark:bg-zinc-900 p-4 border-l border-b border-zinc-200 dark:border-zinc-800 text-center">
                    <h3 className="font-bold text-base text-blue-600 dark:text-blue-400">{compareVendors[0].name}</h3>
                  </div>
                  <div className="col-span-1 bg-white dark:bg-zinc-900 p-4 border-b border-zinc-200 dark:border-zinc-800 text-center">
                    <h3 className="font-bold text-base text-blue-600 dark:text-blue-400">{compareVendors[1].name}</h3>
                  </div>
                  
                  {/* Rating */}
                  <div className="col-span-1 bg-zinc-50 dark:bg-zinc-800/50 p-4 border-l border-b border-zinc-200 dark:border-zinc-800 font-medium text-sm text-zinc-500">
                    امتیاز کاربران
                  </div>
                  <div className="col-span-1 bg-white dark:bg-zinc-900 p-4 border-l border-b border-zinc-200 dark:border-zinc-800 text-center flex justify-center">
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded font-bold text-sm"><Star size={14} className="fill-amber-500"/> {compareVendors[0].rating}</span>
                  </div>
                  <div className="col-span-1 bg-white dark:bg-zinc-900 p-4 border-b border-zinc-200 dark:border-zinc-800 text-center flex justify-center">
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded font-bold text-sm"><Star size={14} className="fill-amber-500"/> {compareVendors[1].rating}</span>
                  </div>

                  {/* Distance */}
                  <div className="col-span-1 bg-zinc-50 dark:bg-zinc-800/50 p-4 border-l border-b border-zinc-200 dark:border-zinc-800 font-medium text-sm text-zinc-500">
                    فاصله تا شما
                  </div>
                  <div className="col-span-1 bg-white dark:bg-zinc-900 p-4 border-l border-b border-zinc-200 dark:border-zinc-800 text-center text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {getDistanceFromLatLonInKm(userLocation[0], userLocation[1], compareVendors[0].lat, compareVendors[0].lng)} کیلومتر
                  </div>
                  <div className="col-span-1 bg-white dark:bg-zinc-900 p-4 border-b border-zinc-200 dark:border-zinc-800 text-center text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {getDistanceFromLatLonInKm(userLocation[0], userLocation[1], compareVendors[1].lat, compareVendors[1].lng)} کیلومتر
                  </div>

                  {/* Price Level */}
                  <div className="col-span-1 bg-zinc-50 dark:bg-zinc-800/50 p-4 border-l border-b border-zinc-200 dark:border-zinc-800 font-medium text-sm text-zinc-500">
                    سطح قیمت
                  </div>
                  <div className="col-span-1 bg-white dark:bg-zinc-900 p-4 border-l border-b border-zinc-200 dark:border-zinc-800 text-center text-sm font-bold">
                    <span className={`px-2 py-1 rounded ${compareVendors[0].priceLevel === 'اقتصادی' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : compareVendors[0].priceLevel === 'پریمیوم' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {compareVendors[0].priceLevel}
                    </span>
                  </div>
                  <div className="col-span-1 bg-white dark:bg-zinc-900 p-4 border-b border-zinc-200 dark:border-zinc-800 text-center text-sm font-bold">
                    <span className={`px-2 py-1 rounded ${compareVendors[1].priceLevel === 'اقتصادی' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : compareVendors[1].priceLevel === 'پریمیوم' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {compareVendors[1].priceLevel}
                    </span>
                  </div>

                  {/* Services */}
                  <div className="col-span-1 bg-zinc-50 dark:bg-zinc-800/50 p-4 border-l border-zinc-200 dark:border-zinc-800 font-medium text-sm text-zinc-500">
                    خدمات ویژه
                  </div>
                  <div className="col-span-1 bg-white dark:bg-zinc-900 p-4 border-l border-zinc-200 dark:border-zinc-800">
                    <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                      {compareVendors[0].services.map((srv, i) => (
                        <li key={i} className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500"/> {srv}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-span-1 bg-white dark:bg-zinc-900 p-4 border-zinc-200 dark:border-zinc-800">
                    <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                      {compareVendors[1].services.map((srv, i) => (
                        <li key={i} className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500"/> {srv}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
