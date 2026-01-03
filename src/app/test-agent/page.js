"use client";

import { useState } from 'react';
import { runAgentPipeline } from '@/lib/agentApi';

export default function TestAgentPage() {
    const [task, setTask] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRun = async () => {
        if (!task) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await runAgentPipeline(task);
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-4">Agent Pipeline Test</h1>

            <div className="mb-4">
                <label className="block mb-2 font-medium">Task Description</label>
                <textarea
                    className="w-full p-2 border rounded text-black"
                    rows={3}
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="e.g., Write a python script to parse CSV..."
                />
            </div>

            <button
                onClick={handleRun}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Running Agent...' : 'Run Pipeline'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded border border-red-200">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div className="mt-6 space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <h2 className="font-bold text-green-800">Final Prompt</h2>
                        <pre className="whitespace-pre-wrap mt-2 text-sm text-gray-800">
                            {result.final_prompt}
                        </pre>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                        <h2 className="font-bold text-gray-800 mb-2">Execution Trace</h2>
                        <div className="space-y-2">
                            {(result.execution_trace || []).map((step, idx) => (
                                <div key={idx} className="text-sm">
                                    <span className="font-semibold text-blue-600">[{step.step_name}]</span>{' '}
                                    <span className="text-gray-600">{step.output}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
