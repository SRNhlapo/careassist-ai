import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuditLogs() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => setRows(data ?? []))
  }, [])

  return (
    <div className='p-6 overflow-x-auto'>
      <h1 className='text-2xl font-semibold text-teal-700 mb-3'>Audit logs</h1>
      <table className='w-full text-sm text-left'>
        <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th><th>Outcome</th></tr></thead>
        <tbody>{rows.map(r => (
          <tr key={r.id} className='border-t'>
            <td>{new Date(r.created_at).toLocaleString()}</td><td>{r.user_id?.slice(0, 8)}</td>
            <td>{r.action}</td><td>{r.resource_type} {r.resource_id?.slice(0, 8)}</td><td>{r.outcome}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}