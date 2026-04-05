export default function Toggle({ checked, onChange, label }) {
  return (
    <div className="sec-tog">
      {label && <span className="sec-tog-lbl">{label}</span>}
      <label className="tgl">
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="tgl-track" />
        <span className="tgl-thumb" />
      </label>
    </div>
  );
}
