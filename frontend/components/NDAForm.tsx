"use client";

import { NDAFormData } from "@/lib/nda-template";

type ApiStatus = "checking" | "connected" | "disconnected";

interface NDAFormProps {
  data: NDAFormData;
  onChange: (data: NDAFormData) => void;
  apiStatus: ApiStatus;
}

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const numberCls =
  "w-16 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40";

const statusConfig = {
  checking:     { dot: "bg-yellow-400", label: "Connecting to API..." },
  connected:    { dot: "bg-green-500",  label: "API connected" },
  disconnected: { dot: "bg-red-400",    label: "API offline" },
};

export default function NDAForm({ data, onChange, apiStatus }: NDAFormProps) {
  const set = <K extends keyof NDAFormData>(key: K, value: NDAFormData[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Mutual NDA Creator</h1>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${statusConfig[apiStatus].dot}`} />
            {statusConfig[apiStatus].label}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Fill in the details — the document updates live on the right.
        </p>
      </div>

      <div className="space-y-8">
        {/* Purpose */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-1">Purpose</h2>
          <p className="text-xs text-gray-500 mb-2">How Confidential Information may be used</p>
          <textarea
            className={inputCls}
            rows={3}
            value={data.purpose}
            onChange={(e) => set("purpose", e.target.value)}
            placeholder="e.g. Evaluating whether to enter into a business relationship..."
          />
        </section>

        {/* Effective Date */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-1">Effective Date</h2>
          <input
            type="date"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.effectiveDate}
            onChange={(e) => set("effectiveDate", e.target.value)}
          />
        </section>

        {/* MNDA Term */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-1">MNDA Term</h2>
          <p className="text-xs text-gray-500 mb-3">The length of this MNDA</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mndaTerm"
                checked={data.mndaTermType === "expires"}
                onChange={() => set("mndaTermType", "expires")}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">Expires after</span>
              <input
                type="number"
                min={1}
                className={numberCls}
                value={data.mndaTermYears}
                disabled={data.mndaTermType !== "expires"}
                onChange={(e) => set("mndaTermYears", Number(e.target.value))}
              />
              <span className="text-sm text-gray-700">year(s) from Effective Date</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mndaTerm"
                checked={data.mndaTermType === "until_terminated"}
                onChange={() => set("mndaTermType", "until_terminated")}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">Continues until terminated</span>
            </label>
          </div>
        </section>

        {/* Term of Confidentiality */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-1">Term of Confidentiality</h2>
          <p className="text-xs text-gray-500 mb-3">How long Confidential Information is protected</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="confidentialityTerm"
                checked={data.confidentialityTermType === "years"}
                onChange={() => set("confidentialityTermType", "years")}
                className="accent-blue-600"
              />
              <input
                type="number"
                min={1}
                className={numberCls}
                value={data.confidentialityTermYears}
                disabled={data.confidentialityTermType !== "years"}
                onChange={(e) => set("confidentialityTermYears", Number(e.target.value))}
              />
              <span className="text-sm text-gray-700">year(s) from Effective Date (trade secrets protected until no longer a trade secret)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="confidentialityTerm"
                checked={data.confidentialityTermType === "perpetuity"}
                onChange={() => set("confidentialityTermType", "perpetuity")}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">In perpetuity</span>
            </label>
          </div>
        </section>

        {/* Governing Law & Jurisdiction */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Governing Law & Jurisdiction</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Governing Law (State)</label>
              <input
                type="text"
                className={inputCls}
                value={data.governingLaw}
                onChange={(e) => set("governingLaw", e.target.value)}
                placeholder="e.g. Delaware"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
              <input
                type="text"
                className={inputCls}
                value={data.jurisdiction}
                onChange={(e) => set("jurisdiction", e.target.value)}
                placeholder="e.g. courts located in New Castle, DE"
              />
            </div>
          </div>
        </section>

        {/* Parties */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Parties</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Party 1 */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-600 text-xs uppercase tracking-wide">Party 1</h3>
              <input type="text" className={inputCls} placeholder="Full name" value={data.party1Name} onChange={(e) => set("party1Name", e.target.value)} />
              <input type="text" className={inputCls} placeholder="Title" value={data.party1Title} onChange={(e) => set("party1Title", e.target.value)} />
              <input type="text" className={inputCls} placeholder="Company" value={data.party1Company} onChange={(e) => set("party1Company", e.target.value)} />
              <textarea className={inputCls} rows={2} placeholder="Notice address (email or postal)" value={data.party1NoticeAddress} onChange={(e) => set("party1NoticeAddress", e.target.value)} />
            </div>
            {/* Party 2 */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-600 text-xs uppercase tracking-wide">Party 2</h3>
              <input type="text" className={inputCls} placeholder="Full name" value={data.party2Name} onChange={(e) => set("party2Name", e.target.value)} />
              <input type="text" className={inputCls} placeholder="Title" value={data.party2Title} onChange={(e) => set("party2Title", e.target.value)} />
              <input type="text" className={inputCls} placeholder="Company" value={data.party2Company} onChange={(e) => set("party2Company", e.target.value)} />
              <textarea className={inputCls} rows={2} placeholder="Notice address (email or postal)" value={data.party2NoticeAddress} onChange={(e) => set("party2NoticeAddress", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Modifications */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-1">MNDA Modifications</h2>
          <p className="text-xs text-gray-500 mb-2">Optional: list any modifications to the standard terms</p>
          <textarea
            className={inputCls}
            rows={3}
            value={data.modifications}
            onChange={(e) => set("modifications", e.target.value)}
            placeholder="Leave blank if no modifications..."
          />
        </section>
      </div>
    </div>
  );
}
