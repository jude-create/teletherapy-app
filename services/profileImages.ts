import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

type UploadProfileImageInput = {
  uid: string;
  role?: string;
  uri: string;
};

const extensionFromUri = (uri = '') => {
  const cleanUri = uri.split('?')[0];
  const extension = cleanUri.includes('.') ? cleanUri.split('.').pop()?.toLowerCase() : 'jpg';
  return ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
};

export const uploadProfileImage = async ({ uid, role, uri }: UploadProfileImageInput) => {
  if (!uid) throw new Error('You need to be signed in before uploading a profile image.');
  if (!uri) throw new Error('Choose an image before saving.');

  const response = await fetch(uri);
  const blob = await response.blob();
  const extension = extensionFromUri(uri);
  const imageRef = ref(storage, `profileImages/${role || 'users'}/${uid}.${extension}`);

  await uploadBytes(imageRef, blob, {
    contentType: blob.type || `image/${extension === 'jpg' ? 'jpeg' : extension}`,
  });

  return getDownloadURL(imageRef);
};
