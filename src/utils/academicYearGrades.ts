export interface GradeOption {
  value: string;
  label: string;
}

const toTwoDigitYear = (year: number): string => String(year).slice(-2);

const parseAcademicStartYear = (academicYear: string): number => {
  const match = academicYear.trim().match(/^(\d{4})-\d{4}/);
  if (!match) {
    throw new Error('academicYear must be formatted as yyyy-yyyy');
  }
  return Number(match[1]);
};

export const buildAcademicYearGradeOptions = (
  academicYear: string,
  includeAllOption = true,
): GradeOption[] => {
  const startYear = parseAcademicStartYear(academicYear);
  const options: GradeOption[] = includeAllOption ? [{ value: '', label: '全部年级' }] : [];

  for (let year = startYear - 1; year <= startYear; year += 1) {
    const grade = `${toTwoDigitYear(year)}级硕士`;
    options.push({ value: grade, label: grade });
  }

  for (let year = startYear - 2; year <= startYear; year += 1) {
    const grade = `${toTwoDigitYear(year)}级博士`;
    options.push({ value: grade, label: grade });
  }

  return options;
};
