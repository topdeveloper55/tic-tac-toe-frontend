import { Web3Provider } from './Web3Context';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';

const themeDark = createTheme({
  palette: {
    background: {
      default: "#05182b",
    },
    text: {
      primary: "#ffffff",
    },
  },
});

function Root() {
  return (
    <Web3Provider> 
      <ThemeProvider theme={themeDark}>
        <CssBaseline />
        <App />
      </ThemeProvider>      
    </Web3Provider>
  );
}

export default Root;
