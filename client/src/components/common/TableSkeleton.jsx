export default function TableSkeleton({ rows = 6, columns = 5 }) {
  return (
    <div className="table-wrap">
      <table>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((__, c) => (
                <td key={c} style={{ padding: '14px 16px' }}>
                  <div className="skeleton" style={{ height: 14, width: c === 0 ? '80%' : '60%', borderRadius: 6 }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
