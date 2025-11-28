'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DoctorDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('home');
    const [log, setLog] = useState<any[]>([]);

    type PatientRecord = {
        id: string;
        name: string;
        age: number;
        gender: string;
        weight: number;
        createdAt: string;
        deleted?: boolean;
    };

    const [records, setRecords] = useState<PatientRecord[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
    const [diagnosis, setDiagnosis] = useState('');
    const [generatedSummary, setGeneratedSummary] = useState('');
    const [generating, setGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || session?.user?.role !== 'DOCTOR') {
            router.push('/hospital/login');
        }
    }, [session, status, router]);

    useEffect(() => {
        if (activeTab === 'records') fetchRecords();

        if (activeTab === 'reportgen') {
            const patientData = localStorage.getItem('selectedPatient');
            const parsed = patientData ? JSON.parse(patientData) : null;

            if (parsed) {
                // validate against current records (non-deleted ones only)
                fetch('/api/patient-record')
                    .then((res) => res.json())
                    .then((records) => {
                        const stillExists = records.find((r: any) => r.id === parsed.id);
                        if (stillExists) {
                            setSelectedPatient(parsed);
                        } else {
                            localStorage.removeItem('selectedPatient');
                            setSelectedPatient(null);
                        }
                    });
            } else {
                setSelectedPatient(null);
            }
        }
    }, [activeTab]);

    const fetchRecords = async () => {
        try {
            const res = await fetch('/api/patient-record');
            if (!res.ok) throw new Error('Network response not ok');

            const data = await res.json();
            setRecords(data);
        } catch (error) {
            console.error('Error fetching records:', error);
            setRecords([]); // Or show error state
        }
    };

    const handleAddRecord = async (e: any) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const res = await fetch('/api/patient-record', {
            method: 'POST',
            body: JSON.stringify({
                name: form.get('name'),
                age: form.get('age'),
                gender: form.get('gender'),
                weight: form.get('weight'),
            }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            e.target.reset();
            fetchRecords();
        }
    };

    const deleteRecord = async (id: string) => {
        const confirmDelete = confirm("⚠️ This record will be permanently deleted from your view. MedZora will retain a secure backup.");
        if (!confirmDelete) return;
        await fetch(`/api/patient-record/${id}`, { method: 'DELETE' });
        fetchRecords();
    };

    const downloadSummary = (summary: string, patientName: string) => {
        const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${patientName.replace(/\s+/g, '_')}_summary.txt`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const shareSummary = async (summary: string, patientName: string) => {
        const shareText = `Discharge Summary for ${patientName}:\n\n${summary}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Discharge Summary: ${patientName}`,
                    text: shareText,
                });
            } catch (err) {
                alert('Sharing failed: ' + err);
            }
        } else {
            alert('Sharing not supported on this device.');
        }
    };

    const menuItems = [
        { id: 'home', label: 'MedZora Gamma 0.1' },
        { id: 'records', label: "Patient's Records" },
        { id: 'diagnostic', label: 'AI Diagnostic Assistant' },
        { id: 'reportgen', label: 'Report Generator' },
        { id: 'speciality', label: 'Speciality-specific Assistance' },
        { id: 'guideline', label: 'Medical Guidelines Lookup' },
        { id: 'referral', label: 'Referral Letter Generator' },
        { id: 'log', label: 'Doctor’s Log (History)' },
    ];

    const filteredLog = log.filter((entry) => {
        const patientName = entry.patient?.name?.toLowerCase() || '';
        const summary = entry.summary?.toLowerCase() || '';
        const date = new Date(entry.createdAt).toLocaleString().toLowerCase();
        const term = searchTerm.toLowerCase();
        return patientName.includes(term) || summary.includes(term) || date.includes(term);
    });

    return (
        <div className="flex h-screen bg-[#0d0d0d] text-white font-mono text-[17px] md:text-[18px]">
            <div className="w-64 bg-[#111] border-r border-gray-800 p-4">
                <div className="text-xl font-bold mb-6 text-green-400">MedZora</div>
                <ul className="space-y-6">
                    {menuItems.map((item) => (
                        <li
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`cursor-pointer hover:text-green-400 transition ${activeTab === item.id ? 'text-green-400' : ''}`}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex-1 p-10 overflow-y-auto">
                {activeTab === 'home' && (
                    <div className="text-center mt-40">
                        <h1 className="text-4xl font-bold text-green-400 mb-4">MedZora Gamma 0.1</h1>
                        <p className="text-gray-400">Powered by Manu AI | Select a tool from the left panel to get started.</p>
                    </div>
                )}

                {activeTab === 'records' && (
                    <div>
                        <h2 className="text-2xl font-semibold text-green-300 mb-4">Patient's Records</h2>
                        <form onSubmit={handleAddRecord} className="space-y-4 max-w-md bg-[#1a1a1a] p-6 rounded-lg border border-gray-700">
                            <input required placeholder="Name" name="name" className="input" />
                            <input required placeholder="Age" name="age" type="number" className="input" />
                            <input required placeholder="Gender" name="gender" className="input" />
                            <input required placeholder="Weight (kg)" name="weight" type="number" className="input" />
                            <button type="submit" className="btn">Add Patient</button>
                        </form>
                        <div className="mt-8">
                            <h3 className="text-lg text-gray-300 mb-2">All Records</h3>
                            {records.filter(r => !r.deleted).map((rec) => (
                                <div key={rec.id} className="border p-4 mb-2 rounded bg-[#111]">
                                    <p><b>Name:</b> {rec.name}</p>
                                    <p><b>Age:</b> {rec.age} | <b>Gender:</b> {rec.gender} | <b>Weight:</b> {rec.weight} kg</p>
                                    <p><b>Date:</b> {new Date(rec.createdAt).toLocaleString()}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <button
                                            className="text-green-400 underline"
                                            onClick={() => {
                                                localStorage.setItem('selectedPatient', JSON.stringify(rec));
                                                setActiveTab('reportgen');
                                            }}
                                        >
                                            Generate Report
                                        </button>
                                        <button
                                            className="text-red-500 underline hover:text-red-600"
                                            onClick={() => deleteRecord(rec.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'reportgen' && (
                    <div>
                        <h2 className="text-2xl font-semibold text-green-300 mb-4">Report Generator</h2>
                        {selectedPatient ? (
                            <div className="space-y-4 bg-[#1a1a1a] p-6 rounded-lg border border-gray-700">
                                <div>
                                    <p><b>Name:</b> {selectedPatient.name}</p>
                                    <p><b>Age:</b> {selectedPatient.age} | <b>Gender:</b> {selectedPatient.gender} | <b>Weight:</b> {selectedPatient.weight} kg</p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-gray-300">Enter Diagnosis / Notes</label>
                                    <textarea
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        rows={4}
                                        className="w-full p-2 bg-black border border-green-400 rounded text-white"
                                        placeholder="e.g., Patient diagnosed with pneumonia. Prescribed antibiotics..."
                                    />
                                </div>
                                <button
                                    disabled={generating || !diagnosis}
                                    onClick={async () => {
                                        setGenerating(true);
                                        setGeneratedSummary('');
                                        const res = await fetch('/api/generate-discharge-summary', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ patient: selectedPatient, diagnosis }),
                                        });
                                        const data = await res.json();
                                        setGeneratedSummary(data.summary || 'Failed to generate.');
                                        setGenerating(false);
                                    }}
                                    className="btn"
                                >
                                    {generating ? 'Generating...' : 'Generate Summary'}
                                </button>
                                {generatedSummary && (
                                    <div>
                                        <label className="block mb-1 text-gray-300 mt-4">Generated Discharge Summary</label>
                                        <textarea
                                            readOnly
                                            value={generatedSummary}
                                            className="w-full p-2 bg-[#111] border border-gray-600 rounded text-green-200"
                                            rows={6}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-red-400">⚠️ No patient selected. Please select one from the records tab.</p>
                        )}
                    </div>
                )}

                {activeTab === 'diagnostic' && (
                    <div>
                        <h2 className="text-2xl font-semibold text-green-300 mb-4">AI Diagnostic Assistant</h2>
                        <textarea
                            rows={4}
                            placeholder="Enter patient symptoms here..."
                            className="w-full p-3 rounded bg-[#1a1a1a] text-white border border-green-500 mb-4"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                        />
                        <button
                            className="btn"
                            onClick={async () => {
                                setGenerating(true);
                                setGeneratedSummary('');
                                const res = await fetch('/api/diagnostic', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ symptoms: diagnosis }),
                                });
                                const data = await res.json();
                                setGeneratedSummary(data.result || 'Unable to process.');
                                setGenerating(false);
                            }}
                            disabled={generating || !diagnosis}
                        >
                            {generating ? 'Analyzing...' : 'Get AI Diagnosis'}
                        </button>
                        {generatedSummary && (
                            <div className="mt-4 p-4 bg-[#111] border border-gray-700 rounded text-green-300 whitespace-pre-wrap">
                                {generatedSummary}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'speciality' && (
                    <div>
                        <h2 className="text-2xl font-semibold text-green-300 mb-6">Speciality-specific Tools</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Cardiology', emoji: '🫀' },
                                { label: 'Neurology', emoji: '🧠' },
                                { label: 'Paediatrics', emoji: '👶' },
                                { label: 'Ophthalmology', emoji: '👁️' },
                                { label: 'Oncology', emoji: '🧬' },
                                { label: 'General Medicine', emoji: '🩺' },
                                { label: 'Orthopaedics', emoji: '🦴' },
                                { label: 'Pulmonology', emoji: '🫁' },
                                { label: 'Pathology', emoji: '🧪' },
                                { label: 'Psychiatry', emoji: '⚕️' },
                                { label: 'Hematology', emoji: '🩸' },
                                { label: 'Emergency Medicine', emoji: '🚑' },
                                { label: 'Endocrinology', emoji: '🧠' },
                                { label: 'Nephrology', emoji: '🧫' },
                                { label: 'Gastroenterology', emoji: '🦠' },
                                { label: 'Dermatology', emoji: '🧴' },
                                { label: 'ENT', emoji: '👂' },
                                { label: 'Urology', emoji: '💧' },
                                { label: 'Rheumatology', emoji: '🦵' },
                                { label: 'Infectious Diseases', emoji: '🦠' },
                                { label: 'Obstetrics & Gynaecology', emoji: '🤰' },
                                { label: 'Radiology', emoji: '🩻' },
                                { label: 'Anesthesiology', emoji: '💤' },
                                { label: 'Surgery', emoji: '🔪' },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => alert(`🚧 ${item.label} tools coming soon.`)}
                                    className="border border-gray-600 hover:border-green-400 hover:text-green-300 transition p-6 rounded-lg bg-[#111] text-center text-white font-medium shadow-md"
                                >
                                    <div className="text-3xl mb-2">{item.emoji}</div>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}


                {activeTab === 'guideline' && (
                    <div>
                        <h2 className="text-2xl font-semibold text-green-300 mb-4">Guideline Lookup</h2>
                        <p className="text-gray-300">📚 WHO/CDC/AIIMS Guidelines — coming soon.</p>
                    </div>
                )}

                {activeTab === 'referral' && (
                    <div>
                        <h2 className="text-2xl font-semibold text-green-300 mb-4">Referral Generator</h2>
                        <p className="text-gray-300">📤 Generate formal referrals — coming soon.</p>
                    </div>
                )}

                {activeTab === 'log' && (
                    <div>
                        <h2 className="text-2xl font-semibold text-green-300 mb-4">Doctor’s Log</h2>
                        <div className="space-y-4">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="🔍 Search patient, summary or date..."
                                    className="input w-full"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button
                                    onClick={async () => {
                                        const res = await fetch('/api/discharge-history');
                                        const data = await res.json();
                                        setLog(data);
                                    }}
                                    className="btn whitespace-nowrap"
                                >
                                    🔄 Load History
                                </button>
                            </div>
                            {filteredLog.length > 0 ? (
                                filteredLog.map((entry: any) => (
                                    <div key={entry._id} className="border border-gray-600 p-4 rounded bg-[#111]">
                                        <p className="text-green-400"><b>Patient:</b> {entry.patient?.name}</p>
                                        <p className="text-sm text-gray-400 mb-2">
                                            <b>Date:</b> {new Date(entry.createdAt).toLocaleString()}
                                        </p>
                                        <textarea
                                            readOnly
                                            value={entry.summary}
                                            className="w-full p-2 bg-[#1a1a1a] border border-gray-700 rounded text-white mb-2"
                                            rows={6}
                                        />
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => downloadSummary(entry.summary, entry.patient?.name || 'Patient')}
                                                className="px-4 py-1 bg-green-800 text-white rounded hover:bg-green-700 transition"
                                            >
                                                📥 Download
                                            </button>
                                            <button
                                                onClick={() => shareSummary(entry.summary, entry.patient?.name || 'Patient')}
                                                className="px-4 py-1 bg-blue-700 text-white rounded hover:bg-blue-600 transition"
                                            >
                                                📤 Share
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No matching reports.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}