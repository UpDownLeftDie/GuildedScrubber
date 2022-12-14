import React from 'react';

const headerStyles = {
  marginTop: 0,
  textAlign: 'left',
};

const ContentWithHeader = ({ headerText, children }) => {
  return (
    <div>
      <h2 style={headerStyles}>{headerText}</h2>
      {children}
    </div>
  );
};

export default ContentWithHeader;
