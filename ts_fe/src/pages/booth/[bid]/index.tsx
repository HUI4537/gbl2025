import { useRouter } from "next/router";
import { AppBar, Box, Toolbar, Typography, Button } from "@mui/material";
import useElementHeight from "@/hooks/useElementHeight";
import { useEffect, useState } from "react";
import GetMaxLineProperty from "@/utils/linelimit";
import Image from "next/image";
import useScroll from "@/hooks/useScroll";
import Stack from "@mui/material/Stack";
import withAuth from "@/utils/withAuth";

import VerticalBoxLayout, {
	LeftTitle,
	RightTitle,
} from "@/layouts/verticalbox-layout";
import { getBooth, getCheck } from "@/lib/booth";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getUser } from "@/lib/auth";
import CustomSnackBar from '@/components/snackbar';
import { addScore as addBoothScore } from '@/lib/booth';

const YouTubeEmbed = ({ url }: { url: string }) => {
	const getVideoId = (url: string) => {
		if (!url) return null;
		
		// 다양한 YouTube URL 패턴 매칭
		const patterns = [
			/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
			/^.*(youtube\.com\/shorts\/)([^#&?]*).*/
		];
		
		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match && match[2].length === 11) {
				return match[2];
			}
		}
		
		return null;
	};

	const videoId = getVideoId(url);

	if (!videoId) {
		return (
			<Box
				sx={{
					width: "calc(100% - 50px)",
					marginLeft: "25px",
					marginTop: "10px",
					padding: "20px",
					textAlign: "center",
					bgcolor: "rgb(240, 240, 240)",
					borderRadius: "10px",
				}}
			>
				올바른 유튜브 URL이 아닙니다.
			</Box>
		);
	}

	return (
		<iframe
			width="100%"
			height="315"
			src={`https://www.youtube.com/embed/${videoId}`}
			title="YouTube video player"
			frameBorder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
			style={{
				width: "calc(100% - 50px)",
				marginLeft: "25px",
				marginTop: "10px",
				borderRadius: "10px",
			}}
		/>
	);
};

