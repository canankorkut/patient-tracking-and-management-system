import React from 'react'
import { Pagination } from 'react-bootstrap'

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = []
  const pageLimit = 3

  let startPage = Math.max(currentPage - pageLimit, 1);
  let endPage = Math.min(currentPage + pageLimit, totalPages);

  if (startPage > 1) {
    pageNumbers.push(1)
    if (startPage > 2) {
      pageNumbers.push('...')
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pageNumbers.push('...')
    }
    pageNumbers.push(totalPages)
  }

  return (
    <Pagination>
      <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
      <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />

      {pageNumbers.map((number, index) =>
        number === '...' ? (
          <Pagination.Ellipsis key={`ellipsis-${index}`} />
        ) : (
          <Pagination.Item
            key={`page-${number}`}
            active={number === currentPage}
            onClick={() => onPageChange(number)}
          >
            {number}
          </Pagination.Item>
        )
      )}

      <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
      <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
    </Pagination>
  );
};

export default PaginationComponent