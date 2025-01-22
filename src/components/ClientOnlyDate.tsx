import { getFormattedDate } from "@/utils/utilFunc";
import { useEffect, useState } from "react";

const ClientOnlyDate = ({ date }: { date: Date }) => {
  const [formattedDate, setFormattedDate] = useState<string>("..."); // Placeholder

  useEffect(() => {
    setFormattedDate(getFormattedDate(date)); // Update after mount
  }, [date]);

  return <span>{formattedDate}</span>;
};

export default ClientOnlyDate;
