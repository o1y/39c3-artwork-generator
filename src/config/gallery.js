/**
 * Gallery configuration from environment variables
 */
export const galleryConfig = {
  isPublicGalleryEnabled: import.meta.env.VITE_ENABLE_PUBLIC_GALLERY === 'true',
};
