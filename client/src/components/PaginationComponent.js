import React from 'react'
import { Pagination } from 'react-bootstrap'

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <Pagination>
      <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
      <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />

      {[...Array(totalPages).keys()].map(number => (
        <Pagination.Item 
          key={number + 1} 
          active={number + 1 === currentPage} 
          onClick={() => onPageChange(number + 1)}
        >
          {number + 1}
        </Pagination.Item>
      ))}

      <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
      <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
    </Pagination>
  );
};

export default PaginationComponent