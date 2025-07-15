import useElementHeight from "@/hooks/useElementHeight";
import {
	Box,
	TextField,
	Typography,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	ButtonGroup,
	IconButton,
} from "@mui/material";
import Background from "@/components/background";
import Stack from "@mui/material/Stack";
import { useState, ChangeEvent } from "react";
import LoadingPage from "@/components/loading";
import CustomSnackBar from "@/components/snackbar";
import { fileUpload } from "@/lib/upload";
import { makeBooth } from "@/lib/booth";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { create, logout } from "@/store/adminauth-slice";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const CustomFileInput = ({
	text,
	name,
	onChange,
	filetype,
	...args
}: {
	text: string;
	name: string;
	filetype: string;
	onChange: (file: File) => void;
	InputLabelProps: any;
}) => {
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const maxSize = 500 * 1024 * 1024;

		const file = event.target.files?.[0];
		if (file) {
			if (file.size > maxSize) {
				alert("파일 용량이 500MB를 넘을 수 없습니다.");
				event.target.value = "";
			} else {
				if (file.type.search(filetype) === -1) {
					alert(
						filetype + "에 해당하는 파일이 아닙니다. 파일을 다시 선택해주세요."
					);
					event.target.value = "";
				} else {
					onChange(file);
				}
			}
		}
	};

	return (
		<TextField
			type='file'
			label={text}
			id='margin-none'
			required
			name={name}
			onChange={handleFileChange}
			{...args}
			sx={{
				bgcolor: "rgb(240, 240, 240)",
				borderRadius: "10px",
				border: 0,

				"& .MuiOutlinedInput-notchedOutline": {
					border: 0,
					borderRadius: "10px",
				},
			}}
		/>
	);
};

export const CustomInput = ({
	text,
	multiline = false,
	name,
	type = "text",
	...args
}: {
	text: string;
	multiline?: boolean;
	name: string;
	value: any;
	onChange: any;
	type?: string;
}) => {
	return (
		<TextField
			label={text}
			id='margin-none'
			multiline={multiline}
			maxRows={multiline ? 6 : 1}
			required
			name={name}
			type={type}
			{...args}
			sx={{
				bgcolor: "rgb(240, 240, 240)",
				borderRadius: "10px",
				border: 0,
				"& .MuiOutlinedInput-notchedOutline": {
					border: 0,
					borderRadius: "10px",
				},
			}}
		/>
	);
};

// YouTube URL 검증 함수 수정
const validateYouTubeUrl = (url: string) => {
	// 다양한 유튜브 URL 형식을 허용하는 정규식
	const patterns = [
		/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
		/^(https?:\/\/)?(www\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]{11})/,
		/^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
	];
	
	return patterns.some(pattern => pattern.test(url));
};

export const CustomSelect = ({
	options,
	name,
	label,
	...arg
}: {
	options: Array<string>;
	name: string;
	value: any;
	label: string;
	onChange: any;
}) => {
	return (
		<FormControl fullWidth>
			<InputLabel id='demo-simple-select-label'>{label}</InputLabel>
			<Select
				labelId='demo-simple-select-label'
				id='demo-simple-select'
				label='Age'
				required
				sx={{
					bgcolor: "rgb(240, 240, 240)",
					borderRadius: "10px",
					"& .MuiOutlinedInput-notchedOutline": {
						border: 0,
					},
				}}
				{...arg}
				name={name}
			>
				{options.map((item, index) => {
					return (
						<MenuItem key={index} value={item}>
							{item}
						</MenuItem>
					);
				})}
			</Select>
		</FormControl>
	);
};

