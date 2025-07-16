import { useState } from "react";
import { Box, Button, InputBase, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setSiteInfo } from "@/store/siteinfo-slice";



const MasterPage = () => {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch("/api/master-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthed(true);
      } else {
        setError(data.message || "비밀번호가 올바르지 않습니다.");
      }
    } catch (e) {
      setError("서버 오류가 발생했습니다.");
    }
  };

  // 인증 성공 시 내부 내용
  const [siteTitle, setSiteTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [year, setYear] = useState("");
  const [applied, setApplied] = useState(false);
  const [formError, setFormError] = useState("");

  const handleApply = () => {
    if (!siteTitle || !projectName || !year) {
      setFormError("모든 항목을 입력해 주세요.");
      setApplied(false);
      return;
    }
    setFormError("");
    dispatch(
      setSiteInfo({
        siteTitle,
        projectName,
        year,
      })
    );
    setApplied(true);
  };

  if (authed) {
    return (
      <Box p={4} maxWidth={400} mx="auto" display="flex" flexDirection="column" gap={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => router.back()}
          sx={{ alignSelf: "flex-start", mb: 2 }}
        >
          뒤로가기
        </Button>
        <Typography variant="h3" fontWeight={800} mb={2}>
          마스터 페이지
        </Typography>
        <Typography fontWeight={700} fontSize={18} mb={1}>사이트 제목</Typography>
        <InputBase
          fullWidth
          placeholder="크롬 탭에 보일 사이트 (GBL2025)"
          value={siteTitle}
          onChange={e => setSiteTitle(e.target.value)}
          sx={{ bgcolor: "rgb(240,240,240)", borderRadius: 2, px: 2, py: 1.5, fontSize: 16, mb: 1 }}
        />
        <Typography fontWeight={700} fontSize={18} mb={1}>프로젝트 이름</Typography>
        <InputBase
          fullWidth
          placeholder="예) GBL"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          sx={{ bgcolor: "rgb(240,240,240)", borderRadius: 2, px: 2, py: 1.5, fontSize: 16, mb: 1 }}
        />
        <Typography fontWeight={700} fontSize={18} mb={1}>연도</Typography>
        <InputBase
          fullWidth
          placeholder="예) 2025"
          value={year}
          onChange={e => setYear(e.target.value)}
          sx={{ bgcolor: "rgb(240,240,240)", borderRadius: 2, px: 2, py: 1.5, fontSize: 16, mb: 1 }}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ bgcolor: "#ffa600", color: "white", fontWeight: 700, borderRadius: 2, fontSize: 16, py: 1.5, '&:hover': { bgcolor: '#ffa600' } }}
          onClick={handleApply}
        >
          적용하기
        </Button>
        {formError && (
          <Typography color="error" mt={2} fontSize={16}>{formError}</Typography>
        )}
        {applied && !formError && (
          <Typography color="success.main" mt={2} fontSize={16}>변경사항이 전역 상태에 적용되었습니다!</Typography>
        )}
      </Box>
    );
  }

  if (!authed) {
    return (
      <Box minHeight="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => router.back()}
          sx={{ alignSelf: "flex-start", position: "absolute", top: 40, left: 40 }}
        >
          뒤로가기
        </Button>
        <Box width={300}>
          <InputBase
            id="master-password"
            name="master-password"
            fullWidth
            type="password"
            placeholder="비밀번호를 입력하세요."
            value={pw}
            onChange={e => setPw(e.target.value)}
            sx={{
              bgcolor: "rgb(240,240,240)",
              borderRadius: 2,
              px: 2,
              py: 1.5,
              mb: 2,
              fontSize: 16,
            }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ bgcolor: "#ffa600", color: "white", fontWeight: 700, borderRadius: 2, fontSize: 16, py: 1.5, '&:hover': { bgcolor: '#ffa600' } }}
            onClick={handleLogin}
          >
            로그인
          </Button>
          {error && (
            <Typography color="error" mt={1} fontSize={14}>{error}</Typography>
          )}
        </Box>
      </Box>
    );
  }

  // 인증 성공 시 내부 내용 (추후 구현)
  return (
    <Box p={4}>
      <Typography variant="h3" fontWeight={800} mb={2}>
        마스터 페이지 (접근 성공)
      </Typography>
      <Typography>여기에 마스터 기능을 추가하세요.</Typography>
    </Box>
  );
};

export default MasterPage;
