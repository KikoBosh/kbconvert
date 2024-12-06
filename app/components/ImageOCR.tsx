'use client';

import { useState, useRef } from 'react';
import NextImage from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { createWorker } from 'tesseract.js';
import { macedonianAlphabet } from '../lib/mkd-alphabet';

interface ImageOCRProps {
  defaultLanguage: 'eng' | 'fra' | 'deu' | 'spa' | 'ita' | 'mkd_cyrl';
}

interface ImageInfo {
  size: string;
  width: number;
  height: number;
  type: string;
}

interface ConfigResult {
  vars: Record<string, string | number | boolean>;
}


// Define proper types for Tesseract Worker methods
type TesseractWorker = {
  loadLanguage: (lang: string) => Promise<void>;
  initialize: (lang: string) => Promise<void>;
  setParameters: (params: Record<string, string | number>) => Promise<ConfigResult>;
  recognize: (
    image: string,
    options?: {
      progress?: (m: { status: string; progress: number }) => void;
    }
  ) => Promise<{ data: { text: string } }>;
  terminate: () => Promise<void>;
  progress?: (m: { progress: number; status: string }) => void;
};

export default function ImageOCR({ defaultLanguage = 'eng' }: ImageOCRProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState(defaultLanguage);
  const [isDownloadingLanguage, setIsDownloadingLanguage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number>(0);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dimensions = await getImageDimensions(file);
        setImageInfo({
          size: formatFileSize(file.size),
          width: dimensions.width,
          height: dimensions.height,
          type: file.type
        });
        setSelectedImage(file);
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        setRecognizedText('');
      } catch (error) {
        console.error('Error loading image:', error);
        setError('Failed to load image. Please try another file.');
      }
    }
  };

  const performOCR = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    let worker: TesseractWorker;
    try {
      worker = await createWorker() as unknown as TesseractWorker;

      // Subscribe to progress updates
      if ('progress' in worker) {
        worker.progress = ({ progress, status }) => {
          if (status === 'loading tesseract core') {
            setProgress(Math.round(progress * 30));
          } else if (status === 'loading language traineddata') {
            setIsDownloadingLanguage(true);
            setProgress(30 + Math.round(progress * 30));
          } else if (status === 'recognizing text') {
            setIsDownloadingLanguage(false);
            setProgress(60 + Math.round(progress * 40));
          }
        };
      }

      await worker.loadLanguage(language);
      await worker.initialize(language);

      // Set Macedonian-specific parameters when mkd_cyrl is selected
      if (language === 'mkd_cyrl') {
        await worker.setParameters({
          tessedit_ocr_engine_mode: '1',
          preserve_interword_spaces: '1',
          tessjs_create_pdf: '0',
          tessjs_create_hocr: '0',
          tessjs_create_tsv: '0',
          tessedit_char_whitelist: macedonianAlphabet.whitelist,
          debug_file: '/dev/null',
          // Additional parameters for better Cyrillic recognition
          tessedit_pageseg_mode: '1',  // Automatic page segmentation with OSD
          textord_heavy_nr: '1',       // Heavy noise removal
          language_model_penalty_non_freq_dict_word: '0.5',
          language_model_penalty_non_dict_word: '0.8',
        });
      } else {
        await worker.setParameters({
          tessedit_ocr_engine_mode: '1',
          preserve_interword_spaces: '1',
          tessjs_create_pdf: '0',
          tessjs_create_hocr: '0',
          tessjs_create_tsv: '0',
        });
      }

      const imageUrl = URL.createObjectURL(selectedImage);
      const { data: { text } } = await worker.recognize(imageUrl);
      
      const cleanedText = text
        .replace(/\f/g, '')
        .replace(/[\r\n]+/g, '\n')
        .trim();

      setRecognizedText(cleanedText);
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error('OCR Error:', error);
      setError('Failed to perform OCR. Please try again.');
    } finally {
      if (worker!) {
        await worker.terminate();
      }
      setIsProcessing(false);
      setProgress(0);
      setIsDownloadingLanguage(false);
    }
  };

  return (
    <div className="h-full p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Image to Text (OCR)</h2>
        <p className="text-sm text-muted-foreground">
          Extract text from images using OCR technology
        </p>
      </div>

      <div className="space-y-8">
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            className="w-full max-w-[200px]"
          >
            Select Image
          </Button>
          {imageInfo && (
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="font-medium">{selectedImage?.name}</p>
              <div className="flex justify-center gap-6 text-xs">
                <p>Size: {imageInfo.size}</p>
                <p>Dimensions: {imageInfo.width}×{imageInfo.height}</p>
                <p>Type: {imageInfo.type.split('/')[1].toUpperCase()}</p>
              </div>
            </div>
          )}
        </div>

        {preview && (
          <div className="space-y-4">
            <div className="relative h-64 w-full bg-muted rounded-lg overflow-hidden group">
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setSelectedImage(null);
                  setPreview(null);
                  setImageInfo(null);
                  setRecognizedText('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <NextImage
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={language}
              onValueChange={(value: typeof language) => setLanguage(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eng">English</SelectItem>
                <SelectItem value="mkd_cyrl">Macedonian (Cyrillic)</SelectItem>
                <SelectItem value="fra">French</SelectItem>
                <SelectItem value="deu">German</SelectItem>
                <SelectItem value="spa">Spanish</SelectItem>
                <SelectItem value="ita">Italian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={performOCR}
            disabled={!selectedImage || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing 
              ? isDownloadingLanguage 
                ? `Downloading language data... ${progress.toFixed(0)}%`
                : `Processing... ${progress.toFixed(0)}%`
              : 'Extract Text'
            }
          </Button>

          {isProcessing && (
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">
              {error}
            </p>
          )}

          {recognizedText && (
            <div className="space-y-2">
              <Label>Extracted Text</Label>
              <Textarea
                value={recognizedText}
                readOnly
                className="min-h-[200px]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 