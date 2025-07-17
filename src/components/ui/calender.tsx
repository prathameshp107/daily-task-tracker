"use client";

import { useState, useEffect, useRef } from "react";
import { format, isValid, isToday, isSameMonth, isSameDay, addMonths, subMonths, setYear, setMonth, getYear, getMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { enUS, es, fr, de, ja, zhCN } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Locale } from "date-fns";

interface DatePickerProps {
  selectedDate: Date | null;
  onDateChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  allowRange?: boolean;
  rangeEnd?: Date | null;
  onRangeChange?: (start: Date | null, end: Date | null) => void;
  locale?: keyof typeof locales;
  className?: string;
  popoverClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  showClearButton?: boolean;
  showTodayButton?: boolean;
  enableYearNavigation?: boolean;
  mode?: "single" | "range";
}

const locales: Record<string, Locale> = {
  en: enUS,
  es: es,
  fr: fr,
  de: de,
  ja: ja,
  "zh-CN": zhCN,
};

/**
 * DatePicker Component
 * @param {Object} props - Component props
 * @param {Date} props.selectedDate - Currently selected date
 * @param {Function} props.onDateChange - Callback when date changes
 * @param {Date} props.minDate - Minimum selectable date
 * @param {Date} props.maxDate - Maximum selectable date
 * @param {boolean} props.allowRange - Enable date range selection
 * @param {Date} props.rangeEnd - End date for range selection
 * @param {Function} props.onRangeChange - Callback for range selection
 * @param {string} props.locale - Locale for internationalization (en, es, fr, de, ja, zh-CN)
 * @param {string} props.className - Additional classes for the trigger button
 * @param {string} props.popoverClassName - Additional classes for the popover content
 * @param {string} props.placeholder - Placeholder text when no date is selected
 * @param {boolean} props.disabled - Disable the date picker
 * @param {boolean} props.showClearButton - Show button to clear the selected date
 * @param {boolean} props.showTodayButton - Show button to select today's date
 * @param {boolean} props.enableYearNavigation - Enable year dropdown navigation
 * @param {string} props.mode - Display mode: 'single' or 'range'
 */
