import React, { useState, useEffect } from 'react';
import { Wind, Thermometer, CloudRain, Droplets, Menu, Bell, Search, Settings, MapPin, Activity, LayoutDashboard, AlertTriangle, Factory, Car, Flame, Info, ChevronDown, X, FileText, Download, Check, Loader } from 'lucide-react';

// --- Reusable Components ---

const Gauge = ({ value, max, label, unit, color = "text-cyan-400" }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.min(Math.max(value, 0), max);
  const strokeDashoffset = circumference - ((safeValue / max) * circumference);
  
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-lg border border-gray-700 relative h-48 transition-all hover:bg-gray-800/70">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="transform -rotate-90 w-full h-full">
          <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
          <circle 
            cx="64" cy="64" r={radius} 
            stroke="currentColor" strokeWidth="8" fill="transparent" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            className={`${color} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <span className={`text-2xl font-bold ${color}`}>{value}</span>
          <span className="text-xs text-gray-400 block">{unit}</span>
        </div>
      </div>
      <span className="text-sm text-gray-300 mt-[-20px] font-medium tracking-wider">{label}</span>
    </div>
  );
};

const Sparkline = ({ data, label, color = "stroke-blue-500", value, unit }) => {
  const width = 200;
  const height = 60;
  const max = Math.max(...data, 10);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d / max) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xs text-gray-400 uppercase tracking-wider">{label}</h3>
          <div className="text-xl font-bold text-white mt-1">{value} <span className="text-xs text-gray-500">{unit}</span></div>
        </div>
        <Activity size={16} className="text-gray-500" />
      </div>
      
      <div className="w-full overflow-hidden">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <path d={`M0,${height} L${points} L${width},${height} Z`} fill="none" className={`${color} opacity-20 fill-current`} />
          <path d={`M ${points}`} fill="none" strokeWidth="2" className={color} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
};

// 3. Custom Map View with Search Filter & Custom Height
const StationMap = ({ filter = '', region = 'Delhi-NCR', className = "h-[500px]" }) => {
  // Region specific coordinates to simulate movement
  const offsets = {
    'Delhi-NCR': { x: 0, y: 0 },
    'Mumbai': { x: 10, y: 10 },
    'Bangalore': { x: -10, y: -5 },
    'Chennai': { x: 5, y: -10 }
  };
  
  const off = offsets[region] || { x: 0, y: 0 };

  const allStations = [
    { id: 'S001', x: 30 + off.x, y: 40 + off.y, status: 'critical', name: 'City Center' },
    { id: 'S002', x: 60 + off.x, y: 20 + off.y, status: 'healthy', name: 'Green Park' },
    { id: 'S003', x: 75 - off.x, y: 65 + off.y, status: 'moderate', name: 'Ind. Estate' },
    { id: 'S004', x: 20 + off.x, y: 80 - off.y, status: 'healthy', name: 'Airport Zone' },
    { id: 'S005', x: 50, y: 50, status: 'moderate', name: 'Suburban Hub' },
  ];

  const stations = allStations.filter(s => 
    s.name.toLowerCase().includes(filter.toLowerCase()) || 
    s.id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className={`bg-gray-800/30 border border-gray-700 rounded-lg p-6 relative overflow-hidden transition-all ${className}`}>
       <div className="flex justify-between items-center mb-4">
         <h2 className="text-xl font-bold text-white flex items-center">
          <MapPin className="mr-2 text-blue-400" /> {region} Station Grid
        </h2>
        <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-700">
          {stations.length} Active Sensors
        </span>
       </div>
      
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Map Area */}
      <div className="relative w-full h-full">
        {stations.map(station => (
          <div 
            key={station.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-500"
            style={{ left: `${Math.min(Math.max(station.x, 10), 90)}%`, top: `${Math.min(Math.max(station.y, 10), 90)}%` }}
          >
            {/* Pulsing Effect */}
            <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${
              station.status === 'critical' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse' : 
              station.status === 'moderate' ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 
              'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]'
            }`}></div>
            
            {/* Label on Hover */}
            <div className="absolute left-6 top-[-5px] bg-gray-900 text-xs px-2 py-1 rounded border border-gray-600 whitespace-nowrap opacity-100 z-10">
              <div className="font-bold text-gray-300">{station.id}</div>
              <div className="text-gray-500">{station.name}</div>
            </div>
          </div>
        ))}
        
        {/* Connecting Lines (Network Topology) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
           {stations.length > 1 && stations.map((s, i) => {
             if (i === stations.length - 1) return null;
             const next = stations[i+1];
             return (
               <line 
                key={i}
                x1={`${Math.min(Math.max(s.x, 10), 90)}%`} 
                y1={`${Math.min(Math.max(s.y, 10), 90)}%`} 
                x2={`${Math.min(Math.max(next.x, 10), 90)}%`} 
                y2={`${Math.min(Math.max(next.y, 10), 90)}%`} 
                stroke="#60a5fa" strokeWidth="1" strokeDasharray="5,5" 
               />
             );
           })}
        </svg>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  // Interactive States
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState('Delhi-NCR');
  const [timeRange, setTimeRange] = useState('24 Hours');

  // Region Baselines (Dummy Data for switching)
  const regionBaselines = {
    'Delhi-NCR': { aqi: 155, temp: 28.5, hum: 45, co2: 410 },
    'Mumbai': { aqi: 85, temp: 32.0, hum: 78, co2: 380 },
    'Bangalore': { aqi: 42, temp: 23.5, hum: 60, co2: 365 },
    'Chennai': { aqi: 90, temp: 34.0, hum: 80, co2: 390 },
  };
  
  // Climate Data State
  const [climateData, setClimateData] = useState({
    aqi: 155,
    temp: 28.5,
    humidity: 62,
    co2: 410,
    history: [140, 142, 145, 148, 150, 155, 152, 148, 145, 142, 140, 138, 145, 150, 155]
  });

  // Alert Data (Dynamic based on state)
  const alertsList = [
    { id: 1, severity: 'CRITICAL', timestamp: '2025-11-20 10:32 AM', station: `S001 (${region})`, message: `AQI spiked to ${Math.floor(climateData.aqi * 1.2)} (Hazardous)`, action: 'View Graph', type: 'spike' },
    { id: 2, severity: 'WARNING', timestamp: '2025-11-20 09:15 AM', station: `S003 (${region})`, message: 'NO2 levels above safe threshold', action: 'View Graph', type: 'threshold' },
    { id: 3, severity: 'INFO', timestamp: '2025-11-20 08:00 AM', station: 'System', message: 'Daily calibration completed successfully', action: 'Archived', type: 'info' },
    { id: 4, severity: 'CRITICAL', timestamp: '2025-11-19 11:45 PM', station: `S001 (${region})`, message: 'Sensor disconnect detected', action: 'Diagnose', type: 'disconnect' }
  ];

  // Effect to handle Region Switching and Simulation
  useEffect(() => {
    // 1. Reset to baseline when region changes
    const baseline = regionBaselines[region];
    setClimateData(prev => ({
      ...prev,
      aqi: baseline.aqi,
      temp: baseline.temp,
      humidity: baseline.hum,
      co2: baseline.co2,
      // Generate a slightly different history curve based on baseline
      history: Array(15).fill(0).map(() => Math.max(0, baseline.aqi + (Math.random() * 20 - 10)))
    }));

    // 2. Start Interval for "Live" updates
    const interval = setInterval(() => {
      setClimateData(prev => {
        // Volatility depends on time range (1 Hour = more volatile, 7 Days = smoother)
        const volatility = timeRange === '1 Hour' ? 15 : 5; 
        
        const newAqi = Math.min(Math.max(prev.aqi + (Math.random() * volatility - (volatility/2)), 0), 500);
        return {
          aqi: Math.floor(newAqi),
          temp: parseFloat((prev.temp + (Math.random() * 0.5 - 0.25)).toFixed(1)),
          humidity: Math.min(Math.max(Math.floor(prev.humidity + (Math.random() * 4 - 2)), 0), 100),
          co2: Math.floor(prev.co2 + (Math.random() * 10 - 5)),
          history: [...prev.history.slice(1), Math.floor(newAqi)]
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [region, timeRange]);

  const getAqiColor = (val) => {
    if (val < 50) return "text-green-400"; 
    if (val < 100) return "text-yellow-400"; 
    if (val < 150) return "text-orange-400"; 
    return "text-red-500";
  };

  // Handlers
  const toggleRegion = () => {
    const regions = Object.keys(regionBaselines);
    const currentIndex = regions.indexOf(region);
    const nextIndex = (currentIndex + 1) % regions.length;
    setRegion(regions[nextIndex]);
  };

  const toggleTimeRange = () => {
    if (timeRange === '1 Hour') setTimeRange('24 Hours');
    else if (timeRange === '24 Hours') setTimeRange('7 Days');
    else setTimeRange('1 Hour');
  };

  const handleAlertAction = (alert) => {
    if (alert.action === 'Archived') return;
    setSelectedAlert(alert);
    setReportGenerated(false); // Reset report state when opening new alert
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    
    // Simulate PDF generation delay
    setTimeout(() => {
      // Create report content
      const reportContent = `
ENVIROMONITOR SYSTEM REPORT
---------------------------
Incident ID: ${selectedAlert.id}
Date: ${new Date().toLocaleDateString()}
Timestamp: ${selectedAlert.timestamp}
Station: ${selectedAlert.station}
Severity: ${selectedAlert.severity}

DESCRIPTION:
${selectedAlert.message}

TECHNICAL DIAGNOSTICS:
- System check initiated
- Sensor telemetry logged
- Environmental variables captured

Action Taken: User initiated manual report generation.
Status: LOGGED & ARCHIVED

[DIGITAL SIGNATURE VERIFIED]
      `.trim();

      // Create blob and download
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Incident_Report_${selectedAlert.id}_${Date.now()}.txt`; // Downloading as txt since PDF requires libraries
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setIsGeneratingReport(false);
      setReportGenerated(true);
    }, 2000);
  };

  // --- View Renderers ---

  const renderAlertModal = () => {
    if (!selectedAlert) return null;
    
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
          <button 
            onClick={() => setSelectedAlert(null)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-xl font-bold text-white mb-1 flex items-center">
             {selectedAlert.severity === 'CRITICAL' && <AlertTriangle className="text-red-500 mr-2" />}
             {selectedAlert.severity === 'WARNING' && <AlertTriangle className="text-yellow-500 mr-2" />}
             Incident Report #{selectedAlert.id}
          </h2>
          <div className="text-sm text-gray-500 mb-6">{selectedAlert.timestamp} • {selectedAlert.station}</div>
          
          <div className="space-y-6">
             <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center">
                  <FileText size={16} className="mr-2 text-blue-400" /> Event Description
                </h3>
                <p className="text-gray-400">{selectedAlert.message}</p>
             </div>

             {(selectedAlert.type === 'spike' || selectedAlert.type === 'threshold') && (
               <div>
                 <h3 className="text-sm font-bold text-gray-300 mb-2">Pollutant Spike Analysis</h3>
                 <div className="h-40 bg-gray-800/50 rounded border border-gray-700 flex items-end p-2 space-x-1">
                    {/* Simulated Bar Chart */}
                    {[20, 25, 30, 22, 28, 85, 95, 90, 40, 30, 25, 20].map((h, i) => (
                      <div key={i} className={`flex-1 rounded-t transition-all duration-500 hover:opacity-80 ${h > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ height: `${h}%` }}></div>
                    ))}
                 </div>
                 <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                    <span>-60min</span>
                    <span>EVENT</span>
                    <span>Now</span>
                 </div>
               </div>
             )}

             {selectedAlert.type === 'disconnect' && (
               <div>
                 <h3 className="text-sm font-bold text-gray-300 mb-2">Diagnostic Sequence</h3>
                 <div className="space-y-2 font-mono text-xs bg-black/50 p-4 rounded border border-gray-800">
                    <div className="text-green-400">{'>'} Ping S001... Unreachable</div>
                    <div className="text-green-400">{'>'} Check Power Rail... Nominal (5.0V)</div>
                    <div className="text-red-400 animate-pulse">{'>'} Wireless Uplink... Failed (No Handshake)</div>
                    <div className="text-gray-500">{'>'} Retrying connection (Attempt 1/3)...</div>
                    <div className="text-yellow-400 mt-2">{'>'} Recommendation: Field technician required for module reset.</div>
                 </div>
               </div>
             )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
             <button onClick={() => setSelectedAlert(null)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors">
               Dismiss
             </button>
             
             {/* Functional Generate PDF Report Button */}
             <button 
               onClick={handleGenerateReport}
               disabled={isGeneratingReport || reportGenerated}
               className={`px-4 py-2 rounded text-sm transition-all flex items-center font-medium ${
                 reportGenerated 
                   ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                   : 'bg-blue-600 hover:bg-blue-500 text-white'
               }`}
             >
               {isGeneratingReport ? (
                 <>
                   <Loader size={16} className="mr-2 animate-spin" />
                   Generating Report...
                 </>
               ) : reportGenerated ? (
                 <>
                   <Check size={16} className="mr-2" />
                   Report Downloaded
                 </>
               ) : (
                 <>
                   <Download size={16} className="mr-2" />
                   Generate Report Log
                 </>
               )}
             </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <>
      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Gauge value={climateData.aqi} max={500} label="Live AQI Index" unit="US AQI" color={getAqiColor(climateData.aqi)} />
        <Gauge value={climateData.temp} max={50} label="Temperature" unit="°C" color="text-yellow-400" />
        <Gauge value={climateData.humidity} max={100} label="Humidity" unit="%" color="text-cyan-400" />
        <Gauge value={climateData.co2} max={1000} label="CO2 Levels" unit="ppm" color="text-purple-400" />
      </div>

      {/* Sparklines */}
      <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center justify-between">
         <div className="flex items-center">
           <span className="w-2 h-6 bg-green-500 mr-2 rounded-sm"></span>
           Pollutant Trends ({timeRange})
         </div>
         <span className="text-xs text-gray-500 uppercase tracking-wider">Real-time Updates</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Sparkline label="PM 2.5 Concentration" value={(climateData.aqi * 0.6).toFixed(1)} unit="µg/m³" data={climateData.history} color="stroke-red-400" />
        <Sparkline label="PM 10 Concentration" value={(climateData.aqi * 0.9).toFixed(1)} unit="µg/m³" data={climateData.history.map(x => x * 1.2)} color="stroke-orange-400" />
        <Sparkline label="NO2 Emissions" value="42" unit="ppb" data={climateData.history.map(x => Math.max(x - 100, 10))} color="stroke-blue-500" />
        <Sparkline label="Ozone (O3)" value="36" unit="ppb" data={climateData.history.map(x => x / 3)} color="stroke-green-400" />
      </div>

      {/* ADDED: Station Map in Dashboard Overview */}
      <div className="mb-8">
        <StationMap filter={searchQuery} region={region} className="h-80" />
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-gray-800/30 p-4 rounded border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">Station Metadata</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
               <div className="text-gray-500">Location:</div><div className="text-gray-300 font-medium text-blue-400">{region}</div>
               <div className="text-gray-500">Device Model:</div><div className="text-gray-300">IoT-Pro-Max (2023)</div>
               <div className="text-gray-500">Zone Type:</div><div className="text-gray-300">Industrial / High Traffic</div>
               <div className="text-gray-500">Data Interval:</div><div className="text-gray-300">{timeRange} Avg</div>
            </div>
         </div>
         <div className="bg-gray-800/30 p-4 rounded border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">Live Alerts</h3>
            <div className="space-y-2">
               {climateData.aqi > 150 ? (
                 <div className="flex items-center text-sm text-red-400 bg-red-500/10 px-2 py-1 rounded">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                    CRITICAL: AQI exceeded 150 (Unhealthy)
                 </div>
               ) : (
                 <div className="flex items-center text-sm text-green-400 bg-green-500/10 px-2 py-1 rounded">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Normal: Air Quality is Good
                 </div>
               )}
               <div className="flex items-center text-sm text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Wind speed low (Pollutants stagnant)
               </div>
            </div>
         </div>
      </div>
    </>
  );

  const renderSources = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Pollution Source Apportionment ({region})</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col items-center text-center">
          <Car size={48} className="text-purple-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-200">Vehicular Emissions</h3>
          <div className="text-3xl font-bold text-purple-400 my-2">45%</div>
          <p className="text-sm text-gray-400">High traffic volume on Ring Road affecting sensors.</p>
          <div className="w-full bg-gray-700 h-2 mt-4 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full" style={{ width: '45%' }}></div>
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col items-center text-center">
          <Factory size={48} className="text-orange-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-200">Industrial Waste</h3>
          <div className="text-3xl font-bold text-orange-400 my-2">30%</div>
          <p className="text-sm text-gray-400">Okhla Industrial Area plume detected.</p>
          <div className="w-full bg-gray-700 h-2 mt-4 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full" style={{ width: '30%' }}></div>
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col items-center text-center">
          <Flame size={48} className="text-red-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-200">Biomass Burning</h3>
          <div className="text-3xl font-bold text-red-400 my-2">15%</div>
          <p className="text-sm text-gray-400">Seasonal crop residue burning in neighboring states.</p>
          <div className="w-full bg-gray-700 h-2 mt-4 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full" style={{ width: '15%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">System Alert Log ({region})</h2>
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-700/50 text-gray-300 font-medium">
            <tr>
              <th className="p-4">Severity</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Station</th>
              <th className="p-4">Message</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 text-gray-300">
            {alertsList.map(alert => (
               <tr key={alert.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 
                      alert.severity === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{alert.timestamp}</td>
                  <td className="p-4 text-gray-400">{alert.station}</td>
                  <td className="p-4 text-gray-300">{alert.message}</td>
                  <td className="p-4">
                    {alert.action !== 'Archived' ? (
                      <button 
                        onClick={() => handleAlertAction(alert)}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded border border-blue-600/50 text-xs font-medium transition-all"
                      >
                        {alert.action}
                      </button>
                    ) : (
                      <span className="text-gray-500 text-xs italic">Archived</span>
                    )}
                  </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1218] text-white font-sans selection:bg-cyan-500 selection:text-black relative">
      
      {/* Render Modal if active */}
      {renderAlertModal()}

      {/* Top Navigation Bar */}
      <nav className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-[#1a1f29]">
        <div className="flex items-center space-x-4">
          <Menu className="text-gray-400 cursor-pointer hover:text-white" size={20} />
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded md:rounded-sm flex items-center justify-center font-bold text-xs text-black">C</div>
            <span className="font-semibold tracking-wide hidden md:inline">EnviroMonitor v2.0</span>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex items-center bg-gray-900 border border-gray-700 rounded px-2 py-1 w-1/3 transition-colors focus-within:border-blue-500">
          <Search size={16} className="text-gray-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, station ID..." 
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-300 placeholder-gray-600"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
             <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/40">Live</span>
             
             {/* Location Selector */}
             <button 
               onClick={toggleRegion}
               className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded flex items-center transition-colors"
             >
               {region} <ChevronDown size={12} className="ml-1" />
             </button>
          </div>
          <Bell size={18} className="text-gray-400 hover:text-white cursor-pointer" />
          <Settings size={18} className="text-gray-400 hover:text-white cursor-pointer" />
          <div className="w-8 h-8 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full"></div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-3.5rem)]">
        
        {/* Left Sidebar (Menu) */}
        <aside className="w-16 md:w-64 bg-[#13161c] border-r border-gray-800 flex flex-col justify-between hidden md:flex">
          <div className="p-2 space-y-1">
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors ${activeView === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
            >
              <LayoutDashboard size={18} />
              <span className="text-sm font-medium">Dashboard Overview</span>
            </button>
            <button 
              onClick={() => setActiveView('map')}
              className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors ${activeView === 'map' ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
            >
              <MapPin size={18} />
              <span className="text-sm font-medium">Station Map</span>
            </button>
            <button 
              onClick={() => setActiveView('sources')}
              className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors ${activeView === 'sources' ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
            >
              <Wind size={18} />
              <span className="text-sm font-medium">Pollution Source</span>
            </button>
            <button 
              onClick={() => setActiveView('alerts')}
              className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors ${activeView === 'alerts' ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
            >
              <AlertTriangle size={18} />
              <span className="text-sm font-medium">Alerts & Anomalies</span>
            </button>
          </div>
          <div className="p-4 text-xs text-gray-600 text-center">
            Climate-OS v1.0
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-[#0f1218] to-[#151921]">
          
          {/* Breadcrumbs / Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold text-white">
                 {activeView === 'dashboard' && 'Regional Air Quality'}
                 {activeView === 'map' && 'Station Network Topology'}
                 {activeView === 'sources' && 'Emission Source Analysis'}
                 {activeView === 'alerts' && 'System Incident Logs'}
               </h1>
               <div className="text-sm text-gray-500 mt-1 flex space-x-2">
                 <span>Asia</span> <span>&gt;</span> <span>India</span> <span>&gt;</span> <span className="text-blue-400 capitalize">{region}</span>
               </div>
            </div>
            <div className="flex space-x-2">
               {/* Time Range Selector */}
               <button 
                 onClick={toggleTimeRange}
                 className="px-3 py-1 bg-gray-800 border border-gray-700 text-xs text-gray-300 rounded hover:bg-gray-700 transition-colors"
               >
                 {timeRange}
               </button>
               <button className="px-3 py-1 bg-gray-800 border border-gray-700 text-xs text-gray-300 rounded hover:bg-gray-700">Export CSV</button>
            </div>
          </div>

          {/* Content Rendering Switch */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'map' && <StationMap filter={searchQuery} region={region} />}
          {activeView === 'sources' && renderSources()}
          {activeView === 'alerts' && renderAlerts()}

        </main>
      </div>
    </div>
  );
}