// import React from 'react';
// import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
// import InboxIcon from '@mui/icons-material/MoveToInbox';
// import MailIcon from '@mui/icons-material/Mail';

// const drawerWidth = 240;

// const Sidebar = () => (
//   <Drawer
//     variant="permanent"
//     sx={{
//       width: drawerWidth,
//       flexShrink: 0,
//       [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
//     }}
//   >
//     <Toolbar />
//     <List>
//       {['Strona Główna', 'Raporty', 'Ustawienia'].map((text, index) => (
//         <ListItem button key={text}>
//           <ListItemIcon>
//             {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
//           </ListItemIcon>
//           <ListItemText primary={text} />
//         </ListItem>
//       ))}
//     </List>
//   </Drawer>
// );

// export default Sidebar;

import React from 'react';
import { Drawer, List, ListItem, ListItemText, Toolbar } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { text: 'Strona Główna', path: '/home' },
    { text: 'Twoje sprawy', path: '/reports' },
    { text: 'Kalendarz', path: '/usercalendar' },
    { text: 'Pisma', path: '/userdocs' },
    { text: 'Twoje dane', path: '/userdata' },
    { text: 'Ustawienia', path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box', 
          backgroundColor: '#121212'  // ciemne tło
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map(({ text, path }) => {
          const isActive = location.pathname === path;
          return (
            <ListItem
              button
              key={text}
              component={Link}
              to={path}
              sx={{
                color: '#E0E0E0',               // jasny kolor linków
                textDecoration: 'none',
                fontWeight: isActive ? 'bold' : 'normal',  // pogrubienie dla aktywnego
                borderLeft: isActive ? '4px solid #90caf9' : '4px solid transparent',  // akcent po lewej
                '&:hover': {
                  backgroundColor: 'transparent',           // brak zmiany koloru na hover
                }
              }}
            >
              <ListItemText primary={text} />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;