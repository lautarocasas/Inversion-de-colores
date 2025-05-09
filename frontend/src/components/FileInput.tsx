import React, { useState, useRef, type ChangeEvent } from "react";
import Icon from "./Icon/Icon";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onProcessedUrl: (url: string) => void;
  onOriginalUrl: (url: string) => void;
  label: string;
  required?: boolean;
  error: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onProcessedUrl,
  onOriginalUrl,
  label,
  required,
  error
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile: File = e.target.files![0];
    if (uploadedFile) {
      setSelectedFile(uploadedFile);
      onFileSelect(uploadedFile);
      onProcessedUrl(""); // limpiar anterior
  
      const formData = new FormData();
      formData.append('image', uploadedFile);
  
      const res = await fetch('http://localhost:3000/convert-original', {
        method: 'POST',
        body: formData
      });
  
      const blob = await res.blob();
      const originalImgUrl: string = URL.createObjectURL(blob);
      onOriginalUrl(originalImgUrl);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      const uploadedFile: File = event.dataTransfer.files![0];
    if (uploadedFile) {
      setSelectedFile(uploadedFile);
      onFileSelect(uploadedFile);
      onProcessedUrl(""); // limpiar anterior
  
      const formData = new FormData();
      formData.append('image', uploadedFile);
  
      const res = await fetch('http://localhost:3000/convert-original', {
        method: 'POST',
        body: formData
      });
  
      const blob = await res.blob();
      const originalImgUrl: string = URL.createObjectURL(blob);
      onOriginalUrl(originalImgUrl);
    }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = () => {
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-3xl">
      <div className="flex">
        <h3
          className={`text-white flex items-center font-bld text-3xl`}
        >
          {label}
        </h3>
        {required && (
          <p className="text-[#f00] flex text-xl font-bold">&nbsp;*</p>
        )}
      </div>
      <div className="flex flex-col items-center gap-4">
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center w-[100%] h-[400px] border-2 border-dashed rounded-xl cursor-pointer ${isDragging ? "border-primary" : "border-primary/30"} hover:border-primary`}
        >
          <Icon
            name={"UploadFileIcon"}
            fillColor={"#fff"}
            width={isDragging ? "256" : "64"}
            height={isDragging ? "256" : "64"}
          />
          {!isDragging && (
            <span className="mt-2 text-3xl text-primary">Subí un archivo (.pgm)</span>
          )}
          <input
            id="file-upload"
            title="file-upload"
            type="file"
            accept=".pgm"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {error !== "" && <p className="text-2xl text-[#f00]">{error}</p>}
        {selectedFile && (
          <div className="flex items-center justify-between space-x-4 bg-gray-300 p-4 rounded-lg w-[70%]">
            <span className="text-xl text-black">Archivo subido: <strong>{selectedFile.name}</strong></span>
            <button title="remove_file" id="remove_file" onClick={handleRemoveFile} className="focus:outline-none">
              <Icon name={"TrashIcon"} fillColor={"#fff"} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;