const BoothDetail = () => {
	const router = useRouter();
	const { bid } = router.query;
	const element_height_ref = useElementHeight();
	const [Scrolled, SetScrolled] = useState(false);
	const { scrollRef, scrollPosition } = useScroll(0);
	const [BoothInfo, SetBoothInfo] = useState<any>({});
	const [inParticipate, SetinParticipate] = useState(0);
	const [inAdded, SetinAdded] = useState(0);
	const AuthState = useSelector((state: RootState) => state.auth);

	const [ButtonShown, SetButtonShown] = useState(false);
	const [SnackbarInfo, SetSnackbarInfo] = useState({
		open: false,
		text: '',
		severity: 'info',
	});

	useEffect(() => {
		if (scrollPosition.scrollTop > 3) {
			SetScrolled(true);
		} else {
			SetScrolled(false);
		}
	}, [scrollPosition]);

	useEffect(() => {
		if (!bid) {
			return;
		} else {
			getBooth(bid as string).then((booth_res) => {
				SetBoothInfo(booth_res.data);
				getCheck(AuthState.user.uid, bid as string).then((check_res) => {
					if (check_res.data.participate) {
						SetinAdded(1);
					} else {
						SetinAdded(2);
					}
					var hasValueLessThanTen = false;

					getUser(AuthState.user.uid).then((user_res) => {
						if (user_res.data.history === null) {
							SetinParticipate(1);
						} else {
							user_res.data.history.map((item: any, index: number) => {
								if (!hasValueLessThanTen) {
									console.log("da", item.name, booth_res.data.name);

									if (item.name == booth_res.data.name) {
										SetinParticipate(2);
										hasValueLessThanTen = true;
									}
								}
							});
							if (!hasValueLessThanTen) {
								SetinParticipate(1);
							}
						}
					});
				});
			});
		}
	}, [bid, AuthState]);

	useEffect(() => {
		console.log(inParticipate, inAdded);
	}, [inParticipate, inAdded]);

	useEffect(() => {
		setTimeout(() => {
			SetButtonShown(true);
		}, 500);
	}, []);

	useEffect(() => {
		if (!bid || !AuthState.user?.uid) return;
		let timer = setTimeout(() => {
			addBoothScore(AuthState.user.uid, 10)
				.then(() => {
					SetSnackbarInfo({
						open: true,
						text: '점수가 10점 추가되었습니다.',
						severity: 'success',
					});
				})
				.catch((err) => {
					SetSnackbarInfo({
						open: true,
						text: err?.response?.data?.error || '이미 점수가 추가되었었습니다.',
						severity: 'warning',
					});
				});
		}, 20000);
		return () => clearTimeout(timer);
	}, [bid, AuthState.user?.uid]);

	return (
		<>
			<CustomSnackBar
				{...SnackbarInfo}
				closefn={() => SetSnackbarInfo({ ...SnackbarInfo, open: false })}
			/>
			<Box ref={element_height_ref} overflow={"hidden"}>
				<Box ref={scrollRef} height={"100%"} overflow={"scroll"}>
					<AppBar
						position='absolute'
						elevation={0}
						sx={{
							backgroundColor: Scrolled
								? "rgb(230, 230, 230)"
								: "rgba(255, 255, 255, 0)",
							transition: "0.3s",
							borderBottomRightRadius: "20px",
							borderBottomLeftRadius: "20px",
							height: "300px",
							transform: Scrolled ? "translateY(-230px)" : "translateY(0px)",
						}}
					>
					{/** sitename 동적 출력 */}
					<Typography
						fontSize={"20px"}
						position={"absolute"}
						top={"25px"}
						left={"25px"}
						fontWeight={900}
						color={"rgb(230, 230, 230)"}
						zIndex={100}
					>
						{useSelector((state: RootState) => state.siteinfo.siteTitle)}
					</Typography>
						{BoothInfo.thumbnail_url !== undefined ? (
							<Image
								fill
								style={{
									objectFit: "cover",
									filter: "brightness(70%)",
									transition: "0.3s",
									opacity: Scrolled ? "0" : "1",
								}}
								alt='BoothImage'
								src={`/getfile/${BoothInfo.thumbnail_url}`}
							></Image>
						) : null}
						<Toolbar
							sx={{
								marginBottom: "10px",
								position: "absolute",
								bottom: "0px",
							}}
						>
							<div style={GetMaxLineProperty(2)}>
								<Typography
									fontSize={"40px"}
									fontWeight={800}
									color={Scrolled ? "rgb(100, 100, 100)" : "white"}
									px={"10px"}
									sx={{
										transform: Scrolled ? "scale(0.4)" : "",
										transformOrigin: "left bottom",
										flexGrow: 1,
										alignSelf: "flex-end",
										transition: "0.3s",
									}}
								>
									{BoothInfo.name}
								</Typography>
							</div>
						</Toolbar>
					</AppBar>
					<Box height={"300px"}></Box>

					<Typography variant='h6' fontWeight={800} ml={"20px"} mt={"30px"}>
						부스 설명
					</Typography>
					<Typography
						width={"calc(100% - 80px)"}
						mt={"10px"}
						ml={"20px"}
						py={"20px"}
						px='20px'
						fontWeight={600}
						bgcolor={"rgb(240, 240, 240)"}
						variant='body1'
						color='rgb(100, 100, 100)'
						borderRadius={"10px"}
					>
						{BoothInfo.description}
					</Typography>


					<Typography variant='h6' fontWeight={800} ml={'20px'} mt={'30px'}>
						프로젝트 포스터
					</Typography>

					
					<Box
						sx={{
							width: 'calc(100% - 40px)',
							ml: '20px',
							mt: '10px',
							mb: '10px',
							borderRadius: '10px',
							overflow: 'hidden',
							bgcolor: 'rgb(240,240,240)',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<img
							src={`/getfile/${BoothInfo.poster_url}`}
							alt='프로젝트 포스터'
							style={{
								maxWidth: '100%',
								maxHeight: '400px',
								borderRadius: '10px',
								objectFit: 'contain',
								background: '#f0f0f0',
							}}
						/>
					</Box>


					<Typography variant='h6' fontWeight={800} ml={"20px"} mt={"30px"}>
						프로젝트 소개 영상
					</Typography>

					<YouTubeEmbed url={BoothInfo.video_url} />

					<Typography variant='h6' fontWeight={800} ml={"20px"} mt={"30px"}>
						프로젝트 개요
					</Typography>

					<Box mt={"20px"}>
						<VerticalBoxLayout>
							<LeftTitle>부스 혼잡도</LeftTitle>
							<RightTitle
								color={
									BoothInfo.complexity === 0
										? "rgb(0, 100, 255)"
										: "rgb(255, 68, 0)"
								}
							>
								{BoothInfo.complexity === 0 ? "체험 가능" : "체험 진행중"}
							</RightTitle>
						</VerticalBoxLayout>
					</Box>

					<Box mt={"20px"}>
						<VerticalBoxLayout>
							<LeftTitle>부스 분야</LeftTitle>
							<RightTitle color={"rgb(255, 149, 0)"}>{BoothInfo.part}</RightTitle>
						</VerticalBoxLayout>
					</Box>

					<Box height={"200px"}></Box>
					<Stack
						width={"calc(100% - 40px)"}
						ml={"20px"}
						direction={"row"}
						position={"sticky"}
						bottom={"15px"}
						height={"50px"}
						gap={"15px"}
					>
						<Button
							fullWidth
							sx={{
								bgcolor: "rgb(240, 240, 240)",
								borderRadius: "10px",
								fontSize: "16px",
								"&:hover": {
									bgcolor: "rgb(240, 240, 240)",
								},
								fontWeight: "900",
							}}
							disableRipple
							onClick={() => {
								router.push("/booth");
							}}
						>
							부스목록
						</Button>
						{inAdded !== 2 && inParticipate !== 2 && ButtonShown ? (
							// 문제풀기 버튼 삭제됨
							null
						) : null}
					
					</Stack>
				</Box>
			</Box>
		</>
	);
};

export default withAuth(BoothDetail);
