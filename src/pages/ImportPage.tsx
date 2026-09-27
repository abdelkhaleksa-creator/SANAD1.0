// ============================================================
// SANAD 1.0 - Massar Import Page
// ============================================================
import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, History } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { PageHeader, Button, Card, Badge } from '../components';
import { studentRepository } from '../repositories/studentRepository';
import { importHistoryRepository } from '../repositories';
import type { ImportHistory, StudentFormData } from '../types';
import { getSchoolYear } from '../utils';

interface ImportResult {
  total: number;
  created: number;
  updated: number;
  errors: string[];
}

export function ImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [history, setHistory] = useState<ImportHistory[]>([]);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const h = await importHistoryRepository.getAll();
    setHistory(h);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setResult(null);
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    try {
      let data: Record<string, string>[] = [];
      
      if (ext === 'csv') {
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        data = parsed.data as Record<string, string>[];
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(sheet);
      }
      
      setPreview(data.slice(0, 10));
    } catch (err) {
      console.error('Error reading file:', err);
    }
  };

  const handleImport = async () => {
    const file = document.querySelector<HTMLInputElement>('input[type="file"]')?.files?.[0];
    if (!file) return;
    
    setImporting(true);
    setResult(null);
    
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let rawData: Record<string, string>[] = [];
      
      if (ext === 'csv') {
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        rawData = parsed.data as Record<string, string>[];
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rawData = XLSX.utils.sheet_to_json(sheet);
      }
      
      const errors: string[] = [];
      const students: StudentFormData[] = [];
      
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const massar = row['massar_code'] || row['Massar'] || row['رقم مسار'] || row['massar'] || '';
        const firstName = row['first_name'] || row['الاسم'] || row['Nom'] || row['prenom'] || '';
        const lastName = row['last_name'] || row['النسب'] || row['Prenom'] || row['nom'] || '';
        
        if (!massar) {
          errors.push(`سطر ${i + 2}: رقم مسار مفقود`);
          continue;
        }
        
        if (!firstName || !lastName) {
          errors.push(`سطر ${i + 2}: الاسم أو النسب مفقود`);
          continue;
        }
        
        students.push({
          massar_code: massar.toString().trim(),
          first_name: firstName.toString().trim(),
          last_name: lastName.toString().trim(),
          full_name: `${firstName.toString().trim()} ${lastName.toString().trim()}`,
          gender: (row['gender'] || row['الجنس'] || row['Genre'] || 'male').toString().toLowerCase().includes('f') || 
                  (row['gender'] || row['الجنس'] || '').toString().includes('أنث') ? 'female' : 'male',
          date_of_birth: row['date_of_birth'] || row['تاريخ الازدياد'] || row['Date naissance'] || '',
          place_of_birth: row['place_of_birth'] || row['مكان الازدياد'] || row['Lieu naissance'] || '',
          nationality: row['nationality'] || row['الجنسية'] || 'مغربية',
          address: row['address'] || row['العنوان'] || '',
          phone: row['phone'] || row['الهاتف'] || '',
          guardian_name: row['guardian_name'] || row['الولي'] || '',
          guardian_phone: row['guardian_phone'] || row['هاتف الولي'] || '',
          cycle: row['cycle'] || row['السلك'] || '',
          level: row['level'] || row['المستوى'] || row['Niveau'] || '',
          stream: row['stream'] || row['الشعبة'] || row['Filiere'] || '',
          specialty: row['specialty'] || row['المسلك'] || '',
          class: row['class'] || row['القسم'] || row['Classe'] || '',
          school_year: row['school_year'] || row['السنة الدراسية'] || getSchoolYear(),
          status: 'active'
        });
      }
      
      const { created, updated } = await studentRepository.bulkUpsert(students);
      
      const importResult: ImportResult = {
        total: rawData.length,
        created,
        updated,
        errors
      };
      setResult(importResult);
      
      // Save import history
      await importHistoryRepository.create({
        import_date: new Date().toISOString(),
        file_name: file.name,
        total_records: rawData.length,
        new_records: created,
        updated_records: updated,
        deleted_records: 0,
        error_count: errors.length,
        errors: errors.join('\n')
      });
      
      await loadHistory();
      setPreview([]);
    } catch (err) {
      console.error('Import error:', err);
      setResult({ total: 0, created: 0, updated: 0, errors: ['حدث خطأ أثناء الاستيراد'] });
    }
    
    setImporting(false);
  };

  return (
    <div>
      <PageHeader
        title="استيراد مسار"
        description="استيراد لوائح المتعلمين من ملفات Excel أو CSV"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ملف الاستيراد</h3>
            
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">اختر ملف Excel (.xlsx) أو CSV</p>
              <p className="text-xs text-gray-400 mb-4">الأعمدة المطلوبة: massar_code, first_name, last_name</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="block mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {fileName && (
                <p className="mt-3 text-sm text-gray-700 flex items-center justify-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  {fileName}
                </p>
              )}
            </div>

            {preview.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">معاينة (أول 10 أسطر)</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview[0]).map(key => (
                          <th key={key} className="px-3 py-2 text-right font-medium text-gray-600">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {preview.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-3 py-2 text-gray-700">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Button
              onClick={handleImport}
              loading={importing}
              disabled={!fileName}
              icon={<Upload className="w-4 h-4" />}
            >
              بدء الاستيراد
            </Button>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">نتيجة الاستيراد</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                  <p className="text-xs text-gray-500">إجمالي السجلات</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{result.created}</p>
                  <p className="text-xs text-green-600">سجلات جديدة</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
                  <p className="text-xs text-blue-600">تم تحديثها</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-700">{result.errors.length}</p>
                  <p className="text-xs text-red-600">أخطاء</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-700 mb-1">• {err}</p>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* History */}
        <div>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              سجل الاستيراد
            </h3>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">لا يوجد سجل استيراد</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {history.map(h => (
                  <div key={h.import_id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">{h.file_name}</span>
                      <Badge className={h.error_count > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                        {h.error_count > 0 ? `${h.error_count} أخطاء` : 'نجاح'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(h.import_date).toLocaleDateString('ar-MA')} |
                      جديد: {h.new_records} | محدث: {h.updated_records}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
