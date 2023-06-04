export const checkSupportedImageExtension = (mimetype: string) =>
  mimetype === 'image/png' || mimetype === 'image/jpeg';

export const getImageExtension = (mimetype: string) => {
  switch (mimetype) {
    case 'image/png':
      return '.png';
    case 'image/jpeg':
      return '.jpg';
    default:
      throw new Error('Mimetype not supported!');
  }
};
