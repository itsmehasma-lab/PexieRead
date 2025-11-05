
import React from 'react';

interface SampleImagesProps {
  onSelectSample: (url: string) => void;
  isLoading: boolean;
}

const samples = [
  {
    name: 'Digits',
    url: 'https://storage.googleapis.com/maker-suite-gallery/codelab-us-public/Sample_Digi-Label_2.png',
    description: 'A price tag with numbers.'
  },
  {
    name: 'Alphabets',
    url: 'https://storage.googleapis.com/maker-suite-gallery/codelab-us-public/Sample_text_1.png',
    description: 'An "OPEN" sign.'
  },
  {
    name: 'Alphanumeric',
    url: 'https://storage.googleapis.com/maker-suite-gallery/codelab-us-public/Sample_Alphanumeric_1.png',
    description: 'A vehicle license plate.'
  },
];

const SampleImages: React.FC<SampleImagesProps> = ({ onSelectSample, isLoading }) => {
  return (
    <div className="w-full text-center animate-fade-in">
        <div className="flex items-center justify-center my-4">
            <span className="flex-shrink mx-4 text-gray-400">or try one of these samples</span>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {samples.map((sample) => (
          <button
            key={sample.name}
            onClick={() => onSelectSample(sample.url)}
            disabled={isLoading}
            className="group relative block w-full bg-white/5 rounded-lg border border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src={sample.url}
              alt={sample.description}
              className="w-full h-32 object-contain rounded-t-lg p-2"
            />
            <div className="p-3 bg-white/5 rounded-b-lg">
              <p className="font-semibold text-gray-200">{sample.name}</p>
              <p className="text-xs text-gray-400">{sample.description}</p>
            </div>
            <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SampleImages;
