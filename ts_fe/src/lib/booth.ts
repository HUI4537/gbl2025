import axios from "axios";

interface makeBoothType {
	bid: string;
	name: string;
	description: string;
	video_url: string;
	thumbnail_url: string;
	poster_url: string;
	part: string;
	boothName: string;
	boothDescription: string;
	boothField: string;
	peopleNumber: string;
	youtubeLink: string;
	time_slot: string;
}

export const makeBooth = (boothInfo: makeBoothType) => {
	const res = axios.post("/api/booth/make", boothInfo);
	return res;
};

export const getBooths = () => {
	const res = axios.get("/api/booth");
	return res;
};

export const getBooth = (bid: string) => {
	const res = axios.get(`/api/booth/${bid}`);
	return res;
};

export const addUser = (uid: string, bid: string) => {
	const res = axios.post(`/api/booth/adduser`, {
		uid: uid,
		bid: bid,
	});
	return res;
};

export const getCheck = (uid: string, bid: string) => {
	const res = axios.post("/api/booth/check", {
		uid: uid,
		bid: bid,
	});
	return res;
};

export const changeComplexity = (bid: string, complexity: number) => {
	const res = axios.patch("/api/booth/complexity", {
		bid: bid,
		complexity: complexity,
	});
	return res;
};

export const addScore = (uid: string, score: number) => {
	const res = axios.post("/api/user/addscore", {
		uid: uid,
		score: score
	});
	return res;
};
