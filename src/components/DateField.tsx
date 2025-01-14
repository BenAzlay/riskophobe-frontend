import { getCurrentTimestampSeconds } from "@/utils/utilFunc";
import { FC, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateFieldProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  minDate: Date;
}

const DateField: FC<DateFieldProps> = ({ selectedDate, onSelectDate, minDate = new Date() }) => {
  const ExampleCustomInput = forwardRef<HTMLButtonElement, any>(
    ({ value, onClick }, ref) => (
      <button
        className="btn btn-primary btn-outline w-full"
        onClick={(event) => {
          event.preventDefault();
          onClick();
        }}
        ref={ref}
      >
        {value || "Select Date"}
      </button>
    )
  );
  ExampleCustomInput.displayName = "ExampleCustomInput";

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => onSelectDate(date)}
      customInput={<ExampleCustomInput />}
      showTimeSelect
      dateFormat="dd:MM:yyyy, hh:mm aa"
      minDate={minDate}
    />
  );
};

export default DateField;
