import Link from "next/link";
import { ReactNode } from "react";

export interface RecordSummary {
  id: string;
  title: string;
  type: string;
  status?: string;
  risk?: string;
  whyItMatters?: string;
  summary?: string;
  source?: { title?: string; name?: string } | null;
  employee?: { name?: string } | null;
}
const words = (value: string) => value.toLowerCase().replaceAll("_", " ");
export function KnowledgeRecordList({
  items,
  actions,
}: {
  items: RecordSummary[];
  actions?: (item: RecordSummary) => ReactNode;
}) {
  return (
    <div className="record-list">
      <div className="record-grid record-head" aria-hidden="true">
        <span>Knowledge record</span>
        <span>Type</span>
        <span>Status</span>
        <span>Risk</span>
        <span>Evidence</span>
        <span />
      </div>
      {items.map((item) => (
        <article className="record-grid record-row" key={item.id}>
          <div className="record-content">
            <Link href={`/knowledge/${item.id}`} className="record-title">
              {item.title}
            </Link>
            <p>{item.whyItMatters || item.summary}</p>
            {item.employee?.name && <small>{item.employee.name}</small>}
          </div>
          <div className="record-meta" data-label="Type">
            {words(item.type)}
          </div>
          <div className="record-meta record-status" data-label="Status">
            <i
              className={`record-dot status-${(item.status || "UNKNOWN").toLowerCase()}`}
            />
            {item.status ? words(item.status) : "Not recorded"}
          </div>
          <div className="record-meta" data-label="Risk">
            {item.risk ? (
              <>
                <i className={`record-dot signal-${item.risk.toLowerCase()}`} />
                {words(item.risk)}
              </>
            ) : (
              "—"
            )}
          </div>
          <div
            className="record-meta record-evidence"
            data-label="Evidence"
            title={item.source?.title || item.source?.name}
          >
            {item.source?.title || item.source?.name || "No source linked"}
          </div>
          <div className="record-actions">
            {actions ? (
              actions(item)
            ) : (
              <Link
                href={`/knowledge/${item.id}`}
                aria-label={`View ${item.title}`}
              >
                View record →
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
