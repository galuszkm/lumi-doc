import React from "react";
import { Popup } from "semantic-ui-react";
import ContainerObject from "../components/container";
import GridObject from "../components/grid";
import GridColumnObject from "../components/gridColumn";
import ListObject from "../components/list";
import SectionObject from "../components/section";
import TextObject from "../components/text";
import ImageObject from "../components/image";
import TableObject from "../components/table";
import ChartObject from "../components/chart";
import ModelObject from "../components/model"
import { randomID } from "./functions";
import { getDefaultProps } from "./default_props";

export function renderChild(props) {
  const enhancedProps = { ...props };
  return renderWithPopup(enhancedProps, renderComponent(enhancedProps));
}

function renderComponent(props) {
  const componentMap = {
    SectionObject: SectionObject,
    TextObject: TextObject,
    ListObject: ListObject,
    TableObject: TableObject,
    ContainerObject: ContainerObject,
    GridObject: GridObject,
    GridColumnObject: GridColumnObject,
    ImageObject: ImageObject,
    ChartObject: ChartObject,
    ModelObject: ModelObject,
  };
  const Component = componentMap[props.type] || "div";
  const defaultProps = getDefaultProps(props.type);
  const finalProps = { ...defaultProps, ...props, id: props.id || randomID(20) };
  return <Component key={finalProps.id} {...finalProps} />;
}

function renderWithPopup(props, child) {
  if (props?.comment?.critical) {
    return (
      <Popup
        key={props.id}
        content={
          <div className="error-content">
            {props.comment.text || "This object was marked as critical! Please review the comment."}
          </div>
        }
        trigger={<div className="errorItem">{child}</div>}
        hideOnScroll
        position="top center"
        wide="very"
      />
    );
  } else {
    return child;
  }
}