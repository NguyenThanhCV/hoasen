import React from "react";
import { Link } from "react-router-dom";
import { fmtDate, fmtMoney } from "../utils/helpers";

export function Page({ title, children, actions }) {
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{title}</h1>
        </div>
        <div>{actions}</div>
      </div>
      {children}
    </>
  );
}

export function Table({ columns, rows = [], onRow }) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            {columns.map(({ key, label }) => (
              <th key={key}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row._id || row.id || index}
              onClick={() => onRow?.(row)}
            >
              {columns.map((column) => (
                <td key={column.key}>
                  {typeof column.render === "function"
                    ? column.render(row)
                    : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="empty">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export const Money = ({ v }) => fmtMoney(v);
export const DateCell = ({ v }) => fmtDate(v);

export function Btn({ children, ...props }) {
  return (
    <button className="btn" {...props}>
      {children}
    </button>
  );
}

export function Danger({ children, ...props }) {
  return (
    <button className="btn danger" {...props}>
      {children}
    </button>
  );
}

export function Edit({ to }) {
  return (
    <Link className="btn small" to={to}>
      Sửa
    </Link>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modalback">
      <div className="modal">
        <div className="modalhead">
          <h2>{title}</h2>
          <button className="x" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