export function DatePicker({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
  allowRange = false,
  rangeEnd,
  onRangeChange,
  locale = "en",
  className,
  popoverClassName,
  placeholder = "Select date",
  disabled = false,
  showClearButton = true,
  showTodayButton = true,
  enableYearNavigation = true,
  mode = "single",
}: DatePickerProps) {
  const [date, setDate] = useState<Date | null>(selectedDate || null);
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [view, setView] = useState<"days" | "months" | "years">("days"); // "days", "months", "years"
  const calendarRef = useRef<HTMLDivElement | null>(null);
  
  // Update internal state when props change
  useEffect(() => {
    if (selectedDate && isValid(selectedDate)) {
      setDate(selectedDate);
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || !calendarRef.current) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setCurrentMonth(subMonths(currentMonth, 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentMonth(addMonths(currentMonth, 1));
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "Enter":
          if (date) {
            e.preventDefault();
            setIsOpen(false);
          }
          break;
        default:
          break;
      }
    };
    
    calendarRef.current.addEventListener("keydown", handleKeyDown);
    return () => {
      calendarRef.current?.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, currentMonth, date]);

  const handleSelect = (day: Date) => {
    if (allowRange && selectedDate && !rangeEnd) {
      // Handle range selection
      const newRangeEnd = day > selectedDate ? day : selectedDate;
      const newRangeStart = day > selectedDate ? selectedDate : day;
      
      setDate(newRangeStart);
      onDateChange?.(newRangeStart);
      onRangeChange?.(newRangeStart, newRangeEnd);
    } else {
      // Handle single date selection
      setDate(day);
      onDateChange?.(day);
      
      if (allowRange) {
        onRangeChange?.(day, null);
      }
    }
    
    if (!allowRange || (allowRange && rangeEnd)) {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setDate(null);
    onDateChange?.(null);
    if (allowRange) {
      onRangeChange?.(null, null);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setDate(today);
    setCurrentMonth(today);
    onDateChange?.(today);
    if (allowRange) {
      onRangeChange?.(today, null);
    }
  };

  const handleMonthChange = (increment: number) => {
    setCurrentMonth(increment > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1));
  };

  const handleYearChange = (year: string) => {
    setCurrentMonth(setYear(currentMonth, parseInt(year)));
  };

  const handleMonthSelect = (month: string) => {
    setCurrentMonth(setMonth(currentMonth, parseInt(month)));
    setView("days");
  };

  const isDateInRange = (day: Date) => {
    if (!allowRange || !selectedDate || !hoverDate) return false;
    return (
      (day > selectedDate && day < hoverDate) ||
      (day < selectedDate && day > hoverDate)
    );
  };

  const isRangeStart = (day: Date) => {
    return allowRange && selectedDate && isSameDay(day, selectedDate);
  };

  const isRangeEnd = (day: Date) => {
    return allowRange && rangeEnd && isSameDay(day, rangeEnd);
  };

  const isDateDisabled = (day: Date) => {
    if (minDate && day < minDate) return true;
    if (maxDate && day > maxDate) return true;
    return false;
  };

  const getDayClass = (day: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) {
      return "text-muted-foreground/40 hover:text-muted-foreground/60";
    }
    
    if (isDateDisabled(day)) {
      return "text-muted-foreground/50 cursor-not-allowed";
    }
    
    if (isToday(day)) {
      return "bg-accent/80 text-accent-foreground font-medium ring-1 ring-primary/20";
    }
    
    if (selectedDate && isSameDay(day, selectedDate)) {
      return "bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground";
    }
    
    if (rangeEnd && isSameDay(day, rangeEnd)) {
      return "bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground";
    }
    
    if (isDateInRange(day)) {
      return "bg-primary/15 text-foreground hover:bg-primary/20";
    }
    
    return "text-foreground hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground";
  };

  const renderYearSelector = () => {
    const currentYear = getYear(currentMonth);
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
    
    return (
      <div className="flex items-center space-x-2">
        <Select value={currentYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue placeholder={currentYear} />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()} className="text-xs">
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={getMonth(currentMonth).toString()} onValueChange={handleMonthSelect}>
          <SelectTrigger className="h-8 flex-1 text-xs">
            <SelectValue placeholder={format(currentMonth, "MMMM", { locale: locales[locale] || locales.en })} />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const month = new Date(2000, i, 1);
              return (
                <SelectItem key={i} value={i.toString()} className="text-xs">
                  {format(month, "MMMM", { locale: locales[locale] || locales.en })}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderCalendar = () => {
    const currentLocale = locales[locale] || locales.en;
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Create array of weekday names based on locale
    const weekdays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2021, 0, i + 3); // Using a Sunday as reference
      return format(date, "EEEEEE", { locale: currentLocale }).toUpperCase();
    });
    
    // Create array of days to display
    const daysToDisplay: { date: Date; isCurrentMonth: boolean }[] = [];
    
    // Add days from previous month
    const daysFromPrevMonth = firstDayOfWeek;
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -i);
      daysToDisplay.push({ date: day, isCurrentMonth: false });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      daysToDisplay.push({ date: day, isCurrentMonth: true });
    }
    
    // Add days from next month to complete the grid (6 rows of 7 days)
    const totalDaysToShow = 42; // 6 rows of 7 days
    const remainingDays = totalDaysToShow - daysToDisplay.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
      daysToDisplay.push({ date: day, isCurrentMonth: false });
    }
    
    return (
      <div className="space-y-4" ref={calendarRef} tabIndex={0}>
        <div className="flex items-center justify-between px-1 pb-2 pt-1 border-b border-border/40">
          {enableYearNavigation ? (
            renderYearSelector()
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 hover:bg-accent/50 transition-all duration-200"
                onClick={() => handleMonthChange(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <h2 className="text-sm font-medium tracking-wide">
                {format(currentMonth, "MMMM yyyy", { locale: currentLocale })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 hover:bg-accent/50 transition-all duration-200"
                onClick={() => handleMonthChange(1)}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </>
          )}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
          {weekdays.map((day, i) => (
            <div key={i} className="text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {daysToDisplay.map(({ date, isCurrentMonth }, i) => {
            const dayClass = getDayClass(date, isCurrentMonth);
            const isDisabled = isDateDisabled(date);
            
            return (
              <motion.div
                key={i}
                whileHover={{ scale: isDisabled ? 1 : 1.08 }}
                whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all duration-200",
                  dayClass,
                  isRangeStart(date) && "rounded-l-full",
                  isRangeEnd(date) && "rounded-r-full",
                  (isDateInRange(date) || hoverDate) && allowRange && selectedDate && !rangeEnd && "cursor-pointer"
                )}
                onClick={() => !isDisabled && handleSelect(date)}
                onMouseEnter={() => allowRange && selectedDate && !rangeEnd && setHoverDate(date)}
                onMouseLeave={() => allowRange && selectedDate && !rangeEnd && setHoverDate(null)}
                role={!isDisabled ? "button" : undefined}
                tabIndex={!isDisabled ? 0 : undefined}
                aria-disabled={isDisabled}
                aria-label={format(date, "PPP", { locale: currentLocale })}
              >
                {format(date, "d")}
              </motion.div>
            );
          })}
        </div>
        
        {/* Footer with Today/Clear buttons */}
        {(showTodayButton || showClearButton) && (
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            {showTodayButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 px-2 hover:bg-accent/50"
                onClick={handleToday}
              >
                <Check className="mr-1 h-3 w-3" />
                Today
              </Button>
            )}
            {showClearButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 px-2 hover:bg-destructive/10 text-destructive hover:text-destructive"
                onClick={handleClear}
                disabled={!date}
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const formatDisplayDate = () => {
    const currentLocale = locales[locale] || locales.en;
    
    if (!selectedDate) return placeholder;
    
    if (allowRange && rangeEnd) {
      return `${format(selectedDate, "PP", { locale: currentLocale })} - ${format(rangeEnd, "PP", { locale: currentLocale })}`;
    }
    
    return format(selectedDate, "PP", { locale: currentLocale });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-start text-left font-normal px-3 py-2 h-10 transition-all duration-200 hover:border-primary/50 backdrop-blur-sm",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          {formatDisplayDate()}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn("w-auto p-4 shadow-lg border-border/60 rounded-xl backdrop-blur-sm bg-background/90", popoverClassName)} 
        align="start"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {renderCalendar()}
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}