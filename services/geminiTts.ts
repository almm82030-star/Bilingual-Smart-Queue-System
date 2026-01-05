

const API_KEY = (process.env.API_KEY || "");

/**
 * Decodes base64 to Uint8Array
 */
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM data for Web Audio API
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function announceTicket(
  ticketDisplay: string,
  deptNameAr: string,
  deptNameEn: string,
  roomNameAr: string,
  roomNameEn: string
) {
  if (!API_KEY) {
    console.error("API Key missing for TTS");
    return;
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Prompt for bilingual announcement
  const prompt = `TTS the following announcement:
      Arabic: التذكرة رقم ${ticketDisplay}، برجاء التوجه إلى ${roomNameAr}.
      English: Ticket number ${ticketDisplay}, please proceed to ${roomNameEn}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'Arabic',
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
              },
              {
                speaker: 'English',
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
              }
            ]
          }
        }
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (error) {
    console.error("Gemini TTS Error:", error);
  }
}
