import AppLayout from "@/layouts/app-layout";
import { Box, Typography } from "@mui/material";
import Background from "@/components/background";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const LayoutPage = () => {
	return (
		<>
			<Background></Background>
			<AppLayout>
				<Typography
					fontSize={"20px"}
					mt={"25px"}
					ml={"25px"}
					fontWeight={900}
					color={"rgb(230, 230, 230)"}
				>
					{useSelector((state: RootState) => state.siteinfo.siteTitle)}
				</Typography>
				<Typography fontSize={"35px"} ml={"25px"} fontWeight={900}>
					부스 배치도
				</Typography>

				<Box 
					width={"calc(100% - 50px)"} 
					ml={"25px"}
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: '20px',
						mt: '20px',
						mb: '50px'
					}}
				>
					<Box>
						<Typography 
							variant="h6" 
							fontWeight={800} 
							mb={2}
							color="rgb(50, 50, 50)"
						>
							A타임 배치도
						</Typography>
						<Box
							component="img"
							src="/images/layout-a.jpg"
							alt="A타임 부스 배치도"
							sx={{
								width: '100%',
								borderRadius: '10px',
								bgcolor: 'rgb(240, 240, 240)'
							}}
						/>
					</Box>
					
					<Box>
						<Typography 
							variant="h6" 
							fontWeight={800} 
							mb={2}
							color="rgb(50, 50, 50)"
						>
							B타임 배치도
						</Typography>
						<Box
							component="img"
							src="/images/layout-b.jpg"
							alt="B타임 부스 배치도"
							sx={{
								width: '100%',
								borderRadius: '10px',
								bgcolor: 'rgb(240, 240, 240)'
							}}
						/>
					</Box>
				</Box>
			</AppLayout>
		</>
	);
};

export default LayoutPage;
