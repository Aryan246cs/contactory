export type OCRResult = { text: string; blocks?: Array<{ text: string; boundingBox?: { x: number; y: number; width: number; height: number } }> };

export async function recognizeTextFromImage(uri: string): Promise<OCRResult> {
  try {
    // Deferred import lets the rest of the app run in Expo Go, where custom native OCR is not bundled.
    const nativeOCR = await import('expo-ocr-kit');
    const result = await nativeOCR.recognizeText(uri);
    return { text: result.text, blocks: result.blocks };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/expo.?go|native module|could not be found|not installed|unavailable/i.test(message)) {
      throw new Error('On-device card reading is unavailable in Expo Go. Open Vemori in its development build, or enter the details manually.');
    }
    throw new Error('Vemori could not read this image. Try a clearer, well-lit photo or enter the details manually.');
  }
}
