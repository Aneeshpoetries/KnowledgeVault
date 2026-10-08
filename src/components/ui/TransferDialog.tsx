'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, FileText, Network, ShieldAlert, Users, X } from '@/components/ui/icons';
import { useRouter } from 'next/navigation';
import { Modal } from './Modal';

const examples = [
  { icon: Users, title: 'Preserve a handover', text: 'Preserve the systems and operational context only this person currently maintains.' },
  { icon: Network, title: 'Map a critical system', text: 'Map the dependencies, failure behaviors, and recovery steps for a critical system.' },
  { icon: ShieldAlert, title: 'Investigate a gap', text: 'Investigate undocumented payment retry behavior and preserve the recovery procedure.' },
  { icon: FileText, title: 'Capture the unwritten', text: 'Capture the decisions, edge cases, and lessons missing from the existing runbooks.' },
];

export function TransferDialog({ employees }: { employees: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const router = useRouter();
  useEffect(() => {
    const focus = new URLSearchParams(window.location.search).get('focus');
    if (focus) { setIntent(focus.slice(0, 1200)); setOpen(true); }
  }, []);
  return <><button type="button" onClick={() => setOpen(true)} className="btn-primary"><Users size={15} />Start knowledge transfer</button><Modal open={open} onClose={() => setOpen(false)} label="Start knowledge transfer" className="vault-transfer-dialog"><button type="button" className="vault-dialog-close" aria-label="Close knowledge transfer" onClick={() => setOpen(false)}><X size={19} /></button><div className="vault-transfer-intro"><span className="vault-transfer-symbol"><Network size={23} /></span><h2>What knowledge should we preserve?</h2><p>Start with what matters. We’ll guide a focused conversation.</p></div><form onSubmit={event => {
    event.preventDefault();
    if (!intent.trim() || !(employeeId || employees[0]?.id)) return;
    const id = employeeId || employees[0].id;
    setOpen(false);
    router.push(`/exit-mode/${encodeURIComponent(id)}?focus=${encodeURIComponent(intent.trim())}`);
  }}><label htmlFor="transfer-intent" className="sr-only">Knowledge to preserve</label><textarea id="transfer-intent" autoFocus required maxLength={1200} value={intent} onChange={event => setIntent(event.target.value)} placeholder="I want to preserve the payment recovery steps that only one person knows…" rows={3} /><div className="vault-transfer-actions"><label className="sr-only" htmlFor="transfer-owner">Interview participant</label><select id="transfer-owner" value={employeeId || employees[0]?.id || ''} onChange={event => setEmployeeId(event.target.value)} required>{employees.length ? employees.map(employee => <option value={employee.id} key={employee.id}>{employee.name}</option>) : <option value="">No participants available</option>}</select><button type="submit" disabled={!intent.trim() || !employees.length} className="btn-primary">Continue <ArrowRight size={15} /></button></div></form><p className="vault-transfer-examples-label">Start from an example</p><div className="vault-transfer-examples">{examples.map(({ icon: Icon, title, text }) => <button type="button" key={title} onClick={() => setIntent(text)}><span><Icon size={21} /></span><div><strong>{title}</strong><p>{text}</p></div></button>)}</div></Modal></>;
}
