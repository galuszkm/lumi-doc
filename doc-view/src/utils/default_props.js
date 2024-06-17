export const getDefaultProps = (type) => {
  const defaultPropsMap = {
    SectionObject: {
      type: "SectionObject",
      title: "Section title ...",
      index: "",
      underline: false,
      items: [],
    },
    TextObject: {
      type: "TextObject",
      text: "...",
      html: false,
      useQuill: true,
    },
    ListObject: { 
      type: "ListObject",
      title: "",
      listStyle: "number", 
      items: [] 
    },
    TableObject: {
      type: "TableObject",
      width: 100,
      title: "Table title ...",
      data: [
        ["Head1", "Head2"],
        ["Cell1", "Cell2"],
      ],
      cellProps: [],
      size: null,
      showTitle: true,
    },
    ContainerObject: { 
      type: "ContainerObject",
      title: "",
      items: [] 
    },
    GridObject: { 
      type: "GridObject",
      title: "", 
      items: [] 
    },
    GridColumnObject: {
      type: "GridColumnObject",
      title: "",
      width: 50,
      marginLeft: 0,
      marginRight: 0,
      items: [],
    },
    ImageObject: {
      type: "ImageObject",
      url: "",
      width: 50,
      title: "Image title ...",
      showTitle: true,
      maxHeight: undefined,
    },
    ChartObject: {
      type: "ChartObject",
      height: "400px",
      title: "Chart title ...",
      showTitle: true,
      layout: {},
      config: {},
      data: [],
    },
    ModelObject: {
      type: "ModelObject",
      title: "Model title ...",
    },
  };
  return defaultPropsMap[type] || {};
};
