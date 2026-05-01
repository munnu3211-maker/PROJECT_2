import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiExternalLink, FiSearch } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// State-wise ECI data with coordinates
const STATES_DATA = {
  'Andhra Pradesh': { abbr: 'AP', lokSabha: 25, rajyaSabha: 11, assemblies: 175, capital: 'Amaravati', voters: '4.14 Cr', phases: 1, coords: [15.9129, 79.7400] },
  'Arunachal Pradesh': { abbr: 'AR', lokSabha: 2, rajyaSabha: 1, assemblies: 60, capital: 'Itanagar', voters: '8.5 L', phases: 1, coords: [28.2180, 94.7278] },
  'Assam': { abbr: 'AS', lokSabha: 14, rajyaSabha: 7, assemblies: 126, capital: 'Dispur', voters: '2.41 Cr', phases: 3, coords: [26.2006, 92.9376] },
  'Bihar': { abbr: 'BR', lokSabha: 40, rajyaSabha: 16, assemblies: 243, capital: 'Patna', voters: '7.29 Cr', phases: 7, coords: [25.0961, 85.3131] },
  'Chhattisgarh': { abbr: 'CG', lokSabha: 11, rajyaSabha: 5, assemblies: 90, capital: 'Raipur', voters: '2.02 Cr', phases: 2, coords: [21.2787, 81.8661] },
  'Goa': { abbr: 'GA', lokSabha: 2, rajyaSabha: 1, assemblies: 40, capital: 'Panaji', voters: '11.8 L', phases: 1, coords: [15.2993, 74.1240] },
  'Gujarat': { abbr: 'GJ', lokSabha: 26, rajyaSabha: 11, assemblies: 182, capital: 'Gandhinagar', voters: '4.91 Cr', phases: 1, coords: [22.2587, 71.1924] },
  'Haryana': { abbr: 'HR', lokSabha: 10, rajyaSabha: 5, assemblies: 90, capital: 'Chandigarh', voters: '2.01 Cr', phases: 1, coords: [29.0588, 76.0856] },
  'Himachal Pradesh': { abbr: 'HP', lokSabha: 4, rajyaSabha: 3, assemblies: 68, capital: 'Shimla', voters: '55 L', phases: 1, coords: [31.1048, 77.1665] },
  'Jharkhand': { abbr: 'JH', lokSabha: 14, rajyaSabha: 6, assemblies: 81, capital: 'Ranchi', voters: '2.61 Cr', phases: 5, coords: [23.6102, 85.2799] },
  'Karnataka': { abbr: 'KA', lokSabha: 28, rajyaSabha: 12, assemblies: 224, capital: 'Bengaluru', voters: '5.31 Cr', phases: 1, coords: [15.3173, 75.7139] },
  'Kerala': { abbr: 'KL', lokSabha: 20, rajyaSabha: 9, assemblies: 140, capital: 'Thiruvananthapuram', voters: '2.77 Cr', phases: 1, coords: [10.8505, 76.2711] },
  'Madhya Pradesh': { abbr: 'MP', lokSabha: 29, rajyaSabha: 11, assemblies: 230, capital: 'Bhopal', voters: '5.60 Cr', phases: 4, coords: [22.9734, 78.6569] },
  'Maharashtra': { abbr: 'MH', lokSabha: 48, rajyaSabha: 19, assemblies: 288, capital: 'Mumbai', voters: '9.15 Cr', phases: 5, coords: [19.7515, 75.7139] },
  'Manipur': { abbr: 'MN', lokSabha: 2, rajyaSabha: 1, assemblies: 60, capital: 'Imphal', voters: '20.4 L', phases: 2, coords: [24.6637, 93.9063] },
  'Meghalaya': { abbr: 'ML', lokSabha: 2, rajyaSabha: 1, assemblies: 60, capital: 'Shillong', voters: '20.1 L', phases: 1, coords: [25.4670, 91.3662] },
  'Mizoram': { abbr: 'MZ', lokSabha: 1, rajyaSabha: 1, assemblies: 40, capital: 'Aizawl', voters: '8.4 L', phases: 1, coords: [23.1645, 92.9376] },
  'Nagaland': { abbr: 'NL', lokSabha: 1, rajyaSabha: 1, assemblies: 60, capital: 'Kohima', voters: '13 L', phases: 1, coords: [26.1584, 94.5624] },
  'Odisha': { abbr: 'OD', lokSabha: 21, rajyaSabha: 10, assemblies: 147, capital: 'Bhubaneswar', voters: '3.35 Cr', phases: 4, coords: [20.9517, 85.0985] },
  'Punjab': { abbr: 'PB', lokSabha: 13, rajyaSabha: 7, assemblies: 117, capital: 'Chandigarh', voters: '2.14 Cr', phases: 1, coords: [31.1471, 75.3412] },
  'Rajasthan': { abbr: 'RJ', lokSabha: 25, rajyaSabha: 10, assemblies: 200, capital: 'Jaipur', voters: '5.25 Cr', phases: 2, coords: [27.0238, 74.2179] },
  'Sikkim': { abbr: 'SK', lokSabha: 1, rajyaSabha: 1, assemblies: 32, capital: 'Gangtok', voters: '4.5 L', phases: 1, coords: [27.5330, 88.5122] },
  'Tamil Nadu': { abbr: 'TN', lokSabha: 39, rajyaSabha: 18, assemblies: 234, capital: 'Chennai', voters: '6.26 Cr', phases: 1, coords: [11.1271, 78.6569] },
  'Telangana': { abbr: 'TS', lokSabha: 17, rajyaSabha: 7, assemblies: 119, capital: 'Hyderabad', voters: '3.17 Cr', phases: 1, coords: [18.1124, 79.0193] },
  'Tripura': { abbr: 'TR', lokSabha: 2, rajyaSabha: 1, assemblies: 60, capital: 'Agartala', voters: '27.4 L', phases: 1, coords: [23.9408, 91.9882] },
  'Uttar Pradesh': { abbr: 'UP', lokSabha: 80, rajyaSabha: 31, assemblies: 403, capital: 'Lucknow', voters: '15.02 Cr', phases: 7, coords: [26.8467, 80.9462] },
  'Uttarakhand': { abbr: 'UK', lokSabha: 5, rajyaSabha: 3, assemblies: 70, capital: 'Dehradun', voters: '80.6 L', phases: 1, coords: [30.0668, 79.0193] },
  'West Bengal': { abbr: 'WB', lokSabha: 42, rajyaSabha: 16, assemblies: 294, capital: 'Kolkata', voters: '7.33 Cr', phases: 7, coords: [22.9868, 87.8550] },
  'Delhi': { abbr: 'DL', lokSabha: 7, rajyaSabha: 3, assemblies: 70, capital: 'New Delhi', voters: '1.47 Cr', phases: 1, isUT: true, coords: [28.7041, 77.1025] },
  'Jammu & Kashmir': { abbr: 'JK', lokSabha: 5, rajyaSabha: 4, assemblies: 90, capital: 'Srinagar', voters: '86.6 L', phases: 5, isUT: true, coords: [33.7782, 76.5762] },
  'Ladakh': { abbr: 'LA', lokSabha: 1, rajyaSabha: 0, assemblies: 0, capital: 'Leh', voters: '1.9 L', phases: 1, isUT: true, coords: [34.1526, 77.5771] },
  'Puducherry': { abbr: 'PY', lokSabha: 1, rajyaSabha: 1, assemblies: 30, capital: 'Puducherry', voters: '10.3 L', phases: 1, isUT: true, coords: [11.9416, 79.8083] },
  'Chandigarh': { abbr: 'CH', lokSabha: 1, rajyaSabha: 0, assemblies: 0, capital: 'Chandigarh', voters: '6.4 L', phases: 1, isUT: true, coords: [30.7333, 76.7794] },
  'Andaman & Nicobar': { abbr: 'AN', lokSabha: 1, rajyaSabha: 0, assemblies: 0, capital: 'Port Blair', voters: '3.1 L', phases: 1, isUT: true, coords: [11.7401, 92.6586] },
  'Dadra & Nagar Haveli and Daman & Diu': { abbr: 'DD', lokSabha: 2, rajyaSabha: 0, assemblies: 0, capital: 'Daman', voters: '5.8 L', phases: 1, isUT: true, coords: [20.1809, 73.0169] },
  'Lakshadweep': { abbr: 'LD', lokSabha: 1, rajyaSabha: 0, assemblies: 0, capital: 'Kavaratti', voters: '0.55 L', phases: 1, isUT: true, coords: [10.5667, 72.6417] },
};

