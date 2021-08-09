import React, { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import XLSX from 'xlsx';

import './FileSelector.scss';

export const FileSelector: React.FC<{ onSelected: (file: File) => void }> = ({
  onSelected
}) => {
  const onSelectedRef = useRef(onSelected);
  onSelectedRef.current = onSelected;

  const dropHandler = useCallback((acceptedFiles: File[]) => {
    // silently ignore if nothing to do
    if (acceptedFiles.length < 1) {
      return;
    }

    const file = acceptedFiles[0];

    if (file.name.includes('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target?.result as never);
        const workbook = XLSX.read(data, { type: 'array' });

        const converted = XLSX.utils.sheet_to_csv(
          workbook.Sheets[workbook.SheetNames[0]]
        );

        const blob = new Blob([converted], { type: 'text/csv' });

        const newFile = new File([blob], file.name);

        onSelectedRef.current(newFile);
      };

      reader.readAsArrayBuffer(file);
    } else {
      onSelectedRef.current(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: dropHandler
  });

  return (
    <div
      className="CSVImporter_FileSelector"
      data-active={!!isDragActive}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <span>Drop CSV or Excel file here...</span>
      ) : (
        <span>
          Drag-and-drop CSV or Excel file here, or click to select in folder
        </span>
      )}
    </div>
  );
};
