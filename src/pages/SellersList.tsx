import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Phone, Star } from 'lucide-react';
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
  { id: 'vendor_001', name: 'الکترو نیرو پارس', city: 'تهران', address: 'خیابان لاله‌زار جنوبی، پلاک ۱۲', lat: 35.6892, lng: 51.3890, rating: 4.8, phone: '021-12345678', type: 'تجهیزات خورشیدی' },
  { id: 'vendor_002', name: 'سولار سیستم البرز', city: 'کرج', address: 'میدان کرج، مجتمع تجاری البرز', lat: 35.8327, lng: 50.9915, rating: 4.5, phone: '026-87654321', type: 'پنل و اینورتر' },
  { id: 'vendor_003', name: 'نیرو گستران مرکز', city: 'اصفهان', address: 'خیابان فردوسی، ساختمان نیرو', lat: 32.6539, lng: 51.6660, rating: 4.9, phone: '031-33334444', type: 'موتور برق و ژنراتور' },
  { id: 'vendor_004', name: 'تجهیزات انرژی نوین', city: 'تهران', address: 'خیابان جمهوری، پاساژ امجد', lat: 35.6961, lng: 51.4116, rating: 4.6, phone: '021-66667777', type: 'باتری و یو‌پی‌اس' },
];

export default function SellersList() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // fallback to Tehran center if denied
          setUserLocation([35.6892, 51.3890]);
        }
      );
    } else {
      setUserLocation([35.6892, 51.3890]);
    }
  }, []);

  if (!userLocation) {
    return <div className="p-8 text-center">در حال یافتن موقعیت شما...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-8rem)] flex flex-col sm:flex-row gap-4 sm:gap-6"
    >
      <div className="w-full sm:w-1/3 flex flex-col gap-4 order-2 sm:order-1 h-1/2 sm:h-full">
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-sm shrink-0">
          <h2 className="text-lg font-bold text-[#1A1D23] mb-1">لیست فروشندگان همکار</h2>
          <p className="text-xs text-[#5A6072]">نزدیک‌ترین تأمین‌کنندگان تجهیزات انرژی</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {mockVendors.map(vendor => (
            <div key={vendor.id} className="bg-white p-4 rounded-xl border border-[#E4E7EC] hover:border-[#1F9254] transition-colors shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[#1A1D23]">{vendor.name}</h3>
                  <div className="text-[10px] bg-[#F7F8FA] px-2 py-1 rounded text-[#5A6072] inline-block mt-1">
                    {vendor.type}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#FFF9E6] text-[#F5A623] px-2 py-1 rounded text-xs font-bold">
                  <Star size={12} className="fill-[#F5A623]" />
                  {vendor.rating}
                </div>
              </div>
              
              <div className="text-xs text-[#5A6072] flex items-start gap-1.5">
                <MapPin size={14} className="shrink-0 mt-0.5 text-[#1F9254]" />
                <span>{vendor.city}، {vendor.address}</span>
              </div>
              
              <div className="flex gap-2 mt-1">
                <Link 
                  to={`/vendor/${vendor.id}`} 
                  className="flex-1 bg-[#1A1D23] text-white text-xs py-2 rounded-lg text-center font-bold hover:bg-black transition-colors"
                >
                  فروشگاه
                </Link>
                <a 
                  href={`geo:${vendor.lat},${vendor.lng}?q=${vendor.lat},${vendor.lng}`}
                  className="w-10 bg-[#1F9254]/10 text-[#1F9254] flex items-center justify-center rounded-lg hover:bg-[#1F9254]/20 transition-colors"
                  title="مسیریابی"
                >
                  <Navigation size={16} />
                </a>
                <a 
                  href={`tel:${vendor.phone}`}
                  className="w-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors"
                  title="تماس"
                >
                  <Phone size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full sm:w-2/3 h-1/2 sm:h-full bg-white rounded-2xl border border-[#E4E7EC] shadow-sm overflow-hidden order-1 sm:order-2 z-0 relative">
        <MapContainer 
          center={userLocation} 
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User Location Marker */}
          <Marker position={userLocation}>
            <Popup>موقعیت تقریبی شما</Popup>
          </Marker>

          {/* Vendors Markers */}
          {mockVendors.map(vendor => (
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
  );
}
