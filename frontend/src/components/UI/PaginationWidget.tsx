import React from 'react';
import { Pagination } from 'react-bootstrap';
import utils from '../../util/utils';

interface PaginationWidgetProps {
  currentPage: number;
  totalPages: number;
  maxPageDisplay: number;
  redirectUrl: (page: number) => string;
}

function PaginationWidget({
  currentPage,
  totalPages,
  maxPageDisplay,
  redirectUrl,
}: PaginationWidgetProps) {
  const pages = utils.getPageArray(currentPage, totalPages, maxPageDisplay);

  return (
    <Pagination>
      <Pagination.First href={redirectUrl(1)} />
      {currentPage > 1 && (
        <Pagination.Prev href={redirectUrl(currentPage - 1)} />
      )}
      {pages.map((p) => {
        return (
          <Pagination.Item
            key={p}
            active={p === currentPage}
            href={redirectUrl(p)}
          >
            {p}
          </Pagination.Item>
        );
      })}
      {currentPage < totalPages && (
        <Pagination.Next href={redirectUrl(currentPage + 1)} />
      )}
      {totalPages > 1 && <Pagination.Last href={redirectUrl(totalPages)} />}
    </Pagination>
  );
}

export default PaginationWidget;
