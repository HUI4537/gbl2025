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
	   "gbl-api/migrations"

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
	db.AutoMigrate(&user.User{})
	db.AutoMigrate(&problem.Problem{})
	db.AutoMigrate(&notification.Notification{})
	db.AutoMigrate(&score.Participation{}) // 참여 테이블 마이그레이션 추가
	migrations.MigrateMaster(db)

	// BoothScoreHistory 테이블 마이그레이션 추가
	migrations.MigrateBoothScoreHistory()

	// 등록할 비밀번호 목록들
	passwords := []string{
		"A1",
		"A2",
		"A3",
		"A4",
		"A5",
		"A6",
		"A7",
		"A8",
		"M1",
		"M2",
		"M3",
		"M4",
		"M5",
		"M6",
		"M7",
		"M8",
		"M9",
		"M10",
		"M11",
		"M12",
		"ME1",
		"ME2",
		"ME3",
		"ME4",
		"ME5",
		"ME6",
		"S1",
		"S2",
		"S3",
		"S4",
		"S5",
		"S6",
		"S7",
		"S8",
		"S9",
		"S10",
		"S11",
		"S12",
		"S13",
		"S14",
		"Test",
	}
	
	// 기존 어드민 비밀번호 삭제L
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
