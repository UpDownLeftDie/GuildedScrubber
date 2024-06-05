import React, { ReactElement } from 'react';

const styles = {
  marginLeft: 'auto',
  marginRight: 'auto',
  width: 'fit-content',
};

const headerStyles = {
  marginTop: 0,
  textAlign: 'center' as const
};

const contentStyles = {
  maxWidth: '400px',
  margin: 'auto',
  marginTop: '20px',
};

interface props {
  headerText: string;
  children: any;
  description: string | (string | ReactElement)[];
}
const ContentContainer = ({ headerText, children, description }: props) => {
  if (typeof description !== 'string') {
  description =
    description?.map?.((item, key) => {
      if (typeof item === 'string') return item;
      return React.cloneElement(item, { key });
    }) || description;
  }

  return (
    <div style={styles}>
      {headerText ? <h2 style={headerStyles}>{headerText}</h2> : null}
      {description}
      <div style={contentStyles}>{children}</div>
    </div>
  );
};

export default ContentContainer;
