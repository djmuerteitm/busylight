import React from 'react';
import { DeviceState } from '../types';

interface VirtualDeviceProps {
  state: DeviceState;
  onToggle: () => void;
  label: string;
  isConnected: boolean;
  batteryLevel?: number;
}

export const VirtualDevice: React.FC<VirtualDeviceProps> = ({ 
  state, 
  onToggle, 
  label, 
  isConnected,
  batteryLevel = 95 
}) => {
  const isBusy = state === DeviceState.BUSY;

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Device Body: Landscape Mode (Wider) */}
      <div 
        className="relative w-64 h-32 rounded-xl border-4 border-slate-700 shadow-2xl transition-all duration-500 flex flex-row overflow-hidden bg-black ring-1 ring-white/10"
      >
        {/* Screen Area (Left side) */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-black">
            
            {/* Status Bar */}
            <div className={`h-5 w-full flex items-center justify-between px-2 z-20 transition-colors duration-300 ${isBusy ? 'bg-red-900/80' : 'bg-green-900/80'} backdrop-blur-sm border-b border-white/10`}>
                <div className="flex items-center gap-2">
                    {/* WiFi Icon */}
                    <div className={`flex flex-col justify-end h-2.5 w-2.5 pb-[1px] space-y-[1px] ${isConnected ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="w-full h-[1px] bg-white rounded-full"></div>
                        <div className="w-2/3 h-[1px] bg-white rounded-full mx-auto"></div>
                        <div className="w-1/3 h-[1px] bg-white rounded-full mx-auto"></div>
                    </div>
                    {/* MQTT Status */}
                    <div className={`text-[9px] font-bold font-mono tracking-tight ${isConnected ? 'text-blue-300' : 'text-slate-500'}`}>
                        {isConnected ? 'MQTT' : 'DISC'}
                    </div>
                </div>
                
                {/* Battery */}
                <div className="flex items-center gap-1">
                    <span className="text-[9px] text-white font-mono">{batteryLevel}%</span>
                    <div className="w-3.5 h-2 border border-white/60 rounded-[1px] p-[1px] flex items-center">
                        <div className="h-full bg-white/90 w-[90%]"></div>
                    </div>
                </div>
            </div>

            {/* Main Screen Content */}
            <div className={`flex-1 flex flex-col items-center justify-center transition-colors duration-300 relative ${isBusy ? 'bg-gradient-to-br from-red-600 to-red-700' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                {/* Scanlines effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
                
                <span className="relative text-3xl font-black text-white tracking-widest animate-pulse whitespace-nowrap drop-shadow-md">
                    {isBusy ? 'OCUPADO' : 'LIBRE'}
                </span>
            </div>
        </div>
        
        {/* Bezel / Button Area (Right side) */}
        <div className="w-14 bg-slate-800 flex flex-col items-center justify-center border-l-2 border-slate-600 z-10 relative shadow-inner">
          {/* Texture */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]"></div>
          
          <div className="relative">
              <button 
                onClick={onToggle}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] active:scale-95 active:border-slate-600 transition-all flex items-center justify-center group"
                title="Simulate Button A Press"
              >
                <div className="w-4 h-4 rounded-full bg-slate-500/50 group-hover:bg-orange-500/50 transition-colors"></div>
              </button>
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500/80 mt-1">M5</span>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-400">{label}</p>
    </div>
  );
};