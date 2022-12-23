import React from 'react';

const ErrorList = ({ errors }) => {
  const errorsList = Object.entries(errors).map(([errorType, error]) => {
    return <li key={errorType}>{error}</li>;
  });

  if (!errorsList?.length) return null;

  return (
    <div>
      Errors:
      <ul>{errorsList}</ul>
    </div>
  );
};

export default ErrorList;
