package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"gbl-api/config"
	"gbl-api/controllers/booth"
	"gbl-api/controllers/notification"
	"gbl-api/controllers/problem"
	"gbl-api/controllers/score"
	"gbl-api/controllers/user"
	"gbl-api/data"
	"gbl-api/server"

	"github.com/gin-gonic/gin"
)

func main() {
	if config.DebugMode {
		fmt.Println("DEBUG_MODE is enabled.")
		gin.SetMode(gin.DebugMode)
	} else {
		fmt.Println("DEBUG_MODE is disabled.")
		gin.SetMode(gin.ReleaseMode)
	}

	serverLog, err := os.Create(fmt.Sprintf("server-%s.log", time.Now().Format("2006-01-02-15-04-05")))
	if err != nil {
		panic(err)
	}
	defer serverLog.Close()

	gin.DefaultWriter = serverLog

	errorLog, err := os.Create(fmt.Sprintf("error-%s.log", time.Now().Format("2006-01-02-15-04-05")))
	if err != nil {
		panic(err)
	}
	defer errorLog.Close()

	gin.DefaultErrorWriter = errorLog
	log.SetOutput(errorLog)

	score.UpdateLastScoreChanged()

	db := data.GetDatabase()
	db.AutoMigrate(&booth.Booth{})
	db.AutoMigrate(&booth.BoothPassword{})
	db.AutoMigrate(&score.Participation{})
	db.AutoMigrate(&user.User{})
	db.AutoMigrate(&problem.Problem{})
	db.AutoMigrate(&notification.Notification{})

	// 등록할 비밀번호 목록들
	passwords := []string{
		"GBL2024_아셴테_XYZ",
		"GBL2024_오량탈출_ABC",
		"GBL2024_스타터_DEF",
		"GBL2024_라이프니츠_GHI",
		"GBL2024_이지플레잉_JKL",
		"GBL2024_PlayBoy_MNO",
		"GBL2024_OptimusPrime_PQR",
		"GBL2024_뉴오키_STU",
		"GBL2024_뉴스포츠_VWX",
		"GBL2024_대신고존잘남윤지원_YZA",
		"GBL2024_잡곡밥_BCD",
		"GBL2024_모스테라리움_EFG",
		"GBL2024_concreteerect_HIJ",
		"GBL2024_TheCryoftheBattlefield_KLM",
		"GBL2024_쿠션월드_NOP",
		"GBL2024_SEUM황금세대_QRS",
		"GBL2024_리커버_TUV",
		"GBL2024_Evolutation_WXY",
		"GBL2024_PRIME_ZAB",
		"GBL2024_AMEN_CDE",
		"GBL2024_오클리도클리_FGH",
		"GBL2024_YG_IJK",
		"GBL2024_스태미나스_LMN",
		"GBL2024_HiddenSpeed_OPQ",
		"GBL2024_Nexus_RST",
		"GBL2024_액시드몬스터즈_UVW",
		"GBL2024_MECHitON_XYZ",
		"GBL2024_KSL_ABC",
		"GBL2024_R2D2_DEF",
		"GBL2024_Wattch_GHI",
		"GBL2024_퓨징사이언스_JKL",
		"GBL2024_푸쉬푸쉬_MNO",
		"GBL2024_Titration_PQR",
		"GBL2024_FACTNP_STU",
		"GBL2024_유익한UIX_VWX",
		"GBL2024_백승우외나머지_YZA",
		"GBL2024_ClearSpace_BCD",
		"GBL2024_ONEPress_EFG",
		"GBL2024_크리에이터CREATOR_HIJ",
		"GBL2024_OryangVirtual_KLM",
		"GBL2024_스토리지_NOP",
		"GBL2024_법애정신_QRS",
		"GBL2024_염민우_TUV",
		"GBL2024_꺠비드릴조_WXY",
		"GBL2024_모델로지아_ZAB",
		"GBL2024_내진요리사_CDE",
		"GBL2024_교집합_FGH",
		"GBL2024_유한도전_IJK",
		"GBL2024_선귤라우드_LMN",
		"GBL2024_배추와아이들_OPQ",
		"GBL2024_FPS_RST",
		"GBL2024_팔아다있으_UVW",
		"GBL2024_음라이브_XYZ",
		"Test",
	}
	
	// 기존 어드민 비밀번호 삭제
	err = booth.DeletePasswordByBID("admin")
	if err != nil {
		log.Fatalf("Failed to delete existing admin passwords: %v", err)
	}

	// 여러 개의 비밀번호 등록
	for _, password := range passwords {
		err = booth.AddPassword(password)
		if err != nil {
			log.Printf("Failed to add password %s: %v", password, err)
		} else {
			fmt.Printf("Password %s added successfully\n", password)
		}
	}
	r := server.CreateRouter()
	r.Run(config.Hostname + ":" + config.Port)
}
