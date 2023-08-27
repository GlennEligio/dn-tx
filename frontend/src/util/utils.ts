import * as moment from 'moment-timezone';

const getPageArray = (
  currentPage: number,
  totalPages: number,
  maxPageDisplay: number
) => {
  const trueCurrentPage = () => {
    if (currentPage < 1) return 1;
    if (currentPage > totalPages) return totalPages;
    return currentPage;
  };
  let pageArray = [trueCurrentPage()];
  let tempPageArray = [trueCurrentPage()];
  let currentNum = 1;

  do {
    pageArray = [...tempPageArray];
    tempPageArray.push(trueCurrentPage() + currentNum);
    tempPageArray.unshift(trueCurrentPage() - currentNum);
    tempPageArray = [...tempPageArray].filter((p) => p > 0 && p <= totalPages);

    currentNum += 1;
  } while (
    tempPageArray.length !== pageArray.length &&
    pageArray.length < maxPageDisplay
  );

  return pageArray;
};

export default {
  getPageArray,
};

export const getCharacterValidationError = (str: string) => {
  return `Your password must have at least 1 ${str} character`;
};

export const getZonedDateTimeFromDateString = (date: string) => {
  const dateString = moment(date)
    .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
    .toISOString();
  return dateString || '';
};
