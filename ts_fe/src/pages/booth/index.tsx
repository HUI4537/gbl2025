import AppLayout from "@/layouts/app-layout";
import { FilledInput, Typography } from "@mui/material";
import Header from "@/components/header";
import Background from "@/components/background";
import useScroll from "@/hooks/useScroll";
import { useEffect, useState } from "react";
import BoothItem from "@/components/boothitem";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";
import QRCodePage from "@/components/qrcode";
import InputBase from "@mui/material/InputBase";

import ProgressBar from "@/components/progressbar";

import withAuth from "@/utils/withAuth";
import { getBooths } from "@/lib/booth";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";

interface Booth {
	bid: string;
	name: string;
	description: string;
	part: string;
	complexity: number;
	video_url: string;
	thumbnail_url: string;
	time_slot: string;
}

const BoothListPage = () => {
	const { scrollRef, scrollPosition } = useScroll(0);
	const [scrolled, Setscrolled] = useState(false);
	const [progress, Setprogress] = useState(0);
	const [Loading, SetLoading] = useState(true);
	const [OpenModal, SetOpenModal] = useState(false);
	const [boothList, SetboothList] = useState<Booth[]>([]);
	const [Search, SetSearch] = useState("");
	const [Available, SetAvailable] = useState(0);
	const [TimeSlot, SetTimeSlot] = useState("A");
	const openQr = () => {
		SetOpenModal(true);
	};

	const closeQr = () => {
		SetOpenModal(false);
	};

	const refreshBoothList = async () => {
		try {
			const res = await getBooths();
			console.log("부스 데이터 응답:", res);
			console.log("부스 목록:", res.data.boothlist);
			
			if (res.data && Array.isArray(res.data.boothlist)) {
				const filteredBooths = res.data.boothlist.filter((booth: Booth) => {
					console.log("부스:", booth, "타임슬롯:", booth.time_slot, "현재:", TimeSlot);
					return booth.time_slot === TimeSlot;
				});
				
				console.log("필터링된 부스:", filteredBooths);
				SetboothList(filteredBooths);
				
				const availableBooths = filteredBooths.filter((booth: Booth) => 
					booth.complexity === 0
				).length;
				SetAvailable(availableBooths);
			} else {
				console.error("부스 데이터 형식이 잘못되었습니다:", res.data);
			}
		} catch (error) {
			console.error("부스 데이터 가져오기 오류:", error);
		}
	};

	useEffect(() => {
		if (scrollPosition.scrollTop > 140) {
			Setscrolled(true);
		} else {
			Setscrolled(false);
		}
		Setprogress(
			(scrollPosition.scrollTop /
				(scrollPosition.scrollHeight - scrollPosition.clientHeight)) *
				100
		);
	}, [scrollPosition]);

	useEffect(() => {
		console.log("현재 타임슬롯:", TimeSlot);
		SetLoading(true);
		
		refreshBoothList().finally(() => {
			SetLoading(false);
		});

		const interval = setInterval(refreshBoothList, 5000);
		return () => clearInterval(interval);
	}, [TimeSlot]);

	return (
		<>
			<QRCodePage
				open={OpenModal}
				closeQr={closeQr}
				openQr={openQr}
			></QRCodePage>
			<ProgressBar value={progress}></ProgressBar>
			<Background></Background>

			<AppLayout scroll_ref={scrollRef}>
				<Typography
					fontSize={"20px"}
					position={"absolute"}
					top={"25px"}
					left={"25px"}
					fontWeight={900}
					color={"rgb(230, 230, 230)"}
				>
					GBL2024
				</Typography>
				<Header openModal={openQr} hide={scrolled}></Header>

				<InputBase
					sx={{
						bgcolor: "rgb(240, 240, 240)",
						width: "calc(100% - 50px)",
						ml: "25px",
						p: "10px 20px",
						backdropFilter: "blur(0.1px)",
						height: "45px",
						zIndex: "30",
						borderRadius: "10px",
					}}
					placeholder='부스명을 입력해주세요.'
					value={Search}
					onChange={(e) => {
						SetSearch(e.target.value);
					}}
				></InputBase>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "10px",
						ml: "25px",
						mt: "20px",
						mb: "20px",
					}}
				>
					<Box
						padding={"8px 15px"}
						bgcolor={"rgb(240, 240, 240)"}
						display={"inline-block"}
						borderRadius={"20px"}
						fontSize={"13px"}
						fontWeight={600}
						color={"rgb(100, 100, 100)"}
					>
						체험가능 부스 : {Available}개
					</Box>
					<ButtonGroup size="small">
						<Button
							variant={TimeSlot === "A" ? "contained" : "outlined"}
							onClick={() => SetTimeSlot("A")}
							sx={{ fontSize: "13px" }}
						>
							A타임
						</Button>
						<Button
							variant={TimeSlot === "B" ? "contained" : "outlined"}
							onClick={() => SetTimeSlot("B")}
							sx={{ fontSize: "13px" }}
						>
							B타임
						</Button>
					</ButtonGroup>
				</Box>

				<Slide in={!Loading} direction='up' timeout={400}>
					<Box>
						{boothList && boothList.length > 0 ? (
							boothList
								.filter((item: any) => 
									item.name.toLowerCase().includes(Search.toLowerCase())
								)
								.map((item: any, index) => (
									<BoothItem 
										key={item.bid || index} 
										item={item} 
									/>
								))
						) : (
							<Typography 
								textAlign="center" 
								mt={3} 
								color="gray"
							>
								현재 타임슬롯에 등록된 부스가 없습니다. 이런
							</Typography>
						)}
					</Box>
				</Slide>
			</AppLayout>
		</>
	);
};

export default withAuth(BoothListPage);
