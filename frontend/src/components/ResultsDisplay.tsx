import { useEffect, useMemo, useState } from 'react';
import { SummaryResponse, ActionItem } from '../App';

interface ResultsDisplayProps {
  result: SummaryResponse;
  onReset: () => void;
  onResultUpdate?: (updated: SummaryResponse) => void;
}

function ResultsDisplay({ result, onReset, onResultUpdate }: ResultsDisplayProps) {
  const { summary_data, duration_transcribe_s, duration_summarize_s, id, transcript } = result;
  const [items, setItems] = useState<ActionItem[]>([]);
  // Saving indicator can be added in future if needed
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<ActionItem | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  // Debug logging
  console.log('ResultsDisplay - summary_data:', summary_data);
  console.log('ResultsDisplay - summary:', summary_data?.summary);
  console.log('ResultsDisplay - key_decisions:', summary_data?.key_decisions);
  console.log('ResultsDisplay - action_items:', summary_data?.action_items);

  useEffect(() => {
    // Initialize with order and defaults
    const withOrder = (summary_data.action_items || []).map((it, idx) => ({
      completed: false,
      order: idx,
      ...it,
    }));
    setItems(withOrder);
    setEditingIndex(null);
    setEditDraft(null);
  }, [summary_data.action_items]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [items]
  );

  const saveItems = async (newItems: ActionItem[]) => {
  // saving indicator
    try {
      const response = await fetch(`http://localhost:8000/history/${id}/action-items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_items: newItems }),
      });
      if (!response.ok) throw new Error('Failed to save changes');
      const updated: SummaryResponse = await response.json();
      setItems(updated.summary_data.action_items || []);
      onResultUpdate?.(updated);
    } catch (e) {
      console.error(e);
      alert('Failed to save changes');
    } finally {
      // done
    }
  };

  const toggleComplete = (index: number) => {
    const updated = [...sortedItems];
    updated[index] = { ...updated[index], completed: !updated[index].completed };
    // Merge back into items by id/order
    const remerged = updated.map((it, i) => ({ ...it, order: i }));
    setItems(remerged);
    saveItems(remerged);
  };

  const beginEdit = (index: number) => {
    setEditingIndex(index);
    setEditDraft({ ...sortedItems[index] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditDraft(null);
  };

  const commitEdit = (index: number) => {
    if (!editDraft) return;
    const updated = [...sortedItems];
    updated[index] = { ...updated[index], ...editDraft };
    const remerged = updated.map((it, i) => ({ ...it, order: i }));
    setItems(remerged);
    setEditingIndex(null);
    setEditDraft(null);
    saveItems(remerged);
  };

  const deleteItem = (index: number) => {
    const updated = [...sortedItems];
    updated.splice(index, 1);
    const remerged = updated.map((it, i) => ({ ...it, order: i }));
    setItems(remerged);
    saveItems(remerged);
  };

  const addNewTask = () => {
    const nextOrder = sortedItems.length;
    const newItem: ActionItem = {
      description: '',
      owner: null,
      due_date: null,
      completed: false,
      order: nextOrder,
    };
    const updated = [...sortedItems, newItem];
    setItems(updated);
    setEditingIndex(updated.length - 1);
    setEditDraft({ ...newItem });
  };

  // Drag and drop handlers
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const onDragStart = (index: number) => setDragIndex(index);
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...sortedItems];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    const remerged = updated.map((it, i) => ({ ...it, order: i }));
    setItems(remerged);
    saveItems(remerged);
    setDragIndex(null);
  };

  const copySummaryToClipboard = async () => {
    const text = buildExportText();
    await navigator.clipboard.writeText(text);
    alert('Summary copied to clipboard');
  };

  const buildExportText = () => {
    const lines: string[] = [];
    lines.push('Summary');
    lines.push(summary_data.summary);
    lines.push('');
    if (summary_data.key_decisions.length) {
      lines.push('Key Decisions');
      summary_data.key_decisions.forEach((d, i) => lines.push(`${i + 1}. ${d}`));
      lines.push('');
    }
    if (sortedItems.length) {
      lines.push('Action Items');
      sortedItems.forEach((it, i) => {
        const parts = [`${i + 1}. ${it.description}`];
        if (it.owner) parts.push(`Owner: ${it.owner}`);
        if (it.due_date) parts.push(`Due: ${it.due_date}`);
        parts.push(`Completed: ${it.completed ? 'Yes' : 'No'}`);
        lines.push(parts.join(' | '));
      });
    }
    return lines.join('\n');
  };

  const exportCSV = () => {
    const rows: string[][] = [];
    rows.push(['Section', 'Content']);
    rows.push(['Summary', summary_data.summary.replace(/\n/g, ' ')]);
    summary_data.key_decisions.forEach((d, i) => rows.push([`Key Decision ${i + 1}`, d]));
    sortedItems.forEach((it, i) => rows.push([
      `Action Item ${i + 1}`,
      `${it.description} | Owner:${it.owner ?? ''} | Due:${it.due_date ?? ''} | Completed:${it.completed ? 'Yes' : 'No'}`
    ]));
  const esc = (s: string) => '"' + (s ? s.split('"').join('""') : '') + '"';
  const csv = rows.map(r => r.map(v => esc(v ?? '')).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.filename.replace(/\.[^/.]+$/, '')}_summary.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportWord = () => {
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Summary</title></head><body>
      <h1>Meeting Summary</h1>
      <h2>Summary</h2>
  <p>${summary_data.summary.split('\n').join('<br/>')}</p>
      ${summary_data.key_decisions.length ? `<h2>Key Decisions</h2><ul>${summary_data.key_decisions.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
      ${sortedItems.length ? `<h2>Action Items</h2><ul>${sortedItems.map(it => `<li>${it.description} ${it.owner ? `(Owner: ${it.owner})` : ''} ${it.due_date ? `(Due: ${it.due_date})` : ''} ${it.completed ? '(Completed)' : ''}</li>`).join('')}</ul>` : ''}
    </body></html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.filename.replace(/\.[^/.]+$/, '')}_summary.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Summary PDF</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1 { margin-bottom: 8px; }
        h2 { margin-top: 16px; }
      </style>
  </head><body>${buildExportText().split('\n').join('<br/>')}</body></html>`;
    w.document.write(content);
    w.document.close();
    w.focus();
    w.print();
    // w.close(); // leave it for user control
  };

  return (
    <div className="space-y-5">
      {/* Header with timing info */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">📊 Meeting Analysis</h2>
        <div className="text-xs text-slate-400 backdrop-blur-md bg-slate-800/30 px-2.5 py-1.5 rounded-lg border border-slate-700/30">
          <span className="mr-3">
            ⏱️ {duration_transcribe_s.toFixed(1)}s
          </span>
          <span>
            🤖 {duration_summarize_s.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Export & Share */}
      <div className="flex flex-wrap gap-2 justify-end">
        <button onClick={copySummaryToClipboard} className="px-2.5 py-1.5 text-xs rounded-lg backdrop-blur-md bg-slate-800/30 hover:bg-slate-700/40 border border-slate-700/30 text-slate-300 transition-all hover:shadow-md">📋 Copy</button>
        <button onClick={exportCSV} className="px-2.5 py-1.5 text-xs rounded-lg backdrop-blur-md bg-slate-800/30 hover:bg-slate-700/40 border border-slate-700/30 text-slate-300 transition-all hover:shadow-md">🧾 CSV</button>
        <button onClick={exportWord} className="px-2.5 py-1.5 text-xs rounded-lg backdrop-blur-md bg-slate-800/30 hover:bg-slate-700/40 border border-slate-700/30 text-slate-300 transition-all hover:shadow-md">📝 Word</button>
        <button onClick={exportPDF} className="px-2.5 py-1.5 text-xs rounded-lg backdrop-blur-md bg-slate-800/30 hover:bg-slate-700/40 border border-slate-700/30 text-slate-300 transition-all hover:shadow-md">🖨️ PDF</button>
      </div>

      {/* Transcript Section */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/30 to-slate-800/20 rounded-xl p-5 border border-slate-600/30 shadow-xl">
        <button 
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full flex items-center justify-between font-bold text-base text-slate-100 hover:text-cyan-400 transition-colors"
        >
          <span className="flex items-center">
            <span className="mr-2 text-xl">🎤</span>
            Full Transcript
          </span>
          <span className="text-cyan-400 text-sm">
            {showTranscript ? '▼ Hide' : '▶ Show'}
          </span>
        </button>
        
        {showTranscript && (
          <div className="mt-4 backdrop-blur-md bg-slate-800/20 rounded-lg p-4 border border-slate-700/30 max-h-96 overflow-y-auto">
            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
              {transcript}
            </p>
          </div>
        )}
      </div>

      {/* Meeting Summary and Key Decisions - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Meeting Summary Section */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/15 rounded-xl p-5 border border-slate-600/30 shadow-xl">
          <h3 className="font-bold text-base text-slate-100 mb-3 flex items-center">
            <span className="mr-2 text-xl">📝</span>
            Meeting Summary
          </h3>
          <div className="backdrop-blur-md bg-slate-800/20 rounded-lg p-4 border border-slate-700/30">
            <p className="text-slate-200 leading-relaxed text-sm">
              {summary_data.summary}
            </p>
          </div>
        </div>

        {/* Key Decisions Section */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-900/20 to-teal-900/15 rounded-xl p-5 border border-slate-600/30 shadow-xl">
          <h3 className="font-bold text-base text-slate-100 mb-3 flex items-center">
            <span className="mr-2 text-xl">✅</span>
            Key Decisions
          </h3>
          <div className="backdrop-blur-md bg-slate-800/20 rounded-lg p-4 border border-slate-700/30">
            {summary_data.key_decisions.length > 0 ? (
              <ul className="space-y-2.5">
                {summary_data.key_decisions.map((decision, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-emerald-400 mr-2 mt-0.5 text-sm">✅</span>
                    <span className="text-slate-200 leading-relaxed flex-1 text-sm">{decision}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 text-sm italic">No key decisions identified in this meeting.</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Items Section */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/30 to-slate-700/20 rounded-xl p-5 border border-slate-600/30 shadow-xl">
          <h3 className="font-bold text-base text-slate-100 mb-3 flex items-center">
            <span className="mr-2 text-xl">🎯</span>
            Action Items
          </h3>
          <div className="backdrop-blur-md bg-slate-800/20 rounded-lg p-4 border border-slate-700/30">
            <div className="space-y-2">
              {sortedItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-slate-700/30 rounded-lg px-2.5 py-2 flex items-start gap-2.5 group backdrop-blur-sm bg-slate-800/20 hover:bg-slate-700/30 transition-all"
                  draggable
                  onDragStart={() => onDragStart(index)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(index)}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={!!item.completed}
                    onChange={() => toggleComplete(index)}
                    className="mt-0.5 h-3.5 w-3.5"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {editingIndex === index ? (
                      <div className="space-y-1.5">
                        <input
                          autoFocus
                          value={editDraft?.description ?? ''}
                          onChange={(e) => setEditDraft({ ...(editDraft as ActionItem), description: e.target.value })}
                          placeholder="Task description"
                          className="w-full border border-slate-600/40 rounded px-2 py-1 text-sm bg-slate-800/30 text-slate-200 placeholder-slate-500 backdrop-blur-sm"
                        />
                        <div className="flex gap-1.5">
                          <input
                            value={editDraft?.owner ?? ''}
                            onChange={(e) => setEditDraft({ ...(editDraft as ActionItem), owner: e.target.value || null })}
                            placeholder="Owner"
                            className="flex-1 border border-slate-600/40 rounded px-2 py-1 text-xs bg-slate-800/30 text-slate-200 placeholder-slate-500 backdrop-blur-sm"
                          />
                          <input
                            value={editDraft?.due_date ?? ''}
                            onChange={(e) => setEditDraft({ ...(editDraft as ActionItem), due_date: e.target.value || null })}
                            placeholder="Due date"
                            className="w-32 border border-slate-600/40 rounded px-2 py-1 text-xs bg-slate-800/30 text-slate-200 placeholder-slate-500 backdrop-blur-sm"
                          />
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => commitEdit(index)} className="px-2.5 py-1 rounded bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs hover:shadow-md">Save</button>
                          <button onClick={cancelEdit} className="px-2.5 py-1 rounded bg-slate-700/40 text-slate-300 text-xs hover:bg-slate-700/60">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className={`text-slate-200 font-medium text-sm ${item.completed ? 'line-through text-slate-500' : ''}`}>{item.description || 'Untitled task'}</p>
                        <div className="flex flex-wrap gap-2 text-xs mt-1">
                          {item.owner && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-blue-900/30 text-blue-300 backdrop-blur-sm border border-blue-800/30">
                              <span className="mr-1 text-[10px]">👤</span>
                              <span className="text-[10px]">{item.owner}</span>
                            </span>
                          )}
                          {item.due_date && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-cyan-900/30 text-cyan-300 backdrop-blur-sm border border-cyan-800/30">
                              <span className="mr-1 text-[10px]">📅</span>
                              <span className="text-[10px]">{item.due_date}</span>
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    {editingIndex === index ? null : (
                      <button onClick={() => beginEdit(index)} className="text-slate-400 hover:text-slate-200" title="Edit">✏️</button>
                    )}
                    <button onClick={() => deleteItem(index)} className="text-red-400 hover:text-red-300" title="Delete">🗑️</button>
                    <span className="cursor-grab text-slate-400 text-[10px]" title="Drag to reorder">↕️</span>
                  </div>
                </div>
              ))}

              {/* Add New Task */}
              <div>
                <button onClick={addNewTask} className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-medium shadow-md hover:shadow-blue-900/30 transition-all">
                  ➕ Add New Task
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Action Button */}
      <button
        onClick={onReset}
        className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-900/40 transform hover:-translate-y-0.5"
      >
        ↻ Summarize Another Meeting
      </button>
    </div>
  );
}

export default ResultsDisplay;
