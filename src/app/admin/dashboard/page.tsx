'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [records, setRecords] = useState([]);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || !session.user || session.user.role !== 'ADMIN') {
            router.push('/hospital/login'); // or /unauthorized
        } else {
            fetch('/api/admin/records')
                .then(res => res.json())
                .then(data => setRecords(data.records || []));
        }
    }, [session, status]);

    return (
        <div className="p-6 text-white font-mono">
            <h1 className="text-2xl font-bold mb-4">📋 All Patient Records</h1>

            <table className="w-full border-collapse border border-cyan-500">
                <thead>
                    <tr className="bg-cyan-800 text-white">
                        <th className="border p-2">Doctor</th>
                        <th className="border p-2">Patient</th>
                        <th className="border p-2">Diagnosis</th>
                        <th className="border p-2">Summary</th>
                        <th className="border p-2">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record: any) => (
                        <tr key={record.id} className="bg-cyan-950 hover:bg-cyan-900">
                            <td className="border p-2">
                                {record.doctor.name || 'N/A'}<br />
                                <small>{record.doctor.email}</small>
                            </td>
                            <td className="border p-2">
                                {record.patient.name || 'N/A'}<br />
                                <small>{record.patient.email}</small>
                            </td>
                            <td className="border p-2">{record.diagnosis}</td>
                            <td className="border p-2">{record.summary}</td>
                            <td className="border p-2">{new Date(record.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
