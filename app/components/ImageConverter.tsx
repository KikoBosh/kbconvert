'use client';

import { useState, useRef } from 'react';
import NextImage from 'next/image';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { ChangeEvent } from 'react';
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import * as React from "react";

interface ConversionOptions {
  format: 'PNG' | 'JPG' | 'WEBP' | 'ICO' | 'ICNS';
  width?: number;
  height?: number;
}

interface ImageInfo {
  size: string;
  width: number;
  height: number;
  type: string;
}

export default function ImageConverter() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({
    format: 'PNG',
    width: undefined,
    height: undefined,
  });

  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
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
      } catch (error) {
        console.error('Error loading image:', error);
        setError('Failed to load image. Please try another file.');
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleConvert = async () => {
    if (!selectedImage) return;
    
    setIsConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('format', conversionOptions.format);
      if (conversionOptions.width) formData.append('width', conversionOptions.width.toString());
      if (conversionOptions.height) formData.append('height', conversionOptions.height.toString());

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted.${conversionOptions.format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error converting image:', error);
      setError('Failed to convert image. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="relative h-full">
      {mounted && (
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      )}

      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Image Converter</CardTitle>
          <p className="text-sm text-muted-foreground">
            Convert your images to different formats
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
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
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p className="font-medium">{selectedImage?.name}</p>
                <div className="flex justify-center gap-4 text-xs">
                  <p>Size: {imageInfo.size}</p>
                  <p>Dimensions: {imageInfo.width}×{imageInfo.height}</p>
                  <p>Type: {imageInfo.type.split('/')[1].toUpperCase()}</p>
                </div>
              </div>
            )}
          </div>

          {preview && (
            <div className="space-y-2">
              <div className="relative h-48 w-full bg-muted rounded-lg overflow-hidden">
                <NextImage
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
              {conversionOptions.width && conversionOptions.height && (
                <p className="text-xs text-center text-muted-foreground">
                  New dimensions: {conversionOptions.width}×{conversionOptions.height}
                  {imageInfo && (
                    <span className="ml-2">
                      (Original: {imageInfo.width}×{imageInfo.height})
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={conversionOptions.format}
                onValueChange={(value: ConversionOptions['format']) => setConversionOptions({
                  ...conversionOptions,
                  format: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PNG">PNG</SelectItem>
                  <SelectItem value="JPG">JPG</SelectItem>
                  <SelectItem value="WEBP">WEBP</SelectItem>
                  <SelectItem value="ICO">ICO (Multi-size)</SelectItem>
                  <SelectItem value="ICNS">ICNS (Mac Icon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width</Label>
                <Input
                  type="number"
                  value={conversionOptions.width || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConversionOptions({
                    ...conversionOptions,
                    width: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Input
                  type="number"
                  value={conversionOptions.height || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConversionOptions({
                    ...conversionOptions,
                    height: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleConvert}
            disabled={!selectedImage || isConverting}
            className="w-full"
          >
            {isConverting ? 'Converting...' : 'Convert Image'}
          </Button>

          {error && (
            <p className="text-sm text-destructive text-center">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 