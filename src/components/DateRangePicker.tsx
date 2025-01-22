import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateRangePickerProps {
  onChange: (startDate: Date | null, endDate: Date | null) => void;
  defaultStartDate: Date;
  defaultEndDate: Date;
}

const formatDate = (date: Date | null): string => {
  if (!date) return "Not Selected";
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return date.toLocaleDateString("en-GB", options).replace(", ", ", ");
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onChange,
  defaultStartDate,
  defaultEndDate,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    // Only propagate to parent if both dates are selected
    if (start && end) {
      onChange(start, end);
    }
  };

  const CustomInput = React.forwardRef<
    HTMLButtonElement,
    React.HTMLProps<HTMLButtonElement>
  >(({ value, onClick }, ref) => (
    <button
      className="btn btn-primary btn-outline w-full animate-none"
      onClick={onClick}
      ref={ref}
      type="button"
    >
      {value || "Select Date Range"}
    </button>
  ));
  CustomInput.displayName = "CustomInput";

  return (
    <DatePicker
      selected={startDate}
      onChange={handleDateChange}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      shouldCloseOnSelect={false} // Keep picker open until both dates are selected
      customInput={
        <CustomInput
          value={`${formatDate(startDate)} → ${formatDate(endDate)}`}
        />
      }
      minDate={new Date()} // Disable past dates
    />
  );
};

export default DateRangePicker;
