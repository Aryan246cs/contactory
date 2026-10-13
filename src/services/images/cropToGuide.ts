import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export type ScreenRect = { x: number; y: number; width: number; height: number };
export type PixelRect = { originX: number; originY: number; width: number; height: number };

/** Map a visible guide through a center-cropped camera preview to photo pixels. */
export function guideCropPixels(imageWidth: number, imageHeight: number, camera: ScreenRect, guide: ScreenRect): PixelRect {
  if (imageWidth <= 0 || imageHeight <= 0 || camera.width <= 0 || camera.height <= 0) throw new Error('Camera dimensions are unavailable.');
  const scale = Math.max(camera.width / imageWidth, camera.height / imageHeight);
  const renderedWidth = imageWidth * scale;
  const renderedHeight = imageHeight * scale;
  const offsetX = (camera.width - renderedWidth) / 2;
  const offsetY = (camera.height - renderedHeight) / 2;
  const left = Math.max(0, Math.min(imageWidth, (guide.x - camera.x - offsetX) / scale));
  const top = Math.max(0, Math.min(imageHeight, (guide.y - camera.y - offsetY) / scale));
  const right = Math.max(left, Math.min(imageWidth, (guide.x - camera.x + guide.width - offsetX) / scale));
  const bottom = Math.max(top, Math.min(imageHeight, (guide.y - camera.y + guide.height - offsetY) / scale));
  const originX = Math.floor(left);
  const originY = Math.floor(top);
  return {
    originX,
    originY,
    width: Math.max(1, Math.min(imageWidth - originX, Math.ceil(right) - originX)),
    height: Math.max(1, Math.min(imageHeight - originY, Math.ceil(bottom) - originY)),
  };
}

export async function cropPhotoToGuide(uri: string, imageWidth: number, imageHeight: number, camera: ScreenRect, guide: ScreenRect) {
  const crop = guideCropPixels(imageWidth, imageHeight, camera, guide);
  return manipulateAsync(uri, [{ crop }], { compress: 0.94, format: SaveFormat.JPEG });
}
