import Head from "next/head";
import { ThemeProvider } from "@mui/material/styles";
import "../styles/global.css";
import useProgress from "@/hooks/useProgress";
import LoadingPage from "@/components/loading";
import "../styles/progress.css";
import { Provider } from "react-redux";
import store from "@/store";
import AuthProvider from "@/utils/auth-provider";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useEffect } from "react";
import { app } from "../utils/firebaseInit";
import theme from "@/theme";
import { useSelector } from "react-redux";

interface MyAppProps {
	Component: any;
	pageProps: any;
}

const isSupported = () =>
	"Notification" in window &&
	"serviceWorker" in navigator &&
	"PushManager" in window;

const requestPermission = async () => {
	if (isSupported()) {
		console.log("Requesting permission...");
		await Notification.requestPermission().then((permission) => {
			if (permission === "granted") {
				console.log("Notification permission granted.");
				const messaging = getMessaging(app);
				getToken(messaging, {
					vapidKey:
						"BPRao46BmgKMG8_mQdvRszDCg8G4rSkL9JN41Zn_Y1Lop2qMDqagV2Z32a4ZcTN-QeW8AUy-Is3QZuBM4ldLqY0",
				}).then((currentToken) => {
					if (currentToken) {
						console.log("currentToken: ", currentToken);
					} else {
						console.log("Can not get token");
					}
				});

				onMessage(messaging, (payload) => {
					console.log("Message received. ", payload);
					// ...
				});
			} else {
				console.log("Do not have permission!");
			}
		});
	}
};

const MyApp = ({ Component, pageProps }: MyAppProps) => {
	const ProgressState = useProgress();
	useEffect(() => {
		requestPermission();
	}, []);

	return (
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<MyAppWithTitle Component={Component} pageProps={pageProps} ProgressState={ProgressState} />
			</ThemeProvider>
		</Provider>
	);
};

import { useDispatch } from "react-redux";
import { setSiteInfo } from "@/store/siteinfo-slice";
import { getMasterInfo } from "@/lib/master";
function MyAppWithTitle({ Component, pageProps, ProgressState }: any) {
  const siteTitle = useSelector((state: any) => state.siteinfo.siteTitle);
  const dispatch = useDispatch();
  useEffect(() => {
	getMasterInfo().then(data => {
	  dispatch(setSiteInfo({
		siteTitle: data.sitename,
		projectName: data.projectname,
		year: String(data.year),
	  }));
	});
  }, [dispatch]);
  return (
	<>
	  <Head>
		<title>{siteTitle || "GBL2025"}</title>
		<link rel='shortcut icon' href='/favicon.ico' />
		<link rel='manifest' href='/manifest.json' />
	  </Head>
	  {ProgressState ? <LoadingPage /> : null}
	  <AuthProvider>
		<Component {...pageProps} />
	  </AuthProvider>
	</>
  );
}

export default MyApp;