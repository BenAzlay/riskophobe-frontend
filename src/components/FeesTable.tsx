import CreatorFee from "@/app/types/CreatorFee";
import React, { useState } from "react";
import TokenSymbolAndLogo from "./TokenSymbolAndLogo";
import { abbreviateAmount, convertQuantityFromWei, numberWithCommas } from "@/utils/utilFunc";
import Tooltip from "./Tooltip";

type Props = {
  creatorFees: CreatorFee[];
};

const FeesTable: React.FC<Props> = ({ creatorFees }) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const sortedFees = [...creatorFees].sort((a, b) => {
    const amountA = BigInt(a.amount);
    const amountB = BigInt(b.amount);

    if (sortOrder === "asc") return amountA > amountB ? 1 : -1;
    return amountA < amountB ? 1 : -1;
  });

  const row = (fee: CreatorFee) => {
    const { id: feeId, amount: amountWei, token } = fee;
    const amount = convertQuantityFromWei(amountWei, token.decimals);
    return (
      <tr key={feeId} className="hover:bg-base-200">
        <td>
          <TokenSymbolAndLogo symbol={token.symbol} logo={token.logo} />
        </td>
        <td>
          <Tooltip message={numberWithCommas(amount)}>{abbreviateAmount(amount, "", 3)}</Tooltip>
        </td>
        <td>
          <button className="btn btn-primary btn-sm">
            CLAIM {token.symbol}
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Token</th>
            <th className="cursor-pointer" onClick={handleSort}>
              Amount
              <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>{sortedFees.map((fee) => row(fee))}</tbody>
      </table>
    </div>
  );
};

export default FeesTable;
