import React from 'react';
import { MenuItem, SubMenu } from 'react-pro-sidebar';
import { scrollToItem } from '../../utils/functions';

const CollapsibleMenuItem = ({ label, icon, items, collapsed }) => (
  <SubMenu label={collapsed ? "" : label} icon={icon}>
    {items.map((item, idx) => (
      <MenuItem key={idx} onClick={() => scrollToItem(item.id)}>
        {item.title}
      </MenuItem>
    ))}
  </SubMenu>
);

export default CollapsibleMenuItem;