import React from 'react';
import './App.css';

import LoginPage from './components/LoginPage';
import AudioManager from './components/AudioManager';
import ManageAccountPage from "./components/ManageAccountPage";
import { BrowserRouter,Routes, Route} from "react-router-dom";
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(250,250,250)',
      bg:'#eee',
      lightbg:'rgb(250,250,250)',
      contrastText:'rgb(50,50,50)'
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path='/manageaccount' element={<ManageAccountPage />} />
            <Route path="/audiohub" element={<AudioManager />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
