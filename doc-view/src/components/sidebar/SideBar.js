import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectItemsByType } from '../../redux/config';
import { Sidebar, Menu, MenuItem, menuClasses } from 'react-pro-sidebar';
import { IconSection, IconTable, IconImage, IconChart, IconModel } from './icons';
import { themes } from './themes';
import { hexToRgba } from './utils';
import CollapsibleMenuItem from './CollapsibleMenuItem';
import './SideBar.css';

const SideBar = React.forwardRef(({ isHidden }, ref) => {
  const [state, setState] = useState({
    collapsed: true,
    theme: 'dark',
    toggled: false,
    broken: false,
  });

  const toggleCollapse = () => setState({ ...state, collapsed: !state.collapsed });
  const setBroken = (broken) => setState({ ...state, broken });

  const sections = useSelector((state) => selectItemsByType(state, 'SectionObject'));
  const tables = useSelector((state) => selectItemsByType(state, 'TableObject'));
  const images = useSelector((state) => selectItemsByType(state, 'ImageObject'));
  const charts = useSelector((state) => selectItemsByType(state, 'ChartObject'));
  const models = useSelector((state) => selectItemsByType(state, 'ModelObject'));

  const menuItemStyles = {
    root: {
      fontSize: '10pt',
      fontWeight: 400,
      fontFamily: 'Poppins',
    },
    icon: {
      color: themes[state.theme].menu.icon,
      [`&.${menuClasses.disabled}`]: {
        color: themes[state.theme].menu.disabled.color,
      },
    },
    SubMenuExpandIcon: {
      color: '#b6b7b9',
    },
    subMenuContent: ({ level }) => ({
      backgroundColor:
        level === 0
          ? hexToRgba(themes[state.theme].menu.menuContent, 1)
          : 'transparent',
    }),
    button: {
      [`&.${menuClasses.disabled}`]: {
        color: themes[state.theme].menu.disabled.color,
      },
      '&:hover': {
        backgroundColor: hexToRgba(themes[state.theme].menu.hover.backgroundColor, 1),
        color: themes[state.theme].menu.hover.color,
      },
    },
    label: ({ open }) => ({
      fontWeight: open ? 600 : undefined,
    }),
  };

  return (
    <Sidebar
      ref={ref}
      className={`sidebar ${isHidden && state.collapsed ? 'hidden' : ''}`}
      collapsed={state.collapsed}
      toggled={state.toggled}
      onBackdropClick={() => setState({ ...state, toggled: false })}
      onBreakPoint={setBroken}
      backgroundColor={hexToRgba(themes[state.theme].sidebar.backgroundColor, 1)}
      rootStyles={{
        color: themes[state.theme].sidebar.color,
        position: 'fixed',
        height: '100vh',
      }}
      transitionDuration={400}
      collapsedWidth='85px'
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Menu menuItemStyles={menuItemStyles} transitionDuration={400} style={{ marginBottom: '15px' }}>
          <MenuItem onClick={toggleCollapse} style={{ display: 'flex', flexDirection: 'row', paddingLeft: '20px' }}>
            <span style={{ fontSize: '20px' }}>
              {state.collapsed ? '▶' : '◀'}
            </span>
            <span style={{ fontSize: '11pt', marginLeft: '15px', fontFamily: 'Poppins' }}>
              {state.collapsed ? '' : 'Hide sidebar'}
            </span>
          </MenuItem>
        </Menu>
        <div style={{ flex: 1, marginBottom: '32px' }}>
          <Menu menuItemStyles={menuItemStyles} transitionDuration={400}>
            <CollapsibleMenuItem label="Sections" icon={<IconSection />} items={sections} collapsed={state.collapsed} />
            <CollapsibleMenuItem label="Tables" icon={<IconTable />} items={tables} collapsed={state.collapsed}  />
            <CollapsibleMenuItem label="Figures" icon={<IconImage />} items={images} collapsed={state.collapsed} />
            <CollapsibleMenuItem label="Charts" icon={<IconChart />} items={charts} collapsed={state.collapsed} />
            <CollapsibleMenuItem label="Models 3D" icon={<IconModel />} items={models} collapsed={state.collapsed} />
          </Menu>
        </div>
      </div>
    </Sidebar>
  );
});

export default SideBar;
