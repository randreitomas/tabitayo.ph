export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read file'))
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

const UPLOADABLE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] as const

export function isUploadableImage(file: File): boolean {
  return (UPLOADABLE_IMAGE_TYPES as readonly string[]).includes(file.type)
}

export const UPLOADABLE_IMAGE_ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
} as const

/** Default backend max for public photo uploads (5 MB). */
export const MAX_PHOTO_UPLOAD_BYTES = 5 * 1024 * 1024

/** @deprecated Use isUploadableImage */
export const isFloorPlanImage = isUploadableImage
