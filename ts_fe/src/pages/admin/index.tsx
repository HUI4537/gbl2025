import LoginLayout from "@/layouts/login-layout";
import Background from "@/components/background";
import { Typography, Box, Button, Stack } from "@mui/material";
import LoadingPage from "@/components/loading";
import { boothAdminAuth } from "@/lib/auth";
import { signOut } from "firebase/auth";
import { auth } from "@/utils/firebaseInit";
// 중복 import 제거
import { useEffect, useState } from "react";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useRouter } from "next/router";
import InputBase from "@mui/material/InputBase";
import Slide from "@mui/material/Slide";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { login } from "@/store/adminauth-slice";
import CustomSnackBar from "@/components/snackbar";

const AdminLoaginPage = () => {
	const [animation, setanimation] = useState(false);
	const [Password, SetPassword] = useState("");
	const [loading, Setloading] = useState({
		is_loading: false,
		msg: "",
	});
	const [SnackbarInfo, SetSnackbarInfo] = useState({
		open: false,
		text: "",
		severity: "",
	});
	const AdminAuthState = useSelector((state: RootState) => state.adminauth);
	const dispatch = useDispatch();
	const router = useRouter();

	useEffect(() => {
		localStorage.removeItem("auth");
		signOut(auth);
		setanimation(true);
		if (localStorage.getItem("adminauth")) {
			const password: string = localStorage.getItem("adminauth") ?? "";
			Setloading({
				is_loading: true,
				msg: "자동 로그인중",
			});
			boothAdminAuth(password)
				.then((res) => {
					dispatch(
						login({
							bid: res.data.bid,
							is_created: res.data.is_created,
						})
					);
				})
				.catch((err) => {
					console.log(err);
					localStorage.clear();
				});
		}
	}, []);

  const projectName = useSelector((state: RootState) => state.siteinfo.projectName);
  const year = useSelector((state: RootState) => state.siteinfo.year);
  return (
	<>
	  {loading.is_loading ? (
		<LoadingPage msg={loading.msg}></LoadingPage>
	  ) : null}

	  <Background></Background>
	  <LoginLayout width_pad={60} gap={4}>
		<Box position={"fixed"} top={"100px"}>
		  <Typography fontWeight={800} variant='h2'>
			{projectName}
		  </Typography>
		  <Typography fontWeight={800} variant='h2'>
			{year}
		  </Typography>
					<Typography
						fontWeight={800}
						variant='h4'
						mb={"50px"}
						color={"rgb(255, 170, 86)"}
					>
						관리자 페이지
					</Typography>
					<Typography
						fontWeight={400}
						variant='subtitle2'
						color={"rgb(100, 100, 100)"}
						ml={"10px"}
					>
						관리자가 아니신가요?
					</Typography>

					<Button
						variant='contained'
						disableElevation
						startIcon={<VpnKeyIcon></VpnKeyIcon>}
						sx={{
							bgcolor: "rgb(208, 227, 255)",
							color: "rgb(0, 100, 255)",
							transition: "0.3s",
							borderRadius: "100px",
							fontSize: "13px",
							"&:hover": {
								backgroundColor: "rgb(0, 100, 255)",
								color: "white",
							},
						}}
						disableRipple
						disableTouchRipple
						disableFocusRipple
						onClick={() => {
							router.push("/");
						}}
					>
						일반 로그인 페이지 바로가기
					</Button>

					{/* 마스터 페이지 안내 및 이동 버튼 */}
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mt: 10, mb: 2 }}>
						<Typography fontSize={"14px"} color={"#888"} mb={1}>
							사이트 설정 변경은 마스터 페이지에서 가능합니다.
						</Typography>
						<Button
							variant='contained'
							disableElevation
							startIcon={<VpnKeyIcon />}
							sx={{
								bgcolor: '#ffe0b2',
								color: 'rgb(255, 140, 0)',
								borderRadius: '100px',
								fontSize: '13px',
								fontWeight: 700,
								px: 3,
								boxShadow: 'none',
								'&:hover': {
									backgroundColor: '#ffa600',
									color: 'white',
								},
							}}
							onClick={() => {
								router.push('/admin/master');
							}}
						>
							마스터 페이지로 이동
						</Button>
					</Box>
				</Box>

				<Slide in={animation} timeout={600} direction='up'>
					<Stack>
						<Typography
							color={"rgb(150, 150, 150)"}
							fontWeight={400}
							variant='subtitle1'
						>
							사전에 부여받은
							<br />
							비밀번호로만 로그인이 가능합니다.
						</Typography>
						<Box height={20}></Box>

						<InputBase
							sx={{
								bgcolor: "rgb(240, 240, 240)",
								height: "50px",
								textAlign: "center",
								borderRadius: "10px",
								mb: "10px",
							}}
							value={Password}
							type='password'
							inputProps={{ style: { textAlign: "center" } }}
							placeholder='비밀번호를 입력하세요.'
							onChange={(e) => {
								SetPassword(e.target.value);
							}}
						></InputBase>

						<Button
							variant='contained'
							disableRipple
							disableTouchRipple
							disableFocusRipple
							disableElevation
							sx={{
								height: "50px",
								backgroundColor: "rgb(255, 170, 86)",
								borderRadius: "10px",
								"&:hover": {
									backgroundColor: "rgb(255, 170, 86)",
								},
								fontWeight: 800,
								fontSize: "16px",
								color: "white",
							}}
							onClick={() => {
								Setloading({
									...loading,
									msg: "어드민 페이지 로딩중",
									is_loading: true,
								});
								if (Password === "") {
									Setloading({
										...loading,
										is_loading: false,
									});
									SetSnackbarInfo({
										...SnackbarInfo,
										open: true,
										text: "비밀번호를 입력해주세요.",
										severity: "warning",
									});
									return;
								}
								boothAdminAuth(Password)
									.then((res) => {
										localStorage.setItem("adminauth", Password);
										dispatch(
											login({
												bid: res.data.bid,
												is_created: res.data.is_created,
											})
										);
									})
									.catch((err) => {
										console.log(err);
										if (err.response.data.message === "Booth not found") {
											SetSnackbarInfo({
												...SnackbarInfo,
												open: true,
												text: "부스를 찾을 수 없습니다.",
											});
											Setloading({
												...loading,
												is_loading: false,
											});
										}
									});
							}}
						>
							로그인
						</Button>
					</Stack>
				</Slide>
			</LoginLayout>
			<CustomSnackBar
				{...SnackbarInfo}
				closefn={() => {
					SetSnackbarInfo({
						...SnackbarInfo,
						open: false,
					});
				}}
			></CustomSnackBar>
		</>
	);
};

export default AdminLoaginPage;
