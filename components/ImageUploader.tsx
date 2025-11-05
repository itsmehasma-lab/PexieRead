import React from 'react';
// Fix: Added .tsx extension to fix module resolution error.
import { UploadIcon, CloseIcon } from './icons.tsx';

interface ImageUploaderProps {
  onImageSelect: (files: File[]) => void;
  imageUrl: string | null;
  onClearImage: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imageUrl, onClearImage }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onImageSelect(Array.from(event.target.files));
    }
  };

  const handleClearClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClearImage();
  };

  return (
    <div className="w-full">
      <label
        htmlFor="image-upload"
        className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-white/5 border-gray-600 hover:border-blue-500 hover:bg-white/10 transition-all duration-300 group shadow-lg"
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Preview" className="object-contain w-full h-full rounded-lg" />
            <button
              onClick={handleClearClick}
              className="absolute top-2 right-2 p-1.5 bg-gray-900/70 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-colors"
              aria-label="Remove image"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
            <UploadIcon className="w-10 h-10 mb-3 transition-transform duration-300 group-hover:-translate-y-1" />
            <p className="mb-2 text-sm">
              <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs">PNG, JPG, GIF or WEBP</p>
          </div>
        )}
        <input
          id="image-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          multiple
        />
      </label>
    </div>
  );
};

export default ImageUploader;