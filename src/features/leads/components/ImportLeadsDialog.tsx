'use client';

import { useState, useEffect } from 'react';
import * as ExcelJS from 'exceljs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Download, Upload, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { leadsApi } from '../services/leadsApi';
import { ImportValidationResult, ImportResult } from '@/features/leads/services/leadsApi';

interface ImportLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = 'upload' | 'preview' | 'duplicates' | 'confirm' | 'progress' | 'results';

export function ImportLeadsDialog({ open, onOpenChange, onSuccess }: ImportLeadsDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'review' | 'update'>('skip');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setValidationResult(null);
      setImportResult(null);
      setDuplicateHandling('skip');
      setStep('upload');
    }
  }, [open]);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await leadsApi.downloadTemplate();
      
      if (!blob || blob.size === 0) {
        toast.error('Failed to download template: empty response from server');
        return;
      }

      if (!(blob instanceof Blob)) {
        toast.error('Invalid file format received from server');
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Template downloaded successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download template';
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast.error('Your session has expired. Please sign in again.');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        toast.error('You do not have permission to download the template.');
      } else if (errorMessage.includes('404')) {
        toast.error('Template download endpoint not found.');
      } else if (errorMessage.includes('500')) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const validExtensions = ['.xlsx'];
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();

    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
      toast.error('Please upload an Excel (.xlsx) file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleValidate = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      const result = await leadsApi.validateImport(file);
      setValidationResult(result);

      if (result.invalid > 0 || result.duplicates > 0) {
        if (result.duplicates > 0) {
          setStep('duplicates');
        } else {
          setStep('preview');
        }
      } else {
        setStep('confirm');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate file';
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast.error('Your session has expired. Please sign in again.');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        toast.error('You do not have permission to import leads.');
      } else if (errorMessage.includes('413')) {
        toast.error('File is too large. Maximum size is 5MB.');
      } else if (errorMessage.includes('File size exceeds')) {
        toast.error(errorMessage);
      } else if (errorMessage.includes('File exceeds') || errorMessage.includes('row limit')) {
        toast.error(errorMessage);
      } else if (errorMessage.includes('empty') || errorMessage.includes('corrupted')) {
        toast.error(errorMessage);
      } else if (errorMessage.includes('No file uploaded')) {
        toast.error('No file was uploaded. Please try again.');
      } else if (errorMessage.includes('500')) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
      
      // Keep modal open in upload step after error
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setStep('progress');
      const result = await leadsApi.importLeads(file, duplicateHandling);
      setImportResult(result);
      setStep('results');
      
      if (result.imported > 0) {
        toast.success(`Successfully imported ${result.imported} lead(s)`);
        // Close dialog immediately after successful import
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else if (result.skipped > 0) {
        toast.info(`${result.skipped} lead(s) skipped`);
        // Close dialog if only skipped (no errors)
        if (result.failed === 0) {
          setTimeout(() => {
            handleClose();
          }, 1000);
        }
      } else if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} lead(s)`);
      }
      
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import leads';
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast.error('Your session has expired. Please sign in again.');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        toast.error('You do not have permission to import leads.');
      } else if (errorMessage.includes('500')) {
        toast.error('Server error during import. Please try again.');
      } else {
        toast.error(errorMessage);
      }
      
      setStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setImportResult(null);
    setDuplicateHandling('skip');
    setStep('upload');
  };

  const handleClose = () => {
    if (isProcessing) return;
    handleReset();
    onOpenChange(false);
  };

  const downloadErrorReport = async () => {
    if (!validationResult || validationResult.errors.length === 0) return;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Errors');

      worksheet.columns = [
        { header: 'Row Number', key: 'rowNumber', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Errors', key: 'errors', width: 50 },
      ];

      validationResult.errors.forEach((error) => {
        worksheet.addRow({
          rowNumber: error.rowNumber,
          status: error.status,
          errors: error.errors.join('; '),
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'import_errors.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to generate error report');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Leads from Excel</DialogTitle>
        </DialogHeader>

        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm font-medium">Processing...</p>
          </div>
        )}

        {!isProcessing && step === 'upload' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Download Template</span>
              </div>
              <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">
                Drag and drop your Excel file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supports .xlsx files (max 5MB, 1000 rows)
              </p>
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>Browse Files</span>
                </Button>
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <Button onClick={() => setFile(null)} variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleValidate} disabled={!file || isProcessing}>
                {isProcessing ? 'Validating...' : 'Validate File'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {!isProcessing && step === 'preview' && validationResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{validationResult.total}</div>
                <div className="text-xs text-muted-foreground">Total Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{validationResult.valid}</div>
                <div className="text-xs text-muted-foreground">Valid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{validationResult.invalid}</div>
                <div className="text-xs text-muted-foreground">Invalid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{validationResult.duplicates}</div>
                <div className="text-xs text-muted-foreground">Duplicates</div>
              </div>
            </div>

            {validationResult.invalid > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Validation Errors</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {validationResult.errors.map((error, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-sm">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Row {error.rowNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {error.errors.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={downloadErrorReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              </div>
            )}

            {validationResult.valid > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Preview (First 5 rows)</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Client Name</th>
                        <th className="px-3 py-2 text-left font-medium">Phone</th>
                        <th className="px-3 py-2 text-left font-medium">Email</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.validRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{row.clientName}</td>
                          <td className="px-3 py-2">{row.phone}</td>
                          <td className="px-3 py-2">{row.email || '-'}</td>
                          <td className="px-3 py-2">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleReset}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={validationResult.valid === 0 || isProcessing}
              >
                {isProcessing ? 'Importing...' : 'Import Leads'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {!isProcessing && step === 'duplicates' && validationResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="text-sm">
                <span className="font-medium">{validationResult.duplicates} duplicate(s) detected.</span>
                Please choose how to handle them.
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duplicate Handling</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                  <input
                    type="radio"
                    name="duplicateHandling"
                    value="skip"
                    checked={duplicateHandling === 'skip'}
                    onChange={(e) => setDuplicateHandling(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Skip Duplicates</div>
                    <div className="text-xs text-muted-foreground">
                      Do not import duplicate leads
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                  <input
                    type="radio"
                    name="duplicateHandling"
                    value="review"
                    checked={duplicateHandling === 'review'}
                    onChange={(e) => setDuplicateHandling(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Review Later</div>
                    <div className="text-xs text-muted-foreground">
                      Mark duplicates for manual review
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                  <input
                    type="radio"
                    name="duplicateHandling"
                    value="update"
                    checked={duplicateHandling === 'update'}
                    onChange={(e) => setDuplicateHandling(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Update Existing</div>
                    <div className="text-xs text-muted-foreground">
                      Update existing leads with new data
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('preview')}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={isProcessing}>
                {isProcessing ? 'Importing...' : 'Import Leads'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {!isProcessing && step === 'confirm' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="text-sm">
                <span className="font-medium">Ready to import {validationResult?.valid || 0} lead(s)</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleReset}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={isProcessing}>
                {isProcessing ? 'Importing...' : 'Import Leads'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {!isProcessing && step === 'progress' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm font-medium">Importing leads...</p>
            <p className="text-xs text-muted-foreground">This may take a moment</p>
          </div>
        )}

        {!isProcessing && step === 'results' && importResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{importResult.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                <div className="text-xs text-muted-foreground">Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{importResult.skipped}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>

            {importResult.imported > 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  {importResult.imported} lead(s) imported successfully
                </span>
              </div>
            )}

            {importResult.failed > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">
                  {importResult.failed} lead(s) failed to import
                </span>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
