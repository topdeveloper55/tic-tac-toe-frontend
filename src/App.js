import { CssBaseline, Container, Grid, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import "./App.css";
import { useLogin } from "./useLogin";

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

function App() {
	//useLogin hook
	const { isLogin, account, error, loading, balance, login } = useLogin()

	if (error) return <h3>{error}</h3>

	return (
		<ThemeProvider theme={themeDark}>
      <CssBaseline />
        <Grid container justifyContent="flex-end" >
					<Button
						onClick={login}
						color="secondary"
						variant="contained"
						className="m-2"
					>
						Connect to Wallet
					</Button>
        </Grid>
    </ThemeProvider>
	)
}

export default App
