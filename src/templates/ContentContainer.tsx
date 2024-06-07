import type * as CSS from "csstype";
import React, { ReactElement } from "react";

const styles: CSS.Properties = {
  marginLeft: "auto",
  marginRight: "auto",
  width: "fit-content",
};

const headerStyles: CSS.Properties = {
  marginTop: 0,
  marginBottom: "5px",
  textAlign: "center" as const,
  textTransform: "capitalize" as const,
};

const descriptionStyle: CSS.Properties = { marginBottom: "20px" };

const contentStyles = {
  maxWidth: "400px",
  margin: "auto",
  marginBottom: "20px",
};

interface props {
  headerText: string;
  children?: any;
  description?: string | (string | ReactElement)[];
}
const ContentContainer = ({ headerText, children, description }: props) => {
  if (typeof description !== "string") {
    description = description?.map?.((item, key) => {
      if (typeof item === "string") return item;
      return React.cloneElement(item, { key });
    });
  }

  return (
    <div style={styles}>
      {headerText ? <h2 style={headerStyles}>{headerText}</h2> : null}
      <div style={descriptionStyle}>{description}</div>
      <div style={contentStyles}>{children}</div>
    </div>
  );
};

export default ContentContainer;
