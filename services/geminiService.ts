import { GoogleGenAI } from "@google/genai";
import { ConnectionType, FirmwareConfig } from '../types';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFirmware = async (config: FirmwareConfig): Promise<string> => {
  const ai = getAI();
  
  const isMqtt = config.connectionType === ConnectionType.WIFI_MQTT;

  const prompt = `
    Act as an embedded systems expert for M5Stack devices.
    Write a complete, production-ready PlatformIO/Arduino C++ sketch for the original **M5Stick-C** (Non-Plus version).
    
    **System Overview:** 
    A synchronized "Busy Light" system consisting of two devices ("Office" and "Door").
    
    **Network & Protocol Requirements:**
    ${isMqtt ? `
    - **Protocol:** MQTT over WiFi.
    - **WiFi SSID:** "${config.wifiSsid}"
    - **WiFi Password:** "${config.wifiPass}"
    - **MQTT Broker:** "${config.mqttBroker}"
    - **MQTT Port:** ${config.mqttPort}
    - **MQTT Topic:** "${config.mqttTopic}" (Both devices subscribe and publish to this topic).
    - **Behavior:** 
        1. On boot, connect to WiFi and MQTT.
        2. Subscribe to "${config.mqttTopic}".
        3. When a message is received ("OCUPADO" or "LIBRE"), update the local state.
        4. When Button A is pressed, toggle local state and PUBLISH the new state ("OCUPADO" or "LIBRE") to "${config.mqttTopic}" with 'retain' flag set to true.
    ` : `
    - **Protocol:** ${config.connectionType} (Please adapt sync logic accordingly).
    `}

    **Visual Requirements (LCD):**
    - **Device Screen:** Original M5Stick-C (ST7735S).
    - **Resolution:** 160x80 pixels (smaller than the Plus model).
    - **Orientation:** Landscape (M5.Lcd.setRotation(1)). The Button A (Home) is on the RIGHT side.
    - **Dimensions:** Treat width as 160px and height as 80px.
    - **Status Bar (Top 15px):** 
        - Draw a small status bar background across the top.
        - Left align: WiFi icon/text ("WF") and "MQTT" status.
        - Right align: Battery Voltage (M5.Axp.GetBatVoltage()).
        - Use very small text (setTextSize(1)) for the status bar due to low resolution.
    - **Main Area:**
        - **BUSY State:** Background RED, Text "OCUPADO" (White, Centered). 
          - Use text size 3 (approx 18px width per char * 7 chars = 126px, fits in 160px).
        - **FREE State:** Background GREEN, Text "LIBRE" (White, Centered). Use text size 3.

    **Hardware:**
    - Device: M5Stick-C (Original).
    - Library: Use <M5StickC.h> (NOT M5StickCPlus.h).
    - Power Management: M5.Axp is available on this device.
    - Input: Button A (M5.BtnA) - located on the front/right.

    **Output Format:**
    - Provide a single C++ code block.
    - Include necessary library imports (<M5StickC.h>, <WiFi.h>, <PubSubClient.h>).
    - Add comments explaining how to configure platformio.ini (lib_deps should include 'M5StickC').
    - Since the user wants to use "esphome web flasher" or similar tools, remind them this is C++ source that needs compiling to a .bin file first.

    **Important:**
    - Ensure non-blocking loop (use millis() for updates/debouncing).
    - Auto-reconnect to WiFi/MQTT if connection is lost.
    - Ensure text centering calculations account for the string length of "OCUPADO" and "LIBRE" within the 160px width.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, 
      }
    });

    return response.text || "// Error: No code generated. Please try again.";
  } catch (error) {
    console.error("Gemini Firmware Gen Error:", error);
    return `// Error generating firmware: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export const chatWithAssistant = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
    config: {
      systemInstruction: "You are a helpful hardware engineer assistant specializing in M5Stack, ESP32, and IoT. Keep answers concise and practical.",
    }
  });

  try {
    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I encountered an error talking to the hardware assistant.";
  }
};