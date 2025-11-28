'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PatientRecord {
    id: string;
    doctor?: { name?: string; email?: string };
    patient?: { name?: string; email?: string };
    summary?: string;
    diagnosis?: string;
    createdAt?: string;
}

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [records, setRecords] = useState<PatientRecord[]>([]);

    useEffect(() => {
        if (status === 'loading') return;

        console.log('👤 Session at admin dashboard:', session);

        // Redirect if no session or not admin
        if (!session?.user?.role) {
            console.log('🚫 No session or role — redirecting');
            router.push('/hospital/dashboard');
            return;
        }

        if (session.user.role !== 'ADMIN') {
            console.log('⛔ Not an admin — redirecting');
            router.push('/hospital/dashboard');
            return;
        }

        const fetchRecords = async () => {
            try {
                const res = await fetch('/api/admin/records');
                const data = await res.json();

                console.log('✅ Records fetched:', data.records);
                setRecords(data.records || []);
            } catch (err) {
                console.error('❌ Error fetching records:', err);
            }
        };

        fetchRecords();
    }, [session, status, router]);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-green-400">
                MedZora Admin Dashboard
            </h1>
            <div className="overflow-auto rounded-lg border border-gray-600">
                <table className="min-w-full bg-black text-white">
                    <thead className="bg-gray-800 text-green-300">
                        <tr>
                            <th className="py-2 px-4 text-left">Doctor</th>
                            <th className="py-2 px-4 text-left">Patient</th>
                            <th className="py-2 px-4 text-left">Diagnosis</th>
                            <th className="py-2 px-4 text-left">Summary</th>
                            <th className="py-2 px-4 text-left">Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <tr key={record.id} className="border-t border-gray-700">
                                <td className="py-2 px-4">
                                    {record?.doctor?.name ||
                                        record?.doctor?.email ||
                                        'Unknown Doctor'}
                                </td>
                                <td className="py-2 px-4">
                                    {record?.patient?.name ||
                                        record?.patient?.email ||
                                        'Unknown Patient'}
                                </td>
                                <td className="py-2 px-4">
                                    <span className="px-2 py-1 bg-blue-700 rounded">
                                        {record?.diagnosis || 'N/A'}
                                    </span>
                                </td>
                                <td className="py-2 px-4">
                                    {record?.summary
                                        ? record.summary.length > 60
                                            ? record.summary.slice(0, 60) + '...'
                                            : record.summary
                                        : 'No summary'}
                                </td>
                                <td className="py-2 px-4">
                                    {record?.createdAt
                                        ? new Date(record.createdAt).toLocaleString()
                                        : 'Unknown'}
                                </td>
                            </tr>
                        ))}
                        {records.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-6 text-gray-500">
                                    No patient records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
