import axios from 'axios';

const cloudName = process.env.REACT_APP_CLOUD_NAME;
const audioUploadPreset = process.env.REACT_APP_CLOUD_PRESET;
const imageUploadPreset = 'strict_image_upload'; 

// Validate config
if (!cloudName || !audioUploadPreset) {
  throw new Error('Missing Cloudinary configuration. Please check your .env file.');
}


const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg',
  'image/svg+xml', 'image/avif'
];

const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
  'audio/x-m4a', 'audio/aac', 'audio/x-aac', 'audio/mp4',
  'audio/x-wav', 'audio/flac', 'audio/x-flac'
];


const validateFile = (file) => {
  console.log('Validating file:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    lastModifiedDate: file.lastModifiedDate
  });

  const extension = file.name.split('.').pop().toLowerCase();
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type) || 
                 ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(extension);
  const isAudio = SUPPORTED_AUDIO_TYPES.includes(file.type) || 
                 ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(extension);

  if (!isImage && !isAudio) {
    console.error('Unsupported file type detected:', {
      fileName: file.name,
      fileType: file.type,
      fileExtension: extension
    });
    throw new Error(`Unsupported file type: ${file.type || extension}`);
  }

  return { isImage, isAudio };
};


export const uploadToCloudinary = async (file, onProgress = null) => {
  try {
  
    console.group('File Upload - Before Cloudinary Upload');
    console.log('File Details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      lastModified: new Date(file.lastModified).toLocaleString(),
      isImage: file.type.startsWith('image/'),
      isAudio: file.type.startsWith('audio/')
    });

    // For images, create a preview and log dimensions
    if (file.type.startsWith('image/')) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      await new Promise((resolve) => {
        img.onload = () => {
          console.log('Image Preview Dimensions:', {
            width: img.width,
            height: img.height,
            aspectRatio: (img.width / img.height).toFixed(2)
          });
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        img.src = objectUrl;
      });
    }
    console.groupEnd();

    // Validate file type
    const { isImage, isAudio } = validateFile(file);
    
    
    const resourceType = isImage ? 'image' : 'video';
    const preset = isImage ? imageUploadPreset : audioUploadPreset;
    const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    
    if (file.size > maxSize) {
      throw new Error(`File too large. Max size: ${maxSize / 1024 / 1024}MB`);
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('upload_preset', preset);
    
    console.log('Starting Cloudinary upload with preset:', preset);
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
          console.log(`Upload progress: ${percent}%`);
        }
      }
    });

    // Detailed response logging
    console.group('File Upload - After Cloudinary Upload');
    console.log('Upload successful! Response data:', {
      url: response.data.secure_url,
      publicId: response.data.public_id,
      format: response.data.format,
      resourceType: response.data.resource_type,
      ...(isImage && {
        dimensions: `${response.data.width}x${response.data.height}`,
        bytes: response.data.bytes,
        colorSpace: response.data.colorspace,
        dominantColor: response.data.predominant?.google
      }),
      ...(isAudio && {
        duration: Math.round(response.data.duration || 0),
        audioCodec: response.data.audio?.codec,
        audioBitrate: response.data.audio?.bit_rate
      }),
      fullResponse: response.data
    });

    if (isImage) {
      console.log('Image URL:', response.data.secure_url);
      console.log('%c ', `
        font-size: 100px; 
        background: url(${response.data.secure_url}) no-repeat;
        background-size: contain;
        padding: 50px;
      `, 'Image preview in console');
    }
    console.groupEnd();

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
      format: response.data.format,
      resourceType: response.data.resource_type,
      ...(isImage && {
        width: response.data.width,
        height: response.data.height
      }),
      ...(isAudio && {
        duration: Math.round(response.data.duration || 0)
      }),
      bytes: response.data.bytes
    };

  } catch (error) {
    let errorMessage = 'Upload failed';
    
    if (error.response) {
      
      errorMessage = error.response.data?.error?.message || 
                    error.response.data?.message || 
                    JSON.stringify(error.response.data);
    } else if (error.request) {
    
      errorMessage = 'No response received from Cloudinary';
    } else {
     
      errorMessage = error.message;
    }

    console.group('Upload Error');
    console.error('Upload failed:', {
      fileName: file?.name,
      fileType: file?.type,
      errorDetails: errorMessage,
      stack: error.stack
    });
    console.groupEnd();

    throw new Error(errorMessage);
  }
};
// Batch upload with enhanced logging
export const uploadMultipleToCloudinary = async (files, onProgress = null) => {
  console.group('Batch Upload Started');
  console.log('Total files to upload:', files.length);
  console.table(files.map(file => ({
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
  })));
  console.groupEnd();

  const results = [];
  let completed = 0;
  const totalFiles = files.length;

  const uploadWithRetry = async (file, retries = 2) => {
    try {
      return await uploadToCloudinary(file, (percent) => {
        if (onProgress) {
          const totalPercent = Math.round(
            (completed * 100 + percent) / totalFiles
          );
          onProgress(totalPercent);
        }
      });
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying upload for ${file.name}... (${retries} attempts left)`);
        return uploadWithRetry(file, retries - 1);
      }
      throw error;
    }
  };

  for (const file of files) {
    try {
      console.log(`Starting upload for: ${file.name}`);
      const result = await uploadWithRetry(file);
      results.push(result);
      completed++;
      console.log(`Completed upload for: ${file.name}`);
    } catch (error) {
      console.error(`Failed to upload ${file.name} after multiple attempts:`, error.message);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
  }

  console.group('Batch Upload Completed');
  console.log('Upload results:', results);
  console.table(results.map(result => ({
    url: result.url,
    type: result.resourceType,
    size: `${(result.bytes / 1024 / 1024).toFixed(2)}MB`,
    ...(result.width && { dimensions: `${result.width}x${result.height}` }),
    ...(result.duration && { duration: `${result.duration}s` })
  })));
  console.groupEnd();

  return results;
};