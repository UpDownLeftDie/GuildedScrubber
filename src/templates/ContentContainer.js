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

const ContentContainer = ({ headerText, children, description }) => {
  description =
    description?.map?.((item, key) => {
      if (typeof item === 'string') return item;
      return React.cloneElement(item, { key });
    }) || description;

  return (
    <div style={styles}>
      {headerText ? <h2 style={headerStyles}>{headerText}</h2> : null}
      {description}
      <div style={contentStyles}>{children}</div>
    </div>
  );
};

export default ContentContainer;
