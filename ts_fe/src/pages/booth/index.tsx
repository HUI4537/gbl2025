import AppLayout from "@/layouts/app-layout";
import { Typography, InputBase, Box, Slide, ButtonGroup, Button } from "@mui/material";
import Header from "@/components/header";
import Background from "@/components/background";
import useScroll from "@/hooks/useScroll";
import { useEffect, useState, useCallback } from "react";
import BoothItem from "@/components/boothitem";
import QRCodePage from "@/components/qrcode";
import ProgressBar from "@/components/progressbar";
import withAuth from "@/utils/withAuth";
import { getBooths } from "@/lib/booth";

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
	const [uiState, setUiState] = useState({
		scrolled: false,
		progress: 0,
		loading: true,
		openModal: false
	});
	const [boothState, setBoothState] = useState({
		boothList: [] as Booth[],
		search: "",
		available: 0,
		timeSlot: "A"
	});

	const handleModal = (isOpen: boolean) => {
		setUiState(prev => ({ ...prev, openModal: isOpen }));
	};

	// 부스 리스트 새로고침 로직을 useCallback으로 최적화
	const refreshBoothList = useCallback(async () => {
		try {
			const res = await getBooths();
			const boothlistData = res.data?.boothlist?.boothlist || [];

			if (!Array.isArray(boothlistData)) {
				console.error("부스 데이터가 배열이 아닙니다:", boothlistData);
				setBoothState(prev => ({ ...prev, boothList: [], available: 0 }));
				return;
			}

			// 타임슬롯 필터링 로직 개선
			const filteredBooths = boothlistData.filter((booth: Booth) => {
				if (!booth?.time_slot) return false;
				return String(booth.time_slot).toUpperCase() === boothState.timeSlot;
			});

			// 가용 부스 계산 로직 개선
			const availableBooths = filteredBooths.filter(booth => booth?.complexity === 0).length;

			setBoothState(prev => ({
				...prev,
				boothList: filteredBooths,
				available: availableBooths
			}));
		} catch (error) {
			console.error("부스 데이터 가져오기 오류:", error);
			setBoothState(prev => ({ ...prev, boothList: [], available: 0 }));
		}
	}, [boothState.timeSlot]);

	useEffect(() => {
		const isScrolled = scrollPosition.scrollTop > 140;
		const progress = (scrollPosition.scrollTop / 
			(scrollPosition.scrollHeight - scrollPosition.clientHeight)) * 100;

		setUiState(prev => ({ ...prev, scrolled: isScrolled, progress }));
	}, [scrollPosition]);

	useEffect(() => {
		setUiState(prev => ({ ...prev, loading: true }));
		
		refreshBoothList().finally(() => {
			setUiState(prev => ({ ...prev, loading: false }));
		});

		const interval = setInterval(refreshBoothList, 5000);
		return () => clearInterval(interval);
	}, [boothState.timeSlot, refreshBoothList]);

	const handleSearch = (value: string) => {
		setBoothState(prev => ({ ...prev, search: value }));
	};

	const handleTimeSlotChange = (slot: string) => {
		setBoothState(prev => ({ ...prev, timeSlot: slot }));
	};

	return (
		<>
			<QRCodePage
				open={uiState.openModal}
				closeQr={() => handleModal(false)}
				openQr={() => handleModal(true)}
			/>
			<ProgressBar value={uiState.progress} />
			<Background />

			<AppLayout scroll_ref={scrollRef}>
				<Typography
					fontSize="20px"
					position="absolute"
					top="25px"
					left="25px"
					fontWeight={900}
					color="rgb(230, 230, 230)"
				>
					GBL2024
				</Typography>
				<Header openModal={() => handleModal(true)} hide={uiState.scrolled} />

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
					placeholder="부스명을 입력해주세요."
					value={boothState.search}
					onChange={(e) => handleSearch(e.target.value)}
				/>

				<Box sx={{ display: "flex", alignItems: "center", gap: "10px", ml: "25px", my: "20px" }}>
					<Box
						sx={{
							padding: "8px 15px",
							bgcolor: "rgb(240, 240, 240)",
							display: "inline-block",
							borderRadius: "20px",
							fontSize: "13px",
							fontWeight: 600,
							color: "rgb(100, 100, 100)"
						}}
					>
						체험가능 부스 : {boothState.available}개
					</Box>
					<ButtonGroup size="small">
						{["A", "B"].map((slot) => (
							<Button
								key={slot}
								variant={boothState.timeSlot === slot ? "contained" : "outlined"}
								onClick={() => handleTimeSlotChange(slot)}
								sx={{ fontSize: "13px" }}
							>
								{slot}타임
							</Button>
						))}
					</ButtonGroup>
				</Box>

				<Slide in={!uiState.loading} direction="up" timeout={400}>
					<Box>
						{boothState.boothList.length > 0 ? (
							boothState.boothList
								.filter(item => 
									item.name.toLowerCase().includes(boothState.search.toLowerCase())
								)
								.map(item => (
									<BoothItem 
										key={item.bid} 
										item={item} 
									/>
								))
						) : (
							<Typography 
								textAlign="center" 
								mt={3} 
								color="gray"
							>
								현재 타임슬롯에 등록된 부스가 없습니다.
							</Typography>
						)}
					</Box>
				</Slide>
			</AppLayout>
		</>
	);
};

export default withAuth(BoothListPage);
