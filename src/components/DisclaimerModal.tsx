"use client";

import { useState } from "react";

const DisclaimerModal = ({ onAccept }: { onAccept: () => void }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="modal-box max-w-2xl p-6 bg-base-200 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-primary">
          🚨 Important Notice for Riskophobes
        </h2>

        <p className="mt-3 text-gray-300">
          Welcome to <strong>Riskophobe</strong>, a decentralized options
          trading platform. Before proceeding, please read the following
          disclaimer carefully:
        </p>

        <ul className="mt-4 list-inside text-gray-300 space-y-2">
          <li>
            💡 <strong>No Financial Advice:</strong> Riskophobe does not provide
            investment, financial, or legal advice. Your decisions are solely
            your responsibility.
          </li>
          <li>
            📉 <strong>Risk of Loss:</strong> Trading cryptocurrency derivatives
            involves high risk, including the possibility of losing your entire
            investment.
          </li>
          <li>
            🔐 <strong>Smart Contracts:</strong> Transactions are executed by
            smart contracts and are irreversible. Ensure you fully understand
            the risks before proceeding.
          </li>
          <li>
            ⚖️ <strong>Regulatory Compliance:</strong> Cryptocurrency laws vary
            by country. It is your responsibility to comply with the regulations
            in your jurisdiction.
          </li>
          <li>
            🔗 <strong>Non-Custodial:</strong> Riskophobe does not hold or
            manage funds on behalf of users. You maintain full control over your
            assets.
          </li>
          <li>
            🛠 <strong>Check our smart contract:</strong>{" "}
            <a
              href="https://basescan.org/address/0x0bBEeEab55594F1A03A2b34A6e454fb1d85519e4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              View on BaseScan
            </a>
          </li>
        </ul>

        <div className="mt-5 flex items-center gap-2">
          <input
            type="checkbox"
            id="acceptDisclaimer"
            className="checkbox checkbox-primary"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
          <label
            htmlFor="acceptDisclaimer"
            className="text-gray-300 cursor-pointer font-semibold"
          >
            I have read and accept the disclaimer
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className={`btn btn-primary ${!isChecked ? "btn-disabled" : ""}`}
            onClick={onAccept}
            disabled={!isChecked}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
