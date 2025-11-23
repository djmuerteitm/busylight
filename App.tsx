import React, { useState, useEffect, useRef } from 'react';
import { ConnectionType, DeviceState, FirmwareConfig, ChatMessage } from './types';
import { generateFirmware, chatWithAssistant } from './services/geminiService';
import { VirtualDevice } from './components/VirtualDevice';
import { Button } from './components/Button';
import { CodeBlock } from './components/CodeBlock';

const App: React.FC = () => {
  // Global App State
  const [globalState, setGlobalState] = useState<DeviceState>(DeviceState.FREE);
  
  // Connection Simulation State
  const [isSimulatedLinkActive, setIsSimulatedLinkActive] = useState(false);

  // Firmware Gen State - PRE-FILLED WITH USER REQUIREMENTS
  const [connectionType, setConnectionType] = useState<ConnectionType>(ConnectionType.WIFI_MQTT);
  const [wifiSsid, setWifiSsid] = useState('BDE_iot');
  const [wifiPass, setWifiPass] = useState('Dr@asan1d@!');
  const [mqttBroker, setMqttBroker] = useState('192.168.1.11');
  const [mqttPort, setMqttPort] = useState('1883');
  const [mqttTopic, setMqttTopic] = useState('busylight');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I have pre-configured your settings for the "BDE_iot" network and MQTT broker. Click "Generate Firmware" to get your code for the M5Stick-C!', timestamp: Date.now() }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate connection establishment
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSimulatedLinkActive(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const toggleGlobalState = () => {
    setGlobalState(prev => prev === DeviceState.FREE ? DeviceState.BUSY : DeviceState.FREE);
  };

  const handleGenerateClick = async () => {
    setIsGenerating(true);
    const config: FirmwareConfig = {
      connectionType,
      deviceModel: 'M5Stick-C',
      wifiSsid: wifiSsid || undefined,
      wifiPass: wifiPass || undefined,
      mqttBroker: mqttBroker || undefined,
      mqttPort: mqttPort || undefined,
      mqttTopic: mqttTopic || undefined
    };

    const code = await generateFirmware(config);
    setGeneratedCode(code);
    setIsGenerating(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    // Format history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithAssistant(history, userMsg.text);
    
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    }]);
    setIsChatting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            M5Sync Architect
          </h1>
          <p className="text-slate-400 mt-2">Office & Door Busy Light System</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
            <span className="px-3 py-1 bg-slate-900 rounded-full border border-slate-700 text-xs font-mono text-slate-500">
                v1.0.0
            </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Simulation & Chat (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Simulation Panel */}
          <section className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSimulatedLinkActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-yellow-500 animate-pulse'} transition-colors`}></span>
                Office Simulation
              </h2>
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${globalState === DeviceState.BUSY ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                STATUS: {globalState}
              </span>
            </div>
            
            <div className="flex justify-center gap-8 md:gap-12 py-8">
              <VirtualDevice 
                label="Office Device" 
                state={globalState} 
                onToggle={toggleGlobalState}
                isConnected={isSimulatedLinkActive}
                batteryLevel={92}
              />
              
              {/* Central Connection Status */}
              <div className="hidden md:flex flex-col justify-center items-center text-slate-600 gap-2">
                {/* Link Icon */}
                <div className={`transition-opacity duration-1000 ${isSimulatedLinkActive ? 'opacity-100 text-indigo-400' : 'opacity-20 text-slate-700'}`}>
                   <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>

                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mt-1">MQTT</span>
                <span className="text-[8px] font-mono text-slate-600">{mqttBroker}</span>
              </div>
              
              <VirtualDevice 
                label="Door Device" 
                state={globalState} 
                onToggle={toggleGlobalState}
                isConnected={isSimulatedLinkActive}
                batteryLevel={68}
              />
            </div>
            <p className="text-center text-xs text-slate-500 mt-4">
              Simulated WiFi: <strong>{wifiSsid}</strong> | Topic: <strong>{mqttTopic}</strong>
            </p>
          </section>

          {/* AI Assistant Chat */}
          <section className="bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl flex flex-col h-[400px] backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-200">Hardware Assistant</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatting && (
                 <div className="flex justify-start">
                   <div className="bg-slate-800 rounded-2xl px-4 py-3 rounded-bl-none border border-slate-700">
                     <div className="flex gap-1">
                       <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                       <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                     </div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleChatSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about wiring, power, or flashing..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
              />
              <Button type="submit" variant="ghost" disabled={!chatInput.trim() || isChatting} className="!px-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </Button>
            </form>
          </section>

        </div>

        {/* RIGHT COLUMN: Firmware Generator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full">
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 shadow-xl backdrop-blur-sm flex flex-col h-full min-h-[600px]">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">Firmware Generator</h2>
                    <p className="text-slate-400 text-sm">
                        Generates C++ source code for your MQTT setup. 
                        <span className="text-indigo-400 block mt-1">Compile this code using PlatformIO/Arduino to get your .bin file for M5Stick-C (Non-Plus).</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Protocol</label>
                        <select 
                            value={connectionType}
                            onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        >
                            {Object.values(ConnectionType).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Show WiFi/MQTT fields */}
                    {(connectionType === ConnectionType.WIFI_MQTT || connectionType === ConnectionType.WIFI_HTTP) && (
                        <>
                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                                <div className="col-span-1 md:col-span-2 border-b border-slate-800 pb-2 mb-2">
                                    <span className="text-xs font-bold text-indigo-400">WiFi Settings</span>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SSID</label>
                                    <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                                    <input type="text" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                                <div className="col-span-1 md:col-span-12 border-b border-slate-800 pb-2 mb-2">
                                    <span className="text-xs font-bold text-indigo-400">MQTT Broker Settings</span>
                                </div>
                                <div className="md:col-span-6">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Broker IP</label>
                                    <input type="text" value={mqttBroker} onChange={(e) => setMqttBroker(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Port</label>
                                    <input type="text" value={mqttPort} onChange={(e) => setMqttPort(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</label>
                                    <input type="text" value={mqttTopic} onChange={(e) => setMqttTopic(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="mb-6">
                    <Button 
                        onClick={handleGenerateClick} 
                        isLoading={isGenerating} 
                        className="w-full md:w-auto"
                    >
                       Generate Firmware Code
                    </Button>
                </div>

                <div className="flex-1 min-h-0">
                    {generatedCode ? (
                        <CodeBlock code={generatedCode} title="PlatformIO / Arduino Sketch" />
                    ) : (
                        <div className="h-full border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-600 bg-slate-900/30">
                            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                            <p className="text-sm">Code will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;