const ZONES = {
  'North': ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Ladakh', 'Punjab', 'Rajasthan', 'Uttarakhand', 'Chandigarh', 'Uttar Pradesh'],
  'South': ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 'Puducherry', 'Lakshadweep', 'Andaman & Nicobar'],
  'East': ['Bihar', 'Jharkhand', 'Odisha', 'West Bengal', 'Sikkim'],
  'West': ['Goa', 'Gujarat', 'Maharashtra', 'Dadra & Nagar Haveli and Daman & Diu', 'Chhattisgarh', 'Madhya Pradesh'],
  'Northeast': ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura'],
};

const ZONE_COLORS = {
  'North': { bg: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  'South': { bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'East': { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-400' },
  'West': { bg: 'from-purple-500/20 to-fuchsia-500/20', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-400' },
  'Northeast': { bg: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-400' },
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

// Map updater component to change view when state is selected
function MapController({ selectedState }) {
  const map = useMap();
  useEffect(() => {
    if (selectedState && STATES_DATA[selectedState]?.coords) {
      map.flyTo(STATES_DATA[selectedState].coords, 6, {
        duration: 1.5
      });
    } else {
      map.flyTo([22.5937, 78.9629], 4, {
        duration: 1.5
      });
    }
  }, [selectedState, map]);
  return null;
}

export default function ECIMapPage() {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedZone, setSelectedZone] = useState('All');
  const [search, setSearch] = useState('');

  const allStates = Object.keys(STATES_DATA);
  const totalLokSabha = Object.values(STATES_DATA).reduce((sum, s) => sum + s.lokSabha, 0);
  const totalVoters = '96.8 Cr';

  const filteredStates = allStates.filter(state => {
    const matchesSearch = state.toLowerCase().includes(search.toLowerCase()) ||
      STATES_DATA[state].abbr.toLowerCase().includes(search.toLowerCase());
    const matchesZone = selectedZone === 'All' || ZONES[selectedZone]?.includes(state);
    return matchesSearch && matchesZone;
  });

  const getZoneForState = (state) => {
    for (const [zone, states] of Object.entries(ZONES)) {
      if (states.includes(state)) return zone;
    }
    return 'North';
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-xl">🌐</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Interactive ECI Map</h1>
            <p className="text-xs text-text-muted">Explore state-wise electoral data across India</p>
          </div>
        </div>
        <a href="https://eci.gov.in" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs text-primary hover:underline">
          Visit ECI Portal <FiExternalLink size={12} />
        </a>
      </motion.div>

      {/* Search & Zone Filter */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted z-10 pointer-events-none" size={16} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
            className="input-field text-sm w-full" placeholder="Search states or UTs..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', ...Object.keys(ZONES)].map(zone => (
            <button key={zone} onClick={() => { setSelectedZone(zone); setSelectedState(null); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${selectedZone === zone
                ? 'bg-primary/15 border-primary/30 text-primary'
                : 'bg-bg-elevated border-border text-text-muted hover:border-primary/20 hover:text-text-secondary'
                }`}>
              {zone === 'All' ? '🌐 All' : zone}
            </button>
          ))}
        </div>
      </motion.div>

      {/* States Map + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map */}
        <motion.div variants={item} className="min-h-[400px] md:min-h-[500px] lg:h-[600px] xl:h-full lg:col-span-2 glass-card overflow-hidden z-0 relative">
          <MapContainer
            center={[22.5937, 78.9629]}
            zoom={4.5}
            style={{ height: '100%', width: '100%', background: 'var(--color-bg-card)' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapController selectedState={selectedState} />

            {filteredStates.map(state => {
              const data = STATES_DATA[state];
              if (!data.coords) return null;
              return (
                <Marker
                  key={state}
                  position={data.coords}
                  eventHandlers={{
                    click: () => {
                      setSelectedState(state);
                    },
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="text-center p-1">
                      <h4 className="font-bold text-gray-800 text-sm">{state}</h4>
                      <p className="text-xs text-gray-600 mb-1">{data.isUT ? 'UT' : 'State'}</p>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        LS: {data.lokSabha} Seats
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </motion.div>

        {/* Detail Panel & Quick Links */}
        <motion.div variants={item} className="lg:col-span-1 h-full overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {selectedState ? (
              <motion.div key={selectedState}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="glass-card p-6 flex-shrink-0">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ZONE_COLORS[getZoneForState(selectedState)].bg} flex items-center justify-center text-xl`}>
                      {STATES_DATA[selectedState].isUT ? '🏝️' : '🗺️'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">{selectedState}</h3>
                      <p className="text-xs text-text-muted">Capital: {STATES_DATA[selectedState].capital}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedState(null)} className="text-text-muted hover:text-text-primary">✕</button>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Lok Sabha Seats', value: STATES_DATA[selectedState].lokSabha, icon: '🏛️' },
                    { label: 'Rajya Sabha Seats', value: STATES_DATA[selectedState].rajyaSabha, icon: '🏢' },
                    { label: 'Assembly Seats', value: STATES_DATA[selectedState].assemblies || 'N/A', icon: '🏗️' },
                    { label: 'Total Voters', value: STATES_DATA[selectedState].voters, icon: '🗳️' },
                    { label: 'Election Phases', value: STATES_DATA[selectedState].phases, icon: '📅' },
                    { label: 'Zone', value: getZoneForState(selectedState), icon: '🌐' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                      <span className="text-sm text-text-secondary flex items-center gap-2">
                        <span className="text-base">{item.icon}</span> {item.label}
                      </span>
                      <span className="text-sm font-semibold text-text-primary">{item.value}</span>
                    </div>
                  ))}
                </div>

                <a href={`https://eci.gov.in/state/${STATES_DATA[selectedState].abbr.toLowerCase()}`}
                  target="_blank" rel="noreferrer"
                  className="mt-5 btn-primary w-full text-sm py-2.5 text-center flex items-center justify-center gap-2">
                  View on ECI <FiExternalLink size={12} />
                </a>
              </motion.div>
            ) : (
              <motion.div key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card-static p-8 text-center flex-shrink-0 flex flex-col items-center justify-center">
                <span className="text-5xl block mb-4">📍</span>
                <h3 className="text-base font-semibold text-text-primary mb-2">Select a State on the Map</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Click on any marker on the map to view detailed electoral information including Lok Sabha seats, Rajya Sabha representation, and voter statistics.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Links Section */}
          <motion.div variants={item} className="glass-card-static p-5 flex-shrink-0">
            <h3 className="text-lg font-bold text-primary mb-4">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: 'Voter Registration Portal', icon: '📋', url: 'https://voters.eci.gov.in/' },
                { label: 'Find Your Booth', icon: '🔍', url: 'https://electoralsearch.eci.gov.in/' },
                { label: 'Recognised Parties', icon: '🎌', url: 'https://eci.gov.in/candidate-political-parties/' },
                { label: 'Election Results', icon: '📊', url: 'https://results.eci.gov.in/' },
                { label: 'Candidate Affidavits', icon: '📄', url: 'https://affidavit.eci.gov.in/' },
              ].map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noreferrer" className="block w-full text-left px-4 py-3 rounded-xl bg-bg-elevated border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center gap-3">
                  <span className="text-base">{link.icon}</span>
                  <span className="text-sm text-text-secondary font-medium">{link.label}</span>
                  <FiExternalLink className="ml-auto text-text-muted" size={14} />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Zone Legend */}
      <motion.div variants={item} className="glass-card-static p-4">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Zone Legend</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(ZONE_COLORS).map(([zone, colors]) => (
            <div key={zone} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
              <span className="text-xs text-text-muted">{zone} ({ZONES[zone].length})</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards — Bottom */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'States & UTs', value: '36', icon: '🗺️', color: 'text-primary' },
          { label: 'Lok Sabha Seats', value: totalLokSabha.toString(), icon: '🏛️', color: 'text-primary' },
          { label: 'Total Voters', value: totalVoters, icon: '🗳️', color: 'text-secondary' },
          { label: 'ECI Helpline', value: '1950', icon: '📞', color: 'text-secondary', isCall: true },
        ].map((card, i) => (
          card.isCall ? (
            <a key={i} href="tel:1950" className="glass-card-static p-4 text-center hover:border-primary/30 transition-all">
              <span className="text-2xl block mb-1">{card.icon}</span>
              <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{card.label}</p>
              <p className="text-[9px] text-primary mt-1">Tap to Call</p>
            </a>
          ) : (
            <div key={i} className="glass-card-static p-4 text-center">
              <span className="text-2xl block mb-1">{card.icon}</span>
              <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{card.label}</p>
            </div>
          )
        ))}
      </motion.div>
    </motion.div>
  );
}
