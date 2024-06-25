// ==========================================
// Document objects

const ALL_OBJECTS = [
  "SectionObject",
  "TextObject",
  "TableObject",
  "ImageObject",
  "ListObject",
  "ChartObject",
  "GridObject",
  "GridColumnObject",
  "ContainerObject",
  "ModelObject",
];

// Neasting rules - collections of type allowed to be neasted
export const neastingRules = {
  SectionObject:    ALL_OBJECTS.filter(i => !["SectionObject", "GridColumnObject"].includes(i)),
  ListObject:       ALL_OBJECTS.filter(i => !["SectionObject", "GridColumnObject"].includes(i)),
  ContainerObject:  ALL_OBJECTS.filter(i => !["SectionObject", "GridColumnObject"].includes(i)),
  GridColumnObject: ALL_OBJECTS.filter(i => !["SectionObject", "GridColumnObject"].includes(i)),
  GridObject:       ["GridColumnObject"],
}

// List of types where neasting is allowed
export const neastableItemTypes = Object.keys(neastingRules);

// Icon and color class based on type
export const itemIconAndClass = {
  SectionObject: { icon: "pi pi-fw pi-book", className: "node-bg-section" },
  ListObject: { icon: "pi pi-fw pi-list", className: "node-bg-list" },
  TableObject: { icon: "pi pi-fw pi-table", className: "node-bg-table" },
  ImageObject: { icon: "pi pi-fw pi-image", className: "node-bg-image" },
  GridObject: { icon: "pi pi-fw pi-th-large", className: "node-bg-grid" },
  GridColumnObject: { icon: "pi pi-fw pi-building-columns", className: "node-bg-grid-column" },
  TextObject: { icon: "pi pi-fw pi-pen-to-square", className: "node-bg-text" },
  ModelObject: { icon: "pi pi-fw pi-box", className: "node-bg-model" },
  ContainerObject: { icon: "pi pi-fw pi-folder-open", className: "node-bg-container" },
  ChartObject: { icon: "pi pi-fw pi-chart-line", className: "node-bg-chart" }
};
