import React, { useState } from 'react';
import { UploadCloud, Check, FileCheck } from 'lucide-react';

export default function EvidenceUploader({ onFilesReady }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleSimulateUpload = (docType) => {
    const fileName = `${docType}_verified_${Date.now().toString().slice(-4)}.pdf`;
    const newFiles = [...uploadedFiles, { type: docType, name: fileName, size: '1.4 MB' }];
    setUploadedFiles(newFiles);
    if (onFilesReady) onFilesReady(newFiles);
  };

  const uploadSlots = [
    { type: 'weighbridge', label: 'Weighbridge Intake Slip' },
    { type: 'processingLog', label: 'Reactor Energy/Temp Logs' },
    { type: 'outputRecord', label: 'Assay Output Certification' },
    { type: 'downstreamInvoice', label: 'Downstream Off-taker Lading' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h4 className="font-semibold text-slate-100 text-sm mb-1">Attach Physical & IoT Evidence</h4>
      <p className="text-xs text-slate-400 mb-4">Files will be canonicalized and hashed into Merkle leaves</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {uploadSlots.map(slot => {
          const isUploaded = uploadedFiles.some(f => f.type === slot.type);

          return (
            <div 
              key={slot.type}
              onClick={() => handleSimulateUpload(slot.type)}
              className={`p-3 rounded-lg border border-dashed cursor-pointer transition-all flex items-center justify-between ${
                isUploaded 
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isUploaded ? <FileCheck size={18} className="text-emerald-400" /> : <UploadCloud size={18} />}
                <span className="text-xs font-medium">{slot.label}</span>
              </div>
              {isUploaded && <Check size={14} className="text-emerald-400" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
