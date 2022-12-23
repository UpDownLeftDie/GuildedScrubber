import React from 'react';

const styles = {
  marginLeft: 'auto',
  marginRight: 'auto',
  width: 'fit-content',
};

const headerStyles = {
  marginTop: 0,
  textAlign: 'center',
};

const contentStyles = {
  maxWidth: '400px',
  margin: 'auto',
  marginTop: '20px',
};

const ContentContainer = ({ headerText, description, children }) => {
  return (
    <div style={styles}>
      {headerText ? <h2 style={headerStyles}>{headerText}</h2> : null}
      {description}
      <div style={contentStyles}>{children}</div>
    </div>
  );
};

export default ContentContainer;
