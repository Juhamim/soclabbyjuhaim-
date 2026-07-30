import React, { useState } from 'react';
import { FileText, Download, RefreshCw } from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState('executive');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReport = async (type) => {
    setLoading(true);
    setReportType(type);
    try {
      const res = await fetch(`/api/reports/generate?type=${type}`);
      const data = await res.json();
      setMarkdown(data.markdown);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Executive & Technical Forensic Reports
          </h2>
          <p className="text-xs text-slate-500">Synthesize security metrics, threat audit trails, and MITRE mapping into exportable reports</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => fetchReport('executive')}
            className={`btn ${reportType === 'executive' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Executive Summary
          </button>
          <button
            onClick={() => fetchReport('forensic')}
            className={`btn ${reportType === 'forensic' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Technical Forensic Report
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Report Preview ({reportType})</h3>
          <button
            onClick={() => {
              const blob = new Blob([markdown], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `SOCLab_Report_${reportType}.md`;
              a.click();
            }}
            disabled={!markdown}
            className="btn btn-success text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Markdown File</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 flex justify-center items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Generating report metrics from SQLite database...</span>
          </div>
        ) : (
          <pre className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap overflow-x-auto leading-relaxed">
            {markdown || "Click 'Executive Summary' or 'Technical Forensic Report' above to generate."}
          </pre>
        )}
      </div>
    </div>
  );
}