const MakeBoothPage = () => {
	const element_height_ref = useElementHeight();
	const router = useRouter();

	const [SnackbarInfo, SetSnackbarInfo] = useState({
		open: false,
		text: "",
		severity: "",
	});

	interface FormData {
		boothName: string;
		boothDescription: string;
		boothField: string;
		peopleNumber: string;
		video_url: string;
		time_slot: string;
	}

	const [formData, setFormData] = useState({
		boothName: "",
		boothDescription: "",
		boothField: "",
		peopleNumber: "",
		video_url: "",
		time_slot: "A"
	});
	const [loading, Setloading] = useState({
		is_loading: false,
		msg: "",
	});
	const AdminAuthState = useSelector((state: RootState) => state.adminauth);
	const dispatch = useDispatch();

	const [fileList, setFileList] = useState<{
		thumbnail: File | null;
	}>({
		thumbnail: null
	});

	const validateData = (): string[] => {
		let emptyFields: string[] = [];

		for (let field in formData) {
			if (!formData[field as keyof FormData]) {
				emptyFields.push(field);
			}
		}

		return emptyFields;
	};

	const handleChange = (event: any) => {
		const { name, value } = event.target;
		setFormData((prevFormData) => ({
			...prevFormData,
			[name]: value,
		}));
	};

	const handleThumbnailFileUpload = async (file: File) => {
		setFileList({
			...fileList,
			thumbnail: file
		});
	};

	const ErrHandlering = (err: any) => {
		console.log(err);
		SetSnackbarInfo({
			...SnackbarInfo,
			open: true,
			text: `오류가 발생했습니다. ${err.response.data.error}`,
			severity: "warning",
		});
		Setloading({
			...loading,
			is_loading: false,
		});
	};

	const onSubmit = () => {
		Setloading({
			...loading,
			is_loading: true,
		});
		
		const valid_res = validateData();
		if (valid_res.length !== 0) {
			Setloading({
				...loading,
				is_loading: false,
			});
			SetSnackbarInfo({
				...SnackbarInfo,
				open: true,
				text: "모든 양식을 채워주세요.",
			});
			return;
		}

		// 유튜브 URL 유효성 검사
		if (!validateYouTubeUrl(formData.video_url)) {
			Setloading({
				...loading,
				is_loading: false,
			});
			SetSnackbarInfo({
				...SnackbarInfo,
				open: true,
				text: "올바른 유튜브 URL을 입력해주세요.",
			});
			return;
		}

		// 썸네일 파일 업로
		const ThumbnailformData = new FormData();
		if (fileList.thumbnail) {
			ThumbnailformData.append("file", fileList.thumbnail);
		} else {
			SetSnackbarInfo({
				...SnackbarInfo,
				open: true,
				text: "썸네일 이미지를 선택해주세요.",
				severity: "warning"
			});
			return;
		}

		fileUpload(ThumbnailformData, (percent: number) => {
			Setloading({
				msg: `이미지 업로드중입니다. ${percent}%`,
				is_loading: true,
			});
		})
			.then((res_thumbnail) => {
				Setloading({
					msg: `부스를 만드는중입니다.`,
					is_loading: true,
				});
				
				makeBooth({
					bid: AdminAuthState.bid,
					name: formData.boothName,
					description: formData.boothDescription, 
					video_url: formData.video_url,
					thumbnail_url: res_thumbnail.data.file,
					part: formData.boothField,
					boothName: formData.boothName,
					boothDescription: formData.boothDescription,
					boothField: formData.boothField,
					peopleNumber: formData.peopleNumber,
					youtubeLink: formData.video_url,
					time_slot: formData.time_slot.toUpperCase()
				}).then((res) => {
					dispatch(create());
					SetSnackbarInfo({
						open: true,
						text: "부스가 성공적으로 생성되었습니다.",
						severity: "success"
					});
					Setloading({
						is_loading: false,
						msg: ""
					});
				});
			})
			.catch((err) => {
				ErrHandlering(err);
			});
	};

	const handleGoBack = () => {
		// 세션 클리어
		localStorage.removeItem("adminauth");
		dispatch(logout());
		// 관리자 페이지로 이동
		router.push("/admin");
	};

	return (
		<>
			<CustomSnackBar
				{...SnackbarInfo}
				closefn={() => {
					SetSnackbarInfo({
						...SnackbarInfo,
						open: false,
					});
				}}
			></CustomSnackBar>

			{loading.is_loading ? (
				<LoadingPage msg={loading.msg}></LoadingPage>
			) : null}
			<Background></Background>
			<Box ref={element_height_ref} overflow={"scroll"}>
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
				<Typography fontWeight={900} variant='h4' mt={"70px"} ml={"25px"}>
					부스만들기
				</Typography>
				<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "10px", ml: "25px", mr: "25px" }}>
					<Typography
						fontWeight={400}
						variant='subtitle1'
						color={"rgb(100, 100, 100)"}
					>
						아래 양식을 작성한 후<br />
						제출 버튼을 눌러주세요.
					</Typography>
					<Button
						variant="text"
						onClick={handleGoBack}
						startIcon={<ArrowBackIcon />}
						sx={{
							color: "rgb(100, 100, 100)",
							fontSize: "14px",
							fontWeight: 400,
							textTransform: "none",
							"&:hover": {
								backgroundColor: "rgba(100, 100, 100, 0.1)"
							}
						}}
					>
						뒤로가기
					</Button>
				</Box>
				<Stack mt={"40px"} px={"20px"} mb={"100px"} gap={"20px"}>
					<CustomInput
						name='boothName'
						text='부스 이름'
						multiline={false}
						value={formData.boothName}
						onChange={handleChange}
					></CustomInput>
					<CustomInput
						name='boothDescription'
						text='필요역량'
						value={formData.boothDescription}
						multiline
						onChange={handleChange}
					></CustomInput>
					<CustomSelect
						name='boothField'
						label='부스 분야'
						options={["메이커", "환경", "STEAM", "AI", "미디어", "창업"]}
						value={formData.boothField}
						onChange={handleChange}
					></CustomSelect>
					<CustomSelect
						name='peopleNumber'
						label='체험 인원수'
						options={["1명", "2명", "3명", "4명", "5명"]}
						value={formData.peopleNumber}
						onChange={handleChange}
					></CustomSelect>
					<CustomFileInput
						name='thumbnail'
						text='썸네일 업로드'
						filetype='image'
						onChange={handleThumbnailFileUpload}
						InputLabelProps={{
							shrink: true,
						}}
					/>
					<CustomInput
						name='video_url'
						text='유튜브 영상 URL'
						value={formData.video_url}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setFormData({
								...formData,
								video_url: e.target.value
							});
						}}
					/>
					<ButtonGroup 
						sx={{ 
							width: "100%", 
							height: "50px",
							mb: 2 
						}}
					>
						<Button 
							fullWidth
							variant={formData.time_slot === "A" ? "contained" : "outlined"}
							onClick={() => setFormData({...formData, time_slot: "A"})}
						>
							A타임
						</Button>
						<Button
							fullWidth
							variant={formData.time_slot === "B" ? "contained" : "outlined"}
							onClick={() => setFormData({...formData, time_slot: "B"})}
						>
							B타임
						</Button>
					</ButtonGroup>
				</Stack>

				<Button
					variant='contained'
					disableElevation
					color='primary'
					fullWidth
					onClick={onSubmit}
					sx={{
						fontSize: "15px",
						fontWeight: "900",
						height: "50px",
						color: "white",
						width: "calc(100% - 40px)",
						ml: "20px",
						borderRadius: "10px",
						position: "absolute",
						zIndex: 10,
						bottom: "20px",
					}}
				>
					부스만들기
				</Button>
			</Box>
		</>
	);
};

export default MakeBoothPage;
